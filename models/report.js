var mongoose 			= require ( 'mongoose' );
	Schema 				= mongoose.Schema;
	helper				= require ( '../helpers/helper' );

var ReportSchema = new Schema 
( {
	_reportId: Schema.Types.ObjectId,
	reportCampaign:
	{
		type: Schema.Types.ObjectId,
		ref: 'Campaign',
		required: true
	},
	reportCreatedBy:
	{
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	reportReason:
	{
		type: String,
		required: true
	},
	reportRemarks:
	{
		type: String,
		required: false
	},
	reportStatus:
	{
		type: String,
		required: true,
		enum: [ 'reported', 'pending', 'amended', 'closed' ],
		default: 'reported'
	},
	reportCreated:
	{
		type: Date,
		required: true
	},
	reportUpdated:
	{
		type: Date,
		required: true
	}
} );

ReportSchema.methods.updateDate = function () 
{
	var _currentDate = new Date ();

	this.reportUpdated = _currentDate;
	if ( !this.reportCreated ) 
		this.reportCreated = _currentDate;

	return _currentDate;
}

ReportSchema.pre ( 'validate', function ( _next ) 
{
	this.updateDate ();

	// this.constructor.find (); // find functions
	_next ();
});

module.exports = mongoose.model ( 'Report', ReportSchema );
module.exports.reportReasons = function ( callback )
{
	callback 
	( [
		"It's a spam.",
		"It's misleading or a scam.",
		"It's offensive.",
		"It's violent or prohibited content.",
		"It's sexually inappropriate.",
		"Other reason."
	] ); 
}