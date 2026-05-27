const SUPABASE_URL = 'https://sctrccvmktivycvsajho.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjdHJjY3Zta3RpdnljdnNhamhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNTQ2MDEsImV4cCI6MjA5NDgzMDYwMX0.yoO_KW427_zGqdhG90QoXgGqQTeoqFC4zm8pS7gYn-Q';

const { createClient } = supabase;
const massgo = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
