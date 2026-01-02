
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const startApp = () => {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error("❌ Erro Fatal: Elemento #root não encontrado no DOM.");
      return;
    }

    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("✅ MindfulFlow montado com sucesso.");
  } catch (error) {
    console.error("❌ Erro Crítico durante a inicialização do React:", error);
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; color: #721c24; background: #f8d7da; border-radius: 8px; font-family: sans-serif; margin: 20px;">
          <h3>Algo deu errado no carregamento 😔</h3>
          <p>Ocorreu um erro técnico ao iniciar o aplicativo. Por favor, verifique o console do navegador (F12) para detalhes.</p>
          <pre style="font-size: 10px; margin-top: 10px; opacity: 0.7;">${String(error)}</pre>
        </div>
      `;
    }
  }
};

// Garante que o script rode após o carregamento do DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
