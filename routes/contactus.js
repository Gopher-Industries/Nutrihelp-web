const express = require("express");
const router  = express.Router();
const controller = require('../controller/contactusController.js');

router.route('/').post(function(req,res) {
    controller.contactus(req, res);
});

module.exports = router;