import Movie from "../models/MovieModel.js";
import { uploadToGCS, deleteFromGCS } from "../utils/FileUpload.js";

export const getMovies = async (req, res) => {
  try {
    const response = await Movie.findAll();
    res.status(200).json(response);
  } catch (error) {
    console.log("Get movies error:", error.message);
    res.status(500).json({ message: error.message });
  }
}

export const getMoviebyId = async (req, res) => {
  try {
    const response = await Movie.findOne({
      where: {
        id: req.params.id
      }
    });
    if (!response) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json(response);
  } catch (error) {
    console.log("Get movie by ID error:", error.message);
    res.status(500).json({ message: error.message });
  }
}

export const createMovie = async (req, res) => {
  try {
    console.log("Create movie request body:", req.body);
    console.log("Create movie request file:", req.file ? req.file.originalname : "No file");
    
    const { name, director, release_date, genre, duration, synopsis, cast } = req.body;
    
    // Validate required fields
    if (!name || !director || !release_date || !genre || !duration || !cast) {
      return res.status(400).json({ 
        message: "Missing required fields: name, director, release_date, genre, duration, cast are required",
        received: { name, director, release_date, genre, duration, cast }
      });
    }

    // Check if movie already exists
    const existingMovie = await Movie.findOne({ 
      where: { name: name } 
    });
    
    if (existingMovie) {
      return res.status(400).json({ 
        message: "Movie with this name already exists!" 
      });
    }

    let posterUrl = null;
    
    // Handle poster upload if file is provided
    if (req.file) {
      try {
        console.log("Uploading poster to GCS...");
        const uploadResult = await uploadToGCS(req.file, 'posters');
        posterUrl = uploadResult.publicUrl;
        console.log("Poster uploaded successfully:", posterUrl);
      } catch (uploadError) {
        console.log("Poster upload error:", uploadError.message);
        return res.status(400).json({ 
          message: `Poster upload failed: ${uploadError.message}` 
        });
      }
    }

    // Create movie with poster URL
    const movieData = {
      name: name.trim(),
      director: director.trim(),
      release_date,
      genre: genre.trim(),
      duration: parseInt(duration),
      synopsis: synopsis ? synopsis.trim() : null,
      cast: cast.trim(),
      poster: posterUrl
    };

    console.log("Creating movie with data:", movieData);
    const newMovie = await Movie.create(movieData);
    
    res.status(201).json({ 
      message: "Movie created successfully",
      movie: newMovie
    });
  } catch (error) {
    console.error("Create movie error:", error);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export const updateMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const { name, director, release_date, genre, duration, synopsis, cast } = req.body;
    
    console.log("Update movie request for ID:", movieId);
    console.log("Update movie request body:", req.body);
    
    // Find existing movie
    const existingMovie = await Movie.findByPk(movieId);
    if (!existingMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    let updatedData = {
      name: name || existingMovie.name,
      director: director || existingMovie.director,
      release_date: release_date || existingMovie.release_date,
      genre: genre || existingMovie.genre,
      duration: duration ? parseInt(duration) : existingMovie.duration,
      synopsis: synopsis !== undefined ? synopsis : existingMovie.synopsis,
      cast: cast || existingMovie.cast
    };

    // Handle poster update if new file is provided
    if (req.file) {
      try {
        console.log("Updating poster...");
        // Delete old poster if exists
        if (existingMovie.poster) {
          const oldFileName = existingMovie.poster.split('/').pop();
          try {
            await deleteFromGCS(`posters/${oldFileName}`);
            console.log("Old poster deleted successfully");
          } catch (deleteError) {
            console.log('Error deleting old poster:', deleteError.message);
          }
        }

        // Upload new poster
        const uploadResult = await uploadToGCS(req.file, 'posters');
        updatedData.poster = uploadResult.publicUrl;
        console.log("New poster uploaded:", updatedData.poster);
      } catch (uploadError) {
        console.log("Poster upload error:", uploadError.message);
        return res.status(400).json({ 
          message: `Poster upload failed: ${uploadError.message}` 
        });
      }
    }

    // Update movie
    const [updatedRowsCount] = await Movie.update(updatedData, {
      where: { id: movieId }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ 
        message: "Movie not found or no changes made" 
      });
    }

    const updatedMovie = await Movie.findByPk(movieId);
    
    res.status(200).json({ 
      message: "Movie updated successfully",
      movie: updatedMovie
    });
  } catch (error) {
    console.error("Update movie error:", error);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export const deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    
    console.log("Delete movie request for ID:", movieId);
    
    // Find movie to get poster info before deletion
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Delete poster from GCS if exists
    if (movie.poster) {
      const fileName = movie.poster.split('/').pop();
      try {
        await deleteFromGCS(`posters/${fileName}`);
        console.log("Poster deleted from GCS successfully");
      } catch (deleteError) {
        console.log('Error deleting poster from GCS:', deleteError.message);
      }
    }

    // Delete movie from database
    await Movie.destroy({
      where: { id: movieId }
    });
    
    res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) {
    console.error("Delete movie error:", error);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}