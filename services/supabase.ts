
import { createClient } from '@supabase/supabase-js';

// Utilizando as credenciais fornecidas pelo usuário
const supabaseUrl = 'https://pygzuhmejqyegnpnxnjx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5Z3p1aG1lanF5ZWducG54bmp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNjg2NjgsImV4cCI6MjA4Mjk0NDY2OH0.qEx_dFOT3cZYcNpE1HZGcUTUAarZA62OPwq_byPa_Fo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Utilitário para lidar com erros de forma amigável ao TDAH (sem alertas técnicos assustadores)
 */
export const handleSupabaseError = (error: any) => {
  // Verificamos se o erro tem uma estrutura de erro do Supabase/Postgrest
  const errorMessage = error?.message || error?.details || (typeof error === 'object' ? JSON.stringify(error) : String(error));
  console.error('Erro de Sincronização Supabase:', {
    message: errorMessage,
    error: error
  });
};
