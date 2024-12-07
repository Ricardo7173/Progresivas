// Nombre de los caches
const CACHE_ESTATICO = "recordatorios-cache-v1";
const CACHE_DINAMICO = "recordatorios-dinamico-v1";

// Archivos a cachear
const ARCHIVOS_ESTATICOS = [
    "/",
    "/index.html",
    "/css/style.css",
    "/css/AGRstyle.css",
    "/js/app.js",
    "/js/agr.js",
    "/paginas/agrrecordatorio.html",
    "/paginas/lisrecordatorio.html",
];

self.addEventListener("install", (evento) => {
    console.log("Service Worker: Instalado");
    const cacheEstatico = caches.open(CACHE_ESTATICO).then((cache) => {
        return cache.addAll(ARCHIVOS_ESTATICOS);
    });
    evento.waitUntil(cacheEstatico);
});

self.addEventListener("activate", (evento) => {
    console.log("Service Worker: Activado");
    const limpiarCaches = caches.keys().then((nombresCaches) => {
        return Promise.all(
            nombresCaches.map((nombre) => {
                if (nombre !== CACHE_ESTATICO && nombre !== CACHE_DINAMICO) {
                    console.log("Service Worker: Borrando cache antiguo", nombre);
                    return caches.delete(nombre);
                }
            })
        );
    });
    evento.waitUntil(limpiarCaches);
});

self.addEventListener("fetch", (evento) => {
    const respuesta = caches.match(evento.request).then((cache) => {
        if (cache) {
            console.log("Service Worker: Cache hit", evento.request.url);
            return cache;
        }
        console.log("Service Worker: Fetching", evento.request.url);
        return fetch(evento.request).then((respuestaRed) => {
            return caches.open(CACHE_DINAMICO).then((cacheDinamico) => {
                if (!evento.request.url.includes("chrome-extension")) {
                    cacheDinamico.put(evento.request, respuestaRed.clone());
                }
                return respuestaRed;
            });
        });
    });

    evento.respondWith(respuesta);
});

self.addEventListener("sync", (evento) => {
    console.log("Service Worker: Evento sync", evento.tag);
});

self.addEventListener("push", (evento) => {
    console.log("Service Worker: Evento push", evento.data ? evento.data.text() : "Sin datos");
});
