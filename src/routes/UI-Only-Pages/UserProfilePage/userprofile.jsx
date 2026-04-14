"use client"

import { useContext, useMemo, useRef, useState, useEffect } from "react"
import { ArrowRight, KeyRound, ShieldCheck, TimerReset, Pencil, Save, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import profileLogo from "./NutriHelp-logos_black.png"
import { UserContext } from "../../../context/user.context"
import { supabase } from "../../../supabaseClient"
import ChangePasswordModal from "./ChangePasswordModal"
import profileApi from "../../../services/profileApi"


/* ============ CONSTANTS ============ */

const GOALS = [
  { id: "muscle", label: "Muscle Gain" },
  { id: "weightloss", label: "Weight Loss" },
  { id: "generalwell", label: "General Well-Being" },
  { id: "hypertension", label: "Hypertension Control" },
  { id: "hearthealth", label: "Heart Health" },
]

const INITIAL_FORM = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  goals: [],
  avatar: null,
}

const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "")
const phoneOk = (p) => /^[0-9]{8,15}$/.test((p || "").replace(/\s/g, ""))

/* ============ ISOLATED STYLES WITH RESPONSIVE DESIGN ============ */

const getPageStyles = (width) => ({
  minHeight: "100vh",
  background: "#f6f6f8",
  padding:
    width < 480
      ? "12px 8px"        // small mobile
      : width < 768
        ? "16px 12px"       // mobile
        : width < 1024
          ? "24px 16px"       // iPad / tablet
          : "32px 24px",      // desktop
  boxSizing: "border-box",
})

const getWrapperStyles = (width) => ({
  maxWidth: "1200px",
  margin: "0 auto",
  display: width < 768 ? "flex" : "grid",
  flexDirection: width < 768 ? "column" : undefined,
  gridTemplateColumns:
    width < 768
      ? "1fr"                 // mobile
      : width < 1024
        ? "240px 1fr"           // iPad / tablet
        : "260px 1fr",          // desktop

  gap: width < 768 ? "20px" : width < 1024 ? "28px" : "40px",
})

const getSidebarStyles = (width) => ({
  background: "transparent",
  display: "flex",
  flexDirection: width < 768 ? "row" : "column",
  alignItems: width < 768 ? "center" : "center",
  gap: width < 768 ? "16px" : "24px",
  width: width < 768 ? "100%" : "auto",
  maxWidth: width < 768 ? "100%" : "260px",
  justifyContent: width < 768 ? "space-around" : "flex-start",
})

const getAvatarStyles = (width) => ({
  width: width < 768 ? 90 : width < 1024 ? 120 : 140,
  height: width < 768 ? 90 : width < 1024 ? 120 : 140,
  borderRadius: "50%",
  objectFit: "cover",
  border: "4px solid #e5e5e7",
  background: "#fff",
  flexShrink: 0,
})

const getSidebarTitleStyles = (width) => ({
  fontSize: width < 768 ? 14 : width < 1024 ? 16 : 18,
  fontWeight: 600,
  borderBottom: "3px solid #2f6fed",
  width: width < 768 ? "auto" : "100%",
  textAlign: width < 768 ? "center" : "center",
  paddingBottom: 8,
  color: "#000",
  whiteSpace: "nowrap",
})

const getGoalListStyles = (width) => ({
  width: width < 768 ? "auto" : "100%",
  display: "flex",
  flexDirection: width < 768 ? "row" : "column",
  gap: width < 768 ? 12 : 18,
  marginTop: width < 768 ? 0 : 8,
  flexWrap: width < 768 ? "wrap" : "nowrap",
})

const getGoalItemStyles = (width) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  fontSize: width < 768 ? 12 : width < 1024 ? 13 : 14,
  color: "#555",
  cursor: "pointer",
  whiteSpace: "nowrap",
})

const getMainStyles = (width) => ({
  display: "flex",
  flexDirection: "column",
  gap: width < 768 ? 16 : width < 1024 ? 20 : 24,
})

const getCardStyles = (width) => ({
  background: "#fff",
  borderRadius: 12,
  padding: width < 768 ? 16 : width < 1024 ? 20 : 28,
  border: "1px solid #e5e5e7",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
})

const getTitleStyles = (width) => ({
  fontSize: width < 768 ? 20 : width < 1024 ? 24 : 28,
  fontWeight: 700,
  marginBottom: width < 768 ? 16 : width < 1024 ? 20 : 24,
  color: "#000",
})

const getGrid2Styles = (width) => ({
  display: "grid",
  gridTemplateColumns: width < 768 ? "1fr" : "1fr 1fr",
  gap: width < 768 ? 16 : 20,
  marginBottom: width < 768 ? 16 : 20,
})

