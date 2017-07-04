var Verify    = require('./verify');
var express = require('express');
var router = express.Router();
var activityController = require('../controller/activityController');

router.post('/search', function(req, res) {
	console.log('look for'+req.body.name+req.body.followerId);
	activityController.searchFor(req.body.followerId,req.body.name,function(result){
		return res.json(result);
	});
});



module.exports = router;