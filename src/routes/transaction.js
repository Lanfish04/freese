const express = require('express');
const router = express.Router();
const transactionCon = require("../controller/transactionController");
const middleware = require("../middleware/middleware");

router.route("/")
    .post(middleware.accessValidate, transactionCon.createTransaction); 

module.exports = router;