import React, { useEffect, useState } from "react";
import "../css/infouser.css";
import Header from "../components/Header";
import { Chart } from "react-google-charts";
import { doc, getDoc, collection, query, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import TopImg from "../components/TopImg";
import { NavLink } from "react-router";
export default function InfoUser() {
  const [userCategory, setUserCategory] = useState(null);
  //pagos
  const [userBalance, setUserBalance] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const [trainingCount, setTrainingCount] = useState(0);
  const [totalTrainings, setTotalTrainings] = useState(0);
  const [tournamentCount, setTournamentCount] = useState(0);
  const [totalTournaments, setTotalTournaments] = useState(0);
  const [tournamentsWon, setTournamentsWon] = useState(0); // Estado para los torneos ganados
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
        setUserBalance(userData.montoMatricula || 0);
        setPaymentStatus(userData.montoMatricula > 0 ? "Debe dinero" : "Al día");

        // Consultar entrenos
        const entrenosQuery = query(collection(db, "entrenos"));
        const entrenosSnapshot = await getDocs(entrenosQuery);
        let attendedTrainings = 0;
        let totalCategoryTrainings = 0;

        entrenosSnapshot.forEach((doc) => {
          const entrenoData = doc.data();
          if (entrenoData.categoria === userData.categoria) {
            totalCategoryTrainings++;
          }
          if (entrenoData.asistencia && entrenoData.asistencia.includes(uid)) {
            attendedTrainings++;
          }
        });

        setTrainingCount(attendedTrainings);
        setTotalTrainings(totalCategoryTrainings);
        
        // Consultar torneos
        const tournamentsQuery = query(collection(db, "tournaments"));
        const tournamentsSnapshot = await getDocs(tournamentsQuery);
        let attendedTournaments = 0;
        let totalCategoryTournaments = 0;
        let wonTournaments = 0; // Variable para contar los torneos ganados

        tournamentsSnapshot.forEach((doc) => {
          const tournamentData = doc.data();
          if (tournamentData.categoria === userData.categoria) {
            totalCategoryTournaments++;
          }
          if (
            tournamentData.rankings &&
            tournamentData.rankings.some((rank) => rank.playerId === uid)
          ) {
            attendedTournaments++;
            // Verificar si el jugador ha ganado el torneo
            if (tournamentData.rankings.some((rank) => rank.playerId === uid && rank.position === 1)) {
              wonTournaments++;
            }
          }
        });

        setTournamentCount(attendedTournaments);
        setTotalTournaments(totalCategoryTournaments);
        setTournamentsWon(wonTournaments); // Actualizar el estado de torneos ganados

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

  const pieChartDataTrainings = [
    ["Entrenos", "Cantidad"],
    ["Asistidos", trainingCount],
    ["No asistidos", totalTrainings - trainingCount],
  ];

  const pieChartDataTournaments = [
    ["Torneos", "Cantidad"],
    ["Participados", tournamentCount],
    ["No participados", totalTournaments - tournamentCount],
  ];

  const pieChartOptions = {
    pieHole: 0.4,
    colors: ["#4caf50", "#e0e0e0"],
    legend: "none",
  };

  return (
    <div className="infouser-background">
      <Header type="user" />
      <TopImg number={4} />
      <div className="infouser-card">
        <h2 className="infouser-header">Resumen de Actividad</h2>
        <div className="user-category-right">Categoría del usuario: {userCategory}</div>
        <div className="infouser-balance-box">
          <h3>Saldo</h3>
          <p>${userBalance}</p>
          <span className={`payment-status ${paymentStatus === "Debe dinero" ? "debt" : "paid"}`}>{paymentStatus}</span>
          <NavLink to={"/pagosuser"} className={"navlink"}>
          {paymentStatus === "Debe dinero" && <button className="pay-button" >Pagar</button>}
        </NavLink>
          
        </div>

        <div className="infouser-chart">
          <div className="infouser-chart-item">
            <p>Entrenos Asistidos</p>
            <Chart chartType="PieChart" data={pieChartDataTrainings} options={pieChartOptions} width={"100%"} height={"200px"} />
          </div>
          <div className="infouser-chart-item">
            <p>Torneos Participados</p>
            <Chart chartType="PieChart" data={pieChartDataTournaments} options={pieChartOptions} width={"100%"} height={"200px"} />
            {tournamentsWon > 0 && (
              <p className="tournament-wins">
                🏆 Has ganado {tournamentsWon} de {totalTournaments} torneos en tu categoria.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
