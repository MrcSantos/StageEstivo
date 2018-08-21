var express = require('express');
var router = express.Router();

var bp = require('body-parser');
const bodyParser = bp.urlencoded({ extended: false }); // Utilizzato per leggere i dati passati dal client

router.post('/', bodyParser, function (req, res, next) {
	
});

module.exports = router;
