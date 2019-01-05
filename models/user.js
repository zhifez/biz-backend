var mongoose 			= require ( 'mongoose' );
	Schema 				= mongoose.Schema;
	path 				= require ( 'path' );
	moment 				= require ( 'moment' );
	bcryptjs			= require ( 'bcryptjs' );

var UserSchema = new Schema 
( {
	_userId: Schema.Types.ObjectId,
	userName:
	{
		type: String,
		required: true
	},
	userTitle:
	{
		type: String,
		required: true
	},
	userAbout:
	{
		type: String,
		required: false
	},
	userEmail:
	{
		type: String,
		required: true
	},
	userPassword:
	{
		type: String,
		required: false
	},
	userAddress:
	{
		type: String,
		required: true
	},
	userBookmarks:
	{
		type: [String],
		required: false
	},
	userEarning:
	{
		type: Number,
		required: false,
		default: 0
	},
	userImage:
	{
		type: String,
		required: false
	},
	userCreated:
	{
		type: Date,
		required: true,
		default: Date.now
	},
	userUpdated:
	{
		type: Date,
		required: true,
		default: Date.now
	}
} );

// get variable
// UserSchema.virtual ( 'variableName' ).get ( function ()
// {
// 	return _value;
// } );

// get set variable
// UserSchema.virtual ( 'variableName' ).set ( function ( _param )
// {
// 	this._param = _param;
// } ).get ( function ()
// {
// 	return this._param;
// } );

// UserSchema.methods.methodName = function ( _param )
// {
// 	return _value;
// }

UserSchema.methods.updateDate = function () 
{
	var _currentDate = new Date ();

	this.userUpdated = _currentDate;
	if ( !this.userCreated )
		this.userCreated = _currentDate;

	return _currentDate;
}

UserSchema.pre ( 'validate', function ( _next ) 
{
	if ( !this.userTitle || this.userTitle.length <= 0 )
		this.userTitle = this.userName;
		
	// do actions here before validation begin
	this.updateDate ();
	
	// this.constructor.find (); // find functions
	_next ();
});

module.exports = mongoose.model ( 'User', UserSchema );
module.exports.createUser = function ( newUser, callback ) 
{
	bcryptjs.genSalt ( 10, function ( err, salt )
	{
		bcryptjs.hash ( newUser.userPassword, salt, function ( err, hash )
		{
			var _newUserResources = newUser;
			_newUserResources.userPassword = hash;
			_newUserResources.save ( callback );
		} );	
	} );
};
module.exports.comparePassword = function ( password, hash, callback )
{
	bcryptjs.compare ( password, hash, function ( err, result )
	{
		if ( err )
			throw err;
		callback ( null, result );	
	} );
};
module.exports.campaignIsBookmarked = function ( userId, campaignId, callback )
{
	User.findOne ( { _id: userId }, function ( err, data )
	{
		if ( err )
			throw err;
			
		if ( data
			&& data.userBookmarks != undefined 
			&& data.userBookmarks.indexOf ( campaignId ) >= 0 )
			callback ( true );
		else
			callback ( false );
	} );
};