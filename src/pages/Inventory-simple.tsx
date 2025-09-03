import { useState } from 'react';

const InventorySimple = () => {
  const [activeTab, setActiveTab] = useState('estoque');

  // Mock inventory data
  const mockProducts = [
    { id: 1, name: 'Produto A', stock: 50, minStock: 10 },
    { id: 2, name: 'Produto B', stock: 25, minStock: 15 },
    { id: 3, name: 'Produto C', stock: 5, minStock: 20 },
  ];

  const styles = {
    container: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    },
    header: {
      marginBottom: '20px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '10px'
    },
    tabs: {
      display: 'flex',
      marginBottom: '20px',
      borderBottom: '1px solid #ddd'
    },
    tab: {
      padding: '10px 20px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      fontSize: '16px'
    },
    activeTab: {
      borderBottomColor: '#007bff',
      color: '#007bff',
      fontWeight: 'bold'
    },
    content: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const
    },
    th: {
      textAlign: 'left' as const,
      padding: '12px',
      borderBottom: '2px solid #ddd',
      backgroundColor: '#f8f9fa',
      fontWeight: 'bold'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #eee'
    },
    lowStock: {
      color: '#dc3545',
      fontWeight: 'bold'
    },
    normalStock: {
      color: '#28a745'
    }
  };

  const tabs = [
    { id: 'estoque', label: 'Estoque' },
    { id: 'movimentos', label: 'Movimentos' },
    { id: 'lotes', label: 'Lotes' }
  ];

  console.log('Inventory Simple rendering...');

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Estoque</h1>
        <p style={{ color: '#666' }}>Gerencie seu inventário de produtos</p>
      </div>

      <div style={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeTab === 'estoque' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>Produtos em Estoque</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Produto</th>
                  <th style={styles.th}>Estoque Atual</th>
                  <th style={styles.th}>Estoque Mínimo</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockProducts.map(product => (
                  <tr key={product.id}>
                    <td style={styles.td}>{product.name}</td>
                    <td style={styles.td}>{product.stock}</td>
                    <td style={styles.td}>{product.minStock}</td>
                    <td style={{
                      ...styles.td,
                      ...(product.stock <= product.minStock ? styles.lowStock : styles.normalStock)
                    }}>
                      {product.stock <= product.minStock ? 'Estoque Baixo' : 'Normal'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'movimentos' && (
          <div>
            <h3>Movimentos de Estoque</h3>
            <p style={{ color: '#666', marginTop: '10px' }}>
              Histórico de entradas e saídas de produtos
            </p>
          </div>
        )}

        {activeTab === 'lotes' && (
          <div>
            <h3>Controle de Lotes</h3>
            <p style={{ color: '#666', marginTop: '10px' }}>
              Rastreamento de lotes e validades
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventorySimple;