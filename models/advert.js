var mongoose 			= require ( 'mongoose' );
	Schema 				= mongoose.Schema;
	moment 				= require ( 'moment' );
	helper				= require ( '../helpers/helper' );

var AdvertSchema = new Schema 
( {
	_advertId: Schema.Types.ObjectId,
	advertName:
	{
		type: String,
		required: true
	},
	advertOwner:
	{
		type: String,
		required: true
	},
	advertImage:
	{
		type: String,
		required: true
	},
	advertLink:
	{
		type: String,
		required: true
	},
	advertCreated:
	{
		type: Date,
		required: true,
		default: Date.now
	},
	advertUpdated:
	{
		type: Date,
		required: true,
		default: Date.now
	},
	advertActive:
	{
		type: Boolean,
		required: true,
		default: true
	}
} );

AdvertSchema.methods.updateDate = function () 
{
	var _currentDate = new Date ();

	this.advertUpdated = _currentDate;
	if ( !this.advertCreated ) 
		this.advertCreated = _currentDate;

	return _currentDate;
}

AdvertSchema.pre ( 'validate', function ( _next ) 
{
	// do actions here before validation begin
	this.updateDate ();
	
	// this.constructor.find (); // find functions
	_next ();
});

module.exports = mongoose.model ( 'Advert', AdvertSchema );