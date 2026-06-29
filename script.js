import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBkhjhgWfaGw70ReOshWIcS8-nWUD7b-mo",
    authDomain: "registro-residentes-c3893.firebaseapp.com",
    projectId: "registro-residentes-c3893",
    storageBucket: "registro-residentes-c3893.firebasestorage.app",
    messagingSenderId: "123707902514",
    appId: "1:123707902514:web:14541f9f1614e65e474a2b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const usuariosColeccion = collection(db, "residentes");

const form = document.getElementById('registroForm');
const tabla = document.getElementById('tablaPersonas');
const modalOverlay = document.getElementById('modalOverlay');
const editForm = document.getElementById('editForm');
const cancelarEdicion = document.getElementById('cancelarEdicion');

let editandoId = null;

// Registrar persona
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
        await addDoc(usuariosColeccion, {
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            edad: Number(document.getElementById('edad').value),
            apartamento: document.getElementById('apartamento').value,
            status: document.getElementById('status').value,
            fechaRegistro: new Date()
        });
        form.reset();
        document.getElementById('status').value = '';
    } catch (error) {
        console.error("Error al guardar: ", error);
        alert("Hubo un error al registrar.");
    }
});

// Guardar edición
editForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!editandoId) return;
    try {
        await updateDoc(doc(db, "residentes", editandoId), {
            nombre: document.getElementById('editNombre').value,
            apellido: document.getElementById('editApellido').value,
            edad: Number(document.getElementById('editEdad').value),
            apartamento: document.getElementById('editApartamento').value,
            status: document.getElementById('editStatus').value,
        });
        cerrarModal();
    } catch (error) {
        console.error("Error al actualizar: ", error);
        alert("Hubo un error al guardar los cambios.");
    }
});

cancelarEdicion.addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) cerrarModal();
});

function abrirModal(id, persona) {
    editandoId = id;
    document.getElementById('editNombre').value = persona.nombre ?? '';
    document.getElementById('editApellido').value = persona.apellido ?? '';
    document.getElementById('editEdad').value = persona.edad ?? '';
    document.getElementById('editApartamento').value = persona.apartamento ?? '';
    document.getElementById('editStatus').value = persona.status ?? 'CON VIDA';
    modalOverlay.classList.remove('hidden');
}

function cerrarModal() {
    editandoId = null;
    modalOverlay.classList.add('hidden');
    editForm.reset();
}

// Escuchar cambios en tiempo real
onSnapshot(usuariosColeccion, (snapshot) => {
    tabla.innerHTML = '';
    snapshot.forEach((documento) => {
        const persona = documento.data();
        const fila = document.createElement('tr');

        for (const v of [persona.nombre, persona.apellido, persona.edad, persona.apartamento]) {
            const td = document.createElement('td');
            td.textContent = v ?? '';
            fila.appendChild(td);
        }

        // Celda de estado con badge de color
        const tdStatus = document.createElement('td');
        const badge = document.createElement('span');
        badge.textContent = persona.status ?? 'CON VIDA';
        badge.className = 'badge badge-' + (persona.status ?? 'CON VIDA').replace(' ', '-');
        tdStatus.appendChild(badge);
        fila.appendChild(tdStatus);

        // Botón editar
        const tdAcciones = document.createElement('td');
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.className = 'btn-editar';
        btnEditar.addEventListener('click', () => abrirModal(documento.id, persona));
        tdAcciones.appendChild(btnEditar);
        fila.appendChild(tdAcciones);

        tabla.appendChild(fila);
    });
});
