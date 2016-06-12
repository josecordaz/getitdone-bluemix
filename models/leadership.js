// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var leaderSchema = new Schema(
	{
		name:{
			type:String,
			required:true,
			unique:true
		},
		image:{
			type:String,
			required:true
		},
		designation:{
			type:String,
			required:true,
			unique:true
		},
		abbr:{
			type:String,
			required:true,
			unique:true
		},
		description:{
			type: String,
			required: true
		},
		featured:{
			type:Boolean,
			default:false
		}
	},{
		timestamps:true
	}
);

// the schema it useless so far
// we need to create a model using it
var Leadership = mongoose.model('Leader',leaderSchema);

// make this available to our Node application
module.exports = Leadership;