import React, { createContext, useReducer, useContext } from "react";

export const AuthContext = createContext();

const initialState = {
  isAuthenticated: localStorage.getItem("isAuthenticated") === "admin" | localStorage.getItem("isAuthenticated") === "user",
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

  const login = (user) => {
    if(user.type == "admin"){
        localStorage.setItem("isAuthenticated", "admin");
    }
    else{
        localStorage.setItem("isAuthenticated", "user");
    }
    dispatch({ type: "LOGIN", payload: user });
    return user.type;
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    dispatch({ type: 'LOGOUT' });
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
