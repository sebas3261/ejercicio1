import React, { useEffect, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import "../css/infouser.css";
import Header from "../components/Header";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function InfoUser() {
  const [doughnutData, setDoughnutData] = useState({
    datasets: [
      {
        data: [40, 60],
        backgroundColor: ["#4caf50", "#e0e0e0"],
        borderWidth: 0,
      },
    ],
  });

  const [barData, setBarData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Días asistencia",
        data: [5, 10, 8, 12, 15, 7, 10],
        backgroundColor: "#03a9f4",
      },
      {
        label: "# torneos",
        data: [1, 2, 1, 3, 4, 2, 3],
        backgroundColor: "#000000",
      },
    ],
  });

  const [userCategory, setUserCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const uid = storedUser?.uid;

        if (!uid) {
          console.error("No se encontró un UID en localStorage.");
          return;
        }

        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.error("No se encontró información del usuario en Firestore.");
          return;
        }

        const userData = userDoc.data();
        setUserCategory(userData.categoria || "");
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Cargando información del usuario...</p>
      </div>
    );
  }

  return (
    <div className="infouser-background">
      <Header type="user" />
      <div className="infouser-card">
        <h2 className="infouser-header">Resumen de Actividad</h2>
        <div className="infouser-chart">
          <div className="infouser-chart-item">
            <Doughnut data={doughnutData} />
            <p>Promedio participación</p>
          </div>
          <div className="infouser-chart-item">
            <Bar data={barData} />
          </div>
        </div>
        <div className="Medals-container">
          <img
            src="/path/to/silver-medal.png"
            alt="Silver"
            className="Medal-image"
          />
          <img
            src="/path/to/gold-medal.png"
            alt="Gold"
            className="Medal-image"
          />
          <img
            src="/path/to/bronze-medal.png"
            alt="Bronze"
            className="Medal-image"
          />
        </div>
        <div className="User-category">
          <h3>Categoría del usuario: {userCategory || "Desconocida"}</h3>
        </div>
      </div>
    </div>
  );
}

