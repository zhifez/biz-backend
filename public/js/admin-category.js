function setupCategory ( data )
{
	var _parent = $( '#categoryList' );
		_ele = $( '#category_empty' ).clone ();
		_nameEle = _ele.find ( '#category-name' );
		_updateBtn = _ele.find ( '#category-update' );
		_deleteBtn = _ele.find ( '#category-delete' );

	_nameEle.html ( data.categoryName );
	_updateBtn.attr ( 'onclick', "onCategoryUpdate('" + data._id + "')" );
	_deleteBtn.attr ( 'onclick', "onCategoryDelete('" + data._id + "')" );
	_parent.append ( _ele );
	_ele.attr ( 'id', 'category_' + data._id );
	_ele.removeClass ( 'hidden' );
}

function onCategoryAdd ()
{
	$.post
	(
		'/api/categories',
		{
			categoryName: $( '#new-category' ).val ()
		},
		function ( result )
		{
			if ( result.success )
				document.location = document.location;
				// setupCategory ( result.data );
			else
				console.log ( result.message );
		}
	);
}

function onCategoryUpdate ( _id )
{
	var _data = 
	{
		categoryName: $( '#category_' + _id ).find ( '#category-name-edit' ).val ()
	};
	if ( _data.categoryName.length <= 0 )
	{
		alert ( 'Input is empty.' );
		return;
	}

	$.ajax
	( {
		url: '/api/category/' + _id,
		data: _data,
		type: 'PUT'
	} ).done ( function ( result )
	{
		if ( result.success )
			document.location = document.location;
		else
			console.log ( result.message );
	} );
}

function onCategoryDelete ( _id )
{
	var _delete = confirm ( 'Are you sure you want to delete this category?' );
	if ( _delete )
	{
		$.ajax
		( {
			url: '/api/category/' + _id,
			type: 'DELETE'
		} ).done ( function ( result )
		{
			if ( result.success )
				document.location = document.location;
				// $( '#category_' + _id ).addClass ( 'hidden' );
			else
				console.log ( result.message );
		} );
	}
}