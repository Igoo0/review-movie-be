import { Sequelize } from "sequelize";
import db from "../config/Database.js";

// Membuat tabel "user"

//PERBARUI MODEL USER DENGAN MENAMBAHKAN PASSWORD DAN REFRESH TOKEN
const Admin = db.define(
  "admins", // Nama Tabel
  {
    username: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    refresh_token: Sequelize.TEXT
  },{
    freezeTableName : true
}
);

db.sync().then(() => console.log("Database synced"));

export default Admin;