var _					= require ( 'lodash' );
	helper 				= require ( '../helpers/helper' );

	Campaign			= require ( '../models' ).Campaign;
	Message				= require ( '../models' ).Message;
	Report				= require ( '../models' ).Report;

module.exports = 
{
	all: function ( req, res )
	{
		Report.find ( {}, function ( err, data )
		{
			if ( err )
				throw err;

			res.json 
			( {
				message:  data.length + ' Reports listed',
				success: true,
				data: data
			} );
		} );
	},
	add: function ( req, res )
	{
		Report.find ( { reportCampaign: req.params.id }, function ( err, data )
		{
			if ( err )
				throw err;
				
			if ( data.length > 0 )
			{
				res.json 
				( {
					message: 'Report already exist',
					success: false,
					data: data
				} );
			}
			else
			{
				var _new = new Report ( req.body );
				_new.save ( function ( err, data )
				{
					if ( err )
						throw err;

					helper.slackMsg ( '[REPORT] Campaign ' + _new.reportCampaign + ' is reported for reason: ' + _new.reportReason );
					
					res.json 
					( {
						message: 'Add Report success',
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

		Report.findOne ( _query, function ( err, data )
		{
			if ( err )
				throw err;

			if ( data ) res.json 
			( {
				message: 'Report found',
				success: true,
				data: data
			} );
			else res.json 
			( {
				message: 'Report does not exist',
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

		var _disableChange = [ '_id', 'reportCreatedBy', 'reportCampaign', 'reportCreated', 'reportUpdated' ],
			reqData = helper.filterReqData ( req.body, _disableChange );
		
		Report.findOne ( _query, function ( err, reportData )
		{
			if ( err )
				throw err;

			if ( reportData )
			{
				Report.update ( _query, reqData, function ( err, data )
				{
					if ( err )
						throw err;
						
					if ( data ) res.json 
					( {
						message: 'Report updated successfully',
						success: true,
						data: helper.updateData ( reportData, reqData )
					} );
					else res.json 
					( {
						message: 'Report update failed',
						success: false,
						error: err
					} );
				} );
			}
			else res.json 
			( {
				message: 'Report not found',
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

		Report.findOne ( _query, function ( err, data )
		{
			if ( err )
				throw err;

			if ( data )
			{
				Report.deleteOne ( _query, function ( err )
				{
					if ( err )
						throw err;

					res.json 
					( {
						message: 'Report delete successfully',
						success: true
					} );
				} );
			}
			else res.json 
			( {
				message: 'Report not found',
				success: false,
				error: err
			} );
		} );
	},
	warning: function ( req, res )
	{
		var _query = 
		{
			_id: req.params.id
		}
		Report.findOne ( _query )
		.populate ( 'reportCampaign' )
		.populate ( 'reportCreatedBy' )
		.exec ( function ( err, reportData )
		{
			if ( err )
				throw err;
			
			if ( reportData )
			{
				var _changes = 
				{
					reportStatus: 'pending'
				};
				Report.update ( _query, _changes, function ( err, data )
				{
					if ( err )
						throw err;

					var _messageContent = 
					'Your campaign: <a onclick="goto(' + "'/campaign/" + reportData.reportCampaign._id +  "'" + ')" class="biz-link text-danger">' + 
					helper.shortenText ( reportData.reportCampaign.campaignName, 20 ) +
					'</a><br>has been suspended as some users have reported it for the reason of: <span class="text-primary">' +
					reportData.reportReason +
					"</span><br><br>Please rectify your campaign as soon as possible, or it'll remain suspended.";
					
					var _warningMsg = 
					{
						messageRecipient: reportData.reportCampaign.campaignCreatedBy,
						messageSender: 'admin',
						messageTitle: 'Warning: Campaign Suspended',
						messageContent: _messageContent
					};
					_warningMsg = new Message ( _warningMsg );
					_warningMsg.save ( function ( err )
					{
						if ( err )
							throw err;

						Campaign.update ( { _id: reportData.reportCampaign._id }, { campaignSuspended: true }, function ( err )
						{
							if ( err )
								throw err;

							res.json 
							( {
								message: 'Report: warning sent',
								success: true
							} );
						} );
					} );
				} );
			}
			else res.json 
			( {
				message: 'Report not found',
				success: false,
				error: err
			} );
		} );
	},
	amend: function ( req, res )
	{
		var _query = 
		{
			reportCampaign: req.params.campaignId 
		};
		Report.update ( _query, { reportStatus: 'amended' }, function ( err, data )
		{
			if ( err )
				throw err;
			
			if ( data )
			{
				helper.slackMsg ( '[REPORT] Campaign ' + req.params.campaignId + ' has been rectified by creator.' );

				res.json 
				( {
					message: 'Report amended',
					success: true
				} );
			}
			else res.json 
			( {
				message: 'Report not found',
				success: false
			} );
		} );
	},
	unsuspend: function ( req, res )
	{
		var _query = 
		{
			_id: req.params.id 
		};
		Report.findOne ( _query )
		.populate ( 'reportCampaign' )
		.populate ( 'reportCreatedBy' )
		.exec ( function ( err, reportData )
		{
			if ( err )
				throw err;
			
			if ( reportData )
			{
				Report.update ( _query, { reportStatus: 'closed' }, function ( err, data )
				{
					if ( err )
						throw err;

					var _warningMsg = 
					{
						messageRecipient: reportData.reportCampaign.campaignCreatedBy,
						messageSender: 'admin',
						messageTitle: 'Info: Campaign Unsuspended',
						messageContent: "Thank you for rectifying your campaign's contents. Your campaign has been unsuspended."
					};
					_warningMsg = new Message ( _warningMsg );
					_warningMsg.save ( function ( err )
					{
						if ( err )
							throw err;

						Campaign.update ( { _id: reportData.reportCampaign._id }, { campaignSuspended: false }, function ( err, data )
						{
							if ( err )
								throw err;

							res.json 
							( {
								message: 'Report: Campaign unsuspended',
								success: true
							} );
						} );
					} );
				} );
			}
			else res.json 
			( {
				message: 'Report not found',
				success: false
			} );
		} );
	}
}