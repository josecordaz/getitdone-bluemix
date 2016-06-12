var express = require('express');
var bodyParser = require('body-parser');

var Favorites = require('../models/favorites');
var Verify = require('./verify');

var favoritesRouter = express.Router();
favoritesRouter.use(bodyParser.json());
favoritesRouter.route('/')
.get(Verify.verifyOrdinaryUser,function(req,res,next){
    Favorites.find({},function(err,favorite){
        if (err) next(err);
        res.json(favorite);
    });
})
.post(Verify.verifyOrdinaryUser,function(req, res, next){
    Favorites.create(req.body,function(err,favorite){
      if (err) next(err);
      /*if(err) {
        res.write(''+err);
      };*/

      console.log('Favorite created!');
      var id = favorite._id;
      res.writeHead(200,{
        'Content-Type':'text/plain'
      });

      res.end('Added the favorite with id: '+id)
    });
});

module.exports = favoritesRouter;