import React from "react";

const Tag = ({ children }) => <span className="tag">{children}</span>;

const UserPreferences = ({ prefs, onEdit }) => {
  const { name, dietTypes = [], allergies = [] } = prefs;

  return (
    <div className="header">
      <div className="user-info">
        <img
          src="https://cdn-icons-png.freepik.com/512/219/219988.png"
          alt="User Avatar"
          width="72"
          height="72"
          style={{ borderRadius: "50%" }}
        />
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div className="user-tags">
            {dietTypes.map((d) => (
              <Tag key={`diet-${d}`}>{d}</Tag>
            ))}
            {allergies.map((a) => (
              <Tag key={`allergy-${a}`}>Allergy: {a}</Tag>
            ))}
          </div>
        </div>
      </div>
      {/* FIXED: button now definitely triggers modal */}
      <button
        className="btn btn-primary"
        type="button"
        onClick={() => onEdit && onEdit()}
      >
        ✏ Edit Preferences
      </button>
    </div>
  );
};

export default UserPreferences;
