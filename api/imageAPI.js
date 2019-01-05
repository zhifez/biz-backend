var _					= require ( 'lodash' );
	helper 				= require ( '../helpers/helper' );

	Image				= require ( '../models' ).Image;

module.exports = 
{
	list: function ( req, res )
	{
		Image.find ( {} )
		.populate ( 'imageUser' )
		.exec ( function ( data )
		{
			res.json 
			( {
				message: data.length + ' Images listed',
				success: true,
				data: data
			} );
		} );
	},
	create: function ( req, res )
	{
		Image.find ( { imageName: req.body.imageName }, function ( err, data )
		{
			if ( err )
				throw err;
				
			if ( data.length > 0 )
			{
				res.json 
				( {
					message: 'Image already exist',
					success: false,
					data: data
				} );
			}
			else
			{
				var _new = new Image ( req.body );
				_new.save ( function ( err, data )
				{
					if ( err )
						throw err;
						
					res.json 
					( {
						message: 'Add Image success',
						success: true,
						data: data
					} );
				} );
			}
		} );
	},
	imageById: function ( req, res, next, id )
	{
		Image.findById ( id ).exec ( function ( err, data )
		{
			if ( err || !data )
				return res.status ( 400 ).json 
				( { 
					error: 'Image not found'
				} );

			req.imageData = data;
			next ();
		} );
	},
	get: function ( req, res )
	{
		res.json 
		( {
			message: 'Image found',
			success: true,
			data: req.imageData
		} );
	},
	delete: function ( req, res )
	{
		req.imageData.remove ( function ( err )
		{
			if ( err )
				throw err;

			res.json 
			( {
				message: 'Image delete successfully',
				success: true
			} );
		} );
	}
}