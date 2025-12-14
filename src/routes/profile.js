const express = require('express');
const router = express.Router();
const profileCon = require("../controller/profileController");
const middleware = require("../middleware/middleware");
const upload = require("../middleware/upload");

router.route("/")
    .get(middleware.accessValidate, profileCon.getMyProfile);

router.route("/:id")
    .get(middleware.accessValidate, profileCon.getOtherProfile);

router.route("/edit/data")
    .get(middleware.accessValidate, profileCon.getMyProfile)
    .put(upload.single('photo'), middleware.accessValidate, profileCon.updateDataProfile)
    .delete(middleware.accessValidate, profileCon.deleteProfile);

router.route("/edit/akun")
    .get(middleware.accessValidate, profileCon.getMyProfile)
    .put(middleware.accessValidate, profileCon.updatePasswordProfile);
module.exports = router;