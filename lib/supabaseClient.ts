import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dkkrkcderiwubpsxuwem.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRra3JrY2Rlcml3dWJwc3h1d2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTk2NjksImV4cCI6MjA1MDIzNTY2OX0.vL0uiZyUnqUX0N_5ytRBOWifMyJrGyZumw18fFjAcPQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
