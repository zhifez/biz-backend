var path 				= require ( 'path' );

	Campaign 			= require ( '../models' ).Campaign;
	Influence 			= require ( '../models' ).Influence;

module.exports = function ( req, callback )
{
	Campaign.findOne ( { _id: req.params.id }, function ( err, campaignData )
	{
		if ( err )
			throw err;

		var _og = null;
		if ( campaignData )
		{
			_og = {}
			_og.title = campaignData.campaignName;
			_og.image = campaignData.campaignImage;
			_og.description = campaignData.campaignAbout;

			var _ext = path.extname ( campaignData.campaignImage ).toLowerCase ();
			switch ( _ext )
			{
			case '.png':
				_og.imageType = 'image/png';
				break;

			case '.jpg':
			case '.jpeg':
				_og.imageType = 'image/jpeg';
				break;

			case '.gif':
				_og.imageType = 'image/gif';
				break;
			}

			if ( req.params.social != undefined && req.params.user != undefined )
			{
				var _query = 
				{
					influenceType: req.params.social,
					influenceCampaign: req.params.id,
					influenceUser: req.params.user
				};
				Influence.findOne ( _query, function ( err, influenceData )
				{
					if ( err )
						throw err;
	
					if ( influenceData )
						_og.url = 'campaign' + influenceData.referralLink;
					callback ( _og );
				} );
			}
			else
			{
				_og.url = 'influence/' + campaignData._id;
				callback ( _og );
			}
		}
		else
			callback ( null );
	} );
}