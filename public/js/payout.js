function onApplyPayout ( _id )
{
	var _withdrawal = $( '#amount-edit' ).val ();
	if ( _withdrawal <= 0 )
	{
		$( '#payout-alert' ).html ( 'The amount of withdrawal cannot be 0 or less.' );
		$( '#payout-alert' ).removeClass ( 'hidden' );
		return;	
	}

	var _data = 
	{
		payoutUser: _id,
		payoutAmount: _withdrawal
	};

	$.post 
	( 
		'/api/payouts',
		_data,
		function ( result )
		{
			if ( result.success )
			{
				document.location = '/payout/' + result.data.id;
			}
			else
			{
				$( '#payout-alert' ).html ( result.message );
				$( '#payout-alert' ).removeClass ( 'hidden' );
			}
		}
	);
}

function onCancelPayout ( _id )
{
	$.ajax 
	( {
		url: '/api/payout/' + _id,
		type: 'DELETE'
	} ).done ( function ( result )
	{
		if ( result.success )
		{
			document.location = document.location;
		}
		else
			console.log ( data );
	} );
}