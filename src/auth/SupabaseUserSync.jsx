import { useEffect } from "react";
import { supabase } from "../supabaseClient";

function hasBackendSession() {
  const directToken =
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    localStorage.getItem("jwt_token") ||
    sessionStorage.getItem("jwt_token");

  if (directToken) return true;

  const storedUser =
    localStorage.getItem("user") ||
    localStorage.getItem("user_session") ||
    sessionStorage.getItem("user_session");

  return Boolean(storedUser);
}

export default function SupabaseUserSync() {
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        return;
      }

      if (!hasBackendSession()) {
        localStorage.removeItem("sso_session");
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return null;
}
