import { useState,useEffect } from 'react';
import TableData from '../tables/TableData';
import API from '../../services/api';
import ResponsableSelectorModal from '../responsable/responsable';
const formatearFecha = (fechaISO) => {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-CO');  
};

const traducirEstadoInverso = (estado) => {
  switch (estado) {
    case "Pendiente":
      return "PENDING";
    case "En progreso":
      return "IN_PROGRESS";
    case "Completado":
      return "COMPLETED";
    default:
      return estado;
  }
};



const traducirEstado = (estado) => {
  switch (estado) {
    case "PENDING":
      return "Pendiente";
    case "IN_PROGRESS":
      return "En progreso";
    case "COMPLETED":
      return "Completado";
    default:
      return estado;
  }
};

const transformarTarea = (task) => {
  return {
    id: task.id,
    nombre: task.title,
    prioridad: "Alta",  
    estado: traducirEstado(task.status),
    responsable: task.assignedUser?.name || "Sin asignar",
    assignedUser: task.assignedUser,
    fechaLimite: formatearFecha(task.lastModified), 
    descripcion: task.description,
    esColumna: {
      id: true,
      nombre: true,
      prioridad: true,
      estado: true,
      responsable: true,
      assignedUser:false,
      fechaLimite: true,
      descripcion: false,
      esColumna: false
    }
  }
};

const transformarTareas = (tareas) => {
  return tareas.map(task => ({
    id: task.id,
    nombre: task.title,
    prioridad: "Alta",  
    estado: traducirEstado(task.status),
    responsable: task.assignedUser?.name || "Sin asignar",
    assignedUser: task.assignedUser,
    fechaLimite: formatearFecha(task.lastModified),  
    descripcion: task.description,
    esColumna: {
      id: true,
      nombre: true,
      prioridad: true,
      estado: true,
      responsable: true,
      assignedUser:false,
      fechaLimite: true,
      descripcion: false,
      esColumna: false
    }
  }));
};


