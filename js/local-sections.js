/* Restaurants & directions — rendered by app.js */
window.GUEST_LOCAL = {
  it: {
    directions: {
      title: "Come arrivare",
      lead: "Viale Monte Nero 19 · Porta Romana",
      routes: [
        {
          id: "linate",
          label: "Da Linate",
          from: "Aeroporto di Linate",
          steps: [
            { type: "metro", line: "M4", name: "Metropolitana blu", detail: "Partenza direttamente in aeroporto", direction: "San Cristoforo" },
            { type: "stop", name: "Tricolore", detail: "Scendete a questa fermata" },
            { type: "tram", line: "9", name: "Tram 9", detail: "Prendete il tram in superficie", direction: "Porta Genova" },
            { type: "arrive", name: "Viale Monte Nero–Via Pier Lombardo", detail: "Fermata davanti all'appartamento" },
          ],
        },
        {
          id: "malpensa",
          label: "Da Malpensa",
          from: "Aeroporto di Malpensa",
          steps: [
            { type: "train", name: "Malpensa Express", detail: "Fino alla Stazione Centrale · ~€15 a persona" },
            { type: "metro", line: "M3", name: "Metropolitana gialla", detail: "Dalla Stazione Centrale", direction: "San Donato" },
            { type: "stop", name: "Porta Romana", detail: "Scendete qui" },
            { type: "walk", name: "5 min a piedi", detail: "Fino a Viale Monte Nero 19" },
          ],
        },
        {
          id: "bergamo",
          label: "Da Bergamo",
          from: "Aeroporto Orio al Serio (Bergamo)",
          steps: [
            { type: "bus", name: "Navetta per Milano", detail: "Terravision, Orio Shuttle o simili · ~€10 a persona · Stazione Centrale" },
            { type: "metro", line: "M3", name: "Metropolitana gialla", detail: "Dalla Stazione Centrale", direction: "San Donato" },
            { type: "stop", name: "Porta Romana", detail: "Scendete qui" },
            { type: "walk", name: "5 min a piedi", detail: "Fino a Viale Monte Nero 19" },
          ],
        },
      ],
    },
    restaurants: {
      title: "Ristoranti consigliati",
      lead: "Nel quartiere trovate di tutto. Uscendo dall'edificio, girate a sinistra: la maggior parte dei locali è sulla stessa strada.",
      toggle: "Vedi i ristoranti consigliati",
      tip: "Berberè è l'unico un po' più lontano (~5 min a piedi). Cueva Maya è proprio davanti casa.",
      items: [
        { name: "EmiPiace", tag: "Emiliano", desc: "Pasta fresca, lasagne e specialità locali" },
        { name: "Due Forni", tag: "Pizza", desc: "Un po' più caro, ma qualità superiore" },
        { name: "Berberè", tag: "Pizza artigianale", desc: "Molto popolare · ~5 min a piedi" },
        { name: "Panino Giusto", tag: "Panini", desc: "Catena milanese molto conosciuta" },
        { name: "Pescherie Riunite", tag: "Pesce", desc: "Prezzo alto, ottima qualità" },
        { name: "Cueva Maya", tag: "Messicano", desc: "Proprio davanti casa · ottimo", highlight: true },
      ],
    },
  },
  en: {
    directions: {
      title: "Getting here",
      lead: "Viale Monte Nero 19 · Porta Romana",
      routes: [
        {
          id: "linate",
          label: "From Linate",
          from: "Linate Airport",
          steps: [
            { type: "metro", line: "M4", name: "Blue metro line", detail: "Departs inside the airport", direction: "San Cristoforo" },
            { type: "stop", name: "Tricolore", detail: "Get off here" },
            { type: "tram", line: "9", name: "Tram 9", detail: "Take the tram at street level", direction: "Porta Genova" },
            { type: "arrive", name: "Viale Monte Nero–Via Pier Lombardo", detail: "Stop right in front of the apartment" },
          ],
        },
        {
          id: "malpensa",
          label: "From Malpensa",
          from: "Malpensa Airport",
          steps: [
            { type: "train", name: "Malpensa Express", detail: "To Milano Centrale · ~€15 per person" },
            { type: "metro", line: "M3", name: "Yellow metro line", detail: "From Centrale", direction: "San Donato" },
            { type: "stop", name: "Porta Romana", detail: "Get off here" },
            { type: "walk", name: "5 min walk", detail: "To Viale Monte Nero 19" },
          ],
        },
        {
          id: "bergamo",
          label: "From Bergamo",
          from: "Orio al Serio Airport (Bergamo)",
          steps: [
            { type: "bus", name: "Shuttle to Milan", detail: "Terravision, Orio Shuttle or similar · ~€10 per person · Centrale station" },
            { type: "metro", line: "M3", name: "Yellow metro line", detail: "From Centrale", direction: "San Donato" },
            { type: "stop", name: "Porta Romana", detail: "Get off here" },
            { type: "walk", name: "5 min walk", detail: "To Viale Monte Nero 19" },
          ],
        },
      ],
    },
    restaurants: {
      title: "Suggested restaurants",
      lead: "The neighbourhood has plenty of options. Exit the building, turn left — most places are on the same street.",
      toggle: "Show suggested restaurants",
      tip: "Berberè is the only one slightly farther (~5 min walk). Cueva Maya is right in front of the apartment.",
      items: [
        { name: "EmiPiace", tag: "Emilian", desc: "Fresh pasta, lasagna, and local specialties" },
        { name: "Due Forni", tag: "Pizza", desc: "A bit pricier, but better quality" },
        { name: "Berberè", tag: "Artisan pizza", desc: "Very popular · ~5 min walk" },
        { name: "Panino Giusto", tag: "Sandwiches", desc: "One of Milan's best-known chains" },
        { name: "Pescherie Riunite", tag: "Fish", desc: "Pricey, excellent quality" },
        { name: "Cueva Maya", tag: "Mexican", desc: "Right in front of the apartment · excellent", highlight: true },
      ],
    },
  },
  es: {
    "directions": {
      "title": "Cómo llegar",
      "lead": "Viale Monte Nero 19 · Porta Romana",
      "routes": [
        {
          "id": "linate",
          "label": "Desde Linate",
          "from": "Aeroporto di Linate",
          "steps": [
            {
              "type": "metro",
              "line": "M4",
              "name": "Metro azul",
              "detail": "Salida directamente en el aeropuerto",
              "direction": "San Cristoforo"
            },
            {
              "type": "stop",
              "name": "Tricolore",
              "detail": "Bajad en esta parada"
            },
            {
              "type": "tram",
              "line": "9",
              "name": "Tram 9",
              "detail": "Tomad el tranvía en superficie",
              "direction": "Porta Genova"
            },
            {
              "type": "arrive",
              "name": "Viale Monte Nero–Via Pier Lombardo",
              "detail": "Parada delante del apartamento"
            }
          ]
        },
        {
          "id": "malpensa",
          "label": "Desde Malpensa",
          "from": "Aeroporto di Malpensa",
          "steps": [
            {
              "type": "train",
              "name": "Malpensa Express",
              "detail": "Hasta la Estación Central · ~15 € por persona"
            },
            {
              "type": "metro",
              "line": "M3",
              "name": "Metro amarillo",
              "detail": "Desde la Estación Central",
              "direction": "San Donato"
            },
            {
              "type": "stop",
              "name": "Porta Romana",
              "detail": "Bajad aquí"
            },
            {
              "type": "walk",
              "name": "5 min a pie",
              "detail": "Hasta Viale Monte Nero 19"
            }
          ]
        },
        {
          "id": "bergamo",
          "label": "Desde Bérgamo",
          "from": "Aeroporto Orio al Serio (Bergamo)",
          "steps": [
            {
              "type": "bus",
              "name": "Autobús a Milán",
              "detail": "Terravision, Orio Shuttle o similares · ~10 € por persona · Estación Central"
            },
            {
              "type": "metro",
              "line": "M3",
              "name": "Metro amarillo",
              "detail": "Desde la Estación Central",
              "direction": "San Donato"
            },
            {
              "type": "stop",
              "name": "Porta Romana",
              "detail": "Bajad aquí"
            },
            {
              "type": "walk",
              "name": "5 min a pie",
              "detail": "Hasta Viale Monte Nero 19"
            }
          ]
        }
      ]
    },
    "restaurants": {
      "title": "Restaurantes recomendados",
      "lead": "En el barrio hay de todo. Al salir del edificio, girad a la izquierda: la mayoría de los locales está en la misma calle.",
      "toggle": "Ver los restaurantes recomendados",
      "tip": "Berberè es el único algo más lejos (~5 min a pie). Cueva Maya está justo enfrente de casa.",
      "items": [
        {
          "name": "EmiPiace",
          "tag": "Emiliano",
          "desc": "Pasta fresca, lasaña y especialidades locales"
        },
        {
          "name": "Due Forni",
          "tag": "Pizza",
          "desc": "Un poco más caro, pero de mayor calidad"
        },
        {
          "name": "Berberè",
          "tag": "Pizza artesanal",
          "desc": "Muy popular · ~5 min a pie"
        },
        {
          "name": "Panino Giusto",
          "tag": "Bocadillos",
          "desc": "Cadena milanesa muy conocida"
        },
        {
          "name": "Pescherie Riunite",
          "tag": "Pescado",
          "desc": "Precio alto, calidad excelente"
        },
        {
          "name": "Cueva Maya",
          "tag": "Mexicano",
          "desc": "Justo enfrente de casa · buenísimo",
          "highlight": true
        }
      ]
    }
  },
  fr: {
    "directions": {
      "title": "Comment venir",
      "lead": "Viale Monte Nero 19 · Porta Romana",
      "routes": [
        {
          "id": "linate",
          "label": "Depuis Linate",
          "from": "Aeroporto di Linate",
          "steps": [
            {
              "type": "metro",
              "line": "M4",
              "name": "Métro bleu",
              "detail": "Départ directement à l'aéroport",
              "direction": "San Cristoforo"
            },
            {
              "type": "stop",
              "name": "Tricolore",
              "detail": "Descendez à cet arrêt"
            },
            {
              "type": "tram",
              "line": "9",
              "name": "Tram 9",
              "detail": "Prenez le tram en surface",
              "direction": "Porta Genova"
            },
            {
              "type": "arrive",
              "name": "Viale Monte Nero–Via Pier Lombardo",
              "detail": "Arrêt devant l'appartement"
            }
          ]
        },
        {
          "id": "malpensa",
          "label": "Depuis Malpensa",
          "from": "Aeroporto di Malpensa",
          "steps": [
            {
              "type": "train",
              "name": "Malpensa Express",
              "detail": "Jusqu'à la gare centrale · ~15 € par personne"
            },
            {
              "type": "metro",
              "line": "M3",
              "name": "Métro jaune",
              "detail": "Depuis la gare centrale",
              "direction": "San Donato"
            },
            {
              "type": "stop",
              "name": "Porta Romana",
              "detail": "Descendez ici"
            },
            {
              "type": "walk",
              "name": "5 min à pied",
              "detail": "Jusqu'au Viale Monte Nero 19"
            }
          ]
        },
        {
          "id": "bergamo",
          "label": "Depuis Bergame",
          "from": "Aeroporto Orio al Serio (Bergamo)",
          "steps": [
            {
              "type": "bus",
              "name": "Navette pour Milan",
              "detail": "Terravision, Orio Shuttle ou similaires · ~10 € par personne · gare centrale"
            },
            {
              "type": "metro",
              "line": "M3",
              "name": "Métro jaune",
              "detail": "Depuis la gare centrale",
              "direction": "San Donato"
            },
            {
              "type": "stop",
              "name": "Porta Romana",
              "detail": "Descendez ici"
            },
            {
              "type": "walk",
              "name": "5 min à pied",
              "detail": "Jusqu'au Viale Monte Nero 19"
            }
          ]
        }
      ]
    },
    "restaurants": {
      "title": "Restaurants recommandés",
      "lead": "Le quartier propose de tout. En sortant de l'immeuble, tournez à gauche : la plupart des adresses sont dans la même rue.",
      "toggle": "Voir les restaurants recommandés",
      "tip": "Berberè est le seul un peu plus loin (~5 min à pied). Cueva Maya est juste en face.",
      "items": [
        {
          "name": "EmiPiace",
          "tag": "Émilien",
          "desc": "Pâtes fraîches, lasagnes et spécialités locales"
        },
        {
          "name": "Due Forni",
          "tag": "Pizza",
          "desc": "Un peu plus cher, mais de meilleure qualité"
        },
        {
          "name": "Berberè",
          "tag": "Pizza artisanale",
          "desc": "Très prisé · ~5 min à pied"
        },
        {
          "name": "Panino Giusto",
          "tag": "Sandwichs",
          "desc": "Chaîne milanaise très connue"
        },
        {
          "name": "Pescherie Riunite",
          "tag": "Poisson",
          "desc": "Prix élevé, très bonne qualité"
        },
        {
          "name": "Cueva Maya",
          "tag": "Mexicain",
          "desc": "Juste en face · excellent",
          "highlight": true
        }
      ]
    }
  },
  de: {
    "directions": {
      "title": "Anfahrt",
      "lead": "Viale Monte Nero 19 · Porta Romana",
      "routes": [
        {
          "id": "linate",
          "label": "Ab Linate",
          "from": "Aeroporto di Linate",
          "steps": [
            {
              "type": "metro",
              "line": "M4",
              "name": "U-Bahn blau",
              "detail": "Abfahrt direkt am Flughafen",
              "direction": "San Cristoforo"
            },
            {
              "type": "stop",
              "name": "Tricolore",
              "detail": "Steigen Sie hier aus"
            },
            {
              "type": "tram",
              "line": "9",
              "name": "Tram 9",
              "detail": "Nehmen Sie oberirdisch die Tram",
              "direction": "Porta Genova"
            },
            {
              "type": "arrive",
              "name": "Viale Monte Nero–Via Pier Lombardo",
              "detail": "Haltestelle vor der Wohnung"
            }
          ]
        },
        {
          "id": "malpensa",
          "label": "Ab Malpensa",
          "from": "Aeroporto di Malpensa",
          "steps": [
            {
              "type": "train",
              "name": "Malpensa Express",
              "detail": "Bis zum Hauptbahnhof · ~15 € pro Person"
            },
            {
              "type": "metro",
              "line": "M3",
              "name": "U-Bahn gelb",
              "detail": "Ab Hauptbahnhof",
              "direction": "San Donato"
            },
            {
              "type": "stop",
              "name": "Porta Romana",
              "detail": "Hier aussteigen"
            },
            {
              "type": "walk",
              "name": "5 Min. zu Fuß",
              "detail": "Bis Viale Monte Nero 19"
            }
          ]
        },
        {
          "id": "bergamo",
          "label": "Ab Bergamo",
          "from": "Aeroporto Orio al Serio (Bergamo)",
          "steps": [
            {
              "type": "bus",
              "name": "Shuttle nach Mailand",
              "detail": "Terravision, Orio Shuttle o. Ä. · ~10 € pro Person · Hauptbahnhof"
            },
            {
              "type": "metro",
              "line": "M3",
              "name": "U-Bahn gelb",
              "detail": "Ab Hauptbahnhof",
              "direction": "San Donato"
            },
            {
              "type": "stop",
              "name": "Porta Romana",
              "detail": "Hier aussteigen"
            },
            {
              "type": "walk",
              "name": "5 Min. zu Fuß",
              "detail": "Bis Viale Monte Nero 19"
            }
          ]
        }
      ]
    },
    "restaurants": {
      "title": "Empfohlene Restaurants",
      "lead": "Im Viertel finden Sie alles. Beim Verlassen des Hauses links abbiegen: Die meisten Lokale liegen in derselben Straße.",
      "toggle": "Empfohlene Restaurants ansehen",
      "tip": "Berberè liegt als einziges etwas weiter weg (~5 Min. zu Fuß). Cueva Maya ist direkt gegenüber.",
      "items": [
        {
          "name": "EmiPiace",
          "tag": "Emilianisch",
          "desc": "Frische Pasta, Lasagne und lokale Spezialitäten"
        },
        {
          "name": "Due Forni",
          "tag": "Pizza",
          "desc": "Etwas teurer, dafür bessere Qualität"
        },
        {
          "name": "Berberè",
          "tag": "Handwerklich gemachte Pizza",
          "desc": "Sehr beliebt · ~5 Min. zu Fuß"
        },
        {
          "name": "Panino Giusto",
          "tag": "Sandwiches",
          "desc": "Sehr bekannte Mailänder Kette"
        },
        {
          "name": "Pescherie Riunite",
          "tag": "Fisch",
          "desc": "Hoher Preis, ausgezeichnete Qualität"
        },
        {
          "name": "Cueva Maya",
          "tag": "Mexikanisch",
          "desc": "Direkt gegenüber · sehr gut",
          "highlight": true
        }
      ]
    }
  },
};
