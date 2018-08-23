/**
 ** Global variables:
 * @param selectedStartDate: The selected start date and time
 * @param selectedEndDate: The selected end date and time
 * @param selectedEvent: The selected event by the user
 */
var selectedStartDate, selectedEndDate, selectedEvent = null;

$(function () {
	$('#month_preview-calendar').fullCalendar({
		height: "auto",
		firstDay: 1, // Starts from Mon
		events: "/fetch",

		header: { // Header settings
			left: 'title',
			center: '',
			right: ''
		}
	})

	$('#agenda-calendar').fullCalendar({
		height: "auto",
		events: "/fetch", // Gets the events from the server from the start
		defaultView: 'agendaWeek', // Agenda view as default
		selectable: true, // Makes the calendar selectable
		eventOverlap: false, // Makes the events not stackable one above the other
		allDaySlot: false, // Removes the all-day events slot
		nowIndicator: true, // Shows current date/time indicator
		firstDay: 1, // Starts from Mon

		minTime: '07:00:00', // Shows day from 7:00
		maxTime: '20:00:00', // to 20:00

		businessHours: { // Darkens the area outside the work our in order to focus
			dow: [1, 2, 3, 4, 5], // Monday - Friday

			start: '9:00', // a start time
			end: '18:00', // an end time
		},

		header: { // Header settings
			left: 'today prev,next',
			center: 'title',
			right: 'addEventButton,removeEventButton agendaWeek,agendaDay'
		},
		footer: { // Header settings
			left: '',
			center: '',
			right: 'toggleWeekEndDays'
		},

		customButtons: {

			toggleWeekEndDays: {
				text: "Mostra/Nascondi i weekend",

				click: function () {
					$('#agenda-calendar').fullCalendar('option', {
						weekends: !$('#agenda-calendar').fullCalendar('option', 'weekends')
					});					
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
					else { alert("Nessuna data selezionata") } //? If a date has NOT been selected
				}
			},

			/**
			 * Removes a selected event on the calendar,
			 * if none are given it will ask for it
			 */
			removeEventButton: {
				text: '-', // Button text

				click: function () {
					if (selectedEvent) { deleteEvent(selectedEvent._id)	} //? If an event has been selected
					else { alert("Nessun evento selezionato") } //? If an event has NOT been selected
				}
			}
		},

		/**
		 * When the user clicks on an event
		 *
		 * TODO: Make the selected event visually different
		 */
		eventClick: function (eventObj) {	selectedEvent = eventObj },

		eventDrop: function( event, delta, revertFunc, jsEvent, ui, view ) {
			updateEventsOnServer();
		},
		eventResize: function( event, delta, revertFunc, jsEvent, ui, view ) {
			updateEventsOnServer();
		},

		/**
		 * Select and unselect event handlers
		 * Sets the two global variable to correct data format when selected
		 * Resets the two global variable when deselected
		 */
		select: function (startDate, endDate) { setSelected(startDate, endDate) },
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

	if (!isDateSelected()) {
		selectedEvent = null;
	}
}

/**
 * Creates an event on the calendar
 */
function makeEvent(title, start, end) {
	$('#agenda-calendar').fullCalendar('renderEvent', {
		title: title,
		start: start,
		end: end,
		editable: true, // Makes the event editable (drag, drop and extend/reduce time)
	});

	updateAll();
}

function makeEventFromEvent(event) {
	$('#agenda-calendar').fullCalendar('renderEvent', {
		title: event.title,
		start: event.start,
		end: event.end,
		editable: true, // Makes the event editable (drag, drop and extend/reduce time)
	});

	updateEventsOnServer();
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
