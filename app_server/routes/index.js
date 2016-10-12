var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main');

/* GET home page. */
router.get('/homepage', ctrlMain.getHomepage);


module.exports = router;
