import React from "react";
import { Link } from "react-router-dom";
import { Bot, History, Sparkles, Utensils } from "lucide-react";
import AssistantPanel from "../../components/assistant/AssistantPanel";
import "./ChatPage.css";

export default function ChatPage() {
  return (
    <main className="assistant-page">
      <section className="assistant-page-intro">
        <div className="assistant-page-intro-head">
          <div className="assistant-page-badge" aria-hidden="true">
            <Bot size={18} />
          </div>
          <div>
            <p className="assistant-page-kicker">NutriHelp AI</p>
            <h1>Assistant Hub</h1>
          </div>
        </div>

        <p className="assistant-page-description">
          Use this full-screen workspace to plan meals, ask nutrition questions, and keep your
          conversation history in one place.
        </p>

        <div className="assistant-page-highlights" aria-label="Assistant features">
          <div className="assistant-highlight-item">
            <Sparkles size={15} />
            Meal ideas
          </div>
          <div className="assistant-highlight-item">
            <Utensils size={15} />
            Macro guidance
          </div>
          <div className="assistant-highlight-item">
            <History size={15} />
            Saved history
          </div>
        </div>

        <div className="assistant-page-actions">
          <Link to="/home" className="assistant-page-link">
            Back to Home
          </Link>
          <Link to="/meal" className="assistant-page-link subtle">
            Open Meal Planner
          </Link>
        </div>
      </section>

      <div className="assistant-page-panel-wrap">
        <AssistantPanel fullscreen autoFocusInput headerTitle="NutriHelp Assistant" />
      </div>
    </main>
  );
}
