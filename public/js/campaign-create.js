var campaignCategory = undefined;
function onCategorySelect ( _id )
{
	if ( campaignCategory === _id )
		return;

	if ( campaignCategory != undefined )
		$( '#categoryCheck_' + campaignCategory ).addClass ( 'hidden' );
	campaignCategory = _id;
	$( '#categoryCheck_' + campaignCategory ).removeClass ( 'hidden' );
	$( '#category-edit' ).html ( $( '#category_' + campaignCategory ).val () );
}

var selectedRegion = undefined;
function onRegionSelect ( _region )
{
	if ( selectedRegion === _region )
		return;

	if ( selectedRegion != undefined )
		$( '#regionCheck_' + selectedRegion ).addClass ( 'hidden' );
	selectedRegion = _region;
	$( '#regionCheck_' + selectedRegion ).removeClass ( 'hidden' );
	$( '#region-edit' ).html ( $( '#region_' + selectedRegion ).val () );
	$( '#region-socials' ).removeClass ( 'hidden' );
	$( '#region-socials' ).html ( $( '#regionSocial_' + selectedRegion ).val () );
}

var selectedTier = -1;
function onTierSelect ( _tierIndex, _reward )
{
	if ( _tierIndex < 0 )
	{
		$( '#modal-campaign-tier' ).modal ( 'show' );
		return;
	}

	if ( selectedTier >= 0 )
		$( '#tierSelected_' + selectedTier ).addClass ( 'hidden' );
	else
		$( '#tier-edit' ).addClass ( 'hidden' );

	selectedTier = _tierIndex;
	$( '#tierSelected_' + selectedTier ).removeClass ( 'hidden' );

	$( '#modal-campaign-tier' ).modal ( 'hide' );

	// ++_tierIndex;
	// $( '#tier-edit' ).html ( 'Tier ' + _tierIndex + ' - ' + _reward + ' TRVC' );

	onChangeStartDate ();
}

function onChangeStartDate ()
{
	var _duration = $( '#tierDuration_' + selectedTier ).val ();
		_start = moment ().format ( 'MMM Do YYYY' );
		_end = moment ().add ( _duration, 'days' ).format ( 'MMM Do YYYY' );
	$( '#date-info' ).html ( '<strong>Start Date:</strong> ' + _start + ' (today)<br><strong>End Date:</strong> ' + _end );
	$( '#date-info' ).removeClass ( 'hidden' );
}

var contentType = 'text';
function onContentType ( type )
{
	if ( contentType === type )
		return;

	var _prevType = contentType;
	contentType = type;

	$( '#content-title' ).html ( 'Content (' + type + ')' );

	$( '#' + contentType + '-edit' ).removeClass ( 'hidden' );
	$( '#' + _prevType + '-edit' ).addClass ( 'hidden' );

	$( '#btn-' + _prevType ).removeClass ( 'btn-dark' );
	$( '#btn-' + _prevType ).addClass ( 'btn-outline-dark' );

	$( '#btn-' + contentType ).removeClass ( 'btn-outline-dark' );
	$( '#btn-' + contentType ).addClass ( 'btn-dark' );
}

