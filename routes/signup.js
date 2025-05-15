const express = require("express");
const router = express.Router();
const controller = require('../controller/signupController.js');

router.route('/').post(function(req,res) {
    controller.signup(req, res);
});

module.exports = router;