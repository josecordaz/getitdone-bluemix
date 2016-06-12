// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

// create a schema
var promotionSchema = new Schema(
	{
		name:{
			type:String,
			required:true,
			unique:true
		},
		image:{
			type:String,
			required:true,
			unique:true
		},
		label:{
			type:String,
			default:''
		},
		price:{
			type:Currency,
			required:true
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
var Promotions = mongoose.model('Promotion',promotionSchema);

// make this available to our Node application
module.exports = Promotions;