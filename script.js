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
const buscadorApto = document.getElementById('buscadorApto');

let editandoId = null;
let registrosActuales = [];

buscadorApto.addEventListener('input', () => renderTabla(registrosActuales));

function safeCell(v) {
    if (typeof v !== 'string') return v;
    return /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}

document.getElementById('btnDescargar').addEventListener('click', () => {
    if (registrosActuales.length === 0) {
        alert('No hay registros para descargar.');
        return;
    }
    const filas = registrosActuales.map(({ data: p }) => ({
        'Nombre':        safeCell([p.nombre, p.apellido].filter(Boolean).join(' ')),
        'Edad':          p.edad ?? '',
        'Apartamento':   safeCell(p.apartamento ?? ''),
        'Estado':        safeCell(p.status ?? ''),
        'Teléfono':      safeCell(p.telefono ?? ''),
        'Observaciones': safeCell(p.observaciones ?? ''),
        'Fecha Registro': p.fechaRegistro?.toDate
            ? p.fechaRegistro.toDate().toLocaleDateString('es-VE')
            : '',
    }));
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Residentes');
    XLSX.writeFile(libro, 'residentes.xlsx');
});

const statusClasses = {
    'CON VIDA':     'bg-green-100 text-green-800',
    'DESAPARECIDA': 'bg-yellow-100 text-yellow-800',
    'FALLECIDA':    'bg-red-100 text-red-800',
};

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const edadVal = document.getElementById('edad').value;
    try {
        await addDoc(usuariosColeccion, {
            nombre: document.getElementById('nombre').value,
            edad: edadVal ? Number(edadVal) : null,
            apartamento: document.getElementById('apartamento').value,
            status: document.getElementById('status').value,
            telefono: document.getElementById('telefono').value || '',
            observaciones: document.getElementById('observaciones').value || '',
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
    const edadVal = document.getElementById('editEdad').value;
    try {
        await updateDoc(doc(db, "residentes", editandoId), {
            nombre: document.getElementById('editNombre').value,
            edad: edadVal ? Number(edadVal) : null,
            apartamento: document.getElementById('editApartamento').value,
            status: document.getElementById('editStatus').value,
            telefono: document.getElementById('editTelefono').value || '',
            observaciones: document.getElementById('editObservaciones').value || '',
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
    // Compatibilidad con registros viejos que tienen nombre + apellido separados
    const nombreCompleto = [persona.nombre, persona.apellido].filter(Boolean).join(' ');
    document.getElementById('editNombre').value = nombreCompleto;
    document.getElementById('editEdad').value = persona.edad ?? '';
    document.getElementById('editApartamento').value = persona.apartamento ?? '';
    document.getElementById('editStatus').value = persona.status ?? 'CON VIDA';
    document.getElementById('editTelefono').value = persona.telefono ?? '';
    document.getElementById('editObservaciones').value = persona.observaciones ?? '';
    modalOverlay.classList.remove('hidden');
}

function cerrarModal() {
    editandoId = null;
    modalOverlay.classList.add('hidden');
    editForm.reset();
}

function renderTabla(docs) {
    const filtro = buscadorApto.value.trim().toLowerCase();
    tabla.innerHTML = '';

    const filtrados = docs.filter(({ data: p }) =>
        !filtro || (p.apartamento ?? '').toLowerCase().includes(filtro)
    );

    filtrados.sort((a, b) => {
        const aptoA = (a.data.apartamento ?? '').toString();
        const aptoB = (b.data.apartamento ?? '').toString();
        const numA = parseFloat(aptoA);
        const numB = parseFloat(aptoB);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return aptoA.localeCompare(aptoB);
    });

    filtrados.forEach(({ id, data: persona }) => {
        const fila = document.createElement('tr');
        fila.className = 'hover:bg-gray-50';

        const tdApto = document.createElement('td');
        tdApto.className = 'px-4 py-3 text-gray-800 font-semibold';
        tdApto.textContent = persona.apartamento ?? '';
        fila.appendChild(tdApto);

        const tdNombre = document.createElement('td');
        tdNombre.className = 'px-4 py-3 text-gray-800';
        tdNombre.textContent = [persona.nombre, persona.apellido].filter(Boolean).join(' ');
        fila.appendChild(tdNombre);

        const tdEdad = document.createElement('td');
        tdEdad.className = 'px-4 py-3 text-gray-600 hidden sm:table-cell';
        tdEdad.textContent = persona.edad ?? '—';
        fila.appendChild(tdEdad);

        const tdTel = document.createElement('td');
        tdTel.className = 'px-4 py-3 text-gray-600 hidden sm:table-cell';
        tdTel.textContent = persona.telefono ?? '—';
        fila.appendChild(tdTel);

        const tdStatus = document.createElement('td');
        tdStatus.className = 'px-4 py-3';
        const badge = document.createElement('span');
        const status = persona.status ?? 'CON VIDA';
        badge.textContent = status;
        badge.className = `inline-block text-xs font-semibold px-2 py-1 rounded-full ${statusClasses[status] ?? 'bg-gray-100 text-gray-700'}`;
        tdStatus.appendChild(badge);
        fila.appendChild(tdStatus);

        const tdAcciones = document.createElement('td');
        tdAcciones.className = 'px-4 py-3';
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.className = 'bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors';
        btnEditar.addEventListener('click', () => abrirModal(id, persona));
        tdAcciones.appendChild(btnEditar);
        fila.appendChild(tdAcciones);

        tabla.appendChild(fila);
    });
}

function actualizarContadores(docs) {
    const conteo = { 'CON VIDA': 0, 'DESAPARECIDA': 0, 'FALLECIDA': 0 };
    docs.forEach(({ data: p }) => {
        const s = p.status ?? 'CON VIDA';
        if (s in conteo) conteo[s]++;
    });
    document.getElementById('cntVida').textContent = conteo['CON VIDA'];
    document.getElementById('cntDesaparecida').textContent = conteo['DESAPARECIDA'];
    document.getElementById('cntFallecida').textContent = conteo['FALLECIDA'];
}

onSnapshot(usuariosColeccion, (snapshot) => {
    registrosActuales = snapshot.docs.map(d => ({ id: d.id, data: d.data() }));
    actualizarContadores(registrosActuales);
    renderTabla(registrosActuales);
});
