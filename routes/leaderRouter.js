var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Leaders = require('../models/leadership');
var Verify = require('./verify');

var leadershiptRouter = express.Router();

leadershiptRouter.use(bodyParser.json());


leadershiptRouter.route('/')
.get(function(req,res,next){
    Leaders.find(req.query,function (err,leader) {
        console.log('Entre aqui'+JSON.stringify(leader));
        if (err) next(err);
        res.json(leader);
    });
})
;

leadershiptRouter.route('/:leaderId')
.get(function(req,res,next){
    Leaders.findById(req.params.dishId,function (err,leader) {
       if(err) next(err);
       res.json(leader);
    })
})
/*.put(function(req, res, next){
        res.write('Updating the leader: ' + req.params.leaderId + '\n');
    res.end('Will update the leader: ' + req.body.name + 
            ' with details: ' + req.body.description);
})
.delete(function(req, res, next){
        res.end('Deleting leader: ' + req.params.leaderId);
});*/

module.exports = leadershiptRouter;