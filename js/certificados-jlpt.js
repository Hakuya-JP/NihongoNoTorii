// ==========================================================================
// SECCIÓN 8: GESTIÓN DE CERTIFICADOS OFICIALES JLPT
// ==========================================================================
const PAISES_JLPT = {
  "Mexico": { jp: "メキシコ", en: "MEXICO" },
  "Spain": { jp: "スペイン", en: "SPAIN" },
  "Argentina": { jp: "アルゼンチン", en: "ARGENTINA" },
  "Colombia": { jp: "コロンビア", en: "COLOMBIA" },
  "Peru": { jp: "ペルー", en: "PERU" },
  "Chile": { jp: "チリ", en: "CHILE" },
  "Venezuela": { jp: "ベネズエラ", en: "VENEZUELA" },
  "Ecuador": { jp: "エクアドル", en: "ECUADOR" },
  "Guatemala": { jp: "グアテマラ", en: "GUATEMALA" },
  "Costa Rica": { jp: "コスタリカ", en: "COSTA RICA" },
  "Dominican Republic": { jp: "ドミニカ共和国", en: "DOMINICAN REP." },
  "Bolivia": { jp: "ボリビア", en: "BOLIVIA" },
  "Uruguay": { jp: "ウルグアイ", en: "URUGUAY" },
  "Paraguay": { jp: "パラグアイ", en: "PARAGUAY" },
  "Panama": { jp: "パナマ", en: "PANAMA" },
  "USA": { jp: "アメリカ", en: "U.S.A." },
  "UK": { jp: "イギリス", en: "U.K." },
  "Japan": { jp: "日本", en: "JAPAN" }
};

function generarYGuardarCertificadoJLPT(correctas, total, porcentaje, desgloseSecciones) {
  let certs = [];
  try {
    certs = JSON.parse(localStorage.getItem("jlpt_certificados") || "[]");
  } catch (e) {
    certs = [];
  }

  const lvlKey = (typeof estadoSimulador !== "undefined" && estadoSimulador.nivelActual) ? estadoSimulador.nivelActual : "N5";
  const hoy = new Date();
  const fechaStr = `${hoy.getFullYear()}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${String(hoy.getDate()).padStart(2, '0')}`;
  
  let nombreAlumno = "SATOU UTSUJI";
  let dobAlumno = "1993/09/26";
  let paisKey = "UK";

  try {
    const p = JSON.parse(localStorage.getItem("torii_user_profile") || localStorage.getItem("userProfile") || "{}");
    if (p.nombre && p.nombre.trim()) nombreAlumno = p.nombre.trim();
    if (p.fechaNacimiento) {
      const parts = p.fechaNacimiento.split("-");
      if (parts.length === 3) {
        dobAlumno = `${parts[0]}/${parts[1]}/${parts[2]}`;
      } else {
        dobAlumno = p.fechaNacimiento;
      }
    }
    if (p.paisExamen) paisKey = p.paisExamen;
  } catch (e) {}

  const regNoLeft = `${lvlKey}A${Math.floor(100000 + Math.random() * 900000)}A`;
  const regNoRight = `${String(hoy.getFullYear()).slice(2)}B6050101-${Math.floor(10000 + Math.random() * 90000)}`;
  const tituloExamen = (typeof estadoSimulador !== "undefined" && estadoSimulador.examenActual) ? estadoSimulador.examenActual.titulo : `JLPT ${lvlKey}`;

  const certNuevo = {
    id: "cert-" + Date.now(),
    codigoRegLeft: regNoLeft,
    codigoRegRight: regNoRight,
    nivel: lvlKey,
    nombreExamen: tituloExamen,
    estudianteNombre: nombreAlumno,
    fechaNacimiento: dobAlumno,
    paisKey: paisKey,
    fecha: fechaStr,
    fechaIso: hoy.toISOString(),
    correctas: correctas,
    total: total,
    porcentaje: porcentaje,
    desgloseSecciones: desgloseSecciones || {}
  };

  certs.unshift(certNuevo);
  localStorage.setItem("jlpt_certificados", JSON.stringify(certs));

  if (typeof renderizarGaleriaCertificadosPerfil === "function") {
    renderizarGaleriaCertificadosPerfil();
  }

  return certNuevo;
}

