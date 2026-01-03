import React from "react";
import { Link } from "react-router-dom";
import "../styles/mainNavbar.css";

const SideMenu = ({ onNavigate }) => {
  const close = () => typeof onNavigate === "function" && onNavigate();
  const scrollToContact = () => {
    const el = document.getElementById("contact");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mega-menu-content" aria-label="More menu">
      <div className="mega-col">
        <div className="mega-title">Recipes</div>
        <Link to="/createRecipe" className="mega-item" onClick={close}>Create Recipe</Link>
        <Link to="/searchRecipes" className="mega-item" onClick={close}>Search Recipes</Link>
        <Link to="/RecipeRating" className="mega-item" onClick={close}>Recipe Rating</Link>
      </div>

      <div className="mega-col">
        <div className="mega-title">Meal Planning</div>
        <Link to="/dashboard" className="mega-item" onClick={close}>Meal Details</Link>
        <Link to="/Meal" className="mega-item" onClick={close}>Plan</Link>
        {/* <Link to="/Meal" className="mega-item" onClick={close}>Weekly Meal</Link> */}
        <Link to="/daily-plan-edit" className="mega-item" onClick={close}>Daily Meal</Link>
      </div>

      <div className="mega-col">
        <div className="mega-title">Health</div>
        <Link to="/HealthFAQ" className="mega-item" onClick={close}>Health FAQ</Link>
        <Link to="/HealthTools" className="mega-item" onClick={close}>Health Tools</Link>
        <Link to="/healthnews" className="mega-item" onClick={close}>Health News</Link>
        <Link to="/symptomassessment" className="mega-item" onClick={close}>Symptom Assessment</Link>
        <Link to="/survey" className="mega-item" onClick={close}>Fitness Roadmap</Link>
      </div>

      <div className="mega-col">
        <div className="mega-title">Resources</div>
        <Link to="/faq" className="mega-item" onClick={close}>FAQ</Link>
        <Link to="/UiTimer" className="mega-item" onClick={close}>Cooking Timer</Link>
        <Link to="/Appointment" className="mega-item" onClick={close}>My Appointments</Link>
        <Link to="/community" className="mega-item" onClick={close}>Community</Link>
      </div>

      <div className="mega-footer">
        <Link className="mega-contact" onClick={scrollToContact}>
          Contact Us
        </Link>
      </div>
    </div>
  );
};

export default SideMenu;
