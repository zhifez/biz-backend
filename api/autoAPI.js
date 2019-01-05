var _					= require ( 'lodash' );
	helper				= require ( '../helpers/helper' );

	Token				= require ( '../models' ).Token;

module.exports = 
{
	tokens: function ( req, res )
	{
		var _count = 0;
		var _query = 
		{
			campaignDeleted: false,
			campaignExpired: true,
			campaignCompleted: false
		};
		Campaign.find ( _query, function ( err, data )
		{
			if ( err )
				throw err;

			async.each ( data, function ( element, next )
			{
				var _tokenQuery = 
				{
					tokenUser: element.campaignCreatedBy,
					tokenCampaign: element._id
				};
				Token.findOne ( _tokenQuery, function ( err, data )
				{
					if ( err )
						throw err;
						
					if ( data )
					{
						// TODO : if token is unclaimed, convert it to real token, update it to claimed; need to wait for the real token system to be finalized tho
						next ();
					}
					else
					{
						Influence.find ( { influenceCampaign: element._id }, function ( err, data )
						{
							if ( err )
								throw err;

							var _sharesLeft = ( element.campaignInfluence - data.length ) / element.campaignInfluence;
								_damageTRVC = element.campaignReward * _sharesLeft;
								_token = _damageTRVC * element.campaignRateTRVC;
							++_count;
							var _newToken = new Token 
							( {
								tokenUser: element.campaignCreatedBy,
								tokenCampaign: element._id,
								tokenRawAmount: _token
							} );
							_newToken.save ( function ( err )
							{
								next ();
							} );
						} );
					}
				} );
			}, function ( err )
			{
				res.send ( _count + ' failed campaign converted to token' );
			} );
		} );
	}
}