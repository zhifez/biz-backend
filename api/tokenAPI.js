var _					= require ( 'lodash' );

	Token				= require ( '../models' ).Token;

module.exports = 
{
	index: function ( req, res )
	{
		Token.find ( {} )
		.populate ( 'tokenUser' )
		.populate ( 'tokenCampaign' )
		.exec ( function ( err, data )
		{
			if ( err )
				throw err;

			async.each ( data, function ( element, next )
			{
				Influence.find ( { influenceCampaign: element.tokenCampaign._id }, function ( err, data )
				{
					if ( err )
						throw err;
						
					console.log ( 'TOKEN_' + element._id + ': ', data.length + '/' + element.tokenCampaign.campaignInfluence );
					next ();
				} );
			}, function ( err )
			{
				res.json 
				( {
					message: data.length + ' tokens listed',
					success: true,
					data: data
				} );
			} );
		} );
	},
	clear: function ( req, res )
	{
		Token.remove ( {}, function ( err )
		{
			if ( err )
				throw err;

			Token.find ( {}, function ( err, data )
			{
				if ( err )
					throw err;
					
				res.json 
				( {
					message: 'Tokens cleared',
					success: true,
					data: data
				} );
			} );
		} );
	}
}