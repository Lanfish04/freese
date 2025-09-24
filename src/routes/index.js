const express = require('express');
const router = express.Router();
const authRouter = require("./auth");
const productsRouter = require("./products");
const profileRouter = require("./profile");

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
    router:require("./transaction"),
}   
];

defaultRoute.forEach((route) => {
    router.use(route.path, route.router);
});


module.exports = router;