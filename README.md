# SkillConnect - Mentor-Mentee Platform

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application that connects mentors (alumni) with mentees (students) for professional development and mentorship.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-mern-app
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URL=mongodb://localhost:27017/skillconnect
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=8080
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Runs both frontend and backend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

## 📋 Features

- ✅ **User Authentication**: Secure login/registration with JWT
- ✅ **Role-Based Access**: Admin, Mentor, and Mentee roles
- ✅ **Mentor Approval System**: Admin-controlled mentor approval workflow
- ✅ **Session Management**: Request, schedule, and manage mentorship sessions
- ✅ **Real-Time Messaging**: Direct messaging between mentors and mentees
- ✅ **Opportunities Platform**: Post and browse job/internship opportunities
- ✅ **Profile Management**: User profiles with photo uploads
- ✅ **Rating System**: Rate and provide feedback on sessions
- ✅ **Modern UI**: Responsive design with red, yellow, and black theme

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI library
- **Redux Toolkit** - State management
- **Ant Design** - UI components
- **React Router** - Routing
- **Axios** - HTTP client

## 📚 Documentation

For detailed documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md) which includes:
- Complete API documentation
- Database schemas
- Installation guide
- Architecture overview
- Development guide
- Library reference

## 🔑 User Roles

### Admin
- Approve/reject mentor applications
- View dashboard statistics
- Manage users and mentors

### Mentor (Alumni)
- Apply to become a mentor
- Manage session requests
- Post opportunities
- Chat with mentees
- Manage profile

### Mentee (Student)
- Find and connect with mentors
- Request mentorship sessions
- Browse opportunities
- Chat with mentors
- Rate sessions

## 📁 Project Structure

```
my-mern-app/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── redux/       # State management
│   │   ├── styles/      # CSS files
│   │   └── utils/       # Utility functions
├── config/              # Configuration files
├── controllers/         # Request handlers
├── middlewares/         # Custom middleware
├── models/              # Database schemas
├── routes/              # API routes
└── server.js            # Server entry point
```

## 🔌 Available Scripts

```bash
# Development
npm run dev          # Run both frontend and backend
npm run server       # Run backend only
npm run client       # Run frontend only

# Production
cd client
npm run build        # Build frontend for production
```

## 🌐 API Endpoints

### User Routes (`/api/v1/user`)
- `POST /login` - User login
- `POST /register` - User registration
- `GET /mentors` - Get all approved mentors
- `POST /sessions` - Create session request
- `POST /messages` - Send message
- `GET /conversations` - Get conversations
- And more...

### Admin Routes (`/api/v1/admin`)
- `GET /getAllUsers` - Get users for approval
- `PUT /approve-mentor-by-user` - Approve mentor
- `GET /dashboard-stats` - Dashboard statistics

See [DOCUMENTATION.md](./DOCUMENTATION.md) for complete API reference.

## 🎨 Theme

The application features a modern design with:
- **Primary Colors**: Red (#DC143C), Yellow (#FFB800), Black
- **Responsive Design**: Mobile-first approach
- **Interactive Elements**: Smooth animations and hover effects
- **Component Library**: Ant Design with custom styling

## 🔒 Security

- Password hashing with bcryptjs
- JWT-based authentication
- Protected API routes
- Role-based access control
- Input validation

## 📝 License

[Specify your license here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📧 Contact

[Add contact information here]

---

**Note**: Make sure MongoDB is running before starting the application. For detailed setup instructions and troubleshooting, refer to [DOCUMENTATION.md](./DOCUMENTATION.md).

