// src/pages/GestionPagosAdmin.jsx
import React, { useEffect, useState } from "react";
import { collection, doc, updateDoc, getDocs, increment } from "firebase/firestore";
import { db } from "../firebase";
import "../css/AdminHome.css";
import TopImg from "../components/TopImg";
import Header from "../components/Header";

export default function GestionPagosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [montoPago, setMontoPago] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getDocs(collection(db, "users"));
        const filtered = data.docs
          .map(d => {
            const u = { id: d.id, ...d.data() };
            // Derivamos estado de pago
            u.estadoPago = (u.montoMatricula || 0) > 0 ? "Pendiente" : "Pagado";
            return u;
          })
          .filter(u => u.type !== "admin" && u.type !== "profesor");
        setUsuarios(filtered);
      } catch (err) {
        console.error("Error al obtener usuarios:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleSimulatePayment = async (uid) => {
    try {
      const user = usuarios.find(u => u.id === uid);
      if (!user) return;

      const pago = montoPago[uid] || 0;
      if (pago <= 0) {
        alert("Ingresa un monto válido.");
        return;
      }
      if (pago > user.montoMatricula) {
        alert("El monto a pagar no puede superar el monto pendiente.");
        return;
      }

      const nuevoMonto = user.montoMatricula - pago;

      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        montoMatricula: nuevoMonto
      });

      // Refrescar estado local
      setUsuarios(prev =>
        prev.map(u =>
          u.id === uid
            ? { ...u, montoMatricula: nuevoMonto, estadoPago: nuevoMonto > 0 ? "Pendiente" : "Pagado" }
            : u
        )
      );
      setMontoPago(prev => ({ ...prev, [uid]: "" }));
      alert("Pago registrado correctamente.");
    } catch (err) {
      console.error("Error al actualizar el pago:", err);
      alert("Hubo un error al actualizar el pago.");
    }
  };

  const handleMontoPagoChange = (uid, value) => {
    setMontoPago(prev => ({ ...prev, [uid]: value }));
  };

  return (
    <div className="Admin-background">
      <Header type="admin" />
      <TopImg number={6} />
      <h2 className="Admin-title">Gestión de Pagos de Usuarios</h2>

      <div className="Admin-card">
        <table className="Users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Deuda Actual</th>
              <th>Estado de Pago</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.apellido}</td>
                <td>{user.telefono}</td>
                <td>{user.email}</td>
                <td>${user.montoMatricula || 0}</td>
                <td>
                  {user.estadoPago === "Pagado" 
                    ? "✅ Pagado" 
                    : "❌ Pendiente"}
                </td>
                <td>
                  {user.montoMatricula > 0 ? (
                    <>
                      <input
                        type="number"
                        min="1"
                        value={montoPago[user.id] || ""}
                        onChange={e => handleMontoPagoChange(user.id, Number(e.target.value))}
                        placeholder="Monto"
                        style={{ width: "80px" }}
                      />
                      <button onClick={() => handleSimulatePayment(user.id)}>
                        Pagar
                      </button>
                    </>
                  ) : (
                    <span style={{ color: "green" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
