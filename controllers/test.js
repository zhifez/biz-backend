module.exports = 
{
	wallet: function ( req, res )
	{
		var viewModel = {};
		res.render ( 'wallet', viewModel );
	}
}