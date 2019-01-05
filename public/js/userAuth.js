$( document ).ready ( function ()
{
	$( '#form-signup' ).submit ( function ( event ) 
	{
		event.preventDefault ();

		onWalletSignup ();
	} );

	$( '#form-updateEmail' ).submit ( function ( event ) 
	{
		event.preventDefault ();

		var _form = $( '#form-updateEmail' );
			_user = $( '#current-user' ).val ();
		_array = _form.serializeArray ();

		var _data = {};
		$.each ( _array, function ( index, element )
		{
			_data[ element.name ] = element.value;
		} );
		
		$.ajax
		( {
			url: '/api/user/' + _user,
			data: _data,
			type: 'PUT'
		} ).done ( function ( result ) 
		{
			if ( result.success )
			{
				document.location = '/home';
			}
			else
			{
				$( '#auth-alert' ).html ( result.message );
				$( '#auth-alert' ).removeClass ( 'hidden' );
			}
		} );
	} );
} );

function onWalletLogin ()
{
	BizApp.login 
	( {
		url: 'https://' + location.hostname + '/api/login'
	}, function ( err, result ) 
	{
		if ( result.success )
		{
			document.location = '/login/' + result.token;
		}
		else
		{
			if ( result.address != undefined )
				document.location = '/signup/' + result.address;
		}
	} );
}

function onWalletSignup ()
{
	var _form = $( '#form-signup' );
	_array = _form.serializeArray ();

	var _data = {};
	$.each ( _array, function ( index, element )
	{
		_data[ element.name ] = element.value;
	} );
	
	$.post
	(
		'/api/users',
		_data,
		function ( result ) 
		{
			if ( result.success )
			{
				document.location = '/login/' + result.token;
			}
			else
			{
				$( '#auth-alert' ).html ( result.message );
				$( '#auth-alert' ).removeClass ( 'hidden' );
			}
		},
		'json'
	);
}