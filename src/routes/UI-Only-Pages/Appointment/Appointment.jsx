import React, { useState } from "react";
import "./appointment.css";
 
export default function Appointment() {
  const [inputType, setInputType] = useState("text");
  const [showDropDown, setShowDropDown] = useState(false);
  const [provider, setProvider] = useState("Health Care Providers");
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
 
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
 
  const [filterStatus, setFilterStatus] = useState("Scheduled");
 
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      provider: "Regis HealthCare",
      date: "14 March 2025",
      status: "Scheduled",
    },
    {
      id: 2,
      provider: "Bluecross",
      date: "08 March 2025",
      status: "Completed",
    },
    {
      id: 3,
      provider: "Arcare Aged Care",
      date: "04 March 2025",
      status: "Cancelled",
    },
  ]);
 
  const filteredAppointments = appointments.filter(
    (appt) => appt.status === filterStatus
  );
 
  const handleFocus = () => setInputType("date");
  const handleBlur = () => setInputType("text");
 
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
 
    const updatedAppointments = appointments.map((appt) =>
      appt.id === selectedAppointment.id ? { ...appt, date: newDate } : appt
    );
 
    setAppointments(updatedAppointments);
    setShowModal(false);
    setSelectedAppointment(null);
  };
 
  const providers = [
    "Regis HealthCare",
    "Atility Aged Care",
    "Arcare Aged Care",
    "Bluecross",
    "McKenzine Group",
  ];
 
  return (
    <div className="userProfile-container py-4 px-3">
      <div className="userProfile-section bg-white shadow-sm rounded p-4">
        <div className="appointment-header-wrapper text-center">
          <h1 className="appointment-title">Appointment Management</h1>
        </div>
 
        {/* Form Row */}
        <div className="form-row-wrapper d-flex flex-wrap align-items-center justify-content-between gap-3 px-3 mb-4">
          <div className="flex-grow-1">
            <div className="user-date-input-container">
              <input
                type="date"
                className="user-textbox-n form-control shadow-sm rounded-pill"
                placeholder="dd-mm-yyyy"
                id="date"
              />
            </div>
          </div>
 
          <div className="flex-grow-1 position-relative provider-dropdown-box">
            <div
              className="d-flex justify-content-between align-items-center bg-light shadow-sm rounded-pill px-4 py-2 pointer"
              onClick={() => setShowDropDown(!showDropDown)}
            >
              <p className="mb-0 text-dark fw-semibold">{provider}</p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="dropdown-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                width="20"
                height="20"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
 
            {showDropDown && (
              <div className="providers position-absolute w-100 mt-2 z-3">
                {providers.map((pro, key) => (
                  <div
                    key={key}
                    className="d-flex justify-content-between align-items-center py-2 px-3 border-bottom hover-bg-light pointer"
                    onClick={() => {
                      setProvider(pro);
                      setShowDropDown(false);
                    }}
                  >
                    <p className="mb-0 fw-medium">{pro}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
 
          <div className="d-flex align-items-center">
            <button className="btn btn-success btn-search shadow-sm d-flex align-items-center justify-content-center gap-2 rounded-pill px-4 py-2">
              Search
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                />
              </svg>
            </button>
          </div>
        </div>
 
        {/* Appointments Header with Filter Buttons */}
        <div className="appointments-header d-flex justify-content-between align-items-center flex-wrap gap-3 mt-5 pt-5 pt-4 px-3 mb-4">
          <h3 className="section-title mb-0">Appointments</h3>
          <div className="filter-buttons d-flex gap-2">
            <button
              className={`status-filter-btn ${
                filterStatus === "Scheduled" ? "active" : ""
              }`}
              onClick={() => setFilterStatus("Scheduled")}
            >
              Scheduled
            </button>
            <button
              className={`status-filter-btn ${
                filterStatus === "Completed" ? "active" : ""
              }`}
              onClick={() => setFilterStatus("Completed")}
            >
              Completed
            </button>
            <button
              className={`status-filter-btn ${
                filterStatus === "Cancelled" ? "active" : ""
              }`}
              onClick={() => setFilterStatus("Cancelled")}
            >
              Cancelled
            </button>
          </div>
        </div>
 
        {/* Appointments List */}
        {filteredAppointments.map((appt) => (
          <div
            key={appt.id}
            className="appointment-card shadow-sm rounded p-3 mb-3 d-flex justify-content-between align-items-center"
          >
            <div>
              <h5 className="mb-1">{appt.provider}</h5>
              <p className="mb-1 text-muted">{appt.date}</p>
              <span className={`status-badge ${appt.status.toLowerCase()}`}>
                {appt.status}
              </span>
            </div>
            <div className="appointment-actions">
              {appt.status === "Scheduled" && (
                <button
                  className="btn-reminder shadow-sm"
                  onClick={() =>
                    alert(`Reminder set for ${appt.date} at ${appt.provider}`)
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="alert-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    width="20"
                    height="20"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"
                    />
                  </svg>
                  Reminder
                </button>
              )}
              <button
                className="btn-reschedule"
                disabled={appt.status !== "Scheduled"}
                onClick={() => {
                  setSelectedAppointment(appt);
                  setShowModal(true);
                }}
              >
                Reschedule
              </button>
              <button
                className="btn-cancel"
                disabled={appt.status !== "Scheduled"}
                onClick={() => {
                  setAppointmentToCancel(appt);
                  setShowCancelConfirm(true);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
 
      {/* Reschedule Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <label htmlFor="rescheduleDate" className="modal-label">
              Select New Date
            </label>
            <div className="custom-date-wrapper mt-4">
              <input
                type="date"
                className="fixed-date-input"
                placeholder="dd-mm-yyyy"
                onChange={handleDateChange}
              />
            </div>
            <div className="d-flex justify-content-center mt-3">
              <button
                className="btn btn-secondary px-4 py-2"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="modal-overlay">
          <div className="modal-box text-center">
            <h4 className="mb-4">
              Are you sure you want to cancel this appointment?
            </h4>
            <div className="cancel-btn-wrapper">
              <button
                className="btn cancel-btn btn-danger"
                onClick={() => {
                  const updated = appointments.map((appt) =>
                    appt.id === appointmentToCancel.id
                      ? { ...appt, status: "Cancelled" }
                      : appt
                  );
                  setAppointments(updated);
                  setAppointmentToCancel(null);
                  setShowCancelConfirm(false);
                }}
              >
                Yes, Cancel
              </button>
              <button
                className="btn cancel-btn btn-secondary"
                onClick={() => {
                  setAppointmentToCancel(null);
                  setShowCancelConfirm(false);
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 