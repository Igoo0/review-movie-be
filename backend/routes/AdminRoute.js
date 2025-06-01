import express from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  loginHandler,
  logout
} from "../controllers/AdminController.js";
import { refreshToken } from "../controllers/RefreshTokenAdmin.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

//endpoint akses token
router.get('/token', refreshToken);
//endpoin auth
router.post('/loginAdmin', loginHandler);
router.delete('/logoutAdmin', logout);

//endpoint data biasa
router.post("/registerAdmin", createUser); //tambah user 
router.get("/admins",verifyToken, getUsers);
router.get("/admins/:id", verifyToken,getUserById);
router.put("/edit-admin/:id", verifyToken,updateUser);
router.delete("/delete-admin/:id", deleteUser);

export default router;