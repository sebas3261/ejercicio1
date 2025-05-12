// src/contexts/PrivateRoute.jsx
import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const PrivateRoute = ({ children }) => {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [hasDebt, setHasDebt] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      setLoading(false);
      return;
    }

    const { uid } = JSON.parse(stored);
    const docRef = doc(db, 'users', uid);

    // Escuchamos cambios en tiempo real
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        const deuda = snap.exists() ? (snap.data().montoMatricula || 0) : 0;
        setHasDebt(deuda > 0);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening user debt:', err);
        setHasDebt(false);
        setLoading(false);
      }
    );

    // Cleanup al desmontar
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Cargando…</div>;
  }

  const stored = localStorage.getItem('user');
  if (!stored) {
    return <Navigate to="/" replace />;
  }

  const path = location.pathname;

  // Si tiene deuda y la ruta NO es ni /infoUser ni /pagosuser → forzar /infoUser
  if (hasDebt && !['/infoUser', '/pagosuser'].includes(path)) {
    return <Navigate to="/infoUser" replace />;
  }

  // Si NO tiene deuda y está en /infoUser o en /pagosuser → enviarlo al dashboard
  if (!hasDebt && ['/infoUser', '/pagosuser'].includes(path)) {
    return <Navigate to="/userdashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
