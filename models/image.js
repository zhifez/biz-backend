var mongoose 			= require ( 'mongoose' );
	Schema 				= mongoose.Schema;
	moment 				= require ( 'moment' );
	helper				= require ( '../helpers/helper' );

var ImageSchema = new Schema 
( {
	_imageId: Schema.Types.ObjectId,
	imageName:
	{
		type: String,
		required: true
	},
	imageUser:
	{
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	imageCreated:
	{
		type: Date,
		required: true,
		default: Date.now
	}
} );

ImageSchema.methods.updateDate = function () 
{
	var _currentDate = new Date ();

	if ( !this.imageCreated ) 
		this.imageCreated = _currentDate;

	return _currentDate;
}

ImageSchema.pre ( 'validate', function ( _next ) 
{
	// do actions here before validation begin
	this.updateDate ();
	
	// this.constructor.find (); // find functions
	_next ();
});

module.exports = mongoose.model ( 'Image', ImageSchema );