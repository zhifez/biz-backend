function removeBookmark ( _id, _campaignId )
{
	$.post 
	( 
		'/api/user/' + _id + '/bookmark/' + _campaignId,
		function ( result )
		{
			if ( result.success )
			{
				if ( result.action === 'Remove' )
				{
					$( '#bookmark_' + _campaignId ).addClass ( 'hidden' );
				}
			}
		}
	);
}