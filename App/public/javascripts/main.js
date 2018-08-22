/**
 ** Global variables:
 * @param selectedStartDate: The selected start date and time
 * @param selectedEndDate: The selected end date and time
 * @param selectedEvent: The selected event by the user
 */
var selectedStartDate, selectedEndDate, selectedEvent = null;

$(function () {
	$('#calendar').fullCalendar({
		events: "/fetch",
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
			left: 'today prev,next debug',
			center: 'title',
			right: 'addEventButton,removeEventButton agendaWeek,agendaDay'
		},

		customButtons: {
			debug: {
				text: 'debug',

				click: function () {
					alert(debug());
				}
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
						var currentEvent = {
							title: 'Ore lavorate',
							start: selectedStartDate,
							end: selectedEndDate
						}
						var events = $('#calendar').fullCalendar('clientEvents');
						for (const index in events) {
							events[index].source = undefined
						}

						saveOnServer("/save", events, function (status) {
							makeEvent(currentEvent.title, currentEvent.start, currentEvent.end); // Creates an event on the calendar
						});
					}
					else { alert("Nessuna data selezionata") } //? If a date has NOT been selected
				}
			},

			/**
			 * Removes a selected event on the calendar,
			 * if none are given it will ask to delete all events
			 * 
			 * TODO: Check that an event is selected before deleting
			 * !Otherwise it will erase all the events
			 */
			removeEventButton: {
				text: '-', // Button text

				click: function () {
					/**
					 * Deletes the selected event only
					 * @param _id: It's the id given to FullCalendar of the selected event
					 */
					deleteEvent(selectedEvent._id);
				}
			}
		},

		/**
		 * When the user clicks on an event
		 * 
		 * TODO: Make the selected event visually different
		 */
		eventClick: function (eventObj) {
			selectedEvent = eventObj;
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
			//unselectEvent(selectedEvent);
			setTimeout(() => setSelected(), 500);
		}
	});
});

//-Fine impostazioni FullCalendar-------------------------------------------------------//

// Checks if a date has been selected
function isDateSelected() {
	return selectedStartDate && selectedEndDate;
}

// Sets the global variables values
function setSelected(start, end) {
	selectedStartDate = start;
	selectedEndDate = end;

	if (!isDateSelected()) {
		selectedEvent = null;
	}
}

// Creates an event on the calendar
function makeEvent(title, start, end) {
	$('#calendar').fullCalendar('renderEvent', {
		title: title,
		start: start,
		end: end,
		editable: true, // Makes the event editable (drag, drop and extend/reduce time)
	});
}

// Deletes an event on the calendar given the ID
function deleteEvent(id) {
	$('#calendar').fullCalendar('removeEvents', id);
}

function saveOnServer(url, data, callback) {
	axios({
		url: url,
		method: "post",
		data: data
	})
		.then(callback)
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
 ** Debug/Test function only
 */
function debug() {
	var events = $('#calendar').fullCalendar('clientEvents');
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