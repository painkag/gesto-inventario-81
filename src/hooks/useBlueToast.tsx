// Implementação temporária sem dependência do useToast
export const useBlueToast = () => {
  const showSuccess = (title: string, description?: string) => {
    // Fallback simples usando alert até resolver o problema do React
    console.log('SUCCESS:', title, description);
    // Temporariamente usamos alert
    alert(`✅ ${title}${description ? ': ' + description : ''}`);
  };

  const showError = (title: string, description?: string) => {
    console.error('ERROR:', title, description);
    // Temporariamente usamos alert
    alert(`❌ ${title}${description ? ': ' + description : ''}`);
  };

  const showInfo = (title: string, description?: string) => {
    console.log('INFO:', title, description);
    // Temporariamente usamos alert
    alert(`ℹ️ ${title}${description ? ': ' + description : ''}`);
  };

  return {
    showSuccess,
    showError,
    showInfo,
  };
};