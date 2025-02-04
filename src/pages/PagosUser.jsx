import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Asegúrate de importar tu configuración de Firebase
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Header from "../components/Header";
import TopImg from "../components/TopImg";
import "../css/PagosUser.css";

export default function PagosUser() {
  const [metodoPago, setMetodoPago] = useState(null);
  const [montoPago, setMontoPago] = useState("");
  const [montoMatricula, setMontoMatricula] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser?.uid) {
          console.error("No se encontró un UID en localStorage.");
          return;
        }

        setUid(storedUser.uid); // Guardamos el UID para futuras actualizaciones
        const userDocRef = doc(db, "users", storedUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setMontoMatricula(userDoc.data().montoMatricula || 0);
        } else {
          console.error("No se encontró información del usuario en Firestore.");
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleMetodoPagoChange = (event) => {
    setMetodoPago(event.target.value);
    setMontoPago(""); // Reinicia el campo de monto si cambia de método
  };

  const handleMontoChange = (event) => {
    const value = Number(event.target.value);
    if (value > montoMatricula) {
      alert("El monto no puede superar la deuda.");
    } else {
      setMontoPago(value);
    }
    
  };

  const handlePagarTodo = () => {
    setMontoPago(montoMatricula);
  };

  const handlePagar = async () => {
    if (!uid) {
      alert("Error: No se encontró el usuario.");
      return;
    }

    const nuevoMonto = montoMatricula - montoPago;
    if (nuevoMonto < 0) {
      alert("El monto ingresado no puede ser mayor que la deuda.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", uid);
      await updateDoc(userDocRef, { montoMatricula: nuevoMonto });
      setMontoMatricula(nuevoMonto);
      setMontoPago("");
      alert("Pago realizado con éxito.");
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      alert("Hubo un error al procesar el pago.");
    }
  };

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div className="pagosuser-background">
      <Header type="user" />
      <TopImg number={4} />
      
      <div className="pagosuser-card">
      <h2 className="pagosuser-header">Realizar pago</h2>

        <p className="monto-deuda">Monto a pagar: <strong>${montoMatricula}</strong></p>

        <div className="botones-pago">
          <button
            className={`pago-btn ${metodoPago === "efectivo" ? "seleccionado" : ""}`}
            value="efectivo"
            onClick={handleMetodoPagoChange}
          >
            Efectivo
          </button>
          <button
            className={`pago-btn ${metodoPago === "transferencia" ? "seleccionado" : ""}`}
            value="transferencia"
            onClick={handleMetodoPagoChange}
          >
            Transferencia
          </button>
        </div>

        {metodoPago === "efectivo" && (
          <p className="mensaje-efectivo">Debes acercarte al club para realizar el pago.</p>
        )}

        

        {metodoPago === "transferencia" && (
          <div className="pago-transferencia">
            <label>Ingresa el monto a pagar:</label>
            <input
              type="number"
              value={montoPago}
              onChange={handleMontoChange}
              placeholder="Ejemplo: 50"
            />
            
            <button className="pagar-btn" onClick={handlePagar}>
              Pagar
            </button>
            <button className="pagar-todo-btn" onClick={handlePagarTodo}>
              Pagar Todo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
