# 🦷 DentalCare Pro - Oral Health Management System

A comprehensive MERN stack application for dental submission management where patients can upload teeth photos and doctors can review, annotate, and generate professional PDF reports.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with role-based access control
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- CSRF protection via JWT tokens
- Secure password hashing with bcrypt

### 👤 Patient Features
- Upload dental photos with patient details
- View submission history and status
- Download generated PDF reports
- Track submission workflow

### 👨‍⚕️ Doctor/Admin Features
- Review all patient submissions
- Advanced image annotation tools (Rectangle, Circle, Arrow, Freehand)
- Add clinical notes and recommendations
- Generate professional PDF reports
- Manage submission workflow

### 🎨 Image Annotation
- Interactive canvas with Konva.js
- Multiple annotation tools
- Real-time drawing capabilities
- Save and load annotations

### 📄 Professional PDF Reports
- Medical-grade report formatting
- Patient information and clinical notes
- Original and annotated images
- Doctor's assessment and recommendations
- Professional branding and layout

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **PDFKit** - PDF generation
- **bcrypt** - Password hashing

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **Bootstrap** - Styling
- **Axios** - HTTP client
- **Konva.js** - Canvas manipulation
- **React-Konva** - React integration

### Security & Performance
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation
- **CORS** - Cross-origin resource sharing
- **AWS S3** - Optional cloud storage

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/keshavsukhija9/oral_repo_task.git
cd oral_repo_task
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
JWT_SECRET=your_jwt_secret_key
MONGO_URI=mongodb://localhost:27017/oral-health-app
PORT=5001
```

Start backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Create Test Users
```bash
cd backend
npm run setup-test-users
```

## 🔑 Test Credentials

### Admin Account
- **Email**: admin@example.com
- **Password**: admin123

### Patient Account
- **Email**: patient@example.com
- **Password**: patient123

## 📱 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

## 🏗️ Project Structure

```
oral_repo_task/
├── backend/
│   ├── config/          # Database & S3 configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, validation, security
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── scripts/         # Utility scripts
│   ├── uploads/         # File storage
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Route components
│   │   ├── services/    # API services
│   │   └── App.js       # Main component
│   └── package.json
├── docs/                # Documentation
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Submissions
- `GET /api/submissions` - Get submissions (role-based)
- `POST /api/submissions` - Create new submission
- `GET /api/submissions/:id` - Get specific submission
- `POST /api/submissions/:id/annotate` - Save annotation
- `GET /api/submissions/:id/report` - Generate PDF report

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Patient/Admin permissions
- **Rate Limiting** - Prevents brute force attacks
- **Input Validation** - Sanitizes user inputs
- **CSRF Protection** - Via JWT tokens
- **Password Security** - bcrypt hashing with salt
- **File Upload Validation** - Secure file handling

## ☁️ AWS S3 Integration (Optional)

Enable cloud storage for images and PDFs:

```bash
./setup-s3.sh
```

Update `.env`:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
USE_S3=true
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
node test-backend.js
```

### Manual Testing Flow
1. Register/Login as patient
2. Upload dental photos
3. Login as admin/doctor
4. Review and annotate images
5. Add clinical notes
6. Generate PDF reports

## 📋 Usage Workflow

1. **Patient Registration** - Create account with role selection
2. **Photo Upload** - Patients upload dental images with details
3. **Admin Review** - Doctors access admin dashboard
4. **Image Annotation** - Use drawing tools to mark areas of interest
5. **Clinical Assessment** - Add professional notes and recommendations
6. **Report Generation** - Create downloadable PDF reports
7. **Patient Access** - Patients can download their reports

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
JWT_SECRET=strong_production_secret
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/oral-health
PORT=5001
```

### Deployment Checklist
- [ ] Set strong JWT secret
- [ ] Configure production MongoDB
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Update CORS origins

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Keshav Sukhija**
- GitHub: [@keshavsukhija9](https://github.com/keshavsukhija9)

## 🙏 Acknowledgments

- Built with modern MERN stack technologies
- Inspired by real-world dental practice needs
- Security-first approach with industry standards

---

⭐ **Star this repository if you found it helpful!**