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
	fetchEvents: (start, end, callback) => {
		start = moment(start).format("x");
		end = moment(end).format("x");

		cPresenze.getEventi(userId, start, end, callback);
	},

	/**
	 * Writes the events in SalesForce server
	 */
	writeEvent: (event, callback) => {
		event.start = moment(event.start).format("x")
		event.end = moment(event.end).format("x")

		var events = Array(util.c2s(event))

		cPresenze.putEventi(events, callback);
	},

	writeEvents: (events, callback) => {
		for (const event in events)
			events[event].start = moment(events[event].start).format("x")
		events[event].end = moment(events[event].end).format("x")

		var events = util.c2s(events)

		cPresenze.putEventi(events, callback);
	},

	/**
	 * Deletes an event from the SalesForce server
	 */
	deleteEvents: (event, callback) => {
		event.start = moment(event.start).format("x")
		event.end = moment(event.end).format("x")

		var events = Array(util.c2s(event))
		cPresenze.removeEventi(events, callback)
	}

};

//--------------------------------------------------//

const client = {
	/**
	 * Displays all the events on the calendar
	 */
	displayEvents: (events, displayCal) => {
		if (displayCal)
			displayCal.fullCalendar("renderEvents", events, false);
		else {
			preCal.fullCalendar('removeEvents');
			mainCal.fullCalendar("renderEvents", events, false);
			preCal.fullCalendar("renderEvents", events, false);
		}
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

		return event
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
		for (const event in template) {
			var start = template[event].start;
			var end = template[event].end;

			var mstart = moment(start);
			var mend = moment(end);

			template[event].start = moment(mainCal.fullCalendar("getDate")).startOf("week").add(mstart.day(), "day").add(mstart.hours(), "hours").add(mstart.minutes(), "minutes")
			template[event].end = moment(mainCal.fullCalendar("getDate")).startOf("week").add(mend.day(), "day").add(mend.hours(), "hours").add(mend.minutes(), "minutes")
		}

		return template;
	},

	/**
	 * From events to template of the specified date
	 */
	templatify: () => {
		var date = mainCal.fullCalendar("getDate")

		var startOfTheWeek = moment(date).startOf("week").startOf("day");
		var theWeekAfter = moment(startOfTheWeek).add(1, "week");

		var events = cal.getMainEvents(startOfTheWeek, theWeekAfter);

		return events;
	},

	/**
	 * Fetches the current set template from the server
	 */
	fetch: (callback) => {
		cPresenze.leggiTemplate(userId, callback);
	},

	/**
	 * Saves the template as the current template on the server
	 */
	save: (template, callback) => {
		for (const event in template) {
			template[event].start = moment(template[event].start).format("x")
			template[event].end = moment(template[event].end).format("x")
		}
		template = util.c2s(template);
		cPresenze.scriviTemplate(template, callback)
	}
};

//--------------------------------------------------//

