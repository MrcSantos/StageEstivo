/**
 ** Global variables:
 * @param selectedStartDate: The selected start date and time
 * @param selectedEndDate: The selected end date and time
 * @param selectedEvent: The selected event by the user
 */
var selectedStartDate, selectedEndDate, selectedEvent = null, pastSelectedEvent;

$(function () {
	$('#month_preview-calendar').fullCalendar({
		editable: false, // Makes the calendar non-editable
		weekends: false,
		titleFormat: 'MMM YYYY',
		height: "auto",
		events: "/fetch",

		header: { // Header settings
			left: 'title',
			center: '',
			right: 'pre,nex'
		},

		customButtons: {

			pre: {
				text: "<",
				click: function () {
					$('#month_preview-calendar').fullCalendar('prev');
				}
			},
			nex: {
				text: ">",
				click: function () {
					$('#month_preview-calendar').fullCalendar('next');
				}
			}
		},
		
		navLinks: true,
		navLinkDayClick: function (date, jsEvent) {
			$('#agenda-calendar').fullCalendar('gotoDate', date);
		}		
	})

	$('#agenda-calendar').fullCalendar({
		titleFormat: 'DD MMMM YYYY',
		editable: true, // Makes the calendar editable
		weekends: false,
		height: "auto",
		events: "/fetch", // Gets the events from the server from the start
		defaultView: 'agendaWeek', // Agenda view as default
		selectable: true, // Makes the calendar selectable
		eventOverlap: false, // Makes the events not stackable one above the other
		allDaySlot: false, // Removes the all-day events slot
		nowIndicator: true, // Shows current date/time indicator

		minTime: '07:00:00', // Shows day from 7:00
		maxTime: '20:00:00', // to 20:00

		businessHours: { // Darkens the area outside the work our in order to focus
			dow: [1, 2, 3, 4, 5], // Monday - Friday

			start: '9:00', // a start time
			end: '18:00', // an end time
		},

		header: { // Header settings
			left: 'today title',
			center: '',
			right: 'removeEventButton pre,nex'
		},
		footer: { // Footer settings
			left: '',
			center: '',
			right: 'toggleCalendarView toggleWeekEndDays'
		},

		customButtons: {

			pre: {
				text: "<",
				click: function () {
					$('#agenda-calendar').fullCalendar('prev');
					$('#month_preview-calendar').fullCalendar('gotoDate', $('#agenda-calendar').fullCalendar('getDate'))
				}
			},
			nex: {
				text: ">",
				click: function () {
					$('#agenda-calendar').fullCalendar('next');
					$('#month_preview-calendar').fullCalendar('gotoDate', $('#agenda-calendar').fullCalendar('getDate'))
				}
			},
			toggleWeekEndDays: {
				text: "Mostra/Nascondi i weekend",

				click: function () {
					$('#agenda-calendar').fullCalendar('option', {
						weekends: !$('#agenda-calendar').fullCalendar('option', 'weekends')
					});
					$('#month_preview-calendar').fullCalendar('option', {
						weekends: !$('#month_preview-calendar').fullCalendar('option', 'weekends')
					});
				}
			},
			toggleCalendarView: {
				text: "Show week/day",

				click: function () {
					if($('#agenda-calendar').fullCalendar("getView").viewSpec.type == "agendaWeek") {
						$('#agenda-calendar').fullCalendar('changeView', 'agendaDay');
					}
					else {
						$('#agenda-calendar').fullCalendar('changeView', 'agendaWeek');
					}
				}
			},

			/**
			 * Uses the debug function for debug purposes (DUH >.<)
			 ** DEBUG ONLY
			 */
			debug: {
				text: 'debug',

				click: function () { alert(debug()) }
			},

			/**
			 * Adds an event on the calendar on the selecter area,
			 * if none are given it will ask for it
			 *
			 * TODO: Do not overlap events when created
			 */
			addEventButton: {
				text: '+', // Button text

				click: function () {
					if (isDateSelected()) { //? If a date has been selected
						makeEvent('Ore lavorate', selectedStartDate, selectedEndDate); // Creates an event on the calendar
					}
					else { alert("No date selected") } //? If a date has NOT been selected
				}
			},

			/**
			 * Removes a selected event on the calendar,
			 * if none are given it will ask for it
			 */
			removeEventButton: {
				text: '-', // Button text

				click: function () {
					if (selectedEvent) { deleteEvent(selectedEvent._id) } //? If an event has been selected
					else { alert("No selected event") } //? If an event has NOT been selected
				}
			}
		},

		/**
		 * When the user clicks on an event
		 * Makes the selected event visually different
		 */
		eventClick: function (eventObj) {
			selectedEvent = eventObj;
			$(pastSelectedEvent).css('border-color', '');
			$(this).css('border-color', 'red');
			pastSelectedEvent = $(this);
		},

		eventDrop: function (event, delta, revertFunc, jsEvent, ui, view) {
			updateAll();
		},
		eventResize: function (event, delta, revertFunc, jsEvent, ui, view) {
			updateAll();
		},

		/**
		 * Select and unselect event handlers
		 * Sets the two global variable to correct data format when selected
		 * Resets the two global variable when deselected
		 */
		select: function (startDate, endDate) { setSelected(startDate, endDate) 
		makeEvent('Ore lavorate', startDate, endDate)},
		unselect: function (jsEvent, view) { setTimeout(() => setSelected(), 500) }
	});
});

