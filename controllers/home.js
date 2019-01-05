var _ 					= require ( 'lodash' );
	async				= require ( 'async' );
	ip 					= require ( 'ip' );
	request				= require ( 'request' );
	helper 				= require ( '../helpers/helper' );
	ogHandler 			= require ( '../helpers/ogHandler' );
	adsHandler 			= require ( '../helpers/adsHandler' );
	requestIp 			= require ( 'request-ip' );
	moment				= require ( 'moment' );
	emailValidator		= require ( 'email-validator' );
	geoip				= require ( 'geoip-country' );
	fs					= require ( 'fs' );
	
	Campaign 			= require ( '../models' ).Campaign;
	User	 			= require ( '../models' ).User;
	Influence 			= require ( '../models' ).Influence;
	Transaction 		= require ( '../models' ).Transaction;
	Payout	 			= require ( '../models' ).Payout;
	Category	 		= require ( '../models' ).Category;
	Message		 		= require ( '../models' ).Message;

var initViewModel = function ( req, res, callback )
{
	var viewModel = 
	{
		user: req.user.id
	};
	User.findOne ( { _id: viewModel.user }, function ( err, data )
	{
		if ( !data )
		{
			res.redirect ( '/home' );
			return;
		}

		if ( data.userEmail == undefined 
			|| data.userEmail.length <= 0
			|| !emailValidator.validate ( data.userEmail ) )
		{
			console.log ( 'INVALID-EMAIL', data.userEmail );
			res.redirect ( '/updateEmail' );	
		}
		else
		{
			async.times ( 2, function ( index, next )
			{
				switch ( index )
				{
				case 0: // get messages
					Message.getUserMessages ( viewModel.user, function ( data )
					{
						viewModel.messages = data;
						next ();
					} );
					break;

				case 1: // get maintenance
					var time = moment ();
						hours = time.hours ();
					if ( hours >= 0 && hours < 3 )
					{
						viewModel.maintenanceMessage = 'Our server is undergoing a scheduled maintenance from <strong>12am to 3am</strong>.<br>We apologize for any inconvenience caused.<br>[' + time.format ( 'HHmm' ) + ']';
					}
					// else if ( hours >= 14 && hours < 15 )
					// {
					// 	viewModel.maintenanceMessage = 'Our server will be undergoing a scheduled maintenance from <strong>12am to 3am</strong>.<br>We apologize for any inconvenience caused.';
					// }
					next ();
					break;
				}
			}, function ( err )
			{
				callback ( viewModel );
			} );
		}
	} );
};

var historyData = function ( viewModel, dataCB )
{
	viewModel.totalEarning = 0;
	viewModel.records = [];

	User.findOne ( { _id: viewModel.user }, function ( err, userData )
	{
		viewModel.userData = userData;
		
		Influence.find ( { influenceUser: viewModel.user }, function ( err, influences )
		{
			if ( err )
				throw err;
				
			if ( influences.length > 0 )
			{
				var _campaigns = [];
				_.each ( influences, function ( element, index )
				{
					if ( _campaigns.indexOf ( element.influenceCampaign ) < 0 )
						_campaigns.push ( element.influenceCampaign );
				} );

				viewModel.campaigns = [];
				async.each ( _campaigns, function ( element, callback )
				{
					Campaign.findOne ( { _id: element }, function ( err, data )
					{
						if ( err )
							throw err;
						
						if ( data )
						{
							setupCampaignData ( data, viewModel, function ()
							{
								if ( data.totalEarning > 0 )
								{
									viewModel.totalEarning += data.totalEarning;
									var _record = 
									{
										recordName: data.campaignName,
										recordDividend: data.campaignDividend,
										recordAmount: '+' + data.totalEarning,
										recordAmountClass: 'text-success',
										recordDate: moment ( data.earningDate ).format ( 'YYYY-MM-DD' )
									};
									if ( data.campaignDeleted )
										_record.recordStatus = 'deleted';
									else
									{
										if ( data.campaignProgress.completed )
											_record.recordStatus = 'completed';
										else
										{
											if ( data.campaignExpired )
												_record.recordStatus = 'incomplete';
											else
												_record.recordStatus = 'active';
										}
									}
									viewModel.records.push ( _record );
								}

								data.campaignDisabled = ( data.campaignExpired || data.campaignProgress.completed );
								data.campaignDisabledWithoutEarning = ( data.campaignDisabled && data.totalEarning <= 0 );
								// if ( !data.campaignExpired
								// 	&& !data.campaignProgress.completed )
								if ( data.hasShared && !data.campaignDisabledWithoutEarning )
									viewModel.campaigns.push ( data );
								callback ();
							} );
						}
						else
							callback ();
					} );	
				}, function ( result )
				{
					Payout.find ( { payoutAddress: userData.userAddress, payoutComplete: true }, function ( err, data )
					{
						if ( err )
							throw err;

						if ( data.length > 0 )
						{
							_.each ( data, function ( element, index )
							{
								viewModel.totalEarning -= element.payoutAmount;
								viewModel.records.push 
								( {
									recordName: 'PAYOUT: ' + element._id,
									recordAmount: '-' + element.payoutAmount,
									recordAmountClass: 'text-danger',
									recordDate: moment ( data.payoutDate ).format ( 'YYYY-MM-DD' )
								} );
							} );
						}
						helper.sortDESC ( viewModel.records, 'recordDate' );
						userData.userEarning = viewModel.totalEarning;
						userData.save  ( function ( err, data )
						{
							if ( err )
								throw err;
							
							viewModel.campaigns = _.orderBy ( viewModel.campaigns, [ 'campaignUpdated' ], [ 'desc' ] );
							dataCB ( viewModel );
						} );
					} );
				} );
			}
			else
				dataCB ( viewModel );
		} );
	} );
}

