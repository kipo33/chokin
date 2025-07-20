import { createClient } from '@supabase/supabase-js';

// 環境変数から取得するのが理想的です
// .env.local ファイルにVITE_SUPABASE_URLとVITE_SUPABASE_ANON_KEYを設定してください
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数が設定されていない場合は警告を表示
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase環境変数が設定されていません！');
  console.error('VITE_SUPABASE_URLとVITE_SUPABASE_ANON_KEYを.envファイルに設定してください');
}

// シングルトンパターンでSupabaseクライアントを作成
// これにより複数のGoTrueClientインスタンスが作成されるのを防ぐ
let supabaseInstance;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return supabaseInstance;
})(); 