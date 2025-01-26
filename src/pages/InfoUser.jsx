import React, { useEffect, useState } from "react";
import "../css/infouser.css";
import Header from "../components/Header";
import { Chart } from "react-google-charts";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import TopImg from "../components/TopImg";

export default function InfoUser() {
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

  // Datos para los gráficos
  const pieChartData = [
    ["Label", "Value"],
    ["Participación", 40],
  ];

  const barChartData = [
    ["Mes", "Días asistencia", "# Torneos"],
    ["Ene", 10, 2],
    ["Feb", 9, 3],
    ["Mar", 14, 4],
    ["Abr", 10, 5],
    ["May", 12, 6],
    ["Jun", 7, 7],
  ];

  const pieChartOptions = {
    pieHole: 0.4,
    colors: ["#4caf50", "#e0e0e0"],
    legend: "none",
  };

  const barChartOptions = {
    chartArea: { width: "70%" },
    colors: ["#42a5f5", "#000000"],
    hAxis: { title: "Mes" },
    vAxis: { title: "Cantidad" },
  };

  return (
    <div className="infouser-background">
      <Header type="user" />
      <TopImg number={4} />
      <div className="infouser-card">
        <h2 className="infouser-header">Resumen de Actividad</h2>
        <div className="infouser-chart">
          <div className="infouser-chart-item">
            <p>Promedio participación</p>
            <Chart
              chartType="PieChart"
              data={pieChartData}
              options={pieChartOptions}
              width={"100%"}
              height={"200px"}
            />
          </div>
          <div className="infouser-chart-item">
            <p>Informe mensual</p>
            <Chart
              chartType="ColumnChart"
              data={barChartData}
              options={barChartOptions}
              width={"100%"}
              height={"200px"}
            />
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
