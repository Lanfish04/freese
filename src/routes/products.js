const express = require('express');
const router = express.Router();
const productsCon = require("../controller/productController");
const middleware = require("../middleware/middleware");
const upload = require("../middleware/upload");


router.route("/")
	.get(productsCon.getProducts)
	.post(upload.single('image'), middleware.accessValidate, productsCon.createProduct);

router.route("/myproducts")
    .get(middleware.accessValidate, productsCon.getMyProducts);

router.route("/:id")
	.get(productsCon.detailProduct)
	.delete(middleware.accessValidate, productsCon.deleteProduct);

router.route("/edit/:id")
	.get(middleware.accessValidate, productsCon.showEditProduct)
	.put(upload.single('image'), middleware.accessValidate, productsCon.updateProduct);

router.route("/delete/:id")
	.delete(middleware.accessValidate, productsCon.deleteProduct);

router.route("/search")
	.get(productsCon.searchProduct);


module.exports=router;