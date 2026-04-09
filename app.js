

"use strict";

// PRECIOS Y CONSTANTES
const REGION_PRICES = {
  us: 0,
  eu: 10,
  as: 15,

  // Suramérica
  br: 20, // Brasil
  cl: 18, // Chile

  // Asia (más granular)
  in: 12, // India (barato)
  sg: 22, // Singapur (caro)
  jp: 25, // Japón (premium)
  id: 13, // Indonesia

  // Oceanía
  au: 28, // Australia (muy caro)
};

const REGION_NAMES = {
  us: "🇺🇸 EE.UU.",
  eu: "🇪🇺 Europa",
  as: "Asia",

  // Suramérica
  br: "🇧🇷 Brasil",
  cl: "🇨🇱 Chile",

  // Asia
  in: "🇮🇳 India",
  sg: "🇸🇬 Singapur",
  jp: "🇯🇵 Japón",
  id: "🇮🇩 Indonesia",

  // Oceanía
  au: "🇦🇺 Australia",
};

const SERVICE_PRICES = {
  backup: 20,
  monitoring: 15,
  ssl: 10,
};

const PLAN_PRICES = {
  basic: 50000,
  pro: 100000,
  enterprise: 250000,
};

const PLAN_NAMES = {
  basic: "Basic",
  pro: "Professional",
  enterprise: "Enterprise",
};

// PASO 1 — VALIDACIÓN EN TIEMPO REAL (blur/input)
// Funciones flecha de validación 
const validarRequerido = (valor) => valor.trim().length > 0;
const validarMinCaracteres = (valor, min) => valor.trim().length >= min;
const validarEmail = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());

// Mostrar / limpiar error de campo
const mostrarError = (errorId, mensaje) => {
  const el = document.getElementById(errorId);
  if (!el) return;
  el.textContent = mensaje;
};

const limpiarError = (errorId, inputEl) => {
  const el = document.getElementById(errorId);
  if (el) el.textContent = "";
  if (inputEl) inputEl.classList.remove("error");
};

// Registrar eventos blur e input en campos del paso 1
function iniciarValidacionCampos() {
  // Nombre de proyecto
  const inputNombre = document.getElementById("project-name");
  inputNombre.addEventListener("blur", () => {
    if (!validarRequerido(inputNombre.value)) {
      mostrarError("error-project-name", "Campo requerido.");
      inputNombre.classList.add("error");
    } else {
      limpiarError("error-project-name", inputNombre);
    }
  });
  inputNombre.addEventListener("input", () => {
    if (validarRequerido(inputNombre.value)) {
      limpiarError("error-project-name", inputNombre);
    }
  });

  // Empresa
  const inputEmpresa = document.getElementById("company-name");
  inputEmpresa.addEventListener("blur", () => {
    if (!validarRequerido(inputEmpresa.value)) {
      mostrarError("error-company-name", "Campo requerido.");
      inputEmpresa.classList.add("error");
    } else {
      limpiarError("error-company-name", inputEmpresa);
    }
  });
  inputEmpresa.addEventListener("input", () => {
    if (validarRequerido(inputEmpresa.value))
      limpiarError("error-company-name", inputEmpresa);
  });

  // Descripción validar el mínimo de 20 caracteres
  const textareaDesc = document.getElementById("project-desc");
  textareaDesc.addEventListener("blur", () => {
    if (!validarMinCaracteres(textareaDesc.value, 20)) {
      mostrarError(
        "error-project-desc",
        textareaDesc.value.trim().length === 0
          ? "Campo requerido."
          : "Mínimo 20 caracteres.",
      );
      textareaDesc.classList.add("error");
    } else {
      limpiarError("error-project-desc", textareaDesc);
    }
  });
  textareaDesc.addEventListener("input", () => {
    if (validarMinCaracteres(textareaDesc.value, 20))
      limpiarError("error-project-desc", textareaDesc);
  });

  // Validación correo
  const inputEmail = document.getElementById("contact-email");
  inputEmail.addEventListener("blur", () => {
    if (!validarRequerido(inputEmail.value)) {
      mostrarError("error-contact-email", "Campo requerido.");
      inputEmail.classList.add("error");
    } else if (!validarEmail(inputEmail.value)) {
      mostrarError("error-contact-email", "Ingresa un correo válido.");
      inputEmail.classList.add("error");
    } else {
      limpiarError("error-contact-email", inputEmail);
    }
  });
  inputEmail.addEventListener("input", () => {
    if (validarEmail(inputEmail.value))
      limpiarError("error-contact-email", inputEmail);
  });
}


// SUBTOTAL AUTOMÁTICO (select + checkboxes)
// Funciones flecha de cálculo
const calcularRegion = (region) => REGION_PRICES[region] ?? 0;
const calcularServicios = (servicios) =>
  servicios.reduce((acc, svc) => acc + (SERVICE_PRICES[svc] ?? 0), 0);
const calcularBase = (plan) => PLAN_PRICES[plan] ?? 0;
const calcularTotal = (plan, region, servicios) =>
  calcularBase(plan) + calcularRegion(region) + calcularServicios(servicios);

