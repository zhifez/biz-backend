var mongoose 			= require ( 'mongoose' );
	Schema 				= mongoose.Schema;
	helper 				= require ( '../helpers/helper' );

	User		 		= require ( './user' );
	Campaign 			= require ( './campaign' );

var MessageSchema = new Schema 
( {
	_messageId: Schema.Types.ObjectId,
	messageRecipient:
	{
		type: String,
		required: true
	},
	messageSender:
	{
		type: String,
		required: true
	},
	messageCode:
	{
		type: String,
		required: false
	},
	messageTitle:
	{
		type: String,
		required: true
	},
	messageContent:
	{
		type: String,
		required: true
	},
	messageViewed:
	{
		type: Boolean,
		required: true,
		default: false
	},
	messageCreated:
	{
		type: Date,
		required: true,
		default: Date.now
	}
} );

MessageSchema.methods.updateDate = function () 
{
	var _currentDate = new Date ();

	if ( !this.messageCreated ) 
		this.messageCreated = _currentDate;

	return _currentDate;
}

MessageSchema.pre ( 'validate', function ( _next ) 
{
	this.updateDate ();
	
	_next ();
} );

module.exports = mongoose.model ( 'Message', MessageSchema );
module.exports.getUserMessages = function ( user, callback )
{
	var _messages = 
	{
		data: [],
		unread: 0
	};
	
	Message.find ( { messageRecipient: user }, function ( err, data )
	{
		if ( err )
			throw err;

		_messages.data = data;
		_.each ( data, function ( element, index )
		{
			if ( !element.messageViewed )
				++_messages.unread;
		} );
		callback ( _messages );
	} );
}