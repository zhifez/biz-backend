var currenStatus = 'reported';
$( document ).ready ( function ()
{
	displayStatus ( 'reported', true );
	displayStatus ( 'pending', false );
	displayStatus ( 'closed', false );
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

function onCampaignVisit ( _campaignId )
{
	document.location = '/campaign/' + _campaignId;
}

function onCampaignUnsuspend ( _reportId )
{
	$.post 
	(
		'/api/reportUnsuspend/' + _reportId,
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

function onReportStatus ( _reportId, _status )
{
	$.ajax 
	( {
		url: '/api/report/' + _reportId,
		data: 
		{
			reportStatus: _status
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

function onSendWarning ( _reportId )
{
	$.post 
	(
		'/api/reportWarning/' + _reportId,
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