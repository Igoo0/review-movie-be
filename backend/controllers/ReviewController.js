import Review from "../models/ReviewModel.js";

export const getReviews = async (_req, res) => {
  try {
    const response = await Review.findAll();
    res.status(200).json(response);
    } catch (error) {
        console.log(error.massage);
    }
}

export const getReviewbyId = async (req, res) => {
  try {
    const response = await Review.findOne({
        where: {
            id: req.params.id
        }
    });
    res.status(200).json(response);
    } catch (error) {
        console.log(error.massage);
    }
}

export const createReview = async (req, res) => {
  try {
    await Review.create(req.body);
    res.status(201).json({msg: "Review Created"});
    } catch (error) {
        console.log(error.massage);
    }
}

export const updateReview = async (req, res) => {
  try {
    await Review.update(req.body, {
        where: {
            id: req.params.id
        }
    });
    res.status(200).json({msg: "Review Updated"});
    } catch (error) {
        console.log(error.massage);
    }
}

export const deleteReview = async (req, res) => {
  try {
    await Review.destroy({
        where: {
            id: req.params.id
        }
    });
    res.status(200).json({msg: "Review Deleted"});
    } catch (error) {
        console.log(error.massage);
    }
}