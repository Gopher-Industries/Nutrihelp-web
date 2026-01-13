// src/routes/Meal/components/DayRow.jsx
import React from "react";

export default function DayRow({ dayPlan, ingredientsByRecipe }) {
  const meals = ["breakfast", "lunch", "dinner"];

  const getIngredientName = (ing) =>
    ing?.ingredient_name || ing?.name || ing?.ingredient || "Ingredient";

  const getIngredientQty = (ing) =>
    ing?.quantity ?? ing?.qty ?? ing?.amount ?? "";

  return (
    <div style={{ marginBottom: 24 }}>
      <h2
        className="day-header"
        style={{
          fontSize: "clamp(1rem, 3.5vw, 1.25rem)",
          lineHeight: 1.3,
          marginTop: 20,
          color: "#1a237e",
          borderBottom: "1px solid #ccc",
          paddingBottom: 6,
          marginBottom: 12,
        }}
      >
        {dayPlan?.day || "Day"}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          width: "100%",
        }}
      >
        {meals.map((mealKey) => {
          const recipe = dayPlan?.[mealKey];
          const rId = recipe?.id;
          const ingList = rId ? ingredientsByRecipe?.[rId] || [] : [];

          return (
            <div
              key={mealKey}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 14,
                backgroundColor: "#f9f9f9",
                boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                minWidth: 0,
              }}
            >
              <h3
                className="meal-header"
                style={{
                  margin: "4px 0 8px",
                  color: "#005BBB",
                  textDecoration: "underline",
                  fontSize: "clamp(0.875rem, 3vw, 1rem)",
                  lineHeight: 1.3,
                  fontWeight: 700,
                }}
              >
                {mealKey.charAt(0).toUpperCase() + mealKey.slice(1)}
              </h3>

              <p style={{ fontWeight: 700, margin: "0 0 6px", fontSize: "clamp(0.875rem, 2.5vw, 1rem)" }}>
                {recipe?.recipe_name || "N/A"}
              </p>

              <p
                style={{
                  fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
                  color: "#333",
                  margin: "0 0 10px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {recipe?.instructions || "No instructions available."}
              </p>

              {rId && ingList.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: "clamp(0.75rem, 2vw, 0.875rem)" }}>
                    Ingredients
                  </p>

                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "clamp(0.6875rem, 2vw, 0.8125rem)",
                      background: "#fff",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: "left",
                            padding: 6,
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          Ingredient
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            padding: 6,
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          Quantity
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {ingList.map((ing, idx) => (
                        <tr key={idx}>
                          <td
                            style={{
                              padding: 6,
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            {getIngredientName(ing)}
                          </td>
                          <td
                            style={{
                              padding: 6,
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            {getIngredientQty(ing)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {rId && ingList.length === 0 && (
                <p style={{ fontSize: "clamp(0.6875rem, 2vw, 0.75rem)", color: "#666", marginTop: 4 }}>
                  Ingredients not available for this recipe.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}