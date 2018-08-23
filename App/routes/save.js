var express = require('express');
var router = express.Router();
var fs = require('fs');

var bp = require('body-parser');
const bodyParser = bp.urlencoded({ extended: false }); // Used to parse client data

router.post('/', bodyParser, function (req, res, next) {
	fs.writeFile("DummyTest.txt", JSON.stringify(req.body)); // Writes data in the txt file
	res.sendStatus(200);
});

module.exports = router;
