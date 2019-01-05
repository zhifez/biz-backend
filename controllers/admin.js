var async				= require ( 'async' );

	HomeCon				= require ( './home' );

	User 				= require ( '../models' ).User;
	Campaign 			= require ( '../models' ).Campaign;
	Payout 				= require ( '../models' ).Payout;
	Message 			= require ( '../models' ).Message;
	Report 				= require ( '../models' ).Report;
	Advert 				= require ( '../models' ).Advert;

var verifyAdmin = function ( req, res )
{
	if ( req.user.admin == undefined )
	{
		res.redirect ( '/admin' );
		return true;
	}
	else
		return false;
}

module.exports = 
{
	signin: function ( req, res )
	{
		var viewModel = {};
		res.render ( 'admin', viewModel );
	},
	adminSignin: function ( req, res )
	{
		var viewModel = {};
		req.session.jwt = req.params.token;
		res.redirect ( '/admin-list' );
	},
	list: function ( req, res )
	{
		var viewModel = {};
		res.render ( 'admin-list', viewModel );
	},
	payouts: function ( req, res )
	{
		if ( verifyAdmin ( req, res ) )
			return;

		var viewModel = 
		{
			statusIncomplete: 0,
			statusPending: 0,
			statusComplete: 0,
		};

		Payout.find ( {}, null, { sort: { paymentDate: -1 } }, function ( err, data )
		{
			if ( err )
				throw err;

			viewModel.payouts = data;
			async.each ( viewModel.payouts, function ( element, callback )
			{
				User.findOne ( { userAddress: element.payoutAddress }, function ( err, data )
				{
					if ( err )
						throw err;
					
					element.payoutUserData = data;
					Payout.getPaymentStatus ( element, function ()
					{
						switch ( element.payoutStatusClass ) 
						{
						case 'incomplete':
							++viewModel.statusIncomplete;
							break;

						case 'pending':
							++viewModel.statusPending;
							break;

						case 'complete':
							++viewModel.statusComplete;
							break;
						}
						callback ();
					} );
				} );
				
			}, function ( err )
			{
				res.render ( 'admin-payouts', viewModel );
			} );
		} );
	},
	userPayout: function ( req, res )
	{
		if ( verifyAdmin ( req, res ) )
			return;
		
		HomeCon.historyData ( req.params.id, function ( viewModel )
		{
			res.render ( 'admin-userHistory', viewModel );
		} );
	},
	category: function ( req, res )
	{
		if ( verifyAdmin ( req, res ) )
			return;
		
		var viewModel = {};
		Category.getAll ( function ( data )
		{
			data.push 
			( {
				_id: 'empty',
				categoryName: 'empty'
			} );
			viewModel.categories = data;
			res.render ( 'admin-category', viewModel );
		} );
	},
	inbox: function ( req, res )
	{
		if ( verifyAdmin ( req, res ) )
			return;

		var viewModel = {};
		Message.find ( { messageSender: 'admin', $or: [ { messageRecipient: 'admin' }, { messageRecipient: 'all' } ] }, null, { sort: { messageCreated: 1 } }, function ( err, data )
		{
			if ( err )
				throw err;
				
			viewModel.messages = data;
			res.render ( 'admin-inbox', viewModel );
		} );
	},
	reports: function ( req, res )
	{
		if ( verifyAdmin ( req, res ) )
			return;

		var viewModel = 
		{
			status: {},
			statuses: [ 'reported', 'pending', 'amended', 'closed' ]
		};
		async.each ( viewModel.statuses, function ( element, next )
		{
			Report.count ( { reportStatus: element }, function ( err, count )
			{
				if ( err )
					throw err;
				
				if ( count > 0 )
					viewModel.status[ element ] = count;
				next ();
			} );
		}, function ( err )
		{
			Report.find ( {}, null, { sort: { reportUpdated: 1 } } )
			.populate ( 'reportCampaign' )
			.populate ( 'reportCreatedBy' )
			.exec ( function ( err, data )
			{
				viewModel.reports = data;
				res.render ( 'admin-reports', viewModel );
			} );
		} );
	},
	campaigns: function ( req, res )
	{
		if ( verifyAdmin ( req, res ) )
			return;

		var viewModel = {};
		Campaign.find ( {}, null, { sort: { campaignUpdated: -1 } }, function ( err, data )
		{
			if ( err )
				throw err;
				
			viewModel.campaigns = data;
			res.render ( 'admin-campaigns', viewModel );
		} );
	},
	campaignSearch: function ( req, res )
	{
		if ( verifyAdmin ( req, res ) )
			return;

		var viewModel = 
		{
			keyword: req.params.keyword
		};

		var _query = {};
		if ( viewModel.keyword != undefined )
			_query.$text = { $search: viewModel.keyword };
		Campaign.find ( _query, null, { sort: { campaignUpdated: -1 } }, function ( err, data )
		{
			if ( err )
				throw err;
			
			async.each ( data, function ( element, next )
			{
				HomeCon.setupCampaignData ( element, viewModel, function ()
				{
					next ();	
				} );
			}, function ( err )
			{
				viewModel.campaigns = data;
				res.render ( 'admin-campaignSearch', viewModel );
			} );
		} );
	},
	adverts: function ( req, res )
	{
		if ( verifyAdmin ( req, res ) )
			return;

		var viewModel = {};
		Advert.find ( {}, null, { sort: { advertUpdated: -1 } }, function ( err, data )
		{
			if ( err )
				throw err;
			
			viewModel.adverts = data;
			if ( viewModel.adverts.length <= 0 )
			{
				viewModel.adverts = 
				[ { 
					advertName: 'BizInfluence: Create Campaign Now!!!',
					advertOwner: 'BizInfluence', 
					advertImage: '/img/default_advertise.png',
					advertLink: 'https://bizinfluence.app'
				} ];
			}
			res.render ( 'admin-adverts', viewModel );
		} );
	},
	advertUpdate: function ( req, res )
	{
		if ( verifyAdmin ( req, res ) )
			return;

		var viewModel = {};
		Advert.findOne ( { _id: req.params.id }, function ( err, data )
		{
			if ( err )
				throw err;
			
			viewModel.advertData = data;
			res.render ( 'admin-advertUpdate', viewModel );
		} );
	}
}