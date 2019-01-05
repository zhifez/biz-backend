var Advert 			= require ( '../models' ).Advert;

module.exports = function ( data, callback )
{
	if ( data.campaignContentType === 'article' 
		&& data.campaignContent.length > 0 )
	{
		var contentSplit = data.campaignContent.split ( '<p><br></p>' );
		if ( contentSplit.length <= 0 ) // for just incase there isn't any line break
			contentSplit = [ data.campaignContent ];

		var breakPerAdvert = 3;
		var amt = Math.max ( Math.floor ( contentSplit.length / breakPerAdvert ), 1 );
		if ( contentSplit.length > breakPerAdvert )
			++amt;
		
		Advert.find ( { advertActive: true }, function ( err, advertData )
		{
			if ( err )
				throw err;

			var count = advertData.length;
			var adverts = [];
			if ( count > 0 )
			{
				while ( adverts.length < amt )
				{
					var random = Math.floor ( Math.random () * count );
					adverts.push ( advertData[ random ] );
				}
			}
			else
			{
				adverts = 
				[ { 
					advertOwner: 'BizInfluence', 
					advertImage: '/img/default_advertise.png',
					advertLink: 'https://bizinfluence.app'
				} ];
			}
			console.log ( 'ADVERTS', adverts.length );
			var adCount = 0;
			data.campaignContentWithAds = '';
			_.each ( contentSplit, function ( element, index )
			{
				data.campaignContentWithAds += element;
				var _canAddAdvert = ( index + 1 ) == ( adCount + 1 ) * breakPerAdvert;
				if ( index < contentSplit.length - 1 && _canAddAdvert )
				{
					var adCurrent = adverts[ Math.min ( adCount, adverts.length - 1 ) ];
					++adCount;

					data.campaignContentWithAds += '<div class="card mt-3 mb-3"><div class="card-body"><div class="text-center">' + 
					'<div class="mb-1" style="font-size: 15px;">Sponsored Ads</div>' + 
					'<img class="ads" onclick="openLink(' + "'" + adCurrent.advertLink + "'" + ')" src="' + adCurrent.advertImage + '" style="width: 80%; object-fit: cover;">' + 
					// '<div class="m-0 mt-1" style="font-size: 13px;">Ads by ' + adCurrent.advertOwner + '</div>' +
					'</div></div></div>';
				}
				else
					data.campaignContentWithAds += '<p><br></p>';
			} );

			callback ();
		} );
	}
	else
		callback ();
}