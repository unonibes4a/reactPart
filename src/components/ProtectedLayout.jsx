// components/ProtectedLayout.jsx
import React from 'react';
import Menu from './subComponentes/menu/Menu';
import Content from './content/Content';

const ProtectedLayout = ({ onLogout, children }) => {
    const userData = JSON.parse(localStorage.getItem('userData'));
  return (
    <>
      <Menu userData={userData}  onLogout={onLogout}/>
      <Content userData={userData} onLogout={onLogout}>
        {children}
      </Content>
    </>
  );
};

export default ProtectedLayout;
