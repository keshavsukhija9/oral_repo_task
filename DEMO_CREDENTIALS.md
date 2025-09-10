# 🔐 Demo Credentials & Quick Start

## 🚀 Quick Start (2 minutes)

```bash
# 1. Clone & Setup Backend
git clone <your-repo-url>
cd oral-health-app/backend
npm install
npm run setup-test-users
npm run dev

# 2. Setup Frontend (new terminal)
cd ../frontend  
npm install
npm start
```

**App will be running at:** http://localhost:3000

## 👥 Test Credentials

### 👨‍⚕️ Admin Account
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Capabilities:**
  - View all patient submissions
  - Annotate dental images
  - Generate PDF reports
  - Manage workflow status

### 🦷 Patient Account  
- **Email:** `patient@example.com`
- **Password:** `patient123`
- **Capabilities:**
  - Upload dental photos
  - View own submissions
  - Download generated reports
  - Track submission status

## 🎯 Demo Flow

### As Patient:
1. Login with patient credentials
2. Fill upload form (Name: "John Doe", ID: "P001", etc.)
3. Upload a dental photo
4. View submission in dashboard

### As Admin:
1. Login with admin credentials  
2. See patient submission in dashboard
3. Click "Review" to open annotation tool
4. Draw annotations (rectangle, circle, arrow, freehand)
5. Save annotation
6. Generate PDF report
7. Patient can now download the report

## 📱 Features to Test

### ✅ Authentication
- [x] Register new users
- [x] Login/logout functionality
- [x] Role-based redirects

### ✅ Patient Features
- [x] Photo upload with form data
- [x] Submission history
- [x] Report downloads
- [x] Status tracking

### ✅ Admin Features
- [x] View all submissions
- [x] Image annotation tools
- [x] PDF report generation
- [x] Workflow management

### ✅ Bonus Features
- [x] AWS S3 integration (when configured)
- [x] Professional UI/UX
- [x] Responsive design
- [x] Error handling

## 🌐 Live Demo

**Frontend:** http://localhost:3000
**Backend API:** http://localhost:5001/api

## 📞 Support

If you encounter any issues:
1. Check console for errors
2. Verify MongoDB is running
3. Ensure all dependencies installed
4. Check port availability (3000, 5001)