import React from "react";
import "./MenuCard.css";
import { useNavigate } from "react-router-dom";

const Card = ({ item, imageMapping, onDelete }) => {
  const navigate = useNavigate();

  const itemData = imageMapping[item.name] || {};
  const displayedImage = itemData.image || item.imageUrl;
  const displayedTitle = itemData.title || item.name;
  const displayedDescription = itemData.description || item.description;
  const recipeLink = itemData.recipeLink || "#";

  console.log("Item Name:", item.name);
  console.log("Displayed Image:", displayedImage);

  const handleEdit = () => {
    // Navigate back to Meal Planning page with this item preselected
    navigate("/Meal", { state: { preselectedItem: item } });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this meal?")) {
      onDelete(item); // Pass the item to delete to Dashboard
    }
  };

  return (
    <div className="menucard">
      <img src={displayedImage} alt={item.name} className="menucard-image" />
      <div className="menucard-body">
        <h5>{displayedTitle}</h5>
        <p>{displayedDescription}</p>
      </div>
      <div className="menucard-footer">
        <a
          href={recipeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="recipe-link"
        >
          Recipe
        </a>

        <div className="menucard-options">
          <div className="dots-icon">⋮</div>
          <div className="dropdown-menu">
            <button onClick={handleEdit}>Edit</button>
            <button onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
