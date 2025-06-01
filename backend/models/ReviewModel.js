// In ReviewModel.js - Make sure associations are set up correctly:

import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import User from "./UserModel.js";
import Movie from "./MovieModel.js";

const { DataTypes } = Sequelize;

const Review = db.define('reviews', {
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: false,
    validate: {
      min: 0,
      max: 5,
    },
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'movies',
      key: 'id'
    }
  }
}, {
  freezeTableName: true,
});

// ⛓️ Relasi - Make sure these are defined
Review.belongsTo(User, { foreignKey: 'userId', as: 'User' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });

Review.belongsTo(Movie, { foreignKey: 'movieId', as: 'Movie' });
Movie.hasMany(Review, { foreignKey: 'movieId', as: 'reviews' });

// Alternative: If you're having issues, you might need to define associations in a separate file
// after all models are loaded to avoid circular dependency issues

export default Review;