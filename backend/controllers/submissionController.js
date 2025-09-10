const Submission = require('../models/Submission');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { uploadToS3, uploadPDFToS3 } = require('../config/s3');
const path = require('path');

exports.createSubmission = async (req, res) => {
  const { name, patientId, email, note } = req.body;
  let imageUrl = '';
  let s3ImageUrl = '';

  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
    
    // Upload to S3 if configured
    if (process.env.USE_S3 === 'true' && process.env.AWS_S3_BUCKET) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const s3Key = `original-images/${Date.now()}-${req.file.originalname}`;
        s3ImageUrl = await uploadToS3(fileBuffer, s3Key);
      } catch (s3Error) {
        console.log('S3 upload failed, using local storage:', s3Error.message);
      }
    }
  }

  try {
    const submission = await Submission.create({
      patient: req.user._id,
      name,
      patientId,
      email,
      note,
      imageUrl,
      s3ImageUrl,
    });
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    let submissions;
    if (req.user.role === 'admin') {
      submissions = await Submission.find({}).populate('patient', 'name email');
    } else {
      submissions = await Submission.find({ patient: req.user._id }).populate('patient', 'name email');
    }
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('patient', 'name email');
    if (submission) {
      res.json(submission);
    } else {
      res.status(404).json({ message: 'Submission not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.saveAnnotation = async (req, res) => {
  const { annotation, annotatedImage } = req.body;
  const submissionId = req.params.id;

  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const base64Data = annotatedImage.replace(/^data:image\/png;base64,/, '');
    const annotatedImageName = `${Date.now()}-annotated.png`;
    const annotatedImagePath = `uploads/${annotatedImageName}`;
    let s3AnnotatedUrl = '';

    // Save locally
    fs.writeFileSync(annotatedImagePath, base64Data, 'base64');

    // Upload to S3 if configured
    if (process.env.USE_S3 === 'true' && process.env.AWS_S3_BUCKET) {
      try {
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const s3Key = `annotated-images/${annotatedImageName}`;
        s3AnnotatedUrl = await uploadToS3(imageBuffer, s3Key);
      } catch (s3Error) {
        console.log('S3 annotated image upload failed:', s3Error.message);
      }
    }

    submission.annotation = annotation;
    submission.annotatedImageUrl = `/${annotatedImagePath}`;
    submission.s3AnnotatedUrl = s3AnnotatedUrl;
    submission.status = 'annotated';

    const updatedSubmission = await submission.save();
    res.json(updatedSubmission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const doc = new PDFDocument();
    const reportName = `${Date.now()}-report.pdf`;
    const reportPath = `uploads/${reportName}`;
    let s3ReportUrl = '';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${reportName}`);

    const writeStream = fs.createWriteStream(reportPath);
    doc.pipe(writeStream);
    doc.pipe(res);

    // PDF Content
    doc.fontSize(25).text('Dental Care Pro - Patient Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Name: ${submission.name}`);
    doc.text(`Patient ID: ${submission.patientId}`);
    doc.text(`Email: ${submission.email}`);
    doc.text(`Date: ${submission.createdAt.toDateString()}`);
    doc.moveDown();
    doc.text(`Note: ${submission.note || 'No additional notes'}`);
    doc.moveDown();

    // Add S3 links if available
    if (submission.s3ImageUrl) {
      doc.fontSize(14).text('Original Image URL:', { continued: false });
      doc.fontSize(10).fillColor('blue').text(submission.s3ImageUrl, { link: submission.s3ImageUrl });
      doc.fillColor('black').moveDown();
    }

    if (submission.s3AnnotatedUrl) {
      doc.fontSize(14).text('Annotated Image URL:', { continued: false });
      doc.fontSize(10).fillColor('blue').text(submission.s3AnnotatedUrl, { link: submission.s3AnnotatedUrl });
      doc.fillColor('black').moveDown();
    }

    // Add images
    if (submission.imageUrl && fs.existsSync(`.${submission.imageUrl}`)) {
      doc.addPage();
      doc.fontSize(20).text('Original Image');
      doc.image(`.${submission.imageUrl}`, { width: 400 });
      doc.moveDown();
    }

    if (submission.annotatedImageUrl && fs.existsSync(`.${submission.annotatedImageUrl}`)) {
      doc.addPage();
      doc.fontSize(20).text('Annotated Image');
      doc.image(`.${submission.annotatedImageUrl}`, { width: 400 });
    }

    doc.end();

    // Wait for PDF to be written, then upload to S3
    writeStream.on('finish', async () => {
      if (process.env.USE_S3 === 'true' && process.env.AWS_S3_BUCKET) {
        try {
          const pdfBuffer = fs.readFileSync(reportPath);
          const s3Key = `reports/${reportName}`;
          s3ReportUrl = await uploadPDFToS3(pdfBuffer, s3Key);
          
          submission.s3ReportUrl = s3ReportUrl;
          await submission.save();
        } catch (s3Error) {
          console.log('S3 PDF upload failed:', s3Error.message);
        }
      }
    });

    submission.reportUrl = `/${reportPath}`;
    submission.status = 'reported';
    await submission.save();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};