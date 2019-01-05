var campaign			= {};
	_ 					= require ( 'lodash' );
	async				= require ( 'async' );
	helper 				= require ( '../helpers/helper' );
	moment				= require ( 'moment' );
	geoip				= require ( 'geoip-country' );
	
	Campaign 			= require ( '../models' ).Campaign;
	User	 			= require ( '../models' ).User;
	Influence 			= require ( '../models' ).Influence;

campaign.statistics = function ( req, res )
{
	var viewModel = 
	{
		campaignId: req.params.id,
		graph: 
		{
			dailyActivity: {}
		}
	};
	var _query = 
	{
		_id: req.params.id,
		campaignDeleted: false
	};
	Campaign.findOne ( _query, function ( err, campaignData )
	{
		if ( err )
			throw err;

		Influence.find ( { influenceCampaign: req.params.id }, function ( err, influences )
		{
			if ( err )
				throw err;
			
			viewModel.progress = 
			{
				percentage: ( influences.length / campaignData.campaignInfluence ),
				shares: influences.length,
				expiry: campaignData.campaignExpiry
			};

			res.render ( 'campaign-statistics', viewModel );
		} );
	} );
}

module.exports = campaign;