/* personal.js — la parte personale dell'ospite, innestata dentro la guida.
 *
 * Un link solo: la guida si apre con ?t=<token> e chiama il portale Jarvis sul
 * Mini per i dati di QUELLA prenotazione (codice porta, orario, documenti,
 * imposta). Senza token la guida resta esattamente com'era, pubblica e senza
 * codice d'accesso.
 *
 * Stati, nell'ordine in cui li vive l'ospite:
 *   1. dati incompleti  → schermata personale a tutto schermo, la guida sta
 *                         dietro: prima le domande (orario, documenti, imposta),
 *                         in fondo il bottone per le istruzioni di check-in.
 *   2. guida aperta ma  → barra sticky in alto che ricorda cosa manca e
 *      dati incompleti    riapre la schermata.
 *   3. tutto mandato    → la parte personale sparisce; l'orario scelto compare
 *                         nella sezione check-in della guida.
 *   4. imposta da pagare→ la barra del pagamento resta in alto in ogni caso,
 *                         finché Ale non conferma di averla incassata.
 *
 * Se il Mini non risponde la guida resta intera: si mostra solo una riga che
 * dice di scrivere. Mai una pagina rotta.
 */
(function () {
  var API = window.GUEST_PORTAL_API || "";
  var token = new URLSearchParams(location.search).get("t") || "";
  if (!token || !API) return;                 // guida pubblica: niente da fare

  var dati = null;
  var erroreRete = false;
  var guidaAperta = false;                    // ha premuto "vai alla guida"
  var vuoleScheda = false;                    // ha ripremuto per tornare indietro
  var lang = "it";

  // ── testi ──────────────────────────────────────────────────────────────
  var T = {
    it: {
      titolo: "Prima di arrivare",
      benvenuto: "Benvenuto", benvenutoM: "Benvenuto", benvenutoF: "Benvenuta", benvenutoN: "Ciao",
      sotto: "Grazie ancora per aver scelto Nineteen Milano. Abbiamo bisogno giusto di qualche informazione per procedere con il check-in.",
      istruzioni: "Vedi istruzioni di check-in",
      guidaGenerale: "Vedi la guida completa",
      tornaScheda: "Torna alla tua pagina",
      codice: "Codice di accesso", codiceNota: "Attivo dal giorno del check-in.",
      codiceAttesa: "Comparirà qui il giorno prima del check-in.",
      codiceKeybox: "Codice keybox",
      eta: "A che ora arrivi?", etaSalva: "Salva orario", etaOk: "Orario salvato",
      doc: "Documenti d'identità",
      docNota: "Per adempiere alla legge italiana siamo obbligati a comunicare alla Questura i dati di ogni ospite che soggiornerà presso la struttura. Vi chiediamo gentilmente di caricare l'immagine di un documento di identità valido per ogni ospite. Grazie in anticipo.",
      docTutti: "Serve il documento di tutte le persone che soggiornano ({n}).",
      docCarica: "Carica un documento", docOk: "Documento ricevuto, grazie.",
      docRicevuti: "{n} ricevuti",
      ospiteN: "Ospite {n}", docCambia: "Cambia", docRicevuto: "Ricevuto",
      docInvia: "Invia documenti", docInviaN: "Invia {n} documenti", docInvia1: "Invia 1 documento",
      docInviando: "Invio in corso…", docAggiungi: "Aggiungi un altro ospite", docProgresso: "{n} di {tot}",
      docQuante: "Quante persone in questa foto?", docMeno: "Uno in meno", docPiu: "Uno in più",
      docContando: "Controllo…", docTrovati1: "1 documento", docTrovatiN: "{n} documenti",
      docMancano1: "Ne manca ancora 1", docMancanoN: "Ne mancano ancora {n}", docTuttiOk: "Ci sono tutti",
      docAggiungiFoto: "Aggiungi una foto", docRimuovi: "Togli",
      salta: "Vai direttamente alla guida",
      barraManca: "Mancano i tuoi dati",
      barraApri: "Completa",
      imposta: "Imposta di soggiorno", impostaNota: "Da versare a noi, non è inclusa in quanto hai già pagato.",
      impostaEsenti: "I minori di 18 anni sono esenti.",
      impostaComeVuoi: "Come preferisci pagare?",
      metodoContanti: "Contanti", metodoPaypal: "PayPal", metodoIban: "Bonifico", metodoSatispay: "Satispay",
      metodoAltro: "Altro",
      copia: "Copia", copiato: "Copiato", intestatario: "Intestatario",
      impostaContantiOk: "Va bene: lascia il contante sul tavolo dell'appartamento, spesso non riusciamo a vederci di persona.",
      impostaAltroTesto: "Scrivici su Airbnb, Booking o WhatsApp al {tel} per altre modalità di pagamento.",
      giu: "Non riusciamo a caricare i tuoi dati. Scrivici su Airbnb o Booking, oppure su WhatsApp al {tel}.",
      scaduto: "Questo link non è più attivo.",
      etaInGuida: "Hai indicato il tuo arrivo per le <strong>{eta}</strong>.",
    },
    en: {
      titolo: "Before you arrive",
      benvenuto: "Welcome",
      sotto: "Thank you again for choosing Nineteen Milano. We just need a few details to get your check-in ready.",
      istruzioni: "See check-in instructions",
      guidaGenerale: "See the full guide",
      tornaScheda: "Back to your page",
      codice: "Access code", codiceNota: "Active from your check-in day.",
      codiceAttesa: "It will appear here the day before your check-in.",
      codiceKeybox: "Keybox code",
      eta: "What time will you arrive?", etaSalva: "Save time", etaOk: "Time saved",
      doc: "Identity documents",
      docNota: "Italian law requires us to report the details of every guest staying at the property to the police. Please upload a photo of a valid ID for each guest. Thank you in advance.",
      docTutti: "We need the ID of everyone staying ({n}).",
      docCarica: "Upload a document", docOk: "Document received, thank you.",
      docRicevuti: "{n} received",
      ospiteN: "Guest {n}", docCambia: "Change", docRicevuto: "Received",
      docInvia: "Send documents", docInviaN: "Send {n} documents", docInvia1: "Send 1 document",
      docInviando: "Sending…", docAggiungi: "Add another guest", docProgresso: "{n} of {tot}",
      docQuante: "How many people in this photo?", docMeno: "One fewer", docPiu: "One more",
      docContando: "Checking…", docTrovati1: "1 document", docTrovatiN: "{n} documents",
      docMancano1: "1 still missing", docMancanoN: "{n} still missing", docTuttiOk: "All there",
      docAggiungiFoto: "Add a photo", docRimuovi: "Remove",
      salta: "Go straight to the guide",
      barraManca: "Your details are missing",
      barraApri: "Complete",
      imposta: "City tax", impostaNota: "Payable to us, not included in what you already paid.",
      impostaEsenti: "Guests under 18 are exempt.",
      impostaComeVuoi: "How would you like to pay?",
      metodoContanti: "Cash", metodoPaypal: "PayPal", metodoIban: "Bank transfer", metodoSatispay: "Satispay",
      metodoAltro: "Other",
      copia: "Copy", copiato: "Copied", intestatario: "Account holder",
      impostaContantiOk: "Great — please leave the cash on the table in the apartment. We often can't meet in person.",
      impostaAltroTesto: "Message us on Airbnb, Booking or WhatsApp at {tel} for other payment options.",
      giu: "We can't load your details right now. Message us on Airbnb or Booking, or on WhatsApp at {tel}.",
      scaduto: "This link is no longer active.",
      etaInGuida: "You told us you'll arrive at <strong>{eta}</strong>.",
    },
    es: {
      titolo: "Antes de llegar",
      benvenuto: "Bienvenido", benvenutoM: "Bienvenido", benvenutoF: "Bienvenida", benvenutoN: "Hola",
      sotto: "Gracias de nuevo por elegir Nineteen Milano. Solo necesitamos algunos datos para preparar tu entrada.",
      istruzioni: "Ver instrucciones de entrada",
      guidaGenerale: "Ver la guía completa",
      tornaScheda: "Volver a tu página",
      codice: "Código de acceso", codiceNota: "Activo desde el día de tu entrada.",
      codiceAttesa: "Aparecerá aquí el día antes de tu entrada.",
      codiceKeybox: "Código de la keybox",
      eta: "¿A qué hora llegas?", etaSalva: "Guardar hora", etaOk: "Hora guardada",
      doc: "Documentos de identidad",
      docNota: "La ley italiana nos obliga a comunicar a la policía los datos de cada huésped que se aloje en el alojamiento. Te pedimos amablemente que subas la imagen de un documento de identidad válido de cada huésped. Gracias de antemano.",
      docTutti: "Necesitamos el documento de todas las personas que se alojan ({n}).",
      docCarica: "Subir un documento", docOk: "Documento recibido, gracias.",
      docRicevuti: "{n} recibidos",
      ospiteN: "Huésped {n}", docCambia: "Cambiar", docRicevuto: "Recibido",
      docInvia: "Enviar documentos", docInviaN: "Enviar {n} documentos", docInvia1: "Enviar 1 documento",
      docInviando: "Enviando…", docAggiungi: "Añadir otro huésped", docProgresso: "{n} de {tot}",
      docQuante: "¿Cuántas personas hay en esta foto?", docMeno: "Uno menos", docPiu: "Uno más",
      docContando: "Comprobando…", docTrovati1: "1 documento", docTrovatiN: "{n} documentos",
      docMancano1: "Falta 1", docMancanoN: "Faltan {n}", docTuttiOk: "Están todos",
      docAggiungiFoto: "Añadir una foto", docRimuovi: "Quitar",
      salta: "Ir directamente a la guía",
      barraManca: "Faltan tus datos",
      barraApri: "Completar",
      imposta: "Tasa turística", impostaNota: "Se paga a nosotros, no está incluida en lo que ya pagaste.",
      impostaEsenti: "Los menores de 18 años están exentos.",
      impostaComeVuoi: "¿Cómo prefieres pagar?",
      metodoContanti: "Efectivo", metodoPaypal: "PayPal", metodoIban: "Transferencia", metodoSatispay: "Satispay",
      metodoAltro: "Otro",
      copia: "Copiar", copiato: "Copiado", intestatario: "Titular",
      impostaContantiOk: "Perfecto: deja el efectivo sobre la mesa del apartamento. Muchas veces no podemos vernos en persona.",
      impostaAltroTesto: "Escríbenos por Airbnb, Booking o WhatsApp al {tel} para otras formas de pago.",
      giu: "No podemos cargar tus datos. Escríbenos por Airbnb o Booking, o por WhatsApp al {tel}.",
      scaduto: "Este enlace ya no está activo.",
      etaInGuida: "Nos has indicado que llegas a las <strong>{eta}</strong>.",
    },
    fr: {
      titolo: "Avant votre arrivée",
      benvenuto: "Bienvenue",
      sotto: "Merci encore d'avoir choisi Nineteen Milano. Nous avons juste besoin de quelques informations pour préparer votre arrivée.",
      istruzioni: "Voir les instructions d'arrivée",
      guidaGenerale: "Voir le guide complet",
      tornaScheda: "Retour à votre page",
      codice: "Code d'accès", codiceNota: "Actif à partir du jour de votre arrivée.",
      codiceAttesa: "Il apparaîtra ici la veille de votre arrivée.",
      codiceKeybox: "Code de la keybox",
      eta: "À quelle heure arrivez-vous ?", etaSalva: "Enregistrer l'heure", etaOk: "Heure enregistrée",
      doc: "Pièces d'identité",
      docNota: "La loi italienne nous oblige à communiquer à la police les données de chaque voyageur séjournant dans le logement. Nous vous prions de bien vouloir télécharger l'image d'une pièce d'identité valide pour chaque voyageur. Merci d'avance.",
      docTutti: "Il nous faut la pièce d'identité de chaque personne séjournant ({n}).",
      docCarica: "Télécharger un document", docOk: "Document reçu, merci.",
      docRicevuti: "{n} reçus",
      ospiteN: "Voyageur {n}", docCambia: "Modifier", docRicevuto: "Reçu",
      docInvia: "Envoyer les documents", docInviaN: "Envoyer {n} documents", docInvia1: "Envoyer 1 document",
      docInviando: "Envoi en cours…", docAggiungi: "Ajouter un voyageur", docProgresso: "{n} sur {tot}",
      docQuante: "Combien de personnes sur cette photo ?", docMeno: "Un de moins", docPiu: "Un de plus",
      docContando: "Vérification…", docTrovati1: "1 document", docTrovatiN: "{n} documents",
      docMancano1: "Il en manque 1", docMancanoN: "Il en manque {n}", docTuttiOk: "Tout y est",
      docAggiungiFoto: "Ajouter une photo", docRimuovi: "Retirer",
      salta: "Aller directement au guide",
      barraManca: "Vos informations manquent",
      barraApri: "Compléter",
      imposta: "Taxe de séjour", impostaNota: "À régler auprès de nous, non comprise dans ce que vous avez payé.",
      impostaEsenti: "Les moins de 18 ans sont exemptés.",
      impostaComeVuoi: "Comment préférez-vous payer ?",
      metodoContanti: "Espèces", metodoPaypal: "PayPal", metodoIban: "Virement", metodoSatispay: "Satispay",
      metodoAltro: "Autre",
      copia: "Copier", copiato: "Copié", intestatario: "Titulaire",
      impostaContantiOk: "Très bien : laissez les espèces sur la table de l'appartement. Nous ne pouvons souvent pas nous voir en personne.",
      impostaAltroTesto: "Écrivez-nous sur Airbnb, Booking ou WhatsApp au {tel} pour d'autres moyens de paiement.",
      giu: "Impossible de charger vos informations. Écrivez-nous sur Airbnb ou Booking, ou sur WhatsApp au {tel}.",
      scaduto: "Ce lien n'est plus actif.",
      etaInGuida: "Vous nous avez indiqué une arrivée à <strong>{eta}</strong>.",
    },
    de: {
      titolo: "Vor Ihrer Ankunft",
      benvenuto: "Willkommen",
      sotto: "Vielen Dank, dass Sie sich für Nineteen Milano entschieden haben. Wir brauchen nur noch ein paar Angaben, um Ihren Check-in vorzubereiten.",
      istruzioni: "Check-in-Anleitung ansehen",
      guidaGenerale: "Ganzen Guide ansehen",
      tornaScheda: "Zurück zu Ihrer Seite",
      codice: "Zugangscode", codiceNota: "Ab Ihrem Anreisetag aktiv.",
      codiceAttesa: "Er erscheint hier am Tag vor Ihrer Anreise.",
      codiceKeybox: "Keybox-Code",
      eta: "Wann kommen Sie an?", etaSalva: "Uhrzeit speichern", etaOk: "Uhrzeit gespeichert",
      doc: "Ausweisdokumente",
      docNota: "Das italienische Recht verpflichtet uns, die Daten jedes Gastes, der in der Unterkunft übernachtet, der Polizei zu melden. Bitte laden Sie das Bild eines gültigen Ausweisdokuments für jeden Gast hoch. Vielen Dank im Voraus.",
      docTutti: "Wir brauchen den Ausweis aller übernachtenden Personen ({n}).",
      docCarica: "Dokument hochladen", docOk: "Dokument erhalten, vielen Dank.",
      docRicevuti: "{n} erhalten",
      ospiteN: "Gast {n}", docCambia: "Ändern", docRicevuto: "Erhalten",
      docInvia: "Dokumente senden", docInviaN: "{n} Dokumente senden", docInvia1: "1 Dokument senden",
      docInviando: "Wird gesendet…", docAggiungi: "Weiteren Gast hinzufügen", docProgresso: "{n} von {tot}",
      docQuante: "Wie viele Personen sind auf diesem Foto?", docMeno: "Eine weniger", docPiu: "Eine mehr",
      docContando: "Prüfung…", docTrovati1: "1 Dokument", docTrovatiN: "{n} Dokumente",
      docMancano1: "Es fehlt noch 1", docMancanoN: "Es fehlen noch {n}", docTuttiOk: "Alle da",
      docAggiungiFoto: "Foto hinzufügen", docRimuovi: "Entfernen",
      salta: "Direkt zum Guide",
      barraManca: "Ihre Angaben fehlen",
      barraApri: "Vervollständigen",
      imposta: "Kurtaxe", impostaNota: "An uns zu zahlen, nicht in Ihrer Zahlung enthalten.",
      impostaEsenti: "Unter 18-Jährige sind befreit.",
      impostaComeVuoi: "Wie möchten Sie bezahlen?",
      metodoContanti: "Bar", metodoPaypal: "PayPal", metodoIban: "Überweisung", metodoSatispay: "Satispay",
      metodoAltro: "Andere",
      copia: "Kopieren", copiato: "Kopiert", intestatario: "Kontoinhaber",
      impostaContantiOk: "In Ordnung: Bitte legen Sie das Bargeld auf den Tisch in der Wohnung. Wir sehen uns oft nicht persönlich.",
      impostaAltroTesto: "Schreiben Sie uns über Airbnb, Booking oder WhatsApp an {tel} für andere Zahlungsarten.",
      giu: "Wir können Ihre Daten nicht laden. Schreiben Sie uns über Airbnb oder Booking, oder per WhatsApp an {tel}.",
      scaduto: "Dieser Link ist nicht mehr aktiv.",
      etaInGuida: "Sie haben uns <strong>{eta}</strong> als Ankunftszeit genannt.",
    },
  };

  /** Istruzioni di check-in per chi entra con la keybox invece del tastierino:
   *  sostituiscono per intero i passi e il checkout della sezione #checkin
   *  (vedi metodoCheckinNellaGuida). Esistono SOLO qui, non in content.js: la
   *  guida pubblica senza token non sa nulla della keybox, come per il codice
   *  (vedi codiceNellaGuida). */
  var KEYBOX_CHECKIN = {
    it: {
      steps: [
        "Arrivate a Viale Monte Nero 19. La <strong>keybox</strong> è agganciata al cartello davanti al portone, a destra della fermata del tram.",
        "Apritela con il codice qui sotto: dentro trovate due chiavi — <strong>nera</strong> per il portone, <strong>blu</strong> per la porta d'ingresso.",
        "Aprite il portone con la chiave nera. Salite al <strong>4° piano</strong>, uscendo dall'ascensore girate a destra: aprite la porta dell'appartamento con la chiave blu.",
      ],
      checkout: "Check-out entro le <strong>10:00</strong>. Rimettete <strong>entrambe le chiavi</strong> nella keybox e richiudetela con lo stesso codice. Spegnete luci, aria condizionata e TV.",
    },
    en: {
      steps: [
        "Arrive at Viale Monte Nero 19. The <strong>keybox</strong> is attached to the sign in front of the main door, to the right of the tram stop.",
        "Open it with the code below: inside you'll find two keys — <strong>black</strong> for the main door, <strong>blue</strong> for the apartment door.",
        "Open the main door with the black key. Go up to the <strong>4th floor</strong>; coming out of the lift, turn right and open the apartment door with the blue key.",
      ],
      checkout: "Check-out by <strong>10:00 AM</strong>. Put <strong>both keys</strong> back in the keybox and lock it with the same code. Turn off the lights, air conditioning and TV.",
    },
    es: {
      steps: [
        "Llegad a Viale Monte Nero 19. La <strong>keybox</strong> está enganchada al cartel delante del portón, a la derecha de la parada del tranvía.",
        "Ábrela con el código de abajo: dentro encontraréis dos llaves — <strong>negra</strong> para el portón, <strong>azul</strong> para la puerta de entrada.",
        "Abrid el portón con la llave negra. Subid al <strong>4º piso</strong>; al salir del ascensor girad a la derecha y abrid la puerta del apartamento con la llave azul.",
      ],
      checkout: "Salida antes de las <strong>10:00</strong>. Devolved <strong>ambas llaves</strong> a la keybox y cerradla con el mismo código. Apagad las luces, el aire acondicionado y la TV.",
    },
    fr: {
      steps: [
        "Arrivez au Viale Monte Nero 19. La <strong>keybox</strong> est accrochée au panneau devant le portail, à droite de l'arrêt de tram.",
        "Ouvrez-la avec le code ci-dessous : à l'intérieur, deux clés — <strong>noire</strong> pour le portail, <strong>bleue</strong> pour la porte d'entrée.",
        "Ouvrez le portail avec la clé noire. Montez au <strong>4e étage</strong> ; en sortant de l'ascenseur, tournez à droite et ouvrez la porte de l'appartement avec la clé bleue.",
      ],
      checkout: "Départ avant <strong>10h00</strong>. Remettez <strong>les deux clés</strong> dans la keybox et refermez-la avec le même code. Éteignez les lumières, la climatisation et la télévision.",
    },
    de: {
      steps: [
        "Kommen Sie zur Viale Monte Nero 19. Die <strong>Keybox</strong> hängt am Schild vor dem Haustor, rechts von der Straßenbahnhaltestelle.",
        "Öffnen Sie sie mit dem Code unten: darin finden Sie zwei Schlüssel — <strong>schwarz</strong> für das Haustor, <strong>blau</strong> für die Wohnungstür.",
        "Öffnen Sie das Haustor mit dem schwarzen Schlüssel. Gehen Sie in den <strong>4. Stock</strong>; aus dem Aufzug kommend rechts abbiegen und die Wohnungstür mit dem blauen Schlüssel öffnen.",
      ],
      checkout: "Abreise bis <strong>10:00 Uhr</strong>. Legen Sie <strong>beide Schlüssel</strong> zurück in die Keybox und schließen Sie sie mit demselben Code ab. Schalten Sie Licht, Klimaanlage und Fernseher aus.",
    },
  };

  /** Foto reali dei passaggi d'accesso (keybox, chiavi, portone), per chi
   *  entra con la keybox: servono a far vedere in anticipo cosa troverà, così
   *  arriva sicuro di essere nel posto giusto. Galleria libera, senza legame
   *  1:1 con i passi testuali di KEYBOX_CHECKIN (scelta di Ale). */
  var KEYBOX_GALLERY = [
    { src: "images/keybox/01-cartello.jpg", alt: { it: "Il cartello davanti al portone, con la keybox agganciata", en: "The sign in front of the main door, with the keybox attached" } },
    { src: "images/keybox/02-combinazione.jpg", alt: { it: "La keybox aperta con la combinazione", en: "The keybox open with the combination" } },
    { src: "images/keybox/03-chiave-nera.jpg", alt: { it: "La chiave nera per il portone", en: "The black key for the main door" } },
    { src: "images/keybox/04-chiave-blu.jpg", alt: { it: "La chiave blu per la porta d'ingresso", en: "The blue key for the apartment door" } },
    { src: "images/keybox/06-pianerottolo.jpg", alt: { it: "L'ingresso con l'ascensore", en: "The entrance hall with the lift" } },
    { src: "images/keybox/07-porta-appartamento.jpg", alt: { it: "La porta dell'appartamento", en: "The apartment door" } },
  ];

  function t(k) { return (T[lang] || T.en)[k] || (T.en[k] || ""); }
  function fill(s, vals) {
    return String(s).replace(/\{(\w+)\}/g, function (_, k) { return vals[k] != null ? vals[k] : ""; });
  }
  /** «Benvenuta Sofia». Il genere cambia la parola solo in italiano e spagnolo:
   *  in inglese, francese e tedesco è invariabile, e il fallback di t() ci
   *  arriva da solo senza chiavi in più. Genere ignoto → forma neutra
   *  («Ciao Sofia»), mai la maschile per default: sbagliare il saluto a un
   *  ospite è peggio che non dargliene uno. Senza nome resta il vecchio titolo,
   *  che dice cosa deve fare. */
  function saluto() {
    var nome = (dati && dati.nome) || "";
    if (!nome) return t("titolo");
    var g = (dati && dati.genere) || "";
    var parola = (g && t("benvenuto" + g.toUpperCase())) || t("benvenutoN") || t("benvenuto");
    return parola + " " + nome;
  }

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "className") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  // ── rete ───────────────────────────────────────────────────────────────
  function api(path, opts) {
    return fetch(API + "/api/g/" + encodeURIComponent(token) + (path || ""), opts)
      .then(function (r) { return r.json(); });
  }

  function carica() {
    return api("").then(function (d) {
      erroreRete = false;
      dati = d;
      if (d && d.lingua && T[d.lingua]) {
        lang = d.lingua;
        // La guida statica non sa nulla della prenotazione: gliela diciamo noi,
        // o resterebbe nella lingua del browser di chi apre il link.
        document.dispatchEvent(new CustomEvent("guest:lingua",
                                               { detail: { lang: lang } }));
      }
      return d;
    }).catch(function () { erroreRete = true; dati = null; });
  }

  // ── pezzi di UI ────────────────────────────────────────────────────────
  /** Niente bottone "salva": l'orario si registra da solo appena l'ospite lo
   *  sceglie. Un campo solo con un bottone accanto è un passaggio in più che
   *  qualcuno dimentica di premere, e allora l'orario non arriva mai. */
  function bloccoEta() {
    var msg = el("p", { className: "gp-msg", hidden: "hidden" });
    var input = el("input", { type: "time", min: "15:00", step: "900", value: dati.eta || "" });

    var ultimo = dati.eta || "";
    function salva() {
      var v = input.value;
      if (!v || v === ultimo) return;
      ultimo = v;
      msg.hidden = false;
      msg.className = "gp-msg";
      msg.textContent = "…";
      api("/eta", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eta: v }),
      }).then(function (r) {
        msg.className = "gp-msg " + (r.ok ? "gp-msg--ok" : "gp-msg--err");
        msg.textContent = r.message || "";
        if (r.ok) carica().then(disegna);
        else ultimo = "";            // riprova al prossimo cambio
      }).catch(function () {
        msg.className = "gp-msg gp-msg--err";
        msg.textContent = fill(t("giu"), { tel: (dati && dati.telefono) || "" });
        ultimo = "";
      });
    }
    // `change` copre desktop e la conferma del selettore su iOS; `blur` prende
    // il caso in cui l'ospite tocca fuori senza confermare.
    input.addEventListener("change", salva);
    input.addEventListener("blur", salva);

    return el("div", { className: "gp-card" }, [
      el("h3", { text: t("eta") }), input, msg,
    ]);
  }

  /** Una barra per ospite, e il conteggio SUBITO — non dopo l'invio.
   *
   *  Appena l'ospite sceglie una foto, questa va al Mini che la legge e risponde
   *  quanti documenti ci vede, SENZA salvarla (`/conta`). Così vede all'istante
   *  quanti ne ha coperti e quanti gliene mancano, e preme Invia quando è
   *  sicuro, invece di scoprirlo dopo e dover fare un secondo giro.
   *
   *  Le barre distinguono due pieni: quelle già sul Mini (piene) e quelle che si
   *  riempiranno all'invio (tratteggiate). Finché non preme Invia, sul Mini non
   *  è rimasto NIENTE: un tocco sbagliato nella galleria si toglie con «Togli»
   *  e non lascia traccia. Era il punto di partenza di tutta questa revisione.
   *
   *  Niente più un riquadro per ospite: una foto può coprirne due (i passaporti
   *  aperti affiancati), quindi legare i riquadri alle persone mentiva. Le barre
   *  dicono quante persone mancano, la lista dice cosa hai messo.
   */
  function bloccoDocumenti() {
    var msg = el("p", { className: "gp-msg", hidden: "hidden" });
    var attesi = dati.ospitiTotali || 0;             // 0 = la scheda non lo sa
    var confermati = dati.documentiRiconosciuti || 0;
    var foto = [];                                   // {file, url, n, errore}

    var progresso = el("div", { className: "gp-progresso" });
    var manca = el("p", { className: "gp-manca" });
    var lista = el("div", { className: "gp-slots" });
    var input = el("input", { type: "file", accept: "image/*,application/pdf", hidden: "hidden" });
    var aggiungi = el("button", { className: "gp-btn gp-btn--ghost", type: "button",
                                  text: t("docCarica") });
    var invia = el("button", { className: "gp-btn", type: "button" });

    function pendenti() {
      return foto.reduce(function (tot, f) { return tot + (f.n || 0); }, 0);
    }
    /** Quante barre disegnare. Con gli ospiti noti sono loro, punto. Quando la
     *  scheda non li sa (prenotazioni ricostruite dal reconcile) le barre
     *  seguono quello che l'ospite mette: fissarle a una avrebbe detto «ci sono
     *  tutti» al primo documento anche a un gruppo di quattro. */
    function nBarre() {
      return attesi || Math.max(1, confermati + pendenti());
    }
    function proiezione() { return Math.min(confermati + pendenti(), nBarre()); }
    function inCorso() { return foto.some(function (f) { return f.n === null; }); }

    function disegnaBarre() {
      progresso.innerHTML = "";
      var strip = el("div", { className: "gp-barre" });
      var p = proiezione(), tot = nBarre(), pieni = Math.min(confermati, tot);
      for (var i = 0; i < tot; i++) {
        var cls = "gp-barra";
        if (i < pieni) cls += " gp-barra--on";
        else if (i < p) cls += " gp-barra--attesa";
        strip.appendChild(el("span", { className: cls }));
      }
      progresso.appendChild(strip);
      progresso.appendChild(el("span", { className: "gp-progresso-lbl",
        text: fill(t("docProgresso"), { n: p, tot: tot }) }));

      // Con gli ospiti ignoti non si sa quanti ne mancano: non lo si inventa.
      var resta = attesi ? tot - p : 0;
      manca.hidden = !attesi;
      manca.textContent = resta <= 0 ? t("docTuttiOk")
        : resta === 1 ? t("docMancano1")
        : fill(t("docMancanoN"), { n: resta });
      manca.className = "gp-manca" + (resta <= 0 ? " gp-manca--ok" : "");
    }

    function aggiornaInvia() {
      // Disabilitato anche mentre un conteggio è in corso: mandare a metà
      // controllo vorrebbe dire farlo premere senza sapere a che punto è.
      invia.disabled = foto.length === 0 || inCorso();
      // Il numero è quello dei DOCUMENTI, non delle foto: due foto che ne
      // contengono 1 e 2 sono «Invia 3 documenti». Contare le foto direbbe 2 e
      // non tornerebbe con le barre, che di documenti ne mostrano 3.
      var n = pendenti();
      invia.textContent = !n ? t("docInvia")
        : n === 1 ? t("docInvia1")
        : fill(t("docInviaN"), { n: n });
    }

    /** Il ± accanto alla foto. Il rilevatore propone, l'ospite corregge.
     *  Serve perché nessun rilevatore azzecca ogni documento di ogni paese —
     *  misurato: un passaporto francese contato 3, due carte turche contate 1 —
     *  mentre l'ospite la risposta ce l'ha sotto gli occhi. Il numero corretto
     *  viaggia con l'upload, e sulla scheda restano entrambi (suo e nostro),
     *  così le divergenze dicono dove il rilevatore va tarato. */
    function passo(f) {
      var meno = el("button", { className: "gp-passo", type: "button", text: "−",
                                "aria-label": t("docMeno") });
      var valore = el("span", { className: "gp-passo-val", text: String(f.n) });
      var piu = el("button", { className: "gp-passo", type: "button", text: "+",
                               "aria-label": t("docPiu") });
      meno.disabled = f.n <= 1;
      piu.disabled = f.n >= 6;              // stesso tetto del server
      meno.addEventListener("click", function () {
        if (f.n > 1) { f.n--; f.corretto = true; ridisegna(); }
      });
      piu.addEventListener("click", function () {
        if (f.n < 6) { f.n++; f.corretto = true; ridisegna(); }
      });
      return el("div", { className: "gp-passi" }, [meno, valore, piu]);
    }

    function riga(f) {
      var quanti = f.n === null ? t("docContando")
        : f.n === 1 ? t("docTrovati1")
        : fill(t("docTrovatiN"), { n: f.n });
      var togli = el("button", { className: "gp-togli", type: "button", text: t("docRimuovi") });
      togli.addEventListener("click", function () {
        var i = foto.indexOf(f);                     // mai l'indice catturato:
        if (i < 0) return;                           // la lista cambia sotto
        if (f.url) URL.revokeObjectURL(f.url);
        foto.splice(i, 1);
        ridisegna();
      });
      return el("div", { className: "gp-foto" }, [
        f.url ? el("img", { className: "gp-thumb", src: f.url, alt: "" })
              : el("div", { className: "gp-thumb gp-thumb--file", text: "PDF" }),
        el("div", { className: "gp-foto-info" }, [
          el("span", { className: "gp-slot-nome", text: f.file.name }),
          el("span", { className: "gp-foto-n" + (f.n === null ? " gp-foto-n--wait" : ""),
                       text: quanti }),
        ]),
        f.n === null ? null : passo(f),    // el() salta i figli falsi
        togli,
      ]);
    }

    function ridisegna() {
      lista.innerHTML = "";
      foto.forEach(function (f) { lista.appendChild(riga(f)); });
      if (foto.some(function (f) { return f.n !== null; })) {
        lista.appendChild(el("p", { className: "gp-note gp-quante", text: t("docQuante") }));
      }
      lista.appendChild(aggiungi);
      disegnaBarre();
      aggiornaInvia();
    }

    input.addEventListener("change", function () {
      var f = input.files[0];
      input.value = "";                              // così si può riscegliere lo stesso file
      if (!f) return;
      var voce = { file: f, n: null, errore: false,
                   url: /^image\//.test(f.type) ? URL.createObjectURL(f) : "" };
      foto.push(voce);
      ridisegna();                                   // anteprima subito, conteggio dopo

      var fd = new FormData();
      fd.append("file", f);
      api("/conta", { method: "POST", body: fd }).then(function (r) {
        if (r && r.ok) { voce.n = r.riconosciuti; ridisegna(); return; }
        // Formato rifiutato: si toglie e si dice ORA, non al momento dell'invio.
        var i = foto.indexOf(voce);
        if (i >= 0) foto.splice(i, 1);
        if (voce.url) URL.revokeObjectURL(voce.url);
        msg.hidden = false;
        msg.className = "gp-msg gp-msg--err";
        msg.textContent = (r && r.message) || fill(t("giu"), { tel: (dati && dati.telefono) || "" });
        ridisegna();
      }).catch(function () {
        // Mini irraggiungibile: la foto resta e vale 1. Il conteggio che conta è
        // comunque quello del salvataggio, questo era solo un'anticipazione.
        voce.n = 1; voce.errore = true;
        ridisegna();
      });
    });
    aggiungi.addEventListener("click", function () { input.click(); });

    invia.addEventListener("click", function () {
      if (!foto.length) return;
      invia.disabled = true;
      invia.textContent = t("docInviando");
      var ok = 0, errore = "";
      // Uno alla volta, non in parallelo: il server ha un rate limit per IP e
      // una raffica si prenderebbe un 429 a metà, lasciando l'ospite senza
      // sapere quali documenti sono passati.
      var catena = Promise.resolve();
      foto.forEach(function (f) {
        catena = catena.then(function () {
          var fd = new FormData();
          fd.append("file", f.file);
          if (f.n) fd.append("dichiarati", String(f.n));
          return api("/upload", { method: "POST", body: fd }).then(function (r) {
            if (r && r.ok) ok++;
            else errore = (r && r.message) || errore;
          });
        });
      });
      catena.then(function () {
        foto.forEach(function (f) { if (f.url) URL.revokeObjectURL(f.url); });
        msg.hidden = false;
        if (ok && !errore) {
          msg.className = "gp-msg gp-msg--ok";
          msg.textContent = t("docOk");
        } else {
          msg.className = "gp-msg gp-msg--err";
          msg.textContent = errore || fill(t("giu"), { tel: (dati && dati.telefono) || "" });
        }
        carica().then(disegna);
      }).catch(function () {
        msg.hidden = false;
        msg.className = "gp-msg gp-msg--err";
        msg.textContent = fill(t("giu"), { tel: (dati && dati.telefono) || "" });
        aggiornaInvia();
      });
    });

    ridisegna();

    var kids = [el("h3", { text: t("doc") }), el("p", { className: "gp-note", text: t("docNota") })];
    if (attesi) {
      kids.push(el("p", { className: "gp-note", text: fill(t("docTutti"), { n: attesi }) }));
    }
    kids.push(progresso, manca, lista, input, msg, invia);
    return el("div", { className: "gp-card" }, kids);
  }

  /** Chip "Come preferisci pagare?": l'ospite tocca un metodo fra quelli che
   *  Ale ha configurato (Contanti è sempre disponibile), e la scelta arriva
   *  sulla pagina Ospiti PRIMA dell'arrivo — invece di scoprirla al check-in
   *  o aprendo un messaggio da tradurre. Un tocco, non un campo da scrivere. */
  /** Il dettaglio del metodo scelto — SOLO quello scelto, non tutti i canali
   *  insieme. Prima la card mostrava PayPal e IBAN sempre aperti a prescindere
   *  da cosa avesse toccato l'ospite; ora tocca "Bonifico" e vede l'IBAN,
   *  tocca "Altro" e vede dove scriverci. Un accordion a una voce, non una
   *  lista. Satispay non compariva mai, nemmeno prima: il chip c'era ma il suo
   *  dettaglio non era stato collegato. */
  function _dettaglioMetodo(i, metodo) {
    if (metodo === "contanti") {
      return el("p", { className: "gp-note", text: t("impostaContantiOk") });
    }
    if (metodo === "altro") {
      return el("p", { className: "gp-note",
                       text: fill(t("impostaAltroTesto"), { tel: (dati && dati.telefono) || "" }) });
    }
    var lista = el("ul", { className: "gp-pay" });
    // Bottone che copia una stringa negli appunti e lo dice per due secondi.
    // Stesso pattern del WiFi in app.js: se l'API è negata (Safari privato,
    // permesso rifiutato) mostra il testo grezzo invece di fallire in silenzio
    // — un ospite col telefono in mano deve poter comunque leggere il numero.
    function bottoneCopia(valore) {
      var b = el("button", { className: "gp-copia", type: "button", text: t("copia") });
      b.addEventListener("click", function () {
        (navigator.clipboard ? navigator.clipboard.writeText(valore) : Promise.reject())
          .then(function () {
            b.textContent = t("copiato");
            setTimeout(function () { b.textContent = t("copia"); }, 2000);
          })
          .catch(function () { b.textContent = valore; });
      });
      return b;
    }

    if (metodo === "paypal" && i.paypal) lista.appendChild(el("li", {}, [
      el("b", { text: "PayPal" }),
      el("a", { href: i.paypal, target: "_blank", rel: "noopener", text: i.paypal }),
    ]));
    // IBAN e intestatario: un bottone COPIA per ciascuno, perché su un bonifico
    // servono entrambi e chi digita a mano sul telefono sbaglia facilmente un
    // carattere in mezzo a 27 dell'IBAN.
    if (metodo === "iban" && i.iban) {
      lista.appendChild(el("li", {}, [
        el("b", { text: "IBAN" }), el("code", { text: i.iban }), bottoneCopia(i.iban),
      ]));
      if (i.intestatario) lista.appendChild(el("li", {}, [
        el("b", { text: t("intestatario") }),
        el("em", { text: i.intestatario }), bottoneCopia(i.intestatario),
      ]));
    }
    // Satispay è un handle (@nome), non un URL: se un giorno diventasse un link
    // (es. satispay.com/pay/...) il ramo con <a> lo gestisce da solo, come già
    // fa la pagina di fallback sul Mini per lo stesso dato.
    if (metodo === "satispay" && i.satispay) lista.appendChild(el("li", {}, [
      el("b", { text: "Satispay" }),
      /^https?:\/\//.test(i.satispay)
        ? el("a", { href: i.satispay, target: "_blank", rel: "noopener", text: i.satispay })
        : el("code", { text: i.satispay }),
    ]));
    return lista;
  }

  function bloccoImposta() {
    if (!dati.imposta || !dati.imposta.daPagare) return null;
    var i = dati.imposta;
    var msg = el("p", { className: "gp-msg", hidden: "hidden" });

    var METODI = [{ code: "contanti", label: t("metodoContanti") }];
    if (i.paypal) METODI.push({ code: "paypal", label: t("metodoPaypal") });
    if (i.iban) METODI.push({ code: "iban", label: t("metodoIban") });
    if (i.satispay) METODI.push({ code: "satispay", label: t("metodoSatispay") });
    // "Altro" sempre presente, a prescindere da cosa è configurato: dice solo
    // "ci scrivo io per accordarci", non un canale che Ale deve aver impostato.
    METODI.push({ code: "altro", label: t("metodoAltro") });

    var chips = el("div", { className: "gp-metodi" });
    var dettaglio = el("div", { className: "gp-metodo-dett" });

    var busy = false;
    function scegli(m) {
      if (busy || i.metodo === m) return;
      busy = true;
      api("/metodo", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodo: m }),
      }).then(function (r) {
        busy = false;
        if (r && r.ok) { i.metodo = m; ridisegna(); }
        else {
          msg.hidden = false; msg.className = "gp-msg gp-msg--err";
          msg.textContent = fill(t("giu"), { tel: (dati && dati.telefono) || "" });
        }
      }).catch(function () {
        busy = false;
        msg.hidden = false; msg.className = "gp-msg gp-msg--err";
        msg.textContent = fill(t("giu"), { tel: (dati && dati.telefono) || "" });
      });
    }

    function ridisegna() {
      chips.innerHTML = "";
      METODI.forEach(function (m) {
        var b = el("button", {
          className: "gp-chip" + (i.metodo === m.code ? " gp-chip--on" : ""),
          type: "button", text: m.label,
        });
        b.addEventListener("click", function () { scegli(m.code); });
        chips.appendChild(b);
      });
      dettaglio.innerHTML = "";
      if (i.metodo) dettaglio.appendChild(_dettaglioMetodo(i, i.metodo));
    }
    ridisegna();

    return el("div", { className: "gp-card gp-card--pay" }, [
      el("h3", { text: t("imposta") }),
      el("div", { className: "gp-amount", text: "€ " + i.importo.toFixed(2).replace(".", ",") }),
      el("p", { className: "gp-note", text: t("impostaNota") }),
      el("p", { className: "gp-note", text: t("impostaComeVuoi") }),
      chips, dettaglio, msg,
      el("p", { className: "gp-note", text: t("impostaEsenti") }),
    ]);
  }

  // ── stati ──────────────────────────────────────────────────────────────
  /** Manda alla schermata check-in della guida, dove `codiceNellaGuida()` ha già
   *  innestato il codice d'accesso. È lì che il codice serve — davanti alla
   *  porta — non in cima a un modulo da compilare. Dalla home a card il
   *  check-in è una schermata a sé (#screen/checkin), non più una sezione
   *  sempre in pagina: ci si naviga via hash invece di fare scrollIntoView. */
  function bottoneIstruzioni() {
    var b = el("button", { className: "gp-btn gp-istruzioni", type: "button",
                           text: t("istruzioni") });
    b.addEventListener("click", function () {
      guidaAperta = true;
      vuoleScheda = false;
      disegna();                       // chiude l'overlay; innesta subito se già lì
      location.hash = "#screen/checkin";
    });
    return b;
  }

  /** Seconda uscita dall'overlay, verso la home della guida (card WiFi,
   *  dintorni, Milano…), non solo verso il check-in: un ospite che vuole
   *  guardare il WiFi o come arrivare non deve passare per forza dal
   *  check-in per trovarla. Hash vuoto = home, vedi getRoute() in app.js. */
  function bottoneGuidaGenerale() {
    var b = el("button", { className: "gp-btn gp-btn--ghost gp-guida-generale", type: "button",
                           text: t("guidaGenerale") });
    b.addEventListener("click", function () {
      guidaAperta = true;
      vuoleScheda = false;
      disegna();
      location.hash = "";
    });
    return b;
  }

  function overlay() {
    // Imposta in cima: è il primo pensiero dell'ospite quando ha capito che
    // c'è qualcosa da pagare, e lasciarla in fondo alla lista di richieste
    // dava l'impressione di doverla scoprire. Poi quello che chiediamo noi
    // (orario, documenti), poi le due vie d'uscita verso la guida — check-in
    // in primo piano (è il motivo per cui la maggior parte apre il link),
    // guida generale come opzione secondaria accanto. Il codice d'accesso
    // non sta più qui.
    var kids = [
      el("h2", { text: saluto() }),
      el("p", { className: "gp-lead", text: t("sotto") }),
      bloccoImposta(), bloccoEta(), bloccoDocumenti(),
      el("div", { className: "gp-uscite" }, [bottoneIstruzioni(), bottoneGuidaGenerale()]),
    ];
    return el("div", { className: "gp-overlay", id: "gp-overlay" },
      [el("div", { className: "gp-overlay-inner" }, kids)]);
  }

  function barra() {
    var apri = el("button", { className: "gp-bar-btn", type: "button", text: t("barraApri") });
    apri.addEventListener("click", tornaAllaScheda);
    return el("div", { className: "gp-bar", id: "gp-bar" }, [
      el("span", { text: t("barraManca") }), apri,
    ]);
  }

  function barraPagamento() {
    var i = dati.imposta;
    var apri = el("button", { className: "gp-bar-btn", type: "button", text: t("barraApri") });
    apri.addEventListener("click", tornaAllaScheda);
    return el("div", { className: "gp-bar gp-bar--pay", id: "gp-bar" }, [
      el("span", { text: t("imposta") + " · € " + i.importo.toFixed(2).replace(".", ",") }), apri,
    ]);
  }

  /** Riporta alla scheda personale dalla barra in alto. Rimette anche lo scroll
   *  in cima: l'ospite arriva qui dopo essere sceso nella guida, e senza questo
   *  l'overlay si apre già scorso a metà. */
  function tornaAllaScheda() {
    vuoleScheda = true;
    guidaAperta = false;
    disegna();
    window.scrollTo(0, 0);
  }

  function bannerErrore() {
    return el("div", { className: "gp-bar gp-bar--err", id: "gp-bar" }, [
      el("span", { text: fill(t(erroreRete ? "giu" : "scaduto"), { tel: (dati && dati.telefono) || "" }) }),
    ]);
  }

  /** L'orario scelto va anche dentro la guida, nella sezione check-in: dopo aver
   *  mandato tutto l'ospite non vede più il blocco personale, ma l'informazione
   *  gli serve ancora. */
  /** Inserisce dentro la sezione check-in, prima del riquadro del check-out
   *  (che è l'ultimo elemento): il codice e l'orario riguardano l'arrivo. */
  function inserisciInCheckin(nodo, marcatore) {
    var sez = document.getElementById("checkin");
    if (!sez || sez.querySelector("." + marcatore)) return;
    var cont = sez.querySelector(".container") || sez;
    var checkoutBox = cont.querySelector(".subcard");
    if (checkoutBox) cont.insertBefore(nodo, checkoutBox);
    else cont.appendChild(nodo);
  }

  function etaNellaGuida() {
    if (!dati || !dati.eta) return;
    inserisciInCheckin(
      el("p", { className: "gp-eta-inline", html: fill(t("etaInGuida"), { eta: dati.eta }) }),
      "gp-eta-inline");
  }

  /** Il codice porta nella guida esiste SOLO con il token: la versione pubblica
   *  resta senza, come deciso. Prima del giorno-1 dal check-in il Mini manda
   *  `codiceInAttesa` invece del codice vero (guest_server._payload_ospite):
   *  qui si mostra un messaggio d'attesa al posto del codice, non si sparisce
   *  la sezione, altrimenti l'ospite non sa che il codice arriverà. */
  function codiceNellaGuida() {
    if (!dati || (!dati.codice && !dati.codiceInAttesa)) return;
    // Il passo "il codice ti è stato mandato su Airbnb" non ha più senso quando
    // il codice (o l'attesa) è scritto qui sopra: si toglie.
    var passo = document.querySelector('#checkin [data-code-step]');
    if (passo) passo.remove();
    var attesa = !dati.codice;
    var etichetta = dati.metodoCheckin === "keybox" ? t("codiceKeybox") : t("codice");
    inserisciInCheckin(el("div", {
      className: "gp-code-inline" + (attesa ? " gp-code-inline--attesa" : ""),
    }, [
      el("span", { text: etichetta }),
      el(attesa ? "em" : "strong", { text: attesa ? t("codiceAttesa") : dati.codice }),
    ]), "gp-code-inline");
  }

  /** «Torna alla home» in cima alla schermata check-in (app.js/renderScreenBack)
   *  è pensato per la guida pubblica: da lì un ospite ci arriva sempre dalla
   *  card grid, quindi tornare in home è corretto. Ma con un token il check-in
   *  si raggiunge quasi sempre dal bottone primario sulla pagina personale
   *  (bottoneIstruzioni): "indietro" deve riportare lì, non alla home generica,
   *  altrimenti l'ospite perde il filo di quello che stava facendo (orario,
   *  documenti). Scoped alla sola schermata check-in — `#checkin` esiste solo
   *  lì — non alle altre card raggiunte dalla home, dove "indietro" resta
   *  giusto così com'è. `dataset.gpBack` come guardia: `tornaAllaScheda()`
   *  (bottone "Completa" della barra) richiama `disegna()` SENZA che app.js
   *  abbia ricostruito il DOM, quindi lo stesso nodo <a> potrebbe passare di
   *  qui più volte — senza il flag si accumulerebbero listener duplicati. */
  function backAllaSchedaNelCheckin() {
    if (!dati || !document.getElementById("checkin")) return;
    var link = document.querySelector(".screen-back__link");
    if (!link || link.dataset.gpBack) return;
    link.dataset.gpBack = "1";
    var span = link.querySelector("span");
    if (span) span.textContent = t("tornaScheda");
    link.addEventListener("click", function (ev) {
      ev.preventDefault();
      guidaAperta = false;
      vuoleScheda = true;
      disegna();
    });
  }

  /** Con la keybox i passi e il checkout di app.js (pensati per il tastierino:
   *  citofono, tastierino sulla porta) sono sbagliati per intero, non solo il
   *  codice: si sostituiscono con la sequenza vera (keybox → 2 chiavi → portone
   *  → porta). Sempre un rebuild completo (mai un patch parziale): la sezione
   *  #checkin viene ridisegnata da zero da app.js a ogni cambio lingua, quindi
   *  qui si riscrive sempre tutto, non serve un guard di idempotenza. */
  function metodoCheckinNellaGuida() {
    if (!dati || dati.metodoCheckin !== "keybox") return;
    var passi = (KEYBOX_CHECKIN[lang] || KEYBOX_CHECKIN.en).steps;
    var checkoutTesto = (KEYBOX_CHECKIN[lang] || KEYBOX_CHECKIN.en).checkout;
    var ol = document.querySelector("#checkin ol.steps");
    if (ol) {
      ol.innerHTML = "";
      passi.forEach(function (html) { ol.appendChild(el("li", { html: html })); });
    }
    var checkoutP = document.querySelector("#checkin .subcard p");
    if (checkoutP) checkoutP.innerHTML = checkoutTesto;
  }

  /** Riusa lo stile della galleria casa (scroll-gallery--house) invece di
   *  chiamare renderScrollGallery() di app.js: sono due IIFE separate senza
   *  export, e questa galleria esiste solo per l'ospite keybox, un caso che
   *  app.js non conosce. `is-visible` messo subito, non lasciato
   *  all'IntersectionObserver di app.js: quell'observer osserva solo i nodi
   *  già nel DOM al primo render, e questa galleria arriva dopo (a fetch
   *  completato) — senza, le slide resterebbero a opacità 0 per sempre. */
  function galleriaKeyboxNellaGuida() {
    if (!dati || dati.metodoCheckin !== "keybox") return;
    var sez = document.getElementById("checkin");
    if (!sez || sez.querySelector(".gp-keybox-gallery")) return;
    var track = el("div", { className: "scroll-gallery__track" },
      KEYBOX_GALLERY.map(function (item) {
        var testo = item.alt[lang] || item.alt.en || item.alt.it || "";
        var figure = el("figure", { className: "scroll-gallery__slide is-visible" });
        var img = el("img", { alt: testo, className: "scroll-gallery__img", loading: "lazy" });
        // Se manca una foto, la slide sparisce invece di mostrare l'icona di
        // immagine rotta: a un ospite in fase di check-in una foto rotta
        // sembra "qualcosa non va", non "manca un contenuto".
        img.onerror = function () { figure.remove(); };
        img.src = item.src;
        figure.appendChild(img);
        return figure;
      }));
    inserisciInCheckin(
      el("div", { className: "gp-keybox-gallery scroll-gallery scroll-gallery--house" }, [track]),
      "gp-keybox-gallery");
  }

  function pulisci() {
    ["gp-overlay", "gp-bar"].forEach(function (id) {
      var n = document.getElementById(id);
      if (n) n.remove();
    });
    document.body.classList.remove("gp-locked");
  }

  /** Misura la barra promemoria APPENA COM'È nel DOM, invece di un rem
   *  indovinato in CSS: l'altezza vera dipende dal notch del telefono
   *  (--safe-top) e dalla lunghezza del testo, che cambia per lingua. Un
   *  numero fisso funzionava per coincidenza su un device e sull'header
   *  che finiva sovrapposto a metà della barra su altri — bug segnalato da
   *  screenshot. `offsetHeight` forza un reflow sincrono, ma qui gira solo ai
   *  cambi di stato (orario salvato, documento caricato…), mai a ogni frame. */
  function misuraBarra() {
    var bar = document.getElementById("gp-bar");
    document.documentElement.style.setProperty("--gp-bar-h", bar ? bar.offsetHeight + "px" : "0px");
  }
  // Il notch cambia dimensione ruotando il telefono, e il testo può andare a
  // capo su uno schermo più stretto: si rimisura, non si fida della vecchia.
  window.addEventListener("resize", misuraBarra);

  function disegna() {
    pulisci();
    if (!dati) { document.body.appendChild(bannerErrore()); misuraBarra(); return; }

    // `vuoleScheda` esiste perché la scheda non si apre solo quando MANCA
    // qualcosa: a documenti completi la barra in alto diventa quella del
    // pagamento, e il suo tasto deve poter riportare indietro lo stesso. Prima
    // ridisegnava la stessa barra e sembrava rotto.
    var incompleto = !dati.completo;
    if ((incompleto || vuoleScheda) && !guidaAperta) {
      document.body.appendChild(overlay());
      document.body.classList.add("gp-locked");
      misuraBarra();                            // nessuna barra: --gp-bar-h torna a 0
      return;                                  // la guida resta dietro, non serve altro
    }
    if (incompleto) document.body.appendChild(barra());
    else if (dati.imposta && dati.imposta.daPagare) document.body.appendChild(barraPagamento());
    misuraBarra();

    metodoCheckinNellaGuida();
    codiceNellaGuida();
    galleriaKeyboxNellaGuida();
    etaNellaGuida();
    backAllaSchedaNelCheckin();
  }

  // La guida si ridisegna a ogni cambio lingua: riattacchiamoci sopra.
  document.addEventListener("guide:rendered", function (e) {
    if (e.detail && e.detail.lang && T[e.detail.lang]) lang = e.detail.lang;
    if (dati || erroreRete) disegna();
  });

  document.addEventListener("DOMContentLoaded", function () {
    carica().then(disegna);
  });
})();
