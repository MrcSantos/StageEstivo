var selectedStartDate, selectedEndDate;

$(function () {
	$('#calendar').fullCalendar({
		defaultView: 'agendaWeek', // Agenda view as default
		selectable: true,
		allDaySlot: false, // Removes the all-day events slot
		nowIndicator: true, // Shows current date/time indicator
		firstDay: 1, // Starts from Mon

		minTime: '06:00:00', //* Shows day from 6:00
		maxTime: '22:00:00', //  to 22:00 *//

		header: { // Header settings
			left: 'today prev,next',
			center: 'title',
			right: 'addEventButton agendaWeek,agendaDay'
		},

		customButtons: {
			/**
			 * Adds an event on the calendar on the selecter area,
			 * if none are given it will ask for it
			 */
			addEventButton: {
				text: '+',

				click: function () {
					if (isDateSelected()) { // If a date has been selected
						makeEvent('Ore lavorate', selectedStartDate, selectedEndDate); // Creates an event on the calendar
					}
					else { alert("Nessuna data selezionata") }
				}
			}
		},

		// Select and unselect event handlers
		select: function (startDate, endDate) {
			selectedStartDate = startDate.format();
			selectedEndDate = endDate.format();
		},
		unselect: function (jsEvent, view) {
			setTimeout(() => {
				selectedStartDate = undefined;
				selectedEndDate = undefined;
			}, 1000);
		}
	});
});

function isDateSelected() { // Checks if a date has been selected
	return selectedStartDate && selectedEndDate;
}

function makeEvent(title, start, end) { // Creates an event on the calendar
	$('#calendar').fullCalendar('renderEvent', {
		title: title,
		start: start,
		end: end
	});
}