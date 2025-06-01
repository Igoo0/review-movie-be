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

// CORS configuration
app.use(cors({
  credentials: true,
  // IMPORTANT: Add your deployed frontend URL here!
  origin: [
    'http://localhost:3000', // Keep for local frontend development
    'http://localhost:3001', // Keep if you use another local port
    'http://localhost:8080', // Keep if you use another local port
    'https://review-movie-dot-xenon-axe-450704-n3.uc.r.appspot.com' // Your deployed frontend URL
    // You might also want to add the backend's own URL if it makes requests to itself
    // For example: 'https://buku-tukar-559917148272.us-central1.run.app' if your backend ever calls itself.
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Explicitly allow common HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allow common headers you use
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

  res.status(500).json({ message: 'Something went wrong!', error: error.message || 'Unknown error' });
});

// Use process.env.PORT for deployment environments like Google Cloud Run
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
