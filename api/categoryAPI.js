var _					= require ( 'lodash' );
	helper 				= require ( '../helpers/helper' );

	Category			= require ( '../models' ).Category;

module.exports = 
{
	all: function ( req, res )
	{
		Category.getAll ( function ( data )
		{
			res.json 
			( {
				message: data.length + ' Categories listed',
				success: true,
				data: data
			} );
		} );
	},
	add: function ( req, res )
	{
		Category.find ( { categorySlug: helper.convertToSlug ( req.body.categoryName ) }, function ( err, data )
		{
			if ( err )
				throw err;
				
			if ( data.length > 0 )
			{
				res.json 
				( {
					message: 'Category already exist',
					success: false,
					data: data
				} );
			}
			else
			{
				var _new = new Category ( req.body );
				_new.save ( function ( err, data )
				{
					if ( err )
						throw err;
						
					res.json 
					( {
						message: 'Add Category success',
						success: true,
						data: data
					} );
				} );
			}
		} );
	},
	get: function ( req, res )
	{
		var _query = 
		{
			_id: req.params.id
		};

		Category.findOne ( _query, function ( err, data )
		{
			if ( err )
				throw err;

			if ( data ) res.json 
			( {
				message: 'Category found',
				success: true,
				data: data
			} );
			else res.json 
			( {
				message: 'Category does not exist',
				success: false
			} );
		} );
	},
	update: function ( req, res )
	{
		var _query = 
		{
			_id: req.params.id
		};

		var _disableChange = [ '_id', 'categoryCreated', 'categoryUpdated' ],
			reqData = helper.filterReqData ( req.body, _disableChange );
		
		Category.findOne ( _query, function ( err, categoryData )
		{
			if ( err )
				throw err;

			if ( categoryData )
			{
				Category.update ( _query, reqData, function ( err, data )
				{
					if ( err )
						throw err;
						
					if ( data ) res.json 
					( {
						message: 'Category updated successfully',
						success: true,
						data: helper.updateData ( categoryData, reqData )
					} );
					else res.json 
					( {
						message: 'Category update failed',
						success: false,
						error: err
					} );
				} );
			}
			else res.json 
			( {
				message: 'Category cannot be found',
				success: false,
				error: err
			} );
		} );
	},
	delete: function ( req, res )
	{
		var _query = 
		{
			_id: req.params.id
		};

		Category.findOne ( _query, function ( err, data )
		{
			if ( err )
				throw err;

			if ( data )
			{
				Category.deleteOne ( _query, function ( err )
				{
					if ( err )
						throw err;

					res.json 
					( {
						message: 'Category delete successfully',
						success: true
					} );
				} );
			}
			else res.json 
			( {
				message: 'Category cannot be found',
				success: false,
				error: err
			} );
		} );
	}
}