import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

// Version ultra-simplifiée sans Material-UI ni autres dépendances
const AppSimple = () => {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h1 style={{ color: "#FF6600" }}>TokenForge - Version minimale</h1>
      <p>
        Cette version simplifiée ne dépend d'aucune bibliothèque externe à part
        React Router.
      </p>

      <BrowserRouter>
        <nav
          style={{
            background: "#f0f0f0",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <Link to="/" style={{ marginRight: "10px" }}>
            Accueil
          </Link>
          <Link to="/test">Test</Link>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h2>Page d'accueil</h2>
                <p>Bienvenue sur la version ultra-simplifiée de TokenForge.</p>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #ddd",
                    padding: "20px",
                    borderRadius: "4px",
                    marginTop: "20px",
                  }}
                >
                  <h3>Test de navigation</h3>
                  <p>
                    Si cette page s'affiche correctement, le problème est lié
                    aux dépendances externes.
                  </p>
                </div>
              </div>
            }
          />

          <Route
            path="/test"
            element={
              <div>
                <h2>Page de test</h2>
                <p>
                  Cette page s'affiche si le routage fonctionne correctement.
                </p>
                <button
                  onClick={() => alert("Le JavaScript fonctionne !")}
                  style={{
                    background: "#FF6600",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cliquez-moi
                </button>
              </div>
            }
          />

          <Route
            path="*"
            element={
              <div style={{ textAlign: "center" }}>
                <h2>404 - Page non trouvée</h2>
                <Link to="/">Retour à l'accueil</Link>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default AppSimple;
