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
  }
};
