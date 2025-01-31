import React, { useEffect, useState } from "react";
import "../css/infouser.css";
import Header from "../components/Header";
import { Chart } from "react-google-charts";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import TopImg from "../components/TopImg";

export default function InfoUser() {
  const [trainingCategories, setTrainingCategories] = useState([]); // Estado para categorías de entrenamientos
  const [tournamentCategories, setTournamentCategories] = useState([]); // Estado para categorías de torneos
  const [selectedTrainingCategory, setSelectedTrainingCategory] = useState(""); // Categoría seleccionada para entrenamientos
  const [selectedTournamentCategory, setSelectedTournamentCategory] = useState(""); // Categoría seleccionada para torneos
  const [trainingCategoryCount, setTrainingCategoryCount] = useState(0); // Cantidad de entrenamientos para la categoría seleccionada
  const [otherTrainingCategoryCount, setOtherTrainingCategoryCount] = useState(0); // Cantidad de entrenamientos para otras categorías
  const [tournamentCategoryCount, setTournamentCategoryCount] = useState(0); // Cantidad de torneos para la categoría seleccionada
  const [otherTournamentCategoryCount, setOtherTournamentCategoryCount] = useState(0); // Cantidad de torneos para otras categorías
  const [loading, setLoading] = useState(true);

  // Obtener categorías de entrenamientos
  const fetchTrainingCategories = async () => {
    try {
      const trainingQuery = query(collection(db, "entrenos"));
      const trainingSnapshot = await getDocs(trainingQuery);
      const allTrainingCategories = new Set(); // Usamos un Set para obtener categorías únicas

      trainingSnapshot.forEach((doc) => {
        const trainingData = doc.data();
        allTrainingCategories.add(trainingData.categoria);
      });

      setTrainingCategories(Array.from(allTrainingCategories)); // Convertimos el Set a un array
      setSelectedTrainingCategory(Array.from(allTrainingCategories)[0] || ""); // Seleccionamos la primera categoría por defecto
    } catch (error) {
      console.error("Error al cargar las categorías de entrenamientos:", error);
    }
  };

  // Obtener categorías de torneos
  const fetchTournamentCategories = async () => {
    try {
      const tournamentQuery = query(collection(db, "tournaments"));
      const tournamentSnapshot = await getDocs(tournamentQuery);
      const allTournamentCategories = new Set(); // Usamos un Set para obtener categorías únicas

      tournamentSnapshot.forEach((doc) => {
        const tournamentData = doc.data();
        allTournamentCategories.add(tournamentData.categoria);
      });

      setTournamentCategories(Array.from(allTournamentCategories)); // Convertimos el Set a un array
      setSelectedTournamentCategory(Array.from(allTournamentCategories)[0] || ""); // Seleccionamos la primera categoría por defecto
    } catch (error) {
      console.error("Error al cargar las categorías de torneos:", error);
    }
  };

  // Función para obtener los datos de los entrenamientos
  useEffect(() => {
    const fetchTrainingData = async () => {
      if (!selectedTrainingCategory) return; // Evitar que se haga la consulta si no hay categoría seleccionada

      try {
        const trainingQuery = query(collection(db, "entrenos"));
        const trainingSnapshot = await getDocs(trainingQuery);
        let selectedCategoryTrainingCount = 0;
        let otherCategoryTrainingCount = 0;

        trainingSnapshot.forEach((doc) => {
          const trainingData = doc.data();
          if (trainingData.categoria === selectedTrainingCategory) {
            selectedCategoryTrainingCount++;
          } else {
            otherCategoryTrainingCount++;
          }
        });

        setTrainingCategoryCount(selectedCategoryTrainingCount);
        setOtherTrainingCategoryCount(otherCategoryTrainingCount);
      } catch (error) {
        console.error("Error al cargar los datos de entrenamientos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingData();
  }, [selectedTrainingCategory]);

  // Función para obtener los datos de los torneos
  useEffect(() => {
    const fetchTournamentData = async () => {
      if (!selectedTournamentCategory) return; // Evitar que se haga la consulta si no hay categoría seleccionada

      try {
        const tournamentQuery = query(collection(db, "tournaments"));
        const tournamentSnapshot = await getDocs(tournamentQuery);
        let selectedCategoryTournamentCount = 0;
        let otherCategoryTournamentCount = 0;

        tournamentSnapshot.forEach((doc) => {
          const tournamentData = doc.data();
          if (tournamentData.categoria === selectedTournamentCategory) {
            selectedCategoryTournamentCount++;
          } else {
            otherCategoryTournamentCount++;
          }
        });

        setTournamentCategoryCount(selectedCategoryTournamentCount);
        setOtherTournamentCategoryCount(otherCategoryTournamentCount);
      } catch (error) {
        console.error("Error al cargar los datos de torneos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentData();
  }, [selectedTournamentCategory]); // Ejecutar solo cuando cambie la categoría de torneos

  // Obtener las categorías al cargar el componente
  useEffect(() => {
    fetchTrainingCategories();
    fetchTournamentCategories();
  }, []);

  // Si está cargando, mostrar un indicador de carga
  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Cargando información...</p>
      </div>
    );
  }

  // Datos de la gráfica de entrenamientos
  const trainingPieChartData = [
    ["Categoría", "Cantidad"],
    [`Entrenamientos ${selectedTrainingCategory}`, trainingCategoryCount],
    ["Otros Entrenamientos", otherTrainingCategoryCount],
  ];

  const trainingPieChartOptions = {
    pieHole: 0.4,
    colors: ["#ff9800", "#e0e0e0"], // Puedes cambiar los colores aquí
    legend: "none",
  };

  // Datos de la gráfica de torneos
  const tournamentPieChartData = [
    ["Categoría", "Cantidad"],
    [`Torneos ${selectedTournamentCategory}`, tournamentCategoryCount],
    ["Otros Torneos", otherTournamentCategoryCount],
  ];

  const tournamentPieChartOptions = {
    pieHole: 0.4,
    colors: ["#8bc34a", "#e0e0e0"], // Puedes cambiar los colores aquí
    legend: "none",
  };

  return (
    <div className="infouser-background">
      <Header type="admin" />
      <TopImg number={4} />
      <div className="infouser-card">
        <h2 className="infouser-header">Comparación de Entrenamientos y Torneos</h2>

        {/* Selector de categorías de entrenamientos */}
        <div className="category-selector">
          <label htmlFor="trainingCategorySelect">Selecciona la categoría de Entrenamientos:</label>
          <select
            id="trainingCategorySelect"
            value={selectedTrainingCategory}
            onChange={(e) => setSelectedTrainingCategory(e.target.value)}
          >
            {trainingCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Gráfico de Entrenamientos */}
        <div className="infouser-chart">
          <div className="infouser-chart-item">
            <p>Comparación de Entrenamientos {selectedTrainingCategory} vs Otros Entrenamientos</p>
            <Chart chartType="PieChart" data={trainingPieChartData} options={trainingPieChartOptions} width={"100%"} height={"200px"} />
          </div>
        </div>

        {/* Selector de categorías de torneos */}
        <div className="category-selector">
          <label htmlFor="tournamentCategorySelect">Selecciona la categoría de Torneos:</label>
          <select
            id="tournamentCategorySelect"
            value={selectedTournamentCategory}
            onChange={(e) => setSelectedTournamentCategory(e.target.value)}
          >
            {tournamentCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Gráfico de Torneos */}
        <div className="infouser-chart">
          <div className="infouser-chart-item">
            <p>Comparación de Torneos {selectedTournamentCategory} vs Otros Torneos</p>
            <Chart chartType="PieChart" data={tournamentPieChartData} options={tournamentPieChartOptions} width={"100%"} height={"200px"} />
          </div>
        </div>
      </div>
    </div>
  );
}
  