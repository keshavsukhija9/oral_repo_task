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
router.route('/:id/report').get(generateReportWithToken);

const generateReportWithToken = async (req, res) => {
  try {
    const token = req.query.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require('../models/User');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    return generateReport(req, res);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = router;