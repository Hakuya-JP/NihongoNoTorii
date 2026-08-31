// ==========================================================================
// MÓDULO KANA INTERACTIVO (PRÁCTICA, GOJŪON, GUÍA DE TRAZOS Y AUDIOS LOCALES)
// ==========================================================================

const DATASETS_KANA = {
  hiragana: [
    // VOCALES
    { char: "あ", romaji: "a", grupo: "vocales", palabras: [{ jp: "あい", romaji: "ai", es: "Amor" }, { jp: "あおい", romaji: "aoi", es: "Azul" }] },
    { char: "い", romaji: "i", grupo: "vocales", palabras: [{ jp: "いい", romaji: "ii", es: "Bueno / Bien" }, { jp: "いぬ", romaji: "inu", es: "Perro" }] },
    { char: "う", romaji: "u", grupo: "vocales", palabras: [{ jp: "うえ", romaji: "ue", es: "Arriba" }, { jp: "うみ", romaji: "umi", es: "Mar" }] },
    { char: "え", romaji: "e", grupo: "vocales", palabras: [{ jp: "えき", romaji: "eki", es: "Estación" }, { jp: "えんぴつ", romaji: "enpitsu", es: "Lápiz" }] },
    { char: "お", romaji: "o", grupo: "vocales", palabras: [{ jp: "おにいさん", romaji: "oniisan", es: "Hermano mayor" }, { jp: "お茶", romaji: "ocha", es: "Té verde" }] },

    // KA
    { char: "か", romaji: "ka", grupo: "ka", palabras: [{ jp: "かさ", romaji: "kasa", es: "Sombrilla" }, { jp: "かお", romaji: "kao", es: "Cara" }] },
    { char: "き", romaji: "ki", grupo: "ka", palabras: [{ jp: "き", romaji: "ki", es: "Árbol" }, { jp: "きく", romaji: "kiku", es: "Escuchar / Flor" }] },
    { char: "く", romaji: "ku", grupo: "ka", palabras: [{ jp: "くま", romaji: "kuma", es: "Oso" }, { jp: "くるま", romaji: "kuruma", es: "Coche" }] },
    { char: "け", romaji: "ke", grupo: "ka", palabras: [{ jp: "けいさつ", romaji: "keisatsu", es: "Policía" }, { jp: "けしごむ", romaji: "keshigomu", es: "Goma de borrar" }] },
    { char: "こ", romaji: "ko", grupo: "ka", palabras: [{ jp: "こども", romaji: "kodomo", es: "Niño" }, { jp: "こころ", romaji: "kokoro", es: "Corazón" }] },

    // SA
    { char: "さ", romaji: "sa", grupo: "sa", palabras: [{ jp: "さくら", romaji: "sakura", es: "Flor de cerezo" }, { jp: "さかな", romaji: "sakana", es: "Pescado" }] },
    { char: "し", romaji: "shi", grupo: "sa", palabras: [{ jp: "しんかんせん", romaji: "shinkansen", es: "Tren bala" }, { jp: "しろ", romaji: "shiro", es: "Blanco / Castillo" }] },
    { char: "す", romaji: "su", grupo: "sa", palabras: [{ jp: "すし", romaji: "sushi", es: "Sushi" }, { jp: "すき", romaji: "suki", es: "Gustar" }] },
    { char: "せ", romaji: "se", grupo: "sa", palabras: [{ jp: "せんせい", romaji: "sensei", es: "Profesor" }, { jp: "せかい", romaji: "sekai", es: "Mundo" }] },
    { char: "そ", romaji: "so", grupo: "sa", palabras: [{ jp: "そら", romaji: "sora", es: "Cielo" }, { jp: "そば", romaji: "soba", es: "Fideos soba" }] },

    // TA
    { char: "た", romaji: "ta", grupo: "ta", palabras: [{ jp: "たこ", romaji: "tako", es: "Pulpo" }, { jp: "たべもの", romaji: "tabemono", es: "Comida" }] },
    { char: "ち", romaji: "chi", grupo: "ta", palabras: [{ jp: "ちいさい", romaji: "chiisai", es: "Pequeño" }, { jp: "ちず", romaji: "chizu", es: "Mapa" }] },
    { char: "つ", romaji: "tsu", grupo: "ta", palabras: [{ jp: "つくえ", romaji: "tsukue", es: "Escritorio" }, { jp: "つき", romaji: "tsuki", es: "Luna" }] },
    { char: "て", romaji: "te", grupo: "ta", palabras: [{ jp: "て", romaji: "te", es: "Mano" }, { jp: "てがみ", romaji: "tegami", es: "Carta" }] },
    { char: "と", romaji: "to", grupo: "ta", palabras: [{ jp: "とり", romaji: "tori", es: "Pájaro / Ave" }, { jp: "ともだち", romaji: "tomodachi", es: "Amigo" }] },

    // NA
    { char: "な", romaji: "na", grupo: "na", palabras: [{ jp: "なつ", romaji: "natsu", es: "Verano" }, { jp: "なまえ", romaji: "namae", es: "Nombre" }] },
    { char: "に", romaji: "ni", grupo: "na", palabras: [{ jp: "ねこ", romaji: "neko", es: "Gato" }, { jp: "にほん", romaji: "nihon", es: "Japón" }] },
    { char: "ぬ", romaji: "nu", grupo: "na", palabras: [{ jp: "いぬ", romaji: "inu", es: "Perro" }, { jp: "ぬいぐるみ", romaji: "nuigurumi", es: "Peluche" }] },
    { char: "ね", romaji: "ne", grupo: "na", palabras: [{ jp: "ねこ", romaji: "neko", es: "Gato" }, { jp: "ねだん", romaji: "nedan", es: "Precio" }] },
    { char: "の", romaji: "no", grupo: "na", palabras: [{ jp: "のりもの", romaji: "norimono", es: "Vehículo" }, { jp: "のり", romaji: "nori", es: "Alga nori" }] },

    // HA
    { char: "は", romaji: "ha", grupo: "ha", palabras: [{ jp: "はな", romaji: "hana", es: "Flor / Nariz" }, { jp: "はし", romaji: "hashi", es: "Puente / Palillos" }] },
    { char: "ひ", romaji: "hi", grupo: "ha", palabras: [{ jp: "ひかり", romaji: "hikari", es: "Luz" }, { jp: "ひこうき", romaji: "hikouki", es: "Avión" }] },
    { char: "ふ", romaji: "fu", grupo: "ha", palabras: [{ jp: "ふね", romaji: "fune", es: "Barco" }, { jp: "ふゆ", romaji: "fuyu", es: "Invierno" }] },
    { char: "へ", romaji: "he", grupo: "ha", palabras: [{ jp: "へや", romaji: "heya", es: "Habitación" }, { jp: "へび", romaji: "hebi", es: "Serpiente" }] },
    { char: "ほ", romaji: "ho", grupo: "ha", palabras: [{ jp: "ほし", romaji: "hoshi", es: "Estrella" }, { jp: "ほん", romaji: "hon", es: "Libro" }] },

    // MA
    { char: "ま", romaji: "ma", grupo: "ma", palabras: [{ jp: "まつり", romaji: "matsuri", es: "Festival" }, { jp: "まど", romaji: "mado", es: "Ventana" }] },
    { char: "み", romaji: "mi", grupo: "ma", palabras: [{ jp: "みず", romaji: "mizu", es: "Agua" }, { jp: "みせ", romaji: "mise", es: "Tienda" }] },
    { char: "む", romaji: "mu", grupo: "ma", palabras: [{ jp: "むし", romaji: "mushi", es: "Insecto" }, { jp: "むら", romaji: "mura", es: "Aldea" }] },
    { char: "め", romaji: "me", grupo: "ma", palabras: [{ jp: "め", romaji: "me", es: "Ojo" }, { jp: "めがね", romaji: "megane", es: "Gafas" }] },
    { char: "も", romaji: "mo", grupo: "ma", palabras: [{ jp: "もも", romaji: "momo", es: "Melocotón / Durazno" }, { jp: "もり", romaji: "mori", es: "Bosque" }] },

    // YA
    { char: "や", romaji: "ya", grupo: "ya", palabras: [{ jp: "やま", romaji: "yama", es: "Montaña" }, { jp: "やすみ", romaji: "yasumi", es: "Descanso / Vacaciones" }] },
    { char: "ゆ", romaji: "yu", grupo: "ya", palabras: [{ jp: "ゆき", romaji: "yuki", es: "Nieve" }, { jp: "ゆめ", romaji: "yume", es: "Sueño" }] },
    { char: "よ", romaji: "yo", grupo: "ya", palabras: [{ jp: "よる", romaji: "yoru", es: "Noche" }, { jp: "よむ", romaji: "yomu", es: "Leer" }] },

    // RA
    { char: "ら", romaji: "ra", grupo: "ra", palabras: [{ jp: "らいおん", romaji: "raion", es: "León" }, { jp: "らいしゅう", romaji: "raishuu", es: "Próxima semana" }] },
    { char: "り", romaji: "ri", grupo: "ra", palabras: [{ jp: "りんご", romaji: "ringo", es: "Manzana" }, { jp: "りゅう", romaji: "ryuu", es: "Dragón" }] },
    { char: "る", romaji: "ru", grupo: "ra", palabras: [{ jp: "るす", romaji: "rusu", es: "Ausencia" }, { jp: "くるま", romaji: "kuruma", es: "Coche" }] },
    { char: "れ", romaji: "re", grupo: "ra", palabras: [{ jp: "れいぞうこ", romaji: "reizouko", es: "Refrigerador" }, { jp: "れんしゅう", romaji: "renshuu", es: "Práctica" }] },
    { char: "ろ", romaji: "ro", grupo: "ra", palabras: [{ jp: "ろぼっと", romaji: "robotto", es: "Robot" }, { jp: "ろうそく", romaji: "rousoku", es: "Vela" }] },

    // WA / N
    { char: "わ", romaji: "wa", grupo: "wa", palabras: [{ jp: "わたし", romaji: "watashi", es: "Yo" }, { jp: "わに", romaji: "wani", es: "Cocodrilo" }] },
    { char: "を", romaji: "wo", grupo: "wa", palabras: [{ jp: "本を読む", romaji: "hon o yomu", es: "Partícula objeto" }] },
    { char: "ん", romaji: "n", grupo: "wa", palabras: [{ jp: "にほん", romaji: "nihon", es: "Japón" }, { jp: "みかん", romaji: "mikan", es: "Mandarina" }] },

    // DAKUON (Sonidos Impuros)
    { char: "が", romaji: "ga", grupo: "dakuon", palabras: [{ jp: "がっこう", romaji: "gakkou", es: "Escuela" }] },
    { char: "ぎ", romaji: "gi", grupo: "dakuon", palabras: [{ jp: "ぎんこう", romaji: "ginkou", es: "Banco" }] },
    { char: "ぐ", romaji: "gu", grupo: "dakuon", palabras: [{ jp: "ぐんたい", romaji: "guntai", es: "Ejército" }] },
    { char: "げ", romaji: "ge", grupo: "dakuon", palabras: [{ jp: "げんき", romaji: "genki", es: "Energético / Sano" }] },
    { char: "ご", romaji: "go", grupo: "dakuon", palabras: [{ jp: "ごはん", romaji: "gohan", es: "Arroz / Comida" }] },
    { char: "ざ", romaji: "za", grupo: "dakuon", palabras: [{ jp: "ざっし", romaji: "zasshi", es: "Revista" }] },
    { char: "じ", romaji: "ji", grupo: "dakuon", palabras: [{ jp: "じかん", romaji: "jikan", es: "Tiempo / Hora" }] },
    { char: "ず", romaji: "zu", grupo: "dakuon", palabras: [{ jp: "みず", romaji: "mizu", es: "Agua" }] },
    { char: "ぜ", romaji: "ze", grupo: "dakuon", palabras: [{ jp: "ぜんぶ", romaji: "zenbu", es: "Todo" }] },
    { char: "ぞ", romaji: "zo", grupo: "dakuon", palabras: [{ jp: "ぞう", romaji: "zou", es: "Elefante" }] },
    { char: "だ", romaji: "da", grupo: "dakuon", palabras: [{ jp: "だいがく", romaji: "daigaku", es: "Universidad" }] },
    { char: "ぢ", romaji: "ji (dji)", grupo: "dakuon", palabras: [{ jp: "はなぢ", romaji: "hanaji", es: "Hemorragia nasal" }] },
    { char: "づ", romaji: "zu (dzu)", grupo: "dakuon", palabras: [{ jp: "つづく", romaji: "tsuzuku", es: "Continuar" }] },
    { char: "で", romaji: "de", grupo: "dakuon", palabras: [{ jp: "でんわ", romaji: "denwa", es: "Teléfono" }] },
    { char: "ど", romaji: "do", grupo: "dakuon", palabras: [{ jp: "ドア", romaji: "doa", es: "Puerta" }] },
    { char: "ば", romaji: "ba", grupo: "dakuon", palabras: [{ jp: "ばら", romaji: "bara", es: "Rosa" }] },
    { char: "び", romaji: "bi", grupo: "dakuon", palabras: [{ jp: "びょういん", romaji: "byouin", es: "Hospital" }] },
    { char: "ぶ", romaji: "bu", grupo: "dakuon", palabras: [{ jp: "ぶた", romaji: "buta", es: "Cerdo" }] },
    { char: "べ", romaji: "be", grupo: "dakuon", palabras: [{ jp: "べんきょう", romaji: "benkyou", es: "Estudio" }] },
    { char: "ぼ", romaji: "bo", grupo: "dakuon", palabras: [{ jp: "ぼうし", romaji: "boushi", es: "Sombrero" }] },
    { char: "ぱ", romaji: "pa", grupo: "dakuon", palabras: [{ jp: "パン", romaji: "pan", es: "Pan" }] },
    { char: "ぴ", romaji: "pi", grupo: "dakuon", palabras: [{ jp: "ピアノ", romaji: "piano", es: "Piano" }] },
    { char: "ぷ", romaji: "pu", grupo: "dakuon", palabras: [{ jp: "プール", romaji: "puuru", es: "Piscina" }] },
    { char: "ぺ", romaji: "pe", grupo: "dakuon", palabras: [{ jp: "ペン", romaji: "pen", es: "Bolígrafo" }] },
    { char: "ぽ", romaji: "po", grupo: "dakuon", palabras: [{ jp: "ポケット", romaji: "poketto", es: "Bolsillo" }] },

    // YOON (Diptongos)
    { char: "きゃ", romaji: "kya", grupo: "yoon", palabras: [{ jp: "きゃく", romaji: "kyaku", es: "Cliente / Invitado" }] },
    { char: "きゅ", romaji: "kyu", grupo: "yoon", palabras: [{ jp: "きゅうり", romaji: "kyuuri", es: "Pepino" }] },
    { char: "きょ", romaji: "kyo", grupo: "yoon", palabras: [{ jp: "きょう", romaji: "kyou", es: "Hoy" }] },
    { char: "しゃ", romaji: "sha", grupo: "yoon", palabras: [{ jp: "しゃしん", romaji: "shashin", es: "Foto" }] },
    { char: "しゅ", romaji: "shu", grupo: "yoon", palabras: [{ jp: "しゅくだい", romaji: "shukudai", es: "Tarea" }] },
    { char: "しょ", romaji: "sho", grupo: "yoon", palabras: [{ jp: "しょくどう", romaji: "shokudou", es: "Comedor" }] },
    { char: "ちゃ", romaji: "cha", grupo: "yoon", palabras: [{ jp: "おちゃ", romaji: "ocha", es: "Té verde" }] },
    { char: "ちゅ", romaji: "chu", grupo: "yoon", palabras: [{ jp: "ちゅうしゃじょう", romaji: "chuushajou", es: "Estacionamiento" }] },
    { char: "ちょ", romaji: "cho", grupo: "yoon", palabras: [{ jp: "ちょっかい", romaji: "chokkai", es: "Interferencia" }] },
    { char: "にゃ", romaji: "nya", grupo: "yoon", palabras: [{ jp: "にゃんこ", romaji: "nyanko", es: "Gatito" }] },
    { char: "にゅ", romaji: "nyu", grupo: "yoon", palabras: [{ jp: "にゅうがく", romaji: "nyuugaku", es: "Ingreso escolar" }] },
    { char: "にょ", romaji: "nyo", grupo: "yoon", palabras: [{ jp: "にょうぼう", romaji: "nyoubou", es: "Esposa" }] }
  ],

  katakana: [
    // VOCALES KATAKANA
    { char: "ア", romaji: "a", grupo: "vocales", palabras: [{ jp: "アイス", romaji: "aisu", es: "Helado" }, { jp: "アメリカ", romaji: "amerika", es: "Estados Unidos" }] },
    { char: "イ", romaji: "i", grupo: "vocales", palabras: [{ jp: "インク", romaji: "inku", es: "Tinta" }, { jp: "イギリス", romaji: "igirisu", es: "Reino Unido" }] },
    { char: "ウ", romaji: "u", grupo: "vocales", palabras: [{ jp: "ウェブ", romaji: "webu", es: "Web" }, { jp: "ウクレレ", romaji: "ukulele", es: "Ukelele" }] },
    { char: "エ", romaji: "e", grupo: "vocales", palabras: [{ jp: "エアコン", romaji: "eakon", es: "Aire acondicionado" }, { jp: "エレベーター", romaji: "erebeetaa", es: "Ascensor" }] },
    { char: "オ", romaji: "o", grupo: "vocales", palabras: [{ jp: "オレンジ", romaji: "orenji", es: "Naranja" }, { jp: "オーストラリア", romaji: "oosutoraria", es: "Australia" }] },

    // KA
    { char: "カ", romaji: "ka", grupo: "ka", palabras: [{ jp: "カメラ", romaji: "kamera", es: "Cámara" }, { jp: "カフェ", romaji: "kafe", es: "Café" }] },
    { char: "キ", romaji: "ki", grupo: "ka", palabras: [{ jp: "キャンプ", romaji: "kyanpu", es: "Campamento" }, { jp: "ギター", romaji: "gitaa", es: "Guitarra" }] },
    { char: "ク", romaji: "ku", grupo: "ka", palabras: [{ jp: "クラス", romaji: "kurasu", es: "Clase" }, { jp: "クッキー", romaji: "kukkii", es: "Galleta" }] },
    { char: "ケ", romaji: "ke", grupo: "ka", palabras: [{ jp: "ケーキ", romaji: "keeki", es: "Pastel / Tarta" }, { jp: "ケース", romaji: "keesu", es: "Estuche" }] },
    { char: "コ", romaji: "ko", grupo: "ka", palabras: [{ jp: "コーヒー", romaji: "koohii", es: "Café bebida" }, { jp: "コイン", romaji: "koin", es: "Moneda" }] },

    // SA
    { char: "サ", romaji: "sa", grupo: "sa", palabras: [{ jp: "サッカー", romaji: "sakkaa", es: "Fútbol" }, { jp: "サラダ", romaji: "sarada", es: "Ensalada" }] },
    { char: "シ", romaji: "shi", grupo: "sa", palabras: [{ jp: "シャツ", romaji: "shatsu", es: "Camisa" }, { jp: "システム", romaji: "shisutemu", es: "Sistema" }] },
    { char: "ス", romaji: "su", grupo: "sa", palabras: [{ jp: "スポーツ", romaji: "supootsu", es: "Deportes" }, { jp: "スーパー", romaji: "suupaa", es: "Supermercado" }] },
    { char: "セ", romaji: "se", grupo: "sa", palabras: [{ jp: "セーター", romaji: "seetaa", es: "Suéter / Jersey" }, { jp: "セット", romaji: "setto", es: "Set / Conjunto" }] },
    { char: "ソ", romaji: "so", grupo: "sa", palabras: [{ jp: "ソファ", romaji: "sofa", es: "Sofá" }, { jp: "ソフト", romaji: "sofuto", es: "Software" }] },

    // TA
    { char: "タ", romaji: "ta", grupo: "ta", palabras: [{ jp: "タクシー", romaji: "takushii", es: "Taxi" }, { jp: "タオル", romaji: "taoru", es: "Toalla" }] },
    { char: "チ", romaji: "chi", grupo: "ta", palabras: [{ jp: "チーズ", romaji: "chiizu", es: "Queso" }, { jp: "チーム", romaji: "chiimu", es: "Equipo" }] },
    { char: "ツ", romaji: "tsu", grupo: "ta", palabras: [{ jp: "ツアー", romaji: "tsuaa", es: "Tour / Excursión" }, { jp: "ツナ", romaji: "tsuna", es: "Atún" }] },
    { char: "テ", romaji: "te", grupo: "ta", palabras: [{ jp: "テスト", romaji: "tesuto", es: "Examen / Test" }, { jp: "テレビ", romaji: "terebi", es: "Televisión" }] },
    { char: "ト", romaji: "to", grupo: "ta", palabras: [{ jp: "トマト", romaji: "tomato", es: "Tomate" }, { jp: "トイレ", romaji: "toire", es: "Baño / Toilet" }] },

    // NA
    { char: "ナ", romaji: "na", grupo: "na", palabras: [{ jp: "ナイフ", romaji: "naifu", es: "Cuchillo" }, { jp: "ナイト", romaji: "naito", es: "Noche" }] },
    { char: "ニ", romaji: "ni", grupo: "na", palabras: [{ jp: "ニュース", romaji: "nyuusu", es: "Noticias" }] },
    { char: "ヌ", romaji: "nu", grupo: "na", palabras: [{ jp: "ヌードル", romaji: "nuudoru", es: "Fideos / Noodle" }] },
    { char: "ネ", romaji: "ne", grupo: "na", palabras: [{ jp: "ネクタイ", romaji: "nekutai", es: "Corbata" }, { jp: "ネット", romaji: "netto", es: "Internet" }] },
    { char: "ノ", romaji: "no", grupo: "na", palabras: [{ jp: "ノート", romaji: "nooto", es: "Cuaderno" }] },

    // HA
    { char: "ハ", romaji: "ha", grupo: "ha", palabras: [{ jp: "ハンバーガー", romaji: "hanbaagaa", es: "Hamburguesa" }, { jp: "ハワイ", romaji: "hawai", es: "Hawái" }] },
    { char: "ヒ", romaji: "hi", grupo: "ha", palabras: [{ jp: "ヒーロー", romaji: "hiiroo", es: "Héroe" }, { jp: "ヒーター", romaji: "hiitaa", es: "Calefactor" }] },
    { char: "フ", romaji: "fu", grupo: "ha", palabras: [{ jp: "フォーク", romaji: "fooku", es: "Tenedor" }, { jp: "フルーツ", romaji: "furuutsu", es: "Frutas" }] },
    { char: "ヘ", romaji: "he", grupo: "ha", palabras: [{ jp: "ヘリコプター", romaji: "herikoputaa", es: "Helicóptero" }] },
    { char: "ホ", romaji: "ho", grupo: "ha", palabras: [{ jp: "ホテル", romaji: "hoteru", es: "Hotel" }, { jp: "ホーム", romaji: "hoomu", es: "Andén / Inicio" }] },

    // MA
    { char: "マ", romaji: "ma", grupo: "ma", palabras: [{ jp: "マンゴー", romaji: "mangoo", es: "Mango" }, { jp: "マイク", romaji: "maiku", es: "Micrófono" }] },
    { char: "ミ", romaji: "mi", grupo: "ma", palabras: [{ jp: "ミルク", romaji: "miruku", es: "Leche" }, { jp: "ミュージアム", romaji: "myuujiamu", es: "Museo" }] },
    { char: "ム", romaji: "mu", grupo: "ma", palabras: [{ jp: "ムービー", romaji: "muubii", es: "Película" }] },
    { char: "メ", romaji: "me", grupo: "ma", palabras: [{ jp: "メニュー", romaji: "menyuu", es: "Menú" }, { jp: "メール", romaji: "meeru", es: "Correo electrónico" }] },
    { char: "モ", romaji: "mo", grupo: "ma", palabras: [{ jp: "モデル", romaji: "moderu", es: "Modelo" }, { jp: "モニター", romaji: "monitaa", es: "Monitor" }] },

    // YA
    { char: "ヤ", romaji: "ya", grupo: "ya", palabras: [{ jp: "ヤング", romaji: "yangu", es: "Joven" }] },
    { char: "ユ", romaji: "yu", grupo: "ya", palabras: [{ jp: "ユニフォーム", romaji: "yunifoomu", es: "Uniforme" }] },
    { char: "ヨ", romaji: "yo", grupo: "ya", palabras: [{ jp: "ヨーグルト", romaji: "yooguruto", es: "Yogurt" }] },

    // RA
    { char: "ラ", romaji: "ra", grupo: "ra", palabras: [{ jp: "ラジオ", romaji: "rajio", es: "Radio" }, { jp: "ラーメン", romaji: "raamen", es: "Ramen" }] },
    { char: "リ", romaji: "ri", grupo: "ra", palabras: [{ jp: "リンゴ", romaji: "ringo", es: "Manzana" }, { jp: "リボン", romaji: "ribon", es: "Lazo / Cinta" }] },
    { char: "ル", romaji: "ru", grupo: "ra", palabras: [{ jp: "ルール", romaji: "ruuru", es: "Regla" }, { jp: "ルビー", romaji: "rubii", es: "Rubí" }] },
    { char: "レ", romaji: "re", grupo: "ra", palabras: [{ jp: "レストラン", romaji: "resutoran", es: "Restaurante" }, { jp: "レモン", romaji: "remon", es: "Limón" }] },
    { char: "ロ", romaji: "ro", grupo: "ra", palabras: [{ jp: "ロボット", romaji: "robotto", es: "Robot" }, { jp: "ロケット", romaji: "roketto", es: "Cohete" }] },

    // WA / N
    { char: "ワ", romaji: "wa", grupo: "wa", palabras: [{ jp: "ワイン", romaji: "wain", es: "Vino" }, { jp: "ワニ", romaji: "wani", es: "Cocodrilo" }] },
    { char: "ヲ", romaji: "wo", grupo: "wa", palabras: [{ jp: "ヲ", romaji: "wo", es: "Partícula objeto (raro en katakana)" }] },
    { char: "ン", romaji: "n", grupo: "wa", palabras: [{ jp: "コイン", romaji: "koin", es: "Moneda" }, { jp: "サイン", romaji: "sain", es: "Firma / Autógrafo" }] },

    // DAKUON
    { char: "ガ", romaji: "ga", grupo: "dakuon", palabras: [{ jp: "ガラス", romaji: "garasu", es: "Vidrio" }] },
    { char: "ギ", romaji: "gi", grupo: "dakuon", palabras: [{ jp: "ギフト", romaji: "gifuto", es: "Regalo / Gift" }] },
    { char: "グ", romaji: "gu", grupo: "dakuon", palabras: [{ jp: "グループ", romaji: "guruupu", es: "Grupo" }] },
    { char: "ゲ", romaji: "ge", grupo: "dakuon", palabras: [{ jp: "ゲーム", romaji: "geemu", es: "Videojuego" }] },
    { char: "ゴ", romaji: "go", grupo: "dakuon", palabras: [{ jp: "ゴルフ", romaji: "gorufu", es: "Golf" }] },
    { char: "ザ", romaji: "za", grupo: "dakuon", palabras: [{ jp: "サイズ", romaji: "saizu", es: "Talla / Tamaños" }] },
    { char: "ジ", romaji: "ji", grupo: "dakuon", palabras: [{ jp: "ジュース", romaji: "juusu", es: "Jugo / Zumo" }] },
    { char: "ズ", romaji: "zu", grupo: "dakuon", palabras: [{ jp: "ズボン", romaji: "zubon", es: "Pantalones" }] },
    { char: "ゼ", romaji: "ze", grupo: "dakuon", palabras: [{ jp: "ゼロ", romaji: "zero", es: "Cero" }] },
    { char: "ゾ", romaji: "zo", grupo: "dakuon", palabras: [{ jp: "ゾンビ", romaji: "zonbi", es: "Zombi" }] },
    { char: "ダ", romaji: "da", grupo: "dakuon", palabras: [{ jp: "ダンス", romaji: "dansu", es: "Baile" }] },
    { char: "ヂ", romaji: "ji (dji)", grupo: "dakuon", palabras: [{ jp: "ヂ", romaji: "ji", es: "Sonido dji" }] },
    { char: "ヅ", romaji: "zu (dzu)", grupo: "dakuon", palabras: [{ jp: "ヅ", romaji: "zu", es: "Sonido dzu" }] },
    { char: "デ", romaji: "de", grupo: "dakuon", palabras: [{ jp: "デパート", romaji: "depaato", es: "Gran almacén" }] },
    { char: "ド", romaji: "do", grupo: "dakuon", palabras: [{ jp: "ドア", romaji: "doa", es: "Puerta" }] },
    { char: "バ", romaji: "ba", grupo: "dakuon", palabras: [{ jp: "バス", romaji: "basu", es: "Autobús" }] },
    { char: "ビ", romaji: "bi", grupo: "dakuon", palabras: [{ jp: "ビル", romaji: "biru", es: "Edificio" }] },
    { char: "ブ", romaji: "bu", grupo: "dakuon", palabras: [{ jp: "ブログ", romaji: "burogu", es: "Blog" }] },
    { char: "べ", romaji: "be", grupo: "dakuon", palabras: [{ jp: "ベッド", romaji: "beddo", es: "Cama" }] },
    { char: "ボ", romaji: "bo", grupo: "dakuon", palabras: [{ jp: "ボタン", romaji: "botan", es: "Botón" }] },
    { char: "パ", romaji: "pa", grupo: "dakuon", palabras: [{ jp: "パーティー", romaji: "paatii", es: "Fiesta" }] },
    { char: "ピ", romaji: "pi", grupo: "dakuon", palabras: [{ jp: "ピンク", romaji: "pinku", es: "Color rosa" }] },
    { char: "プ", romaji: "pu", grupo: "dakuon", palabras: [{ jp: "プレゼント", romaji: "purezento", es: "Regalo" }] },
    { char: "ペ", romaji: "pe", grupo: "dakuon", palabras: [{ jp: "ペット", romaji: "petto", es: "Mascota" }] },
    { char: "ポ", romaji: "po", grupo: "dakuon", palabras: [{ jp: "ポスト", romaji: "posuto", es: "Buzón de correo" }] },

    // YOON (Diptongos Katakana)
    { char: "キャ", romaji: "kya", grupo: "yoon", palabras: [{ jp: "キャンプ", romaji: "kyanpu", es: "Campamento" }] },
    { char: "キュ", romaji: "kyu", grupo: "yoon", palabras: [{ jp: "キューブ", romaji: "kyuubu", es: "Cubo" }] },
    { char: "キョ", romaji: "kyo", grupo: "yoon", palabras: [{ jp: "キロ", romaji: "kiro", es: "Kilo" }] },
    { char: "シャ", romaji: "sha", grupo: "yoon", palabras: [{ jp: "シャツ", romaji: "shatsu", es: "Camisa" }] },
    { char: "シュ", romaji: "shu", grupo: "yoon", palabras: [{ jp: "シュークリーム", romaji: "shuukuriimu", es: "Profiterol / Buñuelo" }] },
    { char: "ショ", romaji: "sho", grupo: "yoon", palabras: [{ jp: "ショップ", romaji: "shoppu", es: "Tienda / Shop" }] },
    { char: "チャ", romaji: "cha", grupo: "yoon", palabras: [{ jp: "チャット", romaji: "chatto", es: "Chat" }] },
    { char: "チュ", romaji: "chu", grupo: "yoon", palabras: [{ jp: "チューリップ", romaji: "chuurippu", es: "Tulipán" }] },
    { char: "チョ", romaji: "cho", grupo: "yoon", palabras: [{ jp: "チョコレート", romaji: "chokoreeto", es: "Chocolate" }] }
  ]
};

