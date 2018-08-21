$(function () {
	$('#calendar').fullCalendar({
		defaultView: 'agendaWeek',
		selectable: true,
		allDaySlot: false,
		nowIndicator: true,
		minTime: '06:00:00',
		maxTime: '22:00:00',
		firstDay: 1,
		
		header: {
			left: 'today prev,next',
			center: 'title',
			right: 'addEventButton agendaWeek,agendaDay'
		},

		customButtons: {
			addEventButton: {
				text: '+',
				click: function () {
					var dateStr = prompt('Enter a date in YYYY-MM-DD format');
					var date = moment(dateStr);

					if (date.isValid()) {
						var title = prompt('Enter a title');

						$('#calendar').fullCalendar('renderEvent', {
							title: title,
							start: date,
							allDay: true
						});
						alert('Great. Now, update your database...');
					} else {
						alert('Invalid date.');
					}
				}
			}
		}


	});
});