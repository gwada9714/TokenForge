import React from "react";

// Composant absolument minimal sans aucune dépendance
const UltraMinimal: React.FC = () => {
  console.log("UltraMinimal component rendering");

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#0066CC" }}>Test de rendu minimal</h1>
      <p>Si vous voyez cette page, le rendu React fonctionne correctement.</p>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        <h2>Diagnostic</h2>
        <p>Cette page est un test de rendu sans aucune dépendance externe.</p>
        <button
          onClick={() => alert("Le JavaScript fonctionne correctement!")}
          style={{
            background: "#0066CC",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Cliquez pour tester
        </button>
      </div>
    </div>
  );
};

export default UltraMinimal;