// ==========================================================================
// 💡 BANCO DE PREGUNTAS PERSONALIZADAS Y TIPOS DIVERSOS DE QUIZ
// ==========================================================================
// AQUÍ PUEDES AGREGAR, MODIFICAR O ELIMINAR PREGUNTAS DE CUALQUIER TIPO.
// CADA PREGUNTA CONTIENE:
// - tipo: "vocabulario" | "opcion_multiple" | "gramatica"
// - pregunta: El texto principal de la pregunta
// - opciones: Un arreglo de 4 opciones de respuesta
// - correcta: El índice de la opción correcta (0 para la 1ª, 1 para la 2ª, 2 para la 3ª, 3 para la 4ª)
//
const PREGUNTAS_PERSONALIZADAS_KANA = {
  hiragana: [
    {
      tipo: "vocabulario",
      pregunta: "¿Qué significa la palabra 'ねこ (neko)'?",
      opciones: ["Gato 🐱", "Perro 🐶", "Pájaro 🐦", "Pez 🐟"],
      correcta: 0
    },
    {
      tipo: "vocabulario",
      pregunta: "¿Cómo se escribe 'Japón' en Hiragana?",
      opciones: ["にほん (Nihon)", "さくら (Sakura)", "わたし (Watashi)", "ねこ (Neko)"],
      correcta: 0
    },
    {
      tipo: "gramatica",
      pregunta: "¿Cuál de los siguientes caracteres es una vocal en Hiragana?",
      opciones: ["あ (a)", "か (ka)", "さ (sa)", "た (ta)"],
      correcta: 0
    }
  ],

  katakana: [
    {
      tipo: "vocabulario",
      pregunta: "¿Qué significa la palabra prestada 'カメラ (kamera)'?",
      opciones: ["Cámara 📷", "Café ☕", "Casa 🏠", "Coche 🚗"],
      correcta: 0
    },
    {
      tipo: "vocabulario",
      pregunta: "¿Cómo se escribe 'América' en Katakana?",
      opciones: ["アメリカ (Amerika)", "イギリス (Igirisu)", "フランス (Furansu)", "スペイン (Supein)"],
      correcta: 0
    }
  ]
};

