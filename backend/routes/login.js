var express = require('express');
var router = express.Router();
var mysql = require('mysql');

const bcrypt = require('bcrypt');
const saltRounds = 10;

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


router.get('/', function(req, res, next) {
  connection.query('SELECT * FROM `user`', function(err, result, fields){
    if(err) throw err;
    // console.log(result);
    res.send(JSON.stringify(result));
  })
});

router.post('/', function(req, res, next){
  console.log(req.body);
  
  let sql = "select * FROM user where username = '" + req.body.current_user.user +"'" ;
  var userdata;

  connection.query(sql, function(err, result, fields){
    if(err) throw err;

    // console.log(result);
    userdata = JSON.parse(JSON.stringify(result));

    // console.log(req.body.current_user.password);
    // console.log(userdata[0].password);
    console.log(userdata);

    if(userdata[0].password){

      bcrypt.compare(req.body.current_user.password, userdata[0].password, function(err, result) {
        
        if(err) throw err;

        console.log(result);

        if(result){ //res == true when password is correct
          res.send({status: true, current_user: userdata[0]});
        }else{
          res.send({status: false});
        }
        
      })
    }
  })
});



module.exports = router;
