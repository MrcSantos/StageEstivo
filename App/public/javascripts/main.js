/**
 * Global variables:
 * - selectedStartDate: The selected start date and time
 * - selectedEndDate: The selected end date and time
 */
var selectedStartDate, selectedEndDate;

$(function () {
	$('#calendar').fullCalendar({
		defaultView: 'agendaWeek', // Agenda view as default
		selectable: true, // Makes the calendar selectable
		eventOverlap:false, // Makes the events not stackable one above the other
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
				text: '+', // Button text

				click: function () {
					if (isDateSelected()) { // If a date has been selected
						makeEvent('Ore lavorate', selectedStartDate, selectedEndDate); // Creates an event on the calendar
					}
					else { alert("Nessuna data selezionata") } // If a date has NOT been selected
				}
			}
		},

		/**
		 * Select and unselect event handlers
		 * Sets the two global variable to correct data format when selected
		 * Resets the two global variable when deselected
		 */
		select: function (startDate, endDate) {
			setSelected(startDate, endDate);
		},
		unselect: function (jsEvent, view) {
			setTimeout(() => setSelected(), 500);
		}
	});
});

function isDateSelected() { // Checks if a date has been selected
	return selectedStartDate && selectedEndDate;
}

function setSelected(start, end) { // Sets the global variables values
	selectedStartDate = start;
	selectedEndDate = end;
}

function makeEvent(title, start, end) { // Creates an event on the calendar
	$('#calendar').fullCalendar('renderEvent', {
		title: title,
		start: start,
		end: end,
		editable: true, // Makes the event editable (drag, drop and extend/reduce time)
	});
}