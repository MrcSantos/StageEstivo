var express = require('express');
var router = express.Router();
var fs = require('fs');

var bp = require('body-parser');
const bodyParser = bp.urlencoded({ extended: false }); // Used to parse client data

router.post('/', bodyParser, function (req, res, next) {
	console.log("Salvataggio...");
	
	fs.writeFile("DummyTest.txt", JSON.stringify(req.body));
	res.send(200);
});

module.exports = router;
