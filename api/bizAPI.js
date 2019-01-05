var configjs			= require ( '../config.js' );
	bizapp 				= require ( 'bizapp' );
	biz 				= bizapp ( { appId: configjs.appId } );

	User				= require ( '../models' ).User;
	Transaction			= require ( '../models' ).Transaction;
	
	passportJWT			= require ( 'passport-jwt' );
	jwt 				= require ( 'jsonwebtoken' );
	ExtractJwt 			= passportJWT.ExtractJwt;
	jwtOptions			= {};
	jwtOptions.secretOrKey = new Buffer ( 'bizInfluenceSecretKey', 'base64' );

module.exports = 
{
	login : biz.Express ( {}, function ( result, res )
	{
		if ( result.err ) 
		{
			console.log ( 'User failed to log in, error : ' + result.err );
			return res.send ( {} );
		}

		User.findOne ( { userAddress: result.address }, function ( err, data )
		{
			if ( err )
				throw err;

			if ( data )
			{
				var payload = { id: data._id };
					token = jwt.sign ( payload, jwtOptions.secretOrKey );
				res.json 
				( {
					message: 'User logged in!',
					success: true,
					token: token
				} );
			}
			else
			{
				res.json 
				( {
					message: 'User not found.',
					success: false,
					address: result.address
				} );
			}
		} );
	} ),
	verifyPayment : function ( req, res )
	{
		var options = 
		{
			trxId: req.body.txid,
			toAddress: req.body.toAddress,
			amount: req.body.amount,
			minConfirmations: 6,
			// testnet: true // TODO: remove this when not using testnet
		};

		Transaction.findOne ( { transactionId: options.trxId }, function ( err, data )
		{
			if ( err )
				throw err;
				
			if ( data )
			{
				res.json 
				( {
					message: 'Payment is invalid, transaction ID already exist.',
					success: false
				} );
			}
			else
			{
				var _trx = new Transaction 
				( { 
					transactionId: options.trxId,
					transactionToAddress: options.toAddress,
					transactionAmount: options.amount
				} );
				_trx.save ( function ( err, data )
				{
					biz.verify ( options, ( error, result ) => 
					{
						if ( !error && result ) 
						{
							res.json 
							( {
								message: 'Payment is valid!',
								success: true,
								data: data
							} );
						} 
						else 
						{
							res.json 
							( {
								message: 'Payment is invalid!',
								success: true,
								data: data
							} );
						}
					} );
				} );
			}
		} );
	},
	yellow: function ( req, res )
	{
		var _id = req.params.id;
			validIds = 
			[
				'thunderlab123',
				'acqxelteam123',
				'bizInfluence123'
			];
		if ( validIds.indexOf ( _id ) >= 0 )
		{
			res.json 
			( {
				message: 'Employee login success',
				success: true
			} );
		}
		else 
		{
			res.json 
			( {
				message: 'Employee login failed : Invalid ID',
				success: false
			} );
		}
	}
}