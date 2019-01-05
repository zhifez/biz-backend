function onBtnUpdate ( _id )
{
	var _data = 
	{
		advertName: $( '#name-edit' ).val (),
		advertOwner: $( '#owner-edit' ).val (),
		advertLink: $( '#link-edit' ).val ()
	};

	var imageFiles = $( '#imgInp' )[0].files;
	if ( imageFiles.length > 0 )
	{
		var _imageData = new FormData ();
		$.each ( imageFiles, function ( index, file )
		{
			_imageData.append ( 'file-' + index, file );	
		} );

		// delete old image
		var _currentImage = $( '#img-default' ).val ();
			_split = _currentImage.split ( '/' );
		$.post
		(
			'/api/imageDelete/' + _split[ _split.length - 1 ],
			function ( result )
			{
				if ( result.success )
				{
					// upload new image
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
							_data.advertImage = data.filename;

							updateAdvert ( _data, _id );
						},
						error: function ( err )
						{
							console.log ( err );
						}
					} );
				}
			}
		);
	}
	else
		updateAdvert ( _data, _id );
}

function updateAdvert ( _data, _id )
{
	$.ajax 
	( {
		url: '/api/adverts/' + _id,
		data: _data,
		type: 'PUT'
	} ).done ( function ( result )
	{
		if ( result.success )
			document.location = document.location;
		else
			console.log ( result );
	} );
}