const express = require('express');
const router = express.Router();
const cartCon = require("../controller/cartController");
const middleware = require("../middleware/middleware");


router.route('/')
    .get(middleware.accessValidate, cartCon.getCart)
    .post(middleware.accessValidate, cartCon.addToCart);


module.exports=router;