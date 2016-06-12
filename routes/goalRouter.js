var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Goal = require('../models/goal');
var Verify = require('./verify');

router.route('/')
.get(Verify.verifyOrdinaryUser,function(req, res, next) {
  Goal.find({"user":req.decoded._id},function(err,user){
        if (err) return next(err);
        res.json(user);
    });
})
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
      res.end('Added the goal with id: ' + id);
    }
  });
})
.delete(Verify.verifyOrdinaryUser,function(req,res,next){
   Goal.findByIdAndRemove(req.query.goalId, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});
//post = update
router.route('/:goalId/tasks/:taskId')
.post(function (req, res, next) {
  Goal.findById(req.params.goalId, function (err, goal) {
    if (err) next(err);
    goal.tasks.push(req.body);
    goal.save(function (err, goal) {
      if (err) next(err);
        console.log('Updated Comments!');
        res.json(goal);
      });
    });
}).delete(function(req,res,next){
  Goal.findById(req.params.goalId, function (err, goal) {
    if (err) next(err);
    var tasks = goal.tasks;

    goal.tasks = tasks.reduce(function(pv,cv,ci){
      if(cv.id!==req.params.taskId){
        pv.push(cv);
      }
      return pv;
    },[]);

    goal.save(function (err, goal) {
      if (err) next(err);
        console.log('Updated Comments!');
        res.json(goal);
      });
    });
});

router.route('/:goalId/tasks/:taskId/pomodoro/:idPomodoro')
.post(function (req, res, next) {
    Goal.findById(req.params.goalId, function (err, goal) {
        if (err) next(err);
        goal.tasks = goal.tasks.map(task=>{
          if(task.id === req.params.taskId){
            task.workedPomodoros.push({timeDate:new Date()});
          }
          return task;
        });

        goal.save(function (err, goal) {
            if (err) next(err);
            console.log('Updated Comments!');
            res.json(goal);
        });
    });
});


module.exports = router;