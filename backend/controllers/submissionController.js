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

    // Professional PDF Header
    doc.fillColor('#2563eb').fontSize(24).text('DENTAL CARE PRO', { align: 'center' });
    doc.fillColor('#000000').fontSize(14).text('Professional Dental Report', { align: 'center' });
    doc.moveDown(2);
    
    // Patient Information Section
    doc.fontSize(16).text('PATIENT INFORMATION', { underline: true });
    doc.moveDown();
    
    doc.fontSize(12);
    doc.text(`Patient Name: ${submission.name}`);
    doc.text(`Patient ID: ${submission.patientId}`);
    doc.text(`Email: ${submission.email}`);
    doc.text(`Date: ${new Date(submission.createdAt).toLocaleDateString()}`);
    doc.moveDown();
    
    // Patient Notes Section
    if (submission.note) {
      doc.fontSize(14).text('PATIENT NOTES', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).text(submission.note);
      doc.moveDown();
    }
    
    // Doctor's Assessment Section
    if (doctorNotes) {
      doc.fontSize(14).text('DOCTOR\'S ASSESSMENT & RECOMMENDATIONS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).text(doctorNotes);
      doc.moveDown();
    }

    // Digital Links Section (if S3 available)
    if (submission.s3ImageUrl || submission.s3AnnotatedUrl) {
      doc.fontSize(14).text('DIGITAL RESOURCES', { underline: true });
      doc.moveDown(0.5);
      
      if (submission.s3ImageUrl) {
        doc.fontSize(10).text(`Original Image: ${submission.s3ImageUrl}`);
      }
      
      if (submission.s3AnnotatedUrl) {
        doc.fontSize(10).text(`Annotated Image: ${submission.s3AnnotatedUrl}`);
      }
      doc.moveDown();
    }

    // Images Section
    try {
      if (submission.imageUrl) {
        const originalImagePath = path.join(__dirname, '..', submission.imageUrl.replace('/', ''));
        if (fs.existsSync(originalImagePath)) {
          doc.addPage();
          doc.fontSize(18).text('ORIGINAL DENTAL IMAGE', { align: 'center' });
          doc.moveDown();
          doc.image(originalImagePath, { width: 400 });
          doc.moveDown();
        }
      }

      if (submission.annotatedImageUrl) {
        const annotatedImagePath = path.join(__dirname, '..', submission.annotatedImageUrl.replace('/', ''));
        if (fs.existsSync(annotatedImagePath)) {
          doc.addPage();
          doc.fontSize(18).text('ANNOTATED DENTAL IMAGE', { align: 'center' });
          doc.moveDown();
          doc.image(annotatedImagePath, { width: 400 });
          doc.moveDown();
          doc.fontSize(10).text('Note: Annotations indicate areas of clinical interest.', { align: 'center' });
        }
      }
    } catch (imageError) {
      console.error('Image processing error:', imageError);
      doc.fontSize(12).text('Error loading dental images', { align: 'center' });
    }

    // End the document
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