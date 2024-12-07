if ( navigator.serviceWorker ) {
    navigator.serviceWorker.register("/sw.js");
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