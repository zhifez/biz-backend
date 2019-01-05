function share ( _type )
{
	var options = 
	{
		title: $( '#share-title' ).val (),
		url: 'https://' + location.hostname + '/influence/' + $( '#share-id' ).val ()
	}
	var _url = Share.parser ( _type, options );
	console.log ( _type, _url );
	BizApp.openExternalLink ( { url: _url }, function ( err, res ) 
	{
		console.log ( res );
	} );
}
