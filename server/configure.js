var path 			= require ( 'path' );
	views 			= require ( './views' );
	routes 			= require ( './routes' );
	exphbs 			= require ( 'express-handlebars' );
	session			= require ( 'express-session' );
	express 		= require ( 'express' );
	bodyParser 		= require ( 'body-parser' );
	cookieParser 	= require ( 'cookie-parser' );
	morgan 			= require ( 'morgan' );
	methodOverride 	= require ( 'method-override' );
	errorHandler 	= require ( 'errorhandler' );
	moment			= require ( 'moment' );
	multer 			= require ( 'multer' );
	_				= require ( 'lodash' );
	cors 			= require ( 'cors' );
	owasp			= require ( 'owasp-password-strength-test' );
	validUrl 		= require ( 'valid-url' );
	helper 			= require ( '../helpers/helper' );
	
	jwt 			= require ( 'jsonwebtoken' );
	passport 		= require ( 'passport' );
	passportJWT 	= require ( 'passport-jwt' );
	ExtractJwt		= passportJWT.ExtractJwt;
	JwtStrategy		= passportJWT.Strategy;
	
var jwtOptions		= {};
jwtOptions.jwtFromRequest = function ( req )
{
	var token = null;
	if ( req.session.jwt )
		token = req.session.jwt;
	return token;
};
jwtOptions.secretOrKey = new Buffer ( 'bizInfluenceSecretKey', 'base64' );

