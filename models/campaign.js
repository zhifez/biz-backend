var mongoose 			= require ( 'mongoose' );
	Schema 				= mongoose.Schema;
	path 				= require ( 'path' );
	moment 				= require ( 'moment' );
	countriesList		= require ( 'countries-list' );

	User 				= require ( './user' );

var CampaignSchema = new Schema 
( {
	_campaignId: Schema.Types.ObjectId,
	campaignName:
	{
		type: String,
		required: true
	},
	campaignContentType:
	{
		type: String,
		enum: [ 'text', 'article' ],
		required: true,
		default: 'text'
	},
	campaignAbout: // for text
	{
		type: String,
		required: false
	},
	campaignContent: // for article and all future contents
	{
		type: String,
		required: false
	},
	campaignCategory:
	{
		type: Schema.Types.ObjectId,
		ref: 'Category',
		required: true
	},
	campaignReward:
	{
		type: Number,
		required: true
	},
	campaignInfluence:
	{
		type: Number,
		required: true
	},
	campaignTargetPerInfluence:
	{
		type: Number,
		required: true,
		min: 1,
		default: 1
	},
	campaignStartDate:
	{
		type: Date,
		required: true,
		default: null
	},
	campaignEndDate:
	{
		type: Date,
		required: true,
		default: null
	},
	campaignImage:
	{
		type: String,
		required: true
	},
	campaignTransaction:
	{
		type: String,
		required: false
	},
	campaignCreatedBy:
	{
		type: String,
		required: true
	},
	campaignCreated:
	{
		type: Date,
		required: true,
		default: Date.now
	},
	campaignUpdated:
	{
		type: Date,
		required: true,
		default: Date.now
	},
	campaignCompleted:
	{
		type: Boolean,
		required: true,
		default: false
	},
	campaignExpired:
	{
		type: Boolean,
		required: true,
		default: false
	},
	campaignSuspended:
	{
		type: Boolean,
		required: true,
		default: false
	},
	campaignDeleted:
	{
		type: Boolean,
		required: true,
		default: false
	},
	campaignRegion:
	{
		type: String,
		require: true,
		default: 'worldwide'
	},
	campaignRateTRVC:
	{
		type: Number,
		required: true,
		default: 0.1
	}
} );

CampaignSchema.index ( { '$**': 'text' } );

// get variable
CampaignSchema.virtual ( 'campaignDividend' ).get ( function ()
{
	return this.campaignReward / this.campaignInfluence;
} );

CampaignSchema.virtual ( 'campaignExpiry' ).get ( function ()
{
	var _today = moment ();
		_endDate = moment ( this.campaignEndDate );
	return Math.max ( 0, _endDate.diff ( _today, 'days' ) );
} );

CampaignSchema.virtual ( 'campaignDuration' ).get ( function ()
{
	var _startDate = moment ( this.campaignStartDate );
		_endDate = moment ( this.campaignEndDate );
	return _endDate.diff ( _startDate, 'days' );
} );

CampaignSchema.virtual ( 'campaignCreator' ).get ( function ()
{
	User.findOne ( { _id: this.campaignCreatedBy }, {}, {}, function ( err, data )
	{
		if ( err )
			throw err;

		if ( data )
			return data.userName;
		else
			return this.campaignCreatedBy;
	} );
} );

// get set variable
// CampaignSchema.virtual ( 'variableName' ).set ( function ( _param )
// {
// 	this._param = _param;
// } ).get ( function ()
// {
// 	return this._param;
// } );

CampaignSchema.statics.getUserInfluences = function ( data, userId, callback )
{
	Campaign.getRegionByCode ( data.campaignRegion, function ( region )
	{
		data.totalEarning = 0;
		data.estEarning = 0;
		var _types = regions[0].socials;
		async.each ( _types, function ( element, syncCB )
		{
			if ( region.socials != undefined && region.socials.indexOf ( element ) < 0 )
			{
				syncCB ();
			}
			else
			{
				if ( data.socialShared == undefined )
					data.socialShared = [];
				data.socialShared.push 
				( {
					campaignId: data._id,
					type: element,
					shared: false
				} );
				
				var _query = 
				{
					influenceType: element,
					influenceCampaign: data._id,
					influenceUser: userId
				};
				Influence.findOne ( _query, function ( err, influenceData )
				{
					if ( err )
						throw err;
					
					if ( influenceData != null )
					{
						_.each ( data.socialShared, function ( shared, index )
						{
							if ( shared.type === element )
							{
								if ( !data.hasShared )
									data.hasShared = true;
									
								shared.shared = true;
								shared.complete = influenceData.influenceComplete;
								data.estEarning += data.campaignDividend;
								if ( !influenceData.influenceComplete )
								{
									shared.shares = ( influenceData.influenceViews.length - 1 ) + '/' + data.campaignTargetPerInfluence;
									shared.viewsLeft = data.campaignTargetPerInfluence - ( influenceData.influenceViews.length - 1 );
									if ( shared.viewsLeft > 1 )
										shared.viewsLeft += ' views left';
									else
										shared.viewsLeft += ' view left';
									shared.percentage = Math.round ( ( influenceData.influenceViews.length - 1 ) / data.campaignTargetPerInfluence * 100 );
									shared.percentage += '%';
									shared.dividend = data.campaignDividend;
								}
								else
								{
									data.totalEarning += data.campaignDividend;
									var _mDate = moment ( influenceData.influenceUpdated );
									if ( !data.earningDate )
										data.earningDate = _mDate;
									else
										data.earningDate = moment.min ( data.earningDate, _mDate );
								}
							}
						} );
					}
					
					syncCB ();
				} );
			}
		}, function ( err )
		{
			callback ( data );
		} );
	} );
}

