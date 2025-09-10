# API Documentation

## Base URL
```
http://localhost:5001/api
```

## Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123",
  "role": "patient"
}
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient",
  "token": "jwt_token"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Submissions

#### Create Submission (Patient)
```http
POST /submissions
Authorization: Bearer <token>
Content-Type: multipart/form-data

name: John Doe
patientId: P001
email: john@example.com
note: Regular checkup
image: <file>
```

#### Get Submissions
```http
GET /submissions
Authorization: Bearer <token>
```

**Admin Response:** All submissions
**Patient Response:** Own submissions only

#### Get Single Submission
```http
GET /submissions/:id
Authorization: Bearer <token>
```

#### Save Annotation (Admin)
```http
POST /submissions/:id/annotate
Authorization: Bearer <token>
Content-Type: application/json

{
  "annotation": "[{\"tool\":\"rect\",\"x\":100,\"y\":100}]",
  "annotatedImage": "data:image/png;base64,..."
}
```

#### Generate PDF Report (Admin)
```http
GET /submissions/:id/report
Authorization: Bearer <token>
```

Returns PDF file for download.

## Sample cURL Commands

### Register
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "test@example.com",
    "password": "test123",
    "role": "patient"
  }'
```

### Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "patient123"
  }'
```

### Upload Submission
```bash
curl -X POST http://localhost:5001/api/submissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=John Doe" \
  -F "patientId=P001" \
  -F "email=john@example.com" \
  -F "note=Routine checkup" \
  -F "image=@/path/to/image.jpg"
```

### Get Submissions
```bash
curl -X GET http://localhost:5001/api/submissions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, token failed"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "message": "Internal server error"
}
```