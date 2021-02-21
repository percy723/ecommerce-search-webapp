var express = require("express");
var router = express.Router();
var mysql = require('mysql');

var conn = mysql.createConnection({
    host: 'aws-rds-link.region.amazonaws.com',
    user: 'user',
    password: 'password',
    database: 'innodb',
    port: '3306'
});


//start connection
conn.connect(function(err){
	if(err) throw err;
	console.log('connect success!');
});

router.get("/", function(req, res, next) {
	//try query
	conn.query('SELECT * FROM `business`', function(err, result, fields){
		if(err) throw err;
		res.send(result);
	});
});

//close connection
// conn.end(function(err){
// 	if(err) throw err;
// 	console.log('connect end');
// });


module.exports = router;