function obtenerServiciosSeleccionados() {
  return Array.from(
    document.querySelectorAll('input[name="services"]:checked'),
  ).map((cb) => cb.value);
}

function actualizarSubtotal() {
  const region = document.getElementById("server-region").value;
  const servicios = obtenerServiciosSeleccionados();
  const subtotal = calcularRegion(region) + calcularServicios(servicios);
  document.getElementById("subtotal-amount").textContent = `$${subtotal} / mes`;
}

function iniciarCalculoRecursos() {
  document
    .getElementById("server-region")
    .addEventListener("change", actualizarSubtotal);
  document.querySelectorAll('input[name="services"]').forEach((cb) => {
    cb.addEventListener("change", actualizarSubtotal);
  });
}



/**
 Formatea los datos (trim + uppercase en campos de texto)
  y luego invoca el callback para presentar el resultado.
 */
function procesarCotizacion(datos, callback) {
  const datosProcesados = {
    projectName: datos.projectName.trim().toUpperCase(),
    companyName: datos.companyName.trim().toUpperCase(),
    projectDesc: datos.projectDesc.trim(),
    contactEmail: datos.contactEmail.trim().toLowerCase(),
    region: datos.region,
    services: datos.services,
    plan: datos.plan,
  };
  callback(datosProcesados);
}

// ─────────────────────────────────────────────
// PASO 5 — PROMESA SIMULADA (Punto 5)
// ─────────────────────────────────────────────

/**
 * Simula el envío al servidor con latencia de red.
 */
function enviarAlServidor(data) {
  return new Promise((resolve, reject) => {
    if (!data.projectName || data.projectName.trim() === "") {
      reject(new Error("El nombre del proyecto no puede estar vacío."));
      return;
    }
    // Simular latencia de red (2 segundos)
    setTimeout(() => {
      const txId =
        "TXN-" + Math.random().toString(36).toUpperCase().substring(2, 10);
      resolve(txId);
    }, 2000);
  });
}

// Navegación entre pasos

let currentStep = 1;
const TOTAL_STEPS = 4;

function irAPaso(nuevoStep) {
  // Ocultar panel actual
  document.querySelector(".step-panel.active")?.classList.remove("active");
  document.getElementById(`panel-${nuevoStep}`).classList.add("active");

  // Actualizar stepper dots
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const dot = document.getElementById(`step-dot-${i}`);
    dot.classList.remove("active", "done");
    if (i < nuevoStep)
      (dot.classList.add("done"),
        (dot.querySelector(".step-circle").textContent = "✓"));
    else if (i === nuevoStep)
      (dot.classList.add("active"),
        (dot.querySelector(".step-circle").textContent = i));
    else dot.querySelector(".step-circle").textContent = i;
  }

  // Actualizar líneas
  document.querySelectorAll(".step-line").forEach((line, idx) => {
    line.classList.toggle("done", idx + 1 < nuevoStep);
  });

  currentStep = nuevoStep;
  window.scrollTo({ top: 0, behavior: "smooth" });
}


// VALIDACIONES POR CADA PASO


function validarPaso1() {
  let ok = true;

  const nombre = document.getElementById("project-name");
  const empresa = document.getElementById("company-name");
  const desc = document.getElementById("project-desc");
  const email = document.getElementById("contact-email");

  if (!validarRequerido(nombre.value)) {
    mostrarError("error-project-name", "Campo requerido.");
    nombre.classList.add("error");
    ok = false;
  }
  if (!validarRequerido(empresa.value)) {
    mostrarError("error-company-name", "Campo requerido.");
    empresa.classList.add("error");
    ok = false;
  }
  if (!validarMinCaracteres(desc.value, 20)) {
    mostrarError(
      "error-project-desc",
      desc.value.trim().length === 0
        ? "Campo requerido."
        : "Mínimo 20 caracteres.",
    );
    desc.classList.add("error");
    ok = false;
  }
  if (!validarRequerido(email.value) || !validarEmail(email.value)) {
    mostrarError(
      "error-contact-email",
      !validarRequerido(email.value)
        ? "Campo requerido."
        : "Ingresa un correo válido.",
    );
    email.classList.add("error");
    ok = false;
  }

  return ok;
}

function validarPaso2() {
  const region = document.getElementById("server-region").value;
  if (!region) {
    mostrarError("error-server-region", "Selecciona una región.");
    return false;
  }
  limpiarError("error-server-region", document.getElementById("server-region"));
  return true;
}

function validarPaso3() {
  const planSeleccionado = document.querySelector('input[name="plan"]:checked');
  if (!planSeleccionado) {
    mostrarError("error-plan", "Selecciona un plan de cómputo.");
    return false;
  }
  limpiarError("error-plan", null);
  return true;
}

