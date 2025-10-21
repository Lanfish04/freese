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

router.route("/payment")
    .get(transactionCon.uploadPaymentProof);

router.route("/history")    
    .get(middleware.accessValidate, transactionCon.historyTransaction);

router.route("/product/pay/:transactionsId")    
    .post(middleware.accessValidate, transactionCon.payClick);

module.exports = router;