function abrirModalCertificadoPorId(certId) {
  let certs = [];
  try {
    certs = JSON.parse(localStorage.getItem("jlpt_certificados") || "[]");
  } catch (e) {}

  const cert = certs.find(c => c.id === certId) || certs[0];
  abrirModalCertificado(cert);
}

function abrirModalCertificado(cert) {
  const modal = document.getElementById("jlpt-certificate-modal");
  if (!modal) return;

  if (!cert) {
    let certs = [];
    try {
      certs = JSON.parse(localStorage.getItem("jlpt_certificados") || "[]");
    } catch (e) {}
    cert = certs[0] || {
      nivel: "KANA",
      estudianteNombre: "SATOU UTSUJI",
      fechaNacimiento: "1993/09/26",
      paisKey: "UK",
      fechaIso: new Date().toISOString(),
      codigoRegLeft: "KANAA210633A",
      codigoRegRight: "26B6050101-40093"
    };
  }

  const lvl = cert.nivel || "N4";
  const nombre = (cert.estudianteNombre || "SATOU UTSUJI").toUpperCase();
  const dob = cert.fechaNacimiento || "1993/09/26";
  const paisKey = cert.paisKey || "UK";
  const paisInfo = PAISES_JLPT[paisKey] || PAISES_JLPT["UK"];

  const hoy = new Date(cert.fechaIso || Date.now());
  const anio = hoy.getFullYear();
  const mesNum = hoy.getMonth() + 1;
  const mesesES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const mesesEN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const mesES = mesesES[mesNum - 1];
  const mesEN = mesesEN[mesNum - 1];
  const dia = hoy.getDate();

  // 1. Level Title
  const elLevel = document.getElementById("cert-pdf-level");
  if (elLevel) elLevel.innerText = lvl;

  // 2. Data Fields
  const elName = document.getElementById("cert-pdf-name");
  const elDob = document.getElementById("cert-pdf-dob");
  const elCountry = document.getElementById("cert-pdf-country");

  if (elName) elName.innerText = nombre;
  if (elDob) elDob.innerText = dob;
  if (elCountry) elCountry.innerHTML = `${paisInfo.jp} &nbsp;&nbsp; ${paisInfo.en}`;

  // 3. Statements
  const elJpStmt = document.getElementById("cert-pdf-jp-statement");
  const elEsStmt = document.getElementById("cert-pdf-es-statement");

  if (elJpStmt) {
    elJpStmt.innerText = `上記の方が、${anio}年${mesNum}月に実施された日本語能力試験（JLPT）の${lvl}レベルに合格したことを証明するものです。この試験は、日本語への入り口である「日本語のとりい財団」によって実施されました。`;
  }
  if (elEsStmt) {
    elEsStmt.innerText = `Por la presente se certifica que la persona arriba mencionada ha aprobado el Nivel ${lvl} del Examen de Aptitud del Idioma Japonés (JLPT) realizado en ${mesES} de ${anio}, administrado por la Fundación Nihongo No Torii, Tu portal de acceso al idioma japonés .`;
  }

  // 4. Dates
  const elJpDate = document.getElementById("cert-pdf-jp-date");
  const elEnDate = document.getElementById("cert-pdf-en-date");

  if (elJpDate) elJpDate.innerText = `${anio}年 ${mesNum}月${dia}日`;
  if (elEnDate) elEnDate.innerText = `${mesEN} ${dia}, ${anio}`;

  // 5. Codes
  const elCodeLeft = document.getElementById("cert-pdf-code-left");
  const elCodeRight = document.getElementById("cert-pdf-code-right");

  if (elCodeLeft) elCodeLeft.innerText = cert.codigoRegLeft || `${lvl}A210633A`;
  if (elCodeRight) elCodeRight.innerText = cert.codigoRegRight || `19B6050101-40093`;

  modal.style.display = "flex";
}