// RESUMEN — Construir vista de resumen (Paso 4)
function construirResumen() {
  const datos = obtenerDatosFormulario();
  const grid = document.getElementById("summary-grid");

  const plan = datos.plan || "—";
  const region = datos.region || "—";
  const servicios = datos.services.length
    ? datos.services.join(", ")
    : "Ninguno";
  const total = datos.plan ? calcularTotal(plan, region, datos.services) : 0;

  const filas = [
    { label: "Proyecto", value: datos.projectName || "—" },
    { label: "Empresa", value: datos.companyName || "—" },
    { label: "Correo", value: datos.contactEmail || "—" },
    { label: "Región", value: REGION_NAMES[region] || region },
    { label: "Servicios", value: servicios },
    { label: "Plan", value: PLAN_NAMES[plan] || plan },
  ];

  grid.innerHTML = filas
    .map(
      (f) => `
    <div class="summary-row">
      <span class="label">${f.label}</span>
      <span class="value">${f.value}</span>
    </div>
  `,
    )
    .join("");

  document.getElementById("total-amount").textContent = `$${total} / mes`;
}


// OBTENER DATOS DEL FORMULARIO
function obtenerDatosFormulario() {
  return {
    projectName: document.getElementById("project-name").value,
    companyName: document.getElementById("company-name").value,
    projectDesc: document.getElementById("project-desc").value,
    contactEmail: document.getElementById("contact-email").value,
    region: document.getElementById("server-region").value,
    services: obtenerServiciosSeleccionados(),
    plan: document.querySelector('input[name="plan"]:checked')?.value || "",
  };
}


// FLUJO ASÍNCRONO COMPLETO (submit)


function manejarEnvio(e) {
  e.preventDefault(); // evitar recarga

  if (currentStep !== 4) return;

  const datos = obtenerDatosFormulario();

  // Spinner y estado de carga
  const btnSubmit = document.getElementById("btn-submit");
  const btnText = document.getElementById("btn-submit-text");
  const spinner = document.getElementById("spinner");
  const statusEl = document.getElementById("send-status");

  btnSubmit.disabled = true;
  btnText.style.display = "none";
  spinner.style.display = "inline-block";
  statusEl.textContent = "⏳ Procesando y enviando datos al servidor...";
  statusEl.style.color = "var(--text-muted)";

  // Callback para imprimir resumen en consola
  procesarCotizacion(datos, (datosProcesados) => {
    console.log("=== COTIZACIÓN PROCESADA ===");
    console.table(datosProcesados);
  });

  //  Promesa + .then() / .catch()
  enviarAlServidor({ projectName: datos.projectName })
    .then((txId) => {
      // Éxito
      btnSubmit.disabled = false;
      btnText.style.display = "inline";
      spinner.style.display = "none";

      // Mostrar pantalla de éxito
      document.getElementById("configurator-form").style.display = "none";
      const successScreen = document.getElementById("success-screen");
      successScreen.style.display = "block";

      const plan = datos.plan;
      const region = datos.region;
      const total = calcularTotal(plan, region, datos.services);

      document.getElementById("transaction-box").innerHTML = `
        ID de transacción: <strong>${txId}</strong><br/>
        Plan: ${PLAN_NAMES[plan] || plan} | Total: $${total}/mes
      `;
    })
    .catch((err) => {
      // Error
      btnSubmit.disabled = false;
      btnText.style.display = "inline";
      spinner.style.display = "none";
      statusEl.textContent = `❌ Error: ${err.message}`;
      statusEl.style.color = "var(--danger)";
    });
}

// BOTONES DE NAVEGACIÓN

function iniciarNavegacion() {
  // Paso 1 → 2
  document.getElementById("btn-next-1").addEventListener("click", () => {
    if (validarPaso1()) irAPaso(2);
  });

  // Paso 2 → 1
  document
    .getElementById("btn-back-2")
    .addEventListener("click", () => irAPaso(1));

  // Paso 2 → 3
  document.getElementById("btn-next-2").addEventListener("click", () => {
    if (validarPaso2()) irAPaso(3);
  });

  // Paso 3 → 2
  document
    .getElementById("btn-back-3")
    .addEventListener("click", () => irAPaso(2));

  // Paso 3 → 4 (resumen)
  document.getElementById("btn-next-3").addEventListener("click", () => {
    if (validarPaso3()) {
      construirResumen();
      irAPaso(4);
    }
  });

  // Paso 4 → 3
  document
    .getElementById("btn-back-4")
    .addEventListener("click", () => irAPaso(3));

  // Submit — Finalizar Compra
  document
    .getElementById("configurator-form")
    .addEventListener("submit", manejarEnvio);

  // Reiniciar
  document.getElementById("btn-restart").addEventListener("click", () => {
    document.getElementById("configurator-form").reset();
    document.getElementById("configurator-form").style.display = "block";
    document.getElementById("success-screen").style.display = "none";
    document.getElementById("subtotal-amount").textContent = "$0 / mes";
    document.getElementById("send-status").textContent = "";
    irAPaso(1);
  });
}

// INICIALIZACIÓN

document.addEventListener("DOMContentLoaded", () => {
  iniciarValidacionCampos(); //eventos blur/input
  iniciarCalculoRecursos(); // subtotal automático
  iniciarNavegacion(); // Navegación entre pasos
});
