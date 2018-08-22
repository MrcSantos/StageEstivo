var express = require('express');
var router = express.Router();
var fs = require('fs');

var bp = require('body-parser');
const bodyParser = bp.urlencoded({ extended: false }); // Used to parse client data

router.get('/', function (req, res, next) {
	console.log("Spedizione...");
	
	fs.readFile('DummyTest.txt', function (err, data) {
		res.send(data);
	});
});

module.exports = router;
