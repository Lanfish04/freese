const express = require('express');
const router = express.Router();
const authCon = require("../controller/authController")
const upload = require("../middleware/upload");

router.route("/login").post(authCon.login);
router.route("/register").post(upload.single('photo'), authCon.register);

module.exports=router;