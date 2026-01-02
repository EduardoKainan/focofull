
import { createClient } from '@supabase/supabase-js';

// Utilizando as credenciais fornecidas pelo usuário
const supabaseUrl = 'https://pygzuhmejqyegnpnxnjx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5Z3p1aG1lanF5ZWducG54bmp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNjg2NjgsImV4cCI6MjA4Mjk0NDY2OH0.qEx_dFOT3cZYcNpE1HZGcUTUAarZA62OPwq_byPa_Fo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Utilitário para lidar com erros de forma amigável ao TDAH e clara para o desenvolvedor.
 */
export const handleSupabaseError = (error: any) => {
  // Extração robusta da mensagem de erro
  let message = 'Erro desconhecido';
  if (typeof error === 'string') {
    message = error;
  } else if (error?.message) {
    message = error.message;
  } else if (error?.details) {
    message = error.details;
  } else {
    try {
      message = JSON.stringify(error);
    } catch (e) {
      message = String(error);
    }
  }

  // Log detalhado para o desenvolvedor no console (sem converter para string diretamente)
  console.error('Erro de Sincronização Supabase:', {
    code: error?.code,
    message: message,
    raw: error
  });

  // Instrução específica para erro de RLS
  if (error?.code === '42501') {
    console.warn(
      '%c🛡️ SUPABASE RLS ERROR (42501):%c\nVocê precisa configurar as políticas de segurança no seu banco de dados.\nExecute o SQL abaixo no editor do Supabase:\n\nALTER TABLE profiles ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "Dono gerencia próprio perfil" ON profiles FOR ALL USING (auth.uid() = id);',
      'font-weight: bold; color: white; background: red; padding: 2px 5px; border-radius: 3px;',
      'color: inherit;'
    );
  }
};
