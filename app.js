// Configura Supabase (¡NO expongas públicamente esta clave en producción!)
const supabaseUrl = 'https://sbyzohdridbcygpwmfup.supabase.co';
const supabaseKey = 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNieXpvaGRyaWRiY3lncHdtZnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDMzNTEsImV4cCI6MjA2MzUxOTM1MX0.7KmEhJ25DSbUu8m';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Variables globales
let numerosSeleccionados = [];
const CONFIG = {
    ALIAS: "TU_ALIAS_DE_PAGO",  // Ej: "mercadopago.mirifa"
    WHATSAPP: "542266494705",   // Formato: código país + número sin +
    MAX_NUMEROS: 5
};

// Funciones principales
function mostrarNumeros() {
    if (!validarDatos()) {
        alert("Por favor completa nombre y DNI");
        return;
    }

    document.getElementById("form1").style.display = "none";
    document.getElementById("form2").style.display = "block";
    generarNumeros();
}

function validarDatos() {
    const nombre = document.getElementById("nombre").value.trim();
    const dni = document.getElementById("dni").value.trim();
    return nombre.length > 0 && dni.length > 0;
}

function generarNumeros() {
    const container = document.getElementById("numeros-container");
    container.innerHTML = "";
    
    for (let i = 0; i < 100; i++) {
        const num = i.toString().padStart(2, "0");
        const div = document.createElement("div");
        div.className = "numero";
        div.textContent = num;
        div.addEventListener("click", () => toggleNumero(num));  // Mejor práctica que onclick
        container.appendChild(div);
    }
}

function toggleNumero(num) {
    const index = numerosSeleccionados.indexOf(num);
    
    if (index >= 0) {
        // Deseleccionar número
        numerosSeleccionados.splice(index, 1);
    } else if (numerosSeleccionados.length < CONFIG.MAX_NUMEROS) {
        // Seleccionar número
        numerosSeleccionados.push(num);
    } else {
        alert(`Solo puedes seleccionar máximo ${CONFIG.MAX_NUMEROS} números`);
        return;
    }
    
    actualizarUI();
}

function actualizarUI() {
    document.querySelectorAll(".numero").forEach(numDiv => {
        const estaSeleccionado = numerosSeleccionados.includes(numDiv.textContent);
        numDiv.classList.toggle("seleccionado", estaSeleccionado);
    });
}

async function reservar() {
    // Validación reforzada
    if (numerosSeleccionados.length === 0) {
        alert("¡Selecciona al menos un número!");
        return;
    }

    const camposRequeridos = ['nombre', 'dni', 'celular'];
    const faltantes = camposRequeridos.filter(id => !document.getElementById(id).value.trim());
    
    if (faltantes.length > 0) {
        alert(`Faltan campos obligatorios: ${faltantes.join(', ')}`);
        return;
    }

    // Preparar datos
    const data = {
        nombre: document.getElementById("nombre").value.trim(),
        apellido: document.getElementById("apellido").value.trim() || null, // Opcional
        dni: document.getElementById("dni").value.trim(),
        celular: document.getElementById("celular").value.trim(),
        numeros: numerosSeleccionados.join(", "),
        pagado: false,
        fecha: new Date().toISOString()
    };

    try {
        console.log("Enviando datos a Supabase:", data);
        
        const { error } = await supabase
            .from('rifas')
            .insert([data])
            .select();  // El .select() ayuda a debuggear

        if (error) {
            console.error("Error de Supabase:", error);
            throw new Error("Error al guardar en la base de datos");
        }

        // Éxito - Mostrar confirmación
        document.getElementById("form2").style.display = "none";
        document.getElementById("confirmacion").style.display = "block";
        document.getElementById("alias-display").textContent = CONFIG.ALIAS;
        document.getElementById("whatsapp-link").href = `https://wa.me/${CONFIG.WHATSAPP}`;
        
        // Resetear selección
        numerosSeleccionados = [];
        actualizarUI();

    } catch (error) {
        console.error("Error completo:", error);
        alert(`Error al reservar: ${error.message}\nPor favor intenta nuevamente.`);
    }
}
