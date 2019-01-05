function onCampaignSearch ()
{
	var _search = $( '#search-edit' ).val ();
	if ( _search.length <= 0 )
	{
		alert ( 'Search input is empty' );
		return;
	}

	document.location = '/admin-campaignSearch/' + _search;
}

function onCampaignDelete ( _id )
{
	var _confirm = confirm ( 'Delete this campaign?' );
	if ( !_confirm )
		return;

	$.ajax
	( {
		url: '/api/campaignDelete/' + _id,
		type: 'DELETE'
	} ).done ( function ( result )
	{
		if ( result.success )
			document.location = document.location;
		else
			console.log ( result );
	} );
}