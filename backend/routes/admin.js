var express = require("express");
var router = express.Router();
'use strict';

const yelp = require('yelp-fusion');
const client = yelp.client('input-yelp-api-key-here');

const bcrypt = require('bcrypt');
const saltRounds = 10;

var row_count; 

var mysql = require('mysql');

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
  
function replace_undefined(e){
    if(typeof(e) === "undefined"){
        return "";
    }else return e;

}

/* GET users listing. */
router.get('/getuser', function(req, res, next) {
  connection.query('SELECT * FROM `user`', function(err, result, fields){
    if(err) throw err;
    // console.log(result);
    res.send(JSON.stringify(result));
  })
});


router.get('/getloc', function(req, res, next) {
  connection.query('SELECT * FROM `business`', function(err, result, fields){
    if(err) throw err;
    // console.log(result);
    res.send(JSON.stringify(result));
  })
});

router.get('/chart', function(req, res, next) {
  connection.query('SELECT usercom.userid ,usercom.username,usercom.comment_count , fav.fav_count ,coalesce(usercom.comment_count + fav.fav_count,usercom.comment_count , fav.fav_count) as active_count FROM( SELECT user.userid, user.username, com.comment_count FROM user LEFT JOIN (SELECT comment.userid, COUNT(comment) as comment_count FROM comment GROUP BY comment.userid) as com ON user.userid = com.userid ) as usercom LEFT JOIN (SELECT favorite.userid, COUNT(favid) as fav_count FROM favorite GROUP BY favorite.userid) as fav ON usercom.userid = fav.userid ORDER BY active_count DESC LIMIT 5',
    function(err, result, fields){
    if(err) throw err;
    // console.log(result);
    res.send(JSON.stringify(result));
  })
});


router.get('/rowcount', function(req, res, next){
    // get the row count of table business
  let sql = "SELECT COUNT(businessid) AS count FROM `innodb`.`business`";
  
  connection.query(sql, function(err, result, fields){
    if (err) throw err;
    // console.log(row_count = result[0].count);
    let temp_row_count = parseInt(result[0].count);
    row_count = temp_row_count + 1;
    // console.log(row_count);
    res.send(JSON.stringify(row_count));
  });
})

router.get("/flush", function(req, res, next) {
	
	client.search({
	  latitude: 22.418498326,
	  longitude: 114.204074184,
      radius: 1000,
      limit:50,
      offset:1,
	  location: 'hong kong',
	}).then(response => {
	  
      

		var bulk = []

        var len = response.jsonBody.businesses.length;
        // console.log(len);
        
	
		  for(var i = 0; i < len; i++){
			  var tmp = '("'+ replace_undefined(response.jsonBody.businesses[i].id) + '","'
			  + replace_undefined(response.jsonBody.businesses[i].name) + '","' +
			  + replace_undefined(response.jsonBody.businesses[i].coordinates.longitude) + '","'
			  + replace_undefined(response.jsonBody.businesses[i].coordinates.latitude) + '","'
			  + replace_undefined(response.jsonBody.businesses[i].image_url) + '","'
			  + replace_undefined(response.jsonBody.businesses[i].price) + '","'
			  + replace_undefined(response.jsonBody.businesses[i].review_count) + '","'
			  + replace_undefined(response.jsonBody.businesses[i].rating) + '")'
			  
			  bulk.push(tmp);
          }
          

		  
        
          connection.query("INSERT INTO `innodb`.`business` (`businessid`,`name`,`lon`,`lat`,`photo`,`price`,`review`,`rating`) VALUES"
          + bulk.join(",") + "ON DUPLICATE KEY UPDATE name = VALUES(name), lon = VALUES(lon), lat = VALUES(lat), photo = VALUES(photo), price = VALUES(price), review = VALUES(review), rating = VALUES(rating)", function(err, result, fields){
            if(err) throw err;
            // console.log(result);
            res.send(JSON.stringify(result));
          })



	}).catch(e => {
	  console.log(e);
	});
});

//CRUD admin

router.post('/adduser', function(req, res) {
  console.log(req.body);
  
  bcrypt.genSalt(saltRounds, function(err, salt) { //hash the password
    bcrypt.hash(req.body.adduser.password, salt, function(err, hashedPW) {  
      console.log(hashedPW); //use to check POST /login/

        let sql = "INSERT INTO `innodb`.`user` (`username`,`password`, `home_lat`,  `home_lon`) VALUES (?, ?, ?, ?)"; 
      
        connection.query(sql, [req.body.adduser.name, hashedPW, req.body.adduser.home_lat, req.body.adduser.home_lon], function(err, result, fields){
          if (err) throw err;
          // console.log(result);
        })
    });
  });

  res.send(true);

});