// ==========================================================================
// DICCIONARIO DETALLADO DE TRAZOS Y PASOS DE ESCRITURA
// ==========================================================================

const GUIA_TRAZOS_KANA = {
  // HIRAGANA VOCALES
  "あ": { trazos: 3, pasos: ["① Horizontal de izquierda a derecha", "② Vertical descendente que cruza el trazo 1", "③ Bucle amplio en sentido horario"] },
  "い": { trazos: 2, pasos: ["① Curva descendente izquierda con gancho final", "② Trazo corto descendente derecho"] },
  "う": { trazos: 2, pasos: ["① Trazo corto diagonal arriba", "② Arco amplio descendente en curva"] },
  "え": { trazos: 2, pasos: ["① Trazo diagonal corto arriba", "② Zig-zag horizontal, diagonal abajo y curva fina"] },
  "お": { trazos: 3, pasos: ["① Horizontal corto", "② Vertical descendente con bucle a la izquierda y gancho arriba", "③ Punto diagonal arriba a la derecha"] },

  // HIRAGANA KA
  "か": { trazos: 3, pasos: ["① Horizontal con curva hacia abajo y gancho", "② Trazo vertical inclinado atravesando la curva", "③ Trazo corto diagonal a la derecha"] },
  "き": { trazos: 4, pasos: ["① Horizontal superior", "② Horizontal inferior paralelo", "③ Diagonal descendente atravesando", "④ Curva inferior independiente"] },
  "く": { trazos: 1, pasos: ["① Trazo en ángulo agudo continuo"] },
  "け": { trazos: 3, pasos: ["① Vertical izquierdo con gancho", "② Horizontal superior", "③ Vertical descendente atravesando"] },
  "こ": { trazos: 2, pasos: ["① Horizontal superior con gancho", "② Horizontal inferior curvado"] },

  // HIRAGANA SA
  "さ": { trazos: 3, pasos: ["① Horizontal", "② Diagonal descendente cruzando", "③ Curva inferior amplia"] },
  "し": { trazos: 1, pasos: ["① Trazo vertical descendente que curva hacia arriba a la derecha"] },
  "す": { trazos: 2, pasos: ["① Horizontal", "② Vertical atravesando con un bucle completo en el medio"] },
  "せ": { trazos: 3, pasos: ["① Horizontal", "② Vertical derecho corto con gancho", "③ Vertical izquierdo cruzando"] },
  "そ": { trazos: 1, pasos: ["① Trazo en Z continuo con curva inferior"] },

  // HIRAGANA TA
  "た": { trazos: 4, pasos: ["① Horizontal arriba", "② Inclinado hacia abajo", "③ Horizontal dentro", "④ Curva inferior estilo こ"] },
  "ち": { trazos: 2, pasos: ["① Horizontal arriba", "② Vertical cruzando que forma una gran C curvada"] },
  "つ": { trazos: 1, pasos: ["① Gran arco suave hacia la derecha"] },
  "て": { trazos: 1, pasos: ["① Horizontal y curva hacia abajo a la izquierda"] },
  "と": { trazos: 2, pasos: ["① Trazo corto inclinado", "② Curva amplia en C"] },

  // HIRAGANA NA
  "な": { trazos: 4, pasos: ["① Horizontal", "② Inclinado cruzando", "③ Punto corto diagonal", "④ Vertical con bucle final"] },
  "に": { trazos: 3, pasos: ["① Vertical izquierdo con gancho", "② Horizontal superior", "③ Horizontal inferior"] },
  "ぬ": { trazos: 2, pasos: ["① Inclinado hacia abajo a la izquierda", "② Trazo amplio envolvente con bucle final"] },
  "ね": { trazos: 2, pasos: ["① Vertical recto", "② Trazo en Z que envuelve y termina en bucle"] },
  "の": { trazos: 1, pasos: ["① Trazo en espiral fluida de arriba hacia abajo"] },

  // HIRAGANA HA
  "は": { trazos: 3, pasos: ["① Vertical izquierdo con gancho", "② Horizontal", "③ Vertical con bucle final a la derecha"] },
  "ひ": { trazos: 1, pasos: ["① Trazo continuo en forma de U amplia con aleros"] },
  "ふ": { trazos: 4, pasos: ["① Punto superior", "② Nariz curvada central", "③ Punto izquierdo", "④ Punto derecho"] },
  "へ": { trazos: 1, pasos: ["① Trazo en montaña"] },
  "ほ": { trazos: 4, pasos: ["① Vertical izquierdo", "② Horizontal superior", "③ Horizontal inferior", "④ Vertical con bucle final"] },

  // HIRAGANA MA
  "ま": { trazos: 3, pasos: ["① Horizontal superior", "② Horizontal inferior", "③ Vertical descendente con bucle"] },
  "み": { trazos: 2, pasos: ["① Trazo en bucle diagonal", "② Inclinado a la derecha"] },
  "む": { trazos: 3, pasos: ["① Horizontal", "② Vertical con bucle y curva ascendente", "③ Punto arriba a la derecha"] },
  "め": { trazos: 2, pasos: ["① Diagonal inclinada", "② Curva envolvente en arco"] },
  "も": { trazos: 3, pasos: ["① Gancho vertical en anzuelo", "② Horizontal superior", "③ Horizontal inferior"] },

  // HIRAGANA YA / RA / WA / N
  "や": { trazos: 3, pasos: ["① Curva principal con gancho", "② Punto inclinado", "③ Vertical cruzando"] },
  "ゆ": { trazos: 2, pasos: ["① Curva en bucle vertical", "② Vertical largo cruzando"] },
  "よ": { trazos: 2, pasos: ["① Horizontal corto", "② Vertical con bucle a la izquierda"] },
  "ら": { trazos: 2, pasos: ["① Trazo corto arriba", "② Arcada curvada"] },
  "り": { trazos: 2, pasos: ["① Trazo izquierdo corto con gancho", "② Trazo derecho largo curvado"] },
  "る": { trazos: 1, pasos: ["① Trazo continuo en Z que termina en bucle"] },
  "れ": { trazos: 2, pasos: ["① Vertical izquierdo", "② Z continuo que curva hacia afuera"] },
  "ろ": { trazos: 1, pasos: ["① Trazo continuo en Z similar a る sin bucle"] },
  "わ": { trazos: 2, pasos: ["① Vertical izquierdo", "② Z continuo en forma de arco amplio"] },
  "を": { trazos: 3, pasos: ["① Horizontal", "② Inclinado con curva C", "③ Arco inferior"] },
  "ん": { trazos: 1, pasos: ["① Trazo en S suave hacia arriba"] },

  // KATAKANA VOCALES
  "ア": { trazos: 2, pasos: ["① Horizontal con gancho", "② Trazo curvo descendente a la izquierda"] },
  "イ": { trazos: 2, pasos: ["① Diagonal descendente a la izquierda", "② Vertical recto a la derecha"] },
  "ウ": { trazos: 3, pasos: ["① Punto corto arriba", "② Vertical corto izquierdo", "③ Horizontal con doblez en L"] },
  "エ": { trazos: 3, pasos: ["① Horizontal superior", "② Vertical central", "③ Horizontal base largo"] },
  "オ": { trazos: 3, pasos: ["① Horizontal", "② Vertical con gancho arriba a la izquierda", "③ Diagonal descendente a la derecha"] },

  // KATAKANA KA
  "カ": { trazos: 2, pasos: ["① Horizontal con gancho", "② Diagonal a la izquierda atravesando"] },
  "キ": { trazos: 3, pasos: ["① Horizontal superior", "② Horizontal inferior", "③ Diagonal cruzando"] },
  "ク": { trazos: 2, pasos: ["① Diagonal izquierda corta", "② Horizontal con doblez en arco"] },
  "ケ": { trazos: 3, pasos: ["① Diagonal corta", "② Horizontal con doblez", "③ Diagonal suelta"] },
  "コ": { trazos: 2, pasos: ["① Horizontal con doblez en ángulo recto", "② Horizontal base"] },

  // KATAKANA SA / TA / NA / HA / MA / YA / RA / WA / N
  "サ": { trazos: 3, pasos: ["① Horizontal", "② Vertical corto izquierdo", "③ Vertical derecho en curva"] },
  "シ": { trazos: 3, pasos: ["① Punto superior", "② Punto inferior", "③ Trazo barrido de abajo hacia arriba"] },
  "ス": { trazos: 2, pasos: ["① Horizontal con esquina y diagonal", "② Trazo diagonal libre"] },
  "セ": { trazos: 2, pasos: ["① Horizontal con esquina", "② Trazo vertical en L"] },
  "ソ": { trazos: 2, pasos: ["① Punto izquierdo", "② Trazo diagonal de arriba a abajo"] },
  "タ": { trazos: 3, pasos: ["① Diagonal corta", "② Horizontal con doblez", "③ Trazo diagonal interno"] },
  "チ": { trazos: 3, pasos: ["① Diagonal superior", "② Horizontal", "③ Curva descendente"] },
  "ツ": { trazos: 3, pasos: ["① Punto izquierdo", "② Punto central", "③ Trazo barrido de arriba hacia abajo"] },
  "テ": { trazos: 3, pasos: ["① Horizontal superior", "② Horizontal inferior largo", "③ Curva descendente a la izquierda"] },
  "ト": { trazos: 2, pasos: ["① Vertical", "② Diagonal corta a la derecha"] },
  "ナ": { trazos: 2, pasos: ["① Horizontal", "② Trazo suave diagonal cruzando"] },
  "ニ": { trazos: 2, pasos: ["① Horizontal superior corto", "② Horizontal base largo"] },
  "ヌ": { trazos: 2, pasos: ["① Horizontal con esquina", "② Trazo en gota diagonal"] },
  "ネ": { trazos: 4, pasos: ["① Punto arriba", "② Vertical en L", "③ Vertical largo", "④ Diagonal corta"] },
  "ノ": { trazos: 1, pasos: ["① Trazo diagonal suave de arriba a la izquierda"] },
  "ハ": { trazos: 2, pasos: ["① Diagonal descendente izquierda", "② Diagonal descendente derecha"] },
  "ヒ": { trazos: 2, pasos: ["① Horizontal con esquina vertical", "② Horizontal largo que cruza"] },
  "フ": { trazos: 1, pasos: ["① Horizontal con esquina curva"] },
  "ヘ": { trazos: 1, pasos: ["① Trazo en pico de montaña"] },
  "ホ": { trazos: 4, pasos: ["① Horizontal", "② Vertical en cruz", "③ Diagonal izquierda", "④ Diagonal derecha"] },
  "マ": { trazos: 2, pasos: ["① Horizontal con esquina", "② Horizontal corto en cruz"] },
  "ミ": { trazos: 3, pasos: ["① Trazo diagonal 1", "② Trazo diagonal 2", "③ Trazo diagonal 3"] },
  "ム": { trazos: 2, pasos: ["① Trazo en triangulo", "② Trazo en gota a la derecha"] },
  "メ": { trazos: 2, pasos: ["① Diagonal suave", "② Diagonal cruzando en X"] },
  "モ": { trazos: 3, pasos: ["① Horizontal superior", "② Horizontal inferior", "③ Vertical en L"] },
  "ヤ": { trazos: 2, pasos: ["① Horizontal con esquina", "② Vertical largo"] },
  "ユ": { trazos: 2, pasos: ["① Horizontal con esquina", "② Horizontal base que sobresale"] },
  "ヨ": { trazos: 3, pasos: ["① Trazo en E invertida superior", "② Horizontal medio", "③ Horizontal base"] },
  "ラ": { trazos: 2, pasos: ["① Horizontal corto", "② Trazo en L curvada"] },
  "リ": { trazos: 2, pasos: ["① Vertical corto", "② Vertical largo"] },
  "ル": { trazos: 2, pasos: ["① Vertical curvo izquierdo", "② Trazo en L con gancho hacia arriba"] },
  "レ": { trazos: 1, pasos: ["① Trazo vertical que dobla a la derecha en L"] },
  "ロ": { trazos: 3, pasos: ["① Vertical izquierdo", "② Horizontal con esquina", "③ Horizontal base para cerrar"] },
  "ワ": { trazos: 2, pasos: ["① Vertical corto", "② Horizontal con esquinado hacia abajo"] },
  "ヲ": { trazos: 3, pasos: ["① Horizontal", "② Horizontal inferior", "③ Diagonal descendente"] },
  "ン": { trazos: 2, pasos: ["① Punto superior", "② Barrido diagonal de abajo hacia arriba"] }
};

