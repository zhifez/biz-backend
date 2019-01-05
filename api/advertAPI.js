var _					= require ( 'lodash' );
	helper 				= require ( '../helpers/helper' );

	Advert				= require ( '../models' ).Advert;

module.exports = 
{
	list: function ( req, res )
	{
		Advert.find ( {}, function ( err, data )
		{
			if ( err )
				throw err;
				
			res.json 
			( {
				message: data.length + ' Adverts listed',
				success: true,
				data: data
			} );
		} );
	},
	create: function ( req, res )
	{
		var _new = new Advert ( req.body );
		_new.save ( function ( err, data )
		{
			if ( err )
				throw err;
				
			res.json 
			( {
				message: 'Add Advert success',
				success: true,
				data: data
			} );
		} );
	},
	advertById: function ( req, res, next, id )
	{
		Advert.findById ( id ).exec ( function ( err, data )
		{
			if ( err || !data )
				return res.status ( 400 ).json 
				( { 
					error: 'Advert not found'
				} );
				
			req.advertData = data;
			next ();
		} );
	},
	get: function ( req, res )
	{
		let advertData = req.advertData;
		res.json 
		( {
			message: 'Advert found',
			success: true,
			data: req.advertData
		} );
	},
	update: function ( req, res )
	{
		let advertData = req.advertData;
		advertData = _.extend ( advertData, req.body ); // NEW
		advertData.save ( function ( err )
		{
			if ( err )
				throw err;

			res.json 
			( {
				message: 'Advert updated',
				success: true,
				data: advertData
			} );
		} );
	},
	delete: function ( req, res )
	{
		req.advertData.remove ( function ( err )
		{
			if ( err )
				throw err;

			res.json 
			( {
				message: 'Advert deleted',
				success: true
			} );
		} );
	}
}