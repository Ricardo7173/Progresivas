// Variables globales
const DB_NAME = "RecordatoriosDB";
const DB_VERSION = 1;
let db;

// Inicializar IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onsuccess = function (e) {
            db = e.target.result;
            resolve();
        };

        request.onerror = function (e) {
            console.error("IndexedDB: Error al inicializar la base de datos", e.target.error);
            reject("Error al inicializar la base de datos");
        };
    });
}

// Cargar los datos del recordatorio en el formulario
function cargarRecordatorio(id) {
    const transaction = db.transaction(["recordatorios"], "readonly");
    const objectStore = transaction.objectStore("recordatorios");
    const request = objectStore.get(Number(id));

    request.onsuccess = function () {
        const recordatorio = request.result;

        if (recordatorio) {
            document.getElementById("recordatorioId").value = recordatorio.id;
            document.getElementById("nombre").value = recordatorio.nombre;
            document.getElementById("fechaHora").value = recordatorio.fechaHora;
            document.getElementById("descripcion").value = recordatorio.descripcion;
            notificado: recordatorio.notificado
        } else {
            alert("Recordatorio no encontrado.");
        }
    };

    request.onerror = function (e) {
        console.error("IndexedDB: Error al cargar el recordatorio", e.target.error);
    };
}

// Guardar los cambios en IndexedDB
function guardarCambios(recordatorio) {
    const transaction = db.transaction(["recordatorios"], "readwrite");
    const objectStore = transaction.objectStore("recordatorios");

    const request = objectStore.put(recordatorio);

    request.onsuccess = function () {
        alert("¡Recordatorio actualizado con éxito!");
        window.location.href = "../index.html"; // Redirigir a la página principal
    };

    request.onerror = function (e) {
        console.error("IndexedDB: Error al actualizar el recordatorio", e.target.error);
    };
}

// Capturar datos del formulario y guardar los cambios
document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const recordatorioId = urlParams.get("id");

    initDB().then(() => {
        if (recordatorioId) {
            cargarRecordatorio(recordatorioId);
        } else {
            alert("ID de recordatorio no especificado.");
        }
    });

    document.getElementById("formEditarRecordatorio").addEventListener("submit", function (e) {
        e.preventDefault();

        const id = document.getElementById("recordatorioId").value;
        const nombre = document.getElementById("nombre").value;
        const fechaHora = document.getElementById("fechaHora").value;
        const descripcion = document.getElementById("descripcion").value;

        // Obtener el recordatorio desde la base de datos para conservar el campo `notificado`
        const transaction = db.transaction(["recordatorios"], "readonly");
        const objectStore = transaction.objectStore("recordatorios");
        const request = objectStore.get(Number(id));

        request.onsuccess = function () {
            const recordatorio = request.result;

            if (recordatorio) {
                const recordatorioActualizado = {
                    id: Number(id),
                    nombre: nombre,
                    fechaHora: fechaHora,
                    descripcion: descripcion,
                    notificado: recordatorio.notificado // Mantener el valor original
                };

                guardarCambios(recordatorioActualizado);
            } else {
                console.error("Error: No se encontró el recordatorio para actualizar.");
            }
        };

        request.onerror = function (e) {
            console.error("Error al obtener el recordatorio para actualizar", e.target.error);
        };
    });
});