function cerrarModalCertificado() {
  const modal = document.getElementById("jlpt-certificate-modal");
  if (modal) modal.style.display = "none";
}

function imprimirCertificado() {
  window.print();
}

function renderizarGaleriaCertificadosPerfil() {
  const container = document.getElementById("certificates-grid");
  const countBadge = document.getElementById("certificates-count-badge");
  if (!container) return;

  let certs = [];
  try {
    certs = JSON.parse(localStorage.getItem("jlpt_certificados") || "[]");
  } catch (e) {
    certs = [];
  }

  if (countBadge) {
    countBadge.innerText = `${certs.length} ${certs.length === 1 ? 'certificado' : 'certificados'}`;
  }

  if (certs.length === 0) {
    container.innerHTML = `
      <div class="empty-state-card" style="grid-column: 1 / -1; text-align: center; padding: 30px; background: rgba(0,0,0,0.03); border-radius: 14px; border: 2px dashed rgba(0,0,0,0.15);">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 8px;">📜</span>
        <h4 style="margin: 0 0 6px; color: var(--color-h2);">Aún no tienes Certificados JLPT</h4>
        <p style="margin: 0 0 15px; font-size: 0.9rem; opacity: 0.8;">Completa y aprueba simulacros de examen en el Simulador JLPT para obtener tus diplomas oficiales.</p>
        <a href="jlpt-simulador.html" class="btn btn-primary">Ir al Simulador JLPT ⛩️</a>
      </div>
    `;
    return;
  }

  container.innerHTML = certs.map(c => {
    const paisInfo = PAISES_JLPT[c.paisKey || "UK"] || PAISES_JLPT["UK"];
    const cod = c.codigoRegLeft || c.codigoReg || "N4A210633A";
    return `
      <div class="certificate-card-item">
        <div class="cert-card-header">
          <span class="cert-card-icon">📜</span>
          <div class="cert-card-titles">
            <h4>Certificado JLPT ${c.nivel}</h4>
            <span class="cert-card-reg">${cod}</span>
          </div>
        </div>
        <div class="cert-card-body">
          <p><strong>Estudiante:</strong> ${c.estudianteNombre || 'SATOU UTSUJI'}</p>
          <p><strong>受験地 (País):</strong> ${paisInfo.jp} (${paisInfo.en})</p>
          <p><strong>Puntaje:</strong> ${c.correctas}/${c.total} (${c.porcentaje}%)</p>
          <p><strong>Fecha de Emisión:</strong> ${c.fecha}</p>
        </div>
        <div class="cert-card-actions">
          <button class="btn btn-primary" onclick="abrirModalCertificadoPorId('${c.id}')" style="width: 100%; font-size: 0.88rem;">
            👁️ Visualizar Certificado
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function guardarCertificadoPDF() {
  const element = document.getElementById("jlpt-certificate-printable");
  if (!element) {
    window.print();
    return;
  }

  if (typeof mostrarToast === "function") {
    mostrarToast("📥 Descargando certificado PDF directamente...");
  }

  const elLevel = document.getElementById("cert-pdf-level");
  const elName = document.getElementById("cert-pdf-name");
  const lvlText = elLevel ? elLevel.innerText.trim() : "JLPT";
  const nameText = elName ? elName.innerText.trim().replace(/\s+/g, '_') : "Estudiante";
  const fileName = `Certificado_JLPT_${lvlText}_${nameText}.pdf`;

  if (typeof html2pdf !== "undefined") {
    const opt = {
      margin: 0,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  } else {
    window.print();
  }
}

// Expuestos globalmente
window.generarYGuardarCertificadoJLPT = generarYGuardarCertificadoJLPT;
window.abrirModalCertificadoPorId = abrirModalCertificadoPorId;
window.abrirModalCertificado = abrirModalCertificado;
window.cerrarModalCertificado = cerrarModalCertificado;
window.imprimirCertificado = imprimirCertificado;
window.guardarCertificadoPDF = guardarCertificadoPDF;
window.renderizarGaleriaCertificadosPerfil = renderizarGaleriaCertificadosPerfil;
