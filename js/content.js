/* ============================================================
   CONTENIDO EDITABLE DEL REGALO
   Todo lo que se lee en el sitio vive aquí. Cambia textos, fechas,
   cartas o vales sin tocar el resto del código.
   ============================================================ */
window.CAPY = {
  config: {
    herName: "Liz",
    hisName: "Javier",
    // Nombres que el "login" acepta (se compara desde el inicio del texto, sin tildes ni mayúsculas)
    namesOk: ["liz"],
    startDate: "2024-07-20",          // aquel 20 de julio
    giftDate: "2026-09-20",           // día en que se entrega el regalo
    birthday: { month: 9, day: 20 },  // cumpleaños de Liz
    // WhatsApp de Javier con código de país y sin "+", ej. "573001234567".
    // Si se deja vacío, WhatsApp le deja elegir el chat a quien lo use.
    waNumber: "51959102904",
    // Avisos a Javier: se reciben en https://ntfy.sh/<topic> (web o app ntfy). El topic es el "secreto".
    notify: { topic: "capyverso-6910619a595afab801" },
    playlistId: "0yzq3kROigxfC881r6OTbA",
    petSuggestions: ["Capi", "Fresita", "Sandía", "Tonto"],
    // Cielo: cada fecha tiene su lugar. "chooser" = ella elige el lugar; "geo" = usa su ubicación real.
    sky: {
      dates: [
        { id: "start", label: "20 · jul · 2024", iso: "2024-07-20", hour: 21,
          place: { name: "El lugar donde empezó todo", lat: -16.416376, lon: -71.52619, tz: "America/Lima", link: "https://maps.app.goo.gl/QsNYFQBd916F4UvA6" },
          note: "Este es el cielo sobre el lugar donde empezó todo." },
        { id: "bday", label: "20 · sep · 2026", iso: "2026-09-20", hour: 21, chooser: true,
          note: "Tu cumpleaños. Tú eliges bajo qué cielo quieres pasarlo." },
        { id: "now", label: "Esta noche", iso: "today", hour: 21, geo: true,
          note: "El cielo que hay sobre ti ahora mismo." }
      ]
    }
  },

  // Mapa: lugares con Street View. Con "pano" se muestra la imagen exacta; sin él, la vista más cercana.
  places: [
    { id: "inicio", title: "Donde empezó todo", lat: -16.416376, lon: -71.52619, star: true, view: "map",
      text: "",
      link: "https://maps.app.goo.gl/QsNYFQBd916F4UvA6" },
    { id: "asvea", title: "Parque de Asvea", lat: -16.4111912, lon: -71.5267265,
      pano: { id: "lAHYrnVXFTdJiznFA46XvQ", yaw: 56.7, pitch: 7 },
      text: "Donde salían encuentros fugaces.",
      link: "https://maps.app.goo.gl/ewFiYf9SaPbVLw9dA" },
    { id: "siguas", title: "Plaza Santa Rita de Siguas", lat: -16.4941774, lon: -72.0946375,
      text: "Donde salió un paseo sin pensar.",
      link: "https://maps.app.goo.gl/NDeKwSjECTeWwEFM8" },
    { id: "camino", title: "Un punto del camino", lat: -16.3869395, lon: -71.5430891,
      pano: { id: "2b_pd-7N4Idu-EiTXKzDPw", yaw: 100, pitch: 27 },
      text: "",
      link: "https://maps.app.goo.gl/cBSsR6azYM7CkdW88" },
    { id: "americas", title: "Plaza Las Américas", lat: -16.3767686, lon: -71.5603595,
      text: "Donde pasamos una noche especial.",
      link: "https://maps.app.goo.gl/2wVdXKAyjGKaTore7" }
  ],

  // Cine: la película especial (el saludo de bienvenida es otro video). src vacío = "próximamente".
  cine: { title: "Función especial", src: "assets/cine.mp4", poster: "assets/cine-poster.jpg", note: "Otro invitado llegó a la fiesta, con pandereta y lentes de sol. Duración: 10 segundos. Aforo: una persona." },

  // Pastel: velas para soplar (con el micrófono) y deseo sellado hasta el próximo cumpleaños
  cake: { candles: 5, sealUntil: "2027-09-20" },

  // Retos de la cabina de fotos (uno por foto)
  boothPrompts: [
    "Tu cara de «ya llegó la comida»",
    "Cara de capibara serio y digno",
    "Haz un corazón con las manos (sin cursilería)",
    "La cara más tonta que tengas. Sin miedo."
  ],

  // Mensaje del día (rota cada día; el primero es el del cumpleaños)
  daily: [
    "¡Feliz cumpleaños, tonta! Hoy el capibara y yo mandamos en todo.",
    "Buenos días. Hoy toca no hacer nada apurada. Los capibaras lo llevan siglos haciendo y les va bien.",
    "Dato oficial: un capibara duerme con un ojo medio abierto. Yo duermo con un ojo puesto en tu mensaje.",
    "Hoy tienes permiso para ser 40% menos productiva y 100% más tú.",
    "Si alguien te cae mal hoy, recuerda: ni los caimanes le caen mal a un capibara.",
    "Recordatorio amistoso: tomar agua. Sí, tú. Sí, ahora.",
    "Los capibaras se bañan en aguas termales. Tú te mereces un día parecido.",
    "Hoy el capibara opina que estás haciendo las cosas bien. Es un animal de pocas palabras.",
    "Hay días de mil pendientes. Este es uno de los que se resuelven con una siesta o una canción. Elige.",
    "Cero drama, mucha sandía. Ese es el plan de hoy.",
    "El capibara dice que se acuerda de ti. Yo también, pero él no se hace el interesante.",
    "Si te ríes hoy de algo tonto, cuéntamelo. Los chistes malos se disfrutan más compartidos.",
    "Un capibara nunca llega tarde: llega cuando el pasto está en su punto.",
    "Hoy mereces algo rico. No pregunto qué. Tú ya sabes qué.",
    "Recordatorio: eres muy buena en muchas cosas. Se te olvida, yo no.",
    "Hoy el reto: sonreír al menos una vez sin razón. Cuenta lo que vale la pena.",
    "Vamos por partes: respira, estira el cuello, ponte una canción. Ahora sí, sigue.",
    "Estoy lejos, pero este capibara está en tu bolsillo. Hazle caso.",
    "El mundo puede esperar quince minutos. El capibara lo confirma.",
    "Si hoy te toca aguantar algo, aguanta con estilo. Después me lo cuentas.",
    "Hay gente que se ríe con el mismo chiste veinte veces. Yo solo conozco a una: tú.",
    "El capibara detecta que llevas rato sin tomar agua. Es muy observador.",
    "Hoy no hace falta ser fuerte todo el día. Con ratos alcanza.",
    "Consejo capibara: cuando dudes, quédate quieta un rato y observa. Casi siempre se arregla.",
    "Recibiste este mensaje por ser tú. No hay otro criterio.",
    "Hoy vamos con calma. Lo urgente, urgente de verdad, hay muy poco.",
    "Ojalá tu día tenga mucho pasto, poca prisa y buena compañía.",
    "Si el día se pone raro, dale al radio. Suena algo con tu nombre.",
    "Dato: el capibara es el roedor más grande del mundo. Y aun así es el más tranquilo. Aprende, día.",
    "Nos vemos pronto. Mientras tanto, este capibara te cuida."
  ],

  tapLines: [
    "¿Sí? Estaba pensando en sandía.",
    "Cosquillas. Cuidado.",
    "Te vi. Sigue.",
    "Uy. Otra vez tú.",
    "Ñam. Perdón, estaba soñando con comida.",
    "Mi humano dice que eres su persona favorita. No le digas que te dije.",
    "Ya casi me convences de que existo de verdad.",
    "Tranqui. Aquí seguimos.",
    "Toca más suave, soy muy digno.",
    "Mi humano dice que eres tonta. Yo digo que eres el mejor pasto del mundo.",
    "¡Presente! Pero sin correr.",
    "Aquí no pasa nada, y eso es lo mejor."
  ],
  sleepLines: [
    "zzz… déjame un ratito más.",
    "Shhh. Es de noche, tonta, ve a dormir.",
    "zzz… cinco minutos más… zzz…"
  ],
  eggTap7: "¡Sorpresa! Me hiciste 7 cosquillas seguidas. Premio: hoy la fiesta es tuya y de nadie más. Y sí, eres una tonta preciosa.",
  eggMoon: "Descubriste el astro secreto. Sí, el mismo cielo para los dos. Si miras arriba ahora, yo también.",
  eggFire: "Atrapaste diez luciérnagas. Están orgullosas de ti. Yo también.",

  // Canciones con dueño (ritual de pensar en el recuerdo propio)
  songs: [
    { title: "Take My Breath Away", artist: "Berlin",
      text: "Ochentera, dramática y con sintetizador de película, y aun así funciona. Esta no la explico: tú sabes en qué momento se te pegó. Yo el mío." },
    { title: "Sonnet", artist: "The Verve",
      text: "De las canciones que no piden que corras. Suena y el mundo baja un poquito la velocidad." },
    { title: "Kiss Me", artist: "Sixpence None the Richer",
      text: "Ligera, con olor a verano y una sonrisa que no se pudo aguantar. Suena y me da risa por dentro sin razón." },
    { title: "Baby Can I Hold You", artist: "Tracy Chapman",
      text: "Hay canciones que dicen en tres minutos lo que a uno le toma años ordenar. Esta es de esas. Sin más comentarios." }
  ],

  // Cartas. unlock: fecha (AAAA-MM-DD) a partir de la cual se puede abrir. Sin unlock = abierta.
  letters: [
    { id: "cumple", title: "Ábrela primero, tonta", tag: "Cumpleaños", body:
`Liz:

Hoy cumples años y yo estoy lejos, peleándome con un código para que un capibara te diga lo que preferiría decirte en persona. Ya ves: soy tan tonto que armé todo un mundo para no decírtelo mirándote a los ojos. (Mentira. Te lo diré igual, en cuanto pueda.)

Hace dos años, un 20 de julio, pasó algo que solo tú y yo sabemos. No lo voy a escribir aquí, por si alguien lee por encima de tu hombro. Desde ese día llevo la cuenta, y hoy son 792. No me obligo a contar: me sale solo.

Los capibaras tienen fama de llevarse bien con todos: con patos, con monos, hasta con caimanes. Yo solo me llevo bien contigo, pero creo que es la versión que más vale.

Feliz cumpleaños, tonta. Que este año te salga todo redondo, como un capibara.

— Javier` },
    { id: "maldia", title: "Cuando tengas un mal día", tag: "Ábrela cuando…", body:
`Si estás leyendo esto es porque el día te salió torcido.

Primero: no es tu culpa. Y si lo es, es una culpa chiquita y con arreglo.
Segundo: toma agua, respira hondo y ponle una canción a la radio.
Tercero: piensa en un capibara. Nada lo estresa y, cuando lo pienso bien, tú eres su referencia.

Cuando termines, cuéntame qué pasó. Y si no quieres contar, mándame un emoji de capibara y yo entiendo.

— J` },
    { id: "extranar", title: "Cuando me extrañes", tag: "Ábrela cuando…", body:
`Yo también. Esa es toda la carta. Bueno, casi.

Abre el telescopio en el mundo capibara: el cielo es el mismo aunque estemos en lugares distintos. Mándame una foto del tuyo y yo te mando la del mío. Compara cuál está más bonito. (Te aviso: el mío pierde.)

Y si no alcanza, llámame. Aunque sea para no decir nada.

— J` },
    { id: "dormir", title: "Cuando no puedas dormir", tag: "Ábrela cuando…", body:
`Cuenta capibaras, pero no de a uno: de a manada. Con eso ya te dormiste.

Si no funciona: respira contando 4 para adentro, 4 para sostener, 6 para soltar. Tres veces. Ahora otra playlist más lenta. Esta vez sin mirar el celular después de la tercera canción, ¿eh?

Y si ni así… escríbeme. Yo duermo poco, pero te contesto.

— J` },
    { id: "dudas", title: "Cuando dudes de ti", tag: "Ábrela cuando…", body:
`Te lo digo sin adornos, que los adornos son para las tarjetas:

Eres más capaz de lo que crees, más graciosa de lo que aceptas y más importante para mí de lo que sé explicar. Cuando dudes, acuérdate de esta carta. Y si te parece exagerada, contéstame con un "tonto" y ya estamos a mano.

— J` },

    { id: "oct", title: "Un mes después", tag: "20 de octubre", unlock: "2026-10-20", body:
`Ya pasó un mes de tu cumpleaños y todavía no me devuelves el capibara. Adoptado es adoptado.

Solo pasaba a decirte que sigues siendo mi plan favorito. Que la pases bien hoy. Que tomes agua. Que me cuentes algo.

— J` },
    { id: "nov", title: "El 20 de siempre", tag: "20 de noviembre", unlock: "2026-11-20", body:
`Otro 20. Ya me estoy acostumbrando a que este número tenga dueña.

Hoy no hay nada que celebrar en particular. Y por eso mismo escribo: para acordarnos de que se pueden celebrar los días normales, cuando salen bien.

— J` },
    { id: "dic", title: "Navidad de lejos", tag: "20 de diciembre", unlock: "2026-12-20", body:
`Las fiestas cuestan más cuando hay distancia, pero también saben distinto: uno se acuerda de lo que de verdad importa.

Este año el regalo es este capibara. El año que viene, espero que sea algo que se pueda abrazar.

— J` },
    { id: "ene", title: "Año nuevo, mismos tontos", tag: "20 de enero", unlock: "2027-01-20", body:
`Empezó un año más, y nosotros seguimos en la misma frecuencia. Eso, a estas alturas, ya es una tradición.

Deseo para este año: menos pendientes, más siestas, más planes contigo. Ahora tú.

— J` },
    { id: "jul27", title: "Tres años", tag: "20 de julio", unlock: "2027-07-20", body:
`Tres años desde aquel 20 de julio. No te voy a contar qué pasó, porque tú sabes. Solo quiero decirte que volvería a hacerlo, y que espero que tú también.

— J` }
  ],

  // Vales canjeables (al canjear se abre WhatsApp con el mensaje listo)
  vouchers: [
    { id: "peli",   emoji: "🎬", title: "Videollamada con película", text: "Tú eliges la peli y yo no opino. Ni siquiera si es de terror." },
    { id: "audio",  emoji: "🎧", title: "Cuento absurdo para dormir", text: "Un audio mío inventando un cuento sin pies ni cabeza." },
    { id: "cena",   emoji: "🍜", title: "Cena virtual", text: "Cada uno cocina lo mismo, y comparamos quién lo dejó peor." },
    { id: "tonto",  emoji: "🙃", title: "Un «tonto» gratis", text: "Tú me lo dices, yo me río. Sin apelación." },
    { id: "cancion",emoji: "🎵", title: "Sumar una canción", text: "Eliges la próxima canción de la playlist. Sin vetos." },
    { id: "hazme",  emoji: "🫡", title: "Hazme caso, una vez", text: "Un día de «sí, mi capitana». Con cláusulas razonables." },
    { id: "carta",  emoji: "✉️", title: "Carta en papel", text: "Escrita a mano y enviada de verdad por correo. Sí, del que se toca." },
    { id: "plan",   emoji: "🗺️", title: "El plan del próximo encuentro", text: "Tú decides dónde. Yo me encargo del resto." }
  ]
};
