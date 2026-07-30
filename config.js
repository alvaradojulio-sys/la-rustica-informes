// Credenciales PÚBLICAS de Supabase (URL + anon key).
// Son seguras para el navegador: el acceso real lo controlan las políticas
// de Row Level Security (RLS) definidas en supabase/schema.sql.
// La API key de Anthropic NUNCA va acá — esa vive server-side en Vercel (ver README).
window.APP_CONFIG = {
  SUPABASE_URL: "https://stbhvwltlagnkzccaqvc.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0Ymh2d2x0bGFnbmt6Y2NhcXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNjQ2NzgsImV4cCI6MjEwMDk0MDY3OH0.d_RmmGmc50--C6qu-vcnlz_FT0pARCfv9jQot62Uzjw"
};
