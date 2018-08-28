/**
 ** Global variables:
 * @param selectedStartDate The selected start date and time
 * @param selectedEndDate The selected end date and time
 * @param selectedEvent The selected event by the user
 */
var selectedStartDate = null, selectedEndDate = null, selectedEvent = null, pastSelectedEvent = null;

/**
 ** Gets the calendars
 * @param preCal The small calendar which serves as preview of the current or selected date
 * @param mainCal The main calendar in which you can modify the events
 */
var preCal, mainCal;

$(() => {
	preCal = $('#month_preview-calendar');
	mainCal = $('#agenda-calendar');

	/**
	 * Renders the calendar with the options
	 */
	preCal.fullCalendar({
		defaultView: 'month', // Month view as default
		weekends: false, // Hides the weekend days
		firstDay: 1, // Monday as first day
		titleFormat: 'MMM YYYY', // Edits the title date format
		height: "auto", // Automatically adapts the calendar to the correct height

		events: "/fetch", // TODO: Take the events from SalesForce database
		editable: false, // Makes the calendar non-editable

		/**
		 * Header settings
		 */
		header: {
			left: 'title', // Displays the scoped date on the left
			center: '',
			right: 'pre,nex' // Displays the two custom buttons
		},

		/**
		 * Custom buttons settings
		 */
		customButtons: {
			pre: {
				text: "<", // Button text

				click: () => { preCal.fullCalendar('prev') } // Goes to the previous date
			},

			nex: {
				text: ">", // Button text
				click: () => { preCal.fullCalendar('next') } // Goes to the next date
			}
		},

		navLinks: true, // Enables clickable day number
		navLinkDayClick: (date) => { mainCal.fullCalendar('gotoDate', date) } // Makes the main calendar go to the selected date on the preview calendar
	})

	/**
	 * Renders the calendar with the options
	 */
	mainCal.fullCalendar({
		defaultView: 'agendaWeek', // Agenda view as default
		weekends: false, // Hides the weekend days
		firstDay: 1, // Monday as first day
		editable: true, // Makes the calendar edit the events
		selectable: true, // Makes the calendar selectable
		height: "auto", // Automatically adapts the calendar to the correct height
		titleFormat: 'DD MMMM YYYY', // Edits the title date format
		allDaySlot: false, // Removes the all-day events slot
		nowIndicator: true, // Shows current date/time indicator

		eventOverlap: false, // Makes the events not stackable one above the other
		events: "/fetch", // TODO: Take the events from SalesForce database

		minTime: '07:00:00', // Shows day from 7:00
		maxTime: '20:00:00', // to 20:00

		/**
		 * Darkens the area outside the work our in order to focus
		 */
		businessHours: {
			dow: [1, 2, 3, 4, 5], // Monday - Friday

			start: '9:00', // a start time
			end: '18:00', // an end time
		},

		/**
		 * Header settings
		 */
		header: {
			left: 'today title', // Shows the "today" button current scoped date
			center: '',
			right: 'removeEventButton pre,nex' // Shows the custom buttons
		},

		/**
		 * footer settings
		 */
		footer: {
			left: '',
			center: '',
			right: 'toggleCalendarView toggleWeekEndDays' // Shows the custom buttons
		},

		/**
		 * Custom buttons settings
		 */
		customButtons: {
			pre: {
				text: "<", // Button text

				click: () => {
					mainCal.fullCalendar('prev'); // Goes to the previous date
					preCal.fullCalendar('gotoDate', mainCal.fullCalendar('getDate')); // Makes the preview go to the changed date
				}
			},

			nex: {
				text: ">", // Button text

				click: () => {
					mainCal.fullCalendar('next'); // Goes to the next date
					preCal.fullCalendar('gotoDate', mainCal.fullCalendar('getDate')); // Makes the preview go to the changed date
				}
			},

			/**
			 * Toggles the current weekend settings, from hidden to shown and vice versa
			 */
			toggleWeekEndDays: {
				text: "Mostra/Nascondi i weekend", // Button text

				click: () => {
					var weekendsOption = mainCal.fullCalendar('option', 'weekends'); // Gets the current weekend option

					/**
					 * Sets the opposite of the option for both calendars
					 */
					mainCal.fullCalendar('option', { weekends: !weekendsOption });
					preCal.fullCalendar('option', { weekends: !weekendsOption });
				}
			},

			/**
			 * Toggles the current calendar view, from week to day and vice versa
			 */
			toggleCalendarView: {
				text: "Show week/day", // Button text

				click: () => {
					var currentView = mainCal.fullCalendar("getView").viewSpec.type; // Gets the current view

					/**
					 * Changes the current view based on the current one
					 */
					if (currentView == "agendaWeek") { mainCal.fullCalendar('changeView', 'agendaDay') }
					else { mainCal.fullCalendar('changeView', 'agendaWeek') }
				}
			},

			/**
			 * Removes a selected event on the calendar,
			 * if none are given it will notify it
			 */
			removeEventButton: {
				text: '-', // Button text

				click: function () {
					if (selectedEvent) { deleteEvent(selectedEvent._id) }
					else { alert("No selected event") }
				}
			}
		},

		// Event listeners

		/**
		 * Makes the selected event visually different
		 * when the user clicks on an event
		 */
		eventClick: function (currentEvent) {
			selectedEvent = currentEvent;
			selectEvent(this);	// Select effect on the current event	
			pastSelectedEvent = $(this);
		},

		/**
		 * When an event has been dropped
		 * 
		 * TODO: Make the calls to update correctly only the modified event
		 */
		eventDrop: (event, delta, revertFunc, jsEvent, ui, view) => { updateAll() },

		/**
		 * When an event has been resized
		 * 
		 * TODO: Make the calls to update correctly only the modified event
		 */
		eventResize: (event, delta, revertFunc, jsEvent, ui, view) => { updateAll() },

		/**
		 * Sets the two global variable to correct data format when selected
		 * and renders the event
		 */
		select: (startDate, endDate) => {
			setSelected(startDate, endDate);
			makeEvent('Ore lavorate', startDate, endDate);
		},

		/**
		 * Resets the two global variable when deselected (with a delay)
		 */
		unselect: (jsEvent, view) => { setTimeout(() => setSelected(null, null), 500) }
	});
});

