function onCategorySelect ( _id )
{
	overlayOn ();
	document.location = '/search=undefined&cat=' + _id;
	return;

	var selectedCategory = $( '#category-input' ).val ();
	if ( selectedCategory === _id )
		return;

	var _catName = $( '#category_' + _id ).val ();
	$( '#category-edit' ).html ( _catName );

	if ( selectedCategory != undefined )
		$( '#categoryCheck_' + selectedCategory ).addClass ( 'hidden' );
	$( '#category-input' ).attr ( 'value', _id );
	$( '#categoryCheck_' + _id ).removeClass ( 'hidden' );
	selectedCategory = _id;
}

function onSearch ()
{
	var _search = $( '#search-edit' ).val ().trim ();
	if ( _search.length <= 0 )
		_search = undefined;
	
	var _link = '/search=' + _search;
		selectedCategory = $( '#category-input' ).val ();
	if ( selectedCategory != undefined )
		_link += '&cat=' + selectedCategory;
	else
		_link += '&cat=all';
	
	document.location = _link;
}