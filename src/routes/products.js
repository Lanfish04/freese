const express = require('express');
const router = express.Router();
const productsCon = require("../controller/productController");
const middleware = require("../middleware/middleware");


router.route("/", middleware.accessValidate).get(productsCon.getProducts);
router.route("/:id").get(productsCon.getProductById);
router.route("/").post(productsCon.createProduct);
router.route("/:id").put(productsCon.updateProduct);
router.route("/:id").delete(productsCon.deleteProduct);


module.exports=router;