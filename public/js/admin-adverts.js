function onBtnCreate ()
{
	var _data = 
	{
		advertName: $( '#name-edit' ).val (),
		advertOwner: $( '#owner-edit' ).val (),
		advertLink: $( '#link-edit' ).val ()
	}

	var imgFiles = $( '#imgInp' )[0].files;
	if ( imgFiles.length <= 0 )
	{
		$( '#image-upload-edit-verify' ).removeClass ( 'hidden' );
		return;
	}

	var _imageData = new FormData ();
	$.each ( imgFiles, function ( index, file )
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
		success: function ( result )
		{
			if ( result.success )
			{
				_data.advertImage = result.filename;

				$.post 
				( 
					'/api/adverts',
					_data,
					function ( result )
					{
						if ( result.success )
						{
							document.location = document.location;
						}
						else
							console.log ( result );
					}
				);
			}
			else
				console.log ( result );
		}
	} );
}

function onBtnUpdate ( id )
{
	document.location = '/admin-advertUpdate/' + id;
}

function onBtnEnable ( isEnable, id )
{
	$.ajax 
	( {
		url: '/api/adverts/' + id,
		data:
		{
			advertActive: isEnable	
		},
		type: 'PUT',
		success: function ( result )
		{
			if ( result.success )
				document.location = document.location;
			else
				console.log ( result );
		},
		error: function ( err )
		{
			console.log ( err );
		}
	} );
}

function onBtnDelete ( id )
{
	var _delete = confirm ( 'Are you you want to delete this advertisement?' );
	if ( _delete )
	{
		$.ajax 
		( {
			url: '/api/adverts/' + id,
			type: 'DELETE',
			success: function ( result )
			{
				if ( result.success )
				{
					alert ( 'Advertisement ' + id + ' deleted!' );
					document.location = document.location;
				}
				else
					console.log ( result );
			},
			error: function ( err )
			{
				console.log ( err );
			}
		} );
	}
}