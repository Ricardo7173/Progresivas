// Obtener el contenedor de la lista
const listaRecordatorios = document.getElementById("listaRecordatorios");

// Función para mostrar los recordatorios almacenados en IndexedDB
function mostrarRecordatorios() {
    if (!dbInitialized) {
        console.error("Base de datos no inicializada.");
        return;
    }

    const transaction = db.transaction(["recordatorios"], "readonly");
    const objectStore = transaction.objectStore("recordatorios");

    const request = objectStore.getAll();
    request.onsuccess = function (e) {
        const recordatorios = e.target.result;

        listaRecordatorios.innerHTML = ""; // Limpiar lista antes de agregar elementos
        if (recordatorios.length === 0) {
            listaRecordatorios.innerHTML = `<p class="text-center text-muted">No hay recordatorios guardados.</p>`;
            return;
        }

        recordatorios.forEach((recordatorio) => {
            const item = document.createElement("div");
            item.className = "list-group-item d-flex justify-content-between align-items-center";
            item.innerHTML = `
                <div>
                    <h5 class="mb-1">${recordatorio.nombre}</h5>
                    <p class="mb-1 text-muted">${recordatorio.fechaHora}</p>
                    <small>${recordatorio.descripcion}</small>
                </div>
                <div>
                    <button class="btn btn-danger btn-sm mx-1" onclick="eliminarRecordatorio(${recordatorio.id})">Eliminar</button>
                    <button class="btn btn-secondary btn-sm mx-1" onclick="editarRecordatorio(${recordatorio.id})">Editar</button>
                </div>
            `;
            listaRecordatorios.appendChild(item);
        });
    };
}

// Función para eliminar un recordatorio
function eliminarRecordatorio(id) {
    const transaction = db.transaction(["recordatorios"], "readwrite");
    const objectStore = transaction.objectStore("recordatorios");

    const request = objectStore.delete(id);
    request.onsuccess = function () {
        console.log(`Recordatorio con ID ${id} eliminado`);
        mostrarRecordatorios();
    };

    request.onerror = function (e) {
        console.error("Error al eliminar recordatorio", e.target.error);
    };
}

// Función para redirigir a la pantalla de edición
function editarRecordatorio(id) {
    // Aquí puedes guardar el ID en el localStorage para usarlo en la pantalla de edición
    localStorage.setItem("recordatorioEditar", id);
    window.location.href = "editarRecordatorio.html";
}

// Mostrar los recordatorios al cargar la página
initDB().then(() => {
    mostrarRecordatorios();
}).catch((err) => {
    console.error("Error al inicializar la base de datos:", err);
});
