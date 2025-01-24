import { Navigate} from 'react-router';

const PrivateRoute = ({ children , type}) => {
  
    if (localStorage.getItem("isAuthenticated") !== type) {
      return <Navigate to="/" replace />;
    }
  
    return children;
  };
  
  export default PrivateRoute;