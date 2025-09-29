const express = require('express');
const router = express.Router();
const authRouter = require("./auth");
const productsRouter = require("./products");
const profileRouter = require("./profile");
const transactionRouter = require("./transaction");

const defaultRoute = [
{
    path:"/auth",
    router:authRouter, 

},
{
    path:"/products",
    router:productsRouter,
},
{
    path:"/profile",
    router:profileRouter,
},
{
    path:"/transaction",
    router:transactionRouter,
}   
];

defaultRoute.forEach((route) => {
    router.use(route.path, route.router);
});


module.exports = router;