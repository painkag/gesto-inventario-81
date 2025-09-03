// Completely vanilla version without hooks to test React availability
export default function PDV() {
  console.log('PDV component rendering...');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        PDV - Ponto de Venda
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr',
        gap: '20px',
        maxWidth: '1200px'
      }}>
        {/* Product Search */}
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#fff'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#555' }}>Produtos</h2>
          
          <input
            type="text"
            placeholder="Buscar produto por nome ou código..."
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              marginBottom: '15px',
              fontSize: '14px'
            }}
          />
          
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            border: '1px solid #eee',
            borderRadius: '4px'
          }}>
            {/* Mock products */}
            <div style={{
              padding: '12px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}>
              <div>
                <div style={{ fontWeight: '500' }}>Produto Teste 1</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Código: 123456789012</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600' }}>R$ 10,50</div>
                <div style={{ 
                  fontSize: '12px', 
                  backgroundColor: '#e8f5e8',
                  padding: '2px 6px',
                  borderRadius: '3px'
                }}>
                  Disponível
                </div>
              </div>
            </div>
            
            <div style={{
              padding: '12px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}>
              <div>
                <div style={{ fontWeight: '500' }}>Produto Teste 2</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Código: 123456789013</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600' }}>R$ 25,99</div>
                <div style={{ 
                  fontSize: '12px', 
                  backgroundColor: '#e8f5e8',
                  padding: '2px 6px',
                  borderRadius: '3px'
                }}>
                  Disponível
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shopping Cart */}
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#fff'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#555' }}>🛒 Carrinho (0)</h2>
          
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            marginBottom: '20px',
            minHeight: '150px',
            border: '1px solid #eee',
            borderRadius: '4px',
            padding: '10px'
          }}>
            <div style={{
              textAlign: 'center',
              color: '#666',
              padding: '40px 0'
            }}>
              Carrinho vazio
            </div>
          </div>

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />

          <div style={{ marginBottom: '15px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              <span>Total:</span>
              <span>R$ 0,00</span>
            </div>
          </div>
          
          <input
            type="number"
            step="0.01"
            placeholder="Valor recebido"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              marginBottom: '10px',
              fontSize: '14px'
            }}
          />

          <button
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onClick={() => alert('Funcionalidade será implementada!')}
          >
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  );
}