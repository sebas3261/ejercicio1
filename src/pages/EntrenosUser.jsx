import React, { useEffect, useState } from "react";
import "../css/entrenos.css";
import TopImg from "../components/TopImg";
import Header from "../components/Header";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Asegúrate de tener configurada la conexión a Firestore

export default function EntrenosHome() {
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Recuperar el uid del usuario desde localStorage
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const uid = storedUser?.uid;

        if (!uid) {
          console.error("No se encontró un UID en localStorage.");
          return;
        }

        // Obtener la categoría del usuario desde Firestore
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.error("No se encontró información del usuario en Firestore.");
          return;
        }

        const userData = userDoc.data();
        const userCategoria = userData.categoria; // Cambia "categoria" al nombre del campo correcto

        if (!userCategoria) {
          console.error("El usuario no tiene una categoría asignada.");
          return;
        }

        // Obtener entrenamientos según la categoría
        const entrenosRef = collection(db, "entrenos");
        const q = query(entrenosRef, where("categoria", "==", userCategoria));
        const entrenosSnapshot = await getDocs(q);

        const entrenos = entrenosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEntrenamientos(entrenos);
      } catch (error) {
        console.error("Error al cargar entrenamientos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Cargando entrenamientos...</p>
      </div>
    );
  }

  return (


    <div className="Entrenos-background">
      <Header type="user" />
      <TopImg number={2} />
      <h2 className="Entrenos-title">Entrenamientos Programados</h2>
      <div className="Entrenos-card">
        <div className="Entrenos-list">
          {entrenamientos.length > 0 ? (
            entrenamientos.map((entreno) => (
              <div key={entreno.id} className="Entreno-item">
                <div className="Entreno-image"></div>
                <div className="Entreno-info">
                  <h3>{entreno.name}</h3>
                  <p>Categoria: {entreno.categoria}</p>
                  <p>Cancha: {entreno.cancha}</p>
                  {/* Log de los datos de asistencia y el uid */}
                  <p>
                    {console.log("Asistencia en Firebase:", entreno.asistencia)}
                    {console.log("UID del usuario:", localStorage.getItem("user").uid)}

                    {/* Verificación de la asistencia */}
                    {entreno.asistencia?.includes(JSON.parse(localStorage.getItem("user"))?.uid) ? ( 
                      "Asistencia Confirmada"
                    ) : (
                      "No asististe a esta clase"
                    )}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>No hay entrenamientos disponibles para tu categoría.</p>
          )}
        </div>
      </div>
    </div>
  );
}
