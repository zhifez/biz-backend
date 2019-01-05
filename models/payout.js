var mongoose 			= require ( 'mongoose' );
	Schema 				= mongoose.Schema;
	configjs			= require ( '../config.js' );
	bizapp 				= require ( 'bizapp' );
	biz 				= bizapp ( { appId: configjs.appId } );
	helper 				= require ( '../helpers/helper' );

	User		 		= require ( './user' );
	Transaction 		= require ( './transaction' );

var PayoutSchema = new Schema 
( {
	_payoutId: Schema.Types.ObjectId,
	payoutAddress:
	{
		type: String,
		required: true
	},
	payoutAmount:
	{
		type: Number,
		required: true
	},
	payoutTxid:
	{
		type: String,
		required: false
	},
	payoutComplete:
	{
		type: Boolean,
		required: true,
		default: false
	},
	payoutDate:
	{
		type: Date,
		required: true
	}
} );

PayoutSchema.virtual ( 'payoutFinal' ).get ( function ()
{
	return this.payoutAmount.toFixed ( 2 ) * 0.95;
} );

PayoutSchema.methods.updateDate = function () 
{
	var _currentDate = new Date ();

	if ( !this.payoutDate ) 
		this.payoutDate = _currentDate;

	return _currentDate;
}

PayoutSchema.pre ( 'validate', function ( _next ) 
{
	this.updateDate ();
	
	_next ();
} );

module.exports = mongoose.model ( 'Payout', PayoutSchema );
module.exports.getPaymentStatus = function ( data, callback )
{
	if ( data.payoutComplete )
	{
		data.payoutStatus = 'complete';
		data.payoutStatusClass = 'complete';
		callback ();
	}
	else
	{
		data.payoutStatus = 'incomplete';
		data.payoutStatusClass = 'incomplete';
		if ( data.payoutTxid != undefined )
		{
			Transaction.findOne ( { transactionId: data.payoutTxid }, function ( err, txData )
			{
				if ( err )
					throw err;

				if ( txData )
				{
					if ( txData.transactionVerified )
					{
						data.payoutTxid = undefined;
						data.save ( function ( err )
						{
							data.payoutStatus = 'txid-invalid';
							data.payoutStatusClass = 'incomplete';
							callback ();
						} );
					}
					else
					{
						Transaction.verifyTransaction ( txData._id, function ( err, verified )
						{
							if ( err )
							{
								data.payoutStatus = 'txid-invalid';
								data.payoutStatusClass = 'incomplete';
								data.payoutTxid = undefined;
							}
							else
							{
								if ( verified )
								{
									data.payoutComplete = true;
									data.payoutDate = new Date ();
									data.payoutStatus = 'complete';
									data.payoutStatusClass = 'complete';
								}
								else
								{
									data.payoutStatus = 'pending';
									data.payoutStatusClass = 'pending';
								}
							}

							data.save ( function ( err )
							{
								callback ();
							} );
						} );
					}
				}
				else
				{
					var options = 
					{
						trxId: data.payoutTxid,
						toAddress: data.payoutAddress,
						amount: helper.satoshitize ( data.payoutFinal ),
						minConfirmations: 6
					};

					biz.verify ( options, ( error, result ) => 
					{
						if ( error )
						{
							data.payoutTxid = undefined;
							data.save ( function ( err )
							{
								data.payoutStatus = 'txid-invalid';
								data.payoutStatusClass = 'incomplete';
								callback ();
							} );
						}
						else
						{
							var _tx = new Transaction 
							( {
								transactionId: data.payoutTxid,
								transactionToAddress: data.payoutAddress,
								transactionAmount: helper.satoshitize ( data.payoutFinal )
							} );
							_tx.save ( function ( err )
							{
								if ( result )
								{
									data.payoutStatus = 'complete';
									data.payoutStatusClass = 'complete';
								}
								else
								{
									data.payoutStatus = 'pending';
									data.payoutStatusClass = 'pending';
								}
								callback ();
							} );
						}
					} );
				}
			} );
		}
		else
			callback ();
	}
}
module.exports.getMinWithdrawalTRVC = function ( callback )
{
	var _min = 2; // USD // change to 5 USD later
	helper.getRateTRVC ( 'USD', _min, function ( trvc )
	{
		trvc = Math.round ( trvc );
		callback ( trvc );
	} );
}