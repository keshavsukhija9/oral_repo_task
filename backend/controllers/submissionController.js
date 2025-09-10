const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Submission = require('../models/Submission');
const { uploadToS3, uploadPDFToS3 } = require('../config/s3');

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
    const annotatedImagePath = path.join(__dirname, '..', 'uploads', annotatedImageName);
    let s3AnnotatedUrl = '';

    // Save locally with absolute path
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
    submission.annotatedImageUrl = `/uploads/${annotatedImageName}`;
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

    // Check if user has access to this submission
    if (req.user.role !== 'admin' && submission.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Accept doctor's notes from POST body, query params, or existing saved notes
    const doctorNotes = (req.body && req.body.doctorNotes) || req.query.doctorNotes || submission.doctorNotes || '';
    
    // Store doctor notes in submission if provided via POST
    if (req.body && req.body.doctorNotes && req.method === 'POST') {
      submission.doctorNotes = req.body.doctorNotes;
      await submission.save();
    }

    const doc = new PDFDocument();
    const reportName = `${Date.now()}-report.pdf`;
    const reportPath = `uploads/${reportName}`;
    let s3ReportUrl = '';

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${reportName}`);

    // Create write stream for local file
    const writeStream = fs.createWriteStream(reportPath);
    
    // Handle stream errors
    writeStream.on('error', (error) => {
      console.error('Write stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'PDF generation failed' });
      }
    });

    // Pipe to both file and response
    doc.pipe(writeStream);
    doc.pipe(res);

    // PDF Header (compact)
    doc.fontSize(18).text('DENTAL CARE PRO', { align: 'center' });
    doc.fontSize(10).text(`Patient: ${submission.name} | ID: ${submission.patientId} | Date: ${new Date(submission.createdAt).toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();
    
    // Doctor's Assessment (if any)
    if (doctorNotes) {
      doc.fontSize(12).text('ASSESSMENT:', { underline: true });
      doc.fontSize(10).text(doctorNotes);
      doc.moveDown();
    }

    // Only Annotated Image
    if (submission.annotatedImageUrl) {
      const fullPath = path.join(__dirname, '..', submission.annotatedImageUrl.substring(1));
      
      if (fs.existsSync(fullPath)) {
        doc.image(fullPath, 50, doc.y, { width: 500 });
      } else {
        doc.text('Please annotate the image first');
      }
    } else {
      doc.text('Please annotate the image first');
    }

    doc.end();

    // Handle completion and S3 upload
    writeStream.on('finish', async () => {
      try {
        // Update submission with local report path
        submission.reportUrl = `/${reportPath}`;
        submission.status = 'reported';
        
        // Upload to S3 if configured
        if (process.env.USE_S3 === 'true' && process.env.AWS_S3_BUCKET) {
          try {
            const pdfBuffer = fs.readFileSync(reportPath);
            const s3Key = `reports/${reportName}`;
            s3ReportUrl = await uploadPDFToS3(pdfBuffer, s3Key);
            submission.s3ReportUrl = s3ReportUrl;
          } catch (s3Error) {
            console.log('S3 PDF upload failed:', s3Error.message);
          }
        }
        
        await submission.save();
      } catch (saveError) {
        console.error('Error saving submission:', saveError);
      }
    });

  } catch (error) {
    console.error('Generate report error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};