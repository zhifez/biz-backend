$( document ).ready ( function ()
{
	var ps = $( '#article-display' ).find ( 'p' );
	$.each ( ps, function ( index, element )
	{
		element.setAttribute ( 'class', 'm-0' );
	} );

	var imgs = $( '#article-display' ).find ( 'img' );
	$.each ( imgs, function ( index, element )
	{
		if ( !element.classList.contains ( 'ads' ) )
			element.setAttribute ( 'style', 'width: 100%; object-fit: cover;' );
	} );

	var links = $( '#article-display' ).find ( 'a' );
	$.each ( links, function ( index, element )
	{
		// var nestedImg = $( element ).find ( 'img' );
		// if ( nestedImg.length > 0 ) // link is an image ( illegal ads )
		// {
		// 	element.setAttribute ( 'onclick', 'openLink("https://bizinfluence.app");' );
		// }
		// else
		{
			var getLink = element.getAttribute ( 'href' );
			element.setAttribute ( 'onclick', 'openLink("' + getLink + '");' );
			element.removeAttribute ( 'href' );
			element.classList.add ( 'text-primary' );
		}
	} );
} );

function onBtnInfluence ( _id, _type )
{
	var _user = $( '#current-user' ).text ().trim ();
	var _data = 
	{
		influenceType: _type,
		influenceCampaign: _id,
		influenceUser: _user
	};
	$.post
	(
		'/api/influences',
		_data,
		function ( result )
		{
			if ( result.success )
			{
				console.log ( result );
				// document.location = '/share/' + result.data._id;
				var _link = 'https://' + location.hostname + '/campaign/' + _id + '&' + _type + '&' + _user;
				var options = 
				{
					title: result.campaignName,
					url: _link
				}
				var _url = Share.parser ( _type, options );
				console.log ( _type, _url );
				BizApp.openExternalLink ( { url: _url }, function ( err, res ) 
				{
					console.log ( res );
				} );
			}
			else
			{
				showModal 
				(
					'main',
					'Unable to share',
					result.message,
					null
				);
			}
		},
		'json'
	);
}

function closeModal ()
{
	$( '#mainModal' ).modal ( 'hide' );
}