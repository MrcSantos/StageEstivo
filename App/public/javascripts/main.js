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

function conferma(text, yes, no) {
	if (confirm(text)) yes()
	else no()
}

//----------------------------------------------------------------------------------------------------//

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

//----------------------------------------------------------------------------------------------------//

const server = {
	/**
	 * Fetches the events from SalesForce server
	 */
	fetchEvents: (ownerId, start, end, callback) => {
		Visualforce.remoting.Manager.invokeAction('{!$RemoteAction.cPresenze.getEventi}', ownerId, start, end, callback);
	},

	/**
	 * Writes the events in SalesForce server
	 */
	writeEvents: (events, callback) => {
		Visualforce.remoting.Manager.invokeAction('{!$RemoteAction.cPresenze.putEventi}', events, callback);
	},

	/**
	 * Deletes an event from the SalesForce server
	 */
	deleteEvents: (events, callback) => {
		Visualforce.remoting.Manager.invokeAction('{!$RemoteAction.cPresenze.removeEventi}', events, callback);
	}
};

//--------------------------------------------------//

const client = {
	/**
	 * Displays all teh events on the calendar
	 */
	displayEvents: (events) => {
		mainCal.fullCalendar("renderEvents", events, false);
		preCal.fullCalendar("renderEvents", events, false);
	},

	/**
	 * Creates an event on the calendar
	 */
	createEvent: (event) => {
		mainCal.fullCalendar("renderEvent", event, false);
		preCal.fullCalendar("renderEvent", event, false);
	},

	/**
	 * Changes the event type
	 */
	changeEventType: (event) => {
		if (event.type === "In Sede") { event.type = "Remoto" }
		else { event.type = "In Sede" }
	},

	/**
	 * Deletes an event on the calendar
	 */
	deleteEvent: (event) => {
		mainCal.fullCalendar('removeEvents', event._id);
		preCal.fullCalendar('removeEvents', event._id);
	}
};

//--------------------------------------------------//

const template = {
	/**
	 * From template to events (week)
	 */
	parse: (template) => {
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

	/**
	 * From events to template of the specified date
	 */
	templatify: (date) => {
		var templateEvent = {};
		var template = Array();

		var startOfTheWeek = moment(date).startOf("week").startOf("day");
		var theDayAfter = moment(startOfTheWeek).add(1, "day");

		for (var i = 0; i < 7; i++) {
			template.push(Array())

			dayEvents = cal.getEvents(moment(startOfTheWeek).add(i, "day"), moment(theDayAfter).add(i, "day"));

			for (const event in dayEvents) {
				templateEvent = {};

				templateEvent.type = dayEvents[event].type;
				templateEvent.start = moment(dayEvents[event].start).hour();
				templateEvent.end = moment(dayEvents[event].end).hour();

				template[i].push(templateEvent);
			}
		}

		return template;
	},

	/**
	 * Fetches the current set template from the server
	 */
	fetch: (ownerId, callback) => {
		Visualforce.remoting.Manager.invokeAction('{!$RemoteAction.cPresenze.leggiTemplate}', ownerId, callback);
	},

	/**
	 * Saves the template as the current template on the server
	 */
	save: (template, callback) => {
		Visualforce.remoting.Manager.invokeAction('{!$RemoteAction.cPresenze.scriviTemplate}', template, callback);
	}
};

//--------------------------------------------------//

var cal = {
	/**
	 * Gets all the rendered events from calendar from start to end
	 */
	getEvents: (start, end) => {
		return mainCal.fullCalendar("clientEvents", (event) => {
			return moment(event.start).isBetween(moment(start), moment(end), null, "(]");
		});
	},

	selectEvent: (event) => {
		$(pastSelectedEvent).css('border-color', '');
		$(event).css('border-color', 'red');
	},

	isDateSelected: () => {
		return selectedStartDate && selectedEndDate;
	},

	setSelected: (start, end) => {
		selectedStartDate = start;
		selectedEndDate = end;
	}
};

//--------------------------------------------------//

var util = {
	displayServerEvents: (ownerId, start, end) => {
		server.fetchEvents(ownerId, start, end, (fetched) => {
			client.displayEvents(fetched);
		});
	},

	displayServerTemplate: (ownerId) => {
		template.fetch(ownerId, (fetched) => {
			client.displayEvents(template.parse(fetched));
		})
	},

	writeParsedTemplateOnServer: () => {
		template.save(template.templatify(mainCal.fullCalendar("getDate")));
	},

	createEventAndSave: (event) => {
		event.type = "In Locale";

		server.writeEvents(event, () => {
			client.createEvent(event);
		});
	},

	deleteEventAndSave: (event) => {
		server.deleteEvents(event);
		client.deleteEvent(event);
	}
};

//--------------------------------------------------//

/**
 * Saves the data on the server
 * 
 * @param url The server url
 * @param data The data that needs to be sent
 * @param callback The callback function, executed after the call has been made
 */


/**
 * Gets the data from the server
 * 
 * @param url The server url
 * 
 * TODO: Specify the start date and the end date
 */




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

//----------------------------------------------------------------------------------------------------//

$(() => {
	preCal = $('#month_preview-calendar');
	mainCal = $('#agenda-calendar');

	//--------------------------------------------------//

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
			cal.selectEvent(this);	// Select effect on the current event	
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
			cal.setSelected(startDate, endDate);
			makeEvent('Ore lavorate', startDate, endDate);
		},

		/**
		 * Resets the two global variable when deselected (with a delay)
		 */
		unselect: (jsEvent, view) => { setTimeout(() => cal.setSelected(null, null), 500) }
	});

	setTimeout(() => {
		client.setAsTemplate()
	}, 2000);
	/*
		function init() {
			readFromServer("/fetch/template", (res) => {
				res = res.data;
	
				var events = templateParser(res);
	
				for (const event in events) {
					mainCal.fullCalendar("renderEvents", events[event], false);
					preCal.fullCalendar("renderEvents", events[event], false);
				}
			})
		}*/
});

//-Fine impostazioni FullCalendar---Inizio funzioni globali-----------------------------------------------------//