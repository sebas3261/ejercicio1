import React from "react";
import "../css/infouser.css";
import { Doughnut, Bar } from "react-chartjs-2";
import Header from "../components/Header";

const InfoUser = () => {
  const doughnutData = {
    datasets: [
      {
        data: [40, 60],
        backgroundColor: ["#4caf50", "#e0e0e0"],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      { label: "Días asistencia", data: [5, 10, 8, 12, 15, 7, 10], backgroundColor: "#03a9f4" },
      { label: "# torneos", data: [1, 2, 1, 3, 4, 2, 3], backgroundColor: "#000000" },
    ],
  };

  return (
    <div className="Infouser-background">
      <Header type="user" />
      <div className="Infouser-card">
        <h2 className="Infouser-header">Resumen de Actividad</h2>
        <div className="Infouser-chart">
          <div className="Infouser-chart-item">
            <Doughnut data={doughnutData} />
            <p>Promedio participación</p>
          </div>
          <div className="Infouser-chart-item">
            <Bar data={barData} />
          </div>
        </div>
        <div className="Medals-container">
          <img src="/path/to/silver-medal.png" alt="Silver" className="Medal-image" />
          <img src="/path/to/gold-medal.png" alt="Gold" className="Medal-image" />
          <img src="/path/to/bronze-medal.png" alt="Bronze" className="Medal-image" />
        </div>
      </div>
    </div>
  );
};

export default InfoUser;
