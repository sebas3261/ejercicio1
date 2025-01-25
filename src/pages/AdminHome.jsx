import React from 'react';
import "../css/AdminHome.css";
import TopImg from '../components/TopImg';
import Header from '../components/Header';

export default function AdminHome() {
  const usuarios= [
    { id: 1, nombre: 'User 1', apellido: 'Descripción 1', telefono: '877689', correo: 'hola@gmail.com' },
    { id: 2, nombre: 'User 1', apellido: 'Descripción 1', telefono: '877689', correo: 'hola@gmail.com' },
    { id: 3, nombre: 'User 1', apellido: 'Descripción 1', telefono: '877689', correo: 'hola@gmail.com' },
    { id: 4, nombre: 'User 1', apellido: 'Descripción 1', telefono: '877689', correo: 'hola@gmail.com' },
  ];
  return (
    <div className='Admin-background'>
      <Header type="admin"/>
      <TopImg number={6}/>
      <div className='Admin-card'>
        <div className='Admin-card-header'>
        <h2 className='Admin-title'>Administrar miembros</h2>
        
      
        <table className="Users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.nombre}</td>
              <td>{user.apellido}</td>
              <td>{user.telefono}</td>
              <td>{user.correo}</td>
              <td>
                <button onClick={() => handleEditUser(user.id)}>Editar</button>
                <button onClick={() => handleDeleteUser(user.id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
     
        
      </div>
      <button className='Add-button' >
          Crear nuevo miembro
        </button>
    </div>
    
  );
}
