import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Plus,
  X,
  Edit2,
  Trash2,
  Bell,
  MapPin,
  User,
  Phone,
  Check,
  Loader2,
} from "lucide-react";
import { appointmentApi } from "../../../services/appointmentApi";
import { ERROR_MESSAGES, validatePhone } from "../../../utils/validationRules";
import FieldError from "../../../components/FieldError";
import { toast } from "react-toastify";
import "./appointment.css";

// Moves the component definitions outside to prevent the re-creation on each renders...
const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  required = false,
  name,
}) => (
  <div className="input-field">
    <label className="input-label">
      {label} {required && <span className="required-indicator">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      className={`input-control ${error && touched ? "error-border" : ""}`}
    />
    <FieldError error={error} touched={touched} />
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  options,
  required = false,
  name,
}) => (
  <div className="input-field">
    <label className="input-label">
      {label} {required && <span className="required-indicator">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className={`select-control ${error && touched ? "error-border" : ""}`}
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option
          key={typeof opt === "string" ? opt : opt.value}
          value={typeof opt === "string" ? opt : opt.value}
        >
          {typeof opt === "string" ? opt : opt.label}
        </option>
      ))}
    </select>
    <FieldError error={error} touched={touched} />
  </div>
);

const TextArea = ({ label, value, onChange, placeholder }) => (
  <div className="input-field">
    <label className="input-label">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      className="textarea-control"
    />
  </div>
);

