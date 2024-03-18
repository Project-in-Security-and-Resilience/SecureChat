/**
 **  App Component with Routing and Protected Routes:
 * The App component serves as the main entry point for the application, implementing routing 
 * with React Router Dom. It defines routes for the Home, Login, and Register pages, and ensures 
 * that the Home page is accessible only to authenticated users through a ProtectedRoute component. 
 * On initialization, it also triggers the creation of a unique GPT account for the application, 
 * intended to run once.
 * 
 **  Dependencies:
 * - React Router Dom for SPA routing.
 * - AuthContext for accessing the current user's authentication state.
 * - Home, Login, Register components for respective routes.
 * - SteganographyComponent and GenUniAcc for GPT account generation and other functionalities (not directly used in routing but important parts of the app).
 * 
 ** Features:
 * - Secure routing with authentication checks to protect certain routes.
 * - Automatic GPT account generation on app initialization.
 * - Scalable structure for adding additional protected or open routes as needed.

 * 
 ** ProtectedRoute:
 * - A wrapper component that renders its children if a user is authenticated (currentUser is presen) 
 * or redirects to the Login page otherwise. This approach ensures that certain parts of the app are accessible only to authenticated users.
 
 */


// Importing necessary components and styles
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./style.scss";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import SteganographyComponent from "./components/SteganographyComponent";
import GenUniAcc from "./ai_helper/GenUniAcc";

function App() {

  // When run this App, the gpt account creating only run once
  useEffect(() => {
      //Because of React's strict mode, this method will be called twice, not twice in production
      GenUniAcc();
  }, []);

  const { currentUser } = useContext(AuthContext);

  // Component to protect routes based on authentication state
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    // If user is authenticated, render the child components (protected route content)
    return children
  };

  // Setting up the application routes using React Router
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route
            index
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
