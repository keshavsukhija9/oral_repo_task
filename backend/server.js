const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/oral-health-app';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});