module.exports = function ( app )
{
	owasp.config 
	( {
		allowPassphrases       : true,
		maxLength              : 128,
		minLength              : 8,
		minPhraseLength        : 20,
		minOptionalTestsToPass : 4,
	} );

	app.use ( function ( req, res, next ) 
	{
		res.header ( 'Access-Control-Allow-Origin', '*' );
		res.header ( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept' );
		next ();
	} );
	app.use ( cors () );
	passport.use ( new JwtStrategy ( jwtOptions, function ( jwt_payload, callback ) 
	{
		return callback ( null, jwt_payload );
	} ) );

	app.use ( morgan ( 'dev' ) );
	app.use ( multer ( 
	{ 
		dest : path.join ( __dirname, 'public/upload/temp' )
	} ).any () );
	app.use ( bodyParser.urlencoded ( { 'extended' : true, uploadDir : path.join ( __dirname, 'public/upload/temp' ) } ) );
	app.use ( bodyParser.json () );
	app.use ( session 
	( {
		secret: 'SECRET',
		resave: false,
		saveUninitialized: true,
		cookie: { jwt: '' }
	} ) );
	app.use ( methodOverride () );
	app.use ( cookieParser ( 'asdasdasd' ) );
	app.use ( passport.initialize () );
	views ( app );
	routes ( app );

	app.use ( express.static ( path.join ( __dirname, '../public' ) ) );

	if ( 'development' === app.get ( 'env' ) )
	{
		app.use ( errorHandler () );
	}

	app.engine ( 'handlebars', exphbs.create 
	( {
		defaultLayout : 'main',
		layoutsDir : app.get ( 'views' ) + '/layouts/',
		partialsDir : app.get ( 'views' ) + '/partials',
		helpers : 
		{
			times: function ( n, block ) 
			{
				var blocks = '';
				for (var a = 0; a < n; ++a) 
				{
					blocks += block.fn(a);
				}
				return blocks;
			},
			genId: function ( prefix, param, block ) 
			{
				return block.fn ( this ) + prefix + '_' + param;
			},
			genFunc: function ( func, param, block ) 
			{
				return block.fn ( this ) + func + "('" + param + "')";
			},
			genFunc2: function ( func, param0, param1, block ) 
			{
				return block.fn ( this ) + func + "('" + param0 + "','" + param1 + "')";
			},
			genFunc3: function ( func, param0, param1, param2, block ) 
			{
				return block.fn ( this ) + func + "('" + param0 + "','" + param1 + "','" + param2 +  + "')";
			},
			upFirstLetter: function ( value, block ) 
			{
				var newBlock = block.fn ( this );
					_split = value.split ( ' ' );
				_.each ( _split, function ( element, index )
				{
					if ( index > 0 )
						newBlock += ' ';
					newBlock += element.charAt ( 0 ).toUpperCase () + element.slice ( 1 );
				} );
				return newBlock;
			},
			decimize: function ( value, block ) 
			{
				return block.fn ( this ) + parseFloat ( value ).toFixed ( 2 );
			},
			decimizeBy: function ( value, deciAmt, block ) 
			{
				var _idealDeciAmt = 2;
				var _split = value.toString ().split ( '.' );
				if ( _split.length == 2 )
				{
					if ( _split[1].length > deciAmt )
					{
						var _multi = Math.pow ( 10, deciAmt );
						value = Math.round ( value * _multi );
						value = value / _multi;

						_idealDeciAmt = deciAmt;
					}
				}
				return block.fn ( this ) + parseFloat ( value ).toFixed ( _idealDeciAmt );
			},
			ifEqual: function ( value0, value1, block )
			{
				if ( value0 === value1 )
					return block.fn ( this );
				else
					return '';
			},
			ifEqualOr: function ( value0, compare0, compare1, block )
			{
				var newBlock = '';
				if ( value0 === compare0 || value0 === compare1 )
					newBlock = block.fn ( this );
				return newBlock;
			},
			ifEqualAnd: function ( value0, compare0, compare1, block )
			{
				var newBlock = '';
				if ( value0 === compare0 && value0 === compare1 )
					newBlock = block.fn ( this );
				return newBlock;
			},
			ifEqual3: function ( value0, compare0, compare1, compare2, useAnd, block )
			{
				var newBlock = '';
				if ( useAnd )
				{
					if ( value0 === compare0 && value0 === compare1 && value0 === compare2 )
						newBlock = block.fn ( this );
				}
				else
				{
					if ( value0 === compare0 || value0 === compare1 || value0 === compare2 )
						newBlock = block.fn ( this );
				}
				return newBlock;
			},
			ifNotEqual: function ( value0, value1, block )
			{
				if ( value0 != value1 )
					return block.fn ( this );
				else
					return '';
			},
			ifNotEqual2: function ( value0, compare0, compare1, useAnd, block )
			{
				var newBlock = '';
				if ( useAnd )
				{
					if ( value0 != compare0 && value0 != compare1 )
						newBlock = block.fn ( this );
				}
				else
				{
					if ( value0 != compare0 || value0 != compare1 )
						newBlock = block.fn ( this );
				}
				return newBlock;
			},
			ifNotEqual3: function ( value0, compare0, compare1, compare2, useAnd, block )
			{
				var newBlock = '';
				if ( useAnd )
				{
					if ( value0 != compare0 && value0 != compare1 && value0 != compare2 )
						newBlock = block.fn ( this );
				}
				else
				{
					if ( value0 != compare0 || value0 != compare1 || value0 != compare2 )
						newBlock = block.fn ( this );
				}
				return newBlock;
			},
			ifMoreThan: function ( value0, value1, block ) 
			{
				if ( value0 > value1 )
					return block.fn ( this );
				else
					return '';
			},
			ifMoreThanEqual: function ( value0, value1, block ) 
			{
				if ( value0 >= value1 )
					return block.fn ( this );
				else
					return '';
			},
			ifLessThan: function ( value0, value1, block ) 
			{
				if ( value0 <= value1 )
					return block.fn ( this );
				else
					return '';
			},
			stringArrayDisplay: function ( array, prefix, endfix, block ) 
			{
				var newBlock = block.fn ( this );
				_.each ( array, function ( element, index )
				{
					newBlock += prefix + element + endfix;
				} );
				return newBlock;
			},
			arrayContains: function ( array, param, block ) 
			{
				var newBlock = '';
				_.each ( array, function ( element, index )
				{
					if ( element === param || element._id === param )
					{
						newBlock = block.fn ( this );
					}
				} );
				return newBlock;
			},
			setSingularPlural: function ( value, measurement, block ) 
			{
				var newBlock = block.fn ( this );
				if ( parseInt ( value ) <= 1 )
					return newBlock + value + ' ' + measurement;
				else
					return newBlock + value + ' ' + measurement + 's';
			},
			setSingularPluralNoValue: function ( value, measurement, block ) 
			{
				var newBlock = block.fn ( this );
				if ( parseInt ( value ) <= 1 )
					return newBlock + measurement;
				else
					return newBlock + measurement + 's';
			},
			formatSocialHeader: function ( value, block )
			{
				var newBlock = block.fn ( this );
				var _split = value.split ( '-' );
				_.each ( _split, function ( element, index )
				{
					if ( index > 0 )
						newBlock += ' ';
					newBlock += element.charAt(0).toUpperCase() + element.slice(1);
				} );
				return newBlock;
			},
			formatDesc: function ( value, block )
			{
				value = value.replace ( '\n', ' \n' );
				var newBlock = block.fn ( this );
					_split = value.split ( /\s|\t/ );
				_.each ( _split, function ( element, index )
				{
					var _splitDot = element.split ( '.' ); // if it has dots in between, it's a fucking link
					if ( _splitDot.length >= 2 )
					{
						if ( validUrl.isUri ( element )
							|| element.trim ().substring ( 0, 4 ) === 'www.'
							|| element.trim ().substring ( 0, 7 ) === 'http://'
							|| element.trim ().substring ( 0, 8 ) === 'https://' )
						{
							var _link = "'" + element.trim () + "'";
							value = value.replace ( element, '<a style="color: blue; text-decoration: underline;" onclick="openLink(' + _link + ')">' + element + '</a>' );
						}
					}
				} );
				return newBlock + value;
			},
			max: function ( value, compare, block )
			{
				var newBlock = block.fn ( this );
				value = Math.max ( value, compare );
				return newBlock + value;
			},
			crop: function ( value, maxLength, block )
			{
				var newBlock = block.fn ( this );
				newBlock += value.substring ( 0, maxLength );
				if ( value.length > maxLength )
					newBlock += '...';
				return newBlock;
			},
			dateOnly: function ( value, block )
			{
				var newBlock = block.fn ( this );
				var _today = moment ();
					_date = moment ( value );
					_diff = _today.diff ( _date, 'days' );
				if ( _diff <= 0 )
					return newBlock + 'Today';
				else
					return newBlock + moment ( value ).format ( 'MMMM Do' )
			},
			listify: function ( array, title, block )
			{
				var newBlock = block.fn ( this );
				newBlock += title;
				_.each ( array, function ( element, index )
				{
					if ( index > 0 )
						newBlock += ', ';
					newBlock += helper.formatSocialHeader ( element );
				} );
				return newBlock;
			}
		}
	} ).engine );
	app.set ( 'view engine', 'handlebars' );
	
	return app;
}