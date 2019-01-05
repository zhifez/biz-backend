var campaignId = null;
$( document ).ready ( function ()
{
	campaignId = $( '#campaignId' ).val ();
	setupDailyActivity ( 0 );
	setupShareData ();
} );

//--------------------------------------------------
// setup
//--------------------------------------------------
var dailyActivity = { dataIndex: 0 };
function setupDailyActivity ( index )
{
	dailyActivity.dataIndex = index;

	$.get
	( 
		'/api/campaignStatistics/dailyActivity/' + campaignId + '&' + index,
		function ( result )
		{
			if ( result.success )
			{
				dailyActivity.mainData = result.data;
				
				$( '#daTitle' ).html ( dailyActivity.mainData.title );
				$( '#daBtn_prev' ).prop ( 'disabled', ( index <= 0 ) );
				$( '#daBtn_next' ).prop ( 'disabled', ( dailyActivity.mainData.wIndexNext == undefined ) );
				
				if ( dailyActivity.chart == undefined )
				{
					var _ctx = document.getElementById ( 'chart_dailyActivity' ).getContext ( '2d' );
					dailyActivity.chart = new Chart ( _ctx, 
					{
						type: 'bar',
						data: 
						{
							labels: dailyActivity.mainData.labels,
							datasets: 
							[ {
								label: 'Daily Share(s)',
								data: dailyActivity.mainData.data,
								backgroundColor: '#F1C40F',
								borderWidth: 1
							} ]
						},
						options: 
						{
							scales: 
							{
								yAxes: 
								[ {
									ticks: 
									{
										beginAtZero: true,
										stepSize: 5,
										min: 0
									}
								} ]
							}
						}
					} );
				}

				dailyActivity.chart.data.labels = dailyActivity.mainData.labels;
				dailyActivity.chart.data.datasets[0].data = dailyActivity.mainData.data;
				dailyActivity.chart.update ();
			}
			else
				console.log ( result );
		}		
	);
}

function setupShareData ()
{
	$.get
	( 
		'/api/campaignStatistics/shareData/' + campaignId,
		function ( result )
		{
			if ( result.success )
			{
				var _mainData = result.data;

				// OVERALL SHARING PERIOD
				var _ctx = document.getElementById ( 'chart_sharePeriod' ).getContext ( '2d' );
				var _chart = new Chart ( _ctx, 
				{
					type: 'line',
					data: 
					{
						labels: _mainData.data_sharePeriod.labels,
						datasets: 
						[ {
							label: 'Shares',
							data: _mainData.data_sharePeriod.data,
							backgroundColor: '#F1C40F',
							borderWidth: 1
						} ]
					},
					options: 
					{
						scales: 
						{
							yAxes: 
							[ {
								ticks: 
								{
									beginAtZero: true,
									stepSize: 5,
									min: 0
								}
							} ]
						}
					}
				} );

				// TOP SHARING COUNTRY
				_ctx = document.getElementById ( 'chart_topShareCountry' ).getContext ( '2d' );
				_chart = new Chart ( _ctx, 
				{
					type: 'doughnut',
					data: 
					{
						labels: _mainData.data_topShareCountry.labels,
						datasets: 
						[ {
							label: 'Shares',
							data: _mainData.data_topShareCountry.data,
							backgroundColor: _mainData.data_topShareCountry.bgColors,
						} ]
					}
				} );

				// TOP VIEWING SOCIAL MEDIA
				_ctx = document.getElementById ( 'chart_topViewsSocialMedia' ).getContext ( '2d' );
				_chart = new Chart ( _ctx, 
				{
					type: 'doughnut',
					data: 
					{
						labels: _mainData.data_topViewsSocialMedia.labels,
						datasets: 
						[ {
							label: 'Views',
							data: _mainData.data_topViewsSocialMedia.data,
							backgroundColor: _mainData.data_topViewsSocialMedia.bgColors,
						} ]
					}
				} );

				// TOP VIEWING COUNTRY
				_ctx = document.getElementById ( 'chart_topViewsCountry' ).getContext ( '2d' );
				_chart = new Chart ( _ctx, 
				{
					type: 'doughnut',
					data: 
					{
						labels: _mainData.data_topViewsCountry.labels,
						datasets: 
						[ {
							label: 'Views',
							data: _mainData.data_topViewsCountry.data,
							backgroundColor: _mainData.data_topViewsCountry.bgColors,
						} ]
					}
				} );
			}
		}
	);
}

//--------------------------------------------------
// listener
//--------------------------------------------------
function onDailyActivityPrev ()
{
	setupDailyActivity ( dailyActivity.dataIndex - 1 );
}

function onDailyActivityNext ()
{
	setupDailyActivity ( dailyActivity.dataIndex + 1 );
}