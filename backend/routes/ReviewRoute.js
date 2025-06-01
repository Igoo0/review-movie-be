import express from "express";
import { 
    getReviews, 
    getReviewbyId,
    createReview,
    updateReview,
    deleteReview
} from "../controllers/ReviewController.js";

const router = express.Router();

router.get("/reviews", getReviews);
router.get("/reviews/:id", getReviewbyId);
router.post("/reviews", createReview);
router.patch("/reviews/:id", updateReview);
router.delete("/reviews/:id", deleteReview);

export default router;