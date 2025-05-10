import React, { useEffect,  useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { connect, sendMessage, disconnect } from './../../../components/socket';

const Menu = ({ userData, onLogout }) => {
  const [notificaciones, setNotificaciones] = useState([]);

useEffect(() => {
    const handleMessage = (data) => {
      if (data) {
        setNotificaciones((prev) => [data, ...prev]);
      }
    };

    connect(handleMessage);
    return () => {
      disconnect();
    };
  }, []);
 
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Prueba Desarrollador FullStack</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menuNavbar"
          aria-controls="menuNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="menuNavbar">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/asignar-tareas">Asignar Tareas</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/tareas-asignadas">Tareas Asignadas</NavLink>
            </li>
         
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle text-warning"
                href="#!"
                id="notiDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                🔔 Notificaciones ({notificaciones.length})
              </a>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notiDropdown">
                {notificaciones.length === 0 ? (
                  <li className="dropdown-item text-muted">Sin notificaciones</li>
                ) : (
                  notificaciones.map((n, i) => (
                    
                    <li key={i} className="dropdown-item">{n.message}</li>
                  ))
                )}
              </ul>
            </li>

   
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle d-flex align-items-center"
                href="#!"
                id="userDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-person-circle me-2"></i>
                {userData?.name || userData?.email || 'Usuario'}
              </a>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li>
                  <button className="dropdown-item" onClick={onLogout}>
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Menu;
