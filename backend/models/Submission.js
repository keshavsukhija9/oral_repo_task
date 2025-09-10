
const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  patientId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  note: {
    type: String,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  s3ImageUrl: {
    type: String,
  },
  annotatedImageUrl: {
    type: String,
  },
  s3AnnotatedUrl: {
    type: String,
  },
  annotation: {
    type: String, // JSON string of annotations
  },
  reportUrl: {
    type: String,
  },
  s3ReportUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ['uploaded', 'annotated', 'reported'],
    default: 'uploaded',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Submission', SubmissionSchema);