//-Fine impostazioni FullCalendar-------------------------------------------------------//

function updateEventsOnServer(callback) {
	var events = getAllEvents();

	saveOnServer("/save", events, callback);
}

/**
 * Gets all events from calendar
 */
function getAllEvents() {
	var events = $('#agenda-calendar').fullCalendar('clientEvents'); // Gets all events from the calendar

	/**
	 * Removes the eventObject from the fetched events
	 * because it's a cyclic Json
	 * when an event is created from the calendar
	 * and it causes bugs
	 */
	for (const index in events) {
		events[index].source = undefined;
	}

	return events;
}

/**
 * Checks if a date has been selected
 */
function isDateSelected() {
	return selectedStartDate && selectedEndDate;
}

/**
 * Sets the global variables values
 */
function setSelected(start, end) {
	selectedStartDate = start;
	selectedEndDate = end;
}

/**
 * Creates an event on the calendar
 */
function makeEvent(title, start, end) {
	$('#agenda-calendar').fullCalendar('renderEvent', {
		title: title,
		start: start,
		end: end
		});

	updateAll();
}

function makeEventFromEvent(event) {
	$('#agenda-calendar').fullCalendar('renderEvent', {
		title: event.title,
		start: event.start,
		end: event.end
		});

	updateAll();
}

/**
 * Deletes an event on the calendar given the ID
 */
function deleteEvent(id) {
	$('#agenda-calendar').fullCalendar('removeEvents', id);
	updateAll();
}
function updateAll() {
	updateEventsOnServer(updateCalendars);
}

function updateCalendars() {
	$('#agenda-calendar').fullCalendar('refetchEvents');
	$('#month_preview-calendar').fullCalendar('refetchEvents');
}
function saveOnServer(url, data, callback) {
	axios({
		url: url,
		method: "post",
		data: data
	})
		.then(callback);
}

function readFromServer(url) {
	axios({
		url: url,
		method: "get"
	})
		.then(function (response) {
			return response;
		})

	return null;
}

/**
 * Debug/Test function
 ** DEBUG ONLY
 */
function debug() {
	var events = getAllEvents();
	var str = "";

	for (const index in events) {
		str += getEventInformations(events[index]) + " --- ";
	}

	return str;
}

/**
 * Because of the nature of the eventObject, in particular the resourceObject,
 * the event cannot be read as a Json object thus i had to make this function
 ** DEBUG ONLY
 */
function getEventInformations(event) {
	var str = "";

	for (const index in event) {
		str += index + ": " + event[index] + " - ";
	}

	return str;
}
