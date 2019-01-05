var statistics 			= {};
	_					= require ( 'lodash' );
	async				= require ( 'async' );
	moment				= require ( 'moment' );
	helper 				= require ( '../helpers/helper' );
	
statistics.dailyActivity = function ( req, res )
{
	var wIndex = parseInt ( req.params.wIndex );
	var mainData = 
	{
		campaignId: req.params.id
	};
	if ( wIndex > 0 )
		mainData.wIndexPrev = ( wIndex - 1 );
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

			mainData.title = 'Activity - Week ' + ( wIndex + 1 );
			mainData.labels = [];
			mainData.data = [];
			var _campaignStart = moment ( campaignData.campaignStartDate );
				_campaignEnd = moment ( campaignData.campaignEndDate );
				_dataStart = moment ( _campaignStart ).add ( wIndex * 7, 'days' );
				_startDay = _dataStart.day ();
			
			_dataStart.subtract ( _startDay, 'days' );
			async.times ( 7, function ( index, next )
			{
				var _day = moment ( _dataStart ).add ( index, 'days' );
				if ( _day < _campaignStart || _day > _campaignEnd )
				{
					mainData.labels.push ( '-' );
					mainData.data.push ( 0 );
					next ();
				}
				else
				{
					if ( _day.day () >= 6 && _day < _campaignEnd )
						mainData.wIndexNext = ( wIndex + 1 );

					mainData.labels.push ( _day.format ( 'MMM Do' ) );

					var _count = 0;
					_.each ( influences, function ( element, index )
					{
						if ( _day.format ( 'MMM Do' ) === moment ( element.influenceCreated ).format ( 'MMM Do' ) )
							++_count;
					} );
					mainData.data.push ( _count );
					next ();
				}
			}, function ( err )
			{
				res.json 
				( {
					message: 'Daily activities acquired',
					success: true,
					data: mainData
				} );
			} );
		} );
	} );
}

statistics.shareData = function ( req, res )
{
	var mainData = 
	{
		campaignId: req.params.id,
		data_sharePeriod: 
		{
			labels: 
			[ 
				'0000 - 0300', 
				'0300 - 0600', 
				'0600 - 0900', 
				'0900 - 1200', 
				'1200 - 1500', 
				'1500 - 1800', 
				'1800 - 2100', 
				'2100 - 0000' 
			],
			data: [ 0, 0, 0, 0, 0, 0, 0, 0 ]
		},
		data_topShareCountry: 
		{
			max: 5,
			labels: [],
			data: [],
			bgColors: [ '#D90368', '#F1C40F', '#2274A5', '#00CC66', '#F75C03' ]
		},
		data_topViewsSocialMedia: 
		{
			max: 5,
			labels: [],
			data: [],
			bgColors: [ '#D90368', '#F1C40F', '#2274A5', '#00CC66', '#F75C03' ]
		},
		data_topViewsCountry: 
		{
			max: 5,
			labels: [],
			data: [],
			bgColors: [ '#D90368', '#F1C40F', '#2274A5', '#00CC66', '#F75C03' ]
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

			_.each ( influences, function ( element, index )
			{
				var _time = moment ( element.influenceCreated ).hour ();
				if ( _time >= 0 && _time < 3 )
					++mainData.data_sharePeriod.data[0];
				else if ( _time >= 3 && _time < 6 )
					++mainData.data_sharePeriod.data[1];
				else if ( _time >= 6 && _time < 9 )
					++mainData.data_sharePeriod.data[2];
				else if ( _time >= 9 && _time < 12 )
					++mainData.data_sharePeriod.data[3];
				else if ( _time >= 12 && _time < 15 )
					++mainData.data_sharePeriod.data[4];
				else if ( _time >= 15 && _time < 18 )
					++mainData.data_sharePeriod.data[5];
				else if ( _time >= 18 && _time < 21 )
					++mainData.data_sharePeriod.data[6];
				else //if ( _time >= 21 && _time < 0 )
					++mainData.data_sharePeriod.data[7];

				var _countryCode = geoip.lookup ( element.influenceViews[0] ).country;
					_labelIndex = mainData.data_topShareCountry.labels.indexOf ( _countryCode );
				if ( _labelIndex < 0 )
				{
					mainData.data_topShareCountry.labels.push ( _countryCode );
					mainData.data_topShareCountry.data.push ( 1 );
				}
				else
				{
					++mainData.data_topShareCountry.data[ _labelIndex ];
				}

				if ( element.influenceComplete )
				{
					_labelIndex = mainData.data_topViewsSocialMedia.labels.indexOf ( element.influenceType );
					if ( _labelIndex < 0 )
					{
						mainData.data_topViewsSocialMedia.labels.push ( element.influenceType );
						mainData.data_topViewsSocialMedia.data.push ( 1 );
					}
					else
					{
						++mainData.data_topViewsSocialMedia.data[ _labelIndex ];
					}
				}

				_.each ( element.influenceViews, function ( view, index )
				{
					if ( index > 0 )
					{
						_countryCode = geoip.lookup ( view ).country;
						_labelIndex = mainData.data_topViewsCountry.labels.indexOf ( _countryCode );
						if ( _labelIndex < 0 )
						{
							mainData.data_topViewsCountry.labels.push ( _countryCode );
							mainData.data_topViewsCountry.data.push ( 1 );
						}
						else
						{
							++mainData.data_topViewsCountry.data[ _labelIndex ];
						}
					}
				} );
			} );

			var _otherShares = 0;
			while ( mainData.data_topShareCountry.data.length >= mainData.data_topShareCountry.max )
			{
				var _min = Math.min ( mainData.data_topShareCountry.data );
					_otherShares += _min;
				_min = mainData.data_topShareCountry.data.indexOf ( _min );
				mainData.data_topShareCountry.labels.splice ( _min, 1 );
				mainData.data_topShareCountry.data.splice ( _min, 1 );
			}
			if ( _otherShares > 0 )
			{
				mainData.data_topShareCountry.labels.push ( 'Others' );
				mainData.data_topShareCountry.data.push ( _otherShares );
			}

			_otherShares = 0;
			while ( mainData.data_topViewsSocialMedia.data.length >= mainData.data_topViewsSocialMedia.max )
			{
				var _min = Math.min ( mainData.data_topViewsSocialMedia.data );
					_otherShares += _min;
				_min = mainData.data_topViewsSocialMedia.data.indexOf ( _min );
				mainData.data_topViewsSocialMedia.labels.splice ( _min, 1 );
				mainData.data_topViewsSocialMedia.data.splice ( _min, 1 );
			}
			if ( _otherShares > 0 )
			{
				mainData.data_topViewsSocialMedia.labels.push ( 'Others' );
				mainData.data_topViewsSocialMedia.data.push ( _otherShares );
			}

			_otherShares = 0;
			while ( mainData.data_topViewsCountry.data.length >= mainData.data_topViewsCountry.max )
			{
				var _min = Math.min ( mainData.data_topViewsCountry.data );
					_otherShares += _min;
				_min = mainData.data_topViewsCountry.data.indexOf ( _min );
				mainData.data_topViewsCountry.labels.splice ( _min, 1 );
				mainData.data_topViewsCountry.data.splice ( _min, 1 );
			}
			if ( _otherShares > 0 )
			{
				mainData.data_topViewsCountry.labels.push ( 'Others' );
				mainData.data_topViewsCountry.data.push ( _otherShares );
			}

			res.json 
			( { 
				message: 'Top sharing acquired',
				success: true,
				data: mainData
			 } );
		} );
	} );
}

module.exports = statistics;