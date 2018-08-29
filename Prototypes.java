/**
 * Restituisce i record che vanno dalla data di inizio a quella di fine
 * 
 * @param inizio: La data e l'orario di inizio
 * @param fine: La data e l'orario di fine
 */
public static list<Evento> leggi(String ownerId, int|String inizio, int|String fine);

/**
 * Modifica il record vecchio con quello nuovo tramite l'id
 * 
 * @param nuovo: Eventi da modificare, passati tramite la chiamata al server
 */
public static boolean salva(list<Evento> nuovo);



/**
 * Fornisce gli eventi di default
 */
public static list<Evento> leggiTemplate(String ownerId);

/**
 * Salva gli eventi ottenuti come template di default
 */
public static boolean scriviTemplate(list<Evento> template);



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