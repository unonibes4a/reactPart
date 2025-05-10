import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Login.css';

function Login({ setIsAuthenticated, setUserData }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    
    if (!credentials.email) {
      errors.email = 'Email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = 'Email no válido';
    }
    
    if (!credentials.password) {
      errors.password = 'Contraseña es requerida';
    } else if (credentials.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:9090/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Credenciales incorrectas');
      }

 
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        roles: data.roles
      }));
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', credentials.email);
      }
      
    
      setIsAuthenticated(true);
      setUserData(data);
      
 
      navigate('/');
      
    } catch (error) {
      console.error('Error en login:', error);
      setError({
        message: error.message || 'Error al iniciar sesión. Verifica tus credenciales y que el backend esté funcionando.',
        key: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login con ${provider}`);
    // Implementación real iría aquí
  };

  return (
    <div className="cl-panel-login">
      <div className="cl-bg">
        <video
          src="https://media.istockphoto.com/id/1453963806/video/time-lapse-low-angle-of-tall-corporate-buildings-skyscraper-with-reflection-of-clouds-among.mp4?s=mp4-640x640-is&k=20&c=RIpYsVqpNXm-KOaMcpsMY80maM3p2SyEbjTTMxTqzz8="
          aria-label="Time lapse of corporate buildings"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
      
      <div className="cl-content-log">
        <form className="form" onSubmit={handleSubmit}>
          <div className="flex-column">
            <label>Email</label>
          </div>
          <div className={`inputForm ${validationErrors.email ? 'error' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 32 32" height="20">
              <g data-name="Layer 3" id="Layer_3">
                <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path>
              </g>
            </svg>
            <input
              placeholder="Ingresa tu Email"
              className="input"
              type="text"
              name="email"
              value={credentials.email}
              onChange={handleChange}
            />
          </div>
          {validationErrors.email && <div className="error-message">{validationErrors.email}</div>}
          
          <div className="flex-column">
            <label>Contraseña</label>
          </div>
          <div className={`inputForm ${validationErrors.password ? 'error' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="-64 0 512 512" height="20">
              <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
              <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
            </svg>
            <input
              placeholder="Ingresa tu Contraseña"
              className="input"
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
            />
          </div>
          {validationErrors.password && <div className="error-message">{validationErrors.password}</div>}
          
          <div className="flex-row">
            <div>
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label>Recordarme</label>
            </div>
            <span className="span">¿Olvidaste tu contraseña?</span>
          </div>
          
          <button 
            className="button-submit" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading"></span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
          
          {error && <div key={error.key} className="error-message">{error.message}</div>}
          
          <p className="p">¿No tienes una cuenta? <span className="span" onClick={() => navigate('/register')}>Regístrate</span></p>
          <p className="p line">O inicia sesión con</p>
          
          <div className="flex-row">
            <button 
              className="btn google" 
              type="button"
              onClick={() => handleSocialLogin('Google')}
            >
              <svg xmlSpace="preserve" style={{enableBackground: "new 0 0 512 512"}} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" id="Layer_1" width="20" version="1.1">
                <path d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256
                  c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456
                  C103.821,274.792,107.225,292.797,113.47,309.408z" style={{fill: "#FBBB00"}}></path>
                <path d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451
                  c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535
                  c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z" style={{fill: "#518EF8"}}></path>
                <path d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512
                  c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771
                  c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z" style={{fill: "#28B446"}}></path>
                <path d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012
                  c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0
                  C318.115,0,375.068,22.126,419.404,58.936z" style={{fill: "#F14336"}}></path>
              </svg>
              Google
            </button>
            
            <button 
              className="btn apple"
              type="button"
              onClick={() => handleSocialLogin('Apple')}
            >
              <svg xmlSpace="preserve" style={{enableBackground: "new 0 0 22.773 22.773"}} viewBox="0 0 22.773 22.773" xmlns="http://www.w3.org/2000/svg" id="Capa_1" width="20" height="20" version="1.1">
                <g>
                  <g>
                    <path d="M15.769,0c0.053,0,0.106,0,0.162,0c0.13,1.606-0.483,2.806-1.228,3.675c-0.731,0.863-1.732,1.7-3.351,1.573 c-0.108-1.583,0.506-2.694,1.25-3.561C13.292,0.879,14.557,0.16,15.769,0z"></path>
                    <path d="M20.67,16.716c0,0.016,0,0.03,0,0.045c-0.455,1.378-1.104,2.559-1.896,3.655c-0.723,0.995-1.609,2.334-3.191,2.334 c-1.367,0-2.275-0.879-3.676-0.903c-1.482-0.024-2.297,0.735-3.652,0.926c-0.155,0-0.31,0-0.462,0 c-0.995-0.144-1.798-0.932-2.383-1.642c-1.725-2.098-3.058-4.808-3.306-8.276c0-0.34,0-0.679,0-1.019 c0.105-2.482,1.311-4.5,2.914-5.478c0.846-0.52,2.009-0.963,3.304-0.765c0.555,0.086,1.122,0.276,1.619,0.464 c0.471,0.181,1.06,0.502,1.618,0.485c0.378-0.011,0.754-0.208,1.135-0.347c1.116-0.403,2.21-0.865,3.652-0.648 c1.733,0.262,2.963,1.032,3.723,2.22c-1.466,0.933-2.625,2.339-2.427,4.74C17.818,14.688,19.086,15.964,20.67,16.716z"></path>
                  </g>
                </g>
              </svg>
              Apple
            </button>
          </div>
        </form>
      </div>

      <div className='cl-extra'>@ copyright Giovanni</div>
    </div>
  );
}

export default Login;