// ==========================================================================
// REPRODUCTOR MULTI-RUTA DE ARCHIVOS DE AUDIO LOCALES (.M4A / .MP3)
// ==========================================================================

function reproducirPronunciacionKana(textoJapones, romajiHint) {
  if (!textoJapones) return;

  let key = romajiHint;
  if (!key) {
    const dataset = DATASETS_KANA[quizState.activeDatasetKey] || DATASETS_KANA.hiragana;
    const found = dataset.find(item => item.char === textoJapones);
    if (found) key = found.romaji;
    else key = textoJapones;
  }

  const cleanKey = String(key).toLowerCase().trim().replace(/[^a-z0-9]/g, "");

  // Buscar en carpetas 'KANA/' y 'audio/kana/', probando con símbolo japonés y romaji en formatos .m4a y .mp3
  const candidatePaths = [
    `KANA/${textoJapones}.m4a`,
    `KANA/${textoJapones}.mp3`,
    `KANA/${cleanKey}.m4a`,
    `KANA/${cleanKey}.mp3`,
    `audio/kana/${cleanKey}.m4a`,
    `audio/kana/${cleanKey}.mp3`,
    `audio/kana/${textoJapones}.m4a`,
    `audio/kana/${textoJapones}.mp3`
  ];

  function intentarSiguiente(index) {
    if (index >= candidatePaths.length) {
      console.log(`💡 Para reproducir el sonido de "${textoJapones}", coloca su archivo en KANA/${textoJapones}.m4a o audio/kana/${cleanKey}.m4a`);
      return;
    }

    const path = candidatePaths[index];
    const audio = new Audio(path);

    audio.play().catch(() => {
      intentarSiguiente(index + 1);
    });
  }

  intentarSiguiente(0);
}

