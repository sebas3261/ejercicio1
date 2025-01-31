import React, { createContext, useReducer, useContext } from "react";
import { auth, db } from "../firebase"; // Asegúrate de configurar Firebase correctamente
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

const initialState = {
  isAuthenticated: false,
  user: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (credentials) => {
    try {
      const { name, password } = credentials;
        console.log(name)
      // Autenticar con Firebase Authentication (usando email como name)
      const userCredential = await signInWithEmailAndPassword(auth, name, password);
      const firebaseUser = userCredential.user;

      const ref = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(ref);


      const userData = userDoc.data();

      if (!userData.isAuthenticated&&userData.type!=="admin") {
        alert("El usuario aún no ha sido autenticado por el administrador");
        return null;
      }

      console.log(userData)
      
  
      // Guardar el tipo como "admin" en localStorage por ahora
      localStorage.setItem("isAuthenticated", userData.type);
      localStorage.setItem("user", JSON.stringify({ name: firebaseUser.email, uid: firebaseUser.uid }));
  
      // Actualizar el estado global con los datos del usuario
      dispatch({ type: "LOGIN", payload: { name: firebaseUser.email, type: "user" } });
  
      // Retornar el tipo "admin" por ahora
      return userData.type; // Forzamos que siempre retorne "admin"
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      alert("Error: Usuario o contraseña incorrectos o vacios");
      return null; // Si algo falla, retornamos null
    }
  };


  // Función de cierre de sesión
  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ login, logout, ...state }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
