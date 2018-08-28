/**
 * Restituisce i record che vanno dalla data di inizio a quella di fine
 * 
 * @param inizio: La data e l'orario di inizio
 * @param fine: La data e l'orario di fine
 */
public static Record leggi(String ownerId, int|String inizio, int|String fine);

/**
 * Modifica il record vecchio con quello nuovo tramite l'id
 * 
 * @param nuovo: Evento da modificare, passato tramite la chiamata al server
 */
public static void salva(Record nuovo);



/**
 * Fornisce il Json di default
 */
public static Json leggiTemplate(String ownerId);

/**
 * Salva il Json ottenuto come template di default
 */
public static void scriviTemplate(JSON template);



/**
 * La classe Evento dovrà contenere al minimo queste variabili
 */
public class Evento {
	id:String // Id incrementale fornito dal database
	title:String // Titolo dell'evento
	start:int|String // Data inizio
	end:int|String // Data fine
	editable:boolean // se è modificabile (Non viene fornito ma viene modificato quando il mese viene chiuso)
	isRemote:boolean // Se il lavoro è remoto
}

/**
 * Il record dovrà restituire al minimo l'evento richiesto
 */
public class Record {
	evento:Evento
	isProprietario:boolean // Se l'user è proprietario del record 
}
