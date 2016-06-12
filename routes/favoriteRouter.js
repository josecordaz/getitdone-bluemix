var express = require('express');
var bodyParser = require('body-parser');

var Dishes = require('../models/dishes');
var Favorites = require('../models/favorites');
var Verify = require('./verify');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());
favoriteRouter.route('/')
.get(Verify.verifyOrdinaryUser,function(req,res,next){
	Favorites.find({"postedBy":req.decoded._id})
		.populate('postedBy')
        .populate('dishes')
        .exec(function (err, favoritePlate) {
	        if (err) return next(err);
        	res.json(favoritePlate[0]);
    });
})
.post(Verify.verifyOrdinaryUser,function(req, res, next){
	req.body.postedBy = req.decoded._id;
	Favorites.find({"postedBy":req.decoded._id},function(err,favoritePlate){
        if (err) return next(err);
        if (favoritePlate.length != 0){
        	var i = 0;
        	for (; i < (favoritePlate[0].dishes.length); i++) {
	            if(favoritePlate[0].dishes[i] == req.body._id){
	            	break;
	            }
	        }
	        if(i == favoritePlate[0].dishes.length){
            	favoritePlate[0].dishes.push({"_id":req.body._id});
            	Favorites.findByIdAndUpdate(favoritePlate[0]._id,{
			        $set:{dishes:favoritePlate[0].dishes}
			      },{
			        new : true
			      }, function(err,favoritePlate){
			        if (err) return next(err);
			        res.json(favoritePlate);
	 			});
            } else {
            	res.json(favoritePlate[0]);
            }
        } else {
        	req.body.dishes = [];
        	req.body.dishes.push({"_id":req.body._id});
        	Favorites.create(req.body,function(err,favoritePlate){
		      if (err) return next(err);
		      res.json(favoritePlate);
		    });
        }
    });
})
.delete(Verify.verifyOrdinaryUser,function(req,res,next){
	Favorites.find({"postedBy":req.decoded._id},function(err,resp1){
		Favorites.remove({"postedBy":req.decoded._id}, function (err, resp2) {
	        if (err) throw err;
	        res.json(resp1);
	    });
	})
});

favoriteRouter.route('/:idDish')
.delete(Verify.verifyOrdinaryUser,function(req,res,next){
	Favorites.find({"postedBy":req.decoded._id},function(err,favoritePlate){
    	if (err) return next(err);
    	favoritePlate[0].dishes.pull(req.params.idDish);
        favoritePlate[0].save(function (err, result) {
            if (err) throw err;
            res.json(result);
        });
	});
})

module.exports = favoriteRouter;