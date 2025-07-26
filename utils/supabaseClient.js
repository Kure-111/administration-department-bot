/**
 * Supabaseクライアント設定
 */

const { createClient } = require('@supabase/supabase-js');

// Supabaseクライアントを初期化
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

module.exports = supabase;