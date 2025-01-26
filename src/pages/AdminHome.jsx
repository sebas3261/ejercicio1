import React, { useEffect, useState } from 'react';
import { collection, doc, setDoc, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../css/AdminHome.css";
import TopImg from '../components/TopImg';
import Header from '../components/Header';
import { NavLink } from "react-router";

export default function AdminHome() {
  const [usuarios, setUsuarios] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null); 
  const [editingData, setEditingData] = useState({}); 

  
  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, "users");
      const data = await getDocs(usersCollection);
      setUsuarios(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este usuario?");
    
    if (!confirmDelete) {
      return; // Cancelar la eliminación si el usuario no confirma
    }
  
    try {
      const userDoc = doc(db, "users", id);
      await deleteDoc(userDoc);
      setUsuarios((prev) => prev.filter((user) => user.id !== id));
      alert("Usuario eliminado exitosamente.");
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      alert("Hubo un error al intentar eliminar el usuario.");
    }
  };
  // Activar edición de usuario
  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditingData(user);
  };

  // Manejar cambios en los campos de entrada
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({ ...prev, [name]: value }));
  };

  // Guardar cambios en Firestore
  const handleSaveEdit = async () => {
    try {
      const userDoc = doc(db, "users", editingUserId);
      await updateDoc(userDoc, editingData);
      setUsuarios((prev) =>
        prev.map((user) => (user.id === editingUserId ? editingData : user))
      );
      setEditingUserId(null);
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingData({});
  };

  return (
    <div className='Admin-background'>
      <Header type="admin" />
      <TopImg number={6} />
      <div className='Admin-card'>
        <div className='Admin-card-header'>
          <h2 className='Admin-title'>Administrar miembros</h2>
          <table className="Users-table">
            <thead>
              <tr>
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
                  {editingUserId === user.id ? (
                    <>
                      <td>
                        <input
                          name="name"
                          value={editingData.name}
                          onChange={handleInputChange}
                        />
                      </td>
                      <td>
                        <input
                          name="apellido"
                          value={editingData.apellido}
                          onChange={handleInputChange}
                        />
                      </td>
                      <td>
                        <input
                          name="telefono"
                          value={editingData.telefono}
                          onChange={handleInputChange}
                        />
                      </td>
                      <td>
                        <input
                          name="email"
                          value={editingData.email}
                          onChange={handleInputChange}
                        />
                      </td>
                      <td>
                        <button onClick={handleSaveEdit}>Guardar</button>
                        <button onClick={handleCancelEdit}>Cancelar</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{user.name}</td>
                      <td>{user.apellido}</td>
                      <td>{user.telefono}</td>
                      <td>{user.email}</td>
                      <td>
                        <button onClick={() => handleEditClick(user)}>Editar</button>
                        <button onClick={() => handleDeleteUser(user.id)}>Borrar</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <NavLink to={"/signup"} className={"navlink"}>
            <button className='Add-button' >
              Crear nuevo miembro
            </button>
          </NavLink>
        </div>
      </div>
    </div>
  );
}


