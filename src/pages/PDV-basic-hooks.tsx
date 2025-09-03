import { useState } from 'react';

export default function PDV() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<Array<{id: string, name: string, price: number, quantity: number}>>([]);
  
  // Mock products
  const products = [
    { id: '1', name: 'Produto Teste 1', code: '123456789012', price: 10.50 },
    { id: '2', name: 'Produto Teste 2', code: '123456789013', price: 25.99 },
    { id: '3', name: 'Produto Teste 3', code: '123456789014', price: 15.75 }
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.includes(searchTerm)
  );

  const addToCart = (product: typeof products[0]) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const finalizeSale = () => {
    alert(`Venda finalizada! Total: R$ ${total.toFixed(2)}`);
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6">PDV - Ponto de Venda (Hooks Básicos)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Produtos</h2>
          
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.code}</div>
                  <div className="text-sm font-semibold">R$ {product.price.toFixed(2)}</div>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Adicionar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Carrinho */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Carrinho</h2>
          
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Carrinho vazio
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        R$ {item.price.toFixed(2)} x {item.quantity}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 bg-red-500 text-white rounded text-sm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 bg-green-500 text-white rounded text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="text-xl font-bold mb-4">
                  Total: R$ {total.toFixed(2)}
                </div>
                <button
                  onClick={finalizeSale}
                  className="w-full py-2 bg-green-500 text-white rounded font-semibold hover:bg-green-600"
                >
                  Finalizar Venda
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}