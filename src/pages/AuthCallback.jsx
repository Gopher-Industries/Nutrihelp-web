import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from '../supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      const params = new URLSearchParams(search);
      const next = params.get("next") || "/home";
      navigate(next, { replace: true });
    });
  }, [navigate, search]);

  return <p style={{ padding: 16 }}>Signing you in…</p>;
}

