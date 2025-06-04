import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://eynivcbxdcdqckyzcaax.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5bml2Y2J4ZGNkcWNreXpjYWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NjIwMjAsImV4cCI6MjA2NDUzODAyMH0.dGRYwLyaS_DsliAXVazU3k-7laReFBGDE23EoP3L1RE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
