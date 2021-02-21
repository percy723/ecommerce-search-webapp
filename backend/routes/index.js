var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'aws-rds-link.region.amazonaws.com',
  user: 'user',
  password: 'password',
  database: 'innodb',
  port: '3306'
});

connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
