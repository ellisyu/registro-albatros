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

const statusClasses = {
    'CON VIDA':    'bg-green-100 text-green-800',
    'DESAPARECIDA': 'bg-yellow-100 text-yellow-800',
    'FALLECIDA':   'bg-red-100 text-red-800',
};

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

onSnapshot(usuariosColeccion, (snapshot) => {
    tabla.innerHTML = '';
    snapshot.forEach((documento) => {
        const persona = documento.data();
        const fila = document.createElement('tr');
        fila.className = 'hover:bg-gray-50';

        // Nombre, Apellido (siempre visibles)
        for (const v of [persona.nombre, persona.apellido]) {
            const td = document.createElement('td');
            td.className = 'px-4 py-3 text-gray-800';
            td.textContent = v ?? '';
            fila.appendChild(td);
        }

        // Edad, Apartamento (ocultos en móvil)
        for (const v of [persona.edad, persona.apartamento]) {
            const td = document.createElement('td');
            td.className = 'px-4 py-3 text-gray-600 hidden sm:table-cell';
            td.textContent = v ?? '';
            fila.appendChild(td);
        }

        // Badge de estado
        const tdStatus = document.createElement('td');
        tdStatus.className = 'px-4 py-3';
        const badge = document.createElement('span');
        const status = persona.status ?? 'CON VIDA';
        badge.textContent = status;
        badge.className = `inline-block text-xs font-semibold px-2 py-1 rounded-full ${statusClasses[status] ?? 'bg-gray-100 text-gray-700'}`;
        tdStatus.appendChild(badge);
        fila.appendChild(tdStatus);

        // Botón editar
        const tdAcciones = document.createElement('td');
        tdAcciones.className = 'px-4 py-3';
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.className = 'bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors';
        btnEditar.addEventListener('click', () => abrirModal(documento.id, persona));
        tdAcciones.appendChild(btnEditar);
        fila.appendChild(tdAcciones);

        tabla.appendChild(fila);
    });
});
