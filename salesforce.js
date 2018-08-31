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

const server = {
	fetchEvents: (ownerId, start, end, callback) => {
		Visualforce.remoting.Manager.invokeAction('{!$RemoteAction.cPresenze.getEventi}', ownerId, start, end, callback);
	},
	writeEvents: (events, callback) => {
		Visualforce.remoting.Manager.invokeAction('{!$RemoteAction.cPresenze.putEventi}', events, callback);
	},
	deleteEvents: (events, callback) => {
		Visualforce.remoting.Manager.invokeAction('{!$RemoteAction.cPresenze.removeEventi}', events, callback);
	},

	//----------------------------------------------------------------------------------------------------------------------//

	fetchTemplate: (ownerId, callback) => {
		Visualforce.remoting.Manager.invokeAction('{!$RemoteAction.cPresenze.leggiTemplate}', ownerId, callback);
	},
	writeTemplate: (template, callback) => {
		Visualforce.remoting.Manager.invokeAction('{!$RemoteAction.cPresenze.scriviTemplate}', template, callback);
	}
};

const client = {
	displayEvents: (events) => {
		mainCal.fullCalendar("renderEvents", events, false);
		preCal.fullCalendar("renderEvents", events, false);
	},
	createEvent: (event) => {
		mainCal.fullCalendar("renderEvent", event, false);
		preCal.fullCalendar("renderEvent", event, false);
	},
	changeEventType: (event) => {
		if (event.type === "In Sede") { event.type = "Remoto" }
		else { event.type = "In Sede" }
	},

	//----------------------------------------------------------------------------------------------------------------------//

	parseTemplate: (template) => {
		for (const day in template) {
			currentDay = template[day];
			for (const event in currentDay) {
				currentEvent = currentDay[event];
				currentEvent.start = moment(mainCal.fullCalendar("getDate").startOf("week").startOf("day")).add(day, "day").add(currentEvent.start, "hours");
				currentEvent.end = moment(mainCal.fullCalendar("getDate").startOf("week").startOf("day")).add(day, "day").add(currentEvent.end, "hours");
			}
		}

		return template
	},

	setAsTemplate: () => {
		console.log(mainCal.fullCalendar("getDate"));

		weekEvents = mainCal.fullCalendar("clientEvents", (event) => {

			return moment(event.start).isBetween();
		})

	}
};







function templateParser(template) {
	for (const day in template) {
		currentDay = template[day];
		for (const event in currentDay) {
			currentEvent = currentDay[event];
			currentEvent.start = moment(mainCal.fullCalendar("getDate").startOf("week").startOf("day")).add(day, "day").add(currentEvent.start, "hours");
			currentEvent.end = moment(mainCal.fullCalendar("getDate").startOf("week").startOf("day")).add(day, "day").add(currentEvent.end, "hours");
		}
	}

	return template
}

//Modal Open
function openModal() {
	$('#backdrop').addClass('slds-backdrop--open');
	$('#modal').addClass('slds-fade-in-open');
}

//Modal Close
function closeModal() {
	$('#modal').removeClass('slds-fade-in-open');
	$('#backdrop').removeClass('slds-backdrop--open');
}

$(() => {
	init();
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

		//events: "/fetch", // TODO: Taremoto/sedee the events from SalesForce database
		editable: false, // Makes theremoto/sedecalendar non-editable

		/**
		 * Header settings
		 */
		header: {
			left: 'title', // Displays remoto/sedehe scoped date on the left
			center: '',
			right: 'pre,nex' // Displays the two custom buttons
		},

		footer: {
			left: '', // Displays the scoped date on the left
			center: '',
			right: 'report closeMonth' // Displays the two custom buttons
		},

		/**
		 * Custom buttons settings
		 */
		customButtons: {
			report: {
				text: "Report",

				click: () => {
					openModal();
				}
			},

			closeMonth: {
				text: "Chiudi mese",

				click: () => {
					alert("Funzione non ancora supportata");
				}
			},

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
		//events: "/fetch", // TODO: Take the events from SalesForce database

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
			left: 'title', // Shows the "today" button current scoped date
			center: 'makeTemplate makeRemote',
			right: 'removeEventButton pre,nex' // Shows the custom buttons
		},

		/**
		 * footer settings
		 */
		footer: {
			left: 'undo',
			center: '',
			right: 'toggleCalendarView toggleWeekEndDays' // Shows the custom buttons
		},

		/**
		 * Custom buttons settings
		 */
		customButtons: {
			makeTemplate: {
				text: "Rendi template",

				click: () => {
					alert("Funzione non ancora supportata");
				}
			},

			makeRemote: {
				text: "Rendi remoto/sede",

				click: () => {
					alert("Funzione non ancora supportata");
				}
			},

			undo: {
				text: "Undo",

				click: () => {
					alert("Funzione non ancora supportata");
				}
			},

			pre: {
				text: "<", // Button text

				click: () => {
					init()
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
				text: 'Rimuovi', // Button text

				click: function () {
					if (selectedEvent) { deleteEvent(selectedEvent) }
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

	client.setAsTemplate();

	function init() {
		readFromServer("/fetch/template", (res) => {
			res = res.data;

			var events = templateParser(res);

			for (const event in events) {
				mainCal.fullCalendar("renderEvents", events[event], false);
				preCal.fullCalendar("renderEvents", events[event], false);
			}
		})
	}
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
function deleteEvent(event) {
	console.log(event);
	mainCal.fullCalendar('removeEvents', event._id);
	writeOnServer("/delete", event);
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

	writeOnServer("/save", events, callback);
}


/**
 * Saves the data on the server
 * 
 * @param url The server url
 * @param data The data that needs to be sent
 * @param callback The callback function, executed after the call has been made
 */
function writeOnServer(data, callback) {
	Visualforce.remoting.Manager.invokeAction('{!$RemoteAction.cPresenze.putEventi}', data, callback);
}

/**
 * Gets the data from the server
 * 
 * @param url The server url
 * 
 * TODO: Specify the start date and the end date
 */
function readFromServer(ownerId, start, end, callback) {
	Visualforce.remoting.Manager.invokeAction('{!$RemoteAction.cPresenze.getEventi}', ownerId, start, end, callback);
}

function conferma(text, yes, no) {
	if (confirm(text)) yes()
	else no()
}

function generateReport(oldReport) {
	if (oldReport) {
		newReport = generateReport();
	}
	else {
		events = getAllEvents(); // TODO: prendere gli eventi del mese dal database
		template = getAllEvents(); // TODO: prendere il template dal database

		var giorno = {
			"data": "",
			"orePresente": 0,
			"oreAssente": 0,
			"causale": ""
		}

		var report = {
			"giorni": Array(giorno),
			"oreTotali": 0
		}

		for (const index in events) {

		}

		return report
	}
}












