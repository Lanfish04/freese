const express = require('express');
const router = express.Router();
const cartCon = require("../controller/cartController");
const middleware = require("../middleware/middleware");


router.route('/')
    .get(middleware.accessValidate, cartCon.getCart)
    .post(middleware.accessValidate, cartCon.addToCart)
    .put(middleware.accessValidate, cartCon.editCartItem)
    .delete(middleware.accessValidate, cartCon.deleteCartItem)


module.exports=router;