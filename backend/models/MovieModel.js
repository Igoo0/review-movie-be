import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Movie = db.define(
  'movies',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    director: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    release_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        notEmpty: true
      }
    },
    genre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1,
        max: 1440 // Max 24 hours in minutes
      }
    },
    synopsis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cast: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 1000]
      }
    },
    poster: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: true, // This adds createdAt and updatedAt
    validate: {
      // Custom validation at model level
      checkDuration() {
        if (this.duration && this.duration <= 0) {
          throw new Error('Duration must be greater than 0');
        }
      }
    }
  }
);

// Sync database with proper error handling
(async () => {
  try {
    await db.sync({ alter: true });
    console.log('✅ Movies table synced successfully');
  } catch (error) {
    console.error('❌ Error syncing movies table:', error.message);
    console.error('Full error:', error);
  }
})();

export default Movie;