// ==========================================================================
// CARGA Y ANIMACIÓN DE TRAZOS KANA SVG (PINCEL JAPONÉS CON SECUENCIA DE ESCRITURA)
// ==========================================================================

async function cargarYAnimarKanaSVG(char, container) {
  if (!char || !container) return;

  const code = char.charCodeAt(0).toString(16).padStart(5, '0');
  const svgUrl = `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg/kanji/${code}.svg`;

  container.innerHTML = `
    <div style="font-size: 0.85rem; opacity: 0.7; padding: 20px 0;">
      <span>🖌️ Cargando trazo de pincel...</span>
    </div>
  `;

  try {
    const res = await fetch(svgUrl);
    if (!res.ok) throw new Error("SVG no disponible");
    let svgText = await res.text();

    // Extraer únicamente el elemento <svg ...>...</svg> eliminando cabeceras, DOCTYPE multilínea y comentarios
    const svgMatch = svgText.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      svgText = svgMatch[0];
    } else {
      svgText = svgText
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<\?xml[\s\S]*?\?>/gi, "")
        .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
        .trim();
    }

    container.innerHTML = svgText;
    const svgEl = container.querySelector("svg");
    if (!svgEl) return;

    svgEl.classList.add("kana-brush-svg");
    svgEl.removeAttribute("width");
    svgEl.removeAttribute("height");

    // Botón de Repetir Animación de Trazo
    const btnReplay = document.createElement("button");
    btnReplay.className = "btn-replay-stroke";
    btnReplay.innerHTML = "<span>🔄 Repetir Trazo</span>";
    btnReplay.onclick = (e) => {
      e.stopPropagation();
      animarTrazosSVG(svgEl);
    };

    container.appendChild(btnReplay);

    animarTrazosSVG(svgEl);
  } catch (err) {
    console.warn("No se pudo cargar la animación SVG:", err);
    container.innerHTML = `<div class="kana-detail-big-char" style="font-size: 4rem;">${char}</div>`;
  }
}

