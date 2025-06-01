import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import MovieRoute from './routes/MovieRoute.js';
import UserRoute from './routes/UserRoute.js';
import AdminRoute from './routes/AdminRoute.js';
import ReviewRoute from './routes/ReviewRoute.js';
import dotenv from "dotenv";
import multer from 'multer';

const app = express();

// Load environment variables
dotenv.config();

// CORS configuration - fix the duplicate and wrong order
app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'] // Add your frontend URLs
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this for form data
app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => res.render("index"));
app.use(MovieRoute);
app.use(UserRoute);
app.use(AdminRoute);
app.use(ReviewRoute);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error occurred:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: `Upload error: ${error.message}` });
  }
  
  if (error.message && error.message.includes('Only image files are allowed')) {
    return res.status(400).json({ message: error.message });
  }
  
  res.status(500).json({ message: 'Something went wrong!', error: error.message });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});