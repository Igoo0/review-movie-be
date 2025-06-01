import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

// REGISTER //baru nambahin pasword dan bcrypt
async function createUser(req, res) {
  try{
    const { username, email, password } = req.body;
    const encryptPassword = await bcrypt.hash(password, 5);
    await User.create({
        username: username,
        email: email,
        password: encryptPassword
        
    });
    res.status(201).json({msg:"Register Berhasil"});
} catch(error){
    console.log(error.message);
}
}

//baru nambahin case password
async function updateUser(req, res) {
  try{
    const { username, email , password} = req.body;
    let updatedData = {
      username, email
    }; //nyimpen jadi object

    if (password) {
        const encryptPassword = await bcrypt.hash(password, 5);
        updatedData.password = encryptPassword;
    }

    const result = await User.update(updatedData, {
        where: {
            id: req.params.id
        }
    });

    // Periksa apakah ada baris yang terpengaruh (diupdate)
    if (result[0] === 0) {
        return res.status(404).json({
            status: 'failed',
            message: 'User tidak ditemukan atau tidak ada data yang berubah',
            updatedData: updatedData,
            result
        });
    }


    
    res.status(200).json({msg:"User Updated"});
  } catch(error){
    console.log(error.message);
  }
}

async function deleteUser(req, res) {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.status(201).json({ msg: "User Deleted" });
  } catch (error) {
    console.log(error.message);
  }
}

//Nambah fungsi buat login handler
async function loginHandler(req, res){
  try{
      const{email, password} = req.body;
      const user = await User.findOne({
          where : {
              email: email
          }
      });

      if(user){
        //Data User itu nanti bakalan dipake buat ngesign token kan
        // data user dari sequelize itu harus diubah dulu ke bentuk object
        //Safeuserdata dipake biar lebih dinamis, jadi dia masukin semua data user kecuali data-data sensitifnya  karena bisa didecode kayak password caranya gini :
        const userPlain = user.toJSON(); // Konversi ke object
        const { password: _, refresh_token: __, ...safeUserData } = userPlain;


          const decryptPassword = await bcrypt.compare(password, user.password);
          if(decryptPassword){
              const accessToken = jwt.sign(safeUserData, process.env.ACCESS_TOKEN_SECRET, {
                  expiresIn : '1d' 
              });
              const refreshToken = jwt.sign(safeUserData, process.env.REFRESH_TOKEN_SECRET, {
                  expiresIn : '1d' 
              });
              await User.update({refresh_token:refreshToken},{
                  where:{
                      id:user.id
                  }
              });
              res.cookie('refreshToken', refreshToken,{
                  httpOnly : false, //ngatur cross-site scripting, untuk penggunaan asli aktifkan karena bisa nyegah serangan fetch data dari website "document.cookies"
                  sameSite : 'none',  //ini ngatur domain yg request misal kalo strict cuman bisa akseske link dari dan menuju domain yg sama, lax itu bisa dari domain lain tapi cuman bisa get
                  maxAge  : 24*60*60*1000,
                  secure:true //ini ngirim cookies cuman bisa dari https, kenapa? nyegah skema MITM di jaringan publik, tapi pas development di false in aja
              });
              res.status(200).json({
                  status: "Succes",
                  message: "Login Berhasil",
                  safeUserData,
                  accessToken 
              });
          }
          else{
              res.status(400).json({
                  status: "Failed",
                  message: "Paassword atau email salah",
                
              });
          }
      } else{
          res.status(400).json({
              status: "Failed",
              message: "Paassword atau email salah",
          });
      }
  } catch(error){
      res.status(error.statusCode || 500).json({
          status: "error",
          message: error.message
      })
  }
}

//nambah logout
async function logout(req,res){
  const refreshToken = req.cookies.refreshToken; //mgecek refresh token sama gak sama di database
  if(!refreshToken) return res.sendStatus(204);
  const user = await User.findOne({
      where:{
          refresh_token:refreshToken
      }
  });
  if(!user.refresh_token) return res.sendStatus(204);
  const userId = user.id;
  await User.update({refresh_token:null},{
      where:{
          id:userId
      }
  });
  res.clearCookie('refreshToken'); //ngehapus cookies yg tersimpan
  return res.sendStatus(200);
}
export { getUsers, getUserById, createUser, updateUser, deleteUser, loginHandler, logout};