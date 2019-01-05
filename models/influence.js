var mongoose 			= require ( 'mongoose' );
	Schema 				= mongoose.Schema;
	path 				= require ( 'path' );
	moment 				= require ( 'moment' );
	_					= require ( 'lodash' );
	ip					= require ( 'ip' );

	Campaign 			= require ( './campaign' );
	User 				= require ( './user' );

var InfluenceSchema = new Schema 
( {
	_influenceId: Schema.Types.ObjectId,
	influenceType:
	{
		type: String,
		required: true
	},
	influenceCampaign:
	{
		type: String,
		required: true
	},
	influenceUser:
	{
		type: String,
		required: true
	},
	influenceViews:
	{
		type: [String],
		required: false
	},
	influenceComplete:
	{
		type: Boolean,
		required: true,
		default: false
	},
	influenceCreated:
	{
		type: Date,
		required: true,
		default: Date.now
	},
	influenceUpdated:
	{
		type: Date,
		required: true,
		default: Date.now
	}
} );

// get variable
InfluenceSchema.virtual ( 'referralLink' ).get ( function ()
{
	return '/' + this.influenceCampaign + '&' + this.influenceType + '&' + this.influenceUser;
} );

// get set variable
// InfluenceSchema.virtual ( 'variableName' ).set ( function ( _param )
// {
// 	this._param = _param;
// } ).get ( function ()
// {
// 	return this._param;
// } );

InfluenceSchema.methods.hasView = function ( view )
{
	var _hasView = false;
	_.each ( this.influenceViews, function ( element, index )
	{
		if ( ip.isEqual ( element, view ) )
			_hasView = true;	
	} );
	return _hasView;
}

InfluenceSchema.methods.updateDate = function () 
{
	var _currentDate = new Date ();

	if ( !this.influenceUpdated )
		this.influenceUpdated = _currentDate;
	if ( !this.influenceCreated ) 
		this.influenceCreated = _currentDate;

	return _currentDate;
}

InfluenceSchema.pre ( 'validate', function ( _next ) 
{
	// do actions here before validation begin
	this.updateDate ();
	
	// this.constructor.find (); // find functions
	_next ();
});


module.exports = mongoose.model ( 'Influence', InfluenceSchema );
module.exports.viewsReachedTarget = function ( influenceData, callback )
{
	Campaign.findOne ( { _id: influenceData.influenceCampaign }, function ( err, campaignData )
	{
		if ( err )
			throw err;
		
		if ( campaignData 
			&& !influenceData.influenceComplete 
			&& influenceData.influenceViews.length > 1
			&& influenceData.influenceViews.length > campaignData.campaignTargetPerInfluence )
		{
			console.log ( 'influence complete!' );
			influenceData.influenceComplete = true;
			influenceData.influenceUpdated = new Date ();
			callback ();
		}
		else
			callback ();
	} );
}