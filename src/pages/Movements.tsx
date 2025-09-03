import React from 'react';

const Movements = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', fontWeight: 'bold' }}>
          📊 Movimentações
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, margin: 0 }}>
          Acompanhe todas as movimentações do seu estoque
        </p>
      </div>
      
      <div style={{
        background: '#f8fafc',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        padding: '3rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚧</div>
        <h2 style={{ color: '#475569', marginBottom: '1rem' }}>
          Página em Desenvolvimento
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Em breve você poderá visualizar e gerenciar todas as movimentações de estoque,
          incluindo entradas, saídas, transferências e ajustes.
        </p>
      </div>
    </div>
  );
};

export default Movements;