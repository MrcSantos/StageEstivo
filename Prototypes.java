/**
 * Rappresenta un cluster di ore di lavoro
 */
public class Evento {
	String titolo;
	int|String inizio, fine;
	boolean isRemote;
}

/**
 * Sovrascrive tutti i record che vanno dall'inizio alla fine della settimana
 * corrispondente alla data di inizio del primo evento
 * 
 * @param eventi: Lista di classe Evento contenenti tutti gli eventi della settimana passati tramite la chiamata al server
 */
public static void salva(list<Evento> eventi);

/**
 * Restituisce una lista (o array) di eventi letti dai record che vanno dalla data di inizio a quella di fine
 * 
 * @param inizio: La data e l'orario di inizio
 * @param fine: La data e l'orario di fine
 */
public static list<Evento> leggi(int|String inizio, int|String fine);

/**
 * Fornisce gli eventi di default per essere poi modificati e poi risalvato come default
 */
public static list<Evento> editDefaultWeekHours();