var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Goal = require('../models/goal');
var Verify    = require('./verify');

/* GET users listing. */
router.route('/')
.get(Verify.verifyOrdinaryUser,/*Verify.verifyAdmin,*/function(req, res, next) {
  User.find({},function(err,user){
        if (err) return next(err);
        res.json(user);
    });
});

router.route('/goals')
.post(Verify.verifyOrdinaryUser,function(req,res,next){
  req.body.user = req.decoded._id;
  Goal.create(req.body, function (err, goal) {
    if (err) { 
      next(err);
    } else {
      console.log('Goal created!');
      var id = goal._id;
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      res.end('Added the dish with id: ' + id);
    }
  });
});

router.route('/register')
.post(function(req, res) {
    User.register(new User({ username : req.body.username }),
      req.body.password, function(err, user) {
        if (err) {
            return res.status(500).json({err: err});
        }

        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if(req.body.lastname) {
          user.lastname = req.body.lastname;
        }

        user.save(function(err,user){
            passport.authenticate('local')(req, res, function () {
              return res.status(200).json({status: 'Registration Successful!'});
          });
        });
    });
});

router.route('/login')
.post(function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
        
      var token = Verify.getToken({"username":user.username,"_id":user._id,"admin":user.admin});
      res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token
      });
    });
  })(req,res,next);
});


router.route('/logout')
.get(function(req, res) {
    req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
});

router.get('/facebook',passport.authenticate('facebook'),
  function(req,res){

});

router.get('/facebook/callback',function(req,res,next){
  passport.authenticate('facebook',function(err,user,info){
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user,function(err){
      if(err){
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }

      var token = Verify.getToken(user);

      res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token
      });
    });
  })(req,res,next);
});

module.exports = router;