function onCreateCampaign ( fee )
{
	var _data =
	{
		campaignCreatedBy: $( '#creator-edit' ).val (),
		campaignName: $( '#name-edit' ).val (),
		campaignAbout: $( '#text-edit' ).val (),
		campaignContentType: contentType,
		campaignContent: '',
		campaignCategory: campaignCategory,
		campaignFee: fee,
		campaignTier: selectedTier,
		campaignRegion: selectedRegion
	};

	if ( $( '#article-editor' ).length )
		_data.campaignContent = quillEditor.root.innerHTML;

	if ( !document.getElementById( 'userAgreement' ).checked )
	{
		// BizApp.alert ( 'You are required to agree to our Terms of Use and Advertising Policy.' );
		showModal
		(
			'main',
			'Alert',
			'You are required to agree to our Terms of Use and Advertising Policy.'
		);
		return;
	}

	var _canSubmit = true;
	if ( _data.campaignCreatedBy.length <= 0 )
		_canSubmit = false;

	if ( _data.campaignName.length <= 0 )
	{
		_canSubmit = false;
		$( '#name-edit-verify' ).removeClass ( 'hidden' );
	}
	else
		$( '#name-edit-verify' ).addClass ( 'hidden' );

	if ( _data.campaignCategory == undefined )
	{
		_canSubmit = false;
		$( '#category-edit-verify' ).removeClass ( 'hidden' );
	}
	else
		$( '#category-edit-verify' ).addClass ( 'hidden' );

	if ( _data.campaignTier < 0 )
	{
		_canSubmit = false;
		$( '#tier-edit-verify' ).removeClass ( 'hidden' );
	}
	else
		$( '#tier-edit-verify' ).addClass ( 'hidden' );

	if ( _data.campaignRegionIndex < 0 )
	{
		_canSubmit = false;
		$( '#region-edit-verify' ).removeClass ( 'hidden' );
	}
	else
		$( '#region-edit-verify' ).addClass ( 'hidden' );

	var _images = $( '#imgInp' )[0].files;
	if ( _images.length <= 0 )
	{
		_canSubmit = false;
		$( '#image-upload-edit-verify' ).removeClass ( 'hidden' );
	}
	else
		$( '#image-upload-edit-verify' ).addClass ( 'hidden' );

	if ( _canSubmit )
	{
		overlayOn ();

		var _imageData = new FormData ();
		$.each ( _images, function ( index, file )
		{
			_imageData.append ( 'file-' + index, file );
		} );

		$.ajax
		( {
			url: '/api/imageUpload',
			data: _imageData,
			cache: false,
			contentType: false,
			processData: false,
			type: 'POST',
			success: function ( result )
			{
				if ( result.success )
				{
					_data.campaignImage = result.filename;

					$.ajax
					( {
						url: '/api/campaigns',
						data: _data,
						type: 'POST'
					} ).done ( function ( result )
					{
						if ( result.success )
						{
							_data = result.data;
							// console.log ( _data );
							var _amount = ( parseFloat ( _data.campaignReward ) + parseFloat ( fee ) );
							var _options =
							{
								address: '<removed mine but feel free to insert your TriveCoin wallet address>',
								amount: _amount * 100000000,
								message: 'Campaign creation'
							};
							BizApp.payToWallet ( _options, function ( error, result )
							{
								if ( error )
								{
									$.ajax
									( {
										url: '/api/campaign/' + _data._id + '&' + _data.campaignCreatedBy,
										type: 'DELETE'
									} ).done ( function ( result )
									{
										overlayOff ();
										showModal
										(
											'main',
											'Payment failed',
											error
										);
									} );
									return;
								}

								$.ajax
								( {
									url: '/api/verify',
									data: result,
									type: 'POST'
								} ).done ( function ( result )
								{
									$.ajax
									( {
										url: '/api/campaign/' + _data._id + '&' + _data.campaignCreatedBy,
										data:
										{
											campaignTransaction: result.data._id
										},
										type: 'PUT'
									} ).done ( function ( result )
									{
										if ( result.success )
										{
											document.location = '/new/' + result.data._id;
										}
										else
										{
											$.ajax
											( {
												url: '/api/campaign/' + _data._id + '&' + _data.campaignCreatedBy,
												type: 'DELETE'
											} ).done ( function ( result )
											{
												overlayOff ();
												showModal
												(
													'main',
													'Error when updating campaign',
													result.message
												);
											} );
										}
									} );
								} );
							} );
						}
						else
						{
							overlayOff ();
							showModal
							(
								'main',
								'Error when creating campaign',
								result.message
							);
						}
					} );
				}
				else
				{
					overlayOff ();
					showModal
					(
						'main',
						'Error when uploading image',
						result.message
					);
				}
			},
			error: function ( err )
			{
				showModal
				(
					'main',
					'Error when uploading image',
					'AJAX error'
				);
			}
		} );
	}
}
