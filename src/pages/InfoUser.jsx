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
  const [userBalance, setUserBalance] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [trainingCount, setTrainingCount] = useState(0);
  const [totalTrainings, setTotalTrainings] = useState(0);
  const [tournamentCount, setTournamentCount] = useState(0);
  const [totalTournaments, setTotalTournaments] = useState(0);
  const [tournamentsWon, setTournamentsWon] = useState(0);
  const [firstPlaceTournaments, setFirstPlaceTournaments] = useState([]);
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
        let wonTournaments = 0;
        const firstPlaceList = [];

        tournamentsSnapshot.forEach((doc) => {
          const tournamentData = doc.data();
          const tournamentId = doc.id;

          if (tournamentData.categoria === userData.categoria) {
            totalCategoryTournaments++;
          }

          if (tournamentData.inscritos && tournamentData.inscritos.includes(uid)) {
            attendedTournaments++;
          }

          if (tournamentData.rankings && Array.isArray(tournamentData.rankings)) {
            const userFirstPlace = tournamentData.rankings.find(
              (rank) => rank.id === uid && rank.position === 0
            );

            if (userFirstPlace) {
              wonTournaments++;
              firstPlaceList.push({
                id: tournamentId,
                name: tournamentData.name,
                fecha: tournamentData.fecha || "No definida",
                categoria: tournamentData.categoria,
              });
            }
          }
        });

        setTournamentCount(attendedTournaments);
        setTotalTournaments(totalCategoryTournaments);
        setTournamentsWon(wonTournaments);
        setFirstPlaceTournaments(firstPlaceList);

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
            {paymentStatus === "Debe dinero" && <button className="pay-button">Pagar</button>}
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
                🏆 Has ganado {tournamentsWon} de {totalTournaments} torneos en tu categoría.
              </p>
            )}
          </div>
          <div className="infouser-chart-item">
            <h3>Torneos Ganados</h3>
            {firstPlaceTournaments.length > 0 ? (
              <ul className="first-place-list">
                {firstPlaceTournaments.map((tournament) => (
                  <li key={tournament.id} className="first-place-item">
                    <span>🏆 {tournament.name}</span>
                    <span>Fecha: {tournament.fecha}</span>
                    <span>Categoría: {tournament.categoria}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-wins">No has ganado ningún torneo aún.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}