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
     pregunta: "Texto de la pregunta (puedes usar HTML como <u>subrayado</u> o <b>negrilla</b>)",
     contexto: "Frase de contexto o lectura previa (opcional, borra esta línea si no se usa)",
     audioUrl: "audio/n5_listening_1.mp3", // Enlace a archivo de audio MP3 (opcional para listening)
     imagenUrl: "image/n5_diagra_1.png",   // Enlace a imagen de apoyo (opcional)
     opciones: [
       "1. Opción 1",
       "2. Opción 2",
       "3. Opción 3",
       "4. Opción 4"
     ],
     respuestaCorrecta: 1,            // Índice de la respuesta correcta (0 = Opción 1, 1 = Opción 2, 2 = Opción 3, 3 = Opción 4)
     explicacion: "Explicación detallada de por qué es la respuesta correcta."
   }

   2. ESTRUCTURA POR NIVEL Y EXAMEN:
   ---------------------------------
   Nivel (N5, N4, N3, N2, N1) 
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
      titulo: "JLPT N5 - Examen Oficial Muestra 1",
      tiempoMinutos: 90,
      secciones: [
        {
          nombre: "Vocabulario (文字・語彙)",
          icono: "🔤",
          preguntas: [
            {
              id: "n5-1-v1",
              pregunta: "<u>山</u>に のぼります。",
              contexto: "______の ことばは ひらがなで どう かきますか。",
              opciones: [
                "1. かわ",
                "2. やま",
                "3. うみ",
                "4. そら"
              ],
              respuestaCorrecta: 1,
              explicacion: "El kanji 「山」 se lee やま (yama) y significa 'montaña'."
            },
            {
              id: "n5-1-v2",
              pregunta: "きのう <u>学校</u>へ いきました。",
              contexto: "______の ことばは ひらがなで どう かきますか。",
              opciones: [
                "1. がっこう",
                "2. かっこう",
                "3. がこう",
                "4. かこう"
              ],
              respuestaCorrecta: 0,
              explicacion: "「学校」 se lee がっこう (gakkou) y significa 'escuela'."
            },
            {
              id: "n5-1-v3",
              pregunta: "わたしは 毎朝 <u>みず</u>を のみます。",
              contexto: "______の ことばは 漢字(かんじ)で どう かきますか。",
              opciones: [
                "1. 木",
                "2. 水",
                "3. 火",
                "4. 土"
              ],
              respuestaCorrecta: 1,
              explicacion: "「みず」 (mizu - agua) se escribe con el kanji 「水」."
            }
          ]
        },
        {
          nombre: "Gramática y Lectura (文法・読解)",
          icono: "📖",
          preguntas: [
            {
              id: "n5-1-g1",
              pregunta: "わたしは たなか ( ____ ) もうします。",
              opciones: [
                "1. と",
                "2. に",
                "3. を",
                "4. が"
              ],
              respuestaCorrecta: 0,
              explicacion: "La partícula と (to) se usa con el verbo 申します (moushimasu) para presentar el nombre de uno mismo."
            },
            {
              id: "n5-1-g2",
              pregunta: "明日、図書館へ 本を 返し ( ____ ) 行きます。",
              opciones: [
                "1. に",
                "2. で",
                "3. を",
                "4. へ"
              ],
              respuestaCorrecta: 0,
              explicacion: "La forma raíz verbal + に + 行きます (ni ikimasu) indica el propósito del movimiento ('voy a devolver el libro')."
            }
          ]
        },
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
