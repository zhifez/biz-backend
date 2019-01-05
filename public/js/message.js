var currentMessage = undefined;
function onMessageSelect ( _id )
{
	currentMessage = _id;

	$.get 
	(
		'/api/message/' + _id,
		function ( result )
		{
			if ( result.success )
			{
				showModal 
				(
					'main',
					result.data.messageTitle,
					result.data.messageContent,
					{
						classes: 'btn btn-danger',
						text: 'Delete',
						onclick: "onMessageDelete('" + result.data._id + "', '" + result.data.messageRecipient + "')"
					}
				);

				if ( !result.data.messageViewed )
				{
					$.ajax 
					( {
						url: '/api/message/' + _id,
						data: 
						{
							messageViewed: true
						},
						type: 'PUT'
					} ).done ( function ( result )
					{
						if ( result.success )
						{
							$( '#messageBtn_' + _id ).removeClass ( 'new-notify' );
						}
						else
							console.log ( result );
					} );
				}

				updatePageElements ( result.data.messageRecipient );
			}
			else
				console.log ( result );
		}
	);
}

function onMessageDelete ( _id, _user )
{
	$.ajax
	( {
		url: '/api/message/' + _id,
		type: 'DELETE'
	} ).done ( function ( result )
	{
		if ( result.success )
		{
			updatePageElements ( _user );

			hideModal ( 'main' );
			$( '#message_' + _id ).remove ();
		}
		else
			console.log ( result );
	} );
}

function updatePageElements ( _user )
{
	$.get 
	(
		'/api/messages/user/' + _user,
		function ( result )
		{
			if ( result.success )
			{
				if ( result.data.unread > 0 )
				{
					var _unreadText = 'You have ' + result.data.unread + ' unread message';
					if ( result.data.unread > 1 )
						_unreadText += 's';
					$( '#message-unread' ).html ( _unreadText + '.' );
				}
				else
					$( '#message-unread' ).addClass ( 'hidden' );

				if ( result.data.data.length <= 0 )
					$( '#message-empty' ).removeClass ( 'hidden' );
			}
			else
				console.log ( result );
		}
	);
}