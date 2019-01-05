function onSignIn ()
{
	var _input = $( '#company-input' ).val ();
	if ( _input.length <= 0 )
		return;
	
	$.post 
	( 
		'/api/admin/' + _input,
		function ( result )
		{
			if ( result.success )
				document.location = '/admin/' + result.token;
			else
				console.log ( result.message );
		}
	);
}