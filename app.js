// Configura Supabase
const supabaseUrl = 'TU_URL_SUPABASE';
const supabaseKey = 'TU_KEY_PUBLICA';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Variables globales
let numerosSeleccionados = [];
const CONFIG = {
    ALIAS: "TU_ALIAS_DE_PAGO",
    WHATSAPP: "542266494705",
    MAX_NUMEROS: 5
};

// Funciones
function mostrarNumeros() {
    if (!validarDatos()) return;
    document.getElementById("form1").style.display = "none";
    document.getElementById("form2").style.display = "block";
    generarNumeros();
}

function validarDatos() {
    const nombre = document.getElementById("nombre").value.trim();
    const dni = document.getElementById("dni").value.trim();
    return nombre && dni;
}

function generarNumeros() {
    const container = document.getElementById("numeros-container");
    container.innerHTML = "";
    for (let i = 0; i < 100; i++) {
        const num = i.toString().padStart(2, "0");
        const div = document.createElement("div");
        div.className = "numero";
        div.textContent = num;
        div.onclick = () => toggleNumero(num);
        container.appendChild(div);
    }
}

function toggleNumero(num) {
    const index = numerosSeleccionados.indexOf(num);
    if (index >= 0) {
        numerosSeleccionados.splice(index, 1);
    } else if (numerosSeleccionados.length < CONFIG.MAX_NUMEROS) {
        numerosSeleccionados.push(num);
    }
    actualizarUI();
}

function actualizarUI() {
    document.querySelectorAll(".numero").forEach(numDiv => {
        numDiv.classList.toggle("seleccionado", numerosSeleccionados.includes(numDiv.textContent));
    });
}

async function reservar() {
    // Validación
    if (numerosSeleccionados.length === 0) {
        alert("Selecciona al menos un número");
        return;
    }

    const data = {
        nombre: document.getElementById("nombre").value.trim(),
        apellido: document.getElementById("apellido").value.trim(),
        dni: document.getElementById("dni").value.trim(),
        celular: document.getElementById("celular").value.trim(),
        numeros: numerosSeleccionados.join(", "),
        pagado: false
    };

    try {
        // Insertar en Supabase
        const { error } = await supabase
            .from('rifas')
            .insert([data]);

        if (error) throw error;

        // Mostrar confirmación
        document.getElementById("form2").style.display = "none";
        document.getElementById("confirmacion").style.display = "block";
        document.getElementById("alias-display").textContent = CONFIG.ALIAS;
        document.getElementById("whatsapp-link").href = `https://wa.me/${CONFIG.WHATSAPP}`;
        
        numerosSeleccionados = [];
        actualizarUI();

    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Error al reservar. Intenta nuevamente.");
    }
}