const getFieldStyles = (width) => ({
  display: "flex",
  flexDirection: "column",
  gap: 6,
})

const getLabelStyles = (width) => ({
  fontSize: width < 768 ? 12 : width < 1024 ? 12 : 13,
  fontWeight: 600,
  color: "#222",
  userSelect: "none",
})

const getInputStyles = (width) => ({
  height: width < 768 ? 40 : 44,
  padding: "0 14px",
  borderRadius: 22,
  border: "1px solid #cfcfd4",
  fontSize: width < 768 ? 13 : 14,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  background: "#ffffff",
})

const getPhoneInputStyles = (width) => ({
  flex: 1,
  height: width < 768 ? 40 : 44,
  borderRadius: "0 22px 22px 0",
  border: "none",
  padding: "0 14px",
  fontSize: width < 768 ? 13 : 14,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  background: "#ffffff",
})

const getFileInputStyles = (width) => ({
  width: width < 768 ? 50 : 60,
  height: width < 768 ? 40 : 60,
  width: "100%",
  borderRadius: 22,
  border: "1px solid #cfcfd4",
  fontSize: width < 768 ? 13 : 14,
  cursor: "pointer",
  fontFamily: "inherit",
  background: "#ffffff",
  display: "flex",
  alignItems: "center",
})


const getButtonStyles = (width) => ({
  marginTop: width < 768 ? 8 : 10,
  padding: width < 768 ? "10px 20px" : "12px 28px",
  borderRadius: 8,
  border: "none",
  background: "#2f6fed",
  color: "#fff",
  fontSize: width < 768 ? 13 : 15,
  fontWeight: 600,
  cursor: "pointer",
  transition: "background 0.2s ease",
  width: width < 768 ? "100%" : "auto",
})

const getButtonHoverStyles = (width) => ({
  ...getButtonStyles(width),
  background: "#1e54d9",
})

const getPasswordPanelStyles = (width) => ({
  position: "relative",
  overflow: "hidden",
  borderRadius: width < 768 ? 18 : 24,
  padding: width < 768 ? "22px 18px" : width < 1024 ? "30px 24px" : "34px 30px",
  border: "1px solid rgba(30, 64, 175, 0.28)",
  background:
    "linear-gradient(136deg, #0f172a 0%, #1d4ed8 52%, #0f766e 128%)",
  boxShadow: "0 20px 46px rgba(15, 23, 42, 0.28)",
  display: "grid",
  gridTemplateColumns:
    width < 980 ? "1fr" : "minmax(0, 1.3fr) minmax(260px, 0.7fr)",
  gap: width < 980 ? 20 : 24,
  color: "#f8fafc",
})

const getPasswordOrbStyles = (position) => ({
  position: "absolute",
  width: position === "top" ? 220 : 260,
  height: position === "top" ? 220 : 260,
  borderRadius: "50%",
  pointerEvents: "none",
  zIndex: 0,
  top: position === "top" ? -90 : "auto",
  right: position === "top" ? -70 : "auto",
  left: position === "bottom" ? -100 : "auto",
  bottom: position === "bottom" ? -120 : "auto",
  background:
    position === "top"
      ? "radial-gradient(circle, rgba(165, 180, 252, 0.32), rgba(165, 180, 252, 0))"
      : "radial-gradient(circle, rgba(45, 212, 191, 0.24), rgba(45, 212, 191, 0))",
})

const getPasswordContentStyles = () => ({
  position: "relative",
  zIndex: 1,
})

const getPasswordBadgeStyles = () => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 999,
  border: "1px solid rgba(191, 219, 254, 0.35)",
  background: "rgba(15, 23, 42, 0.2)",
  color: "rgba(219, 234, 254, 0.98)",
  fontSize: 12,
  fontWeight: 700,
  padding: "6px 12px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 14,
})

const getPasswordHeadingStyles = (width) => ({
  margin: 0,
  fontSize: width < 768 ? 34 : width < 1024 ? 40 : 46,
  lineHeight: 1.08,
  letterSpacing: "-0.02em",
  fontWeight: 800,
  color: "#f8fafc",
  fontFamily: "\"Sora\", \"Poppins\", sans-serif",
})

const getPasswordDescriptionStyles = (width) => ({
  margin: "16px 0 0",
  maxWidth: 720,
  color: "rgba(226, 232, 240, 0.95)",
  fontSize: width < 768 ? 15 : 18,
  lineHeight: 1.55,
  fontWeight: 500,
  fontFamily: "\"Manrope\", \"Poppins\", sans-serif",
})

