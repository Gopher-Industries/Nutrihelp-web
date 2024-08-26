// src/components/Card.js
import React from 'react';
import './MenuCard.css'; 

const Card = ({ item }) => {
  return (
    <div className="menucard">
      <img src={item.imageUrl} alt={item.name} className="menucard-image" />
      <div className="menucard-body">
        <h5>{item.name}</h5>
        <p>{item.description}</p>
      </div>
      <div className="menucard-footer">
        <a href="#">Recipe</a>
      </div>
    </div>
  );
};

export default Card;
