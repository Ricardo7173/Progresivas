// Variables globales
const DB_NAME = "RecordatoriosDB";
const DB_VERSION = 1;
let db;
let dbInitialized = false; // Flag para comprobar si la base de datos se inicializó correctamente

// Inicializar IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Evento: Base de datos creada o actualizada
        request.onupgradeneeded = function (e) {
            db = e.target.result;

            if (!db.objectStoreNames.contains("recordatorios")) {
                const objectStore = db.createObjectStore("recordatorios", {
                    keyPath: "id",
                    autoIncrement: true
                });
                objectStore.createIndex("nombre", "nombre", { unique: false });
                objectStore.createIndex("fechaHora", "fechaHora", { unique: false });
                objectStore.createIndex("descripcion", "descripcion", { unique: false });
            }

            console.log("IndexedDB: Base de datos actualizada");
        };

        // Evento: Conexión exitosa
        request.onsuccess = function (e) {
            db = e.target.result;
            dbInitialized = true; // Establecer la base de datos como inicializada
            console.log("IndexedDB: Base de datos inicializada");
            resolve(); // Resolver la promesa
        };

        // Evento: Error al conectar
        request.onerror = function (e) {
            console.error("IndexedDB: Error al inicializar la base de datos", e.target.error);
            reject("Error al inicializar la base de datos"); // Rechazar la promesa
        };
    });
}

// Guardar datos en la base de datos
function guardarRecordatorio(recordatorio) {
    if (!dbInitialized) {
        console.error("Base de datos no inicializada.");
        return;
    }

    const transaction = db.transaction(["recordatorios"], "readwrite");
    const objectStore = transaction.objectStore("recordatorios");

    const request = objectStore.add(recordatorio);

    request.onsuccess = function () {
        console.log("IndexedDB: Recordatorio guardado", recordatorio);
        alert("¡Recordatorio guardado con éxito!");
    };

    request.onerror = function (e) {
        console.error("IndexedDB: Error al guardar el recordatorio", e.target.error);
    };
}

// Capturar datos del formulario y guardarlos en IndexedDB
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("formRecordatorio").addEventListener("submit", function (e) {
        e.preventDefault(); // Evita que se recargue la página

        const nombre = document.getElementById("nombre").value;
        const fechaHora = document.getElementById("fechaHora").value;
        const descripcion = document.getElementById("descripcion").value;

        const nuevoRecordatorio = {
            nombre: nombre,
            fechaHora: fechaHora,
            descripcion: descripcion
        };

        guardarRecordatorio(nuevoRecordatorio);

        // Limpiar formulario
        this.reset();
    });
});

// Inicializar la base de datos al cargar la página
initDB().then(() => {
    console.log("Base de datos inicializada correctamente.");
}).catch((err) => {
    console.error("Error al inicializar la base de datos:", err);
});