var setupCampaignData = function ( campaignData, viewModel, callback )
{
	Campaign.getUserInfluences ( campaignData, viewModel.user, function ( data )
	{
		Campaign.getTotalInfluences ( campaignData, function ( data )
		{
			if ( viewModel.user != null && campaignData.campaignCreatedBy === viewModel.user )
			{
				campaignData.campaignCreatedBy = 'You';
				callback ();
			}
			else
			{
				Campaign.getCreator ( campaignData, function ( data )
				{
					if ( viewModel.user != null )
					{
						User.campaignIsBookmarked ( viewModel.user, campaignData._id, function ( isBookmarked )
						{
							campaignData.isBookmarked = isBookmarked;
							callback ();
						} );
					}
					else
						callback ();
				} );
			}
		} );
	} );
};

module.exports = 
{
	initViewModel: function ( req, res, callback )
	{
		initViewModel ( req, res, function ( viewModel )
		{
			callback ( viewModel );	
		} );
	},
	historyData: function ( _user, callback )
	{
		var viewModel = 
		{
			user: _user
		};
		historyData ( viewModel, callback );
	},
	setupCampaignData: function ( campaignData, viewModel, callback )
	{
		setupCampaignData ( campaignData, viewModel, function ()
		{
			callback ();	
		} );
	},
	tokenSignin: function ( req, res )
	{
		req.session.jwt = req.params.token;
		res.redirect ( '/home' );
	},
	signin: function ( req, res )
	{
		var viewModel = {};
		req.session.destroy ();
		res.render ( 'signin', viewModel );
	},
	signup: function ( req, res )
	{
		var viewModel = 
		{
			userAddress: req.params.address
		};
		res.render ( 'signup', viewModel );
	},
	index: function ( req, res )
	{
		initViewModel ( req, res, function ( viewModel )
		{
			Category.getAll ( function ( data )
			{
				viewModel.categories = data;
				viewModel.categories.splice ( 0, 0, { _id: 'all', categoryName: 'All', categorySelected: true } );
				viewModel.categories.push ( { _id: 'completed', categoryName: 'Completed' } );
				
				var _query = 
				{
					campaignSuspended: false,
					campaignDeleted: false,
					campaignCompleted: false,
					campaignExpired: false
				};
				var _ip = requestIp.getClientIp ( req );
					_geo = geoip.lookup ( _ip );
				Campaign.getRegionCodes ( _geo.country, function ( codes )
				{
					var _orRegions = [];
					if ( codes.length > 1 )
					{
						_.each ( codes, function ( element, index )
						{
							_orRegions.push ( { campaignRegion: element } );	
						} );
					}
					_query.$or = _orRegions;
					
					Campaign.find ( _query, null, { sort: { campaignUpdated : -1 } } )
					.populate ( 'campaignCategory' )
					.exec ( function ( err, data )
					{
						if ( err )
							throw err;

						viewModel.campaigns = [];
						async.each ( data, function ( element, callback )
						{
							if ( element.campaignExpiry > 0 )
							{
								if ( element.campaignTransaction == null
									|| element.campaignTransaction.length <= 0 )
									callback ();
								else
								{
									if ( viewModel.user != null )
										element.currentUser = viewModel.user;
										
									setupCampaignData ( element, viewModel, function ()
									{
										if ( !element.campaignProgress.completed )
											viewModel.campaigns.push ( element );
										callback ();
									} );
								}
							}
							else
							{
								Campaign.update ( { _id: element._id }, { campaignExpired: true }, function ( err )
								{
									callback ();
								} );
							}
						}, function ( err )
						{
							helper.sortDESC ( viewModel.campaigns, 'campaignUpdated' );
							viewModel.count = viewModel.campaigns.length;
							res.render ( 'index', viewModel );
						} );
					} );
				} );
			} );
		} );
	},
	bookmark: function ( req, res )
	{
		initViewModel ( req, res, function ( viewModel )
		{
			viewModel.campaigns = [];
			User.findOne ( { _id: viewModel.user }, function ( err, userData )
			{
				if ( userData.userBookmarks != null )
				{
					async.each ( userData.userBookmarks, function ( element, callback )
					{
						var _query = 
						{
							_id: element,
							campaignSuspended: false,
							campaignDeleted: false
						};
						Campaign.findOne ( _query, function ( err, data )
						{
							if ( err )
								throw err;
	
							if ( data && data.campaignExpiry > 0 )
							{
								data.currentUser = viewModel.user;
								setupCampaignData ( data, viewModel, function ()
								{
									data.canRemoveBookmark = true;
									viewModel.campaigns.push ( data );
									callback ();
								} );
							}
							else
								callback ();
						} );
					}, function ( result )
					{
						res.render ( 'bookmark', viewModel );	
					} );
				}
				else
					res.render ( 'bookmark', viewModel );
			} );
		} );
	},
	message: function ( req, res )
	{
		initViewModel ( req, res, function ( viewModel )
		{
			res.render ( 'message', viewModel );
		} );
	},
	history: function ( req, res )
	{
		initViewModel ( req, res, function ( viewModel )
		{
			historyData ( viewModel, function ( viewModel )
			{
				console.log ( 'TOTAL EARNING', viewModel.totalEarning );
				res.render ( 'history', viewModel );	
			} );
		} );
	},
	updateEmail: function ( req, res )
	{
		var viewModel = 
		{
			user: req.user.id
		};
		res.render ( 'updateEmail', viewModel );
	},
	create: function ( req, res )
	{
		var viewModel = 
		{
			user: req.user.id
		};

		if ( req.params.id != undefined )
		{
			Campaign.findOne ( { _id: req.params.id }, function ( err, data )
			{
				if ( err )
					throw err;
				
				if ( data.campaignCreatedBy === viewModel.user )
				{
					data.campaignCreatedBy = 'You';
					viewModel.campaignData = data;
					res.render ( 'campaign-create', viewModel );
				}
				else
				{
					User.findOne ( { _id: data.campaignCreatedBy }, function ( err, userData )
					{
						if ( err )
							throw err;
						
						if ( userData != null )
							data.campaignCreatedBy = userData.userName;
						viewModel.campaignData = data;
						res.render ( 'campaign-create', viewModel );
					} );
				}	
			} );
		}
		else
		{
			Category.getAll ( function ( data )
			{
				viewModel.categories = data;
				
				Campaign.getAllRegions ( function ( data )
				{
					viewModel.regions = data;

					Campaign.getAllPricingTiers ( function ( data )
					{
						viewModel.pricingTiers = data;

						Campaign.getProcessingFee ( function ( fee )
						{
							viewModel.processingFee = fee.usd;
							viewModel.processingFeeTRVC = fee.trvc;
							viewModel.promotion = fee.promotion;
							res.render ( 'campaign-create', viewModel );
						} );
					} );
				} );
			} );
		}
	},
	campaign: function ( req, res )
	{
		var viewModel = 
		{
			user: req.user.id
		};

		var _query = 
		{
			_id: req.params.id,
			campaignDeleted: false
		};
		Campaign.findOne ( _query )
		.populate ( 'campaignCategory' )
		.exec ( function ( err, data )
		{
			if ( err )
				throw err;
			
			if ( data == null )
				res.redirect ( '/home' );
			else
			{
				if ( data.campaignSuspended
					&& data.campaignCreatedBy != viewModel.user )
				{
					res.redirect ( '/home' );
					return;
				}

				if ( viewModel.user != undefined )
					data.currentUser = viewModel.user;
				
				if ( data.campaignTransaction == null
					|| data.campaignTransaction.length <= 0 )
				{
					Campaign.deleteOne ( { _id: data._id }, function ( err )
					{
						if ( err )
							throw err;
							
						res.redirect ( '/home' );
					} );
				}
				else
				{
					adsHandler ( data, function ()
					{
						Transaction.verifyTransaction ( data.campaignTransaction, function ( err, isVerified )
						{
							if ( !isVerified )
							{
								viewModel.alertBg = 'bg-info';
								viewModel.alert = 'Campaign pending blockchain confirmations.';
							}

							setupCampaignData ( data, viewModel, function ()
							{
								viewModel.campaignData = data;
								Category.getAll ( function ( all )
								{
									if ( data.campaignCategory != undefined )
									{
										_.each ( all, function ( element, index )
										{
											if ( element._id.toString () === data.campaignCategory._id.toString () )
												element.categorySelected = true;
										} );
									}
									viewModel.categories = all;
									res.render ( 'campaign', viewModel );
								} );
							} );
						} );
					} );
				}
			}
		} );
	},
	influence: function ( req, res )
	{
		var viewModel = 
		{
			forInfluence: true
		};
		
		ogHandler ( req, function ( data )
		{
			viewModel.og = data;
			if ( data == null )
			{
				res.redirect ( '/home' );
				return;
			}

			var _query = 
			{
				_id: req.params.id,
				campaignSuspended: false,
				campaignDeleted: false
			};
			Campaign.findOne ( _query )//, function ( err, data )
			.populate ( 'campaignCategory' )
			.exec ( function ( err, data )
			{
				if ( err )
					throw err;

				if ( data == null )
					res.redirect ( '/home' );
				else if ( data.campaignExpiry <= 0 )
					res.redirect ( '/campaign/' + data._id );
				else
				{
					adsHandler ( data, function ()
					{
						Campaign.getTotalInfluences ( data, function ( data )
						{
							Campaign.getCreator ( data, function ( data )
							{
								viewModel.campaignData = data;

								if ( req.params.social == undefined || req.params.user == undefined )
								{
									res.render ( 'campaign', viewModel );
								}
								else
								{
									var _query = 
									{
										influenceType: req.params.social,
										influenceCampaign: req.params.id,
										influenceUser: req.params.user
									};
									Influence.findOne ( _query, function ( err, data )
									{
										if ( err )
											throw err;
										
										var _ip = requestIp.getClientIp ( req );
										console.log ( 'CLIENT-IP', _ip );
										if ( data )
										{
											var _countryCode = geoip.lookup ( _ip ).country;
											if ( !data.influenceComplete 
												&& !data.hasView ( _ip )
												&& _countryCode != 'IE' ) // IE == Ireland, home to Facebook regis; this is to prevent Facebook crawler from being a 'viewer'
											{
												data.influenceViews.push ( _ip );
												console.log ( 'VIEWS', data.influenceViews );
												Influence.viewsReachedTarget ( data, function ()
												{
													data.save ( function ( err, data )
													{
														res.render ( 'campaign', viewModel );
													} );
												} );
											}
											else
												res.render ( 'campaign', viewModel );
										}
										else
											res.redirect ( '/campaign/' + req.params.id );
									} );
								}
							} );
						} );
					} );
				}
			} );
		} );
	},
	share: function ( req, res )
	{
		var viewModel = {};

		var _query = 
		{
			_id: req.params.id,
			campaignSuspended: false,
			campaignDeleted: false
		};
		Campaign.findOne ( _query, function ( err, data )
		{
			if ( err )
				throw err;
			
			if ( data )
			{
				Campaign.getRegionByCode ( data.campaignRegion, function ( region )
				{
					viewModel.socials = region.socials;
					viewModel.campaignData = data;
					res.render ( 'campaign-share', viewModel );
				} );
			}
			else
				res.redirect ( '/home' );
		} );
	},
	payout: function ( req, res )
	{
		var viewModel = 
		{
			user: req.user.id,
			currentEarning: 0
		};

		User.findOne ( { _id: viewModel.user }, function ( err, userData )
		{
			if ( err )
				throw err;
				
			if ( userData )
			{
				viewModel.currentEarning = userData.userEarning;
				Payout.getMinWithdrawalTRVC ( function ( trvc )
				{
					viewModel.minWithdrawal = trvc;
					
					Payout.find ( { payoutAddress: userData.userAddress }, function ( err, data )
					{
						if ( err )
							throw err;

						if ( data.length > 0 )
						{
							viewModel.pastPayouts = data;
							async.each ( viewModel.pastPayouts, function ( element, callback )
							{
								Payout.getPaymentStatus ( element, function ()
								{
									if ( !element.payoutComplete )
										viewModel.currentPayout = element;
									callback ();
								} );
							}, function ( err )
							{
								res.render ( 'payout', viewModel );
							} );
						}
						else
							res.render ( 'payout', viewModel );
					} );
				} );
			}
			else
				res.redirect ( '/signin' ); 
		} );
	},
	payoutApplied: function ( req, res )
	{
		var viewModel = 
		{
			user: req.user.id,
			applied: true
		};

		User.findOne ( { _id: viewModel.user }, function ( err, userData )
		{
			if ( err )
				throw err;
				
			if ( userData )
			{
				Payout.findOne ( { payoutAddress: userData.userAddress, payoutComplete: false }, function ( err, data )
				{
					if ( err )
						throw err;

					if ( data )
					{
						viewModel.currentPayout = data;
						res.render ( 'payout', viewModel );
					}
					else
						res.redirect ( '/payout' );
				} );
			}
			else
				res.redirect ( '/payout' );
		} );
	},
	search: function ( req, res )
	{
		var viewModel = 
		{
			user: req.user.id,
			keyword: req.params.keyword,
			category: req.params.category,
			campaigns: []
		};

		Category.getAll ( function ( data )
		{
			viewModel.categories = data;
			viewModel.categories.splice ( 0, 0, { _id: 'all', categoryName: 'All', categorySelected: true } );
			viewModel.categories.push ( { _id: 'completed', categoryName: 'Completed' } );
			
			if ( viewModel.keyword != undefined )
			{
				var _query = 
				{
					campaignSuspended: false,
					campaignDeleted: false
				};
				
				if ( viewModel.keyword != 'undefined' )
					_query.$text = { $search: viewModel.keyword };
				if ( viewModel.category != undefined && viewModel.category != 'all' )
				{
					if ( viewModel.category === 'completed' )
						_query.campaignCompleted = true;
					
					viewModel.categories[0].categorySelected = false;
					_.each ( viewModel.categories, function ( element, index )
					{
						if ( element._id.toString () === viewModel.category.toString () )
						{
							if ( viewModel.category != 'completed' )
								_query.campaignCategory = viewModel.category;
							viewModel.categoryName = element.categoryName;
							element.categorySelected = true;
						}
					} );
				}
				
				Campaign.find ( _query, null, { sort: { campaignUpdated : 1 } } )
				.populate ( 'campaignCategory' )
				.exec ( function ( err, data )	 
				{
					if ( err )
						throw err;
					
					viewModel.campaigns = [];
					async.each ( data, function ( element, callback )
					{
						if ( element.campaignExpiry > 0
							|| _query.campaignCompleted != undefined )
						{
							if ( viewModel.user != null )
								element.currentUser = viewModel.user;
						
							setupCampaignData ( element, viewModel, function ()
							{
								if ( !element.campaignProgress.completed
									|| _query.campaignCompleted != undefined )
									viewModel.campaigns.push ( element );
								callback ();
							} );
						}
						else
							callback ();
					}, function ( err )
					{
						viewModel.count = viewModel.campaigns.length;
						res.render ( 'search', viewModel );
					} );
				} ); 
			}
			else
				res.render ( 'search', viewModel );
		} );
	},
	report: function ( req, res )
	{
		var viewModel = 
		{
			campaignId: req.params.id,
			user: req.user.id
		};

		var _query = 
		{
			reportCampaign: req.params.id,
			reportCreatedBy: req.user.id,
			reportStatus: 'reported'
		};
		Report.findOne ( _query )
		.populate ( 'reportCampaign' )
		.populate ( 'reportCreatedBy' )
		.exec ( function ( err, data )
		{
			if ( err )
				throw err;

			if ( data )
			{
				viewModel.campaignReport = data;
				res.render ( 'campaign-report', viewModel );
			}
			else
			{
				Campaign.findOne ( { _id: req.params.id }, function ( err, data )
				{
					if ( err )
						throw err;
						
					viewModel.campaignData = data;
					Report.reportReasons ( function ( data )
					{
						viewModel.reportReasons = data;
						res.render ( 'campaign-report', viewModel );
					} );
				} );
			}
		} );
	}
}