function animarTrazosSVG(svgEl) {
  if (!svgEl) return;

  const paths = svgEl.querySelectorAll("path");
  const numberTexts = svgEl.querySelectorAll("text");

  // Estilizar o atenuar suavemente los números de trazo
  numberTexts.forEach(txt => {
    txt.style.fill = "var(--naranja, #ff9447)";
    txt.style.fontWeight = "bold";
    txt.style.opacity = "0.75";
  });

  let cumulativeDelay = 0.05;

  paths.forEach((path) => {
    const length = path.getTotalLength ? path.getTotalLength() : 200;

    path.style.fill = "none";
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    path.style.transition = "none";

    // Forzar reflow para reiniciar la animación correctamente
    path.getBoundingClientRect();

    const strokeDuration = Math.max(0.35, Math.min(0.85, length / 140));

    setTimeout(() => {
      path.style.transition = `stroke-dashoffset ${strokeDuration}s cubic-bezier(0.4, 0, 0.2, 1)`;
      path.style.strokeDashoffset = "0";
    }, cumulativeDelay * 1000);

    cumulativeDelay += strokeDuration + 0.15;
  });
}

// ESTADO GLOBAL DEL MOTOR DE PRÁCTICA DE TORII KANA
let quizState = {
  activeDatasetKey: "hiragana", // 'hiragana' o 'katakana'
  mode: "quiz", // 'quiz' (opción múltiple), 'matching' (emparejamiento), 'listening' (audio)
  currentQuestionIndex: 0,
  totalQuestions: 10,
  score: 0,
  hearts: 3,
  combo: 0,
  questionsList: [],
  selectedMatchingTile: null
};

function activarPestanaKana(targetId) {
  if (!targetId) return;

  const heroBanner = document.querySelector(".kana-hero-banner");
  if (heroBanner) heroBanner.style.display = "block";

  const quizContainer = document.querySelector(".interactive-quiz-container");
  if (quizContainer) quizContainer.classList.remove("quiz-focus-mode");

  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(b => {
    if (b.getAttribute("data-tab") === targetId) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });

  const blocks = document.querySelectorAll(".kana-section-block");
  blocks.forEach(b => {
    if (b.id === targetId) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });

  if (targetId === "tab-practica") {
    salirPracticaKana();
  }
}

// 1. GESTIÓN DE PESTAÑAS Y NAVEGACIÓN DENTRO DE LA PÁGINA
function initKanaPageModule(datasetKey = "hiragana") {
  quizState.activeDatasetKey = datasetKey;

  // Manejador de Tabs
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      activarPestanaKana(targetId);
    });
  });

  // Renderizar Tabla de Caracteres en el Formato Gojūon
  renderKanaInteractiveGrid("todos");

  // Manejador de Chips de Filtro de Familias
  const chipBtns = document.querySelectorAll(".family-chip-btn");
  chipBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      chipBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const grupo = btn.getAttribute("data-family");
      renderKanaInteractiveGrid(grupo);
    });
  });

  // Modal de Detalle
  const modalClose = document.getElementById("kana-detail-modal-close");
  if (modalClose) {
    modalClose.addEventListener("click", cerrarModalDetalleKana);
  }

  const modalOverlay = document.getElementById("kana-detail-modal");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) cerrarModalDetalleKana();
    });
  }

  const tablaModalOverlay = document.getElementById("modal-tabla-gojuon");
  if (tablaModalOverlay) {
    tablaModalOverlay.addEventListener("click", (e) => {
      if (e.target === tablaModalOverlay) cerrarTablaGojuonModal();
    });
  }
}

// CREACIÓN DE FICHA KANA (TILE) CON MANEJADOR DE CLIC Y AUDIO
function crearTileKanaElement(item) {
  if (!item) {
    const emptyTile = document.createElement("div");
    emptyTile.className = "kana-tile empty-tile";
    emptyTile.innerHTML = `<div class="kana-tile-char">—</div>`;
    return emptyTile;
  }

  const tile = document.createElement("div");
  tile.className = "kana-tile";
  tile.innerHTML = `
    <span class="kana-audio-icon">🔊</span>
    <div class="kana-tile-char">${item.char}</div>
    <div class="kana-tile-romaji">${item.romaji}</div>
  `;

  tile.addEventListener("click", () => {
    abrirModalDetalleKana(item);
    setTimeout(() => reproducirPronunciacionKana(item.char, item.romaji), 60);
  });

  return tile;
}

// RENDERIZADO DEL CUADRO TRADICIONAL GOJŪON (五十音 - 5 COLUMNAS HORIZONTALES)
function renderKanaInteractiveGrid(filtroGrupo = "todos") {
  const container = document.getElementById("kana-interactive-grid");
  if (!container) return;

  container.innerHTML = "";

  const dataset = DATASETS_KANA[quizState.activeDatasetKey] || DATASETS_KANA.hiragana;

  // Mapa rápido Romaji -> Objeto Kana
  const itemMap = {};
  dataset.forEach(item => {
    itemMap[item.romaji] = item;
  });

  if (filtroGrupo === "yoon") {
    // Renderizado para Diptongos Yoon (3 Columnas: YA, YU, YO)
    const yoonRows = [
      { label: "K (き/キ)", keys: ["kya", "kyu", "kyo"] },
      { label: "S (し/シ)", keys: ["sha", "shu", "sho"] },
      { label: "T (ち/チ)", keys: ["cha", "chu", "cho"] },
      { label: "N (に/ニ)", keys: ["nya", "nyu", "nyo"] },
      { label: "H (ひ/ヒ)", keys: ["hya", "hyu", "hyo"] },
      { label: "M (み/ミ)", keys: ["mya", "myu", "myo"] },
      { label: "R (り/リ)", keys: ["rya", "ryu", "ryo"] },
      { label: "G (ぎ/ギ)", keys: ["gya", "gyu", "gyo"] },
      { label: "J (じ/ジ)", keys: ["ja", "ju", "jo"] },
      { label: "B (び/ビ)", keys: ["bya", "byu", "byo"] },
      { label: "P (ぴ/ピ)", keys: ["pya", "pyu", "pyo"] }
    ];

    const wrapper = document.createElement("div");
    wrapper.className = "gojuon-matrix-wrapper";

    const header = document.createElement("div");
    header.className = "gojuon-header-row yoon-header";
    header.innerHTML = `
      <div class="gojuon-col-head">Diptongo</div>
      <div class="gojuon-col-head">YA (ゃ/ャ)</div>
      <div class="gojuon-col-head">YU (ゅ/ュ)</div>
      <div class="gojuon-col-head">YO (ょ/ョ)</div>
    `;
    wrapper.appendChild(header);

    yoonRows.forEach(r => {
      const itemsInRow = r.keys.map(k => itemMap[k]).filter(Boolean);
      if (itemsInRow.length === 0) return;

      const rowDiv = document.createElement("div");
      rowDiv.className = "gojuon-row-group yoon-row";
      rowDiv.innerHTML = `<div class="gojuon-row-label">${r.label}</div>`;

      r.keys.forEach(k => {
        const item = itemMap[k];
        rowDiv.appendChild(crearTileKanaElement(item));
      });

      wrapper.appendChild(rowDiv);
    });

    container.appendChild(wrapper);
    return;
  }

  // Filas del Cuadro Gojūon (5 Columnas: A - I - U - E - O)
  let rowDefs = [
    { grupo: "vocales", label: "Vocales", keys: ["a", "i", "u", "e", "o"] },
    { grupo: "ka", label: "Fila K (か)", keys: ["ka", "ki", "ku", "ke", "ko"] },
    { grupo: "sa", label: "Fila S (さ)", keys: ["sa", "shi", "su", "se", "so"] },
    { grupo: "ta", label: "Fila T (た)", keys: ["ta", "chi", "tsu", "te", "to"] },
    { grupo: "na", label: "Fila N (な)", keys: ["na", "ni", "nu", "ne", "no"] },
    { grupo: "ha", label: "Fila H (は)", keys: ["ha", "hi", "fu", "he", "ho"] },
    { grupo: "ma", label: "Fila M (ま)", keys: ["ma", "mi", "mu", "me", "mo"] },
    { grupo: "ya", label: "Fila Y (や)", keys: ["ya", null, "yu", null, "yo"] },
    { grupo: "ra", label: "Fila R (ら)", keys: ["ra", "ri", "ru", "re", "ro"] },
    { grupo: "wa", label: "Fila W/N (わ)", keys: ["wa", null, null, null, "wo"] },

    // DAKUON (Impuros)
    { grupo: "dakuon", label: "Fila G (が)", keys: ["ga", "gi", "gu", "ge", "go"] },
    { grupo: "dakuon", label: "Fila Z (ざ)", keys: ["za", "ji", "zu", "ze", "zo"] },
    { grupo: "dakuon", label: "Fila D (だ)", keys: ["da", "ji (dji)", "zu (dzu)", "de", "do"] },
    { grupo: "dakuon", label: "Fila B (ば)", keys: ["ba", "bi", "bu", "be", "bo"] },
    { grupo: "dakuon", label: "Fila P (ぱ)", keys: ["pa", "pi", "pu", "pe", "po"] }
  ];

  if (filtroGrupo !== "todos") {
    rowDefs = rowDefs.filter(r => r.grupo === filtroGrupo);
  }

  const wrapper = document.createElement("div");
  wrapper.className = "gojuon-matrix-wrapper";

  // Encabezado del Cuadro Gojūon (5 Vocal Columns)
  const isHiragana = (quizState.activeDatasetKey === "hiragana");
  const vA = isHiragana ? "A (あ)" : "A (ア)";
  const vI = isHiragana ? "I (い)" : "I (イ)";
  const vU = isHiragana ? "U (う)" : "U (ウ)";
  const vE = isHiragana ? "E (え)" : "E (エ)";
  const vO = isHiragana ? "O (お)" : "O (オ)";

  const header = document.createElement("div");
  header.className = "gojuon-header-row";
  header.innerHTML = `
    <div class="gojuon-col-head">Gojūon</div>
    <div class="gojuon-col-head">${vA}</div>
    <div class="gojuon-col-head">${vI}</div>
    <div class="gojuon-col-head">${vU}</div>
    <div class="gojuon-col-head">${vE}</div>
    <div class="gojuon-col-head">${vO}</div>
  `;
  wrapper.appendChild(header);

  rowDefs.forEach(r => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "gojuon-row-group";
    rowDiv.innerHTML = `<div class="gojuon-row-label">${r.label}</div>`;

    r.keys.forEach(k => {
      if (k === null) {
        rowDiv.appendChild(crearTileKanaElement(null));
      } else {
        const item = itemMap[k];
        rowDiv.appendChild(crearTileKanaElement(item));
      }
    });

    wrapper.appendChild(rowDiv);
  });

  // Si se está viendo la fila W/N o todos los caracteres básicos, incluir el carácter 'N' (ん/ン)
  if (filtroGrupo === "todos" || filtroGrupo === "wa") {
    const nItem = itemMap["n"];
    if (nItem) {
      const nRow = document.createElement("div");
      nRow.className = "gojuon-row-group";
      nRow.innerHTML = `
        <div class="gojuon-row-label">N (ん/ン)</div>
        ${crearTileKanaElement(nItem).outerHTML}
        <div class="kana-tile empty-tile"><div class="kana-tile-char">—</div></div>
        <div class="kana-tile empty-tile"><div class="kana-tile-char">—</div></div>
        <div class="kana-tile empty-tile"><div class="kana-tile-char">—</div></div>
        <div class="kana-tile empty-tile"><div class="kana-tile-char">—</div></div>
      `;

      // Volver a adjuntar evento click al elemento outerHTML re-parseado
      const tileInNRow = nRow.querySelector(".kana-tile:not(.empty-tile)");
      if (tileInNRow) {
        tileInNRow.addEventListener("click", () => {
          abrirModalDetalleKana(nItem);
          setTimeout(() => reproducirPronunciacionKana(nItem.char, nItem.romaji), 60);
        });
      }

      wrapper.appendChild(nRow);
    }
  }

  container.appendChild(wrapper);
}

