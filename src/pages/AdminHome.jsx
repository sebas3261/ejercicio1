// src/pages/AdminHome.jsx
import React, { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  increment
} from "firebase/firestore";
import { db } from "../firebase";
import "../css/AdminHome.css";
import TopImg from '../components/TopImg';
import Header from '../components/Header';
import { NavLink } from "react-router";

export default function AdminHome() {
  const [usuarios, setUsuarios] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingData, setEditingData] = useState({});

  // Helper para calcular meses completos entre dos fechas
  const monthsBetween = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    let months = (e.getFullYear() - s.getFullYear()) * 12;
    months += e.getMonth() - s.getMonth();
    if (e.getDate() < s.getDate()) months--;
    return Math.max(months, 0);
  };

  useEffect(() => {
    const fetchAndCharge = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const now = new Date();
        const MENSUALIDAD = 400;
        const updatedUsers = [];

        // Procesamos cada usuario
        for (const docSnap of snapshot.docs) {
          const u = { id: docSnap.id, ...docSnap.data() };
          // Sólo usuarios no-admin y autenticados que tengan fechaInscripcion
          if (
            u.type !== "admin" &&
            u.isAuthenticated &&
            u.fechaInscripcion
          ) {
            const meses = monthsBetween(u.fechaInscripcion, now);
            if (meses >= 1) {
              // Cobrar mensualidad * meses
              const nuevaFecha = new Date(u.fechaInscripcion);
              nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);

              const userRef = doc(db, "users", u.id);
              await updateDoc(userRef, {
                montoMatricula: increment(MENSUALIDAD * meses),
                fechaInscripcion: nuevaFecha.toLocaleString(),
              });

              // Reflejamos en el objeto local
              u.montoMatricula = (u.montoMatricula || 0) + MENSUALIDAD * meses;
              u.fechaInscripcion = nuevaFecha.toLocaleString();
            }
          }
          updatedUsers.push(u);
        }

        setUsuarios(updatedUsers);
      } catch (error) {
        console.error("Error al cargar/cobrar usuarios:", error);
      }
    };

    fetchAndCharge();
  }, []);

  // Autenticar usuario
  const handleAuth = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const fechaInscripcion = new Date().toLocaleString();

      await updateDoc(userRef, {
        isAuthenticated: true,
        montoMatricula: 400,
        fechaInscripcion: fechaInscripcion,
      });

      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === uid
            ? { ...u, isAuthenticated: true, montoMatricula: 400, fechaInscripcion }
            : u
        )
      );

      alert("Usuario autenticado y matrícula inicial cobrada.");
    } catch (error) {
      console.error("Error al autenticar:", error);
      alert("Hubo un error al autenticar el usuario.");
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      alert("Usuario eliminado.");
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Hubo un error al eliminar el usuario.");
    }
  };

  // Editar usuario
  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditingData({
      name: user.name,
      apellido: user.apellido,
      telefono: user.telefono,
      email: user.email
      // no tocamos montoMensualidad ni fechaInscripcion aquí
    });
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSaveEdit = async () => {
    try {
      const userRef = doc(db, "users", editingUserId);
      const snapshot = await getDoc(userRef);
      if (!snapshot.exists()) throw new Error("Usuario no existe");

      const current = snapshot.data();
      const merged = {
        ...current,
        ...editingData,
        montoMensualidad: current.montoMensualidad ?? 0,
        fechaInscripcion: current.fechaInscripcion
      };

      await updateDoc(userRef, merged);

      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === editingUserId ? { ...merged, id: u.id } : u
        )
      );
      setEditingUserId(null);
    } catch (error) {
      console.error("Error al guardar edición:", error);
    }
  };
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingData({});
  };

  return (
    <div className='Admin-background'>
      <Header type="admin" />
      <TopImg number={6} />
      <h2 className='Admin-title'>Administrar miembros</h2>
      <div className='Admin-card'>
        <table className="Users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Autenticado</th>
              <th>Matrícula</th>
              <th>Fecha Inscripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id}>
                {editingUserId === user.id ? (
                  <>
                    <td><input name="name" value={editingData.name} onChange={handleInputChange} /></td>
                    <td><input name="apellido" value={editingData.apellido} onChange={handleInputChange} /></td>
                    <td><input name="telefono" value={editingData.telefono} onChange={handleInputChange} /></td>
                    <td><input name="email" value={editingData.email} onChange={handleInputChange} /></td>
                    <td colSpan={4}>
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
                    <td>{user.isAuthenticated ? "✅" : "❌"}</td>
                    <td>{user.montoMatricula ?? 0}</td>
                    <td>{user.fechaInscripcion || "-"}</td>
                    <td>
                      <button onClick={() => handleEditClick(user)}>Editar</button>
                      <button
                        onClick={() => handleAuth(user.id)}
                        disabled={user.isAuthenticated}
                      >
                        Autenticar
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)}>Borrar</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <NavLink to="/signup" className="navlink">
        <button className='Add-button'>Crear nuevo miembro</button>
      </NavLink>
    </div>
  );
}
