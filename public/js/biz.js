var isInfluence = false;
$( document ).ready ( function ()
{
	setNavBtnActive ( document.location.pathname, true );

	var clipboard = new ClipboardJS ( '.btn-clipboard' );
	clipboard.on ( 'success', function ( e ) 
	{
        console.log ( 'success', e );
    } );
	clipboard.on ( 'error', function ( e ) 
	{
        console.log ( 'error', e );
	} );
	
	var _split = document.location.pathname.split ( '/' );
	if ( _split.length >= 3 )
	{
		if ( _split[1] === 'campaign' )
		{
			var _split2 = _split[2].split ( '&' );
			if ( _split2.length >= 3 ) // detected a influence page
			{
				isInfluence = true;
				hideNavbarBottom ();
			}
		}
		else if ( _split[1] === 'influence' )
		{
			isInfluence = true;
			hideNavbarBottom ();
		}
		else
		{
			if ( _split[1].indexOf ( 'admin' ) >= 0 )
			{
				hideNavbarBottom ();
			}
		}
	}
} );

function hideNavbarBottom ()
{
	$( '#nav-bottom' ).addClass ( 'hidden' );
	$( '#body-container' ).css ( 'margin-bottom', '40px' );
}

function setNavBtnActive ( _path, _isActive )
{
	var _el = null;
	switch ( _path )
	{
	case '/home':
		_el = $( '#nav-home' );
		break;

	case '/bookmark':
		_el = $( '#nav-bookmark' );
		break;

	case '/message':
		_el = $( '#nav-message' );
		break;

	case '/history':
		_el = $( '#nav-history' );
		break;

	case '/user':
	case '/user/campaign':
	case '/user/following':
		_el = $( '#nav-user' );
		break;
	}

	if ( _path.indexOf ( '/search' ) >= 0 )
		_el = $( '#nav-home' );
	
	if ( _el === null )
		return;

	if ( _isActive )
	{
		_el.removeClass ( 'text-light' );
		_el.addClass ( 'text-dark' );
	}
	else
	{
		_el.removeClass ( 'text-dark' );
		_el.addClass ( 'text-light' );
	}
}

function goto ( _link )
{
	if ( document.location.pathname === _link )
		return;
	
	document.location = _link;
}

function getHostname ()
{
	return 'https://' + location.hostname;
}

function openLink ( _url )
{
	if ( _url.indexOf ( 'http' ) < 0 )
		_url = 'https://' + _url;
	
	if ( isInfluence )
	{
		window.open ( _url );
	}
	else
	{
		BizApp.openExternalLink ( { url: _url }, function ( err, res ) 
	   	{
	   		console.log ( res );
	   	} );
	}
}

function bookmark ( _userId, _campaignId )
{
	$.post 
	( 
		'/api/user/' + _userId + '/bookmark/' + _campaignId,
		function ( result )
		{
			if ( result.success )
			{
				if ( result.action === 'Add' )
				{
					$( '#btnBookmarked_' + _campaignId ).removeClass ( 'hidden' );
					$( '#btnBookmark_' + _campaignId ).addClass ( 'hidden' );
				}
				else
				{
					$( '#btnBookmarked_' + _campaignId ).addClass ( 'hidden' );
					$( '#btnBookmark_' + _campaignId ).removeClass ( 'hidden' );
				}
			}
		}
	);
}

function overlayOn ()
{
	document.getElementById ( 'overlay' ).style.display = 'block';
}

function overlayOff ()
{
	document.getElementById ( 'overlay' ).style.display = 'none';
}

function openModal ( _type )
{
	$( '#modal-' + _type ).modal ( 'show' );
}

function loadImage ( _id, imageLink )
{
	var ele = $( '#img_' + _id );
	var downloadingImage = new Image ();
	downloadingImage.onload = function()
	{
		ele.attr ( 'src', this.src );
	};
	downloadingImage.src = 'https://' + location.hostname + imageLink;
}

function loadThumbnail ( _id, imageLink )
{
	var ele = $( '#img_' + _id );
		downloadingImage = new Image ();
		_split = imageLink.split ( '.' );
		imageLink = _split[0] + '_thumbnail.' + _split[1];
	downloadingImage.onload = function()
	{
		ele.attr ( 'src', this.src );
	};
	downloadingImage.src = 'https://' + location.hostname + imageLink;
}