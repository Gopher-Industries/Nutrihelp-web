import React, { useState } from 'react';
import { Calendar, Clock, Plus, X, Edit2, Trash2, Bell, MapPin, User, Phone, Check } from 'lucide-react';
import './appointment.css';

// Move component definitions outside to prevent re-creation on each render
const InputField = ({ label, type = 'text', value, onChange, placeholder, required = false }) => (
  <div className="input-field">
    <label className="input-label">
      {label} {required && <span className="required-indicator">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-control"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, required = false }) => (
  <div className="input-field">
    <label className="input-label">
      {label} {required && <span className="required-indicator">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="select-control"
    >
      <option value="">Select...</option>
      {options.map(opt => (
        <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
          {typeof opt === 'string' ? opt : opt.label}
        </option>
      ))}
    </select>
  </div>
);

const TextArea = ({ label, value, onChange, placeholder }) => (
  <div className="input-field">
    <label className="input-label">
      {label}
    </label>
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
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      title: 'Dr. Smith - Annual Checkup',
      doctor: 'Dr. Robert Smith',
      type: 'General Checkup',
      date: '2024-12-05',
      time: '10:00',
      location: 'Main Street Medical Center',
      address: '123 Main St, Suite 200',
      phone: '(555) 123-4567',
      notes: 'Bring insurance card and list of current medications',
      reminder: '1-day'
    },
    {
      id: 2,
      title: 'Dr. Johnson - Eye Exam',
      doctor: 'Dr. Sarah Johnson',
      type: 'Eye Examination',
      date: '2024-12-10',
      time: '14:30',
      location: 'Vision Care Clinic',
      address: '456 Oak Avenue',
      phone: '(555) 987-6543',
      notes: 'Remember to bring current glasses',
      reminder: '1-hour'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewFilter, setViewFilter] = useState('upcoming');

  const [formData, setFormData] = useState({
    title: '',
    doctor: '',
    type: '',
    date: '',
    time: '',
    location: '',
    address: '',
    phone: '',
    notes: '',
    reminder: '1-day'
  });

  const appointmentTypes = [
    'General Checkup',
    'Dental',
    'Eye Examination',
    'Cardiology',
    'Dermatology',
    'Physical Therapy',
    'Blood Test',
    'X-Ray/Imaging',
    'Specialist Consultation',
    'Follow-up Visit',
    'Other'
  ];

  const reminderOptions = [
    { value: '1-week', label: '1 Week Before' },
    { value: '1-day', label: '1 Day Before' },
    { value: '1-hour', label: '1 Hour Before' },
    { value: '30-min', label: '30 Minutes Before' }
  ];

  const resetForm = () => {
    setFormData({
      title: '',
      doctor: '',
      type: '',
      date: '',
      time: '',
      location: '',
      address: '',
      phone: '',
      notes: '',
      reminder: '1-day'
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.date || !formData.time) {
      alert('Please fill in at least the appointment title, date, and time.');
      return;
    }

    if (editingId) {
      setAppointments(appointments.map(apt => 
        apt.id === editingId ? { ...formData, id: editingId } : apt
      ));
    } else {
      setAppointments([...appointments, { ...formData, id: Date.now() }]);
    }
    resetForm();
  };

  const handleEdit = (appointment) => {
    setFormData(appointment);
    setEditingId(appointment.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      setAppointments(appointments.filter(apt => apt.id !== id));
    }
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  });

  const now = new Date();
  const filteredAppointments = sortedAppointments.filter(apt => {
    const aptDate = new Date(`${apt.date}T${apt.time}`);
    if (viewFilter === 'upcoming') return aptDate >= now;
    if (viewFilter === 'past') return aptDate < now;
    return true;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
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
            <h1 className="appointments-title">
              My Appointments
            </h1>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <div className="tab-section">
            {[
              { value: 'upcoming', label: 'Upcoming'},
              { value: 'past', label: 'Past'},
              { value: 'all', label: 'All'}
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setViewFilter(filter.value)}
                className={`filter-tab ${viewFilter === filter.value ? 'active' : ''}`}
              >
              {filter.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-add-appointment"
          >
            {showAddForm ? <X size={24} /> : <Plus size={24} />}
            {showAddForm ? 'Cancel' : 'Add Appointment'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="form-container">
            <h2 className="form-title">
              {editingId ? 'Edit Appointment' : 'Add New Appointment'}
            </h2>

            <div className="form-grid">
              <InputField
                label="Appointment Title"
                value={formData.title}
                onChange={(val) => setFormData({ ...formData, title: val })}
                placeholder="e.g., Dr. Smith - Annual Checkup"
                required
              />
              
              <InputField
                label="Doctor's Name"
                value={formData.doctor}
                onChange={(val) => setFormData({ ...formData, doctor: val })}
                placeholder="e.g., Dr. Robert Smith"
              />
            </div>

            <SelectField
              label="Appointment Type"
              value={formData.type}
              onChange={(val) => setFormData({ ...formData, type: val })}
              options={appointmentTypes}
            />

            <div className="form-grid-narrow">
              <InputField
                label="Date"
                type="date"
                value={formData.date}
                onChange={(val) => setFormData({ ...formData, date: val })}
                required
              />
              
              <InputField
                label="Time"
                type="time"
                value={formData.time}
                onChange={(val) => setFormData({ ...formData, time: val })}
                required
              />
            </div>

            <InputField
              label="Location/Clinic Name"
              value={formData.location}
              onChange={(val) => setFormData({ ...formData, location: val })}
              placeholder="e.g., Main Street Medical Center"
            />

            <InputField
              label="Address"
              value={formData.address}
              onChange={(val) => setFormData({ ...formData, address: val })}
              placeholder="e.g., 123 Main St, Suite 200"
            />

            <InputField
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(val) => setFormData({ ...formData, phone: val })}
              placeholder="e.g., (555) 123-4567"
            />

            <SelectField
              label="Reminder"
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
              >
                <Check size={24} />
                {editingId ? 'Update Appointment' : 'Save Appointment'}
              </button>

              <button
                onClick={resetForm}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        )}


        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <Calendar size={64} color="#D0D0D0" className="empty-state-icon" />
            <h3 className="empty-state-title">
              No {viewFilter !== 'all' ? viewFilter : ''} appointments
            </h3>
            <p className="empty-state-text">
              {viewFilter === 'upcoming' ? 'You have no upcoming appointments scheduled.' : 
               viewFilter === 'past' ? 'No past appointments to show.' :
               'Click "Add Appointment" to schedule your first appointment.'}
            </p>
          </div>
        ) : (
          <div className="appointments-list">
            {filteredAppointments.map(apt => {
              const isPast = new Date(`${apt.date}T${apt.time}`) < now;
              
              return (
                <div
                  key={apt.id}
                  className={`appointment-card ${isPast ? 'past' : ''}`}
                >
                  <div className="appointment-header">
                    <div className="appointment-title-section">
                      <h3 className="appointment-title">
                        {apt.title}
                      </h3>
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
                      <Calendar size={24} color="#005BBB" className="detail-icon" />
                      <div>
                        <div className="detail-label">
                          Date
                        </div>
                        <div className="detail-value">
                          {formatDate(apt.date)}
                        </div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <Clock size={24} color="#005BBB" className="detail-icon" />
                      <div>
                        <div className="detail-label">
                          Time
                        </div>
                        <div className="detail-value">
                          {formatTime(apt.time)}
                        </div>
                      </div>
                    </div>

                    {apt.doctor && (
                      <div className="detail-item">
                        <User size={24} color="#005BBB" className="detail-icon" />
                        <div>
                          <div className="detail-label">
                            Doctor
                          </div>
                          <div className="detail-value">
                            {apt.doctor}
                          </div>
                        </div>
                      </div>
                    )}

                    {apt.location && (
                      <div className="detail-item">
                        <MapPin size={24} color="#005BBB" className="detail-icon" />
                        <div>
                          <div className="detail-label">
                            Location
                          </div>
                          <div className="detail-value">
                            {apt.location}
                          </div>
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
                        <Phone size={24} color="#005BBB" className="detail-icon" />
                        <div>
                          <div className="detail-label">
                            Phone
                          </div>
                          <div className="detail-value">
                            {apt.phone}
                          </div>
                        </div>
                      </div>
                    )}

                    {apt.reminder && (
                      <div className="detail-item">
                        <Bell size={24} color="#005BBB" className="detail-icon" />
                        <div>
                          <div className="detail-label">
                            Reminder
                          </div>
                          <div className="detail-value">
                            {reminderOptions.find(r => r.value === apt.reminder)?.label || apt.reminder}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {apt.notes && (
                    <div className="appointment-notes">
                      <div className="notes-label">
                        Notes:
                      </div>
                      <div className="notes-text">
                        {apt.notes}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}