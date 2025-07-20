import { createClient } from '@supabase/supabase-js';

// 環境変数から取得するのが理想ですが、開発目的で直接指定することもできます
// 本番環境では環境変数に移行することを強く推奨します
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 