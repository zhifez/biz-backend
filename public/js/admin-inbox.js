var currentMessage = undefined;
function onMessageSelect ( _id )
{
	if ( currentMessage === _id )
		return;

	$.get 
	(
		'/api/message/' + _id,
		function ( result )
		{
			if ( result.success )
			{
				if ( currentMessage != undefined )
					$( '#message_' + currentMessage ).removeClass ( 'active' );
				currentMessage = _id;
				$( '#message_' + currentMessage ).addClass ( 'active' );

				$( '#messageRecipient' ).html ( 'to: ' + result.data.messageRecipient );
				$( '#messageCreated' ).html ( result.data.messageCreated );
				$( '#messageTitle' ).html ( result.data.messageTitle );
				$( '#messageContent' ).html ( result.data.messageContent );
			}
			else
				console.log ();
		}
	);
}

function onMessageNew ()
{
	$( '#modal-message-create' ).modal ( 'show' );
}

function onMessageCreate ()
{
	var _data = 
	{
		messageSender: $( '#message-create-from' ).val (),
		messageRecipient: $( '#message-create-to' ).val (),
		messageTitle: $( '#message-create-title' ).val (),
		messageContent: $( '#message-create-content' ).val ()
	};
	if ( _data.messageTitle.length <= 0
		|| _data.messageContent.length <= 0 )
		return;
	overlayOn ();
	$.post 
	(
		'/api/messages',
		_data,
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

function onMessageDelete ()
{
	if ( currentMessage == undefined )
		return;

	var _delete = confirm ( 'Delete this message?' );
	if ( _delete )
	{
		$.get 
		(
			'/api/message/' + currentMessage,
			function ( result )
			{
				if ( result.success )
				{
					$.ajax
					( {
						url: '/api/message/' + result.data.messageCode + '&admin',
						type: 'DELETE'
					} ).done ( function ( result )
					{
						if ( result.success )
						{
							document.location = document.location;
						}
						else
							console.log ( result );
					} );
				}
				else
					console.log ( result );
			}
		);
	}
}