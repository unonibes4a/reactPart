import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../login/Login.css';  
import API from '../../services/api';

function Register({ setIsAuthenticated, setUserData }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!formData.name) errs.name = "Nombre requerido";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) errs.email = "Email inválido";
    if (!formData.password || formData.password.length < 6) errs.password = "Contraseña de al menos 6 caracteres";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
        const response = await API.post('/auth/register', {
            ...formData
          });
 
     const data = response.data;
     localStorage.setItem('token', data.token);
     localStorage.setItem('userData', JSON.stringify({
       id: data.id,
       name: data.name,
       email: data.email,
       roles: data.roles
     }));
     
     if (data) {
       localStorage.setItem('rememberedEmail', data.email);
     }
     
 
     setIsAuthenticated(true);
     setUserData(data);
  
     navigate('/');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
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
          <h2>Registro</h2>

          <div className="flex-column">
            <label>Nombre</label>
            <input name="name" type="text" value={formData.name} onChange={handleChange} className="input" />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="flex-column">
            <label>Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} className="input" />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="flex-column">
            <label>Contraseña</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} className="input" />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <button className="button-submit" type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          <p>¿Ya tienes cuenta? <span onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: 'blue' }}>Inicia sesión</span></p>
        </form>
      </div>
      
      <div className='cl-extra'>@ copyright Giovanni</div>
    </div>
  );
}

export default Register;
