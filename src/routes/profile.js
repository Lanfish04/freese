const express = require('express');
const router = express.Router();
const profileCon = require("../controller/profileController");
const middleware = require("../middleware/middleware");

router.route("/")
    .get(middleware.accessValidate, profileCon.getMyProfile);

router.route("/:id")
    .get(middleware.accessValidate, profileCon.getOtherProfile);

router.route("/edit")
    .get(middleware.accessValidate, profileCon.getMyProfile)
    .put(middleware.accessValidate, profileCon.updateProfile);
    
module.exports = router;