var currenStatus = 'incomplete';
$( document ).ready ( function ()
{
	displayStatus ( 'incomplete', true );
	displayStatus ( 'pending', false );
	displayStatus ( 'complete', false );
	displayStatus ( 'txid-invalid', false );
} );

function onStatus ( _status )
{
	if ( currenStatus != _status )
	{
		$( '#status-' + currenStatus ).removeClass ( 'btn-dark' );
		$( '#status-' + currenStatus ).addClass ( 'btn-outline-dark' );
		$( '#status-' + _status ).removeClass ( 'btn-outline-dark' );
		$( '#status-' + _status ).addClass ( 'btn-dark' );

		displayStatus ( currenStatus, false );
		displayStatus ( _status, true );
	}
	currenStatus = _status;
}

function displayStatus ( _status, _isDisplay )
{
	var _ele = document.getElementsByClassName ( _status );
	if ( _ele.length > 0 )
	{
		$.each ( _ele, function ( index, element )
		{
			if ( _isDisplay )
				element.classList.remove ( 'hidden' );
			else
				element.classList.add ( 'hidden' );	
		} );
	}
}

function onUpdatePayout ( _id ) 
{
	var _txid = $( '#txid-edit' ).val ();

	$.ajax 
	( {
		url: '/api/payout/' + _id,
		data: 
		{
			payoutTxid: _txid
		},
		type: 'PUT'
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