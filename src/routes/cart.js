const express = require('express');
const router = express.Router();
const cartCon = require("../controller/cartController");
const middleware = require("../middleware/middleware");


router.route('/')
    .get(middleware.accessValidate, cartCon.getCart)
    .post(middleware.accessValidate, cartCon.addToCart);

router.route('/edit/:productId')
.get(middleware.accessValidate, cartCon.showEditCart)  
.put(middleware.accessValidate, cartCon.editCartItem)

router.route('/:productId').delete(middleware.accessValidate, cartCon.deleteCartItem)
router.route('/clear').delete(middleware.accessValidate, cartCon.clearCart)
router.route('/:id/select').patch(middleware.accessValidate,cartCon.itemSelected)

module.exports=router;