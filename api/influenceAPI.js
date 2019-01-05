var helper 				= require ( '../helpers/helper' );
	fs 					= require ( 'fs' );
	socialShare 		= require ( 'social-share' );
	requestIp 			= require ( 'request-ip' );
	
	Campaign 			= require ( '../models' ).Campaign;
	Influence 			= require ( '../models' ).Influence;

module.exports = 
{
	index: function ( req, res )
	{
		Influence.find ( {}, function ( err, data )
		{
			if ( err )
				throw err;
			
			if ( data.length <= 0 )
			{
				res.json 
				( {
					message: 'No influence available',
					success: false,
					data: data
				} );
			}
			else
			{
				res.json
				( {
					message: data.length + ' influences listed',
					success: true,
					data: data
				} );
			}
		} );
	},
	create: function ( req, res )
	{
		var _query = 
		{
			_id: req.body.influenceCampaign,
			campaignSuspended: false,
			campaignDeleted: false
		}
		
		Campaign.findOne ( _query, function ( err, campaignData )
		{
			if ( err )
				throw err;

			if ( campaignData )
			{
				if ( campaignData.campaignExpiry <= 0 )
				{
					res.json 
					( {
						message: 'Campaign is already expired.',
						success: false
					} );
				}
				else
				{
					var setupInfluence = function ()
					{
						_query = 
						{
							influenceType: req.body.influenceType,
							influenceCampaign: req.body.influenceCampaign,
							influenceUser: req.body.influenceUser
						};
						Influence.find ( _query, function ( err, data )
						{
							if ( err )
								throw err;

							if ( data.length > 0 )
							{
								res.json 
								( {
									message: 'Campaign is already influenced by user!',
									success: true,
									data: data[0],
									campaignName: campaignData.campaignName
								} );
							}
							else
							{
								Influence.find ( { influenceCampaign: req.body.influenceCampaign }, function ( err, data )
								{
									if ( data.length >= campaignData.campaignInfluence )
									{
										res.json 
										( {
											message: 'Campaign has reached its target!',
											success: false
										} );
									}
									else
									{
										var _influence = new Influence ( _query );
										_influence.influenceViews = [];
										_influence.influenceViews.push ( requestIp.getClientIp ( req ) );
										_influence.save ( function ( err, data )
										{
											if ( err )
												throw err;

											setupInfluence ();
											
											// res.json 
											// ( {
											// 	message: 'Add Influence success',
											// 	success: true,
											// 	data: data
											// } );
										} );
									}
								} );
							}
						} );
					}
					setupInfluence ();
				}
			}
			else
			{
				res.json 
				( {
					message: 'Campaign not found',
					success: false
				} );
			}
		} );
	},
	get: function ( req, res )
	{
		Influence.findOne ( { _id: req.params.id }, function ( err, data )
		{
			if ( err )
				throw err;
			
			if ( data )
			{
				res.json 
				( {
					message: 'Get Influence success',
					success: true,
					data: data
				} );
			}
			else
			{
				res.json 
				( {
					message: 'Get Influence failed',
					success: false,
					error: err
				} );
			}
		} );
	}
}