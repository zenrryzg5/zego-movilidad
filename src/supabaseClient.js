const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'tu-anon-key';

export const supabase = {
  from: (table) => ({
    insert: async (data) => {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(data)
        });
        return { data: response.ok, error: response.ok ? null : await response.text() };
      } catch (err) {
        return { data: null, error: err };
      }
    }
  })
};