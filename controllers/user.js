var HomeCon				= require ( './home' );

	Campaign 			= require ( '../models' ).Campaign;
	User 				= require ( '../models' ).User;
	Influence 			= require ( '../models' ).Influence;
	Token 				= require ( '../models' ).Token;

var getToken = function ( userId, callback )
{
	var _token = 0;
	Token.find ( { tokenUser: userId }, function ( err, data )
	{
		if ( err )
			throw err;
			
		_.each ( data, function ( element, index )
		{
			_token += element.tokenAmount;
		} );
		callback ( _token );
	} );
}

module.exports = 
{
	index: function ( req, res )
	{
		HomeCon.initViewModel ( req, res, function ( viewModel )
		{
			getToken ( viewModel.user, function ( token )
			{
				viewModel.totalToken = token;
				User.findOne ( { _id: viewModel.user }, function ( err, data )
				{
					if ( err )
						throw err;
					
					if ( data )
					{
						viewModel.user = data;
						res.render ( 'user', viewModel );
					}
					else
						res.redirect ( '/signin' );
				} );
			} );
		} );	
	},
	campaign: function ( req, res )
	{
		HomeCon.initViewModel ( req, res, function ( viewModel )
		{
			var _query = 
			{
				campaignCreatedBy: viewModel.user,
				campaignDeleted: false
			};
			Campaign.find ( _query, {}, { sort: { campaignUpdated: 1 } }, function ( err, data )
			{
				if ( err )
					throw err;
				
				viewModel.campaigns = data;
				async.each ( viewModel.campaigns, function ( element, callback )
				{
					Campaign.getUserInfluences ( element, viewModel.user, function ( data )
					{
						Campaign.getTotalInfluences ( data, function ( data )
						{
							if ( data.campaignCreatedBy === viewModel.user )
							{
								data.campaignCreatedBy = 'You';
								callback ();
							}
							else
							{
								Campaign.getCreator ( data, function ( data )
								{
									callback ();
								} );
							}
						} );
					} );
				}, function ( err )
				{
					res.render ( 'user-campaign', viewModel );
				} );
			} );
		} );
	}
}