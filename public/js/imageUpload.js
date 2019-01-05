$( document ).ready ( function () 
{
	$( document ).on ( 'change', '.btn-file :file', function () 
	{
		var input = $( this ),
			label = input.val ().replace ( /\\/g, '/' ).replace ( /.*\//, '' );
		input.trigger ( 'fileselect', [label] );
	} );

	$( '.btn-file :file' ).on ( 'fileselect', function ( event, label ) 
	{
		var input = $( this ).parents ( '.input-group' ).find ( ':text' ),
			log = label;
		
		if ( input.length ) 
		{
			input.val ( log );
		} 
		// else 
		// {
		// 	if ( log ) alert ( log );
		// }
	} );

	function readURL ( input ) 
	{
		if ( input.files && input.files[0] ) 
		{
			var reader = new FileReader ();
			
			reader.onload = function ( e ) 
			{
				$( '#img-upload' ).attr ( 'src', e.target.result );
				$( '#img-upload' ).removeClass ( 'hidden' );
			}
			
			reader.readAsDataURL ( input.files[0] );
		}
	}

	$( "#imgInp" ).change ( function ()
	{
		readURL ( this );
	} );
} );

function onUploadImage ()
{
	var _data = new FormData ();
	var _images = $( '#imgInp' )[0].files;
	if ( _images.length <= 0 )
		return;

	$.each ( _images, function ( index, file )
	{
		_data.append ( 'file-' + index, file );	
	} );
	
	$.ajax 
	( {
		url: '/api/imageUpload',
		data: _data,
		cache: false,
		contentType: false,
		processData: false,
		type: 'POST',
		success: function ( data )
		{
			console.log ( data );
		},
		error: function ( err )
		{
			console.log ( err );
		}
	} );
}

function uploadSingleImage ( image, maxNormal, maxThumb, callback )
{
	var _imageData = new FormData ();
	_imageData.append ( 'file-0', image );
	$.ajax 
	( {
		url: '/api/imageUpload/' + maxNormal + '&' + maxThumb,
		data: _imageData,
		cache: false,
		contentType: false,
		processData: false,
		type: 'POST',
		success: function ( result )
		{
			if ( result.success )
			{
				callback ( result.filename );
			}
		}
	} );
}

function createImageData ( filename, callback )
{
	$.ajax 
	( {
		url: '/api/images',
		data: 
		{
			imageName: filename,
			imageUser: $( '#creator-edit' ).val ()
		},
		type: 'POST',
		success: function ( result )
		{
			if ( result.success )
				callback ( result.data );
			else
				console.log ( result );
		}
	} );
}