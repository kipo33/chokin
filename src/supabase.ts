import { createClient } from '@supabase/supabase-js';

// 環境変数から取得するのが理想ですが、開発目的で直接指定することもできます
// 本番環境では環境変数に移行することを強く推奨します
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// 環境変数の読み込み状況をログに出力
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase ANON KEY 先頭10文字:', supabaseAnonKey.substring(0, 10) + '...');
console.log('環境変数から直接:', import.meta.env.VITE_SUPABASE_URL ? '取得成功' : '取得失敗');

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 