export default function AppointmentsManager() {
  // State for appointments data <\>
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Pagination state <\>
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // UI state </>
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewFilter, setViewFilter] = useState("upcoming");

  const [formData, setFormData] = useState({
    title: "",
    doctor: "",
    type: "",
    date: "",
    time: "",
    location: "",
    address: "",
    phone: "",
    notes: "",
    reminder: "1-day",
  });

  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});

  const appointmentTypes = [
    "General Checkup",
    "Dental",
    "Eye Examination",
    "Cardiology",
    "Dermatology",
    "Physical Therapy",
    "Blood Test",
    "X-Ray/Imaging",
    "Specialist Consultation",
    "Follow-up Visit",
    "Other",
  ];

  const reminderOptions = [
    { value: "7-days", label: "1 Week Before" },
    { value: "1-day", label: "1 Day Before" },
    { value: "1-hours", label: "1 Hour Before" },
    { value: "30-minute", label: "30 Minutes Before" },
  ];

  // This code here Fetchs the appointments from API...
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await appointmentApi.getAppointments({
        page,
        pageSize,
      });

      setAppointments(response.appointments || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.total || 0);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  // Loads the appointments on mount and when dependencies change (especially after create/update/delete)
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const resetForm = () => {
    setFormData({
      title: "",
      doctor: "",
      type: "",
      date: "",
      time: "",
      location: "",
      address: "",
      phone: "",
      notes: "",
      reminder: "1-day",
    });
    setEditingId(null);
    setShowAddForm(false);
    setFormErrors({});
    setFormTouched({});
  };

  const handleSubmit = async () => {
    const err = {};
    if (!formData.title.trim()) err.title = ERROR_MESSAGES.REQUIRED;
    if (!formData.date) err.date = ERROR_MESSAGES.REQUIRED;
    if (!formData.time) err.time = ERROR_MESSAGES.REQUIRED;
    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) err.phone = phoneErr;

    // Adds past date/time validation as per Team Leader requested changes.
    if (formData.date && formData.time) {
      // Ensures the time is in HH:mm format before building the Date.
      const timeParts = formData.time.split(":");
      const hours = String(timeParts[0]).padStart(2, "0");
      const minutes = String(timeParts[1]).padStart(2, "0");
      const formattedTime = `${hours}:${minutes}`;

      const selectedAt = new Date(`${formData.date}T${formattedTime}:00`);
      if (Number.isNaN(selectedAt.getTime())) {
        err.time = "Invalid date/time";
      } else if (selectedAt < new Date()) {
        err.time =
          ERROR_MESSAGES.FUTURE_TIME ||
          "Appointment date and time cannot be in the past";
      }
    }

    if (Object.keys(err).length > 0) {
      setFormErrors(err);
      setFormTouched(
        Object.keys(formData).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {},
        ),
      );
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Ensures the time is in HH:mm format (24-hour) - strip seconds if present
      let formattedTime = formData.time;
      if (formattedTime) {
        const timeParts = formattedTime.split(":");
        if (timeParts.length >= 2) {
          const hours = String(timeParts[0]).padStart(2, "0");
          const minutes = String(timeParts[1]).padStart(2, "0");
          formattedTime = `${hours}:${minutes}`;
        }
      }

      const appointmentData = {
        title: formData.title,
        doctor: formData.doctor,
        type: formData.type,
        date: formData.date,
        time: formattedTime,
        location: formData.location,
        address: formData.address,
        phone: formData.phone,
        notes: formData.notes,
        reminder: formData.reminder,
      };

      // Fixed reversed create/update logic as per Team Leader requestd changes...
      if (editingId) {
        await appointmentApi.updateAppointment(editingId, appointmentData);
      } else {
        await appointmentApi.createAppointment(appointmentData);
      }

      toast.success(
        `Appointment ${editingId ? "updated" : "created"} successfully!`,
      );

      // Refreshs the appointments list to reflect the new/updated appointment and resets the form...
      await fetchAppointments();
      resetForm();
    } catch (err) {
      console.error("Error saving appointment:", err);
      toast.error(
        err.message || "Failed to save appointment. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (appointment) => {
    setFormData({
      title: appointment.title || "",
      doctor: appointment.doctor || "",
      type: appointment.type || "",
      date: appointment.date || "",
      time: appointment.time || "",
      location: appointment.location || "",
      address: appointment.address || "",
      phone: appointment.phone || "",
      notes: appointment.notes || "",
      reminder: appointment.reminder || "1-day",
    });
    setEditingId(appointment.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        setError(null);
        await appointmentApi.deleteAppointment(id);
        toast.success("Appointment deleted successfully!");
        // Refreshs the appointments list to reflect the deletion...
        await fetchAppointments();
      } catch (err) {
        console.error("Error deleting appointment:", err);
        toast.error(
          err.message || "Failed to delete appointment. Please try again.",
        );
      }
    }
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  });

  const now = new Date();
  const filteredAppointments = sortedAppointments.filter((apt) => {
    const aptDate = new Date(`${apt.date}T${apt.time}`);
    if (viewFilter === "upcoming") return aptDate >= now;
    if (viewFilter === "past") return aptDate < now;
    return true;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="appointments-container">
      <div className="appointments-wrapper">
        {/* Header */}
        <div className="appointments-header">
          <div className="header-title-section">
            <Calendar size={36} color="#005BBB" className="header-icon" />
            <h1 className="appointments-title">My Appointments</h1>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={fetchAppointments} className="btn-retry">
              Retry
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <div className="tab-section">
            {[
              { value: "upcoming", label: "Upcoming" },
              { value: "past", label: "Past" },
              { value: "all", label: "All" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setViewFilter(filter.value)}
                className={`filter-tab ${viewFilter === filter.value ? "active" : ""}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (showAddForm) {
                resetForm();
              } else {
                setShowAddForm(true);
                setEditingId(null);
              }
            }}
            className="btn-add-appointment"
            disabled={submitting}
          >
            {showAddForm ? <X size={24} /> : <Plus size={24} />}
            {showAddForm ? "Cancel" : "Add Appointment"}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="form-container">
            <h2 className="form-title">
              {editingId ? "Edit Appointment" : "Add New Appointment"}
            </h2>

            <div className="form-grid">
              <InputField
                label="Appointment Title"
                name="title"
                value={formData.title}
                onChange={(val) => {
                  setFormData({ ...formData, title: val });
                  if (formErrors.title)
                    setFormErrors((prev) => ({ ...prev, title: undefined }));
                }}
                onBlur={() =>
                  setFormTouched((prev) => ({ ...prev, title: true }))
                }
                error={formErrors.title}
                touched={formTouched.title}
                placeholder="e.g., Dr. Smith - Annual Checkup"
                required
              />

              <InputField
                label="Doctor's Name"
                name="doctor"
                value={formData.doctor}
                onChange={(val) => setFormData({ ...formData, doctor: val })}
                onBlur={() =>
                  setFormTouched((prev) => ({ ...prev, doctor: true }))
                }
                error={formErrors.doctor}
                touched={formTouched.doctor}
                placeholder="e.g., Dr. Robert Smith"
              />
            </div>

            <SelectField
              label="Appointment Type"
              name="type"
              value={formData.type}
              onChange={(val) => setFormData({ ...formData, type: val })}
              onBlur={() => setFormTouched((prev) => ({ ...prev, type: true }))}
              error={formErrors.type}
              touched={formTouched.type}
              options={appointmentTypes}
            />

            <div className="form-grid-narrow">
              <InputField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={(val) => {
                  setFormData({ ...formData, date: val });
                  if (formErrors.date)
                    setFormErrors((prev) => ({ ...prev, date: undefined }));
                }}
                onBlur={() =>
                  setFormTouched((prev) => ({ ...prev, date: true }))
                }
                error={formErrors.date}
                touched={formTouched.date}
                required
              />

              <InputField
                label="Time"
                name="time"
                type="time"
                value={formData.time}
                onChange={(val) => {
                  setFormData({ ...formData, time: val });
                  if (formErrors.time)
                    setFormErrors((prev) => ({ ...prev, time: undefined }));
                }}
                onBlur={() =>
                  setFormTouched((prev) => ({ ...prev, time: true }))
                }
                error={formErrors.time}
                touched={formTouched.time}
                required
              />
            </div>

            <InputField
              label="Location/Clinic Name"
              name="location"
              value={formData.location}
              onChange={(val) => setFormData({ ...formData, location: val })}
              onBlur={() =>
                setFormTouched((prev) => ({ ...prev, location: true }))
              }
              error={formErrors.location}
              touched={formTouched.location}
              placeholder="e.g., Main Street Medical Center"
            />

            <InputField
              label="Address"
              name="address"
              value={formData.address}
              onChange={(val) => setFormData({ ...formData, address: val })}
              onBlur={() =>
                setFormTouched((prev) => ({ ...prev, address: true }))
              }
              error={formErrors.address}
              touched={formTouched.address}
              placeholder="e.g., 123 Main St, Suite 200"
            />

            <InputField
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(val) => {
                setFormData({ ...formData, phone: val });
                if (formErrors.phone)
                  setFormErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              onBlur={() =>
                setFormTouched((prev) => ({ ...prev, phone: true }))
              }
              error={formErrors.phone}
              touched={formTouched.phone}
              placeholder="e.g., (555) 123-4567"
            />

            <SelectField
              label="Reminder"
              name="reminder"
              value={formData.reminder}
              onChange={(val) => setFormData({ ...formData, reminder: val })}
              options={reminderOptions}
            />

            <TextArea
              label="Notes"
              value={formData.notes}
              onChange={(val) => setFormData({ ...formData, notes: val })}
              placeholder="Any special instructions or things to remember..."
            />

            <div className="form-actions">
              <button
                onClick={handleSubmit}
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={24} className="spinner" />
                    {editingId ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Check size={24} />
                    {editingId ? "Update Appointment" : "Save Appointment"}
                  </>
                )}
              </button>

              <button
                onClick={resetForm}
                className="btn-cancel"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <Loader2 size={48} className="spinner" color="#005BBB" />
            <p>Loading appointments...</p>
          </div>
        )}

        {/* Appointments List */}
        {!loading && filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <Calendar size={64} color="#D0D0D0" className="empty-state-icon" />
            <h3 className="empty-state-title">
              No {viewFilter !== "all" ? viewFilter : ""} appointments
            </h3>
            <p className="empty-state-text">
              {viewFilter === "upcoming"
                ? "You have no upcoming appointments scheduled."
                : viewFilter === "past"
                  ? "No past appointments to show."
                  : 'Click "Add Appointment" to schedule your first appointment.'}
            </p>
          </div>
        ) : (
          !loading && (
            <div className="appointments-list">
              {filteredAppointments.map((apt) => {
                const isPast = new Date(`${apt.date}T${apt.time}`) < now;

                return (
                  <div
                    key={apt.id}
                    className={`appointment-card ${isPast ? "past" : ""}`}
                  >
                    <div className="appointment-header">
                      <div className="appointment-title-section">
                        <h3 className="appointment-title">{apt.title}</h3>
                        {apt.type && (
                          <div className="appointment-type-badge">
                            {apt.type}
                          </div>
                        )}
                      </div>

                      <div className="appointment-actions">
                        <button
                          onClick={() => handleEdit(apt)}
                          className="btn-edit"
                        >
                          <Edit2 size={18} />
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(apt.id)}
                          className="btn-delete"
                        >
                          <Trash2 size={18} />
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="appointment-details">
                      <div className="detail-item">
                        <Calendar
                          size={24}
                          color="#005BBB"
                          className="detail-icon"
                        />
                        <div>
                          <div className="detail-label">Date</div>
                          <div className="detail-value">
                            {formatDate(apt.date)}
                          </div>
                        </div>
                      </div>

                      <div className="detail-item">
                        <Clock
                          size={24}
                          color="#005BBB"
                          className="detail-icon"
                        />
                        <div>
                          <div className="detail-label">Time</div>
                          <div className="detail-value">
                            {formatTime(apt.time)}
                          </div>
                        </div>
                      </div>

                      {apt.doctor && (
                        <div className="detail-item">
                          <User
                            size={24}
                            color="#005BBB"
                            className="detail-icon"
                          />
                          <div>
                            <div className="detail-label">Doctor</div>
                            <div className="detail-value">{apt.doctor}</div>
                          </div>
                        </div>
                      )}

                      {apt.location && (
                        <div className="detail-item">
                          <MapPin
                            size={24}
                            color="#005BBB"
                            className="detail-icon"
                          />
                          <div>
                            <div className="detail-label">Location</div>
                            <div className="detail-value">{apt.location}</div>
                            {apt.address && (
                              <div className="detail-subvalue">
                                {apt.address}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {apt.phone && (
                        <div className="detail-item">
                          <Phone
                            size={24}
                            color="#005BBB"
                            className="detail-icon"
                          />
                          <div>
                            <div className="detail-label">Phone</div>
                            <div className="detail-value">{apt.phone}</div>
                          </div>
                        </div>
                      )}

                      {apt.reminder && (
                        <div className="detail-item">
                          <Bell
                            size={24}
                            color="#005BBB"
                            className="detail-icon"
                          />
                          <div>
                            <div className="detail-label">Reminder</div>
                            <div className="detail-value">
                              {reminderOptions.find(
                                (r) => r.value === apt.reminder,
                              )?.label || apt.reminder}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {apt.notes && (
                      <div className="appointment-notes">
                        <div className="notes-label">Notes:</div>
                        <div className="notes-text">{apt.notes}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {page} of {totalPages} ({totalCount} total)
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
