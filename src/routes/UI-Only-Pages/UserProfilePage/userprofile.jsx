  "use client"

  import { useContext, useMemo, useRef, useState, useEffect } from "react"
  import { ArrowRight, KeyRound, Pencil, ShieldCheck, TimerReset } from "lucide-react"
  import { useNavigate } from "react-router-dom"
  import { toast } from "react-toastify"
  import profileLogo from "./NutriHelp-logos_black.png"
  import { UserContext } from "../../../context/user.context"
  import profileApi from "../../../services/profileApi"
  import { supabase } from "../../../supabaseClient"
  import ChangePasswordModal from "./ChangePasswordModal"


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

  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8081"

  const EMPTY_PREFERENCES = {
    dietary_requirements: [],
    allergies: [],
    cuisines: [],
    dislikes: [],
    health_conditions: [],
    spice_levels: [],
    cooking_methods: [],
  }

  const PREFERENCE_GROUPS = [
    { key: "dietary_requirements", label: "Dietary Requirements", accent: "#0f766e" },
    { key: "allergies", label: "Allergies & Intolerances", accent: "#b91c1c" },
    { key: "cuisines", label: "Preferred Cuisines", accent: "#1d4ed8" },
    { key: "dislikes", label: "Disliked Ingredients", accent: "#7c3aed" },
    { key: "health_conditions", label: "Health Conditions", accent: "#c2410c" },
    { key: "spice_levels", label: "Spice Levels", accent: "#be123c" },
    { key: "cooking_methods", label: "Cooking Methods", accent: "#0369a1" },
  ]

  const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "")
  const phoneOk = (p) => /^[0-9]{8,15}$/.test((p || "").replace(/\s/g, ""))

  const toTitleLabel = (value = "") =>
    String(value)
      .replace(/_/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")

  const toDisplayList = (items) => {
    if (!Array.isArray(items)) return []

    return [
      ...new Set(
        items
          .map((item) => {
            if (typeof item === "string") return item
            if (item && typeof item === "object") return item.name || item.label || null
            return null
          })
          .filter(Boolean)
          .map((value) => toTitleLabel(value))
      ),
    ]
  }

  const normalizePreferences = (payload) => {
    const data = payload && typeof payload === "object" ? payload : {}
    return {
      dietary_requirements: toDisplayList(data.dietary_requirements),
      allergies: toDisplayList(data.allergies),
      cuisines: toDisplayList(data.cuisines),
      dislikes: toDisplayList(data.dislikes),
      health_conditions: toDisplayList(data.health_conditions),
      spice_levels: toDisplayList(data.spice_levels),
      cooking_methods: toDisplayList(data.cooking_methods),
    }
  }

  const toUsernameFromEmail = (email = "") => String(email || "").split("@")[0] || ""

  const splitFullName = (fullName = "") => {
    const cleaned = String(fullName || "").trim().replace(/\s+/g, " ")
    if (!cleaned) return { firstName: "", lastName: "" }
    const parts = cleaned.split(" ")
    if (parts.length === 1) return { firstName: parts[0], lastName: "" }
    return {
      firstName: parts.slice(0, -1).join(" "),
      lastName: parts.slice(-1).join(""),
    }
  }

  const normalizeAddress = (value = "") => {
    const cleaned = String(value || "").trim()
    if (!cleaned) return ""
    if (/placeholder/i.test(cleaned)) return ""
    if (/address\s*123/i.test(cleaned)) return ""
    return cleaned
  }

  const withAvatarCacheBust = (url = "") => {
    const raw = String(url || "").trim()
    if (!raw) return ""
    if (raw.includes("token=")) return raw
    const separator = raw.includes("?") ? "&" : "?"
    return `${raw}${separator}t=${Date.now()}`
  }

  const mapProfilePayloadToForm = (payload, fallbackEmail = "") => {
    const profile = payload && typeof payload === "object" ? payload : {}
    const email = String(profile.email || fallbackEmail || "").trim()

    let firstName = String(profile.firstName || profile.first_name || "").trim()
    let lastName = String(profile.lastName || profile.last_name || "").trim()
    const fullName = String(profile.fullName || profile.full_name || profile.name || "").trim()

    if (!firstName && !lastName && fullName) {
      const splitName = splitFullName(fullName)
      firstName = splitName.firstName
      lastName = splitName.lastName
    }

    const username = String(
      profile.username ||
        profile.user_name ||
        profile.userName ||
        toUsernameFromEmail(email)
    ).trim()

    const avatarUrl = String(profile.imageUrl || profile.image_url || profile.avatar || "").trim()

    return {
      username,
      firstName,
      lastName,
      email,
      phone: String(profile.contactNumber || profile.contact_number || profile.phone || "").trim(),
      address: normalizeAddress(profile.address),
      goals: [],
      avatar: avatarUrl ? { url: withAvatarCacheBust(avatarUrl) } : null,
    }
  }

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "")
      reader.onerror = () => reject(new Error("Unable to read the selected image"))
      reader.readAsDataURL(file)
    })

  const syncStoredUserSession = (profile, setCurrentUser) => {
    try {
      const raw = localStorage.getItem("user_session")
      const session = raw ? JSON.parse(raw) : {}
      const normalized = mapProfilePayloadToForm(profile || {}, session.email || "")
      const fullName = [normalized.firstName, normalized.lastName].filter(Boolean).join(" ").trim()
      const avatarUrl = normalized.avatar?.url || session.image_url || ""
      const nextSession = {
        ...session,
        id: profile.id || session.id,
        user_id: profile.id || session.user_id,
        email: normalized.email || session.email,
        username: normalized.username || session.username,
        first_name: normalized.firstName || session.first_name,
        last_name: normalized.lastName || session.last_name,
        contact_number: normalized.phone || session.contact_number,
        address: normalized.address || session.address,
        name: fullName || normalized.username || normalized.email || session.name,
        image_url: avatarUrl,
      }

      localStorage.setItem("user_session", JSON.stringify(nextSession))

      if (typeof setCurrentUser === "function") {
        setCurrentUser((prev) => ({
          ...(prev || {}),
          ...nextSession,
        }))
      }
    } catch (_error) {
      // Ignore session sync issues; the profile save already succeeded.
    }
  }

  const parseApiError = async (response, fallback) => {
    if (!response) return fallback
    try {
      const json = await response.clone().json()
      if (json && typeof json === "object") {
        return json.error || json.message || fallback
      }
    } catch (_error) {
      // no-op
    }
    try {
      const text = await response.text()
      return text || fallback
    } catch (_error) {
      return fallback
    }
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const fetchWithRetry = async (
    url,
    options = {},
    {
      attempts = 3,
      retryStatuses = [408, 429, 500, 502, 503, 504],
    } = {}
  ) => {
    let lastError = null

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const response = await fetch(url, options)

        if (response.ok) return response

        if (attempt < attempts && retryStatuses.includes(response.status)) {
          await sleep(120 * attempt)
          continue
        }

        return response
      } catch (error) {
        lastError = error
        if (attempt === attempts) break
        await sleep(120 * attempt)
      }
    }

    throw lastError || new Error("Network request failed")
  }

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

  const getSidebarNameStyles = (width) => ({
    fontSize: width < 768 ? 24 : width < 1024 ? 28 : 40,
    lineHeight: 1.1,
    fontWeight: 700,
    color: "#111827",
    textAlign: "center",
    wordBreak: "break-word",
    maxWidth: "100%",
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

  const getPreferenceCardStyles = (width) => ({
    borderRadius: width < 768 ? 16 : 20,
    padding: width < 768 ? 18 : width < 1024 ? 22 : 26,
    border: "1px solid #dbe4f6",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    boxShadow: "0 14px 28px rgba(15, 23, 42, 0.08)",
  })

  const getPreferenceHeaderStyles = (width) => ({
    display: "flex",
    flexDirection: width < 768 ? "column" : "row",
    alignItems: width < 768 ? "stretch" : "flex-start",
    justifyContent: "space-between",
    gap: width < 768 ? 12 : 16,
    marginBottom: width < 768 ? 14 : 18,
  })

  const getPreferenceTitleStyles = (width) => ({
    margin: 0,
    fontSize: width < 768 ? 22 : width < 1024 ? 25 : 28,
    lineHeight: 1.15,
    color: "#0f172a",
    fontWeight: 800,
    fontFamily: "\"Sora\", \"Poppins\", sans-serif",
  })

  const getPreferenceSubtitleStyles = (width) => ({
    margin: "8px 0 0",
    color: "#475569",
    fontSize: width < 768 ? 13 : 14,
    lineHeight: 1.5,
  })

  const getPreferenceActionStyles = (width, hovered) => ({
    minHeight: 42,
    border: "none",
    borderRadius: 12,
    padding: width < 768 ? "10px 14px" : "10px 16px",
    background: hovered
      ? "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)"
      : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: "pointer",
    boxShadow: hovered ? "0 10px 20px rgba(30, 64, 175, 0.28)" : "0 8px 16px rgba(37, 99, 235, 0.22)",
    transition: "all 0.18s ease",
    alignSelf: width < 768 ? "flex-start" : "center",
  })

  const getPreferenceGridStyles = (width) => ({
    display: "grid",
    gridTemplateColumns: width < 768 ? "1fr" : width < 1100 ? "1fr 1fr" : "1fr 1fr 1fr",
    gap: 12,
  })

  const getPreferenceGroupStyles = () => ({
    borderRadius: 14,
    border: "1px solid #dbe3f4",
    background: "#ffffff",
    padding: "12px 12px 14px",
    minHeight: 114,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  })

  const getPreferenceGroupHeaderStyles = () => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    color: "#1e293b",
    fontWeight: 700,
    fontSize: 13,
  })

  const getPreferenceCountStyles = () => ({
    minWidth: 22,
    height: 22,
    borderRadius: 999,
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 7px",
  })

  const getPreferenceChipWrapStyles = () => ({
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
  })

  const getPreferenceChipStyles = (accent) => ({
    borderRadius: 999,
    border: `1px solid ${accent}33`,
    background: `${accent}12`,
    color: accent,
    fontSize: 12,
    fontWeight: 600,
    padding: "5px 9px",
    lineHeight: 1.2,
  })

  const getPreferenceEmptyStyles = () => ({
    borderRadius: 999,
    border: "1px dashed #cbd5e1",
    color: "#64748b",
    fontSize: 12,
    fontWeight: 600,
    padding: "5px 9px",
    background: "#f8fafc",
  })

  const getPreferenceInfoStyles = (isError = false) => ({
    borderRadius: 12,
    padding: "12px 14px",
    border: isError ? "1px solid #fecaca" : "1px solid #dbeafe",
    background: isError ? "#fff1f2" : "#eff6ff",
    color: isError ? "#b91c1c" : "#1d4ed8",
    fontSize: 13,
    fontWeight: 600,
  })

  const getCardHeaderStyles = (width) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: width < 768 ? 16 : width < 1024 ? 20 : 24,
    flexWrap: "wrap",
  })

  const getTitleStyles = (width) => ({
    fontSize: width < 768 ? 20 : width < 1024 ? 24 : 28,
    fontWeight: 700,
    margin: 0,
    color: "#000",
  })

  const getEditToggleButtonStyles = (hovered, disabled = false) => ({
    border: "none",
    background: "transparent",
    color: disabled ? "#94a3b8" : hovered ? "#1d4ed8" : "#2f6fed",
    fontSize: 16,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    cursor: disabled ? "not-allowed" : "pointer",
    padding: "4px 0",
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

  const getInputStyles = (width, disabled = false, hasError = false) => ({
    height: width < 768 ? 40 : 44,
    padding: "0 14px",
    borderRadius: 22,
    border: hasError ? "1px solid #ef4444" : "1px solid #cfcfd4",
    fontSize: width < 768 ? 13 : 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    background: disabled ? "#f1f5f9" : "#ffffff",
    color: disabled ? "#64748b" : "#111827",
    cursor: disabled ? "not-allowed" : "text",
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

  const getSecondaryButtonStyles = (width, hovered = false) => ({
    marginTop: width < 768 ? 8 : 10,
    padding: width < 768 ? "10px 20px" : "12px 28px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: hovered ? "#f1f5f9" : "#ffffff",
    color: "#475569",
    fontSize: width < 768 ? 13 : 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s ease",
    width: width < 768 ? "100%" : "auto",
  })

  const getButtonRowStyles = (width) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexDirection: width < 768 ? "column" : "row",
    marginTop: 8,
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
    const [serverSnapshot, setServerSnapshot] = useState(INITIAL_FORM)
    const [isEditing, setIsEditing] = useState(false)
    const [isProfileLoading, setIsProfileLoading] = useState(true)
    const [profileError, setProfileError] = useState("")
    const [profileReloadKey, setProfileReloadKey] = useState(0)
    const [isSaving, setIsSaving] = useState(false)
    const [preferences, setPreferences] = useState(EMPTY_PREFERENCES)
    const [preferencesLoading, setPreferencesLoading] = useState(true)
    const [preferencesError, setPreferencesError] = useState("")
    const [touched, setTouched] = useState({})
    const [serverFieldErrors, setServerFieldErrors] = useState({})
    const [hoveredButton, setHoveredButton] = useState(null)
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
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
      localStorage.getItem("token") ||
      sessionStorage.getItem("jwt_token") ||
      sessionStorage.getItem("token") ||
      currentUser?.token ||
      storedSession?.token ||
      ""

    const fallbackEmail = currentUser?.email || storedSession?.email || ""

  useEffect(() => {
    let mounted = true

    const fetchProfile = async () => {
      setIsProfileLoading(true)
      setProfileError("")

      try {
        if (!authToken) {
          throw new Error("Please sign in again to load your profile.")
        }

        const profile = await profileApi.fetchProfile(authToken)
        const mappedForm = mapProfilePayloadToForm(profile, fallbackEmail)

        if (!mounted) return

        setForm((prev) => ({
          ...prev,
          ...mappedForm,
          goals: prev.goals,
        }))
        setServerSnapshot((prev) => ({
          ...prev,
          ...mappedForm,
          goals: prev.goals,
        }))
        setTouched({})
        setServerFieldErrors({})
      } catch (error) {
        if (mounted) {
          setProfileError(error?.message || "Unable to load profile.")
        }
      } finally {
        if (mounted) {
          setIsProfileLoading(false)
        }
      }
    }

    fetchProfile()

    return () => {
      mounted = false
    }
  }, [authToken, fallbackEmail, isChangePasswordOpen, profileReloadKey])

  useEffect(() => {
    let mounted = true

    const fetchPreferences = async () => {
      setPreferencesLoading(true)
      setPreferencesError("")

      try {
        const sessionRaw = localStorage.getItem("user_session")
        const parsedSession = sessionRaw ? JSON.parse(sessionRaw) : null
        const token =
          localStorage.getItem("auth_token") ||
          localStorage.getItem("jwt_token") ||
          parsedSession?.token ||
          currentUser?.token

        if (!token) {
          if (mounted) {
            setPreferencesError("Sign in to view your saved dietary preferences.")
            setPreferences(EMPTY_PREFERENCES)
          }
          return
        }

        const res = await fetchWithRetry(`${API_BASE}/api/user/preferences`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.status === 404) {
          if (mounted) setPreferences(EMPTY_PREFERENCES)
          return
        }

        if (!res.ok) {
          const fallback =
            res.status >= 500
              ? "Temporary server issue while loading preferences. Please refresh."
              : "Unable to load dietary preferences."
          const reason = await parseApiError(res, fallback)
          throw new Error(reason)
        }

        const data = await res.json()
        if (mounted) {
          setPreferences(normalizePreferences(data))
        }
      } catch (error) {
        if (mounted) {
          setPreferencesError(error?.message || "Unable to load dietary preferences.")
        }
      } finally {
        if (mounted) {
          setPreferencesLoading(false)
        }
      }
    }

    fetchPreferences()

    return () => {
      mounted = false
    }
  }, [currentUser, isChangePasswordOpen])

    useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth)
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }, [])

    const set = (k, v) => {
      setForm((f) => ({ ...f, [k]: v }))
      setServerFieldErrors((prev) => {
        if (!prev[k]) return prev
        const next = { ...prev }
        delete next[k]
        return next
      })
    }

    const mark = (k) => setTouched((t) => ({ ...t, [k]: true }))

    const clientErrors = useMemo(() => {
      const e = {}
      if (touched.username && !form.username?.trim()) e.username = "Username is required."
      if (touched.firstName && !form.firstName?.trim()) e.firstName = "First name is required."
      if (touched.email && !emailOk(form.email)) e.email = "Please enter a valid email address."
      if (touched.phone && form.phone && !phoneOk(form.phone)) e.phone = "Phone must contain 8-15 digits."
      if (touched.address && form.address?.trim().length > 255) e.address = "Address must be 255 characters or less."
      return e
    }, [form, touched])

    const inlineErrors = useMemo(
      () => ({
        ...clientErrors,
        ...serverFieldErrors,
      }),
      [clientErrors, serverFieldErrors]
    )

    const onPick = (e) => {
      if (!isEditing) return
      const file = e.target.files?.[0]
      if (!file) return
      set("avatar", { file, url: URL.createObjectURL(file) })
    }

    const beginEdit = () => {
      if (!authToken || isProfileLoading) return
      setIsEditing(true)
      setTouched({})
      setServerFieldErrors({})
      setProfileError("")
    }

    const cancelEdit = () => {
      setForm((prev) => ({
        ...prev,
        ...serverSnapshot,
        goals: prev.goals,
      }))
      setTouched({})
      setServerFieldErrors({})
      setIsEditing(false)
      if (fileRef.current) {
        fileRef.current.value = ""
      }
    }

    const validateBeforeSave = () => {
      const nextTouched = {
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
      }
      setTouched((prev) => ({ ...prev, ...nextTouched }))

      const errors = {}
      if (!form.username?.trim()) errors.username = "Username is required."
      if (!form.firstName?.trim()) errors.firstName = "First name is required."
      if (!emailOk(form.email)) errors.email = "Please enter a valid email address."
      if (form.phone && !phoneOk(form.phone)) errors.phone = "Phone must contain 8-15 digits."
      if (form.address?.trim().length > 255) errors.address = "Address must be 255 characters or less."
      return errors
    }

    const handleSaveChanges = async () => {
      if (!isEditing) return

      const validationErrors = validateBeforeSave()
      setServerFieldErrors({})

      if (Object.keys(validationErrors).length > 0) {
        return
      }

      if (!authToken) {
        toast.error("Please sign in again before saving your profile.")
        return
      }

      setIsSaving(true)

      try {
        const payload = {
          username: form.username.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          contactNumber: form.phone.replace(/\s/g, ""),
          address: form.address.trim(),
        }

        if (form.avatar?.file) {
          payload.userImage = await fileToDataUrl(form.avatar.file)
        }

        const savedProfile = await profileApi.updateProfile(payload, authToken)
        const nextForm = mapProfilePayloadToForm(savedProfile, payload.email)

        setForm((prev) => ({
          ...prev,
          ...nextForm,
          goals: prev.goals,
        }))
        setServerSnapshot((prev) => ({
          ...prev,
          ...nextForm,
          goals: prev.goals,
        }))
        setTouched({})
        setServerFieldErrors({})
        setIsEditing(false)

        syncStoredUserSession(savedProfile, setCurrentUser)
        toast.success("Profile changes saved.")
      } catch (error) {
        const mappedFieldErrors =
          error?.fieldErrors && typeof error.fieldErrors === "object" ? error.fieldErrors : {}
        setServerFieldErrors(mappedFieldErrors)
        setTouched((prev) => ({
          ...prev,
          ...Object.keys(mappedFieldErrors).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
        }))
        toast.error(error?.message || "Unable to save your profile right now.")
      } finally {
        setIsSaving(false)
      }
    }

    const completeLogoutAndRedirect = async () => {
      try {
        await supabase.auth.signOut()
      } catch (_error) {
        // Ignore Supabase sign-out errors and continue local/session cleanup.
      }

      localStorage.removeItem("auth_token")
      localStorage.removeItem("jwt_token")
      localStorage.removeItem("sso_session")
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

    const sidebarDisplayName = useMemo(() => {
      const firstLast = [form.firstName, form.lastName].filter(Boolean).join(" ").trim()
      return firstLast || form.username?.trim() || form.email?.trim() || "Account"
    }, [form.firstName, form.lastName, form.username, form.email])

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
            <div style={getSidebarNameStyles(width)}>{sidebarDisplayName}</div>

            <div
              style={{
                display: "flex",
                flexDirection: width < 768 ? "row" : "column",
                gap: width < 768 ? 12 : 24,
                alignItems: "center",
                width: width < 768 ? "auto" : "100%",
              }}
            >
              <div style={getSidebarTitleStyles(width)}>Account</div>

              <div style={getGoalListStyles(width)}>
                {GOALS.map((g) => (
                  <label
                    key={g.id}
                    style={getRadioWrapStyles()}
                    onClick={() => set("goals", [g.id])}
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
            <section style={getCardStyles(width)}>
              <div style={getCardHeaderStyles(width)}>
                <h2 style={getTitleStyles(width)}>Personal Details</h2>
                {!isEditing ? (
                  <button
                    type="button"
                    style={getEditToggleButtonStyles(hoveredButton === "edit", !authToken || isProfileLoading)}
                    onMouseEnter={() => setHoveredButton("edit")}
                    onMouseLeave={() => setHoveredButton(null)}
                    onClick={beginEdit}
                    disabled={!authToken || isProfileLoading}
                  >
                    <Pencil size={18} />
                    Edit
                  </button>
                ) : null}
              </div>

              {isProfileLoading ? (
                <div style={getPreferenceInfoStyles(false)}>Loading profile details...</div>
              ) : null}

              {profileError ? (
                <div style={{ ...getPreferenceInfoStyles(true), marginTop: 12 }}>
                  <div>{profileError}</div>
                  <button
                    type="button"
                    style={{ ...getSecondaryButtonStyles(width, hoveredButton === "retry"), marginTop: 8 }}
                    onMouseEnter={() => setHoveredButton("retry")}
                    onMouseLeave={() => setHoveredButton(null)}
                    onClick={() => setProfileReloadKey((prev) => prev + 1)}
                  >
                    Retry
                  </button>
                </div>
              ) : null}

              <div style={getGrid2Styles(width)}>
                <FormField
                  label="Username"
                  value={form.username}
                  onChange={(v) => set("username", v)}
                  onBlur={() => mark("username")}
                  error={inlineErrors.username}
                  disabled={!isEditing || isSaving || isProfileLoading}
                  width={width}
                />
                <FormField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => set("email", v)}
                  onBlur={() => mark("email")}
                  error={inlineErrors.email}
                  disabled={!isEditing || isSaving || isProfileLoading}
                  width={width}
                />
              </div>

              <div style={getGrid2Styles(width)}>
                <FormField
                  label="First Name"
                  value={form.firstName}
                  onChange={(v) => set("firstName", v)}
                  onBlur={() => mark("firstName")}
                  error={inlineErrors.firstName}
                  disabled={!isEditing || isSaving || isProfileLoading}
                  width={width}
                />
                <FormField
                  label="Last Name"
                  value={form.lastName}
                  onChange={(v) => set("lastName", v)}
                  onBlur={() => mark("lastName")}
                  error={inlineErrors.lastName}
                  disabled={!isEditing || isSaving || isProfileLoading}
                  width={width}
                />
              </div>

              <div style={getGrid2Styles(width)}>
                <FormField
                  label="Phone Number"
                  value={form.phone}
                  onChange={(v) => set("phone", v)}
                  onBlur={() => mark("phone")}
                  placeholder="Enter phone number"
                  error={inlineErrors.phone}
                  disabled={!isEditing || isSaving || isProfileLoading}
                  width={width}
                />
                <FormField
                  label="Address"
                  value={form.address}
                  onChange={(v) => set("address", v)}
                  onBlur={() => mark("address")}
                  error={inlineErrors.address}
                  disabled={!isEditing || isSaving || isProfileLoading}
                  width={width}
                />
              </div>

              {isEditing ? (
                <>
                  <div style={getFieldStyles(width)}>
                    <label style={getLabelStyles(width)}>Update Profile Picture</label>
                    <input
                      type="file"
                      ref={fileRef}
                      style={getFileInputStyles(width)}
                      onChange={onPick}
                      accept="image/*"
                      disabled={isSaving || isProfileLoading}
                    />
                    {inlineErrors.avatar ? (
                      <div style={{ fontSize: 12, color: "#e11d48", marginTop: 4 }}>{inlineErrors.avatar}</div>
                    ) : null}
                  </div>

                  <div style={getButtonRowStyles(width)}>
                    <button
                      type="button"
                      style={{
                        ...(hoveredButton === "save" ? getButtonHoverStyles(width) : getButtonStyles(width)),
                        opacity: isSaving ? 0.7 : 1,
                        cursor: isSaving ? "wait" : "pointer",
                      }}
                      onMouseEnter={() => setHoveredButton("save")}
                      onMouseLeave={() => setHoveredButton(null)}
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      style={getSecondaryButtonStyles(width, hoveredButton === "cancel")}
                      onMouseEnter={() => setHoveredButton("cancel")}
                      onMouseLeave={() => setHoveredButton(null)}
                      onClick={cancelEdit}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : null}
            </section>

            <section style={getPreferenceCardStyles(width)}>
              <div style={getPreferenceHeaderStyles(width)}>
                <div>
                  <h2 style={getPreferenceTitleStyles(width)}>Dietary & Allergies Snapshot</h2>
                  <p style={getPreferenceSubtitleStyles(width)}>
                    This section shows exactly what you saved in your food preference form.
                  </p>
                </div>
                <button
                  style={getPreferenceActionStyles(width, hoveredButton === "preferences")}
                  onMouseEnter={() => setHoveredButton("preferences")}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={() => navigate("/preferences")}
                >
                  Update Preferences
                  <ArrowRight size={16} />
                </button>
              </div>

              {preferencesLoading ? (
                <div style={getPreferenceInfoStyles(false)}>
                  Loading your saved food preferences...
                </div>
              ) : preferencesError ? (
                <div style={getPreferenceInfoStyles(true)}>{preferencesError}</div>
              ) : (
                <div style={getPreferenceGridStyles(width)}>
                  {PREFERENCE_GROUPS.map((group) => {
                    const items = preferences[group.key] || []
                    return (
                      <article key={group.key} style={getPreferenceGroupStyles()}>
                        <div style={getPreferenceGroupHeaderStyles()}>
                          <span>{group.label}</span>
                          <span style={getPreferenceCountStyles()}>{items.length}</span>
                        </div>
                        <div style={getPreferenceChipWrapStyles()}>
                          {items.length ? (
                            items.map((item, index) => (
                              <span
                                key={`${group.key}-${item}-${index}`}
                                style={getPreferenceChipStyles(group.accent)}
                              >
                                {item}
                              </span>
                            ))
                          ) : (
                            <span style={getPreferenceEmptyStyles()}>Not set</span>
                          )}
                        </div>
                      </article>
                    )
                  })}
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

  function FormField({ label, type = "text", value, onChange, onBlur, error, width, disabled = false, placeholder }) {
    return (
      <div style={getFieldStyles(width)}>
        <label style={getLabelStyles(width)}>{label}</label>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          style={getInputStyles(width, disabled, Boolean(error))}
        />
        {error && <div style={{ fontSize: 12, color: "#e11d48", marginTop: 4 }}>{error}</div>}
      </div>
    )
  }
