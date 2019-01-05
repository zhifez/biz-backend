var express = require ( 'express' );
	config = require ( './server/configure' );
	app = express ();
	mongoose = require ( 'mongoose' );
	configjs = require ( './config' );

app.set ( 'port', process.env.PORT || configjs.port );
app.set ( 'views', __dirname + '/views' );
app = config ( app );

// mongoose.connect ( 'mongodb://zhifez:123456789Abcd@localhost:27017/bizinfluence' );
mongoose.connect ( configjs.mongodb );
mongoose.connection.on ( 'open', function ()
{
	console.log ( 'Mongoose connected.' );
} );

var server = app.listen ( app.get ( 'port' ), function ()
{
	console.log ( 'Server is up : http://localhost:' + app.get ( 'port' ) );
} );

var automate = function ()
{
	var host = 'http://localhost:' + app.get ( 'port' );
	request ( host + '/auto/tokens', function ( err, res, body )
	{
		console.log ( 'AUTO-TOKEN:', body );
	} );
};
setInterval ( automate, 3600000 ); // call every hour