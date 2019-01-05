var helper 				= require ( '../helpers/helper' );
	fs 					= require ( 'fs' );
	path 				= require ( 'path' );
	moment 				= require ( 'moment' );
	resizeImg			= require ( 'resize-img' );
	sizeOf				= require ( 'image-size' );
	im					= require ( 'imagemagick' );

	HomeCon				= require ( '../controllers' ).Home;
	
	Campaign 			= require ( '../models' ).Campaign;

var formatImage = function ( originalImage, maxNormal, maxThumb, callback )
{
	var _split = originalImage.split ( '.' );
		_imageName = _split[0] + '_thumbnail.' + _split[1];
		_pathThumb = path.resolve ( './public/' + _imageName );
		_path = path.resolve ( './public/' + originalImage );

	if ( fs.existsSync ( _path ) )
	{
		async.times ( 2, function ( index, next )
		{
			if ( index == 0 )
			{
				var _size = sizeOf ( fs.readFileSync ( _path ) );
				if ( _size.width > maxNormal )
				{
					im.resize 
					( {
						srcPath: _path,
						dstPath: _path,
						width: maxNormal
					}, function ( err, stdout, stderr )
					{
						if ( err ) 
							throw err;
						
						next ();
					} );
				}
				else
					next ();
			}
			else
			{
				im.resize 
				( {
					srcPath: _path,
					dstPath: _pathThumb,
					width: maxThumb
				}, function ( err, stdout, stderr )
				{
					if ( err ) 
						throw err;
					
					next ();
				} );
			}
		}, function ( err )
		{
			callback ();
		} );
	}
	else
		callback ();
}

var deleteImage = function ( imageName, callback )
{
	var imageExists = false;
	async.times ( 2, function ( index, next )
	{
		if ( index > 0 )
		{
			var _split = imageName.split ( '.' );
			imageName = _split[0] + '_thumbnail.' + _split[1];
		}
		var _path = path.resolve ( './public/' + imageName );
		if ( fs.existsSync ( _path ) )
		{
			imageExists = true;
			fs.unlink ( _path, function ( err )
			{
				if ( err )
					throw err;

				next ();
			} );
		}
		else
			next ();
	}, function ( err )
	{
		callback ( imageExists );
	} );
}

