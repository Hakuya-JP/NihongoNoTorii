/* ==========================================================================
   GUÍA PASO A PASO PARA AGREGAR PREGUNTAS AL SIMULADOR JLPT
   ==========================================================================
   
   ¡Hola! Agregar preguntas, nuevos exámenes o niveles a esta base de datos es súper fácil.
   Solo debes seguir esta estructura:

   1. CÓMO ESTRUCTURAR UNA PREGUNTA:
   ---------------------------------
   Cada pregunta es un objeto dentro de la lista 'preguntas':

   {
     id: "n5-1-1",                    // ID único para la pregunta
     pregunta: "<u>先週</u> デパートに いきました。", // Oración principal (soporta <u>subrayado</u>, <b>negrilla</b>, etc.)
     instruccion: "______の ことばは ひらがなで どう かきますか。", // Instrucción/contexto (se muestra en un bloque separado arriba)
     imagenUrl: "image/ejemplo.png",  // (OPCIONAL) Enlace a la imagen (puedes usar 'imagenUrl', 'imagen' o 'image')
     audioUrl: "audio/ejemplo.mp3",   // (OPCIONAL) Enlace a archivo de audio MP3 (puedes usar 'audioUrl' o 'audio')
     opciones: [
       "1. せんしゅ",
       "2. せんしゅう",
       "3. ぜんしゅ",
       "4. ぜんしゅう"
     ],
     respuestaCorrecta: 1,            // Índice de la respuesta correcta (0 = Opción 1, 1 = Opción 2, 2 = Opción 3, 3 = Opción 4)
     explicacion: "Explicación detallada de por qué es la respuesta correcta."
   }

   2. ESTRUCTURA POR NIVEL Y EXAMEN:
   ---------------------------------
   Nivel (N5, N4, N3, N2, N1, KANA) 
     └─ Examen ("examen-1", "examen-2")
         └─ Secciones (Vocabulario, Gramática y Lectura, Comprensión Auditiva)
             └─ Preguntas [...]

   ========================================================================== */

