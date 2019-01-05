var _					= require ( 'lodash' );
	async				= require ( 'async' );
	helper 				= require ( '../helpers/helper' );

	User				= require ( '../models' ).User;
	Message				= require ( '../models' ).Message;

module.exports = 
{
	all: function ( req, res )
	{
		Message.find ( {}, function ( err, data )
		{
			if ( err )
				throw err;
			
			res.json 
			( {
				message:  data.length + ' Messages listed',
				success: true,
				data: data
			} );
		} );
	},
	add: function ( req, res )
	{
		var addMessage = function ()
		{
			var _code = helper.generateSecretCode ( 20 );
			Message.findOne ( { messageCode: _code }, function ( err, data )
			{
				if ( err )
					throw err;

				if ( data )
					addMessage ();
				else
				{
					req.body.messageCode = _code;
					if ( req.body.messageRecipient === 'all' )
					{
						User.find ( {}, function ( err, data )
						{
							if ( err )
								throw err;

							data.push ( { _id: 'all' } );
							async.each ( data, function ( element, callback )
							{
								req.body.messageRecipient = element._id;
								var _new = new Message ( req.body );
								_new.save ( function ( err, data )
								{
									if ( err )
										throw err;
										
									callback ();
								} );
							}, function ( err )
							{
								if ( err )
									throw err;
									
								res.json 
								( {
									message: 'Add Message success',
									success: true
								} );
							} );
						} );
					}
					else
					{
						var _new = new Message ( req.body );
						_new.save ( function ( err, data )
						{
							if ( err )
								throw err;
								
							res.json 
							( {
								message: 'Add Message success',
								success: true,
								data: data
							} );
						} );
					}
				}
			} );
		}
		addMessage ();
	},
	get: function ( req, res )
	{
		var _query = 
		{
			_id: req.params.id
		};

		Message.findOne ( _query, function ( err, data )
		{
			if ( err )
				throw err;

			if ( data ) res.json 
			( {
				message: 'Message found',
				success: true,
				data: data
			} );
			else res.json 
			( {
				message: 'Message does not exist',
				success: false
			} );
		} );
	},
	getByUser: function ( req, res )
	{
		Message.getUserMessages ( req.params.user, function ( data )
		{
			res.json 
			( {
				message: 'Messages found',
				success: true,
				data: data
			} );
		} );
	},
	update: function ( req, res )
	{
		var _query = 
		{
			_id: req.params.id
		};

		var _disableChange = [ '_id', 'messageRecipient', 'messageSender', 'messageCreated' ],
			reqData = helper.filterReqData ( req.body, _disableChange );
		
		Message.update ( _query, reqData, function ( err, data )
		{
			if ( err )
				throw err;
				
			res.json 
			( {
				message: 'Message updated successfully',
				success: true,
				data: data
			} );
		} );
	},
	delete: function ( req, res )
	{
		var _query = 
		{
			_id: req.params.id
		};

		Message.findOne ( _query, function ( err, data )
		{
			if ( err )
				throw err;

			if ( data )
			{
				Message.deleteOne ( _query, function ( err )
				{
					if ( err )
						throw err;

					res.json 
					( {
						message: 'Message delete successfully',
						success: true
					} );
				} );
			}
			else res.json 
			( {
				message: 'Message cannot be found',
				success: false,
				error: err
			} );
		} );
	},
	deleteMany: function ( req, res )
	{
		var _query = 
		{
			messageCode: req.params.code
		};

		if ( req.params.user != 'admin' )
			_query.messageRecipient = req.params.user;

		Message.findOne ( _query, function ( err, data )
		{
			if ( err )
				throw err;

			if ( data )
			{
				Message.deleteMany ( _query, function ( err )
				{
					if ( err )
						throw err;

					res.json 
					( {
						message: 'Message delete successfully',
						success: true
					} );
				} );
			}
			else res.json 
			( {
				message: 'Message cannot be found',
				success: false,
				error: err
			} );
		} );
	}
}