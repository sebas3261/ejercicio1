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

// Calcula meses completos entre dos fechas
const monthsBetween = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  let months = (e.getFullYear() - s.getFullYear()) * 12;
  months += e.getMonth() - s.getMonth();
  if (e.getDate() < s.getDate()) months--;
  return Math.max(months, 0);
};

export default function AdminHome() {
  const [usuarios, setUsuarios] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingData, setEditingData] = useState({});

  // Al montar, carga usuarios y cobra mensualidades si toca
  useEffect(() => {
    const fetchAndCharge = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const now = new Date();
        const MENSUALIDAD = 400;
        const updated = [];

        for (const docSnap of snapshot.docs) {
          const u = { id: docSnap.id, ...docSnap.data() };
          // Solo si es usuario (no admin ni profesor) y autenticado con fechaInscripción
          if (
            u.type === "user" &&
            u.isAuthenticated &&
            u.fechaInscripcion
          ) {
            const meses = monthsBetween(u.fechaInscripcion, now);
            if (meses >= 1) {
              const nuevaFecha = new Date(u.fechaInscripcion);
              nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);
              const userRef = doc(db, "users", u.id);

              // Cobro acumulado
              await updateDoc(userRef, {
                montoMatricula: increment(MENSUALIDAD * meses),
                fechaInscripcion: nuevaFecha.toLocaleString(),
              });

              u.montoMatricula = (u.montoMatricula || 0) + MENSUALIDAD * meses;
              u.fechaInscripcion = nuevaFecha.toLocaleString();
            }
          }
          updated.push(u);
        }
        setUsuarios(updated);
      } catch (err) {
        console.error("Error al cargar/cobrar usuarios:", err);
      }
    };
    fetchAndCharge();
  }, []);

  // Autenticar usuario (cobro inicial solo si es type==="user")
  const handleAuth = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const snapshot = await getDoc(userRef);
      if (!snapshot.exists()) throw new Error("Usuario no existe");

      const u = snapshot.data();
      const fechaInscripcion = new Date().toLocaleString();
      // Preparamos el objeto a actualizar
      const updatePayload = { isAuthenticated: true, fechaInscripcion };

      // Si es usuario, también cobramos matrícula inicial de 400
      if (u.type === "user") {
        updatePayload.montoMatricula = 400;
      }

      await updateDoc(userRef, updatePayload);

      // Actualizar estado local
      setUsuarios(prev =>
        prev.map(user =>
          user.id === uid
            ? { ...user, isAuthenticated: true, ...updatePayload }
            : user
        )
      );

      alert("Usuario autenticado correctamente."
        + (u.type === "user"
          ? " Matrícula inicial cobrada."
          : "")
      );
    } catch (err) {
      console.error("Error al autenticar:", err);
      alert("Hubo un error al autenticar el usuario.");
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      setUsuarios(prev => prev.filter(u => u.id !== id));
      alert("Usuario eliminado.");
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Hubo un error al eliminar el usuario.");
    }
  };

  // Edición inline
  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditingData({
      name: user.name,
      apellido: user.apellido,
      telefono: user.telefono,
      email: user.email,
      type: user.type,                // incluimos el tipo para no perderlo
      fechaInscripcion: user.fechaInscripcion
    });
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingData(prev => ({ ...prev, [name]: value }));
  };
  const handleSaveEdit = async () => {
    try {
      const userRef = doc(db, "users", editingUserId);
      const snapshot = await getDoc(userRef);
      if (!snapshot.exists()) throw new Error("Usuario no existe");

      const current = snapshot.data();
      // Merge manteniendo montoMatricula y solo sobreescribiendo los campos editados
      const merged = {
        ...current,
        ...editingData
      };
      await updateDoc(userRef, merged);

      setUsuarios(prev =>
        prev.map(u =>
          u.id === editingUserId
            ? { ...merged, id: u.id }
            : u
        )
      );
      setEditingUserId(null);
    } catch (err) {
      console.error("Error al guardar edición:", err);
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
              <th>Tipo</th>
              <th>Fecha Inscripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
          {usuarios
            .filter(user => user.type !== "admin") // <-- Aquí filtramos admins
            .map(user => (
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
                    <td>{user.type}</td>
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