const JLPT_DATA = {
  // ========================================================================
  // NIVEL N5
  // ========================================================================
  "N5": {
    "examen-1": {
      id: "n5-examen-1",
      titulo: "JLPT N5 - Examen Oficial Opccion 1",
      tiempoMinutos: 90,
      secciones: [
        {
          nombre: "Vocabulario (文字・語彙)",
          icono: "🔤",
          preguntas:[
  {
    id: "n5-1-v1",
    pregunta: "<u>先週</u> デパートに かいものに いきました。",
    contexto: "______の ことばは ひらがなで どう かきますか。",
    opciones: [
      "1. せんしゅ",
      "2. せんしゅう",
      "3. ぜんしゅ",
      "4. ぜんしゅう"
    ],
    respuestaCorrecta: 2,
    explicacion: "El kanji 「先週」 se lee せんしゅう (senshuu) y significa 'la semana pasada'."
  },
  {
    id: "n5-1-v2",
    pregunta: "ごはんの <u>後</u>で さんぽします。",
    contexto: "______の ことばは ひらがなで どう かきますか。",
    opciones: [
      "1. つぎ",
      "2. うしろ",
      "3. まえ",
      "4. あと"
    ],
    respuestaCorrecta: 4,
    explicacion: "El kanji 「後」 en la expresión 「後で」 se lee あと (ato) y significa 'después'."
  },
  {
    id: "n5-1-v3",
    pregunta: "もう いちど <u>言って</u> ください。",
    contexto: "______の ことばは ひらがなで どう かきますか。",
    opciones: [
      "1. いって",
      "2. きって",
      "3. まって",
      "4. たって"
    ],
    respuestaCorrecta: 1,
    explicacion: "El kanji 「言」 del verbo 言う se lee い (i) en la forma -te (言って = いって / itte), que significa 'decir'."
  },
  {
    id: "n5-1-v4",
    pregunta: "ちかくに <u>山</u>が あります。",
    contexto: "______の ことばは ひらがなで どう かきますか。",
    opciones: [
      "1. かわ",
      "2. やま",
      "3. いけ",
      "4. うみ"
    ],
    respuestaCorrecta: 2,
    explicacion: "El kanji 「山」 se lee やま (yama) y significa 'montaña'."
  },
  {
    id: "n5-1-v5",
    pregunta: "この ホテルは へやが <u>多い</u>です。",
    contexto: "______の ことばは ひらがなで どう かきますか。",
    opciones: [
      "1. すくない",
      "2. おおい",
      "3. せまい",
      "4. ひろい"
    ],
    respuestaCorrecta: 2,
    explicacion: "El kanji 「多」 en 「多い」 se lee おおい (ooi) y significa 'muchos/numerosos'."
  },
  {
    id: "n5-1-v6",
    pregunta: "ともだちと いっしょに <u>学校</u>に いきます。",
    contexto: "______の ことばは ひらがなで どう かきますか。",
    opciones: [
      "1. がこう",
      "2. がこお",
      "3. がっこう",
      "4. がっこお"
    ],
    respuestaCorrecta: 3,
    explicacion: "El kanji 「学校」 se lee がっこう (gakkou) y significa 'escuela'."
  },

  {
    id: "n5-1-v7",
    pregunta: "えんぴつが <u>六本</u> あります。",
    contexto: "______の ことばは ひらがなで どう かきますか。",
    opciones: [
      "1. ろくぼん",
      "2. ろくぽん",
      "3. ろっぽん",
      "4. ろっぽん"
    ],
    respuestaCorrecta: 4,
    explicacion: "El contador de objetos alargados 「本」 con el número 6 「六本」 se pronuncia ろっぽん (roppon)."
  },
  {
    id: "n5-1-v8",
    pregunta: "この <u>新聞</u>は いくらですか。",
    contexto: "______の ことばは ひらがなで どう かきますか。",
    opciones: [
      "1. しんむん",
      "2. しんぶん",
      "3. しむん",
      "4. しぶん"
    ],
    respuestaCorrecta: 2,
    explicacion: "El kanji 「新聞」 se lee しんぶん (shinbun) y significa 'periódico'."
  },
  {
    id: "n5-1-v9",
    pregunta: "この カメラは <u>安い</u>です。",
    contexto: "______の ことばは ひらがなで どう かきますか。",
    opciones: [
      "1. たかい",
      "2. やすい",
      "3. おもい",
      "4. かるい"
    ],
    respuestaCorrecta: 2,
    explicacion: "El kanji 「安」 en 「安い」 se lee やすい (yasui) y significa 'barato'."
  },
  {
    id: "n5-1-v10",
    pregunta: "かさは <u>外</u>に あります。",
    contexto: "______の ことばは ひらがなで どう かきますか。",
    opciones: [
      "1. いえ",
      "2. なか",
      "3. そと",
      "4. にわ"
    ],
    respuestaCorrecta: 3,
    explicacion: "El kanji 「外」 se lee そと (soto) y significa 'afuera' o 'exterior'."
  },
  {
    id: "n5-2-v11",
    pregunta: "けさ <u>しゃわー</u>を あびました。",
    contexto: "______の ことばは カタカナで どう かきますか。",
    opciones: [
      "1. シヤワー",
      "2. シャワー",
      "3. ツヤワー",
      "4. ツャワー"
    ],
    respuestaCorrecta: 1,
    explicacion: "La palabra 'ducha' (shower) se escribe en katakana como シャワー (con ャ pequeño)."
  },
  {
    id: "n5-2-v12",
    pregunta: "コーヒーを <u>のみました</u>。",
    contexto: "______の ことばは 漢字で どう かきますか。",
    opciones: [
      "1. 飯みました",
      "2. 飲みました",
      "3. 餃みました",
      "4. 飲りました"
    ],
    respuestaCorrecta: 2,
    explicacion: "El verbo 'beber' (nomimashita) se escribe con el kanji 「飲」: 飲みました."
  },
  {
    id: "n5-2-v13",
    pregunta: "あたらしい <u>くるま</u>を かいました。",
    contexto: "______の ことばは 漢字で どう かきますか。",
    opciones: [
      "1. 卓",
      "2. 草",
      "3. 車",
      "4. 筆"
    ],
    respuestaCorrecta: 3,
    explicacion: "La palabra 'coche/auto' (kuruma) se escribe con el kanji 「車」."
  },
  {
    id: "n5-2-v14",
    pregunta: "この ぼうしは <u>1000えん</u>です。",
    contexto: "______の ことばは 漢字で どう かきますか。",
    opciones: [
      "1. 1000内",
      "2. 1000用",
      "3. 1000冊",
      "4. 1000円"
    ],
    respuestaCorrecta: 4,
    explicacion: "La moneda japonesa 'yen' (en) se escribe con el kanji 「円」: 1000円."
  },
  {
    id: "n5-2-v15",
    pregunta: "しゅくだいが <u>はんぶん</u> おわりました。",
    contexto: "______の ことばは 漢字で どう かきますか。",
    opciones: [
      "1. 羊合",
      "2. 米分",
      "3. 羊分",
      "4. 半分"
    ],
    respuestaCorrecta: 4,
    explicacion: "La palabra 'la mitad' (hanbun) se escribe con los kanjis 「半分」."
  },
  {
    id: "n5-2-v16",
    pregunta: "わたしの うちに <u>きませんか</u>。",
    contexto: "______の ことばは 漢字で どう かきますか。",
    opciones: [
      "1. 来ませんか",
      "2. 采ませんか",
      "3. 木ませんか",
      "4. 未ませんか"
    ],
    respuestaCorrecta: 1,
    explicacion: "El verbo 'venir' (kimasen) se escribe con el kanji 「来」: 来ません."
  },

  {
    id: "n5-2-v17",
    pregunta: "きのう たなかさんと <u>あいました</u>。",
    contexto: "______の ことばは 漢字で どう かきますか。",
    opciones: [
      "1. 見いました",
      "2. 書きました",
      "3. 会いました",
      "4. 話しました"
    ],
    respuestaCorrecta: 3,
    explicacion: "El verbo 'encontrarse con/ver a alguien' (aimashita) se escribe con el kanji 「会」: 会いました."
  },
  {
    id: "n5-2-v18",
    pregunta: "いもうとと <u>おなじ</u> ふくを かいました。",
    contexto: "______の ことばは 漢字で どう かきますか。",
    opciones: [
      "1. 同じ",
      "2. 回じ",
      "3. 向じ",
      "4. 司じ"
    ],
    respuestaCorrecta: 1,
    explicacion: "La palabra 'mismo/igual' (onaji) se escribe con el kanji 「同」: 同じ."
  },
  {
    id: "n5-3-v19",
    pregunta: "わたしの へやは この （ ）の ２かいです。",
    contexto: "（ ）に なにを いれますか。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。",
    opciones: [
      "1. エレベーター",
      "2. プール",
      "3. エアコン",
      "4. アパート"
    ],
    respuestaCorrecta: 4,
    explicacion: "アパート (apartamento/edificio de departamentos) indica dónde se encuentra la habitación en el segundo piso."
  },
  {
    id: "n5-3-v20",
    pregunta: "さとうさんは ギターを じょうずに （ ）。",
    contexto: "（ ）に なにを いれますか。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。",
    opciones: [
      "1. うたいます",
      "2. ききます",
      "3. ひきます",
      "4. あそびます"
    ],
    respuestaCorrecta: 3,
    explicacion: "El verbo para 'tocar' instrumentos de cuerda como la guitarra es ひきます (hikimasu)."
  },
  {
    id: "n5-3-v21",
    pregunta: "テーブルに おさらと はしを （ ） ください。",
    contexto: "（ ）に なにを いれますか。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。",
    opciones: [
      "1. ならべて",
      "2. とって",
      "3. たべて",
      "4. あらって"
    ],
    respuestaCorrecta: 1,
    explicacion: "ならべて (narabete, de ならべる) significa 'alinear' u 'ordenar/colocar' platos y palillos sobre la mesa."
  },
  {
    id: "n5-3-v22",
    pregunta: "けさ そうじを したから へやは （ ） です。",
    contexto: "（ ）に なにを いれますか。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。",
    opciones: [
      "1. きれい",
      "2. きたない",
      "3. あかるい",
      "4. くらい"
    ],
    respuestaCorrecta: 1,
    explicacion: "Al haber limpiado (そうじを したから), la habitación está limpia (きれい)."
  },
  {
    id: "n5-3-v23",
    pregunta: "きょうは 500（ ） およぎました。",
    contexto: "（ ）に なにを いれますか。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。",
    opciones: [
      "1. ど",
      "2. ばん",
      "3. メートル",
      "4. グラム"
    ],
    respuestaCorrecta: 3,
    explicacion: "La unidad de medida adecuada para la distancia nadada (およぎました) es メートル (metros)."
  },
  {
    id: "n5-3-v24",
    pregunta: "えきから たいしかんまでの （ ）を かいて ください。",
    contexto: "（ ）に なにを いれますか。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。",
    opciones: [
      "1. しゃしん",
      "2. ちず",
      "3. てがみ",
      "4. きっぷ"
    ],
    respuestaCorrecta: 2,
    explicacion: "Dibuja/escribe (かいて) un mapa (ちず) desde la estación hasta la embajada."
  },
  {
    id: "n5-3-v25",
    pregunta: "うるさいから テレビを （ ） ください。",
    contexto: "（ ）に なにを いれますか。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。",
    opciones: [
      "1. けして",
      "2. つけて",
      "3. しめて",
      "4. あけて"
    ],
    respuestaCorrecta: 1,
    explicacion: "Como está ruidoso (うるさいから), se pide apagar la televisión: けして (apagar aparatos eléctricos/luz)."
  },
  {
    id: "n5-3-v26",
    pregunta: "きょうは （ ）が ふって います。",
    contexto: "（ ）に なにを いれますか。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。",
    opciones: [
      "1. くもり",
      "2. はれ",
      "3. かぜ",
      "4. ゆき"
    ],
    respuestaCorrecta: 4,
    explicacion: "El verbo ふって います (caer precipitaciones) se utiliza con lluvia (あめ) o nieve (ゆき). En este caso, ゆき (nieve) es la opción correcta."
  },
  {
    id: "n5-3-v27",
    pregunta: "はこに りんごが （ ） あります。",
    contexto: "（ ）に なにを いれますか。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。",
    imagenUrl: "image/JLPT/N5/27-n5.jpg",
    opciones: [
      "1. よっつ",
      "2. いつつ",
      "3. むっつ",
      "4. ななつ"
    ],
    respuestaCorrecta: 2,
    explicacion: "En la imagen se observan 6 manzanas dentro de la caja. El contador nativo para 6 objetos es むっつ (muttsu)."
  },
  {
    id: "n5-3-v28",
    pregunta: "めがねは つくえの （ ）に あります。",
    contexto: "（ ）に なにを いれますか。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。",
    imagenUrl: "image/JLPT/N5/28-n5.png",
    opciones: [
      "1. そば",
      "2. よこ",
      "3. した",
      "4. うえ"
    ],
    respuestaCorrecta: 4,
    explicacion: "En la ilustración, los lentes (めがね) están encima (うえ) del escritorio (つくえ)."
  },
  {
    id: "n5-4-v29",
    pregunta: "<u>まいばん くにの かぞくに でんわします。</u>",
    contexto: "______の ぶんと だいたい おなじ いみの ぶんが あります。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。",
    opciones: [
      "1. よるは ときどき くにの かぞくに でんわします。",
      "2. あさは ときどき くにの かぞくに でんわします。",
      "3. よるは いつも くにの かぞくに でんわします。",
      "4. あさは いつも くにの かぞくに でんわします。"
    ],
    respuestaCorrecta: 3,
    explicacion: "「まいばん」 (todas las noches) equivale a 「よるは いつも」 (por las noches, siempre en la noche)."
  },
  {
    id: "n5-4-v30",
    pregunta: "<u>この まちには ゆうめいな たてものが あります。</u>",
    contexto: "______の ぶんと だいたい おなじ いみの ぶんが あります。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。",
    opciones: [
      "1. この まちには ゆうめいな ビルが あります。",
      "2. この まちには ゆうめいな おちゃが あります。",
      "3. この まちには ゆうめいな ケーキが あります。",
      "4. この まちには ゆうめいな こうえんが あります。"
    ],
    respuestaCorrecta: 1,
    explicacion: "「たてもの」 significa 'edificio/construcción', lo cual equivale de forma general a 「ビル」 (edificio)."
  },
  {
    id: "n5-4-v31",
    pregunta: "<u>その えいがは おもしろくなかったです。</u>",
    contexto: "______の ぶんと だいたい おなじ いみの ぶんが あります。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。",
    opciones: [
      "1. その えいがは たのしかったです。",
      "2. その えいがは つまらなかったです。",
      "3. その えいがは みじかかったです。",
      "4. その えいがは ながかったです。"
    ],
    respuestaCorrecta: 2,
    explicacion: "「おもしろくなかった」 (no fue interesante) equivale a 「つまらなかった」 (fue aburrido)."
  },
  {
    id: "n5-4-v32",
    pregunta: "<u>たんじょうびは 6がつ15にちです。</u>",
    contexto: "______の ぶんと だいたい おなじ いみの ぶんが あります。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。",
    opciones: [
      "1. 6がつ15にちに けっこんしました。",
      "2. 6がつ15にちに テストが はじまりました。",
      "3. 6がつ15にちに うまれました。",
      "4. 6がつ15にちに くにへ かえりました。"
    ],
    respuestaCorrecta: 3,
    explicacion: "El cumpleaños (たんじょうび) indica el día en que alguien nació (うまれました)."
  },
  {
    id: "n5-4-v33",
    pregunta: "<u>にねんまえに きょうとへ いきました。</u>",
    contexto: "______の ぶんと だいたい おなじ いみの ぶんが あります。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。",
    opciones: [
      "1. きのう きょうとへ いきました。",
      "2. おととい きょうとへ いきました。",
      "3. きょねん きょうとへ いきました。",
      "4. おとし きょうとへ いきました。"
    ],
    respuestaCorrecta: 4,
    explicacion: "「にねんまえ」 (hace dos años) equivale a 「おとし」 (anteayer para años / hace dos años)."
  },]},
        {
          nombre: "Gramática y Lectura (文法・読解)",
          icono: "📖",
          preguntas: [
  {
    id: "n5-1-g1",
    pregunta: "日本（ ____ ）ラーメンは おいしいです。",
    contexto: "（ ）に 何を 入れますか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。",
    opciones: [
      "1. に",
      "2. の",
      "3. を",
      "4. へ"
    ],
    respuestaCorrecta: 2,
    explicacion: "La partícula 「の」 conecta dos sustantivos (日本 y ラーメン) para indicar origen o procedencia: 'el ramen de Japón'."
  },
  {
    id: "n5-1-g2",
    pregunta: "わたしには きょうだいが 二人 います。弟（ ____ ）妹です。",
    contexto: "（ ）に 何を 入れますか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。",
    opciones: [
      "1. は",
      "2. も",
      "3. と",
      "4. か"
    ],
    respuestaCorrecta: 3,
    explicacion: "La partícula 「と」 actúa como conjunción 'y' para listar sustantivos completos: 'un hermano menor y una hermana menor'."
  },
  {
    id: "n5-1-g3",
    pregunta: "山下「田中さん（ ____ ）きのう どこかに 出かけましたか。」\n田中「いいえ、いえに いました。」",
    contexto: "（ ）に 何を 入れますか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。",
    opciones: [
      "1. で",
      "2. は",
      "3. を",
      "4. に"
    ],
    respuestaCorrecta: 2,
    explicacion: "La partícula 「は」 marca el tema de la oración después del nombre de la persona a la que se le pregunta (田中さんは...)."
  },
  {
    id: "n5-1-g4",
    pregunta: "（タクシーで）\nA「つぎの かどを 右（ ____ ）まがって ください。」\nB「わかりました。」",
    contexto: "（ ）に 何を 入れますか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。",
    opciones: [
      "1. が",
      "2. や",
      "3. か",
      "4. に"
    ],
    respuestaCorrecta: 4,
    explicacion: "La partícula 「に」 indica la dirección u orientación hacia la que se realiza un giro (右にまがる = girar a la derecha)."
  },
  {
    id: "n5-1-g5",
    pregunta: "きのう、わたしは ひとり（ ____ ）えいがを 見に 行きました。",
    contexto: "（ ）に 何を 入れますか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。",
    opciones: [
      "1. が",
      "2. を",
      "3. で",
      "4. は"
    ],
    respuestaCorrecta: 3,
    explicacion: "La expresión 「ひとりで」 utiliza la partícula 「で」 para indicar el modo o estado en que se realiza una acción ('solo / por mi cuenta')."
  },
  {
    id: "n5-1-g6",
    pregunta: "山下「今日 パーティーが ありますから、田中さん（ ____ ）来て ください。」\n田中「ありがとうございます。」",
    contexto: "（ ）に 何を 入れますか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。",
    opciones: [
      "1. に",
      "2. も",
      "3. や",
      "4. で"
    ],
    respuestaCorrecta: 2,
    explicacion: "La partícula 「も」 significa 'también'. En este contexto, invita a Tanaka-san diciendo: 'Tanaka-san, usted también venga, por favor'."
  },
  {
    id: "n5-1-g7",
    pregunta: "田中「この ぼうしは 山田さん（ ____ ）ですか。」\n山田「はい。」",
    contexto: "（ ）に 何を 入れますか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。",
    opciones: [
      "1. や",
      "2. は",
      "3. の",
      "4. か"
    ],
    respuestaCorrecta: 3,
    explicacion: "La partícula 「の」 indica posesión: '¿Este sombrero es de Yamada-san?'."
  },
  {
    id: "n5-1-g8",
    pregunta: "駅まで タクシーで 1000円（ ____ ）です。",
    contexto: "（ ）に 何を 入れますか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。",
    opciones: [
      "1. ぐらい",
      "2. など",
      "3. ごろ",
      "4. も"
    ],
    respuestaCorrecta: 1,
    explicacion: "「ぐらい」 se usa para indicar una cantidad o monto aproximado ('alrededor de 1000 yenes'). 「ごろ」 se usa únicamente para horas o puntos específicos en el tiempo."
  },
  {
    id: "n5-1-g9",
    pregunta: "A「さようなら。」\nB「さようなら。また（ ____ ）。」",
    contexto: "（ ）に 何を 入れますか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。",
    opciones: [
      "1. おととい",
      "2. 今日",
      "3. 来週",
      "4. 今月"
    ],
    respuestaCorrecta: 3,
    explicacion: "La expresión 「また来週」 (hasta la próxima semana / nos vemos la próxima semana) es la única despedida lógica hacia el futuro entre las opciones."
  },
  {
    id: "n5-1-g10",
    pregunta: "わたしの 母は 50さいです。父は 55さいです。母は 父（ ____ ）5さい わかいです。",
    contexto: "（ ）に 何を 入れますか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。",
    opciones: [
      "1. から",
      "2. まで",
      "3. より",
      "4. のほうが"
    ],
    respuestaCorrecta: 3,
    explicacion: "La partícula 「より」 marca el punto de comparación ('más... que'). 「母は 父より 5さい わかいです」 significa 'mi madre es 5 años más joven que mi padre'."
  },
  {
    id: "n5-1-g11",
    pregunta: "子ども「いただきます。」\n母「あ、食べる（ ____ ）手を あらいましょう。」",
    contexto: "（ ）に 何を 入れますか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。",
    opciones: [
      "1. まえに",
      "2. のまえに",
      "3. あとに",
      "4. のあとに"
    ],
    respuestaCorrecta: 1,
    explicacion: "Cuando se conecta directamente un verbo en forma diccionario (食べる), se usa directamente 「まえに」 ('antes de comer')."
  },
  {
    id: "n5-1-g12",
    pregunta: "A「東京でも 雪が ふりますか。」\nB「ええ、ふりますよ。でも、きょねんは あまり（ ____ ）。」",
    contexto: "（ ）に 何を 入れますか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。",
    opciones: [
      "1. ふりませんでした",
      "2. ふりません",
      "3. ふりました",
      "4. ふります"
    ],
    respuestaCorrecta: 1,
    explicacion: "El adverbio 「あまり」 requiere una forma negativa, y al referirse al año pasado (きょねん), debe ir en pasado negativo: 「ふりませんでした」."
  },{
    id: "n5-1-g13",
    pregunta: "（川で）\nA「見て ください。小さな 魚が たくさん（ ____ ）よ。」\nB「ほんとうですね。30ぴきくらい いますね。」",
    contexto: "（ ）に 何を 入れますか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。",
    opciones: [
      "1. およぎます",
      "2. およぎません",
      "3. およぎました",
      "4. およいで います"
    ],
    respuestaCorrecta: 4,
    explicacion: "Al señalar algo que está ocurriendo en ese preciso momento ('mira'), se utiliza la forma continua ~ています: およいで います (están nadando)."
  },
  {
    id: "n5-1-g14",
    pregunta: "中川「山田さんの その カメラは いいですね。どこで かいましたか。」\n山田「いえ、これは 兄に（ ____ ）。」",
    contexto: "（ ）に 何を 入れますか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。",
    opciones: [
      "1. あげました",
      "2. もらいました",
      "3. うりました",
      "4. かいました"
    ],
    respuestaCorrecta: 2,
    explicacion: "La estructura 「[persona] に もらいました」 indica recibir algo de alguien ('lo recibí de mi hermano mayor')."
  },
  {
    id: "n5-1-g15",
    pregunta: "たまごりょうりの じょうずな 作りかたを（ ____ ）読みました。",
    contexto: "（ ）に 何を 入れますか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。",
    opciones: [
      "1. 何に",
      "2. 何も",
      "3. 何かへ",
      "4. 何かで"
    ],
    respuestaCorrecta: 4,
    explicacion: "「何かで」 indica el medio o recurso no especificado mediante el cual se realizó la lectura ('lo leí en algún sitio / por algún medio')."
  },
  {
    id: "n5-1-g16",
    pregunta: "（電話で）\n本田「はい、本田です。」\n北山「あ、北山花子です。すみません、（ ____ ）。」\n本田「はい。ちょっと まって くださいね。」",
    contexto: "（ ）に 何を 入れますか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。",
    opciones: [
      "1. ひろこさんを おねがいします",
      "2. ひろこさんを ください",
      "3. ひろこさんと 話しますか",
      "4. ひろこさんと 話しませんか"
    ],
    respuestaCorrecta: 1,
    explicacion: "En una llamada telefónica, la expresión fija para pedir hablar con alguien es 「[nombre] を おねがいします」 ('¿me podría comunicar con Hiroko-san, por favor?')."
  },
  {
    id: "n5-2-g17",
    pregunta: "（店で）\n田中「すみません。くだもの ＿ ＿ ★ ＿ か。」\n店の人「こちらです。」",
    contexto: "★ に 入る ものは どれですか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。",
    imagenUrl: "image/JLPT/N5/EjemploN5GM2.png",
    opciones: [
      "1. どこ",
      "2. あります",
      "3. は",
      "4. に"
    ],
    respuestaCorrecta: 4,
    explicacion: "El orden correcto de la oración es 「くだもの [3. は] [1. どこ] [4. に] [2. あります] か」(くだものは どこに ありますか). Por lo tanto, la opción que ocupa la posición de la estrella (★) es la 4 (に)."
  },

] },
        
  {
          nombre: "Comprensión Auditiva (聴解)",
          icono: "🎧",
          preguntas: [
            {
              id: "n5-1-c1",
              pregunta: "男の人と女の人が話しています。男の人は何時にあいますか。",
              audioUrl: "audio/n5_sample_audio.mp3",
              opciones: [
                "1. 2時半",
                "2. 3時",
                "3. 3時半",
                "4. 4時"
              ],
              respuestaCorrecta: 2,
              explicacion: "En la conversación acuerdan encontrarse a las 3:30 (3時半 - sanji han)."
            },
            {
              id: "n5-1-c2",
              instruccion: "イラストを みて 質問に こたえて ください。(Mira la imagen de apoyo y responde a la pregunta)",
              pregunta: "男の人と 女の人が えを ⾒ています。男の人が えらんだ マークは どれですか。",
              imagenUrl: "image/27-n5.jpg",
              opciones: [
                "1. Nihongo no Torii (Torii Rojo)",
                "2. Fuji-san (Monte Fuji)",
                "3. Sakura (Flor de cerezo)",
                "4. Shinkansen (Tren bala)"
              ],
              respuestaCorrecta: 0,
              explicacion: "La imagen muestra el emblema oficial del Torii tradicional de Nihongo no Torii (Opción 1)."
            }
          ]
        }
      ]
    },
    "examen-2": {
      id: "n5-examen-2",
      titulo: "JLPT N5 - Examen Oficial Muestra 2",
      tiempoMinutos: 90,
      secciones: [
        {
          nombre: "Vocabulario (文字・語彙)",
          icono: "🔤",
          preguntas: [
            {
              id: "n5-2-v1",
              pregunta: "<u>日曜日</u>に 友達と あいます。",
              contexto: "______の ことばは ひらがなで どう かきますか。",
              opciones: [
                "1. にちようび",
                "2. げつようび",
                "3. かようび",
                "4. すいようび"
              ],
              respuestaCorrecta: 0,
              explicacion: "「日曜日」 se lee にちようび (nichiyoubi - domingo)."
            }
          ]
        }
      ]
    }
  },

  // ========================================================================
  // NIVEL N4
  // ========================================================================
  "N4": {
    "examen-1": {
      id: "n4-examen-1",
      titulo: "JLPT N4 - Examen Oficial Muestra 1",
      tiempoMinutos: 115,
      secciones: [
        {
          nombre: "Vocabulario y Gramática (言語知識)",
          icono: "📝",
          preguntas: [
            {
              id: "n4-1-v1",
              pregunta: "事故で 電車が ( ____ ) しまいました。",
              opciones: [
                "1. とまって",
                "2. きえて",
                "3. おちて",
                "4. こわれて"
              ],
              respuestaCorrecta: 0,
              explicacion: "El verbo 止まる (tomaru -> とまって) se utiliza para indicar que un transporte como el tren se detuvo."
            }
          ]
        }
      ]
    },
    "examen-2": {
      id: "n4-examen-2",
      titulo: "JLPT N4 - Examen Oficial Muestra 2",
      tiempoMinutos: 115,
      secciones: [
        {
          nombre: "Vocabulario y Gramática",
          icono: "📝",
          preguntas: [
            {
              id: "n4-2-v1",
              pregunta: "部屋を ( ____ ) に しましょう。",
              opciones: [
                "1. きれい",
                "2. しずか",
                "3. にぎやか",
                "4. べんり"
              ],
              respuestaCorrecta: 0,
              explicacion: "きれい に する significa dejar limpio/ordenado el cuarto."
            }
          ]
        }
      ]
    }
  },

  // ========================================================================
  // NIVEL N3
  // ========================================================================
  "N3": {
    "examen-1": {
      id: "n3-examen-1",
      titulo: "JLPT N3 - Examen Oficial Muestra 1",
      tiempoMinutos: 140,
      secciones: [
        {
          nombre: "Gramática y Vocabulario (言語知識)",
          icono: "📚",
          preguntas: [
            {
              id: "n3-1-v1",
              pregunta: "雨が降りそうだから、傘を持って行った ( ____ ) いいよ。",
              opciones: [
                "1. ほうが",
                "2. つもりで",
                "3. ために",
                "4. ほどが"
              ],
              respuestaCorrecta: 0,
              explicacion: "La estructura V-ta + ほうがいい (hou ga ii) da una recomendación o consejo ('sería mejor que lleves sombrilla')."
            }
          ]
        }
      ]
    },
    "examen-2": {
      id: "n3-examen-2",
      titulo: "JLPT N3 - Examen Oficial Muestra 2",
      tiempoMinutos: 140,
      secciones: [
        {
          nombre: "Gramática y Lectura",
          icono: "📚",
          preguntas: [
            {
              id: "n3-2-v1",
              pregunta: "彼が来ない ( ____ )、パーティーを始めましょう。",
              opciones: [
                "1. 以上は",
                "2. と同時に",
                "3. にしたがって",
                "4. からには"
              ],
              respuestaCorrecta: 0,
              explicacion: "以上は (ijou wa) expresa 'ya que / puesto que' (puesto que no viene, empecemos)."
            }
          ]
        }
      ]
    }
  },

  // ========================================================================
  // NIVEL N2
  // ========================================================================
  "N2": {
    "examen-1": {
      id: "n2-examen-1",
      titulo: "JLPT N2 - Examen Oficial Muestra 1",
      tiempoMinutos: 155,
      secciones: [
        {
          nombre: "Lenguaje y Lectura (言語知識・読解)",
          icono: "⛩️",
          preguntas: [
            {
              id: "n2-1-v1",
              pregunta: "彼はどんなに困難な状況でも、( ____ ) 諦めない。",
              opciones: [
                "1. 決して",
                "2. 必ず",
                "3. まったく",
                "4. おそらく"
              ],
              respuestaCorrecta: 0,
              explicacion: "決して + forma negativa significa 'jamás / de ninguna manera' (jamás se rinde)."
            }
          ]
        }
      ]
    },
    "examen-2": {
      id: "n2-examen-2",
      titulo: "JLPT N2 - Examen Oficial Muestra 2",
      tiempoMinutos: 155,
      secciones: [
        {
          nombre: "Lenguaje y Lectura",
          icono: "⛩️",
          preguntas: [
            {
              id: "n2-2-v1",
              pregunta: "新商品の開発に ( ____ )、綿密な市場調査が行われた。",
              opciones: [
                "1. あたって",
                "2. ともなって",
                "3. つれて",
                "4. はして"
              ],
              respuestaCorrecta: 0,
              explicacion: "に当たって (ni atatte) expresa 'con motivo de / de cara a'."
            }
          ]
        }
      ]
    }
  },

  // ========================================================================
  // NIVEL N1
  // ========================================================================
  "N1": {
    "examen-1": {
      id: "n1-examen-1",
      titulo: "JLPT N1 - Examen Oficial Muestra 1",
      tiempoMinutos: 170,
      secciones: [
        {
          nombre: "Lenguaje Avanzado (言語知識・読解)",
          icono: "👑",
          preguntas: [
            {
              id: "n1-1-v1",
              pregunta: "長年の努力が実を結び、( ____ ) 夢が叶った。",
              opciones: [
                "1. ついに",
                "2. ようやく",
                "3. いよいよ",
                "4. まさに"
              ],
              respuestaCorrecta: 1,
              explicacion: "ようやく (youyaku) transmite el sentido de alcanzar por fin algo tras mucho esfuerzo o tiempo."
            }
          ]
        }
      ]
    },
    "examen-2": {
      id: "n1-examen-2",
      titulo: "JLPT N1 - Examen Oficial Muestra 2",
      tiempoMinutos: 170,
      secciones: [
        {
          nombre: "Lenguaje Avanzado",
          icono: "👑",
          preguntas: [
            {
              id: "n1-2-v1",
              pregunta: "彼の発言は、状況を混乱させる ( ____ ) のものであった。",
              opciones: [
                "1. 以外の何物でもない",
                "2. にすぎない",
                "3. にほかならない",
                "4. にとどまらない"
              ],
              respuestaCorrecta: 0,
              explicacion: "以外の何物でもない expresa 'nada más ni nada menos que'."
            }
          ]
        }
      ]
    }
  },
  // ========================================================================
  // NIVEL KANA (SILABARIOS)
  // ========================================================================
  "KANA": {
    "examen-1": {
      id: "kana-examen-1",
      titulo: "Examen de Silabarios KANA (Hiragana & Katakana)",
      tiempoMinutos: 30,
      secciones: [
        {
          nombre: "Hiragana - Lectura y Sonidos Impuros (ひらがな・濁音)",
          icono: "🎌",
          preguntas: [
            {
              id: "kana-1-1",
              pregunta: "¿Cómo se lee el carácter en Hiragana <b>さくら</b>?",
              opciones: ["1. sakura", "2. zakura", "3. samura", "4. takura"],
              respuestaCorrecta: 0,
              explicacion: "さ(sa) + く(ku) + ら(ra) = sakura (cerezo)."
            },
            {
              id: "kana-1-2",
              pregunta: "¿Cuál es el carácter Hiragana correcto para el sonido <b>'NE'</b> (en palabras como <i>neko</i>)?",
              opciones: ["1. ぬ", "2. ね", "3. れ", "4. わ"],
              respuestaCorrecta: 1,
              explicacion: "ね es 'ne'. ぬ es 'nu', れ es 're', わ es 'wa'."
            },
            {
              id: "kana-1-3",
              pregunta: "¿Cómo se lee la palabra con dakuon (゛) <b>がっこう</b>?",
              opciones: ["1. kakkou", "2. gakkou", "3. dankou", "4. hango"],
              respuestaCorrecta: 1,
              explicacion: "が (ga) + っ (sokuen / pausa) + こ (ko) + う (u) = gakkou (escuela)."
            },
            {
              id: "kana-1-4",
              pregunta: "¿Cuál es la lectura correcta de <b>てんき</b>?",
              opciones: ["1. denki", "2. tenki", "3. senki", "4. kenki"],
              respuestaCorrecta: 1,
              explicacion: "て(te) + ん(n) + き(ki) = tenki (tiempo/clima)."
            },
            {
              id: "kana-1-5",
              pregunta: "¿Cómo se escribe en Hiragana la palabra <b>'pan'</b> (pan) usando handakuon (゜)?",
              opciones: ["1. ばん", "2. ぱん", "3. はん", "4. まん"],
              respuestaCorrecta: 1,
              explicacion: "ぱ (pa) lleva el círculo handakuon (゜) + ん (n) = ぱん (pan)."
            }
          ]
        },
        {
          nombre: "Katakana - Lectura y Vocabulario (カタカナ・濁音)",
          icono: "🔤",
          preguntas: [
            {
              id: "kana-2-1",
              pregunta: "¿Cómo se lee en Katakana la palabra <b>カメラ</b>?",
              opciones: ["1. kamera", "2. kumera", "3. kikaia", "4. kagura"],
              respuestaCorrecta: 0,
              explicacion: "カ(ka) + メ(me) + ラ(ra) = kamera (cámara)."
            },
            {
              id: "kana-2-2",
              pregunta: "¿Cuál de los siguientes es el carácter Katakana para el sonido <b>'SO'</b>?",
              opciones: ["1. ン", "2. シ", "3. ソ", "4. ツ"],
              respuestaCorrecta: 2,
              explicacion: "ソ es 'so' (trazo de arriba hacia abajo a la derecha). シ es 'shi', ツ es 'tsu', ン es 'n'."
            },
            {
              id: "kana-2-3",
              pregunta: "¿Cómo se transcribe a Romaji la palabra <b>バス</b>?",
              opciones: ["1. hasu", "2. basu", "3. pasu", "4. dasu"],
              respuestaCorrecta: 1,
              explicacion: "バ (ba con dakuon) + ス (su) = basu (bús/autobús)."
            },
            {
              id: "kana-2-4",
              pregunta: "¿Qué significa y cómo se lee la palabra en Katakana <b>コーヒー</b>?",
              opciones: ["1. ko-hi- (Café)", "2. ko-ki- (Cereal)", "3. go-hi- (Té)", "4. ko-he- (Jugo)"],
              respuestaCorrecta: 0,
              explicacion: "コ(ko) + ー(guión largo) + ヒ(hi) + ー(guión largo) = ko-hi- (café)."
            },
            {
              id: "kana-2-5",
              pregunta: "¿Cuál es el carácter Katakana para la vocal <b>'E'</b>?",
              opciones: ["1. ア", "2. イ", "3. ウ", "4. エ"],
              respuestaCorrecta: 3,
              explicacion: "エ es 'e' en Katakana."
            }
          ]
        },
        {
          nombre: "Diptongales y Combinaciones (拗音・ようおん)",
          icono: "🧩",
          preguntas: [
            {
              id: "kana-3-1",
              pregunta: "¿Cómo se pronuncia la combinación diptongal en Hiragana <b>しゃしん</b>?",
              opciones: ["1. shashin", "2. siyasin", "3. chachin", "4. hyashin"],
              respuestaCorrecta: 0,
              explicacion: "し(shi) + や pequeñita(ya) = sha + し(shi) + ん(n) = shashin (fotografía)."
            },
            {
              id: "kana-3-2",
              pregunta: "¿Cómo se escribe en Katakana la palabra <b>'Shirt' / 'Camisa' (shirt / shatsu)</b>?",
              opciones: ["1. シヤツ", "2. シャツ", "3. チヤツ", "4. ヒヤツ"],
              respuestaCorrecta: 1,
              explicacion: "シ(shi) + ャ(ya pequeño) + ツ(tsu) = シャツ (shatsu / camisa)."
            },
            {
              id: "kana-3-3",
              pregunta: "¿Cuál es la lectura de <b>とうきょう</b>?",
              opciones: ["1. toukyou (Tokio)", "2. tokuyo", "3. touchou", "4. tokyon"],
              respuestaCorrecta: 0,
              explicacion: "と(to) + う(u) + き(ki) + ょ(yo pequeño) + う(u) = toukyou (Tokio)."
            },
            {
              id: "kana-3-4",
              pregunta: "¿Cómo se escribe <b>'JU'</b> en Hiragana usando el carácter じ (ji)?",
              opciones: ["1. じゆ", "2. じゅ", "3. じょ", "4. ぢゆ"],
              respuestaCorrecta: 1,
              explicacion: "じ (ji) + ゆ pequeño (yu) = じゅ (ju)."
            },
            {
              id: "kana-3-5",
              pregunta: "¿Cómo se lee en Katakana <b>チョコレート</b>?",
              opciones: ["1. chokore-to (Chocolate)", "2. tyokoreto", "3. shikore-to", "4. kyokore-to"],
              respuestaCorrecta: 0,
              explicacion: "チ(chi) + ョ(yo pequeño) = cho + コ(ko) + レ(re) + ー + ト(to) = chokore-to (chocolate)."
            }
          ]
        }
      ]
    }
  }
};
