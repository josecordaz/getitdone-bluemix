// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// pomodoroSchema
var pomodoroSchema = new Schema({
	timeDate:{
		type:Date,
		required:true
	}
});

// taskSchema
var taskSchema = new Schema(
	{
		description :{
			type:String,
			unique:true,
			required:true
		},
		startDate :{
			type:Date,
			required:true
		},
		daysWeek:{
			type:Array,
			required:true
		},
		pomodorosPerDay:{
			type:Number,
			required:true
		},
		workedPomodoros:{
			type:[pomodoroSchema]
		}
	}
)

// goal Schema
var goalSchema = new Schema(
	{
		user:{
			type: mongoose.Schema.Types.ObjectId,
			ref : 'User'
		},
		description:{
			type:String,
			required:true
		},
		dueDate:{
			type:Date,
			required:true
		},
		tasks:[taskSchema]
	},{
		timestamps:true
	}
);

goalSchema.index({user: 1, description: 1}, {unique: true});

// the schema it useless so far
// we need to create a model using it
var Goals = mongoose.model('Goal',goalSchema);

// make this available to our Node application
module.exports = Goals;