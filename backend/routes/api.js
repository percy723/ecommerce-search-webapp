var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var o2x = require('object-to-xml');
var xmlparser = require('express-xml-bodyparser');

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

  function OBJtoXML(obj) {
    var xml = '';
    for (var prop in obj) {
      xml += obj[prop] instanceof Array ? '' : "<" + prop + ">";
      if (obj[prop] instanceof Array) {
        for (var array in obj[prop]) {
          xml += "<" + prop + ">";
          xml += OBJtoXML(new Object(obj[prop][array]));
          xml += "</" + prop + ">";
        }
      } else if (typeof obj[prop] == "object") {
        xml += OBJtoXML(new Object(obj[prop]));
      } else {
        xml += obj[prop];
      }
      xml += obj[prop] instanceof Array ? '' : "</" + prop + ">";
    }
    var xml = xml.replace(/<\/?[0-9]{1,}>/g, '');
    return xml
  }

  //(1)
  //GET /api/locations - List all locations
  router.get('/locations', function(req, res, next) {
    
    console.log(req.headers);

    if(req.headers['authorization']==='Bearer csci2720' || req.headers['Authorization']==='Bearer csci2720'){

      connection.query('SELECT * FROM `business`', function(err, result, fields){
        if(err) throw err;
        // console.log(result);
        var output = "";
        for (var i in result){
          output = output + OBJtoXML(result[i]);
        }
        res.setHeader('Authorization', 'Bearer csci2720');
        res.send(output);
      })
    }else{
      res.status(401).send("Unauthorized");
    }

  });


  //(2)
  //POST /api/locations - Add a new location
  router.post('/locations', function(req, res) { 
    const {businessid, name, lon, lat, photo, price, review, rating} = req.body;
    console.log(req.body.location.name[0]);
    // console.log(req.body);
    if(req.headers['authorization']==='Bearer csci2720' || req.headers['Authorization']==='Bearer csci2720'){
        let sql = "INSERT INTO `innodb`.`business` (`businessid`,`name`,`lat`,`lon`,`photo`,`price`,`review`,`rating`) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), lon = VALUES(lon), lat = VALUES(lat), photo = VALUES(photo), price = VALUES(price), review = VALUES(review), rating = VALUES(rating)";
        
        connection.query(sql, [req.body.location.businessid[0], req.body.location.name[0], req.body.location.lat[0], req.body.location.lon[0], "",req.body.location.price[0], req.body.location.review[0], req.body.location.rating[0]], function(err, result, fields){
          if (err) throw err;
        
          var URI = req.protocol + '://' + req.get('host') +"/api/locations/"+req.body.location.businessid[0] ;
          res.setHeader('Authorization', 'Bearer csci2720');
          res.setHeader('Location', URI);
          res.send("Added a location");
      })
    }else{
      res.status(401).send("Unauthorized");
    }
  });



  //(3) 
  //GET /api/locations/loc-id - Retrieve a location
  router.get('/locations/:locid', function(req, res, next) {
    console.log(req.params['locid']);
    if(req.headers['authorization']==='Bearer csci2720' || req.headers['Authorization']==='Bearer csci2720'){

      let sql = "SELECT * FROM `business` WHERE business.businessid='"+ req.params['locid']+"'";
    
      connection.query(sql, function(err, result, fields){
        if (err) throw err;
        
        output = OBJtoXML(result);

        res.setHeader('Authorization', 'Bearer csci2720');
        res.send(output);
      })

    }else{
      res.status(401).send("Unauthorized");
    }
  });



  //(4)
  //PUT /api/locations/loc-id - Update a location
  router.put('/locations/:locid', function(req, res) {
    console.log(req.body);
  
    console.log(req.params['locid']);
    if(req.headers['authorization']==='Bearer csci2720' || req.headers['Authorization']==='Bearer csci2720'){

      let sql = "UPDATE `business` SET business.name ='"+req.body.location.name[0] + "', business.lon=" + req.body.location.lon[0] + ", business.lat="+req.body.location.lat[0]+", business.price='"+req.body.location.price[0]+ "', business.review="+req.body.location.review[0]+", business.rating="+req.body.location.rating[0]+" WHERE business.businessid='"+req.params['locid']+"'";
  
      connection.query(sql, function(err, result, fields){
        if(err) throw err;
        
        res.setHeader('Authorization', 'Bearer csci2720');
        res.send("Update successfully.");
      })
    }else{
      res.status(401).send("Unauthorized");
    }

  });



  //(5)
  //DELETE /api/locations/loc-id - Delete a location
  router.delete('/locations/:locid', function(req, res) {
    console.log(req.params['locid']);
    if(req.headers['authorization']==='Bearer csci2720' || req.headers['Authorization']==='Bearer csci2720'){
      
      let sql = "DELETE FROM `innodb`.`business` WHERE businessid ='" + req.params['locid'] +"'";

      connection.query(sql, function(err, result, fields){
          if(err) throw err;
          
          res.setHeader('Authorization', 'Bearer csci2720');
          res.send("Delete Successfully.");
      })
    }else{
      res.status(401).send("Unauthorized");
    }
  });


  router.all('/*', function(req, res, next){
    res.status(404).send("This incident will be reported.");
  })

  module.exports = router;