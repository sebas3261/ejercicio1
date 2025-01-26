import React, { useEffect, useState } from "react";
import "../css/infouser.css";
import Header from "../components/Header";
import { Chart } from "react-google-charts";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import TopImg from "../components/TopImg";

export default function InfoUser() {
  const [userCategory, setUserCategory] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [participation, setParticipation] = useState(0); 
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
        setUserCategory(userData.categoria || "Desconocida");
        setUserBalance(userData.saldo || 0);
        setPaymentStatus(userData.deuda > 0 ? "Debe dinero" : "Al día");
        setParticipation(userData.participacion || 40); 
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

  const pieChartData = [
    ["Label", "Value"],
    ["Participación", participation],
    ["Faltante", 100 - participation],
  ];

  const barChartData = [
    ["Mes", "Días asistencia", "# Torneos"],
    ["Ene", 10, 2],
    ["Feb", 15, 3],
    ["Mar", 20, 4],
    ["Abr", 25, 5],
    ["May", 30, 6],
    ["Jun", 35, 7],
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
        <div className="user-category-right">
          Categoría del usuario: {userCategory}
        </div>
        <div className="infouser-balance-box">
          <h3>Saldo</h3>
          <p>${userBalance}</p>
          <span
            className={`payment-status ${
              paymentStatus === "Debe dinero" ? "debt" : "paid"
            }`}
          >
            {paymentStatus}
          </span>
          {paymentStatus === "Debe dinero" && (
            <button className="pay-button">Pagar</button>
          )}
        </div>

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
      </div>
    </div>
  );
}
