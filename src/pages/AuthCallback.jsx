import { useContext, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "../supabaseClient"
import { toast } from "react-toastify"
import { UserContext } from "../context/user.context"
import { API_BASE_URL, parseJsonSafe } from "../utils/authApi"

export default function AuthCallback() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setCurrentUser } = useContext(UserContext)
  const handledRef = useRef(false) // prevents double execution

  useEffect(() => {
    if (handledRef.current) return
    handledRef.current = true

    const handleAuth = async () => {
      try {
        const params = new URLSearchParams(location.search)
        const mode = params.get("mode") // signup | login
        const next = params.get("next") || "/home"

        const { data, error } = await supabase.auth.getSession()

        // No session → go to login
        if (error || !data?.session) {
          navigate("/login", { replace: true })
          return
        }

        // ==========================
        // SIGNUP FLOW (SSO)
        // ==========================
        if (mode === "signup") {
          // Kill session so no auto-login happens
          await supabase.auth.signOut()

          toast.success(
            "Account registered successfully. Please login to continue.",
            { autoClose: 4000 }
          )

          navigate("/login", { replace: true })
          return
        }

        // ==========================
        // LOGIN FLOW (SSO)
        // ==========================
        if (mode === "login" || !mode) {
          const supabaseAccessToken = data.session.access_token || ""
          if (!supabaseAccessToken) {
            throw new Error("Missing Google session token")
          }

          // Prevent stale backend JWT from being reused.
          localStorage.removeItem("auth_token")
          localStorage.removeItem("jwt_token")

          const exchangeRes = await fetch(`${API_BASE_URL}/api/auth/google/exchange`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ supabaseAccessToken, provider: "google" }),
          })

          const exchangeData = await parseJsonSafe(exchangeRes)
          const backendToken =
            exchangeData?.accessToken ||
            exchangeData?.token ||
            exchangeData?.session?.accessToken ||
            ""
          const backendUser = exchangeData?.user || null

          if (!exchangeRes.ok || !backendToken || !backendUser?.id) {
            throw new Error(exchangeData?.error || "Unable to complete Google sign-in.")
          }

          const sessionUser = {
            id: backendUser.id,
            user_id: backendUser.id,
            uid: backendUser.id,
            email: backendUser.email || data.session.user.email,
            name:
              backendUser.name ||
              data.session.user.user_metadata?.full_name ||
              data.session.user.user_metadata?.name ||
              data.session.user.email,
            displayName:
              backendUser.name ||
              data.session.user.user_metadata?.full_name ||
              data.session.user.user_metadata?.name ||
              data.session.user.email,
            photoURL:
              data.session.user.user_metadata?.avatar_url ||
              data.session.user.user_metadata?.picture ||
              "",
            provider: "google",
            role: backendUser.role || "user",
            token: backendToken,
            supabaseUserId: data.session.user.id,
            supabaseAccessToken,
          }

          localStorage.setItem("auth_token", backendToken)
          localStorage.setItem("sso_session", "google")
          localStorage.setItem("user_session", JSON.stringify(sessionUser))
          setCurrentUser(sessionUser, 60 * 60 * 1000)

          navigate(next, { replace: true })
          return
        }

        // ==========================
        // FALLBACK
        // ==========================
        navigate("/login", { replace: true })

      } catch (err) {
        console.error("Auth callback error:", err)
        toast.error(err?.message || "Unable to complete Google sign-in.")
        await supabase.auth.signOut()
        navigate("/login", { replace: true })
      }
    }

    handleAuth()
  }, [location, navigate, setCurrentUser])

  return (
    <p style={{ padding: 16, fontSize: 14, color: "#555" }}>
      Completing authentication…
    </p>
  )
}
