if ( navigator.serviceWorker ) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
                console.log("Service Worker registrado con éxito:", registration);
            })
            .catch((error) => {
                console.error("Error al registrar el Service Worker:", error);
            });
    });
}

const enviarNotificaciones = () => {
    const notificationOpts = {
        body: "Este es el cuerpo de la notificacion",
        icon: "img/icono.png"
    }

    const n = new Notification("Nueva Notificacion", notificationOpts);
    n.onclick =() => {
        console.log("Le dieron clic a la notificacion");
    }
}

const mostrarNotificaciones = () => {
    if(!window.Notification){
        console.log("El navegador no soporta notificaciones")
        return;
    }
    if(Notification.permission === "granted"){
        new Notification("Hola, si soporta las notificaciones");
    }else if(Notification.permission !== "denied" || Notification.permission === "default"){
        Notification.requestPermission(resultado => {
            console.log("Permiso: ", resultado);
            if(resultado === "granted"){
                new Notification("Hola, si tenemos permisos")
            }
        })
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const welcomeMessage = document.getElementById('welcomeMessage');

    try {
        // URL de ipapi para obtener información de ubicación
        const url = `https://ipapi.co/json/`;

        // Realiza la solicitud a ipapi
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.country_name) {
            // Extrae el país del usuario
            const country = data.country_name;

            // Muestra el mensaje personalizado
            welcomeMessage.textContent = `Bienvenido habitante de ${country}`;
        } else {
            welcomeMessage.textContent = "No se pudo determinar tu nacionalidad.";
        }
    } catch (error) {
        console.error('Error al obtener la información de ubicación:', error);
        welcomeMessage.textContent = "No se pudo determinar tu nacionalidad.";
    }
});
