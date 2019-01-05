$( document ).ready ( function ()
{
	
} );

function signout ()
{
	$.get 
	(
		'/api/signout',
		function ( result )
		{
			document.location = '/signin';
		}
	);
}

function onEditProfile ()
{
	$( '#profile' ).addClass ( 'hidden' );
	$( '#profile-edit-btn' ).addClass ( 'hidden' );
	$( '#profile-edit' ).removeClass ( 'hidden' );
	$( '#profile-edit-done-btn' ).removeClass ( 'hidden' );
	$( '#profile-image-edit-btn' ).removeClass ( 'hidden' );
}

function onCancelEditProfile ()
{
	$( '#profile-title-edit' ).val ( $( '#profile-title' ).text () );
	$( '#profile-about-edit' ).val ( $( '#profile-about' ).text () );

	$( '#profile' ).removeClass ( 'hidden' );
	$( '#profile-edit-btn' ).removeClass ( 'hidden' );
	$( '#profile-edit' ).addClass ( 'hidden' );
	$( '#profile-edit-done-btn' ).addClass ( 'hidden' );
	$( '#profile-image-edit-btn' ).addClass ( 'hidden' );
}

function onDoneEditProfile ( _id )
{
	var _title = $( '#profile-title-edit' ).val ();
		_about = $( '#profile-about-edit' ).val ();

	if ( _title.length <= 0 )
	{
		$( '#profile-title-alert' ).removeClass ( 'hidden' );
		return;
	}
	else
		$( '#profile-title-alert' ).addClass ( 'hidden' );

	var _data =	
	{
		userTitle: _title,
		userAbout: _about
	};

	var _images = $( '#imgInp' )[0].files;
	if ( _images.length > 0 )
	{
		var _imageData = new FormData ();
		$.each ( _images, function ( index, file )
		{
			_imageData.append ( 'file-' + index, file );	
		} );

		$.ajax 
		( {
			url: '/api/imageUpload',
			data: _imageData,
			cache: false,
			contentType: false,
			processData: false,
			type: 'POST',
			success: function ( data )
			{
				_data.userImage = data.filename;
				$( '#img-upload' ).attr ( 'src', data.filename );

				updateProfile ( _data, _id );

				if ( $( '#img-default' ).length > 0 )
				{
					var _currentImage = $( '#img-default' ).text ().trim ();
						_split = _currentImage.split ( '/' );
					$.post
					(
						'/api/imageDelete/' + _split[ _split.length - 1 ],
						function ( result )
						{
							if ( result.success )
								console.log ( result.message );
						}
					);
				}
			},
			error: function ( err )
			{
				console.log ( err );
			}
		} );
		
	}
	else
		updateProfile ( _data, _id );
}

function updateProfile ( _data, _id )
{
	$.ajax 
	( {
		url: '/api/user/' + _id,
		data: _data,
		type: 'PUT'
	} ).done ( function ( result )
	{
		if ( result.success )
		{
			document.location = document.location;
		}
		else
			console.log ( result );
	} );
}

function authFacebook ()
{
	console.log ( 'auth facebook' );
	$.get 
	{
		'/auth/facebook',
		function ( result )
		{
			console.log ( result );
		}
	};
}

function authTwitter ()
{
	console.log ( 'auth twitter' );
	$.ajax 
	( {
		url: '/auth/twitter',
		type: 'GET'
	} ).done ( function ( result )
	{
		console.log ( result );
	} );
}

function applyPayout ()
{
	
}