function DatacenterTaskManager({assigned}) {
  console.log("asignacion ", assigned);
  const [tareas, setTareas] = useState([]);
  const loadTasks = async () => {
    try {
      
      const res = await API.get(!assigned?'/tasks/mine' : '/tasks/assigned');
      if(res.data && res.data.length > 0){
      
        const tareasTransformadas = transformarTareas(res.data);
       
        setTareas(tareasTransformadas);
      }else{
      
        setTareas([]);
      }
 
    } catch (err) {
      console.error(err);
    }
  };

  
 

 
  const [selectedTask, setSelectedTask] = useState(null);
  
 
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');  

 
  const handleView = (task) => {
    console.log("Visualizando tarea:", task);
    setSelectedTask(task);
    setModalType('view');
    setShowModal(true);
  };

 
  const handleEdit = (task) => {
    console.log("Editando tarea:", task);
    setSelectedTask(task);
    setModalType('edit');
    setShowModal(true);
  };

 
  const handleDelete = (task) => {
    console.log("Eliminando tarea:", task);
    setSelectedTask(task);
    setModalType('delete');
    setShowModal(true);
  };

 
  const handleAdd = () => {
    console.log("Añadiendo nueva tarea");
    setSelectedTask(null);
    setModalType('add');
    setShowModal(true);
  };

 
  const confirmDelete = async () => {
    if (selectedTask) {
      await API.delete(`/tasks/${selectedTask.id}`);
      setShowModal(false);
      await loadTasks();
    }
  };

 
  const saveTask = async (taskData) => {
    if (modalType === 'edit' && selectedTask) {

      await API.put(`/tasks/${selectedTask.id}`, {
        title: taskData.nombre,
        description: taskData.descripcion,
        status: traducirEstadoInverso(taskData.estado),
        assignedUserId: taskData.assignedUser.id
      });
 
      const newTareas = tareas.map(t => 
        t.id === selectedTask.id ? { ...t, ...taskData } : t
      );
      setTareas(newTareas);
    } else if (modalType === 'add') {
      
 
      const res= await API.post(`/tasks`, {
        title: taskData.nombre,
        description: taskData.descripcion,
        status: traducirEstadoInverso(taskData.estado),
        assignedUserId: taskData.assignedUserId
      });
      const newTask =transformarTarea(res.data);
      
      setTareas([...tareas, newTask]);
    }
    setShowModal(false);
  };

 
  const renderModal = () => {
    if (!showModal) return null;

 
    const modalStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    };

    const modalContentStyle = {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '5px',
      width: '500px',
      maxWidth: '90%'
    };

    switch (modalType) {
      case 'view':
        return (
          <div style={modalStyle} onClick={() => setShowModal(false)}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
              <h2>Detalles de la Tarea</h2>
              {selectedTask && (
                <div>
                  <p><strong>ID:</strong> {selectedTask.id}</p>
                  <p><strong>Nombre:</strong> {selectedTask.nombre}</p>
                  <p><strong>Prioridad:</strong> {selectedTask.prioridad}</p>
                  <p><strong>Estado:</strong> {selectedTask.estado}</p>
                  <p><strong>Responsable:</strong> {selectedTask.responsable}</p>
                  <p><strong>Fecha Límite:</strong> {selectedTask.fechaLimite}</p>
                  <p><strong>Descripción:</strong> {selectedTask.descripcion}</p>
                </div>
              )}
              <button onClick={() => setShowModal(false)}>Cerrar</button>
            </div>
          </div>
        );
      
      case 'delete':
        return (
          <div style={modalStyle} onClick={() => setShowModal(false)}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
              <h2>Confirmar Eliminación</h2>
              <p>¿Estás seguro de que deseas eliminar la tarea "{selectedTask?.nombre}"?</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button onClick={() => setShowModal(false)}>Cancelar</button>
                <button 
                  onClick={confirmDelete} 
                  style={{ backgroundColor: '#e53e3e', color: 'white' }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'edit':
      case 'add':
        return (
          <TaskForm 
            task={selectedTask}
            onSave={saveTask}
            onCancel={() => setShowModal(false)}
            isNew={modalType === 'add'}
          />
        );
      
      default:
        return null;
    }
  };

  useEffect(() => {
    loadTasks();
  }, [assigned]);

  return (
    <>
      <div className="container">
        <h1>Gestión de Tareas</h1>
        <TableData 
          data={tareas} 
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
        {renderModal()}
      </div>
    </>
  );
}

 
function TaskForm({ task, onSave, onCancel, isNew }) {

  const [showSelector, setShowSelector] = useState(false);

  const [formData, setFormData] = useState(
    isNew 
      ? {
          nombre: "",
          prioridad: "Media",
          estado: "Pendiente",
          responsable: "",
          fechaLimite: new Date().toLocaleDateString(),
          descripcion: ""
        } 
      : { ...task }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

 
  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    width: '500px',
    maxWidth: '90%'
  };

  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '8px',
    marginBottom: '15px',
    borderRadius: '4px',
    border: '1px solid #ddd'
  };

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <h2>{isNew ? 'Añadir Tarea' : 'Editar Tarea'}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nombre">Nombre de la tarea:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre || ''}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
          
          <div>
            <label htmlFor="prioridad">Prioridad:</label>
            <select
              id="prioridad"
              name="prioridad"
              value={formData.prioridad || 'Media'}
              onChange={handleChange}
              style={inputStyle}
              required
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="estado">Estado:</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado || 'Pendiente'}
              onChange={handleChange}
              style={inputStyle}
              required
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
              <option value="En revisión">En revisión</option>
              <option value="Bloqueada">Bloqueada</option>
              <option value="Completada">Completada</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="responsable">Responsable:</label>
                    <input
            type="text"
            id="responsable"
            name="responsable"
            value={formData.responsable || ''}
            readOnly
            onClick={() => setShowSelector(true)}
            style={{ ...inputStyle, cursor: 'pointer', backgroundColor: '#f0f0f0' }}
            placeholder="Selecciona un responsable"
            required
          />
          </div>
          <div>
            <label htmlFor="fechaLimite">Fecha Límite:</label>
            <input
              type="text"
              id="fechaLimite"
              name="fechaLimite"
              value={formData.fechaLimite || ''}
              onChange={handleChange}
              style={inputStyle}
              required
              placeholder="DD/MM/AAAA"
            />
          </div>
          
          <div>
            <label htmlFor="descripcion">Descripción:</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion || ''}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '100px'}}
              required
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <button type="button" onClick={onCancel}>Cancelar</button>
            <button 
              type="submit" 
              style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px' }}
            >
              {isNew ? 'Crear Tarea' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
      {showSelector && (
  <ResponsableSelectorModal
    onSelect={(usuario) => {console.log("selecc ",usuario); setFormData({ ...formData, responsable: usuario.name ,assignedUserId:usuario.id})}}
    onClose={() => setShowSelector(false)}
  />
)}
    </div>


  );
}

export default DatacenterTaskManager;