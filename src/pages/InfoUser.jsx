import React from "react";
import "../css/infouser.css";
import Header from "../components/Header";
import TopImg from "../components/TopImg";
import { Doughnut, Bar } from "react-chartjs-2";
import silverMedal from "../assets/medals/silver-medal.png";
import goldMedal from "../assets/medals/gold-medal.png";
import bronzeMedal from "../assets/medals/bronze-medal.png";

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
    <div className="infouser-background">
      <Header type="user" />
      <TopImg imageSrc="https://via.placeholder.com/1200x200" />
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
          <img src={silverMedal} alt="Silver Medal" className="Medal-image" />
          <img src={goldMedal} alt="Gold Medal" className="Medal-image" />
          <img src={bronzeMedal} alt="Bronze Medal" className="Medal-image" />
        </div>
      </div>
    </div>
  );
};

export default InfoUser;
