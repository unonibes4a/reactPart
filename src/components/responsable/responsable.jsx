import { useEffect, useState } from 'react';

import API from '../../services/api';

function ResponsableSelectorModal({ onSelect, onClose }) {
  const [usuarios, setUsuarios] = useState([]);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
        API.get('/users')
      .then(res => setUsuarios(res.data))
      .catch(err => console.error('Error al cargar usuarios:', err));
  }, []);

  const handleSelect = () => {
    console.log("entro aqui",usuarios,selectedId);
    const usuario = usuarios.find(u => String(u.id)=== selectedId);
    console.log("entro aqui des",usuario,selectedId);
    if (usuario) {
      onSelect(usuario);  
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1001
    }}
    >
      <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 5, width: 400 }}>
        <h3>Seleccionar Responsable</h3>
        <select
          style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">-- Selecciona un usuario --</option>
          {usuarios.map(usuario => (
            <option key={usuario.id} value={usuario.id}>
              {usuario.name}
            </option>
          ))}
        </select>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSelect} style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px' }}>Seleccionar</button>
        </div>
      </div>
    </div>
  );
}
export default ResponsableSelectorModal;