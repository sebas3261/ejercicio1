import React, { useEffect, useState } from "react";
import { collection, doc, updateDoc, getDocs } from "firebase/firestore";
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
        const usersCollection = collection(db, "users");
        const data = await getDocs(usersCollection);

        const filteredUsers = data.docs
          .map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
          .filter((user) => user.type !== "admin" && user.type !== "profesor");

        setUsuarios(filteredUsers);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleSimulatePayment = async (uid, montoPagoInput) => {
  try {
    const user = usuarios.find((u) => u.id === uid);
    if (!user) return;

    if (montoPagoInput > user.montoMatricula) {
      alert("El monto a pagar no puede superar el monto pendiente.");
      return;
    }

    const nuevoMonto = Math.max(0, (user.montoMatricula || 0) - montoPagoInput);
    const nuevoEstado = nuevoMonto === 0 ? "Pagado" : "Pendiente";

    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      montoMatricula: nuevoMonto,
      estadoPago: nuevoEstado,
    });

    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === uid ? { ...u, montoMatricula: nuevoMonto, estadoPago: nuevoEstado } : u
      )
    );

    setMontoPago((prev) => ({
      ...prev,
      [uid]: "",
    }));

    alert("Pago simulado correctamente.");
  } catch (error) {
    console.error("Error al actualizar el pago:", error.message);
    alert("Hubo un error al actualizar el pago.");
  }
};


  const handleMontoPagoChange = (userId, value) => {
    setMontoPago((prev) => ({
      ...prev,
      [userId]: value,
    }));
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
              <th>Monto a Pagar</th>
              <th>Estado de Pago</th>
              <th>Pagos en efectivo</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.apellido}</td>
                <td>{user.telefono}</td>
                <td>{user.email}</td>
                <td>{user.montoMatricula ? `$${user.montoMatricula}` : "0"}</td>
                <td>{user.estadoPago === "Pagado" ? "✅ Pagado" : "❌ Pendiente"}</td>
                <td>
                  {user.estadoPago !== "Pagado" && (
                    <>
                      <input
                        type="number"
                        min="1"
                        pattern="\d+" 
                        value={montoPago[user.id] || ""}
                        onChange={(e) => handleMontoPagoChange(user.id, Number(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e' || e.key === '+' || e.key === 'E') {
                            e.preventDefault(); // bloquea -, e, E, +
                          }
                        }}
                        placeholder={`Monto a pagar de ${user.name}`}
                      />
                      <button onClick={() => handleSimulatePayment(user.id, montoPago[user.id])}>
                        Pagar
                      </button>
                    </>
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
