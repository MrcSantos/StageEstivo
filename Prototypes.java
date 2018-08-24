/**
 * Restituisce i record che vanno dalla data di inizio a quella di fine
 * 
 * @param inizio: La data e l'orario di inizio
 * @param fine: La data e l'orario di fine
 */
public static Record leggi(int|String inizio, int|String fine);

/**
 * Modifica il record vecchio con quello nuovo
 * 
 * @param evento: Evento da modificare, passato tramite la chiamata al server
 */
public static void salva(Record vecchio, Record nuovo);



/**
 * Fornisce il Json di default
 */
public static Json leggiTemplate();

/**
 * Salva il Json ottenuto come template di default
 */
public static void scriviTemplate(JSON template);



/**
 * La classe Evento dovrà contenere al minimo queste cose
 */
public class Evento {
	id:String // Id incrementale fornito dal database
	title:String // Titolo dell'evento
	start:int|String // Data inizio
	end:int|String // Data fine
	editable:boolean // se è modificabile (Non viene fornito ma viene modificato quando il mese viene chiuso)
	isRemote:boolean // Se il lavoro è remoto
}

/** NON SO SE SI FACCIA COSÌ IL PROTOTIPO DI UN RECORD
 * Il record dovrà restituire al minimo l'evento richiesto
 */
public class Record {
	evento:Evento
}
