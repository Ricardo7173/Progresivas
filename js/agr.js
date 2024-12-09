// Variables globales
const DB_NAME = "RecordatoriosDB";
const DB_VERSION = 1;
let db;
let dbInitialized = false; // Flag para comprobar si la base de datos se inicializó correctamente

// Inicializar IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

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
                objectStore.createIndex("notificado", "notificado", { unique: false });
            }

            console.log("IndexedDB: Base de datos actualizada");
        };

        request.onsuccess = function (e) {
            db = e.target.result;
            dbInitialized = true;
            console.log("IndexedDB: Base de datos inicializada");
            resolve();
        };

        request.onerror = function (e) {
            console.error("IndexedDB: Error al inicializar la base de datos", e.target.error);
            reject("Error al inicializar la base de datos");
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

    recordatorio.notificado = false; // Agregar flag para controlar notificaciones
    const request = objectStore.add(recordatorio);

    request.onsuccess = function () {
        console.log("IndexedDB: Recordatorio guardado", recordatorio);
        alert("¡Recordatorio guardado con éxito!");
    };

    request.onerror = function (e) {
        console.error("IndexedDB: Error al guardar el recordatorio", e.target.error);
    };
}

// Enviar notificación
function enviarNotificacion(recordatorio) {
    if (Notification.permission === "granted") {
        const opts = {
            body: recordatorio.descripcion,
            icon: "/img/icono.png",
        };
        const notification = new Notification(`Recordatorio: ${recordatorio.nombre}`, opts);
        notification.onclick = () => console.log(`Notificación clickeada: ${recordatorio.nombre}`);
    }
}

// Verificar recordatorios pendientes
function verificarRecordatorios() {
    if (!dbInitialized) return;

    const transaction = db.transaction(["recordatorios"], "readwrite");
    const objectStore = transaction.objectStore("recordatorios");

    const request = objectStore.openCursor();
    const ahora = new Date();

    request.onsuccess = function (e) {
        const cursor = e.target.result;
        if (cursor) {
            const recordatorio = cursor.value;
            const fechaHora = new Date(recordatorio.fechaHora);

            // Si la fecha y hora ya pasó y no se ha notificado
            if (fechaHora <= ahora && !recordatorio.notificado) {
                enviarNotificacion(recordatorio);

                // Actualizar el estado de "notificado"
                recordatorio.notificado = true;
                cursor.update(recordatorio);
            }
            cursor.continue();
        }
    };

    request.onerror = function (e) {
        console.error("Error al verificar los recordatorios", e.target.error);
    };
}

// Capturar datos del formulario y guardarlos en IndexedDB
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("formRecordatorio").addEventListener("submit", function (e) {
        e.preventDefault();

        const nombre = document.getElementById("nombre").value;
        const fechaHora = document.getElementById("fechaHora").value;
        const descripcion = document.getElementById("descripcion").value;

        const nuevoRecordatorio = {
            nombre: nombre,
            fechaHora: fechaHora,
            descripcion: descripcion,
        };

        guardarRecordatorio(nuevoRecordatorio);
        this.reset();
    });

    // Pedir permisos para notificaciones al cargar la página
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // Verificar recordatorios cada minuto
    setInterval(verificarRecordatorios, 1000);
});

// Inicializar la base de datos al cargar la página
initDB()
    .then(() => console.log("Base de datos inicializada correctamente."))
    .catch((err) => console.error("Error al inicializar la base de datos:", err));
