const express = require('express');
const router = express.Router();
const {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  saveAnnotation,
  generateReport,
} = require('../controllers/submissionController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.route('/').post(protect, upload.single('image'), createSubmission).get(protect, getSubmissions);
router.route('/:id').get(protect, getSubmissionById);
router.route('/:id/annotate').post(protect, admin, saveAnnotation);
router.route('/:id/report').get(protect, admin, generateReport);

module.exports = router;