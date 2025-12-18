const express = require('express');
const router = express.Router();
const transactionCon = require("../controller/transactionController");
const middleware = require("../middleware/middleware");
const upload = require("../middleware/upload");

router.route("/product")
    .post(middleware.accessValidate, transactionCon.createOneTransaction); 

router.route("/product/cart")
    .post(middleware.accessValidate, transactionCon.createSelectedTransactions);

router.route("/product/edit/status/")
    .patch(upload.single('invoice'), middleware.accessValidate, transactionCon.editTransactionStatus);

router.route("/product/status/complete")
    .patch(middleware.accessValidate, transactionCon.updateStatusComplete);

router.route("/payment")
    .get(transactionCon.updateStatusPembayaran);

router.route("/history")    
    .get(middleware.accessValidate, transactionCon.historyTransaction);

router.route("/history/:id")
    .get(middleware.accessValidate, transactionCon.getHistoryById);

router.route("/product/pay/:transactionsId")    
    .post(middleware.accessValidate, transactionCon.payClick);

module.exports = router;