//-Fine impostazioni FullCalendar---Inizio funzioni globali-----------------------------------------------------//

/**
 * Creates an event on the calendar
 * 
 * TODO: update the information on the server only of the new event
 */
function makeEvent(title, start, end) {
	mainCal.fullCalendar('renderEvent', {
		title: title,
		start: start,
		end: end
	});

	updateAll();
}

/**
 * Deletes an event on the calendar given the ID
 *
 * TODO: update the information on the server only of the deleted event
 */
function deleteEvent(id) {
	mainCal.fullCalendar('removeEvents', id);
	updateAll();
}

/**
 * Decorates the event with a red border
 * 
 * @param event The current event
 */
function selectEvent(event) {
	$(pastSelectedEvent).css('border-color', '');
	$(event).css('border-color', 'red');
}

/**
 * Gets all the rendered events from calendar
 */
function getAllEvents() {
	var events = mainCal.fullCalendar('clientEvents'); // Gets all events from the calendar

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
function updateAll() {
	updateEventsOnServer(updateCalendars);
}

function updateCalendars() {
	mainCal.fullCalendar('refetchEvents');
	preCal.fullCalendar('refetchEvents');
}
function updateEventsOnServer(callback) {
	var events = getAllEvents();

	saveOnServer("/save", events, callback);
}


/**
 * Saves data on the server
 * 
 * @param url The server url
 * @param data The data that needs to be sent
 * @param callback The callback function, executed after the call has been made
 */
function saveOnServer(url, data, callback) {
	/**
	 * Axios POST call with the data
	 */
	axios({
		url: url,
		method: "post",
		data: data
	})
		.then(callback); // executes the callback function after the call
}

/**
 * Gets the data from the server
 * 
 * @param url The server url
 * 
 * TODO: Specify the start date and the end date
 */
function readFromServer(url) {
	/**
	 * Axios GET call from the server
	 */
	axios({
		url: url,
		method: "get"
	})
		.then((response) => { return response }) // Returns the response from the server

	return null;
}