router.post('/addloc', function(req, res) { 
  console.log(req.body);
  
      let sql = "INSERT INTO `innodb`.`business` (`businessid`,`name`,`lat`,`lon`,`photo`,`price`,`review`,`rating`) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), lon = VALUES(lon), lat = VALUES(lat), photo = VALUES(photo), price = VALUES(price), review = VALUES(review), rating = VALUES(rating)";
      // let businessid = "#"+ row_count +"_business";
      connection.query(sql, [req.body.addloc.businessid, req.body.addloc.name, req.body.addloc.lat, req.body.addloc.lon, "",req.body.addloc.price, req.body.addloc.review, req.body.addloc.rating], function(err, result, fields){
        if (err) throw err;
        // console.log(result);

        if(err)
          return reject(err);

      res.send(true);
    })
});



router.post('/deluser', function(req, res) {
  console.log(req.body);


  var len = req.body.delete_user.userid.length;
  // console.log(len);

  var deleteUsers = [];

  for (var i = 0; i < len; i++){
    var temp = req.body.delete_user.userid[i];
    deleteUsers.push(temp);
  }

  console.log(deleteUsers);

  connection.query("DELETE FROM `innodb`.`user` WHERE userid ="
          + deleteUsers.join(" OR userid ="), function(err, result, fields){
            if(err) throw err;
            // console.log(result);
            res.send(JSON.stringify(result));
          })

});


router.post('/delloc', function(req, res) {
  console.log(req.body);
  
  var len = req.body.delete_id.businessid.length;
  // console.log(len);

  var deleteIds = [];

  for (var i = 0; i < len; i++){
    var temp = '"' + req.body.delete_id.businessid[i] + '"';
    deleteIds.push(temp);
  }

  console.log(deleteIds);

  connection.query("DELETE FROM `innodb`.`business` WHERE businessid ="
          + deleteIds.join("OR businessid ="), function(err, result, fields){
            if(err) throw err;
            // console.log(result);
            res.send(JSON.stringify(result));
          })

});


router.post('/edituser', function(req, res) {
  
  console.log(req.body);


  bcrypt.genSalt(saltRounds, function(err, salt) { //hash the password
    bcrypt.hash(req.body.edituser.password, salt, function(err, newHashedPW) {  
      
      console.log(newHashedPW); 


      let sql = "UPDATE `user` SET user.username='"+req.body.edituser.username+"', user.password='"+newHashedPW+"', user.home_lon="+req.body.edituser.home_lon+", user.home_lat="+req.body.edituser.home_lat+" WHERE user.userid ="+req.body.edituser.userid;

      connection.query(sql, function(err, result, fields){
        if(err) throw err;
        console.log(result);
        
        res.send(true);
      })


    });
  });


});


router.post('/editloc', function(req, res) {
  console.log(req.body);

  let sql = "UPDATE `business` SET business.name ='"+req.body.editloc.name + "', business.lon=" + req.body.editloc.lon + ", business.lat="+req.body.editloc.lat+", business.price='"+req.body.editloc.price+ "', business.review="+req.body.editloc.review+", business.rating="+req.body.editloc.rating+" WHERE business.businessid='"+req.body.editloc.businessid+"'";

  connection.query(sql, function(err, result, fields){
    if(err) throw err;
    console.log(result);
    
    res.send(true);
  })
  
});

router.post('/uploadcsv', function(req, res) {
  console.log(req.body);  

  var len = req.body.data.length;
  var locdata = [];
  var nullPhoto = undefined;

  console.log(len);

  for(var i = 0; i < len; i++){
    let count = row_count + i;
    // console.log(count);
    // let businessid = "#"+ count +"_business";

    var loc = '("'+ req.body.data[i].businessid + '","'+ req.body.data[i].name + '",' + req.body.data[i].lon +`,`+req.body.data[i].lat+`,"`+replace_undefined(nullPhoto)+'","'+req.body.data[i].price+'",' + req.body.data[i].review+','+req.body.data[i].rating+')';
    locdata.push(loc);
  }


  connection.query("INSERT INTO `innodb`.`business` (`businessid`,`name`,`lon`,`lat`,`photo`,`price`,`review`,`rating`) VALUES"
  +locdata.join(",")+" ON DUPLICATE KEY UPDATE name = VALUES(name), lon = VALUES(lon), lat = VALUES(lat), photo = VALUES(photo), price = VALUES(price), review = VALUES(review), rating = VALUES(rating)", function(err, result, fields){
    if(err) throw err;
    console.log(result);
    res.send(true);
  })

  });

module.exports = router;


//bcrypt reference: https://www.npmjs.com/package/bcrypt
