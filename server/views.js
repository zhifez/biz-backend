var express 		= require ( 'express' );
	router 			= express.Router ();
	passport		= require ( 'passport' );

	HomeCon			= require ( '../controllers' ).Home;
	CampaignCon		= require ( '../controllers' ).Campaign;
	UserCon			= require ( '../controllers' ).User;
	AdminCon		= require ( '../controllers' ).Admin;
	TestCon			= require ( '../controllers' ).Test;

var authenticate = function ()
{
	return passport.authenticate ( 'jwt', { session: false, failureRedirect: '/signin' } );
}

var authenticateAdmin = function ()
{
	return passport.authenticate ( 'jwt', { session: false, failureRedirect: '/admin' } );
}

module.exports = function ( app )
{
	router.get ( '/', authenticate (), HomeCon.index );
	router.get ( '/home', authenticate (), HomeCon.index );
	router.get ( '/home/p=:page', authenticate (), HomeCon.index );
	router.get ( '/bookmark', authenticate (), HomeCon.bookmark );
	router.get ( '/message', authenticate (), HomeCon.message );
	router.get ( '/history', authenticate (), HomeCon.history );
	router.get ( '/payout/:id', authenticate (), HomeCon.payoutApplied );
	router.get ( '/payout', authenticate (), HomeCon.payout );
	router.get ( '/login/:token', HomeCon.tokenSignin );
	router.get ( '/signin', HomeCon.signin );
	router.get ( '/signup/:address', HomeCon.signup );
	router.get ( '/search', authenticate (), HomeCon.search );
	router.get ( '/search=:keyword&cat=:category', authenticate (), HomeCon.search );
	router.get ( '/updateEmail', authenticate (), HomeCon.updateEmail );
	
	router.get ( '/campaign/create', authenticate (), HomeCon.create );
	router.get ( '/new/:id', authenticate (), HomeCon.create );
	router.get ( '/campaign/:id&:social&:user', HomeCon.influence );
	router.get ( '/campaign/:id', authenticate (), HomeCon.campaign );
	router.get ( '/share/:id', authenticate (), HomeCon.share );
	router.get ( '/report/:id', authenticate (), HomeCon.report );
	router.get ( '/influence/:id', HomeCon.influence );

	router.get ( '/statistics/:id', authenticate (), CampaignCon.statistics );

	router.get ( '/user', authenticate (), UserCon.index );
	router.get ( '/user/campaign', authenticate (), UserCon.campaign );

	router.get ( '/admin/:token', AdminCon.adminSignin );
	router.get ( '/admin', AdminCon.signin );
	router.get ( '/admin-list', authenticateAdmin (), AdminCon.list );
	router.get ( '/admin-payouts', authenticateAdmin (), AdminCon.payouts );
	router.get ( '/admin-payout/:id', authenticateAdmin (), AdminCon.userPayout );
	router.get ( '/admin-category', authenticateAdmin (), AdminCon.category );
	router.get ( '/admin-inbox', authenticateAdmin (), AdminCon.inbox );
	router.get ( '/admin-reports', authenticateAdmin (), AdminCon.reports );
	router.get ( '/admin-campaigns', authenticateAdmin (), AdminCon.campaigns );
	router.get ( '/admin-campaignSearch/:keyword', authenticateAdmin (), AdminCon.campaignSearch );
	router.get ( '/admin-campaignSearch', authenticateAdmin (), AdminCon.campaignSearch );
	router.get ( '/admin-adverts', authenticateAdmin (), AdminCon.adverts );
	router.get ( '/admin-advertUpdate/:id', authenticateAdmin (), AdminCon.advertUpdate );

	app.use ( router );
};