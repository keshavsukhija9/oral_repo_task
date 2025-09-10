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
  try {
    const subId = req.params.id;
    const { annotatedDataUrl, annotationJSON } = req.body;

    console.log('Saving annotation for submission:', subId);
    console.log('Request body keys:', Object.keys(req.body));

    if (!annotatedDataUrl) {
      return res.status(400).json({ message: 'annotatedDataUrl missing' });
    }

    const submission = await Submission.findById(subId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    // strip prefix if present
    let base64 = annotatedDataUrl;
    const match = annotatedDataUrl.match(/^data:image\/\w+;base64,(.+)$/);
    if (match) base64 = match[1];

    const buffer = Buffer.from(base64, 'base64');
    if (!buffer.length) throw new Error('Empty annotation buffer');

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filename = `${Date.now()}-annotated.png`;
    const filepath = path.join(uploadsDir, filename);

    fs.writeFileSync(filepath, buffer);
    const stats = fs.statSync(filepath);
    if (stats.size === 0) throw new Error('Annotated PNG saved with 0 bytes');

    submission.annotatedImageUrl = `/uploads/${filename}`;
    if (annotationJSON) submission.annotation = annotationJSON;
    submission.status = 'annotated';
    await submission.save();

    console.log('Annotation saved successfully:', filename);
    res.json({
      message: 'Annotation saved successfully',
      annotatedImage: submission.annotatedImageUrl
    });
  } catch (err) {
    console.error('saveAnnotation error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const doctorNotes = (req.body && req.body.doctorNotes) || submission.doctorNotes || '';
    
    if (req.body && req.body.doctorNotes) {
      submission.doctorNotes = req.body.doctorNotes;
      await submission.save();
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const reportName = `report-${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reportName}"`);
    doc.pipe(res);

    // SINGLE PAGE LAYOUT
    doc.fontSize(16).text('DENTAL CARE PRO', { align: 'center' });
    doc.fontSize(10).text(`Patient: ${submission.name} | ID: ${submission.patientId}`, { align: 'center' });
    doc.moveDown(0.5);
    
    if (doctorNotes) {
      doc.fontSize(12).text('Assessment:', { underline: true });
      doc.fontSize(9).text(doctorNotes, { width: 500 });
      doc.moveDown(0.5);
    }

    // ANNOTATED IMAGE ON SAME PAGE
    if (submission.annotatedImageUrl) {
      const imgPath = path.join(__dirname, '..', submission.annotatedImageUrl.replace(/^\//, ''));
      if (fs.existsSync(imgPath)) {
        doc.image(imgPath, 50, doc.y, { width: 500, height: 400 });
      } else {
        doc.text('Please save annotation first');
      }
    } else {
      doc.text('Please create annotation first');
    }

    doc.end();
    
    submission.status = 'reported';
    await submission.save();

  } catch (error) {
    console.error('PDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};