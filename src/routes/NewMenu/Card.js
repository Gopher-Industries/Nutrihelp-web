// src/components/Card.js
import React from 'react';
import './Card.css'; // 导入样式文件（如果需要）

const Card = ({ item }) => {
  return (
    <div className="card">
      <img src={item.imageUrl} alt={item.name} className="card-image" />
      <div className="card-body">
        <h5>{item.name}</h5>
        <p>{item.description}</p>
      </div>
      <div className="card-footer">
        <a href="#">Learn More</a>
      </div>
    </div>
  );
};

export default Card;
