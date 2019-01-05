function showModal ( type, title, content, btnSet )
{
	var _modalName = '#modal-' + type;

	$( _modalName + '-title' ).html ( title );
	$( _modalName + '-body' ).html ( content );
	$( _modalName ).modal ( 'show' );

	var _btnConfirm = $( _modalName + '-btnConfirm' );
	if ( btnSet != null )
	{
		_btnConfirm.removeClass ( 'hidden' );

		if ( btnSet.classes != undefined )
		{
			_btnConfirm.removeClass ();
			_btnConfirm.addClass ( btnSet.classes );
		}
		if ( btnSet.text != undefined )
			_btnConfirm.html ( btnSet.text );
		if ( btnSet.onclick != undefined )
			_btnConfirm.attr ( 'onclick', btnSet.onclick );
	}
	else
		_btnConfirm.addClass ( 'hidden' );
	
	$( _modalName ).modal ( 'show' );
}

function hideModal ( type )
{
	var _modalName = '#modal-' + type;
	$( _modalName ).modal ( 'hide' );
}