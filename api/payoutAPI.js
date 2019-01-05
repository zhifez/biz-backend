var _					= require ( 'lodash' );
	helper 				= require ( '../helpers/helper' );

	User				= require ( '../models' ).User;
	Payout				= require ( '../models' ).Payout;

module.exports = 
{
	all: function ( req, res )
	{
		Payout.find ( {}, function ( err, data )
		{
			if ( err )
				throw err;
			
			res.json 
			( {
				message:  data.length + ' Payouts listed',
				success: true,
				data: data
			} );
		} );
	},
	add: function ( req, res )
	{
		User.findOne ( { _id: req.body.payoutUser }, function ( err, userData )
		{
			if ( err )
				throw err;
				
			Payout.findOne ( { payoutAddress: userData.userAddress, payoutComplete: false }, function ( err, data )
			{
				if ( err )
					throw err;
				
				if ( data )
				{
					res.json 
					( {
						message: 'A payout application by this user is currently being processed.',
						success: false
					} );
				}
				else
				{
					Payout.getMinWithdrawalTRVC ( function ( trvc )
					{
						if ( userData.userEarning >= trvc )
						{
							if ( req.body.payoutAmount >= trvc )
							{
								var _new = new Payout ( req.body );
								_new.payoutAddress = userData.userAddress;
								_new.save ( function ( err, data )
								{
									if ( err )
										throw err;

									helper.slackMsg 
									( 
										'[PAYOUT] New Payout: ' + _new.payoutAmount + ' TRVC requested by ' +
										_new.payoutUser
									);
				
									res.json 
									( {
										message: 'Add Payout success',
										success: true,
										data: data
									} );
								} );
							}	
							else res.json 
							( {
								message: 'Payout amount is less than the minimum withdrawal limit (' + trvc + ' TRVC).',
								success: false
							} );
						}
						else res.json 
						( {
							message: 'Your current earning (' + userData.userEarning + ' TRVC) is less than the minimum withdrawal limit (' + trvc + ' TRVC).',
							success: false
						} ); 
					} );
				}
			} );
		} );
	},
	update: function ( req, res )
	{
		var _query = 
		{
			_id: req.params.id
		};

		var _disableChange = [ '_id', 'payoutAddress', 'payoutAmount', 'payoutComplete', 'payoutDate' ],
			reqData = helper.filterReqData ( req.body, _disableChange );
		
		Payout.findOne ( _query, function ( err, payoutData )
		{
			if ( err )
				throw err;

			if ( payoutData )
			{
				Payout.update ( _query, reqData, function ( err, data )
				{
					if ( err )
						throw err;

					if ( data ) res.json 
					( {
						message: 'Payout updated successfully',
						success: true,
						data: helper.updateData ( payoutData, reqData )
					} );
					else res.json 
					( {
						message: 'Payout update failed',
						success: false,
						error: err
					} );
				} );
			}
			else res.json 
			( {
				message: 'Payout cannot be found',
				success: false,
				error: err
			} );

		} );
	},
	delete: function ( req, res )
	{
		var _query = 
		{
			_id: req.params.id
		};

		Payout.findOne ( _query, function ( err, payoutData )
		{
			if ( err )
				throw err;

			if ( payoutData )
			{
				Payout.deleteOne ( _query, function ( err )
				{
					if ( err )
						throw err;

					res.json 
					( {
						message: 'Payout delete successfully',
						success: true
					} );
				} );
			}
			else res.json 
			( {
				message: 'Payout cannot be found',
				success: false,
				error: err
			} );
		} );
	}
}