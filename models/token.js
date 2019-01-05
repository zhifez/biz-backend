var mongoose 			= require ( 'mongoose' );
	Schema 				= mongoose.Schema;
	configjs			= require ( '../config.js' );
	bizapp 				= require ( 'bizapp' );
	biz 				= bizapp ( { appId: configjs.appId } );
	helper				= require ( '../helpers/helper' );

var TokenSchema = new Schema 
( {
	_tokenId: Schema.Types.ObjectId,
	tokenUser:
	{
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true	
	},
	tokenCampaign:
	{
		type: Schema.Types.ObjectId,
		ref: 'Campaign',
		required: true
	},
	tokenRawAmount:
	{
		type: Number,
		required: true
	},
	tokenClaimed:
	{
		type: Boolean,
		required: true,
		default: false
	}
} );

// get variable
TokenSchema.virtual ( 'tokenAmount' ).get ( function ()
{
	return this.tokenRawAmount; // times 10 if change of mind later
} );

// TokenSchema.pre ( 'validate', function ( _next ) 
// {
// 	// this.constructor.find (); // find functions
// 	_next ();
// });

module.exports = mongoose.model ( 'Token', TokenSchema );