$( document ).ready ( function ()
{
	if ( $( '#article-editor' ).length )
		formatImgTags ();
} );

function onEditCampaign ()
{
	$( '#name-display' ).addClass ( 'hidden' );
	$( '#creator-display' ).addClass ( 'hidden' );
	$( '#about-display' ).addClass ( 'hidden' );
	$( '#article-display' ).addClass ( 'hidden' );

	$( '#campaign-edit-btn' ).addClass ( 'hidden' );
	$( '#campaign-delete-btn' ).addClass ( 'hidden' );
	$( '#campaign-rectify-btn' ).addClass ( 'hidden' );
	$( '#campaign-statistics-btn' ).addClass ( 'hidden' );
	$( '#campaign-share-btn' ).addClass ( 'hidden' );
	$( '#category-display' ).addClass ( 'hidden' );

	$( '#name-edit-section' ).removeClass ( 'hidden' );
	
	$( '#about-edit-title' ).removeClass ( 'hidden' );
	var contentType = $( '#content-type' ).val ();
	switch ( contentType )
	{
	case 'article':
		$( '#article-edit' ).removeClass ( 'hidden' );
		break;

	default:
		$( '#about-edit' ).removeClass ( 'hidden' );
		break;
	}
	$( '#image-edit-btn' ).removeClass ( 'hidden' );
	$( '#campaign-save-btn' ).removeClass ( 'hidden' );
	$( '#category-section' ).removeClass ( 'hidden' );
}

function onCancelEditCampaign ()
{
	$( '#name-display' ).removeClass ( 'hidden' );
	$( '#about-display' ).removeClass ( 'hidden' );
	$( '#article-display' ).removeClass ( 'hidden' );
	$( '#creator-display' ).removeClass ( 'hidden' );

	$( '#campaign-edit-btn' ).removeClass ( 'hidden' );
	$( '#campaign-delete-btn' ).removeClass ( 'hidden' );
	$( '#campaign-rectify-btn' ).removeClass ( 'hidden' );
	$( '#campaign-statistics-btn' ).removeClass ( 'hidden' );
	$( '#campaign-share-btn' ).removeClass ( 'hidden' );
	$( '#category-display' ).removeClass ( 'hidden' );

	$( '#name-edit-section' ).addClass ( 'hidden' );
	$( '#about-edit-title' ).addClass ( 'hidden' );
	$( '#about-edit' ).addClass ( 'hidden' );
	$( '#article-edit' ).addClass ( 'hidden' );
	$( '#image-edit-btn' ).addClass ( 'hidden' );
	$( '#campaign-save-btn' ).addClass ( 'hidden' );
	$( '#category-section' ).addClass ( 'hidden' );
}

function onCategorySelect ( _catId, _catName )
{
	var _prevId = $( '#category-edit-id' ).val ();
	if ( _prevId === _catId )
		return;
	
	$( '#category-edit' ).html ( _catName );
	$( '#category-edit-id' ).attr ( 'value', _catId );

	$( '#categoryCheck_' + _prevId ).addClass ( 'hidden' );
	$( '#categoryCheck_' + _catId ).removeClass ( 'hidden' );
}

function onDoneEditCampaign ( _id )
{
	var _name = $( '#name-edit' ).val ();
		_about = $( '#about-edit' ).val ();
		_category = $( '#category-edit-id' ).val ();

	if ( _name.length <= 0 )
	{
		$( '#name-edit-alert' ).removeClass ( 'hidden' );
		return;
	}
	else
		$( '#name-edit-alert' ).addClass ( 'hidden' );

	var _data =	
	{
		campaignName: _name,
		campaignAbout: _about,
		campaignContent: '',
		campaignCategory: _category
	};

	if ( $( '#article-editor' ).length )
		_data.campaignContent = quillEditor.root.innerHTML;
	
	var _images = $( '#imgInp' )[0].files;
	if ( _images.length > 0 )
	{
		var _imageData = new FormData ();
		$.each ( _images, function ( index, file )
		{
			_imageData.append ( 'file-' + index, file );	
		} );

		// delete old image
		var _currentImage = $( '#img-default' ).text ().trim ();
			_split = _currentImage.split ( '/' );
		$.post
		(
			'/api/imageDelete/' + _split[ _split.length - 1 ],
			function ( result )
			{
				if ( result.success )
				{
					// upload new image
					$.ajax 
					( {
						url: '/api/imageUpload',
						data: _imageData,
						cache: false,
						contentType: false,
						processData: false,
						type: 'POST',
						success: function ( data )
						{
							_data.campaignImage = data.filename;
							$( '#img-upload' ).attr ( 'src', data.filename );

							updateCampaign ( _data, _id );
						},
						error: function ( err )
						{
							console.log ( err );
						}
					} );
				}
			}
		);
	}
	else
		updateCampaign ( _data, _id );
}

function updateCampaign ( _data, _id )
{
	var _user = $( '#current-user' ).text ().trim ();
	$.ajax 
	( {
		url: '/api/campaign/' + _id + '&' + _user,
		data: _data,
		type: 'PUT'
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

function onDeleteCampaign ( _id )
{
	var _user = $( '#current-user' ).text ().trim ();
	$.get 
	(
		'/api/campaign/' + _id + '&' + _user,
		function ( result )
		{
			// console.log ( result );
			if ( result.success )
			{
				showModal 
				(
					'main',
					'Delete "' + result.data.campaignName + '"?',
					'<p>Are you sure you want to delete this campaign?</p><p class="text-danger mt-3 mb-1">This action cannot be undone.</p>',
					{
						classes: 'btn btn-danger',
						text: 'Delete',
						onclick: "deleteCampaign('" + _id + "')"
					}
				);
			}
		}
	);
}

function deleteCampaign ( _id )
{
	$( '#mainModal' ).modal ( 'hide' );

	var _user = $( '#current-user' ).text ().trim ();
	$.ajax 
	( {
		url: '/api/campaign/' + _id + '&' + _user,
		type: 'DELETE'
	} ).done ( function ( result )
	{
		if ( result.success )
			document.location = '/home';
		else
			console.log ( result );
	} );
}

function onRectifyCampaign ( _campaignId )
{
	$.post
	(
		'/api/reportAmend/' + _campaignId,
		function ( result )
		{
			if ( result.success )
			{
				showModal 
				(
					'main',
					'Campaign Rectification',
					"Thank you for taking the effort. We'll reevaluate your campaign as soon as possible."
				);
			}
			else
				console.log ( result );
		}
	);
}