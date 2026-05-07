  "use client"

  import { useContext, useMemo, useRef, useState, useEffect } from "react"
  import {
    Activity,
    ArrowRight,
    BrainCircuit,
    CheckCircle2,
    HeartPulse,
    KeyRound,
    Leaf,
    Pencil,
    ShieldCheck,
    Sparkles,
    TimerReset,
    Utensils,
  } from "lucide-react"
  import Cropper from "react-easy-crop"
  import { useNavigate } from "react-router-dom"
  import { toast } from "react-toastify"
  import "react-easy-crop/react-easy-crop.css"
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
  const HEALTH_FOCUS_STORAGE_KEY = "profile_health_focus_v1"
  const GOAL_ALIAS_MAP = {
    muscle: "muscle",
    musclegain: "muscle",
    weight: "weightloss",
    weightloss: "weightloss",
    generalwell: "generalwell",
    generalwellbeing: "generalwell",
    hypertension: "hypertension",
    hypertensioncontrol: "hypertension",
    heart: "hearthealth",
    hearthealth: "hearthealth",
  }
  const GOAL_HINTS = {
    muscle: "Prioritize higher-protein meals and recovery-friendly recommendations.",
    weightloss: "Prioritize calorie-aware meals with satiety and lean macro balance.",
    generalwell: "Prioritize balanced daily nutrition across energy, fiber, and variety.",
    hypertension: "Prioritize lower-sodium choices and heart-friendly ingredient patterns.",
    hearthealth: "Prioritize healthy fats, fiber-rich foods, and cardiovascular support.",
  }

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

  const normalizeGoalId = (value = "") => {
    const normalized = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, "")
    return GOAL_ALIAS_MAP[normalized] || ""
  }

  const normalizeGoalList = (value) => {
    const source = Array.isArray(value) ? value : value ? [value] : []
    const normalized = source
      .map((item) => {
        if (typeof item === "string") return normalizeGoalId(item)
        if (item && typeof item === "object") {
          return normalizeGoalId(item.id || item.goal || item.value || item.label || item.name)
        }
        return ""
      })
      .filter(Boolean)

    return [...new Set(normalized)].slice(0, 1)
  }

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
    const goals = normalizeGoalList(
      profile.goals || profile.healthFocus || profile.health_focus || profile.goal || profile.focus
    )

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
      goals,
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

  const loadImageElement = (src) =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error("Unable to load image for cropping"))
      image.src = src
    })

  const cropImageToFile = async (imageSrc, cropAreaPixels) => {
    if (!imageSrc || !cropAreaPixels) {
      throw new Error("Missing image crop data")
    }

    const image = await loadImageElement(imageSrc)
    const canvas = document.createElement("canvas")
    canvas.width = cropAreaPixels.width
    canvas.height = cropAreaPixels.height

    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("Unable to initialize image editor")
    }

    context.drawImage(
      image,
      cropAreaPixels.x,
      cropAreaPixels.y,
      cropAreaPixels.width,
      cropAreaPixels.height,
      0,
      0,
      cropAreaPixels.width,
      cropAreaPixels.height
    )

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => {
        if (!result) {
          reject(new Error("Unable to generate cropped image"))
          return
        }
        resolve(result)
      }, "image/jpeg", 0.94)
    })

    const file = new File([blob], `avatar-${Date.now()}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    })

    return {
      file,
      url: URL.createObjectURL(blob),
    }
  }

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
    backgroundColor: "#f7faf5",
    backgroundImage:
      "linear-gradient(135deg, rgba(236, 253, 245, 0.92) 0%, rgba(255, 251, 235, 0.78) 42%, rgba(239, 246, 255, 0.86) 100%), linear-gradient(rgba(15, 23, 42, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.035) 1px, transparent 1px)",
    backgroundSize: "auto, 34px 34px, 34px 34px",
    padding:
      width < 480
        ? "12px 10px"
        : width < 768
        ? "18px 14px"
        : width < 1024
        ? "28px 18px"
        : "34px 24px",
    boxSizing: "border-box",
  })

  const getPageHeaderStyles = (width) => ({
    maxWidth: "1340px",
    margin: "0 auto 18px",
    borderRadius: 18,
    border: "1px solid rgba(22, 101, 52, 0.16)",
    background: "linear-gradient(120deg, rgba(255,255,255,0.96) 0%, rgba(246, 253, 244, 0.94) 52%, rgba(236, 253, 245, 0.9) 100%)",
    boxShadow: "0 18px 42px rgba(22, 101, 52, 0.12)",
    padding: width < 768 ? "18px 16px" : width < 1024 ? "22px 22px" : "26px 28px",
    display: "flex",
    flexDirection: width < 900 ? "column" : "row",
    alignItems: width < 900 ? "flex-start" : "center",
    justifyContent: "space-between",
    gap: 14,
  })

  const getBreadcrumbStyles = () => ({
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#166534",
    marginBottom: 8,
  })

  const getHeaderTitleStyles = (width) => ({
    margin: 0,
    fontSize: width < 768 ? 28 : width < 1024 ? 34 : 40,
    letterSpacing: 0,
    fontWeight: 800,
    color: "#0f172a",
    fontFamily: "\"Sora\", \"Poppins\", sans-serif",
  })

  const getHeaderSubtitleStyles = (width) => ({
    margin: "8px 0 0",
    color: "#455a48",
    fontSize: width < 768 ? 13 : 15,
    lineHeight: 1.5,
    maxWidth: 660,
  })

  const getHeaderMetaStyles = (width) => ({
    display: "flex",
    flexDirection: width < 520 ? "column" : "row",
    alignItems: width < 520 ? "stretch" : "center",
    gap: 10,
    width: width < 520 ? "100%" : "auto",
  })

  const getMetricGridStyles = (width) => ({
    maxWidth: "1340px",
    margin: "0 auto 20px",
    display: "grid",
    gridTemplateColumns:
      width < 760 ? "1fr" : width < 1200 ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
    gap: width < 768 ? 10 : 12,
  })

  const getMetricCardStyles = (theme = "blue") => {
    const themes = {
      blue: {
        border: "1px solid #bbf7d0",
        background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
        shadow: "0 14px 30px rgba(22, 101, 52, 0.13)",
        iconBg: "#dcfce7",
        iconColor: "#15803d",
      },
      teal: {
        border: "1px solid #a7f3d0",
        background: "linear-gradient(135deg, #ffffff 0%, #ecfdf5 58%, #e0f2fe 100%)",
        shadow: "0 14px 30px rgba(13, 148, 136, 0.12)",
        iconBg: "#d1fae5",
        iconColor: "#047857",
      },
      amber: {
        border: "1px solid #fde68a",
        background: "linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)",
        shadow: "0 12px 26px rgba(217, 119, 6, 0.14)",
        iconBg: "#fef3c7",
        iconColor: "#b45309",
      },
      slate: {
        border: "1px solid #bae6fd",
        background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
        shadow: "0 12px 26px rgba(14, 116, 144, 0.12)",
        iconBg: "#e0f2fe",
        iconColor: "#0369a1",
      },
    }

    const selected = themes[theme] || themes.blue

    return {
      borderRadius: 16,
      border: selected.border,
      background: selected.background,
      boxShadow: selected.shadow,
      padding: "16px 16px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      minHeight: 126,
      position: "relative",
      overflow: "hidden",
    }
  }

  const getMetricTopStyles = () => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  })

  const getMetricIconWrapStyles = (theme = "blue") => {
    const map = {
      blue: { bg: "#dbeafe", color: "#1d4ed8" },
      teal: { bg: "#ccfbf1", color: "#0f766e" },
      amber: { bg: "#fef3c7", color: "#b45309" },
      slate: { bg: "#e2e8f0", color: "#334155" },
    }
    const selected = map[theme] || map.blue
    return {
      width: 34,
      height: 34,
      borderRadius: 10,
      background: selected.bg,
      color: selected.color,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid #ffffff",
      boxShadow: "0 6px 12px rgba(15, 23, 42, 0.08)",
    }
  }

  const getMetricLabelStyles = () => ({
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#53665a",
  })

  const getMetricValueStyles = () => ({
    fontSize: 30,
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: 0,
    color: "#0f172a",
    fontFamily: "\"Sora\", \"Poppins\", sans-serif",
  })

  const getMetricDescStyles = () => ({
    fontSize: 13,
    color: "#425466",
    fontWeight: 600,
    lineHeight: 1.35,
  })

  const getHeaderChipStyles = (type = "neutral") => ({
    borderRadius: 999,
    border:
      type === "sync"
        ? "1px solid #bbf7d0"
        : type === "edit"
        ? "1px solid #fde68a"
        : "1px solid rgba(148, 163, 184, 0.36)",
    background:
      type === "sync"
        ? "#f0fdf4"
        : type === "edit"
        ? "#fffbeb"
        : "#f8fafc",
    color:
      type === "sync"
        ? "#166534"
        : type === "edit"
        ? "#92400e"
        : "#475569",
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  })

  const getWrapperStyles = (width) => ({
    maxWidth: "1340px",
    margin: "0 auto",
    display: width < 920 ? "flex" : "grid",
    flexDirection: width < 920 ? "column" : undefined,
    gridTemplateColumns:
      width < 920 ? "1fr" : width < 1200 ? "300px minmax(0, 1fr)" : "330px minmax(0, 1fr)",
    alignItems: "start",
    gap: width < 920 ? 18 : width < 1200 ? 20 : 24,
  })

  const getSidebarStyles = (width) => ({
    background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(247, 252, 244, 0.94) 100%)",
    borderRadius: 18,
    border: "1px solid rgba(22, 101, 52, 0.16)",
    boxShadow: "0 18px 40px rgba(22, 101, 52, 0.12)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    width: "100%",
    maxWidth: width < 920 ? "100%" : 330,
    padding: width < 768 ? "18px 14px" : "22px 18px",
    position: width < 920 ? "static" : "sticky",
    top: 24,
  })

  const getAvatarStyles = (width) => ({
    width: width < 768 ? 112 : width < 1024 ? 130 : 148,
    height: width < 768 ? 112 : width < 1024 ? 130 : 148,
    borderRadius: "50%",
    objectFit: "cover",
    border: "5px solid #ffffff",
    boxShadow: "0 12px 28px rgba(22, 101, 52, 0.18)",
    background: "#fff",
    flexShrink: 0,
  })

  const getAvatarWrapStyles = (width) => ({
    width: width < 768 ? 112 : width < 1024 ? 130 : 148,
    height: width < 768 ? 112 : width < 1024 ? 130 : 148,
    borderRadius: "50%",
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
  })

  const getAvatarOverlayStyles = (show, disabled = false) => ({
    position: "absolute",
    inset: 0,
    border: "none",
    borderRadius: "50%",
    background: "rgba(15, 23, 42, 0.56)",
    color: "#d1d5db",
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    opacity: show ? 1 : 0,
    pointerEvents: show && !disabled ? "auto" : "none",
    transition: "opacity 0.18s ease",
  })

  const getAvatarOverlayIconStyles = () => ({
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "rgba(226, 232, 240, 0.22)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(226, 232, 240, 0.44)",
    color: "#e5e7eb",
  })

  const getAvatarOverlayTextStyles = () => ({
    fontSize: 12,
    fontWeight: 700,
    color: "#e5e7eb",
  })

  const getCropModalBackdropStyles = () => ({
    position: "fixed",
    inset: 0,
    background: "rgba(2, 6, 23, 0.64)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 20,
  })

  const getCropModalStyles = (width) => ({
    width: "100%",
    maxWidth: width < 768 ? 420 : 620,
    borderRadius: 16,
    border: "1px solid #1e293b",
    background: "#0b1220",
    boxShadow: "0 30px 60px rgba(2, 6, 23, 0.5)",
    padding: width < 768 ? 14 : 18,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  })

  const getCropModalTitleStyles = () => ({
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.02em",
  })

  const getCropStageStyles = () => ({
    position: "relative",
    width: "100%",
    height: 320,
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #334155",
    background: "#020617",
  })

  const getCropHintStyles = () => ({
    fontSize: 13,
    color: "#94a3b8",
    lineHeight: 1.4,
  })

  const getCropControlWrapStyles = () => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
  })

  const getCropLabelStyles = () => ({
    fontSize: 13,
    fontWeight: 700,
    color: "#cbd5e1",
    minWidth: 44,
  })

  const getCropSliderStyles = () => ({
    width: "100%",
    accentColor: "#60a5fa",
    cursor: "pointer",
  })

  const getSidebarTitleStyles = () => ({
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#64748b",
    textAlign: "center",
    paddingBottom: 10,
    width: "100%",
    borderBottom: "1px solid #dbe4f2",
  })

  const getSidebarNameStyles = (width) => ({
    fontSize: width < 768 ? 23 : width < 1024 ? 27 : 30,
    lineHeight: 1.1,
    fontWeight: 800,
    color: "#0f172a",
    textAlign: "center",
    wordBreak: "break-word",
    maxWidth: "100%",
    letterSpacing: "-0.02em",
  })

  const getSidebarMetaStyles = () => ({
    fontSize: 13,
    color: "#64748b",
    fontWeight: 600,
    textAlign: "center",
    wordBreak: "break-all",
  })

  const getGoalListStyles = (width) => ({
    width: "100%",
    display: "grid",
    gridTemplateColumns: width < 520 ? "1fr" : width < 920 ? "1fr 1fr" : "1fr",
    gap: 10,
    marginTop: 6,
  })

  const getProgressWrapStyles = () => ({
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 6,
  })

  const getProgressTrackStyles = () => ({
    width: "100%",
    height: 8,
    borderRadius: 999,
    background: "#dbe4f2",
    overflow: "hidden",
  })

  const getProgressFillStyles = (value = 0) => ({
    width: `${Math.max(0, Math.min(100, value))}%`,
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #84cc16 0%, #16a34a 54%, #0f766e 100%)",
    transition: "width 0.2s ease",
  })

  const getPassportRowStyles = () => ({
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "11px 0",
    borderBottom: "1px solid rgba(148, 163, 184, 0.22)",
  })

  const getPassportRowLabelStyles = () => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "#334155",
    fontSize: 13,
    fontWeight: 700,
  })

  const getPassportRowValueStyles = () => ({
    color: "#0f172a",
    fontSize: 13,
    fontWeight: 800,
    whiteSpace: "nowrap",
  })

  const getInsightPanelStyles = (width) => ({
    borderRadius: width < 768 ? 16 : 18,
    border: "1px solid rgba(217, 119, 6, 0.22)",
    background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255, 251, 235, 0.92) 56%, rgba(236, 253, 245, 0.88) 100%)",
    boxShadow: "0 18px 40px rgba(120, 53, 15, 0.09)",
    padding: width < 768 ? 16 : width < 1024 ? 20 : 24,
    display: "grid",
    gridTemplateColumns: width < 900 ? "1fr" : "minmax(0, 1.4fr) minmax(220px, 0.6fr)",
    gap: width < 900 ? 16 : 22,
    alignItems: "center",
  })

  const getInsightTitleStyles = (width) => ({
    margin: 0,
    color: "#0f172a",
    fontFamily: "\"Sora\", \"Poppins\", sans-serif",
    fontSize: width < 768 ? 23 : width < 1024 ? 27 : 31,
    fontWeight: 800,
    letterSpacing: 0,
    lineHeight: 1.16,
  })

  const getInsightTextStyles = () => ({
    margin: "10px 0 0",
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 1.55,
    fontWeight: 600,
  })

  const getInsightMeterStyles = () => ({
    display: "grid",
    gap: 10,
  })

  const getInsightMeterItemStyles = () => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid rgba(148, 163, 184, 0.22)",
    color: "#334155",
    fontSize: 13,
    fontWeight: 700,
  })

  const getGoalItemStyles = (width) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: width < 768 ? 12 : 13,
    color: "#334155",
    cursor: "default",
    whiteSpace: "nowrap",
    minHeight: 40,
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(22, 101, 52, 0.16)",
    background: "rgba(255,255,255,0.7)",
  })

  const getMainStyles = (width) => ({
    display: "flex",
    flexDirection: "column",
    gap: width < 768 ? 16 : width < 1024 ? 18 : 20,
  })

  const getSectionLeadStyles = (width) => ({
    margin: "4px 0 0",
    fontSize: width < 768 ? 13 : 14,
    lineHeight: 1.45,
    color: "#64748b",
    maxWidth: 760,
  })

  const getSectionBadgeStyles = () => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    border: "1px solid #bbf7d0",
    background: "#f0fdf4",
    color: "#15803d",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "5px 10px",
    marginBottom: 10,
  })

  const getCardStyles = (width) => ({
    background: "linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(248, 252, 248, 0.96) 100%)",
    borderRadius: 18,
    padding: width < 768 ? 16 : width < 1024 ? 20 : 24,
    border: "1px solid rgba(22, 101, 52, 0.16)",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
  })

  const getPreferenceCardStyles = (width) => ({
    borderRadius: width < 768 ? 16 : 18,
    padding: width < 768 ? 16 : width < 1024 ? 20 : 24,
    border: "1px solid rgba(14, 116, 144, 0.18)",
    background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240, 253, 250, 0.76) 60%, rgba(240, 249, 255, 0.86) 100%)",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
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
    fontSize: width < 768 ? 24 : width < 1024 ? 28 : 32,
    lineHeight: 1.15,
    color: "#0f172a",
    fontWeight: 800,
    letterSpacing: 0,
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
      ? "linear-gradient(135deg, #047857 0%, #0f766e 100%)"
      : "linear-gradient(135deg, #16a34a 0%, #0f766e 100%)",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: "pointer",
    boxShadow: hovered ? "0 10px 20px rgba(4, 120, 87, 0.26)" : "0 8px 16px rgba(22, 163, 74, 0.22)",
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
    border: "1px solid rgba(20, 184, 166, 0.18)",
    background: "rgba(255,255,255,0.72)",
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
    color: "#163225",
    fontWeight: 700,
    fontSize: 13,
  })

  const getPreferenceCountStyles = () => ({
    minWidth: 22,
    height: 22,
    borderRadius: 999,
    border: "1px solid #a7f3d0",
    background: "#ecfdf5",
    color: "#047857",
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
    border: isError ? "1px solid #fecaca" : "1px solid #bbf7d0",
    background: isError ? "#fff1f2" : "#f0fdf4",
    color: isError ? "#b91c1c" : "#166534",
    fontSize: 13,
    fontWeight: 600,
  })

  const getCardHeaderStyles = (width) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: width < 768 ? 14 : width < 1024 ? 18 : 22,
    flexWrap: "wrap",
  })

  const getTitleStyles = (width) => ({
    fontSize: width < 768 ? 26 : width < 1024 ? 30 : 42,
    fontWeight: 800,
    margin: 0,
    letterSpacing: 0,
    color: "#0f172a",
    fontFamily: "\"Sora\", \"Poppins\", sans-serif",
  })

  const getEditToggleButtonStyles = (hovered, disabled = false) => ({
    border: "1px solid #a7f3d0",
    background: hovered ? "#ecfdf5" : "#ffffff",
    color: disabled ? "#94a3b8" : "#047857",
    fontSize: 14,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    padding: "10px 14px",
    borderRadius: 12,
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
    height: width < 768 ? 42 : 46,
    padding: "0 14px",
    borderRadius: 12,
    border: hasError ? "1px solid #ef4444" : "1px solid #cfcfd4",
    fontSize: width < 768 ? 13 : 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    background: disabled ? "#f4f7f4" : "#ffffff",
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

  const getButtonStyles = (width) => ({
    marginTop: width < 768 ? 8 : 10,
    padding: width < 768 ? "10px 20px" : "12px 28px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #16a34a 0%, #0f766e 100%)",
    color: "#fff",
    fontSize: width < 768 ? 13 : 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
    width: width < 768 ? "100%" : "auto",
    boxShadow: "0 10px 20px rgba(22, 163, 74, 0.2)",
  })

  const getButtonHoverStyles = (width) => ({
    ...getButtonStyles(width),
    background: "linear-gradient(135deg, #047857 0%, #0f766e 100%)",
    transform: "translateY(-1px)",
  })

  const getSecondaryButtonStyles = (width, hovered = false) => ({
    marginTop: width < 768 ? 8 : 10,
    padding: width < 768 ? "10px 20px" : "12px 28px",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: hovered ? "#f8fafc" : "#ffffff",
    color: "#334155",
    fontSize: width < 768 ? 13 : 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
    width: width < 768 ? "100%" : "auto",
    boxShadow: hovered ? "0 8px 14px rgba(100, 116, 139, 0.14)" : "none",
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

const getRadioWrapStyles = (checked) => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 10,
  cursor: "pointer",
  padding: "10px 12px",
  borderRadius: 12,
  border: checked ? "1px solid rgba(37, 99, 235, 0.44)" : "1px solid rgba(22, 101, 52, 0.16)",
  background: checked ? "rgba(219, 234, 254, 0.72)" : "rgba(255, 255, 255, 0.7)",
  boxShadow: checked ? "0 10px 20px rgba(37, 99, 235, 0.14)" : "none",
  touchAction: "manipulation",
  transition: "all 0.18s ease",
})

const getRadioOuterStyles = (checked) => ({
  width: 18,
  height: 18,
  borderRadius: "50%",
  border: checked ? "2px solid #2563eb" : "2px solid #60a5fa",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: checked ? "rgba(37, 99, 235, 0.12)" : "#fff",
  boxSizing: "border-box",
})

const getRadioInnerStyles = (checked) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: checked ? "#2f6fed" : "transparent",
})

const getGoalHintCardStyles = (hasSelection) => ({
  marginTop: 10,
  width: "100%",
  borderRadius: 12,
  padding: "10px 12px",
  border: hasSelection ? "1px solid rgba(37, 99, 235, 0.3)" : "1px dashed rgba(148, 163, 184, 0.55)",
  background: hasSelection ? "rgba(239, 246, 255, 0.86)" : "rgba(248, 250, 252, 0.9)",
})

const getGoalHintTitleStyles = () => ({
  color: "#1e293b",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
})

const getGoalHintTextStyles = () => ({
  marginTop: 6,
  color: "#475569",
  fontSize: 12.5,
  lineHeight: 1.5,
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
    const [isAvatarHovered, setIsAvatarHovered] = useState(false)
    const [isCropModalOpen, setIsCropModalOpen] = useState(false)
    const [cropSourceImage, setCropSourceImage] = useState("")
    const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 })
    const [cropZoom, setCropZoom] = useState(1)
    const [croppedPixels, setCroppedPixels] = useState(null)
    const [isApplyingCrop, setIsApplyingCrop] = useState(false)
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
      try {
        const storedGoalId = normalizeGoalId(localStorage.getItem(HEALTH_FOCUS_STORAGE_KEY))
        if (!storedGoalId) return
        setForm((prev) => ({ ...prev, goals: [storedGoalId] }))
        setServerSnapshot((prev) => ({ ...prev, goals: [storedGoalId] }))
      } catch (_error) {
        // Ignore localStorage read errors in unsupported/private environments.
      }
    }, [])

    useEffect(() => {
      try {
        const selectedGoalId = form.goals?.[0] || ""
        if (selectedGoalId) {
          localStorage.setItem(HEALTH_FOCUS_STORAGE_KEY, selectedGoalId)
        } else {
          localStorage.removeItem(HEALTH_FOCUS_STORAGE_KEY)
        }
      } catch (_error) {
        // Ignore localStorage write errors in unsupported/private environments.
      }
    }, [form.goals])

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

        setForm((prev) => {
          const mergedGoals = (prev.goals || []).length ? prev.goals : mappedForm.goals
          return {
            ...prev,
            ...mappedForm,
            goals: mergedGoals,
          }
        })
        setServerSnapshot((prev) => {
          const mergedGoals = (prev.goals || []).length ? prev.goals : mappedForm.goals
          return {
            ...prev,
            ...mappedForm,
            goals: mergedGoals,
          }
        })
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

    const handleSelectGoal = (goalId) => {
      if (!goalId) return
      setForm((prev) => ({
        ...prev,
        goals: [goalId],
      }))
      setServerSnapshot((prev) => ({
        ...prev,
        goals: [goalId],
      }))
    }

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

    const closeCropModal = () => {
      setIsCropModalOpen(false)
      setCropSourceImage("")
      setCropPosition({ x: 0, y: 0 })
      setCropZoom(1)
      setCroppedPixels(null)
      if (fileRef.current) {
        fileRef.current.value = ""
      }
    }

    const onPick = (e) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!file.type || !file.type.startsWith("image/")) {
        setServerFieldErrors((prev) => ({
          ...prev,
          avatar: "Please choose a valid image file.",
        }))
        toast.error("Please choose a valid image file.")
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : ""
        if (!result) {
          toast.error("Unable to open the selected image.")
          return
        }
        setServerFieldErrors((prev) => {
          if (!prev.avatar) return prev
          const next = { ...prev }
          delete next.avatar
          return next
        })
        setCropSourceImage(result)
        setCropPosition({ x: 0, y: 0 })
        setCropZoom(1)
        setCroppedPixels(null)
        setIsCropModalOpen(true)
      }
      reader.onerror = () => {
        toast.error("Unable to read the selected image.")
      }
      reader.readAsDataURL(file)
    }

    const openAvatarPicker = () => {
      if (!authToken || isProfileLoading || isSaving || isApplyingCrop) return
      if (fileRef.current) {
        fileRef.current.value = ""
        fileRef.current.click()
      }
    }

    const applyCroppedAvatar = async () => {
      if (!cropSourceImage || !croppedPixels) {
        toast.error("Please adjust the crop area first.")
        return
      }
      if (!authToken) {
        toast.error("Please sign in again before updating your avatar.")
        return
      }

      setIsApplyingCrop(true)
      try {
        const croppedAvatar = await cropImageToFile(cropSourceImage, croppedPixels)
        const userImage = await fileToDataUrl(croppedAvatar.file)
        const savedProfile = await profileApi.updateProfile({ userImage }, authToken)
        const nextForm = mapProfilePayloadToForm(savedProfile, form.email || fallbackEmail)
        const nextFormWithAvatar = {
          ...nextForm,
          avatar: nextForm.avatar || croppedAvatar || form.avatar || serverSnapshot.avatar || null,
        }

        setForm((prev) => ({
          ...prev,
          ...nextFormWithAvatar,
          goals: prev.goals,
        }))
        setServerSnapshot((prev) => ({
          ...prev,
          ...nextFormWithAvatar,
          goals: prev.goals,
        }))
        setServerFieldErrors((prev) => {
          if (!prev.avatar) return prev
          const next = { ...prev }
          delete next.avatar
          return next
        })
        closeCropModal()
        syncStoredUserSession(savedProfile, setCurrentUser)
        toast.success("Avatar updated successfully.")
      } catch (error) {
        const mappedFieldErrors =
          error?.fieldErrors && typeof error.fieldErrors === "object" ? error.fieldErrors : {}
        const avatarMessage =
          mappedFieldErrors.avatar ||
          error?.message ||
          "Unable to update avatar right now."
        setServerFieldErrors((prev) => ({
          ...prev,
          avatar: avatarMessage,
        }))
        toast.error(avatarMessage)
      } finally {
        setIsApplyingCrop(false)
      }
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
      closeCropModal()
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

        const savedProfile = await profileApi.updateProfile(payload, authToken)
        const nextForm = mapProfilePayloadToForm(savedProfile, payload.email)
        const nextFormWithAvatar = {
          ...nextForm,
          avatar: nextForm.avatar || form.avatar || serverSnapshot.avatar || null,
        }

        setForm((prev) => ({
          ...prev,
          ...nextFormWithAvatar,
          goals: prev.goals,
        }))
        setServerSnapshot((prev) => ({
          ...prev,
          ...nextFormWithAvatar,
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
    const activeGoalId = form.goals?.[0] || ""
    const activeGoal = useMemo(
      () => GOALS.find((goal) => goal.id === activeGoalId) || null,
      [activeGoalId]
    )
    const activeGoalHint = useMemo(() => GOAL_HINTS[activeGoalId] || "", [activeGoalId])

    const profileCompletion = useMemo(() => {
      const fields = [
        form.username,
        form.firstName,
        form.lastName,
        form.email,
        form.phone,
        form.address,
        form.avatar?.url,
      ]
      const completed = fields.filter((value) => String(value || "").trim()).length
      return Math.round((completed / fields.length) * 100)
    }, [form])

    const preferenceSignalCount = useMemo(() => {
      return PREFERENCE_GROUPS.reduce((total, group) => {
        const items = preferences[group.key]
        return total + (Array.isArray(items) ? items.length : 0)
      }, 0)
    }, [preferences])

    const foodSafetySignalCount = useMemo(() => {
      return (
        (preferences.dietary_requirements || []).length +
        (preferences.allergies || []).length +
        (preferences.health_conditions || []).length
      )
    }, [preferences])

    const tasteSignalCount = useMemo(() => {
      return (
        (preferences.cuisines || []).length +
        (preferences.dislikes || []).length +
        (preferences.spice_levels || []).length +
        (preferences.cooking_methods || []).length
      )
    }, [preferences])

    const nutritionReadiness = useMemo(() => {
      const preferenceScore = Math.min(100, preferenceSignalCount * 12)
      return Math.round(profileCompletion * 0.48 + preferenceScore * 0.52)
    }, [preferenceSignalCount, profileCompletion])

    const nutritionInsight = useMemo(() => {
      const focusSuffix = activeGoal
        ? ` Current health focus: ${activeGoal.label}.`
        : " Select one Health Focus in the sidebar to steer recommendation priorities."

      if (preferencesLoading) {
        return {
          title: "Reading your nutrition profile",
          text: `Food safety and taste signals are being synced into your personal nutrition map.${focusSuffix}`,
        }
      }

      if (!preferenceSignalCount) {
        return {
          title: "Start with food safety signals",
          text: `Add dietary requirements, allergies, and intolerances so meal recommendations can avoid unsafe ingredients.${focusSuffix}`,
        }
      }

      if (tasteSignalCount < 3) {
        return {
          title: "Your safety profile is forming",
          text: `Add cuisines, disliked ingredients, spice level, and cooking methods to make suggestions feel more personal.${focusSuffix}`,
        }
      }

      if (profileCompletion < 70) {
        return {
          title: "Nutrition data is ready, identity needs polish",
          text: `Complete your phone, address, or avatar so the account profile matches the quality of your saved food signals.${focusSuffix}`,
        }
      }

      return {
        title: "Your nutrition profile is ready",
        text: `Identity, food safety, and taste data are strong enough for more precise meal planning and recommendations.${focusSuffix}`,
      }
    }, [activeGoal, preferenceSignalCount, preferencesLoading, profileCompletion, tasteSignalCount])

    const lastSyncedLabel = useMemo(() => {
      const now = new Date()
      return now.toLocaleString()
    }, [serverSnapshot])

    const syncStateLabel = useMemo(() => {
      if (isProfileLoading) return "Syncing..."
      if (profileError) return "Attention needed"
      return "Live sync healthy"
    }, [isProfileLoading, profileError])

    const securityStateLabel = authToken ? "Protected session" : "Session missing"

    return (
      <div style={getPageStyles(width)}>
        <header style={getPageHeaderStyles(width)}>
          <div>
            <div style={getBreadcrumbStyles()}>NutriHelp / Personal Nutrition Passport</div>
            <h1 style={getHeaderTitleStyles(width)}>Nutrition Profile</h1>
            <p style={getHeaderSubtitleStyles(width)}>
              Your identity, food safety rules, taste signals, and health direction in one personalized workspace.
            </p>
          </div>
          <div style={getHeaderMetaStyles(width)}>
            <span style={getHeaderChipStyles("sync")}>Nutrition readiness: {nutritionReadiness}%</span>
            <span style={getHeaderChipStyles()}>Last synced: {lastSyncedLabel}</span>
            {isEditing ? (
              <span style={getHeaderChipStyles("edit")}>Editing in progress</span>
            ) : (
              <span style={getHeaderChipStyles()}>Read-only mode</span>
            )}
          </div>
        </header>
        <section style={getMetricGridStyles(width)}>
          <article style={getMetricCardStyles("blue")}>
            <div style={getMetricTopStyles()}>
              <span style={getMetricLabelStyles()}>Nutrition Readiness</span>
              <span style={getMetricIconWrapStyles("blue")}>
                <Leaf size={18} />
              </span>
            </div>
            <div style={getMetricValueStyles()}>{nutritionReadiness}%</div>
            <div style={getMetricDescStyles()}>
              Identity details and nutrition signals ready for meal personalization.
            </div>
          </article>

          <article style={getMetricCardStyles("teal")}>
            <div style={getMetricTopStyles()}>
              <span style={getMetricLabelStyles()}>Food Safety</span>
              <span style={getMetricIconWrapStyles("teal")}>
                <CheckCircle2 size={18} />
              </span>
            </div>
            <div style={getMetricValueStyles()}>{foodSafetySignalCount}</div>
            <div style={getMetricDescStyles()}>Restrictions, allergies, and health conditions saved.</div>
          </article>

          <article style={getMetricCardStyles("amber")}>
            <div style={getMetricTopStyles()}>
              <span style={getMetricLabelStyles()}>Taste Graph</span>
              <span style={getMetricIconWrapStyles("amber")}>
                <Utensils size={18} />
              </span>
            </div>
            <div style={getMetricValueStyles()}>{tasteSignalCount}</div>
            <div style={getMetricDescStyles()}>Cuisine, dislike, spice, and cooking preferences.</div>
          </article>

          <article style={getMetricCardStyles("slate")}>
            <div style={getMetricTopStyles()}>
              <span style={getMetricLabelStyles()}>Profile State</span>
              <span style={getMetricIconWrapStyles("slate")}>
                <Activity size={18} />
              </span>
            </div>
            <div style={getMetricValueStyles()}>{profileError ? "Issue" : isEditing ? "Open" : "Live"}</div>
            <div style={getMetricDescStyles()}>{profileError ? syncStateLabel : securityStateLabel}</div>
          </article>
        </section>
        <div style={getWrapperStyles(width)}>
          {/* ===== SIDEBAR ===== */}
          <aside style={getSidebarStyles(width)}>
            <div
              style={getAvatarWrapStyles(width)}
              onMouseEnter={() => setIsAvatarHovered(true)}
              onMouseLeave={() => setIsAvatarHovered(false)}
            >
              <img
                src={form.avatar?.url || profileLogo}
                alt="User profile avatar"
                style={getAvatarStyles(width)}
              />
              <button
                type="button"
                style={getAvatarOverlayStyles(isAvatarHovered || width < 768, !authToken || isProfileLoading || isSaving)}
                onClick={openAvatarPicker}
                aria-label="Change avatar"
                disabled={!authToken || isProfileLoading || isSaving}
              >
                <span style={getAvatarOverlayIconStyles()}>
                  <Pencil size={16} />
                </span>
                <span style={getAvatarOverlayTextStyles()}>Edit avatar</span>
              </button>
            </div>
            <input
              type="file"
              ref={fileRef}
              style={{ display: "none" }}
              onChange={onPick}
              accept="image/*"
            />
            <div style={getSidebarNameStyles(width)}>{sidebarDisplayName}</div>
            <div style={getSidebarMetaStyles()}>{form.email || "No email linked"}</div>
            {inlineErrors.avatar ? (
              <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 700, textAlign: "center" }}>
                {inlineErrors.avatar}
              </div>
            ) : null}

            <div style={getProgressWrapStyles()}>
              <div style={getSidebarTitleStyles(width)}>Nutrition Passport {nutritionReadiness}%</div>
              <div style={getProgressTrackStyles()}>
                <div style={getProgressFillStyles(nutritionReadiness)} />
              </div>
            </div>

            <div style={{ width: "100%" }}>
              <div style={getPassportRowStyles()}>
                <span style={getPassportRowLabelStyles()}>
                  <CheckCircle2 size={15} />
                  Identity
                </span>
                <span style={getPassportRowValueStyles()}>{profileCompletion}%</span>
              </div>
              <div style={getPassportRowStyles()}>
                <span style={getPassportRowLabelStyles()}>
                  <ShieldCheck size={15} />
                  Food safety
                </span>
                <span style={getPassportRowValueStyles()}>{foodSafetySignalCount} signals</span>
              </div>
              <div style={getPassportRowStyles()}>
                <span style={getPassportRowLabelStyles()}>
                  <Utensils size={15} />
                  Taste graph
                </span>
                <span style={getPassportRowValueStyles()}>{tasteSignalCount} signals</span>
              </div>
            </div>

            <div style={{ width: "100%" }}>
              <div style={getSidebarTitleStyles(width)}>
                <HeartPulse size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Health Focus
              </div>
              <div style={getGoalListStyles(width)}>
                {GOALS.map((g) => (
                  <button
                    type="button"
                    key={g.id}
                    style={getRadioWrapStyles(activeGoalId === g.id)}
                    onClick={() => handleSelectGoal(g.id)}
                    aria-pressed={activeGoalId === g.id}
                  >
                    <span style={getRadioOuterStyles(activeGoalId === g.id)}>
                      <span style={getRadioInnerStyles(activeGoalId === g.id)} />
                    </span>

                    <span style={{ color: "#334155", fontWeight: 600, fontSize: 13 }}>
                      {g.label}
                    </span>
                  </button>
                ))}
              </div>
              <div style={getGoalHintCardStyles(Boolean(activeGoal))}>
                <div style={getGoalHintTitleStyles()}>
                  {activeGoal ? `Active focus: ${activeGoal.label}` : "Select your primary focus"}
                </div>
                <div style={getGoalHintTextStyles()}>
                  {activeGoalHint ||
                    "Choose one focus to prioritize how this account ranks meals and surfaces nutrition guidance."}
                </div>
              </div>
            </div>
          </aside>

          {/* ===== MAIN CONTENT ===== */}
          <main style={getMainStyles(width)}>
            {/* Personal Details Section */}
            <section style={getCardStyles(width)}>
              <div style={getSectionBadgeStyles()}>Identity Core</div>
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
              <p style={getSectionLeadStyles(width)}>
                Contact and identity data that anchors your nutrition profile across meal planning and recommendations.
              </p>

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

            <section style={getInsightPanelStyles(width)}>
              <div>
                <div style={getSectionBadgeStyles()}>
                  <BrainCircuit size={14} />
                  AI Nutrition Insight
                </div>
                <h2 style={getInsightTitleStyles(width)}>{nutritionInsight.title}</h2>
                <p style={getInsightTextStyles()}>{nutritionInsight.text}</p>
              </div>
              <div style={getInsightMeterStyles()}>
                <div style={getInsightMeterItemStyles()}>
                  <span>Food safety signals</span>
                  <strong>{foodSafetySignalCount}</strong>
                </div>
                <div style={getInsightMeterItemStyles()}>
                  <span>Taste signals</span>
                  <strong>{tasteSignalCount}</strong>
                </div>
                <div style={getInsightMeterItemStyles()}>
                  <span>Sync state</span>
                  <strong>{profileError ? "Needs attention" : "Healthy"}</strong>
                </div>
                <div style={getInsightMeterItemStyles()}>
                  <span>Health focus</span>
                  <strong>{activeGoal?.label || "Not selected"}</strong>
                </div>
              </div>
            </section>

            <section style={getPreferenceCardStyles(width)}>
              <div style={getSectionBadgeStyles()}>
                <Sparkles size={14} />
                Nutrition Blueprint
              </div>
              <div style={getPreferenceHeaderStyles(width)}>
                <div>
                  <h2 style={getPreferenceTitleStyles(width)}>Food Safety & Taste Graph</h2>
                  <p style={getPreferenceSubtitleStyles(width)}>
                    Saved restrictions, allergies, cuisines, dislikes, and cooking preferences used for safer meal suggestions.
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

          {isCropModalOpen ? (
            <div style={getCropModalBackdropStyles()}>
              <div style={getCropModalStyles(width)}>
                <h3 style={getCropModalTitleStyles()}>Edit Profile Avatar</h3>
                <div style={getCropHintStyles()}>
                  Drag to position the image and use zoom to fit your avatar frame.
                </div>
                <div style={getCropStageStyles()}>
                  <Cropper
                    image={cropSourceImage}
                    crop={cropPosition}
                    zoom={cropZoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCropPosition}
                    onCropComplete={(_, pixels) => setCroppedPixels(pixels)}
                    onZoomChange={setCropZoom}
                  />
                </div>
                <div style={getCropControlWrapStyles()}>
                  <span style={getCropLabelStyles()}>Zoom</span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={cropZoom}
                    onChange={(e) => setCropZoom(Number(e.target.value))}
                    style={getCropSliderStyles()}
                  />
                </div>
                <div style={getButtonRowStyles(width)}>
                  <button
                    type="button"
                    style={getSecondaryButtonStyles(width, hoveredButton === "crop-cancel")}
                    onMouseEnter={() => setHoveredButton("crop-cancel")}
                    onMouseLeave={() => setHoveredButton(null)}
                    onClick={closeCropModal}
                    disabled={isApplyingCrop}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    style={hoveredButton === "crop-apply" ? getButtonHoverStyles(width) : getButtonStyles(width)}
                    onMouseEnter={() => setHoveredButton("crop-apply")}
                    onMouseLeave={() => setHoveredButton(null)}
                    onClick={applyCroppedAvatar}
                    disabled={isApplyingCrop}
                  >
                    {isApplyingCrop ? "Applying..." : "Apply avatar"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

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
