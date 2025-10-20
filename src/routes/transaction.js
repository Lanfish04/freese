const express = require('express');
const router = express.Router();
const transactionCon = require("../controller/transactionController");
const middleware = require("../middleware/middleware");

router.route("/product")
    .post(middleware.accessValidate, transactionCon.createOneTransaction); 

router.route("/product/cart")
    .post(middleware.accessValidate, transactionCon.createSelectedTransactions);

router.route("/payment/status")
    .patch(middleware.accessValidate, transactionCon.editPaymentStatus);

router.route("/payment/proof/:transactionId")
    .patch(middleware.accessValidate, transactionCon.uploadPaymentProof);

router.route("/history")    
    .get(middleware.accessValidate, transactionCon.historyTransaction);

module.exports = router;