// ABRIR MODAL CON ANIMACIÓN FLUIDA 60FPS Y ANIMACIÓN DE TRAZO (ESTILO PINCEL JAPONÉS)
function abrirModalDetalleKana(item) {
  const modal = document.getElementById("kana-detail-modal");
  if (!modal) return;

  const charEl = document.getElementById("kana-detail-big-char");
  const romajiEl = document.getElementById("kana-detail-romaji");
  const strokeBox = document.getElementById("kana-detail-stroke-box");
  const wordsContainer = document.getElementById("kana-detail-words-list");
  const soundBtn = document.getElementById("btn-kana-detail-sound");

  if (charEl) charEl.textContent = item.char;
  if (romajiEl) romajiEl.textContent = item.romaji;

  if (soundBtn) {
    soundBtn.onclick = () => reproducirPronunciacionKana(item.char, item.romaji);
  }

  // RENDERIZADO DE ANIMACIÓN DE ESCRITURA (ESTILO PINCEL JAPONÉS)
  if (strokeBox) {
    const infoTrazos = GUIA_TRAZOS_KANA[item.char];
    const numTrazos = infoTrazos ? infoTrazos.trazos : 1;

    strokeBox.innerHTML = `
      <div class="stroke-title">
        <span>✍️ Orden de Trazos (${numTrazos} trazo${numTrazos > 1 ? 's' : ''})</span>
        <span style="font-size: 0.8rem; opacity: 0.85; font-weight: normal;">Animación Pincel</span>
      </div>

      <div class="stroke-svg-container" id="svg-brush-anim-container">
        <!-- Renderizado dinámico del SVG animado -->
      </div>
    `;

    const svgContainer = document.getElementById("svg-brush-anim-container");
    cargarYAnimarKanaSVG(item.char, svgContainer);
  }

  // RENDERIZADO DE PALABRAS DE EJEMPLO
  if (wordsContainer) {
    wordsContainer.innerHTML = "";
    if (item.palabras && item.palabras.length > 0) {
      item.palabras.forEach(word => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "word-example-item";
        itemDiv.innerHTML = `
          <div>
            <strong style="font-size: 1.15rem; color: var(--color-h1);">${word.jp}</strong>
            <span style="font-size: 0.9rem; opacity: 0.8; margin-left: 6px;">(${word.romaji})</span>
          </div>
          <div style="font-weight: 700; color: var(--naranja, #ff9447); font-size: 0.9rem;">
            ${word.es}
          </div>
        `;
        wordsContainer.appendChild(itemDiv);
      });
    } else {
      wordsContainer.innerHTML = `<p style="font-size: 0.9rem; opacity: 0.7; margin: 0;">Carácter Kana fundamental del silabario.</p>`;
    }
  }

  // Activar modal usando requestAnimationFrame para animación ultra-fluida 60fps
  requestAnimationFrame(() => {
    modal.classList.add("active");
  });
}

function cerrarModalDetalleKana() {
  const modal = document.getElementById("kana-detail-modal");
  if (modal) modal.classList.remove("active");
}


// ==========================================================================
// 2. MOTOR DE EJERCICIOS INTERACTIVOS (TORII KANA RUNNER)
// ==========================================================================

function iniciarPracticaKana(modo = "quiz") {
  quizState.mode = modo;
  quizState.currentQuestionIndex = 0;
  quizState.score = 0;
  quizState.hearts = 3;
  quizState.combo = 0;

  // Ocultar Hero Banner para enfocar la pantalla completa (Estilo Simulador JLPT)
  const heroBanner = document.querySelector(".kana-hero-banner");
  if (heroBanner) heroBanner.style.display = "none";

  const quizContainer = document.querySelector(".interactive-quiz-container");
  if (quizContainer) quizContainer.classList.add("quiz-focus-mode");

  const dataset = DATASETS_KANA[quizState.activeDatasetKey] || DATASETS_KANA.hiragana;
  const customQuestions = PREGUNTAS_PERSONALIZADAS_KANA[quizState.activeDatasetKey] || [];

  const datasetShuffled = [...dataset].sort(() => Math.random() - 0.5);

  if (modo === "matching") {
    quizState.totalQuestions = 5;
    quizState.questionsList = datasetShuffled.slice(0, 5);
  } else if (modo === "custom") {
    quizState.questionsList = [...customQuestions].sort(() => Math.random() - 0.5);
    quizState.totalQuestions = quizState.questionsList.length || 5;
  } else {
    const baseQuestions = datasetShuffled.slice(0, 6);
    const combined = [...baseQuestions, ...customQuestions.slice(0, 2)].sort(() => Math.random() - 0.5);
    quizState.questionsList = combined;
    quizState.totalQuestions = combined.length;
  }

  const selectorView = document.getElementById("quiz-selector-view");
  const runnerView = document.getElementById("quiz-runner-view");
  const resultsView = document.getElementById("quiz-results-view");

  if (selectorView) selectorView.style.display = "none";
  if (runnerView) runnerView.style.display = "block";
  if (resultsView) resultsView.style.display = "none";

  renderizarSiguientePregunta();
}

function salirPracticaKana() {
  // Mostrar nuevamente el Hero Banner y quitar modo enfoque
  const heroBanner = document.querySelector(".kana-hero-banner");
  if (heroBanner) heroBanner.style.display = "block";

  const quizContainer = document.querySelector(".interactive-quiz-container");
  if (quizContainer) quizContainer.classList.remove("quiz-focus-mode");

  const selectorView = document.getElementById("quiz-selector-view");
  const runnerView = document.getElementById("quiz-runner-view");
  const resultsView = document.getElementById("quiz-results-view");

  if (selectorView) selectorView.style.display = "block";
  if (runnerView) runnerView.style.display = "none";
  if (resultsView) resultsView.style.display = "none";
}

function renderizarSiguientePregunta() {
  const runnerBody = document.getElementById("torii-runner-body");
  const feedbackContainer = document.getElementById("torii-feedback-container");
  const progressFill = document.getElementById("torii-progress-fill");
  const heartsDisplay = document.getElementById("torii-hearts-display");

  if (feedbackContainer) feedbackContainer.innerHTML = "";

  const pct = Math.min(100, Math.round((quizState.currentQuestionIndex / quizState.totalQuestions) * 100));
  if (progressFill) progressFill.style.width = `${pct}%`;
  if (heartsDisplay) heartsDisplay.innerHTML = `❤️ ${quizState.hearts}`;

  if (quizState.currentQuestionIndex >= quizState.totalQuestions || quizState.hearts <= 0) {
    finalizarPracticaKana();
    return;
  }

  const questionItem = quizState.questionsList[quizState.currentQuestionIndex];
  const dataset = DATASETS_KANA[quizState.activeDatasetKey];

  if (quizState.mode === "matching") {
    renderizarModoEmparejamiento(runnerBody, dataset);
  } else if (questionItem && questionItem.tipo) {
    renderizarModoPersonalizado(runnerBody, questionItem);
  } else if (quizState.mode === "listening") {
    renderizarModoAudio(runnerBody, questionItem, dataset);
  } else {
    renderizarModoQuiz(runnerBody, questionItem, dataset);
  }
}

