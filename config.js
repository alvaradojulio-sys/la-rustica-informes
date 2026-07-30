// Credenciales PÚBLICAS de Supabase (URL + anon key).
// Son seguras para el navegador: el acceso real lo controlan las políticas
// de Row Level Security (RLS) definidas en supabase/schema.sql.
// La API key de Anthropic NUNCA va acá — esa vive server-side en Vercel (ver README).
window.APP_CONFIG = {
  SUPABASE_URL: "https://TU-PROYECTO.supabase.co",
  SUPABASE_ANON_KEY: "TU-ANON-KEY"
};
