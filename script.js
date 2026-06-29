// Importar las funciones necesarias de los servidores de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// CONFIGURACIÓN DE TU JUEGO DE CLAVES (Pega aquí lo que copiaste en el Paso 1)
const firebaseConfig = {
    apiKey: "AIzaSyBkhjhgWfaGw70ReOshWIcS8-nWUD7b-mo",
    authDomain: "registro-residentes-c3893.firebaseapp.com",
    projectId: "registro-residentes-c3893",
    storageBucket: "registro-residentes-c3893.firebasestorage.app",
    messagingSenderId: "123707902514",
    appId: "1:123707902514:web:14541f9f1614e65e474a2b"
};

// Inicializar Firebase y la Base de Datos
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencia a la colección (tabla) en la base de datos
const usuariosColeccion = collection(db, "residentes");

// Capturar elementos del HTML
const form = document.getElementById('registroForm');
const tabla = document.getElementById('tablaPersonas');

// 1. ESCUCHAR EL FORMULARIO (Guardar datos en Firebase)
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const edad = document.getElementById('edad').value;
    const apartamento = document.getElementById('apartamento').value;

    try {
        // Enviar objeto a la base de datos
        await addDoc(usuariosColeccion, {
            nombre: nombre,
            apellido: apellido,
            edad: Number(edad),
            apartamento: apartamento,
            fechaRegistro: new Date() // Opcional, para saber cuándo se creó
        });
        
        form.reset(); // Limpiar el formulario si se guardó con éxito
    } catch (error) {
        console.error("Error al guardar en la base de datos: ", error);
        alert("Hubo un error al registrar.");
    }
});

// 2. ESCUCHAR CAMBIOS EN TIEMPO REAL (Traer datos de Firebase)
// onSnapshot se ejecuta automáticamente la primera vez y CADA VEZ que alguien agregue un dato
onSnapshot(usuariosColeccion, (snapshot) => {
    tabla.innerHTML = ''; // Limpiar tabla antes de redibujar

    snapshot.forEach((doc) => {
        const persona = doc.data();
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${persona.nombre}</td>
            <td>${persona.apellido}</td>
            <td>${persona.edad}</td>
            <td>${persona.apartamento}</td>
        `;
        tabla.appendChild(fila);
    });
});