var express = require("express");
var router = express.Router();
'use strict';
 
const yelp = require('yelp-fusion');
const client = yelp.client('yelp-api-key-here');
 

router.get("/", function(req, res, next) {
	
	client.search({
	  latitude: 22.418498326,
	  longitude: 114.204074184,
	  radius: 1000,
	  location: 'hong kong',
	}).then(response => {
	  
	  res.send(response.jsonBody);

	}).catch(e => {
	  console.log(e);
	});
});

module.exports = router;