CampaignSchema.statics.getTotalInfluences = function ( data, callback )
{
	// GET total influences
	Influence.find ( { influenceCampaign: data._id }, function ( err, influences )
	{
		if ( err )
			throw err;
			
		data.campaignProgress =
		{
			total: influences.length,
			percentage: Math.round ( influences.length / data.campaignInfluence * 100 ),
			completed: ( influences.length >= data.campaignInfluence )
		};
		if ( data.campaignProgress.completed
			&& !data.campaignCompleted )
		{
			Campaign.update ( { _id: data._id }, { campaignCompleted: true }, function ( err )
			{
				callback ( data );
			} );
		}
		else
			callback ( data );
	} );
}

CampaignSchema.statics.getCreator = function ( data, callback )
{
	User.findOne ( { _id: data.campaignCreatedBy }, function ( err, userData )
	{
		if ( err )
			throw err;
		
		if ( userData != null )
			data.campaignCreatedBy = userData.userName;
		callback ( data );
	} );
}

CampaignSchema.methods.updateDate = function () 
{
	var _currentDate = new Date ();

	this.campaignUpdated = _currentDate;
	if ( !this.campaignCreated ) 
		this.campaignCreated = _currentDate;

	return _currentDate;
}

CampaignSchema.pre ( 'validate', function ( _next ) 
{
	if ( !this.campaignRegion )
		this.campaignRegion = 'worldwide';

	// do actions here before validation begin
	this.updateDate ();
	
	// this.constructor.find (); // find functions
	_next ();
});

module.exports = mongoose.model ( 'Campaign', CampaignSchema );
module.exports.getProcessingFee = function ( callback )
{
	var _fee = 0.5; //1; // USD
		// _promotion = 'Promotion: 50% discounts on processing fee (1 USD -> 0.5 USD) from now till August 31st!';
	helper.getRateTRVC ( 'USD', _fee, function ( trvc )
	{
		callback 
		( {
			usd: _fee,
			trvc: trvc,
			// promotion: _promotion
		} );
	} );
}

var pricingTiers = 
[
	{
		tier: 'Tier 1',
		reward: 10,
		influence: 50,
		targetPerInfluence: 2,
		duration: 30
	},
	{
		tier: 'Tier 2',
		reward: 50,
		influence: 250,
		targetPerInfluence: 2,
		duration: 30
	},
	{
		tier: 'Tier 3',
		reward: 100,
		influence: 500,
		targetPerInfluence: 2,
		duration: 30
	},
	{
		tier: 'Tier 4',
		reward: 200,
		influence: 1000,
		targetPerInfluence: 2,
		duration: 60
	},
	{
		tier: 'Tier 5',
		reward: 500,
		influence: 2500,
		targetPerInfluence: 2,
		duration: 60
	},
	{
		tier: 'Tier 6',
		reward: 1000,
		influence: 5000,
		targetPerInfluence: 2,
		duration: 90
	}
];
module.exports.getAllPricingTiers = function ( callback )
{
	callback ( pricingTiers );
}
module.exports.getPricingTier = function ( index, callback )
{
	if ( index < pricingTiers.length )
		callback ( pricingTiers[ index ] );
	else
		callback ( null );
}

var regions = 
[
	{
		regionName: 'Worldwide',
		regionCode: 'worldwide',
		socials: 
		[ 
			'facebook', 
			'twitter', 
			'google-plus',
			'whatsapp',
			'telegram',
			'sina-weibo', 
			'douban', 
			'kaixin',
			'q-zone',
			'renren'
		]
	},
	{
		regionName: 'Asean Countries',
		regionCode: 'asean',
		regions: [ 'ID', 'TH', 'MY', 'SG', 'PH', 'VN', 'MM', 'KH', 'LA', 'BN' ],
		socials: 
		[ 
			'facebook', 
			'twitter', 
			'google-plus', 
			'whatsapp', 
			'telegram' 
		]
	},
	{
		regionName: 'China Mainland',
		regionCode: 'china',
		regions: [ 'CN' ],
		socials: 
		[ 
			'sina-weibo', 
			'douban', 
			'kaixin', 
			'q-zone', 
			'renren' 
		]
	}
];
module.exports.getAllRegions = function ( callback )
{
	callback ( regions );
}
module.exports.getRegionCodes = function ( countryCode, callback )
{
	var _codes = [];
	_codes.push ( regions[0].regionCode );
	if ( countryCode === 'CN' ) // mainland China
		_codes.push ( regions[2].regionCode );
	else if ( regions[1].regions.indexOf ( countryCode ) >= 0 ) // asean country
		_codes.push ( regions[1].regionCode );
	callback ( _codes );
}
module.exports.getRegionByCode = function ( countryCode, callback )
{
	var _reg = null;
	_.each ( regions, function ( element, index )
	{
		if ( element.regionCode === countryCode )
			_reg = element;
	} );
	callback ( _reg );	
}