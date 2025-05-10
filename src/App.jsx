import "./App.css";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./components/login/Login";
import DatacenterTaskManager from "./components/applyTable/DatacenterTaskManager";
import Register from "./components/login/Register";
import ProtectedLayout from "./components/ProtectedLayout";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userDataFromStorage = localStorage.getItem("userData");

    if (token && userDataFromStorage) {
      setIsAuthenticated(true);
      setUserData(JSON.parse(userDataFromStorage));
      // Verificar si el token está expirado (opcional)
      // Puedes implementar una función para verificar el JWT
    } else {
      // Limpiar datos si no hay token válido
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
    }
  }, []);

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("email");

    // Resetear estados
    setIsAuthenticated(false);
    setUserData(null);

    // Redirigir a login
    navigate("/login");
  };

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login
                setIsAuthenticated={setIsAuthenticated}
                setUserData={setUserData}
              />
            )
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Register
                setIsAuthenticated={setIsAuthenticated}
                setUserData={setUserData}
              />
            )
          }
        />

        {/* Ruta principal protegida */}
        {isAuthenticated && (
          <>
            <Route
              path="/"
              element={
                <ProtectedLayout onLogout={handleLogout}>
                  <DatacenterTaskManager assigned={false} />
                </ProtectedLayout>
              }
            />
            <Route
              path="/tareas-asignadas"
              element={
                <ProtectedLayout onLogout={handleLogout}>
                  <DatacenterTaskManager assigned={true} />
                </ProtectedLayout>
              }
            />
          </>
        )}

        {/* Redirección para rutas no existentes */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
        />
      </Routes>
    </>
  );
}

export default App;