module.exports = 
{
	index: function ( req, res )
	{
		Campaign.find ( {}, null, { sort: { 'campaignUpdated' : 1 } }, function ( err, data )
		{
			if ( err )
				throw err;
			
			if ( data.length <= 0 )
			{
				res.json 
				( {
					message: 'No campaign available',
					success: false,
					data: data
				} );
			}
			else
			{
				res.json
				( {
					message: data.length + ' campaigns listed',
					success: true,
					data: data
				} );
			}
		} );
	},
	create: function ( req, res )
	{
		helper.getRate ( 'USD', function ( rate )
		{
			Campaign.getProcessingFee ( function ( fee )
			{
				if ( req.body.campaignReward <= 0 
					|| req.body.campaignFee == undefined
					|| req.body.campaignFee < fee.trvc )
				{
					res.json 
					( {
						message: 'Add Campaign failed (' + req.body.campaignReward + '/' + req.body.campaignFee + ')',
						success: false,
						error: req.body.campaignReward + '/' + req.body.campaignFee
					} );
					return;
				}

				Campaign.getPricingTier ( req.body.campaignTier, function ( tierData )
				{
					if ( tierData )
					{
						var _campaign = new Campaign ( req.body );
						_campaign.campaignReward = tierData.reward;
						_campaign.campaignInfluence = tierData.influence;
						_campaign.campaignTargetPerInfluence = tierData.targetPerInfluence;
						_campaign.campaignStartDate = moment ();
						_campaign.campaignEndDate = moment ( _campaign.campaignStartDate ).add ( tierData.duration, 'days' );
						_campaign.campaignRateTRVC = rate;
						_campaign.save ( function ( err, data )
						{
							if ( err )
								throw err;
		
							if ( data )
							{
								res.json 
								( {
									message: 'Add Campaign success',
									success: true,
									data: data
								} );
							}
							else
							{
								deleteImage ( _campaign.campaignImage, function ( isDeleted )
								{
									res.json 
									( {
										message: 'Add Campaign failed',
										success: false,
										error: err
									} );
								} );
							}
						} );
					}
					else
					{
						deleteImage ( req.body.campaignImage, function ( isDeleted )
						{
							res.json 
							( {
								message: 'Unable to retrieve tier data',
								success: false
							} );
						} );
					}
				} );
			} );
		} );
	},
	get: function ( req, res )
	{
		var _query = 
		{
			_id: req.params.id,
		};

		Campaign.findOne ( _query, function ( err, data )
		{
			if ( err )
				throw err;
			
			if ( data )
			{
				res.json 
				( {
					message: 'Get Campaign success',
					success: true,
					data: data
				} );
			}
			else
			{
				res.json 
				( {
					message: 'Get Campaign failed',
					success: false,
					error: err
				} );
			}
		} );
	},
	update: function ( req, res )
	{
		var _query = 
		{
			_id: req.params.id,
			campaignCreatedBy: req.params.user
		};

		var _disableChange = 
			[ 
				'_id', 
				'campaignReward', 
				'campaignInfluence', 
				'campaignStartDate', 
				'campaignEndDate', 
				// 'campaignTransaction', 
				'campaignCreatedBy', 
				'campaignCreated', 
				'campaignUpdated', 
				'campaignSuspended', 
				'campaignDeleted', 
				'campaignRateTRVC'
			],
			reqData = helper.filterReqData ( req.body, _disableChange );
		
		Campaign.findOne ( _query, function ( err, campaignData )
		{
			if ( err )
				throw err;
				
			if ( campaignData )
			{
				var _hasTransaction = true;
				if ( campaignData.campaignTransaction == null 
					|| campaignData.campaignTransaction.length <= 0 )
					_hasTransaction = false;
				Campaign.update ( _query, reqData, function ( err )
				{
					if ( err )
						throw err;

					if ( !_hasTransaction )
					{
						if ( campaignData.campaignTransaction != null
							&& campaignData.campaignTransaction.length > 0 )
						{
							helper.slackMsg 
							( 
								'[CAMPAIGN] New campaign created: ' + _campaign.campaignName + 
								' | ' + _campaign.campaignReward + ' TRVC, ' +
								_campaign.campaignInfluence + ' Influences, ' + 
								_campaign.campaignTargetPerInfluence + ' Views Per Share | start: ' +
								moment ( _campaign.campaignStartDate ).format ( 'MMM Do' ) + ', end: ' +
								moment ( _campaign.campaignEndDate ).format ( 'MMM Do' )
							);
						}
					}
					
					campaignData = helper.updateData ( campaignData, reqData );
					campaignData.populate ( 'campaignCategory', function ( err )
					{
						res.json 
						( {
							message: 'Campaign updated successfully',
							success: true,
							data: campaignData
						} );
					} );
				} );
			}
			else res.json 
			( {
				message: 'Campaign cannot be found',
				success: false,
				error: err
			} );
		} );
	},
	delete: function ( req, res )
	{
		var _query = 
		{
			_id: req.params.id,
			campaignCreatedBy: req.params.user
		};

		Campaign.findOne ( _query, function ( err, campaignData )
		{
			if ( err )
				throw err;
				
			if ( campaignData )
			{
				campaignData.campaignDeleted = true;
				campaignData.save ( function ( err, data )
				{
					if ( err )
						throw err;

					deleteImage ( campaignData.campaignImage, function ( isDeleted )
					{
						if ( isDeleted ) res.json 
						( {
							message: 'Campaign delete successfully',
							success: true,
							data: null
						} );
						else res.json 
						( {
							message: 'Campaign delete successfully; image not found',
							success: true,
							data: null
						} );
					} );
				} );
			}
			else res.json 
			( {
				message: 'Campaign cannot be found',
				success: false,
				error: err
			} );
		} );
	},
	deletePermanent: function ( req, res )
	{
		var _query = 
		{
			_id: req.params.id
		};

		Campaign.findOne ( _query, function ( err, campaignData )
		{
			if ( err )
				throw err;
				
			if ( campaignData )
			{
				Campaign.deleteOne ( _query, function ( err )
				{
					if ( err )
						throw err;

					deleteImage ( campaignData.campaignImage, function ( isDeleted )
					{
						if ( isDeleted ) res.json 
						( {
							message: 'Campaign delete successfully',
							success: true,
							data: null
						} );
						else res.json 
						( {
							message: 'Campaign delete successfully; image not found',
							success: true,
							data: null
						} );
					} );
				} );
			}
			else res.json 
			( {
				message: 'Campaign cannot be found',
				success: false,
				error: err
			} );
		} );
	},
	imageUpload: function ( req, res )
	{
		var maxNormal = ( req.params.maxNormal != undefined ) ? req.params.maxNormal : 1024;
		var maxThumb = ( req.params.maxThumb != undefined ) ? req.params.maxThumb : 300;

		var saveImage = function ()
		{
			var _file = req.files[0];
				_tempPath = _file.path;
				_ext = path.extname ( _file.originalname ).toLowerCase ();

			if ( _ext === '.png'
				|| _ext === '.jpg'
				|| _ext === '.jpeg'
				|| _ext === '.gif' )
			{
				var _filename = helper.generateSecretCode ( 10 ) + _ext;
					_targetPath = path.resolve ( './public/upload/' + _filename );
				
				fs.open ( _targetPath, 'wx', function ( err, fd )
				{
					if ( err && err.code === 'EEXIST' ) // filename already exists, do it again
					{
						saveImage ();
					}
					else
					{
						fs.rename ( _tempPath, _targetPath, function ( err )
                        {
							formatImage ( '/upload/' + _filename, maxNormal, maxThumb, function ()
							{
								res.json 
								( {
									message: 'Image uploaded successfully.',
									success: true,
									filename: '/upload/' + _filename
								} );
							} );
                        } );
					}
				} );
			}
			else
			{
				fs.unlink ( _tempPath, function ( err )
				{
					if ( err ) 
						throw err;

					res.json 
					( {
						message: 'Only image files are allowed.',
						success: false
					} );
				} );
			}
		};
		saveImage ();
	},
	imageDelete: function ( req, res )
	{
		deleteImage ( req.params.imageName, function ( isDeleted )
		{
			if ( isDeleted ) res.json 
			( {
				message: 'Image deleted',
				success: true
			} );
			else res.json 
			( {
				message: 'Image does not exist',
				success: true
			} );
		} );
	},
	emptyUpdate: function ( req, res )
	{
		res.json 
		( {
			message: 'Nothing to update',
			// success: true,
			// data: data
		} );
	}
}