const getPasswordActionStyles = (width, hovered, disabled) => ({
  marginTop: width < 768 ? 20 : 24,
  minHeight: width < 768 ? 50 : 56,
  padding: width < 768 ? "0 20px" : "0 26px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.3)",
  background: disabled
    ? "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)"
    : hovered
      ? "linear-gradient(135deg, #ffffff 0%, #dbeafe 100%)"
      : "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
  color: disabled ? "#475569" : "#0f172a",
  fontSize: width < 768 ? 16 : 17,
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  width: width < 768 ? "100%" : "auto",
  cursor: disabled ? "not-allowed" : "pointer",
  boxShadow: disabled
    ? "none"
    : hovered
      ? "0 14px 28px rgba(30, 64, 175, 0.36)"
      : "0 12px 22px rgba(15, 23, 42, 0.24)",
  transform: hovered && !disabled ? "translateY(-2px)" : "translateY(0)",
  transition: "all 0.2s ease",
})

const getPasswordMetaStyles = (width) => ({
  position: "relative",
  zIndex: 1,
  display: "grid",
  gap: 12,
  marginTop: width < 980 ? 0 : 18,
})

const getPasswordMetaItemStyles = () => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  borderRadius: 12,
  padding: "11px 12px",
  border: "1px solid rgba(191, 219, 254, 0.28)",
  background: "rgba(15, 23, 42, 0.24)",
  color: "rgba(239, 246, 255, 0.98)",
  fontSize: 13,
  fontWeight: 600,
  fontFamily: "\"Manrope\", \"Poppins\", sans-serif",
})

const getPasswordWarningStyles = () => ({
  marginTop: 10,
  color: "#fef08a",
  fontSize: 13,
  fontWeight: 600,
})

/* ============ CUSTOM RADIO STYLES ============ */

const getRadioWrapStyles = () => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  cursor: "pointer",
  padding: "6px 4px",
  touchAction: "manipulation",
})

const getRadioOuterStyles = (checked) => ({
  width: 18,
  height: 18,
  borderRadius: "50%",
  border: "2px solid #2f6fed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#fff",
  boxSizing: "border-box",
})

const getRadioInnerStyles = (checked) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: checked ? "#2f6fed" : "transparent",
})

/* ============ COMPONENT ============ */

