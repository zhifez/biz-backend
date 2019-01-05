var helper 			= require ( '../helpers/helper' );
	fs 				= require ( 'fs' );
	owasp			= require ( 'owasp-password-strength-test' );
	_				= require ( 'lodash' );
	emailValidator	= require ( 'email-validator' );

	User 			= require ( '../models' ).User;
	
	passportJWT		= require ( 'passport-jwt' );
	jwt 			= require ( 'jsonwebtoken' );
	ExtractJwt 		= passportJWT.ExtractJwt;
	jwtOptions		= {};
	jwtOptions.secretOrKey = new Buffer ( 'bizInfluenceSecretKey', 'base64' );

module.exports = 
{
	index: function ( req, res )
	{
		var _query = 
		{
			// userBanned: false
		}

		// var _data = helper.filterReqData ( req.body );
		User.find ( _query, {}, { sort: { 'userUpdated' : 1 } }, function ( err, data )
		{
			if ( err )
				throw err;

			if ( data.length <= 0 )
			{
				res.json 
				( {
					message: 'No user available',
					success: false,
					data: data
				} );
			}
			else
			{
				res.json
				( {
					message: data.length + ' users listed',
					success: true,
					data: data
				} );
			}
		} );
	},
	create: function ( req, res )
	{
		var _userName = req.body.userName;
			_userEmail = req.body.userEmail;
			_userAgreement = req.body.userAgreement;

		if ( _userName == undefined 
			|| _userEmail == undefined )
		{
			res.json 
			( {
				message: 'Username/email cannot be empty',
				success: false
			} );
			return;
		}

		var _split = _userName.split ( ' ' );
		if ( _split.length > 1 )
		{
			res.json 
			( {
				message: 'Your username must not contain spaces',
				success: false
			} );
			return;
		}
		
		if ( !emailValidator.validate ( _userEmail ) )
		{
			res.json 
			( {
				message: 'Invalid email',
				success: false
			} );
			return;
		}

		if ( _userAgreement == undefined )
		{
			res.json 
			( {
				message: 'You are required to agree to our Terms of Use',
				success: false
			} );
			return;
		}

		User.find ( { $or: [ { userName: _userName }, { userEmail: _userEmail } ] }, function ( err, data )
		{
			if ( err )
				throw err;
			
			if ( data.length > 0 )
			{
				res.json 
				( {
					message: 'Username/email is already used.',
					success: false,
					error: err
				} );
			}
			else
			{
				var _user = new User ( req.body );
				_user.save ( function ( err, data )
				{
					if ( err )
					{
						res.json 
						( {
							message: 'Add User failed',
							success: false,
							error: err
						} );
					}
					else
					{
						var payload = { id: data._id };
							token = jwt.sign ( payload, jwtOptions.secretOrKey );
						res.json 
						( {
							message: 'Add User success',
							success: true,
							token: token
						} );
					}
				} );
			}
		} );
	},
	get: function ( req, res )
	{
		User.findOne ( { $or: [ { _id: req.params.id }, { userName: req.params.id } ] }, function ( err, data )
		{
			if ( err )
				throw err;
			
			if ( data )
			{
				res.json 
				( {
					message: 'Get User success',
					success: true,
					data: data
				} );
			}
			else
			{
				res.json 
				( {
					message: 'Get User failed',
					success: false,
					error: err
				} );
			}
		} );
	},
	update: function ( req, res )
	{
		if ( req.body.userEmail != undefined
			&& !emailValidator.validate ( req.body.userEmail ) )
		{
			res.json 
			( {
				message: 'Email is invalid',
				success: false,
				error: err
			} );
			return;
		}

		var _query = 
		{
			_id: req.params.id
		};

		var _disableChange = [ '_id', 'userCreated', 'userUpdated', 'userAddress', 'userEarning' ],
			reqData = helper.filterReqData ( req.body, _disableChange );
		
		User.findOne ( _query, function ( err, userData )
		{
			if ( err )
				throw err;

			if ( userData )
			{
				var invalidUpdate = undefined;
				async.times ( 1, function ( index, next )
				{
					if ( req.body.userEmail != undefined )
					{
						User.findOne ( { userEmail: req.body.userEmail }, function ( err, data )
						{
							if ( err )
								throw err;

							if ( data && data._id != _query._id )
							{
								console.log ( 'EMAIL-USER', 
								{
									name: data.userName,
									idCheck: data._id + ', ' + _query._id,
									isThisUser: ( data._id === _query._id )
								} );
								invalidUpdate = 'Email is already in use';
							}
							next ();
						} );
					}
					else
						next ();
				}, function ( err )
				{
					if ( invalidUpdate != undefined ) res.json 
					( {
						message: invalidUpdate,
						success: false
					} );
					else
					{
						User.update ( _query, reqData, function ( err, data )
						{
							if ( err )
								throw err;

							res.json 
							( {
								message: 'User updated successfully',
								success: true,
								data: helper.updateData ( userData, reqData )
							} );
						} );
					}
				} );
			}
			else
			{
				res.json 
				( {
					message: 'User cannot be found',
					success: false,
					error: err
				} );
			}
		} );
	},
	bookmark: function ( req, res )
	{
		var _query = 
		{
			_id: req.params.id
		};

		User.findOne ( _query, function ( err, data )
		{
			if ( err )
				throw err;
			
			if ( data == null )
			{
				res.json 
				( {
					message: 'User not found',
					success: false,
					error: err
				} );
			}
			else
			{
				var _campaign = req.params.campaignId;
				if ( data.userBookmarks == undefined )
					data.userBookmarks = [];
				var _index = data.userBookmarks.indexOf ( _campaign );
				var _action = 'Add';
				if ( _index < 0 )
					data.userBookmarks.push ( _campaign );
				else
				{
					_action = 'Remove';
					data.userBookmarks.splice ( _index, 1 );
				}
					
				User.update ( _query, data, function ( err, data )
				{
					if ( err )
						throw err;

					res.json 
					( {
						message: _action + ' Campaign bookmark successfully',
						success: true,
						action: _action
					} );
				} );
			}
		} );
	},
	signin: function ( req, res )
	{
		var _email = req.body.userEmail;
			_password = req.body.userPassword;
		
		User.findOne ( { userEmail: _email }, function ( err, data )
		{
			if ( !data )
			{
				res.status ( 404 ).json 
				( { 
					message: 'This user does not exist!',
					success: false 
				} );
			}
			else
			{
				User.comparePassword ( _password, data.userPassword, function ( err, matched ) 
				{
					if ( err )
						throw err;

					if ( matched )
					{
						var payload = { id: data._id };
							token = jwt.sign ( payload, jwtOptions.secretOrKey );
						req.session.jwt = token;
						res.json 
						( {
							message: 'User authentication success!',
							success: true,
							token: token
						} );
					}
					else
					{
						res.json 
						( {
							message: 'Incorrect password.',
							success: false,
							error: 401
						} );
					}
				} );
			}
		} );
	},
	signout: function ( req, res )
	{
		req.session.destroy ();
		res.send ( {} );
	},
	admin: function ( req, res )
	{
		var _pass = 
		[
			'thunderlab123',
			'acqxelteam123'	
		];
		if ( _pass.indexOf ( req.params.id ) >= 0 )
		{
			var payload = { admin: req.params.id };
				token = jwt.sign ( payload, jwtOptions.secretOrKey );
			res.json 
			( {
				message: 'Authentication success',
				success: true,
				token: token
			} );
		}
		else
		{
			res.json 
			( {
				message: 'Authentication failed',
				success: false
			} );
		}
	}
}