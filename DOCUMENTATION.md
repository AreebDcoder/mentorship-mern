# SkillConnect - Mentor-Mentee Platform Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Libraries and Dependencies](#libraries-and-dependencies)
4. [Project Architecture](#project-architecture)
5. [Features](#features)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Installation and Setup](#installation-and-setup)
9. [Project Structure](#project-structure)
10. [User Roles and Permissions](#user-roles-and-permissions)
11. [Theme and UI Design](#theme-and-ui-design)
12. [Development Guide](#development-guide)

---

## Project Overview

**SkillConnect** is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application that connects mentors (alumni) with mentees (students) in an educational or professional development context. The platform facilitates mentorship relationships through session management, real-time messaging, opportunity sharing, and administrative oversight.

### Key Capabilities
- **User Authentication & Authorization**: Secure login/registration with JWT-based authentication
- **Role-Based Access Control**: Three distinct user roles (Admin, Mentor, Mentee) with role-specific features
- **Mentor Approval System**: Admin-controlled approval workflow for mentor applications
- **Session Management**: Request, schedule, and manage mentorship sessions
- **Real-Time Messaging**: Direct messaging between mentors and mentees
- **Opportunities Platform**: Mentors can post job and internship opportunities
- **Profile Management**: User profiles with photo uploads and detailed information
- **Rating System**: Feedback and rating mechanism for completed sessions

---

## Tech Stack

### Backend
- **Node.js**: Runtime environment for server-side JavaScript
- **Express.js**: Web application framework for building REST APIs
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: MongoDB object modeling tool for Node.js
- **JWT (JSON Web Tokens)**: Authentication and authorization mechanism
- **bcryptjs**: Password hashing library

### Frontend
- **React.js**: JavaScript library for building user interfaces
- **React Router DOM**: Client-side routing for React applications
- **Redux Toolkit**: State management library for React applications
- **Ant Design (antd)**: Enterprise-grade UI component library
- **Axios**: HTTP client for making API requests
- **Bootstrap**: CSS framework for responsive design

---

## Libraries and Dependencies

### Backend Dependencies (`package.json`)

| Library | Version | Purpose |
|---------|---------|---------|
| **express** | ^5.1.0 | Web server framework for building RESTful APIs |
| **mongoose** | ^8.19.4 | MongoDB ODM (Object Document Mapper) for schema definition and queries |
| **jsonwebtoken** | ^9.0.2 | Generate and verify JWT tokens for user authentication |
| **bcryptjs** | ^3.0.3 | Hash passwords before storing in database (security) |
| **cors** | ^2.8.5 | Enable Cross-Origin Resource Sharing for frontend-backend communication |
| **dotenv** | ^17.2.3 | Load environment variables from `.env` file |
| **morgan** | ^1.10.1 | HTTP request logger middleware for debugging |
| **colors** | ^1.4.0 | Add colors to console output for better logging |
| **nodemon** | ^3.1.11 | Automatically restart server during development |
| **concurrently** | ^9.2.1 | Run multiple commands simultaneously (frontend + backend) |

### Frontend Dependencies (`client/package.json`)

| Library | Version | Purpose |
|---------|---------|---------|
| **react** | ^18.3.1 | Core React library for building UI components |
| **react-dom** | ^18.3.1 | React renderer for DOM manipulation |
| **react-router-dom** | ^7.9.6 | Client-side routing and navigation |
| **react-redux** | ^9.2.0 | React bindings for Redux state management |
| **@reduxjs/toolkit** | ^2.10.1 | Official Redux toolkit for efficient state management |
| **axios** | ^1.13.2 | HTTP client for API calls from frontend |
| **antd** | ^5.28.1 | Comprehensive UI component library (buttons, forms, tables, etc.) |
| **react-spinners** | ^0.17.0 | Loading spinner components for better UX |
| **react-scripts** | ^5.0.1 | Create React App scripts and configuration |
| **bootstrap** | ^5.3.8 | CSS framework imported in package.json (frontend styling) |

### Development Dependencies

| Library | Purpose |
|---------|---------|
| **@testing-library/react** | Testing utilities for React components |
| **@testing-library/jest-dom** | Custom Jest matchers for DOM testing |
| **web-vitals** | Measure web performance metrics |

---

## Project Architecture

### Architecture Pattern
The application follows a **three-tier architecture**:

1. **Presentation Layer (Frontend)**: React.js components with Redux for state management
2. **Application Layer (Backend)**: Express.js RESTful API with middleware
3. **Data Layer**: MongoDB database with Mongoose ODM

### Request Flow
```
Client (React) 
  → Axios HTTP Request 
  → Express Server 
  → Authentication Middleware (JWT) 
  → Controller (Business Logic) 
  → Model (Database Query) 
  → MongoDB Database
  → Response back to Client
```

### Folder Structure
```
my-mern-app/
├── client/                    # React frontend application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Page components
│   │   ├── redux/            # Redux store and slices
│   │   ├── styles/           # CSS stylesheets
│   │   ├── utils/            # Utility functions
│   │   └── App.js            # Main App component with routes
│   └── package.json
├── config/                    # Configuration files
│   └── db.js                 # MongoDB connection
├── controllers/               # Request handlers (business logic)
│   ├── userCtrl.js          # User/Mentor/Mentee controllers
│   └── adminCtrl.js         # Admin controllers
├── middlewares/              # Custom middleware
│   └── authMiddleware.js    # JWT authentication middleware
├── models/                   # Mongoose database schemas
│   ├── userModels.js        # User schema
│   ├── sessionModel.js      # Session schema
│   ├── messageModel.js      # Message schema
│   ├── opportunityModel.js  # Opportunity schema
│   └── ratingModel.js       # Rating schema
├── routes/                   # API route definitions
│   ├── userRoutes.js        # User routes
│   └── adminRoutes.js       # Admin routes
├── server.js                 # Express server entry point
└── package.json              # Backend dependencies
```

---

## Features

### 1. Authentication & Authorization
- **User Registration**: Register as Mentee or Mentor (Alumni)
- **User Login**: JWT-based authentication with secure password hashing
- **Protected Routes**: Route guards for authenticated users only
- **Public Routes**: Login and Register pages accessible without authentication
- **Role-Based Access**: Different UI and permissions based on user role

### 2. User Roles

#### **Admin**
- View all users (mentors) requiring approval
- Approve/Reject mentor applications
- View dashboard statistics
- Manage mentor list
- Full platform oversight

#### **Mentor (Alumni)**
- Apply to become a mentor (status: pending → approved)
- View and manage session requests from mentees
- Accept/Reject session requests
- Post job and internship opportunities
- Chat with mentees
- Manage profile with photo upload
- View pending approval warning banner (if not approved)
- Rate completed sessions

#### **Mentee (Student)**
- Browse and find approved mentors
- Request mentorship sessions
- Chat with mentors
- View and apply for opportunities
- Manage profile with photo upload
- Rate completed sessions

### 3. Mentor Management
- **Mentor Application**: Users can register as mentors
- **Admin Approval**: Admins approve/reject mentor applications
- **Mentor Listing**: Approved mentors appear in "Find Mentors" page
- **Status Tracking**: Pending, Approved, Rejected statuses
- **Automatic Profile Creation**: Mentor profiles created automatically upon approval

### 4. Session Management
- **Session Request**: Mentees request sessions with mentors
- **Session Scheduling**: Set date, time, duration, and description
- **Session Status**: Pending, Accepted, Rejected, Completed, Cancelled
- **Session Details**: Meeting links, notes, feedback
- **Session History**: View all sessions (past and upcoming)
- **Rating System**: Rate and provide feedback after session completion

### 5. Messaging System
- **Real-Time Chat**: Direct messaging between mentors and mentees
- **Conversation List**: View all active conversations
- **Message History**: View conversation history
- **Unread Messages**: Track unread message counts
- **Profile Pictures**: Display user avatars in conversations
- **New Conversation**: Start conversations from mentor cards

### 6. Opportunities Platform
- **Post Opportunities**: Mentors can post job and internship opportunities
- **Opportunity Details**: Title, description, company, location, requirements, deadline
- **Opportunity Types**: Job or Internship
- **Active Status**: Enable/disable opportunities
- **Public Viewing**: All users can view posted opportunities

### 7. Profile Management
- **User Profiles**: Name, email, phone, address, bio, LinkedIn, GitHub
- **Profile Picture Upload**: Upload and display profile photos
- **Default Avatars**: Auto-generated SVG avatars with user initials
- **Profile Editing**: Edit profile information
- **Role Display**: Display user role and mentor status

### 8. Notifications
- **System Notifications**: Admin-generated notifications
- **Notification Center**: View all notifications
- **Mark as Read**: Track seen notifications
- **Delete Notifications**: Clear notification history

### 9. UI/UX Features
- **Responsive Design**: Mobile-friendly interface
- **Modern Theme**: Red, Yellow, Black color scheme with gradients
- **Interactive Elements**: Hover effects, animations, transitions
- **Loading States**: Spinners and loading indicators
- **Error Handling**: User-friendly error messages
- **Empty States**: Informative messages when no data is available

---

## API Endpoints

### User Routes (`/api/v1/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | User login | No |
| POST | `/register` | User registration | No |
| POST | `/getUserData` | Get authenticated user data | Yes |
| POST | `/apply-mentor` | Apply to become a mentor | Yes |
| GET | `/mentors` | Get all approved mentors | No |
| GET | `/mentor/:id` | Get specific mentor profile | No |
| POST | `/sessions` | Create a session request | Yes |
| PUT | `/sessions` | Update session status | Yes |
| POST | `/get-sessions` | Get user's sessions | Yes |
| POST | `/messages` | Send a message | Yes |
| GET | `/messages/:id` | Get messages with a user | Yes |
| GET | `/conversations` | Get all conversations | Yes |
| POST | `/opportunities` | Create an opportunity | Yes |
| GET | `/opportunities` | Get all opportunities | No |
| POST | `/ratings` | Submit a rating | Yes |
| PUT | `/update-profile` | Update user profile | Yes |
| POST | `/get-all-notification` | Get all notifications | Yes |
| POST | `/delete-all-notification` | Delete all notifications | Yes |

### Admin Routes (`/api/v1/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/getAllUsers` | Get all mentor users for approval | Yes (Admin) |
| GET | `/getAllMentors` | Get all approved mentors | Yes (Admin) |
| PUT | `/approve-mentor` | Approve/reject mentor (by profile ID) | Yes (Admin) |
| PUT | `/approve-mentor-by-user` | Approve/reject mentor (by user ID) | Yes (Admin) |
| GET | `/dashboard-stats` | Get dashboard statistics | Yes (Admin) |

---

## Database Schema

### User Schema (`users` collection)
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ["mentor", "mentee", "admin"], default: "mentee"),
  isAdmin: Boolean (default: false),
  isMentor: Boolean (default: false),
  mentorStatus: String (enum: ["pending", "approved", "rejected"], default: "pending"),
  profile: {
    phone: String,
    address: String,
    bio: String,
    linkedin: String,
    github: String,
    graduationYear: String,
    currentPosition: String,
    company: String,
    profilePicture: String (base64 or URL)
  },
  notification: Array,
  seennotification: Array,
  timestamps: true
}
```

### Session Schema (`sessions` collection)
```javascript
{
  mentorId: ObjectId (ref: "users", required),
  menteeId: ObjectId (ref: "users", required),
  title: String (required),
  description: String,
  scheduledDate: Date (required),
  duration: Number (default: 60 minutes),
  status: String (enum: ["pending", "accepted", "rejected", "completed", "cancelled"], default: "pending"),
  meetingLink: String,
  meetingNotes: String,
  rating: Number (min: 1, max: 5),
  feedback: String,
  timestamps: true
}
```

### Message Schema (`messages` collection)
```javascript
{
  senderId: ObjectId (ref: "users", required),
  receiverId: ObjectId (ref: "users", required),
  message: String (required),
  attachments: [{
    filename: String,
    fileUrl: String,
    fileType: String
  }],
  isRead: Boolean (default: false),
  timestamps: true
}
```

### Opportunity Schema (`opportunities` collection)
```javascript
{
  mentorId: ObjectId (ref: "users", required),
  title: String (required),
  type: String (enum: ["job", "internship"], required),
  description: String (required),
  company: String (required),
  location: String,
  requirements: [String],
  applicationLink: String,
  deadline: Date,
  isActive: Boolean (default: true),
  timestamps: true
}
```

### Rating Schema (`ratings` collection)
```javascript
{
  sessionId: ObjectId (ref: "sessions", required),
  mentorId: ObjectId (ref: "users", required),
  menteeId: ObjectId (ref: "users", required),
  rating: Number (required, min: 1, max: 5),
  feedback: String,
  timestamps: true
}
```

---

## Installation and Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd my-mern-app
```

### Step 2: Install Backend Dependencies
```bash
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### Step 4: Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URL=mongodb://localhost:27017/skillconnect
# OR for MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/skillconnect

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Server Port (default: 8080)
PORT=8080

# Node Environment
NODE_ENV=development
```

### Step 5: Start the Application

#### Development Mode (Runs both frontend and backend)
```bash
npm run dev
```

This command runs:
- Backend server on `http://localhost:8080`
- Frontend development server on `http://localhost:3000`

#### Separate Commands
```bash
# Backend only
npm run server

# Frontend only
npm run client

# Production build
cd client
npm run build
```

### Step 6: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Root**: http://localhost:8080/api/v1

### Step 7: Create Admin User

To create an admin user, you can:
1. Register a user through the frontend
2. Update the user in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { isAdmin: true, role: "admin" } }
   )
   ```

---

## Project Structure

### Backend Structure
```
backend/
├── config/
│   └── db.js                    # MongoDB connection configuration
├── controllers/
│   ├── userCtrl.js              # User, mentor, mentee, session, message controllers
│   └── adminCtrl.js             # Admin-specific controllers
├── middlewares/
│   └── authMiddleware.js        # JWT authentication middleware
├── models/
│   ├── userModels.js            # User schema
│   ├── sessionModel.js          # Session schema
│   ├── messageModel.js          # Message schema
│   ├── opportunityModel.js      # Opportunity schema
│   └── ratingModel.js           # Rating schema
├── routes/
│   ├── userRoutes.js            # User API routes
│   └── adminRoutes.js           # Admin API routes
└── server.js                    # Express server entry point
```

### Frontend Structure
```
client/src/
├── components/
│   ├── Layout.js                # Main layout with sidebar and header
│   ├── Protectedroute.js        # Protected route wrapper
│   ├── PublicRoute.js           # Public route wrapper
│   └── Spinner.js               # Loading spinner component
├── pages/
│   ├── admin/
│   │   ├── Dashboard.js         # Admin dashboard
│   │   ├── Users.js             # Admin user management
│   │   └── Doctors.js           # Admin mentor list
│   ├── HomePage.js              # Role-specific home page
│   ├── Login.js                 # Login page
│   ├── Register.js              # Registration page
│   ├── Profile.js               # User profile page
│   ├── Mentors.js               # Find mentors page (mentees)
│   ├── Sessions.js              # Session management page
│   ├── Messages.js              # Messaging interface
│   ├── Opportunities.js         # Opportunities listing
│   ├── PostOpportunity.js       # Post opportunity (mentors)
│   ├── RequestSession.js        # Request session page
│   ├── ApplyDoctor.js           # Apply as mentor page
│   └── NotificationPage.js      # Notifications page
├── redux/
│   ├── features/
│   │   ├── userSlice.js         # User state management
│   │   └── alertSlice.js        # Alert/loading state management
│   └── store.js                 # Redux store configuration
├── styles/
│   ├── theme.css                # Global theme styles
│   ├── Layout.css               # Layout component styles
│   ├── RegisterForm.css         # Login/Register form styles
│   ├── HomePage.css             # Home page styles
│   ├── Mentors.css              # Mentors page styles
│   ├── Messages.css             # Messages page styles
│   ├── Sessions.css             # Sessions page styles
│   ├── Profile.css              # Profile page styles
│   └── Admin.css                # Admin pages styles
├── utils/
│   └── profilePicture.js        # Profile picture utility functions
├── App.js                       # Main App component with routes
└── index.js                     # React entry point
```

---

## User Roles and Permissions

### Admin
- **Access**: All admin routes and pages
- **Capabilities**:
  - View all mentor applications
  - Approve/Reject mentors
  - View dashboard statistics
  - View all approved mentors
- **UI Features**:
  - Admin Dashboard
  - Users Management (approval)
  - Mentors List
  - Statistics overview

### Mentor (Pending Approval)
- **Access**: Mentor UI (even while pending)
- **Capabilities**:
  - View mentor dashboard
  - Access mentor features (sessions, messages, post opportunities)
  - Update profile
- **Restrictions**:
  - Does not appear in "Find Mentors" list
  - Warning banner shown: "Mentor Application Pending"
- **Status**: `mentorStatus: "pending"`

### Mentor (Approved)
- **Access**: Full mentor features
- **Capabilities**:
  - All pending mentor capabilities
  - Appears in "Find Mentors" list
  - Can receive session requests
  - Can accept/reject sessions
  - Post opportunities
  - Chat with mentees
- **Status**: `mentorStatus: "approved"`

### Mentee
- **Access**: Mentee UI and features
- **Capabilities**:
  - Browse approved mentors
  - Request sessions with mentors
  - Chat with mentors
  - View opportunities
  - Update profile
  - Rate completed sessions
- **Status**: No approval required (immediate access)

---

## Theme and UI Design

### Color Palette
- **Primary Red**: `#DC143C` (Crimson Red)
- **Dark Red**: `#B71C1C`
- **Yellow/Orange**: `#FFB800`, `#FF8C00`
- **Black/Dark**: `#000000`, `#1a1a1a`
- **Background**: Gradients using red and yellow tones

### Design Principles
- **Modern Aesthetic**: Clean, professional interface
- **Interactive Elements**: Hover effects, smooth transitions
- **Animations**: Fade-in, slide-in, pulse animations
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Clear contrast, readable fonts

### Key UI Components
- **Cards**: Gradient backgrounds with shadows
- **Buttons**: Red/yellow gradient themes with hover effects
- **Forms**: Styled inputs with focus states
- **Tables**: Alternating row colors, hover effects
- **Modals**: Dark overlays with centered content
- **Avatars**: Circular profile pictures with borders
- **Tags**: Color-coded status indicators

### CSS Architecture
- **Global Theme** (`theme.css`): CSS variables, global styles, animations
- **Component-Specific Styles**: Separate CSS files for each major page
- **Bootstrap Integration**: Used for grid system and utilities
- **Ant Design Override**: Custom styling for Ant Design components

---

## Development Guide

### Running in Development Mode
```bash
# Install dependencies (first time only)
npm install
cd client && npm install && cd ..

# Start both frontend and backend
npm run dev
```

### Code Style
- **Backend**: CommonJS modules, ES6+ syntax
- **Frontend**: ES6+ JavaScript, JSX for React components
- **Naming**: camelCase for variables/functions, PascalCase for components
- **File Structure**: Feature-based organization

### Adding New Features

1. **Backend Route**: Add route in `routes/userRoutes.js` or `routes/adminRoutes.js`
2. **Controller**: Create handler in `controllers/userCtrl.js` or `controllers/adminCtrl.js`
3. **Model** (if needed): Create schema in `models/` directory
4. **Frontend Page**: Create component in `client/src/pages/`
5. **Route**: Add route in `client/src/App.js`
6. **Styling**: Create CSS file in `client/src/styles/`

### Testing
- Use Postman or similar tools for API testing
- Test authentication flows
- Verify role-based access
- Test all CRUD operations

### Common Issues and Solutions

#### MongoDB Connection Error
- Ensure MongoDB is running locally or Atlas connection string is correct
- Check `.env` file for correct `MONGODB_URL`

#### JWT Token Errors
- Verify `JWT_SECRET` is set in `.env`
- Check token expiration
- Ensure Authorization header format: `Bearer <token>`

#### CORS Errors
- Verify `cors` middleware is enabled in `server.js`
- Check frontend proxy setting in `client/package.json`

#### Port Conflicts
- Change `PORT` in `.env` for backend
- Change port in `client/package.json` scripts for frontend

---

## Security Features

1. **Password Hashing**: bcryptjs for secure password storage
2. **JWT Authentication**: Token-based authentication
3. **Protected Routes**: Middleware checks for authenticated users
4. **Role-Based Access**: Admin-only routes protected
5. **Input Validation**: Mongoose schema validation
6. **CORS Configuration**: Controlled cross-origin requests

---

## Future Enhancements

Potential features for future development:
- Real-time messaging with WebSockets
- Video conferencing integration for sessions
- Email notifications
- File upload for messages and profiles
- Advanced search and filtering
- Analytics and reporting
- Mobile app (React Native)
- Social media integration
- Calendar integration
- Reminder notifications

---

## License

[Specify your license here]

---

## Contact and Support

For questions or issues, please contact [your contact information] or open an issue in the repository.

---

**Documentation Version**: 1.0  
**Last Updated**: 2024  
**Project Name**: SkillConnect - Mentor-Mentee Platform

