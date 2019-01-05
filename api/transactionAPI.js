var _					= require ( 'lodash' );
	helper 				= require ( '../helpers/helper' );

	Transaction			= require ( '../models' ).Transaction;

module.exports = 
{
	all: function ( req, res )
	{
		Transaction.find ( {}, function ( err, data )
		{
			if ( err )
				throw err;
			
			res.json 
			( {
				message:  data.length + ' Transactions listed',
				success: true,
				data: data
			} );
		} );
	},
	add: function ( req, res )
	{
		Transaction.findOne ( { transactionId: req.body.transactionId }, function ( err, data )
		{
			if ( err )
				throw err;
			
			if ( data )
			{
				res.json 
				( {
					message: 'Transaction ID already exists',
					success: false
				} );
			}
			else
			{
				var _new = new Transaction ( req.body );
				_new.save ( function ( err, data )
				{
					if ( err )
						throw err;

					res.json 
					( {
						message: 'Add Transaction success',
						success: true,
						data: data
					} );
				} );
			}
		} );
	},
	get: function ( req, res )
	{
		Transaction.findById ( req.params.txid ).exec ( function ( err, data )
		{
			if ( err )
				throw err;

			res.json 
			( {
				message: 'Transaction found',
				success: true,
				data: data
			} );
		} );
	},
	update: function ( req, res )
	{
		Transaction.findById ( req.params.txid ).exec ( function ( err, data )
		{
			if ( err )
				throw err;
			
			Transaction.update ( { _id: req.params.txid }, req.body, function ( err )
			{
				res.json 
				( {
					message: 'Transaction updated',
					success: true,
					data: data
				} );
			} );
		} );
	}
}