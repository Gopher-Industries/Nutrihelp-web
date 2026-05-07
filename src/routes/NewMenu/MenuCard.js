import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuCard.css';

const Card = ({ item, imageMapping }) => {
  const navigate = useNavigate();
  const itemName = item?.name || item?.title || 'Meal';
  const itemData = imageMapping[itemName] || {};
  const displayedImage = item?.image || item?.imageUrl || itemData.image || '/images/meal-mock/placeholder.svg';
  const displayedTitle = item?.title || item?.name || itemData.title || 'Meal';
  const displayedDescription =
    item?.description ||
    itemData.description ||
    `${displayedTitle} is included in your meal plan for today.`;

  const mealPayload = {
    ...item,
    id: item?.id || item?.recipeId || displayedTitle,
    recipeId: item?.recipeId || null,
    title: item?.title || item?.name || displayedTitle,
    name: item?.name || item?.title || displayedTitle,
    image: item?.image || item?.imageUrl || displayedImage,
    description: item?.description || displayedDescription,
    time: item?.time || 'N/A',
    servings: item?.servings || 'N/A',
    level: item?.level || 'Easy',
    mealType: item?.mealType || 'others',
    tags: Array.isArray(item?.tags) ? item.tags : [],
  };

  const handleViewRecipe = () => {
    try {
      sessionStorage.setItem('selectedMealDetail', JSON.stringify(mealPayload));
    } catch {
      // Ignore storage write errors and continue navigation.
    }

    const targetRecipeId = mealPayload.recipeId || mealPayload.id || 'recipe';
    navigate(`/recipe/${encodeURIComponent(String(targetRecipeId))}`, {
      state: { meal: mealPayload },
    });
  };

  const handleViewDetail = () => {
    try {
      sessionStorage.setItem('selectedMealDetail', JSON.stringify(mealPayload));
    } catch {
      // Ignore storage write errors and continue navigation.
    }

    navigate('/dish/detail', {
      state: { meal: mealPayload },
    });
  };

  return (
    <div className="menucard">
      <img
        src={displayedImage}
        alt={displayedTitle}
        className="menucard-image"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = '/images/meal-mock/placeholder.svg';
        }}
      />
      <div className="menucard-body">
        <h5>{displayedTitle}</h5>
        <p>{displayedDescription}</p>
      </div>
      <div className="menucard-footer">
        <button type="button" className="menu-action-btn detail" onClick={handleViewDetail}>
          Detail
        </button>
        <button type="button" className="menu-action-btn recipe" onClick={handleViewRecipe}>
          Recipe
        </button>
      </div>
    </div>
  );
};

export default Card;
