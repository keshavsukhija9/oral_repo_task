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
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    const filename = `${Date.now()}-annotated.png`;
    const filepath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filepath, buffer);
    const stats = await fs.promises.stat(filepath);
    if (stats.size === 0) throw new Error('Annotated PNG saved with 0 bytes');

    submission.annotatedImageUrl = `/uploads/${filename}`;
    if (annotationJSON) submission.annotation = annotationJSON;
    submission.status = 'annotated';
    await submission.save();

    res.json({
      message: 'Annotation saved',
      annotatedImage: submission.annotatedImageUrl
    });
  } catch (err) {
    console.error('saveAnnotation error:', err);
    res.status(500).json({ message: err.message });
  }
};

const { once } = require('events');

exports.generateReport = async (req, res) => {
  try {
    const id = req.params.id;
    const submission = await Submission.findById(id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const doctorNotes = (req.body && req.body.doctorNotes) || submission.doctorNotes || '';
    
    if (req.body && req.body.doctorNotes) {
      submission.doctorNotes = req.body.doctorNotes;
      await submission.save();
    }

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const pdfFilename = `${Date.now()}-report.pdf`;
    const pdfPath = path.join(uploadsDir, pdfFilename);

    const doc = new PDFDocument({ autoFirstPage: true, size: 'A4' });
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // --- Report Content ---
    doc.fontSize(18).text('Dental Report', { align: 'center' }).moveDown();
    doc.fontSize(12).text(`Name: ${submission.name}`);
    doc.text(`Patient ID: ${submission.patientId}`);
    doc.text(`Email: ${submission.email}`);
    doc.text(`Uploaded: ${submission.createdAt?.toLocaleString()}`);
    doc.moveDown().text('Notes:');
    doc.fontSize(10).text(submission.note || 'N/A', { width: 450 });
    doc.moveDown();

    if (doctorNotes) {
      doc.fontSize(12).text('Doctor Assessment:', { underline: true });
      doc.fontSize(10).text(doctorNotes, { width: 450 });
      doc.moveDown();
    }

    // Insert image
    const imgPath = submission.annotatedImageUrl
      ? path.join(__dirname, '..', submission.annotatedImageUrl.replace(/^\//, ''))
      : (submission.imageUrl ? path.join(__dirname, '..', submission.imageUrl.replace(/^\//, '')) : null);

    if (imgPath && fs.existsSync(imgPath) && fs.statSync(imgPath).size > 0) {
      doc.addPage().fontSize(14).text('Image', { align: 'left' });
      doc.image(imgPath, { fit: [500, 500], align: 'center', valign: 'center' });
    } else {
      doc.moveDown().text('No image available');
    }

    doc.addPage().fontSize(12).text('End of Report');
    doc.end();

    await once(writeStream, 'finish');

    // Verify non-empty
    const stats = await fs.promises.stat(pdfPath);
    if (stats.size === 0) throw new Error('Generated PDF is empty');

    submission.reportUrl = `/uploads/${pdfFilename}`;
    submission.status = 'reported';
    await submission.save();

    res.json({
      message: 'Report generated',
      reportUrl: submission.reportUrl
    });
  } catch (err) {
    console.error('generateReport error:', err);
    res.status(500).json({ message: err.message });
  }
};