function renderizarModoPersonalizado(container, customItem) {
  container.innerHTML = `
    <div class="torii-quiz-question-card">
      <div class="torii-quiz-prompt-title" style="font-size: 1.3rem; margin-bottom: 25px;">${customItem.pregunta}</div>

      <div class="torii-quiz-options-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
        ${customItem.opciones.map((optText, idx) => `
          <button class="torii-quiz-option-btn" style="font-size: 1.1rem; padding: 16px 20px;" onclick="verificarRespuestaQuiz(this, '${idx}', '${customItem.correcta}')">
            ${optText}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderizarModoQuiz(container, currentItem, dataset) {
  // Generar 3 distractores aleatorios
  const distractores = dataset
    .filter(item => item.char !== currentItem.char)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const opciones = [...distractores, currentItem].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="torii-quiz-question-card">
      <div class="torii-quiz-prompt-title">¿Cuál es el sonido correcto de este carácter?</div>
      <div class="torii-quiz-big-char-box" onclick="reproducirPronunciacionKana('${currentItem.char}', '${currentItem.romaji}')" style="cursor: pointer;" title="Haz clic para escuchar el audio">
        <div class="torii-quiz-char-text">${currentItem.char}</div>
        <span style="font-size: 0.85rem; color: var(--azul, #146482); font-weight: 700; display: block; margin-top: 6px;">🔊 Escuchar</span>
      </div>

      <div class="torii-quiz-options-grid">
        ${opciones.map(opt => `
          <button class="torii-quiz-option-btn" onclick="verificarRespuestaQuiz(this, '${opt.romaji}', '${currentItem.romaji}')">
            ${opt.romaji}
          </button>
        `).join("")}
      </div>
    </div>
  `;

  // Autoplay suave de pronunciación al cargar la pregunta
  setTimeout(() => reproducirPronunciacionKana(currentItem.char, currentItem.romaji), 250);
}

function renderizarModoAudio(container, currentItem, dataset) {
  const distractores = dataset
    .filter(item => item.char !== currentItem.char)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const opciones = [...distractores, currentItem].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="torii-quiz-question-card">
      <div class="torii-quiz-prompt-title">Escucha el sonido y selecciona el carácter correcto:</div>
      <div class="torii-quiz-big-char-box" onclick="reproducirPronunciacionKana('${currentItem.char}', '${currentItem.romaji}')" style="cursor: pointer; padding: 28px 40px;" title="Haz clic para volver a escuchar">
        <span style="font-size: 3.5rem;">🔊</span>
        <span style="font-size: 0.95rem; color: var(--azul, #146482); font-weight: bold; display: block; margin-top: 6px;">Toca para reproducir</span>
      </div>

      <div class="torii-quiz-options-grid">
        ${opciones.map(opt => `
          <button class="torii-quiz-option-btn" style="font-size: 2.2rem; font-family: 'Noto Sans JP', sans-serif;" onclick="verificarRespuestaQuiz(this, '${opt.char}', '${currentItem.char}')">
            ${opt.char}
          </button>
        `).join("")}
      </div>
    </div>
  `;

  setTimeout(() => reproducirPronunciacionKana(currentItem.char, currentItem.romaji), 200);
}

function verificarRespuestaQuiz(btnElement, seleccion, correcta) {
  const feedbackContainer = document.getElementById("torii-feedback-container");
  const todosBotones = document.querySelectorAll(".torii-quiz-option-btn");
  todosBotones.forEach(b => b.disabled = true);

  const esCorrecto = (seleccion === correcta);

  if (esCorrecto) {
    btnElement.classList.add("selected-correct");
    quizState.score += 10;
    quizState.combo += 1;
    if (typeof playRpgSound === "function") playRpgSound("xp");

    feedbackContainer.innerHTML = `
      <div class="torii-quiz-feedback-bar correct">
        <div class="feedback-text-title">✨ ¡Excelente! ¡Respuesta Correcta!</div>
        <button class="btn-torii-quiz-next" onclick="avanzarSiguientePregunta()">Continuar ➔</button>
      </div>
    `;
  } else {
    btnElement.classList.add("selected-wrong");
    quizState.hearts -= 1;
    quizState.combo = 0;

    // Resaltar también la respuesta correcta
    todosBotones.forEach(b => {
      if (b.innerText.trim() === correcta) b.classList.add("selected-correct");
    });

    feedbackContainer.innerHTML = `
      <div class="torii-quiz-feedback-bar wrong">
        <div>
          <div class="feedback-text-title">❌ Respuesta Incorrecta</div>
          <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 2px;">Respuesta correcta: <strong>${correcta}</strong></div>
        </div>
        <button class="btn-torii-quiz-next wrong-btn" onclick="avanzarSiguientePregunta()">Continuar ➔</button>
      </div>
    `;
  }
}

function renderizarModoEmparejamiento(container, dataset) {
  const paresSeleccionados = quizState.questionsList; // 5 caracteres

  // Crear 5 fichas Kana + 5 fichas Romaji
  const fichasKana = paresSeleccionados.map(p => ({ id: p.char, text: p.char, type: "kana", pairId: p.char, romaji: p.romaji }));
  const fichasRomaji = paresSeleccionados.map(p => ({ id: p.romaji, text: p.romaji, type: "romaji", pairId: p.char, romaji: p.romaji }));

  const todasFichas = [...fichasKana, ...fichasRomaji].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="torii-quiz-question-card" style="max-width: 650px;">
      <div class="torii-quiz-prompt-title">Empareja cada carácter con su pronunciación Romaji correspondiente:</div>
      <div class="torii-matching-grid" id="matching-grid">
        ${todasFichas.map(f => `
          <button class="matching-tile-btn" data-pair-id="${f.pairId}" data-type="${f.type}" data-text="${f.text}" data-romaji="${f.romaji}" onclick="seleccionarFichaEmparejamiento(this)">
            ${f.text}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function seleccionarFichaEmparejamiento(btnElem) {
  if (btnElem.classList.contains("matched") || btnElem.classList.contains("selected")) return;

  if (btnElem.getAttribute("data-type") === "kana") {
    reproducirPronunciacionKana(btnElem.getAttribute("data-text"), btnElem.getAttribute("data-romaji"));
  }

  if (!quizState.selectedMatchingTile) {
    quizState.selectedMatchingTile = btnElem;
    btnElem.classList.add("selected");
  } else {
    const tile1 = quizState.selectedMatchingTile;
    const tile2 = btnElem;

    const pair1 = tile1.getAttribute("data-pair-id");
    const pair2 = tile2.getAttribute("data-pair-id");

    if (pair1 === pair2 && tile1 !== tile2) {
      // Coincidencia acertada
      tile1.classList.remove("selected");
      tile1.classList.add("matched");
      tile2.classList.add("matched");
      quizState.selectedMatchingTile = null;
      quizState.score += 10;
      if (typeof playRpgSound === "function") playRpgSound("xp");

      // Comprobar si todas se emparejaron
      const restantes = document.querySelectorAll(".matching-tile-btn:not(.matched)");
      if (restantes.length === 0) {
        avanzarSiguientePregunta();
      }
    } else {
      // Error
      tile2.classList.add("selected");
      setTimeout(() => {
        tile1.classList.remove("selected");
        tile2.classList.remove("selected");
        quizState.selectedMatchingTile = null;
      }, 400);
    }
  }
}

function avanzarSiguientePregunta() {
  quizState.currentQuestionIndex += 1;
  renderizarSiguientePregunta();
}

function finalizarPracticaKana() {
  document.getElementById("quiz-runner-view").style.display = "none";
  const resultsView = document.getElementById("quiz-results-view");
  resultsView.style.display = "block";

  const totalXP = Math.max(10, quizState.score + (quizState.hearts * 5));

  const scoreEl = document.getElementById("results-score-text");
  const xpEl = document.getElementById("results-xp-granted");

  if (scoreEl) scoreEl.textContent = `Puntaje: ${quizState.score} Puntos`;
  if (xpEl) xpEl.textContent = `+${totalXP} XP Ganados ✨`;

  // Otorgar XP en el sistema RPG y actualizar misiones diarias
  if (typeof concederXP === "function") {
    concederXP(totalXP, "🎯 Práctica de Kana completada");
  }
  if (typeof actualizarProgresoMision === "function") {
    actualizarProgresoMision("practica", 1);
  }
}

function abrirTablaGojuonModal() {
  const modal = document.getElementById("modal-tabla-gojuon");
  if (!modal) return;

  renderKanaInteractiveGrid("todos");

  requestAnimationFrame(() => {
    modal.classList.add("active");
  });
}

function cerrarTablaGojuonModal() {
  const modal = document.getElementById("modal-tabla-gojuon");
  if (modal) modal.classList.remove("active");
}

function irATablaGojuon() {
  abrirTablaGojuonModal();
}

// Expuestos globalmente
window.initKanaPageModule = initKanaPageModule;
window.iniciarPracticaKana = iniciarPracticaKana;
window.salirPracticaKana = salirPracticaKana;
window.verificarRespuestaQuiz = verificarRespuestaQuiz;
window.seleccionarFichaEmparejamiento = seleccionarFichaEmparejamiento;
window.avanzarSiguientePregunta = avanzarSiguientePregunta;
window.reproducirPronunciacionKana = reproducirPronunciacionKana;
window.irATablaGojuon = irATablaGojuon;
window.abrirTablaGojuonModal = abrirTablaGojuonModal;
window.cerrarTablaGojuonModal = cerrarTablaGojuonModal;
window.activarPestanaKana = activarPestanaKana;
