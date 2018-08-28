var express = require('express');
var router = express.Router();
var fs = require('fs');

var bp = require('body-parser');
const bodyParser = bp.urlencoded({ extended: false }); // Used to parse client data

router.get('/', function (req, res, next) {
	var read = "[";

	fs.readdir('records', function (err, files) {
		for (const file in files) {
			fs.readFile("records/" + files[file], function (err, data) { // Reads data from the txt file
				//console.log(data);
				read += data; // Sends the read data

				if (file < files.length - 1) {
					read += ",";
				}
			});
		}
		setTimeout(function () {
			read += "]";

			res.send(read);
		}, 1000)
	});



	/*fs.readFile('DummyTest.txt', function (err, data) { // Reads data from the txt file
		res.send(data); // Sends the read data
	});*/
});

module.exports = router;
