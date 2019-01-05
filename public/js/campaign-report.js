var selectedReason = {};
function onReasonSelect ( _index )
{
	if ( selectedReason.index != undefined )
		$( '#reasonCheck_' + selectedReason.index ).addClass ( 'hidden' );
	selectedReason.index = _index;
	$( '#reasonCheck_' + selectedReason.index ).removeClass ( 'hidden' );
	selectedReason.content = $( '#reasonSelect_' + selectedReason.index ).val ();
	$( '#reason-edit' ).html ( selectedReason.content );
}

function reportCampaign ( _id, _user )
{
	if ( selectedReason.index == undefined )
	{
		showModal 
		(
			'main',
			'Error',
			'Please provide a reason for your report!'
		);
		return;
	}

	var data = 
	{
		reportCreatedBy: _user,
		reportCampaign: _id,
		reportReason: selectedReason.content,
		reportRemarks: $( '#remarks-edit' ).val ()
	};

	$.post
	(
		'/api/reports',
		data,
		function ( result )
		{
			if ( result )
				document.location = document.location;
			else
				console.log ( result );
		}
	);
}