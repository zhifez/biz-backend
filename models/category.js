var mongoose 			= require ( 'mongoose' );
	Schema 				= mongoose.Schema;
	moment 				= require ( 'moment' );
	helper				= require ( '../helpers/helper' );

var CategorySchema = new Schema 
( {
	_categoryId: Schema.Types.ObjectId,
	categoryName:
	{
		type: String,
		required: true
	},
	categorySlug:
	{
		type: String,
		required: true
	},
	categoryCreated:
	{
		type: Date,
		required: true,
		default: Date.now
	},
	categoryUpdated:
	{
		type: Date,
		required: true,
		default: Date.now
	}
} );

CategorySchema.index ( { '$**': 'text' } );

// get variable
// CategorySchema.virtual ( 'variableName' ).get ( function ()
// {
// 	return '';
// } );

// get set variable
// CategorySchema.virtual ( 'variableName' ).set ( function ( _param )
// {
// 	this._param = _param;
// } ).get ( function ()
// {
// 	return this._param;
// } );

CategorySchema.methods.updateDate = function () 
{
	var _currentDate = new Date ();

	this.categoryUpdated = _currentDate;
	if ( !this.categoryCreated ) 
		this.categoryCreated = _currentDate;

	return _currentDate;
}

CategorySchema.pre ( 'validate', function ( _next ) 
{
	this.categorySlug = helper.convertToSlug ( this.categoryName );

	// do actions here before validation begin
	this.updateDate ();
	
	// this.constructor.find (); // find functions
	_next ();
});

module.exports = mongoose.model ( 'Category', CategorySchema );
module.exports.getAll = function ( callback )
{
	Category.find ( {}, null, { sort: { categoryName: 1 } }, function ( err, data )
	{
		if ( err )
			throw err;

		callback ( data );
	} );
}