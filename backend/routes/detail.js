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

router.post('/business', function(req, res) {
  console.log("BUSINESS",req.body.business.businessid);
  connection.query("SELECT user.username, comment.comment FROM user LEFT JOIN comment ON user.userid = comment.userid WHERE comment.businessid = '"+req.body.business.businessid+"'", function(err, result, fields){
    if(err) throw err;
    console.log(result);
    res.send(JSON.stringify(result));
  })
});

router.post('/fav', function(req, res) {
  console.log("FAVORITE",req.body.id);
  connection.query("SELECT favorite.businessid, favorite.favid FROM `favorite` WHERE favorite.userid = '"+req.body.id+"'", function(err, result, fields){
    if(err) throw err;
    console.log(result);
    res.send(JSON.stringify(result));
  })
});

router.post('/comment', function(req, res) {
  console.log("comment!!!",req.body);
  connection.query("INSERT INTO `comment` (userid, businessid, comment) VALUES("+req.body.comments.userid+",'"+req.body.comments.bus_id+"','"+req.body.comments.comment+"')", function(err, result, fields){
    if(err) throw err;
    // console.log(result);
    res.send(JSON.stringify(result));
  })
});

router.post('/heart', function(req, res) {
  console.log("FAVORITE",req.body.heart);
  connection.query("INSERT INTO `favorite` (userid, businessid) VALUES ("+req.body.heart.userid+", '"+req.body.heart.bus_id+"')", function(err, result, fields){
    if(err) throw err;
    console.log(result);
    res.send(JSON.stringify(result));
  })
});

router.post('/delete', function(req, res) {
  console.log("FAVORITE",req.body.heart);
  connection.query("DELETE FROM `favorite` WHERE favid = "+req.body.heart.favid, function(err, result, fields){
    if(err) throw err;
    console.log(result);
    res.send(JSON.stringify(result));
  })
});

/* GET users listing. */
router.get('/', function(req, res, next) {
    connection.query("SELECT * FROM `comment`", function(err, result, fields){
      if(err) throw err;
      // console.log(result);
      res.send(JSON.stringify(result));
    })
});

module.exports = router;
