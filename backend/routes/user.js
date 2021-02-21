var express = require('express');
var router = express.Router();
var mysql = require('mysql');


// const app = express();
// const cors = require('cors');

var connection = mysql.createConnection({
  host: 'aws-rds-link.region.amazonaws.com',
  user: 'user',
  password: 'password',
  database: 'innodb',
  port: '3306'
});

connection.connect(function(err){
  if(err) throw err;
  console.log('Connection success');
});

/* GET users listing. */
router.get('/', function(req, res, next) {
    connection.query('SELECT * FROM `business`', function(err, result, fields){
      if(err) throw err;
      // console.log(result);
      res.send(JSON.stringify(result));
    })
});

router.post('/', function(req, res) {
  console.log(req.body);
  console.log(req.body.home_location.lat);
  console.log(req.body.home_location.lon);
  
  //console.log('SELECT favorite.businessid, business.name, business.lon, business.lat, business.photo, business.price, business.review, business.rating FROM `favorite` INNER JOIN `business` ON business.businessid = favorite.businessid AND favorite.userid = '+uid+';')
  connection.query("SELECT *, ROUND(1000*DIST("+req.body.home_location.lat+","+req.body.home_location.lon+",business.lat,business.lon), 2) as distance FROM innodb.business", function(err, result, fields){
    //connection.query("SELECT * FROM innodb.business;", function(err, result, fields){
  
  if(err) throw err;
    console.log(result);
    res.send(JSON.stringify(result));
  })

});

router.post('/login', function(req, res) {
  console.log(req.body);
  console.log(req.body.userdata.id);
  
  var uid = req.body.userdata.id
  
  //console.log('SELECT favorite.businessid, business.name, business.lon, business.lat, business.photo, business.price, business.review, business.rating FROM `favorite` INNER JOIN `business` ON business.businessid = favorite.businessid AND favorite.userid = '+uid+';')
  connection.query("SELECT favorite.businessid, business.name, business.lon, business.lat, business.photo, business.price, business.review, business.rating, ROUND(1000*DIST("+req.body.userdata.lat+","+req.body.userdata.lon+",business.lat,business.lon), 2) as distance  FROM `favorite` INNER JOIN `business` ON business.businessid = favorite.businessid AND favorite.userid = "+uid+";", function(err, result, fields){
    if(err) throw err;
    console.log(result);
    res.send(JSON.stringify(result));
  })

});

router.post('/top', function(req, res) {
  //console.log('SELECT favorite.businessid, business.name, business.lon, business.lat, business.photo, business.price, business.review, business.rating FROM `favorite` INNER JOIN `business` ON business.businessid = favorite.businessid AND favorite.userid = '+uid+';')
  connection.query("SELECT comment.businessid, business.name , COUNT(comment) as comment_count FROM comment INNER JOIN business ON comment.businessid = business.businessid group by comment.businessid ORDER BY COUNT(comment) DESC LIMIT 5", function(err, result, fields){
    if(err) throw err;
    console.log(result);
    res.send(JSON.stringify(result));
  })

});

module.exports = router;