export default function UserAccountPage() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024)
  const [form, setForm] = useState(INITIAL_FORM)
  const [originalForm, setOriginalForm] = useState(INITIAL_FORM)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [hoveredButton, setHoveredButton] = useState(null)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fileRef = useRef(null)
  const navigate = useNavigate()
  const { currentUser, logOut, setCurrentUser } = useContext(UserContext)

  const storedSession = useMemo(() => {
    try {
      const raw = localStorage.getItem("user_session")
      return raw ? JSON.parse(raw) : null
    } catch (_error) {
      return null
    }
  }, [currentUser, isChangePasswordOpen])

  const currentUserId =
    currentUser?.id ||
    currentUser?.user_id ||
    storedSession?.id ||
    storedSession?.user_id ||
    ""

  const authToken =
    localStorage.getItem("auth_token") ||
    localStorage.getItem("jwt_token") ||
    currentUser?.token ||
    storedSession?.token ||
    ""

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await profileApi.fetchProfile();

        const mapped = {
          username: profile.name || "",
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: profile.email || "",
          phone: profile.contact_number || "",
          address: profile.address || "",
          goals: profile.goals ? (Array.isArray(profile.goals) ? profile.goals : [profile.goals]) : [],
          avatar: profile.image_url ? { url: profile.image_url } : null,
        };

        setForm(mapped);
        setOriginalForm(mapped);

      } catch (err) {
        console.error("Profile fetch error:", err);
        toast.error("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile()
  }, [])

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const mark = (k) => setTouched((t) => ({ ...t, [k]: true }))

  const errors = useMemo(() => {
    const e = {}
    if (touched.firstName && !form.firstName) e.firstName = "Required"
    if (touched.email && !emailOk(form.email)) e.email = "Invalid email"
    if (touched.phone && !phoneOk(form.phone)) e.phone = "Invalid phone"
    return e
  }, [form, touched])

  const onPick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    set("avatar", { file, url: URL.createObjectURL(file) })
  }

  const handleSaveChanges = async () => {
    setFieldErrors({});
    if (!isEditing) return;

    try {
      setIsSubmitting(true);
      const payload = {
        name: form.username,
        first_name: form.firstName,
        last_name: form.lastName,
        contact_number: form.phone,
        address: form.address
      };

      // If a new avatar file was selected, convert to base64
      if (form.avatar && form.avatar.file) {
        try {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(form.avatar.file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
          });
          payload.user_image = base64;
        } catch (e) {
          console.error("Avatar conversion error:", e);
        }
      }

      const updated = await profileApi.updateProfile(payload);

      // Success
      const mapped = {
        username: updated.name || "",
        firstName: updated.first_name || "",
        lastName: updated.last_name || "",
        email: updated.email || "",
        phone: updated.contact_number || "",
        address: updated.address || "",
        goals: updated.goals ? (Array.isArray(updated.goals) ? updated.goals : [updated.goals]) : [],
        avatar: updated.image_url ? { url: updated.image_url } : (form.avatar ? form.avatar : null),
      };

      setForm(mapped);
      setOriginalForm(mapped);
      setIsEditing(false);
      toast.success("Profile updated successfully.");
    } catch (err) {
      if (err.details && Array.isArray(err.details)) {
        const errors = {};
        err.details.forEach(d => {
          // Map backend fields to frontend keys
          if (d.field === 'name') errors.username = d.message;
          if (d.field === 'first_name') errors.firstName = d.message;
          if (d.field === 'last_name') errors.lastName = d.message;
          if (d.field === 'contact_number') errors.phone = d.message;
          if (d.field === 'address') errors.address = d.message;
        });
        setFieldErrors(errors);
        toast.error("Please fix the validation errors.");
      } else {
        toast.error(err.message || "Failed to update profile.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCancelEdit = () => {
    setForm(originalForm);
    setFieldErrors({});
    setIsEditing(false);
  }

  const getDisplayName = () => {
    if (form.username) return form.username;
    if (form.firstName || form.lastName) return `${form.firstName} ${form.lastName}`.trim();
    return form.email.split('@')[0];
  }

  const completeLogoutAndRedirect = async () => {
    try {
      await supabase.auth.signOut()
    } catch (_error) {
      // Ignore Supabase sign-out errors and continue local/session cleanup.
    }

    localStorage.removeItem("auth_token")
    localStorage.removeItem("jwt_token")
    localStorage.removeItem("user_session")

    if (typeof logOut === "function") {
      logOut()
    } else if (typeof setCurrentUser === "function") {
      setCurrentUser(null)
    }

    navigate("/login", { replace: true })
  }

  const handlePasswordUpdated = async () => {
    toast.success("Password changed successfully. Please sign in again.")
    await completeLogoutAndRedirect()
  }

  const handlePasswordSessionExpired = async (message) => {
    toast.info(message || "Session expired. Please sign in again.")
    await completeLogoutAndRedirect()
  }

  return (
    <div style={getPageStyles(width)}>
      <div style={getWrapperStyles(width)}>
        {/* ===== SIDEBAR ===== */}
        <aside style={getSidebarStyles(width)}>
          <img
            src={form.avatar?.url || profileLogo}
            alt="User profile avatar"
            style={getAvatarStyles(width)}
          />

          <div
            style={{
              display: "flex",
              flexDirection: width < 768 ? "row" : "column",
              gap: width < 768 ? 12 : 12,
              alignItems: "center",
              width: width < 768 ? "auto" : "100%",
            }}
          >
            <div style={getSidebarTitleStyles(width)}>{getDisplayName()}</div>
            <div style={{ fontSize: 13, color: "#666", marginTop: -15, marginBottom: 10 }}>Account Profile</div>

            <div style={getGoalListStyles(width)}>
              {GOALS.map((g) => (
                <label
                  key={g.id}
                  style={{ ...getRadioWrapStyles(), opacity: isEditing ? 1 : 0.6, cursor: isEditing ? 'pointer' : 'not-allowed' }}
                  onClick={() => isEditing && set("goals", [g.id])}
                >
                  <span style={getRadioOuterStyles(form.goals.includes(g.id))}>
                    <span style={getRadioInnerStyles(form.goals.includes(g.id))} />
                  </span>

                  <span style={{ color: "#000", fontWeight: 500 }}>
                    {g.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main style={getMainStyles(width)}>
          {/* Personal Details Section */}
          <section style={{ ...getCardStyles(width), position: 'relative' }}>
            {isLoading && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(255,255,255,0.7)', zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 12
              }}>
                <div className="spinner" style={{
                  width: 30, height: 30, border: '3px solid #f3f3f3',
                  borderTop: '3px solid #2f6fed', borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <h2 style={{ ...getTitleStyles(width), marginBottom: 0 }}>Personal Details</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2f6fed', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                >
                  <Pencil size={16} /> Edit
                </button>
              )}
            </div>

            <div style={getGrid2Styles(width)}>
              <FormField
                label="Username"
                value={form.username}
                onChange={(v) => set("username", v)}
                error={fieldErrors.username}
                disabled={!isEditing}
                width={width}
              />
              <FormField
                label="Email"
                type="email"
                value={form.email}
                disabled={true}
                width={width}
              />
            </div>

            <div style={getGrid2Styles(width)}>
              <FormField
                label="First Name"
                value={form.firstName}
                onChange={(v) => set("firstName", v)}
                error={fieldErrors.firstName}
                disabled={!isEditing}
                width={width}
              />
              <FormField
                label="Last Name"
                value={form.lastName}
                onChange={(v) => set("lastName", v)}
                error={fieldErrors.lastName}
                disabled={!isEditing}
                width={width}
              />
            </div>

            <div style={getGrid2Styles(width)}>
              <div style={getFieldStyles(width)}>
                <label style={getLabelStyles(width)}>Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter phone number"
                  style={{ ...getInputStyles(width), borderColor: fieldErrors.phone ? '#e11d48' : '#cfcfd4' }}
                />
                {fieldErrors.phone && (
                  <div style={{ fontSize: 12, color: "#e11d48", marginTop: 4 }}>
                    {fieldErrors.phone}
                  </div>
                )}
              </div>
              <FormField
                label="Address"
                value={form.address}
                onChange={(v) => set("address", v)}
                error={fieldErrors.address}
                disabled={!isEditing}
                width={width}
              />
            </div>

            {isEditing && (
              <div style={getFieldStyles(width)}>
                <label style={getLabelStyles(width)}>Update Profile Picture</label>
                <input type="file" ref={fileRef} style={getFileInputStyles(width)} onChange={onPick} accept="image/*" />
              </div>
            )}

            {isEditing && (
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  style={{ ...getButtonStyles(width), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isSubmitting ? 0.7 : 1 }}
                  onClick={handleSaveChanges}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : <><Save size={18} /> Save</>}
                </button>
                <button
                  style={{ ...getButtonStyles(width), background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  <X size={18} /> Cancel
                </button>
              </div>
            )}
          </section>

          {/* Your Password Section */}
          <section style={getPasswordPanelStyles(width)}>
            <div style={getPasswordOrbStyles("top")} />
            <div style={getPasswordOrbStyles("bottom")} />

            <div style={getPasswordContentStyles()}>
              <div style={getPasswordBadgeStyles()}>
                <ShieldCheck size={14} />
                Account Security
              </div>

              <h2 style={getPasswordHeadingStyles(width)}>Your Password</h2>

              <p style={getPasswordDescriptionStyles(width)}>
                Guard your account with a secure 2-step password update flow.
                First verify your current password, then set a stronger new one
                with real-time validation.
              </p>

              <button
                style={getPasswordActionStyles(
                  width,
                  hoveredButton === "changePassword",
                  !currentUserId
                )}
                onMouseEnter={() => setHoveredButton("changePassword")}
                onMouseLeave={() => setHoveredButton(null)}
                onClick={() => setIsChangePasswordOpen(true)}
                disabled={!currentUserId}
              >
                Change Password
                <ArrowRight size={18} />
              </button>

              {!currentUserId ? (
                <div style={getPasswordWarningStyles()}>
                  Unable to load your account session. Please sign in again.
                </div>
              ) : null}
            </div>

            <div style={getPasswordMetaStyles(width)}>
              <div style={getPasswordMetaItemStyles()}>
                <KeyRound size={16} />
                Current password verification gate
              </div>
              <div style={getPasswordMetaItemStyles()}>
                <ShieldCheck size={16} />
                Inline strength and mismatch checks
              </div>
              <div style={getPasswordMetaItemStyles()}>
                <TimerReset size={16} />
                Session protection after update
              </div>
            </div>
          </section>
        </main>

        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onRequestClose={() => setIsChangePasswordOpen(false)}
          userId={currentUserId}
          authToken={authToken}
          onPasswordUpdated={handlePasswordUpdated}
          onSessionExpired={handlePasswordSessionExpired}
        />
      </div>
    </div>
  )
}

/* ============ FORM FIELD COMPONENT ============ */

function FormField({ label, type = "text", value, onChange, onBlur, error, disabled, width }) {
  return (
    <div style={getFieldStyles(width)}>
      <label style={getLabelStyles(width)}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        style={{ ...getInputStyles(width), backgroundColor: disabled ? "#f8fafc" : "#ffffff", cursor: disabled ? "not-allowed" : "text", borderColor: error ? '#e11d48' : '#cfcfd4' }}
      />
      {error && <div style={{ fontSize: 12, color: "#e11d48", marginTop: 4 }}>{error}</div>}
    </div>
  )
}