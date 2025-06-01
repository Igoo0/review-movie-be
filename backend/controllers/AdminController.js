import User from "../models/AdminModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize"; // ✅ Add this import

// GET
async function getUsers(req, res) {
  try {
    const response = await User.findAll();
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
}

// GET BY ID
async function getUserById(req, res) {
  try {
    const response = await User.findOne({ where: { id: req.params.id } });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
}

// REGISTER
async function createUser(req, res) {
  try {
    const { username, email, password } = req.body;
    const encryptPassword = await bcrypt.hash(password, 5);
    await User.create({
      username: username,
      email: email,
      password: encryptPassword
    });
    res.status(201).json({ msg: "Register Berhasil" });
  } catch (error) {
    console.log(error.message);
  }
}

// UPDATE USER
async function updateUser(req, res) {
  try {
    const { username, email, password } = req.body;
    let updatedData = {
      username,
      email
    };
    if (password) {
      const encryptPassword = await bcrypt.hash(password, 5);
      updatedData.password = encryptPassword;
    }
    const result = await User.update(updatedData, {
      where: {
        id: req.params.id
      }
    });
    if (result[0] === 0) {
      return res.status(404).json({
        status: 'failed',
        message: 'Admin tidak ditemukan atau tidak ada data yang berubah',
        updatedData: updatedData,
        result
      });
    }
    res.status(200).json({ msg: "Admin Updated" });
  } catch (error) {
    console.log(error.message);
  }
}

// DELETE USER
async function deleteUser(req, res) {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.status(201).json({ msg: "Admin Deleted" });
  } catch (error) {
    console.log(error.message);
  }
}

// LOGIN HANDLER
async function loginHandler(req, res) {
  try {
    const { username, email, password } = req.body;
    
    // ✅ Fixed: Build proper query
    const whereClause = {};
    if (email) {
      whereClause[Op.or] = [
        { email: email },
        { username: email } // Allow login with email in username field
      ];
    } else if (username) {
      whereClause.username = username;
    }
    
    const user = await User.findOne({
      where: whereClause
    });
    
    if (user) {
      const userPlain = user.toJSON();
      // ✅ Fixed: Correct destructuring syntax
      const { password: userPassword, refresh_token, ...safeUserData } = userPlain;
      
      const decryptPassword = await bcrypt.compare(password, user.password);
      
      if (decryptPassword) {
        const accessToken = jwt.sign(safeUserData, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: '1d'
        });
        const refreshToken = jwt.sign(safeUserData, process.env.REFRESH_TOKEN_SECRET, {
          expiresIn: '1d'
        });
        
        await User.update({ refresh_token: refreshToken }, {
          where: {
            id: user.id
          }
        });
        
        res.cookie('refreshToken', refreshToken, {
          httpOnly: false,
          sameSite: 'none',
          maxAge: 24 * 60 * 60 * 1000,
          secure: true
        });
        
        res.status(200).json({
          status: "Success",
          message: "Login Berhasil",
          safeUserData,
          accessToken
        });
      } else {
        res.status(400).json({
          status: "Failed",
          message: "Password atau email salah"
        });
      }
    } else {
      res.status(400).json({
        status: "Failed",
        message: "Password atau email salah"
      });
    }
  } catch (error) {
    console.error("Login error:", error); // ✅ Better error logging
    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message
    });
  }
}

// LOGOUT
async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);
  
  const user = await User.findOne({
    where: {
      refresh_token: refreshToken
    }
  });
  
  if (!user || !user.refresh_token) return res.sendStatus(204);
  
  const userId = user.id;
  await User.update({ refresh_token: null }, {
    where: {
      id: userId
    }
  });
  
  res.clearCookie('refreshToken');
  return res.sendStatus(200);
}

export { getUsers, getUserById, createUser, updateUser, deleteUser, loginHandler, logout };