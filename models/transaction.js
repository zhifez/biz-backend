var mongoose 			= require ( 'mongoose' );
	Schema 				= mongoose.Schema;
	configjs			= require ( '../config.js' );
	bizapp 				= require ( 'bizapp' );
	biz 				= bizapp ( { appId: configjs.appId } );
	helper				= require ( '../helpers/helper' );

var TransactionSchema = new Schema 
( {
	_transactionId: Schema.Types.ObjectId,
	transactionId:
	{
		type: String,
		required: true
	},
	transactionToAddress:
	{
		type: String,
		required: true
	},
	transactionAmount:
	{
		type: Number,
		required: true
	},
	transactionVerified:
	{
		type: Boolean,
		required: true,
		default: false
	}
} );

// get variable
// TransactionSchema.pre ( 'validate', function ( _next ) 
// {
// 	// this.constructor.find (); // find functions
// 	_next ();
// });

module.exports = mongoose.model ( 'Transaction', TransactionSchema );
module.exports.verifyTransaction = function ( dataId, callback )
{
	Transaction.findOne ( { _id: dataId }, function ( err, data )
	{
		if ( err )
			throw err;
		
		if ( data )
		{
			if ( data.transactionVerified )
			{
				callback ( null, true );
			}
			else
			{
				var options = 
				{
					trxId: data.transactionId,
					toAddress: data.transactionToAddress,
					amount: data.transactionAmount,
					minConfirmations: 6,
					// testnet: true // TODO: remove this when not using testnet
				};

				biz.verify ( options, ( err, result ) => 
				{
					if ( err )
					{
						callback ( err, false );
					}
					else
					{
						if ( result ) 
						{
							data.transactionVerified = true;
							Transaction.update ( { _id: data._id }, data, function ( err, data )
							{
								callback ( null, true );
							} );
						} 
						else 
							callback ( null, false );
					}
				} );
			}
		}
		else
		{
			callback ( null, false );
		}
	} );
}