const express = require('express');
const router = express.Router();
const productsCon = require("../controller/productController");
const middleware = require("../middleware/middleware");


router.route("/")
	.get(productsCon.getProducts)
	.post(middleware.accessValidate, productsCon.createProduct);

router.route("/myproducts")
    .get(middleware.accessValidate, productsCon.getMyProducts);

router.route("/:id")
	.get(productsCon.detailProduct)
	.delete(middleware.accessValidate, productsCon.deleteProduct);

router.route("/edit/:id")
	.get(middleware.accessValidate, productsCon.showEditProduct)
	.put(middleware.accessValidate, productsCon.updateProduct);

router.route("/delete/:id")
	.delete(middleware.accessValidate, productsCon.deleteProduct);


module.exports=router;