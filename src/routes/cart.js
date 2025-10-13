const express = require('express');
const router = express.Router();
const cartCon = require("../controller/cartController");
const middleware = require("../middleware/middleware");


router.route('/')
    .get(middleware.accessValidate, cartCon.getCart)
    .post(middleware.accessValidate, cartCon.addToCart)
    .put(middleware.accessValidate, cartCon.editCartItem)

router.route('/:productId').delete(middleware.accessValidate, cartCon.deleteCartItem)
router.route('/clear').delete(middleware.accessValidate, cartCon.clearCart)

module.exports=router;