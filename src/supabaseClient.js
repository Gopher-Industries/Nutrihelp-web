// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mdauzoueyzgtqsojttkp.supabase.co';       
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kYXV6b3VleXpndHFzb2p0dGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE1MDE2MjYsImV4cCI6MjAyNzA3NzYyNn0.0EaAI8B563zQe9hcm4zjMWAlxCCYaw28mOXLcnRbooM';                        // Replace this

export const supabase = createClient(supabaseUrl, supabaseKey);
