// frontend/src/config/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Your Supabase credentials
const supabaseUrl = "https://vprtqaiczdvolwdosgev.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcnRxYWljemR2b2x3ZG9zZ2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NzA1MTgsImV4cCI6MjA3NzM0NjUxOH0.HK98a9MFoNSW0T-Jo-XN3-LQ0B9D2thjtEhtQfFEdgM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

