import React, { useEffect, useState } from "react";
import { collection, doc, updateDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "../css/AdminHome.css";
import TopImg from "../components/TopImg";
import Header from "../components/Header";

export default function GestionPagosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [montoMensualidad, setMontoMensualidad] = useState(50);
  const [montoConfirmado, setMontoConfirmado] = useState(null);
  const [montoPago, setMontoPago] = useState({}); // Usar un objeto para manejar el monto de cada usuario

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const data = await getDocs(usersCollection);

        const filteredUsers = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })).filter((user) => user.type !== "admin" && user.type !== "profesor");

        setUsuarios(filteredUsers);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };
    fetchUsers();
  }, []);

  // Establecer monto y sumarlo al monto pendiente del usuario
  const handleSetMonto = async () => {
    try {
      const batchUpdates = usuarios.map(async (user) => {
        const userRef = doc(db, "users", user.id);
        const nuevoMonto = (user.montoMatricula || 0) + montoMensualidad;

        await updateDoc(userRef, {
          montoMatricula: nuevoMonto,
          estadoPago: user.estadoPago || "Pendiente",
        });

        return { ...user, montoMatricula: nuevoMonto, estadoPago: "Pendiente" };
      });

      const updatedUsers = await Promise.all(batchUpdates);
      setUsuarios(updatedUsers);
      setMontoConfirmado(montoMensualidad);
      alert("Monto de la mensualidad actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar el monto:", error.message);
      alert("Hubo un error al establecer el monto.");
    }
  };

  // Simular pago y disminuir el monto adeudado
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
  
      // Vaciar el input después de pagar
      setMontoPago((prev) => ({
        ...prev,
        [uid]: "", // Se vacía el input para ese usuario
      }));
  
      alert("Pago simulado correctamente.");
    } catch (error) {
      console.error("Error al actualizar el pago:", error.message);
      alert("Hubo un error al actualizar el pago.");
    }
  };
  
  // Manejar el cambio del monto de pago individual para cada usuario
  const handleMontoPagoChange = (userId, value) => {
    setMontoPago((prev) => ({
      ...prev,
      [userId]: value, // Establecer el valor para ese usuario específico
    }));
  };

  return (
    <div className="Admin-background">
      <Header type="admin" />
      <TopImg number={6} />
      <h2 className="Admin-title">Gestión de Pagos de Usuarios</h2>

      <div className="Admin-card">
        <label>Monto de la mensualidad:</label>
        <input
          type="number"
          value={montoMensualidad}
          onChange={(e) => setMontoMensualidad(Number(e.target.value))}
        />
        <button onClick={handleSetMonto}>Establecer monto</button>
      </div>

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
                  {user.estadoPago !== "Pagado" && montoConfirmado === null && (
                    <>
                      <input
                        type="number"
                        value={montoPago[user.id] || ""} // Usar el montoPago individual para ese usuario
                        onChange={(e) => handleMontoPagoChange(user.id, Number(e.target.value))}
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


