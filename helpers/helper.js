var _ 					= require ( 'lodash' );
	moment 				= require ( 'moment' ); 

	helper 				= {};

	configjs			= require ( '../config.js' );
	SlackNode			= require ( 'slack-node' );
	slack	 			= new SlackNode ();

slack.setWebhook ( configjs.slackWebhook );

helper.filterReqData = function ( reqData, removeList )
{
	_.forEach ( reqData, function ( value, key )
	{
		if ( removeList.indexOf ( key ) >= 0 )
		{
			delete reqData[key];
		}
	} );
	return reqData;
}

helper.sortASC = function ( array, dateVarName )
{
	array.sort ( function compare ( a, b ) 
	{
		var dateA = moment ( a[ dateVarName ] );
			dateB = moment ( b[ dateVarName ] );
		return dateA.diff ( dateB );
	} );
}

helper.sortDESC = function ( array, dateVarName )
{
	array.sort ( function compare ( a, b ) 
	{
		var dateA = moment ( a[ dateVarName ] );
			dateB = moment ( b[ dateVarName ] );
		return dateB.diff ( dateA );
	} );
}

helper.updateData = function ( originalData, replaceWithData ) 
{
	_.forEach ( replaceWithData, function ( value, key ) 
	{
		originalData[key] = value;
	} );
	return originalData;
}

helper.satoshitize = function ( value ) 
{
	return value * 100000000;
}

helper.getRate = function ( code, callback )
{
	var _rate = 1;
	request ( 'https://trivecoin.org/api/rates/', function ( err, res, body )
	{
		if ( err )
			throw err;
		
		var _ratesData = JSON.parse ( body );
		_.each ( _ratesData, function ( element, index )
		{
			if ( element.code === code )
			{
				_rate = parseFloat ( element.rate );
			}
		} );
		callback ( _rate );
	} );
}

helper.getRateTRVC = function ( code, value, callback )
{
	this.getRate ( code, function ( _rate )
	{
		value = ( value / _rate );
		callback ( value );
	} );
}

helper.convertToSlug = function ( value )
{
	value = value.toLowerCase ();
	var _split = value.split ( ' ' );
	value = '';
	_.each ( _split, function ( element, index )
	{
		if ( index > 0 )
			value += '-';
		value += element;	
	} );
	return value;
}

helper.shortenText = function ( value, maxLength )
{
	if ( value.length > maxLength )
		value = value.substring ( 0, maxLength ) + '...';
	return value;
}

helper.generateSecretCode = function ( codeLength )
{
	var _possibility = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789';
		_code = '';
	for ( var a=0; a<20; ++a )
		_code += _possibility.charAt ( Math.floor ( Math.random () * _possibility.length ) );
	return _code;
}

helper.formatSocialHeader = function ( value )
{
	var _format = '';
		_split = value.split ( '-' );
	_.each ( _split, function ( element, index )
	{
		if ( index > 0 )
			_format += ' ';
		_format += element.charAt ( 0 ).toUpperCase () + element.slice ( 1 );
	} );
	return _format;
}

helper.slackMsg = function ( message )
{
	slack.webhook 
	( {
		channel: '#bizinfluence-admin',
		username: 'bizBot',
		text: message
	}, function ( err, res ) 
	{
		console.log ( res );
	} );
}

module.exports = helper;