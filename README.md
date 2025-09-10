# Oral Health App - MERN Stack

A comprehensive dental submission system where patients can upload teeth photos and admins can review, annotate, and generate PDF reports.

## Features

### Authentication & Roles
- JWT-based authentication
- Role-based access control (Patient/Admin)
- Secure login/logout functionality

### Patient Features
- Upload teeth photos with patient details
- View submission history
- Download generated PDF reports
- Track submission status

### Admin Features
- View all patient submissions
- Annotate images with drawing tools (Rectangle, Circle, Arrow, Freehand)
- Generate PDF reports with patient details and annotated images
- Manage submission workflow

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React.js, React Router, Bootstrap
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **PDF Generation**: PDFKit
- **Image Annotation**: Konva.js, React-Konva

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
JWT_SECRET=your_jwt_secret_key
MONGO_URI=mongodb://localhost:27017/oral-health-app
PORT=5000
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Submissions
- `GET /api/submissions` - Get submissions (role-based)
- `POST /api/submissions` - Create new submission (Patient)
- `GET /api/submissions/:id` - Get specific submission
- `POST /api/submissions/:id/annotate` - Save annotation (Admin)
- `GET /api/submissions/:id/report` - Generate PDF report (Admin)

## Sample API Requests

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "patient"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Upload Submission
```bash
curl -X POST http://localhost:5000/api/submissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=John Doe" \
  -F "patientId=P001" \
  -F "email=john@example.com" \
  -F "note=Regular checkup" \
  -F "image=@/path/to/teeth-photo.jpg"
```

## Test Credentials

### Admin Account
- Email: admin@example.com
- Password: admin123

### Patient Account
- Email: patient@example.com
- Password: patient123

## Project Structure

```
oral/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Usage Flow

1. **Registration**: Users register as Patient or Admin
2. **Patient Upload**: Patients upload teeth photos with details
3. **Admin Review**: Admins view submissions and add annotations
4. **Report Generation**: Admins generate PDF reports
5. **Patient Access**: Patients can download their reports

## Security Features

- JWT token-based authentication
- Role-based access control
- Password hashing with bcrypt
- Protected API routes
- File upload validation

## AWS S3 Integration (Bonus Feature)

The app supports AWS S3 for cloud storage of images and PDFs.

### Setup S3 Integration

1. Run the setup script:
```bash
./setup-s3.sh
```

2. Create AWS S3 bucket and IAM user with S3 permissions

3. Update `backend/.env`:
```bash
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
USE_S3=true
```

4. Restart backend server:
```bash
cd backend && npm run dev
```

### S3 Features
- Original images stored in `original-images/` folder
- Annotated images stored in `annotated-images/` folder  
- PDF reports stored in `reports/` folder
- S3 URLs included in PDF reports
- S3 links displayed in UI
- Fallback to local storage if S3 fails

## Future Enhancements

- Email notifications
- Advanced annotation tools
- Report templates
- Appointment scheduling

## License

MIT License