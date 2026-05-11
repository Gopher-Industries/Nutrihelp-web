import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import "./AdminAccessDenied.css";

export default function AdminAccessDenied() {
  return (
    <section className="admin-access-denied-page">
      <div className="admin-access-denied-card">
        <span className="admin-access-denied-kicker">
          <ShieldAlert size={16} />
          Restricted Area
        </span>
        <h1>Access Denied</h1>
        <p>
          This page is only available for administrator accounts. Your current account does not
          have permission to view the Admin Data Center.
        </p>
        <div className="admin-access-denied-actions">
          <Link to="/home" className="admin-access-denied-btn primary">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}

