var express 				= require ( 'express' );
	router 					= express.Router ();
	passport				= require ( 'passport' );
	cors 					= require ( 'cors' );
	helper 					= require ( '../helpers/helper' );

	CampaignAPI				= require ( '../api' ).CampaignAPI;
	CampaignStatisticsAPI 	= require ( '../api' ).CampaignStatisticsAPI;
	UserAPI					= require ( '../api' ).UserAPI;
	InfluenceAPI			= require ( '../api' ).InfluenceAPI;
	BizAPI					= require ( '../api' ).BizAPI;
	TransactionAPI			= require ( '../api' ).TransactionAPI;
	PayoutAPI				= require ( '../api' ).PayoutAPI;
	CategoryAPI				= require ( '../api' ).CategoryAPI;
	MessageAPI				= require ( '../api' ).MessageAPI;
	ReportAPI				= require ( '../api' ).ReportAPI;
	TokenAPI				= require ( '../api' ).TokenAPI;
	AutoAPI					= require ( '../api' ).AutoAPI;
	ImageAPI				= require ( '../api' ).ImageAPI;
	AdvertAPI				= require ( '../api' ).AdvertAPI;

module.exports = function ( app )
{
	router.get ( '/api/campaigns', CampaignAPI.index );
	router.post ( '/api/campaigns', CampaignAPI.create );
	router.get ( '/api/campaign/:id&:user', CampaignAPI.get );
	router.put ( '/api/campaign/:id&:user', CampaignAPI.update );
	router.delete ( '/api/campaign/:id&:user', CampaignAPI.delete );
	router.delete ( '/api/campaignDelete/:id', CampaignAPI.deletePermanent );
	router.post ( '/api/imageUpload/:maxNormal&:maxThumb', CampaignAPI.imageUpload );
	router.post ( '/api/imageUpload', CampaignAPI.imageUpload );
	router.post ( '/api/imageDelete/:imageName', CampaignAPI.imageDelete );
	router.get ( '/update/campaigns', CampaignAPI.emptyUpdate );

	router.get ( '/api/campaignStatistics/dailyActivity/:id&:wIndex', CampaignStatisticsAPI.dailyActivity );
	router.get ( '/api/campaignStatistics/shareData/:id', CampaignStatisticsAPI.shareData );

	router.get ( '/api/users', UserAPI.index );
	router.post ( '/api/users', UserAPI.create );
	router.get ( '/api/user/:id', UserAPI.get );
	router.put ( '/api/user/:id', UserAPI.update );
	router.post ( '/api/user/:id/bookmark/:campaignId', UserAPI.bookmark );

	router.post ( '/api/signin', UserAPI.signin );
	router.get ( '/api/signout', UserAPI.signout );
	router.post ( '/api/admin/:id', UserAPI.admin );

	router.get ( '/api/influences', InfluenceAPI.index );
	router.post ( '/api/influences', InfluenceAPI.create );
	router.get ( '/api/influence/:id', InfluenceAPI.get );

	router.get ( '/api/transactions', TransactionAPI.all );
	router.post ( '/api/transactions', TransactionAPI.add );
	router.get ( '/api/transactions/:txid', TransactionAPI.get  );
	router.put ( '/api/transactions/:txid', TransactionAPI.update  );
	router.get ( '/satoshitize/:value', function ( req, res )
	{
		res.json ( helper.satoshitize ( req.params.value ) );
	} );

	router.get ( '/api/payouts', PayoutAPI.all );
	router.post ( '/api/payouts', PayoutAPI.add );
	router.put ( '/api/payout/:id', PayoutAPI.update );
	router.delete ( '/api/payout/:id', PayoutAPI.delete );

	router.get ( '/api/categories', CategoryAPI.all );
	router.post ( '/api/categories', CategoryAPI.add );
	router.get ( '/api/category/:id', CategoryAPI.get );
	router.put ( '/api/category/:id', CategoryAPI.update );
	router.delete ( '/api/category/:id', CategoryAPI.delete );

	router.get ( '/api/messages', MessageAPI.all );
	router.post ( '/api/messages', MessageAPI.add );
	router.get ( '/api/messages/user/:user', MessageAPI.getByUser );
	router.get ( '/api/message/:id', MessageAPI.get );
	router.put ( '/api/message/:id', MessageAPI.update );
	router.delete ( '/api/message/:code&:user', MessageAPI.deleteMany );
	router.delete ( '/api/message/:id', MessageAPI.delete );

	router.get ( '/api/reports', ReportAPI.all );
	router.post ( '/api/reports', ReportAPI.add );
	router.get ( '/api/report/:id', ReportAPI.get );
	router.put ( '/api/report/:id', ReportAPI.update );
	router.delete ( '/api/report/:id', ReportAPI.delete );
	router.post ( '/api/reportWarning/:id', ReportAPI.warning );
	router.post ( '/api/reportAmend/:campaignId', ReportAPI.amend );
	router.post ( '/api/reportUnsuspend/:id', ReportAPI.unsuspend );

	router.post ( '/api/login', BizAPI.login );
	router.post ( '/api/verify', BizAPI.verifyPayment );
	router.get ( '/api/yellow/:id', BizAPI.yellow );

	router.get ( '/api/tokens', TokenAPI.index )
	router.get ( '/clear/tokens', TokenAPI.clear );

	router.route ( '/api/images' )
	.get ( ImageAPI.list )
	.post ( ImageAPI.create );

	router.route ( '/api/images/:imageId' )
	.get ( ImageAPI.get )
	.delete ( ImageAPI.delete );

	router.param ( '/:imageId', ImageAPI.imageById );

	router.get ( '/auto/tokens', AutoAPI.tokens );

	router.route ( '/api/adverts' )
	.get ( AdvertAPI.list )
	.post ( AdvertAPI.create );
	router.route ( '/api/adverts/:advertId' )
	.get ( AdvertAPI.get )
	.put ( AdvertAPI.update )
	.delete ( AdvertAPI.delete );
	router.param ( 'advertId', AdvertAPI.advertById );

	app.use ( router );
};