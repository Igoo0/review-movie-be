import express from "express";
import { 
    getMovies, 
    getMoviebyId,
    createMovie,
    updateMovie,
    deleteMovie
} from "../controllers/MovieController.js";
import { upload } from "../utils/FileUpload.js";

const router = express.Router();

// Middleware to handle multer errors
const handleMulterError = (error, req, res, next) => {
  console.error('Multer error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'File too large. Maximum size is 5MB'
    });
  }
  
  if (error.message && error.message.includes('Only image files')) {
    return res.status(400).json({
      message: 'Invalid file type. Only JPEG, JPG, PNG, GIF, and WebP files are allowed'
    });
  }
  
  return res.status(400).json({
    message: `File upload error: ${error.message}`
  });
};

// Routes without file upload
router.get("/Movies", getMovies);
router.get("/Movies/:id", getMoviebyId);

// Routes with file upload (poster)
router.post("/Movies", 
  (req, res, next) => {
    console.log('POST /Movies - Request received');
    upload.single('poster')(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  createMovie
);

router.patch("/Movies/:id", 
  (req, res, next) => {
    console.log('PATCH /Movies/:id - Request received for ID:', req.params.id);
    upload.single('poster')(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  updateMovie
);

// Delete route
router.delete("/Movies/:id", deleteMovie);

export default router;