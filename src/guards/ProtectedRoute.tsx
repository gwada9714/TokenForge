import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = true; // Remplacez par votre logique d'authentification

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
