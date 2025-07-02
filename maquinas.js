// ... (resto igual) ...

function cargarMaquinasListado() {
    fetch('data/maquinas-datos.json')
        .then(res => res.json())
        .then(maquinasOriginales => {
            const maquinasNuevas = getLocalMaquinas();
            const maquinas = maquinasOriginales.concat(maquinasNuevas);

            const lista = document.getElementById('lista-maquinas');
            const searchInput = document.getElementById('search-maquina');
            const ubicacionSelect = document.getElementById('ubicacion-select');

            function renderMaquinas() {
                const filtro = searchInput ? searchInput.value.toLowerCase() : '';
                const filtroUbicacion = ubicacionSelect ? ubicacionSelect.value : '';
                let filtradas = maquinas.filter(m =>
                    (!filtro || m.nombre.toLowerCase().includes(filtro)) &&
                    (!filtroUbicacion || (Array.isArray(m.mantenimientos) && m.mantenimientos.some(mtto => mtto.ubicacion === filtroUbicacion)))
                );

                lista.innerHTML = '';
                if (filtradas.length === 0) {
                    lista.innerHTML = '<p>No hay máquinas que coincidan con la búsqueda.</p>';
                    return;
                }
                filtradas.forEach(maquina => {
                    // Último mantenimiento
                    const todosMttos = (maquina.mantenimientos || []).concat(getLocalMantenimientos(maquina.id));
                    const ultimoMtto = todosMttos.length > 0 ? todosMttos[todosMttos.length - 1] : null;
                    // Toda la tarjeta es clickeable
                    lista.innerHTML += `
<a href="maquina-historial-detalle.html?id=${maquina.id}" class="formato-mantenimiento clickable-maquina" style="text-decoration:none;color:inherit;">
  <h3>${maquina.nombre}</h3>
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <div>
      <strong>ID:</strong> ${maquina.id}<br>
      <strong>Última ubicación:</strong> ${ultimoMtto ? (ultimoMtto.ubicacion || '') : ''}<br>
      <strong>Último trabajo:</strong> ${ultimoMtto ? (ultimoMtto.trabajo || '') : ''}<br>
      <strong>Última fecha:</strong> ${ultimoMtto ? (ultimoMtto.fecha || '') : ''}<br>
    </div>
    <div>
      ${maquina.qr ? `<img src="qr/${maquina.qr}" alt="QR" class="qr-img">` : ''}
    </div>
  </div>
  <div style="margin-top:0.8em;">
    <span class="acciones-historial button">Ver historial detallado</span>
  </div>
</a>
                    `;
                });
            }

            // Llenar selector de ubicaciones
            if (ubicacionSelect) {
                let ubicacionesSet = new Set();
                maquinas.forEach(m => (m.mantenimientos || []).concat(getLocalMantenimientos(m.id)).forEach(mtto => mtto.ubicacion && ubicacionesSet.add(mtto.ubicacion)));
                ubicacionSelect.innerHTML = `<option value="">Todas las ubicaciones</option>`;
                [...ubicacionesSet].sort().forEach(ubic => {
                    ubicacionSelect.innerHTML += `<option value="${ubic}">${ubic}</option>`;
                });
            }

            if (searchInput) searchInput.addEventListener('input', renderMaquinas);
            if (ubicacionSelect) ubicacionSelect.addEventListener('change', renderMaquinas);

            renderMaquinas();
        })
        .catch(() => {
            const lista = document.getElementById('lista-maquinas');
            if (lista) lista.innerHTML = '<p>Error al cargar los datos de máquinas.</p>';
        });
}
