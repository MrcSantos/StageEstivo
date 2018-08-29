/**
 * Restituisce i record che vanno dalla data di inizio a quella di fine
 * 
 * @param inizio: La data e l'orario di inizio
 * @param fine: La data e l'orario di fine
 */
public static list<Evento> leggi(String ownerId, Date inizio, Date fine);

/**
 * Modifica il record vecchio con quello nuovo tramite l'id
 * 
 * @param nuovo: Eventi da modificare, passati tramite la chiamata al server
 */
public static boolean salva(String ownerId, list<Evento> nuovo);



/**
 * Fornisce gli eventi di default
 */
public static list<Evento> leggiTemplate(String ownerId);

/**
 * Salva gli eventi ottenuti come template di default
 */
public static boolean scriviTemplate(String ownerId, list<Evento> template);



/**
 * Fornisce gli eventi di default
 */
public static Report leggiReport(String ownerId, String mese); // Mese in inglese

/**
 * Salva gli eventi ottenuti come template di default
 */
public static boolean scriviReport(String ownerId, Report report);



public static boolean chiudiMese(String ownerId, String mese); // Mese in inglese



/**
 * La classe Evento dovrà contenere al minimo queste variabili
 */
public class Evento {
	_id:String // Id incrementale fornito fullcalendar
	title:String // Titolo dell'evento
	start:Date // Data inizio
	end:Date // Data fine
	editable:boolean // se è modificabile (Non viene fornito ma viene modificato quando il mese viene chiuso)
	isRemote:boolean // Se il lavoro è remoto
}

public class Report {
	campi:list<Campo>
	oreTotali:int
}

public class Campo {
	data:Date
	orePresente:int
	oreAssente:int
	causale:String
}

public class Record { // I record sono mensili e contengono gli eventi di tale mese
	id:String // Id incrementale fornito dal database
	ownerId:String
	data:Date
	isClosed:boolean
	Eventi:list<Evento>
	template:list<Evento>
}