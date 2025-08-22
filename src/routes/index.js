const express = require('express');
const router = express.Router();
const authRouter = require("./auth")
const productsRouter = require("./products")
const defaultRoute = [
{
    path:"/auth",
    router:authRouter, 

},
{
    path:"/products",
    router:productsRouter,
}
];

defaultRoute.forEach((route)=>{
    router.use(route.path, route.router);
});


module.exports=router