var cal = {
	/**
	 * Gets all the rendered events from calendar from start to end
	 */
	getMainEvents: (start, end) => {
		return mainCal.fullCalendar("clientEvents", (event) => {
			return moment(event.start).isBetween(moment(start), moment(end), null, "(]");
		});
	},

	/**
 * Gets all the rendered events from calendar from start to end
 */
	getPreEvents: (start, end) => {
		return preCal.fullCalendar("clientEvents", (event) => {
			return moment(event.start).isBetween(moment(start), moment(end), null, "(]");
		});
	},

	selectEvent: (event) => {
		$(pastSelectedEvent).css('border-color', '');
		$(event).css('border-color', 'red');
		pastSelectedEvent = $(event);
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
	s2c: (events) => {
		if (Array.isArray(events)) {
			for (const event in events) {
				events[event].title = events[event].Subject;

				events[event].start = events[event].StartDateTime;
				events[event].end = events[event].EndDateTime;

				events[event].allDay = events[event].isAllDayEvent || false;
				events[event].type = events[event].Tipo_Presenza__c
				events[event].num = event

				events[event].Subject = undefined;
				events[event].StartDateTime = undefined;
				events[event].EndDateTime = undefined;
				events[event].isAllDayEvent = undefined;
				events[event].Tipo_Presenza__c = undefined;
				events[event].Template__c = undefined;
			}
		}
		else {
			events.title = events.Subject;

			events.start = events.StartDateTime;
			events.end = events.EndDateTime;

			events.allDay = events.isAllDayEvent || false;
			events.type = events.Tipo_Presenza__c
			events.num = 123

			events.Subject = undefined;
			events.StartDateTime = undefined;
			events.EndDateTime = undefined;
			events.isAllDayEvent = undefined;
			events.Tipo_Presenza__c = undefined;
			events.Template__c = undefined;
		}
		return events
	},

	c2s: (events) => {
		if (Array.isArray(events)) {
			for (const event in events) {
				events[event].StartDateTime = events[event].start
				events[event].EndDateTime = events[event].end
				events[event].isAllDayEvent = events[event].allDay;
				events[event].Subject = events[event].title;
				events[event].Tipo_Presenza__c = events[event].type

				events[event].num = undefined
				events[event].source = undefined;
				events[event]._id = undefined;
				events[event].className = undefined;
				events[event].allDay = undefined;
				events[event].title = undefined;
				events[event].start = undefined;
				events[event].end = undefined;
				events[event].type = undefined
			}
		}
		else {
			events.StartDateTime = events.start
			events.EndDateTime = events.end
			events.isAllDayEvent = events.allDay;
			events.Subject = events.title;
			events.Tipo_Presenza__c = events.type

			events.num = undefined
			events.source = undefined;
			events._id = undefined;
			events.className = undefined;
			events.allDay = undefined;
			events.title = undefined;
			events.start = undefined;
			events.end = undefined;
			events.type = undefined
		}

		return events
	},

	displayServerEvents: (callback) => {
		startOfTheMonth = moment(preCal.fullCalendar("getDate")).startOf("month").startOf("week").startOf("day");
		endOfTheMonth = moment(startOfTheMonth).add(1, "month");

		server.fetchEvents(startOfTheMonth, endOfTheMonth, (fetched) => {
			client.displayEvents(util.s2c(fetched));
			console.log(fetched)
			callback
		});
	},

	displayServerTemplate: (callback) => {
		template.fetch((fetched) => {
			client.displayEvents(template.parse(util.s2c(fetched)));
			callback
		})
	},

	writeParsedTemplateOnServer: () => {
		template.save(template.templatify(), () => { alert("Salvato") });
	},

	updateEventAndSave: (event) => {
		server.writeEvent(event, () => {
		})
	},

	createEventAndSave: (start, end) => {
		var event = {};

		event.start = start;
		event.end = end;
		event.type = "In Sede";
		event.title = "";

		client.createEvent(event);

		server.writeEvent(event, () => {

		});
	},

	deleteEventAndSave: (event) => {
		client.deleteEvent(event);
		server.deleteEvents(event, () => {

		});
	},

	changeEventType: (event) => {
		server.writeEvents(event, () => {
			event = client.changeEventType(event);
		})
	},

	smartDisplayEvents: (displayCal) => {
		startOfTheMonth = moment(preCal.fullCalendar("getDate")).startOf("month").startOf("week").startOf("day");
		endOfTheMonth = moment(startOfTheMonth).add(1, "month");

		startOfTheWeek = moment(mainCal.fullCalendar("getDate")).startOf("week").startOf("day");
		endOfTheWeek = moment(startOfTheMonth).add(1, "week");

		server.fetchEvents(startOfTheMonth, endOfTheMonth, (fetched) => {
			if (Array.isArray(fetched) && fetched.length > 0) {
				console.log("Eventi")
				client.displayEvents(util.s2c(fetched), displayCal);
			}
			else {
				console.log("Template")
				util.displayServerTemplate()
			}
		})
	},

	generateReport: () => {
		startOfTheMonth = moment(preCal.fullCalendar("getDate")).startOf("month").startOf("week").startOf("day");
		endOfTheMonth = moment(startOfTheMonth).add(1, "month");

		var events = cal.getPreEvents(startOfTheMonth, endOfTheMonth);

		for (const event in events) {
			currentEvent = events[event];


		}
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

		editable: false, // Makes the calendar non-editable

		/**
		 * Header settings
		 */
		header: {
			left: 'title', // Displays the scoped date on the left
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

				click: () => {
					preCal.fullCalendar('prev')
					util.smartDisplayEvents();
				} // Goes to the previous date
			},

			nex: {
				text: ">", // Button text
				click: () => {
					preCal.fullCalendar('next')
					util.smartDisplayEvents();
				} // Goes to the next date
			}
		},

		navLinks: true, // Enables clickable day number
		navLinkDayClick: (date) => {
			mainCal.fullCalendar('gotoDate', date)
			util.smartDisplayEvents();
		} // Makes the main calendar go to the selected date on the preview calendar
	});

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
			left: '',
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
					util.writeParsedTemplateOnServer()
				}
			},

			makeRemote: {
				text: "Rendi remoto/sede",

				click: () => {
					util.changeEventType(selectedEvent);
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
					mainCal.fullCalendar('prev'); // Goes to the previous date
					preCal.fullCalendar('gotoDate', mainCal.fullCalendar('getDate')); // Makes the preview go to the changed date
					util.smartDisplayEvents();
				}
			},

			nex: {
				text: ">", // Button text

				click: () => {
					mainCal.fullCalendar('next'); // Goes to the next date
					preCal.fullCalendar('gotoDate', mainCal.fullCalendar('getDate')); // Makes the preview go to the changed date
					util.smartDisplayEvents();
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
					mainCal.fullCalendar('removeEvents');
					util.smartDisplayEvents();
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
					mainCal.fullCalendar('removeEvents');
					util.smartDisplayEvents();
				}
			},

			/**
			 * Removes a selected event on the calendar,
			 * if none are given it will notify it
			 */
			removeEventButton: {
				text: 'Rimuovi', // Button text

				click: () => {
					if (selectedEvent) { util.deleteEventAndSave(selectedEvent) }
					else { alert("Nessun evento selezionato") }
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
		},

		/**
		 * When an event has been dropped
		 * 
		 * TODO: Make the calls to update correctly only the modified event
		 */
		eventDrop: (event) => { util.updateEventAndSave(event) },

		/**
		 * When an event has been resized
		 * 
		 * TODO: Make the calls to update correctly only the modified event
		 */
		eventResize: (event) => { util.updateEventAndSave(event) },

		/**
		 * Sets the two global variable to correct data format when selected
		 * and renders the event
		 */
		select: (startDate, endDate) => {
			cal.setSelected(startDate, endDate);
			util.createEventAndSave(startDate, endDate);
		},

		/**
		 * Resets the two global variable when deselected (with a delay)
		 */
		unselect: () => { setTimeout(() => cal.setSelected(null, null), 500) }
	});

	util.smartDisplayEvents();
});