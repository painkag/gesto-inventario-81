// PDF generation utility using jsPDF
// Note: In a production app, you would typically use a server-side PDF generator
// This is a client-side implementation for demonstration

interface ReceiptData {
  sale: {
    id: string;
    sale_number: string;
    customer_name: string | null;
    total_amount: number;
    discount_amount: number | null;
    subtotal: number;
    notes: string | null;
    created_at: string;
    status: string;
  };
  items: {
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
  company: {
    name: string;
    document: string | null;
    phone: string | null;
  };
}

export function generateReceiptHTML(data: ReceiptData): string {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Recibo - ${data.sale.sale_number}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          margin: 20px;
          background: white;
        }
        .receipt {
          max-width: 280px;
          margin: 0 auto;
          border: 1px solid #ddd;
          padding: 10px;
        }
        .header {
          text-align: center;
          border-bottom: 1px dashed #666;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .company-name {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 5px;
        }
        .company-info {
          font-size: 10px;
          color: #666;
        }
        .section {
          margin: 10px 0;
          padding: 5px 0;
        }
        .section-title {
          font-weight: bold;
          border-bottom: 1px solid #ddd;
          margin-bottom: 5px;
          padding-bottom: 2px;
        }
        .item {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
          border-bottom: 1px dotted #ccc;
          padding-bottom: 2px;
        }
        .item-name {
          flex: 1;
          margin-right: 10px;
        }
        .item-qty-price {
          text-align: right;
          min-width: 80px;
        }
        .item-total {
          text-align: right;
          font-weight: bold;
          min-width: 60px;
        }
        .totals {
          border-top: 2px solid #333;
          padding-top: 10px;
          margin-top: 10px;
        }
        .total-line {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .final-total {
          font-weight: bold;
          font-size: 14px;
          border-top: 1px solid #333;
          padding-top: 5px;
          margin-top: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px dashed #666;
          font-size: 10px;
          color: #666;
        }
        .status {
          text-align: center;
          margin: 10px 0;
          padding: 5px;
          background: ${data.sale.status === 'CANCELLED' ? '#ffebee' : '#e8f5e8'};
          color: ${data.sale.status === 'CANCELLED' ? '#c62828' : '#2e7d32'};
          border-radius: 4px;
          font-weight: bold;
        }
        @media print {
          body { margin: 0; }
          .receipt { border: none; box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <!-- Header -->
        <div class="header">
          <div class="company-name">${data.company.name}</div>
          ${data.company.document ? `<div class="company-info">CNPJ: ${data.company.document}</div>` : ''}
          ${data.company.phone ? `<div class="company-info">Tel: ${data.company.phone}</div>` : ''}
        </div>

        <!-- Sale Info -->
        <div class="section">
          <div style="display: flex; justify-content: space-between;">
            <span><strong>Venda:</strong> ${data.sale.sale_number}</span>
            <span><strong>Data:</strong> ${formatDate(data.sale.created_at)}</span>
          </div>
          ${data.sale.customer_name ? `<div><strong>Cliente:</strong> ${data.sale.customer_name}</div>` : ''}
        </div>

        <!-- Status -->
        ${data.sale.status === 'CANCELLED' ? 
          '<div class="status">VENDA CANCELADA</div>' : 
          '<div class="status">VENDA FINALIZADA</div>'
        }

        <!-- Items -->
        <div class="section">
          <div class="section-title">ITENS</div>
          ${data.items.map(item => `
            <div class="item">
              <div class="item-name">${item.product_name}</div>
              <div class="item-qty-price">${item.quantity}x ${formatCurrency(item.unit_price)}</div>
              <div class="item-total">${formatCurrency(item.total_price)}</div>
            </div>
          `).join('')}
        </div>

        <!-- Totals -->
        <div class="totals">
          <div class="total-line">
            <span>Subtotal:</span>
            <span>${formatCurrency(data.sale.subtotal)}</span>
          </div>
          ${data.sale.discount_amount && data.sale.discount_amount > 0 ? `
            <div class="total-line">
              <span>Desconto:</span>
              <span>-${formatCurrency(data.sale.discount_amount)}</span>
            </div>
          ` : ''}
          <div class="total-line final-total">
            <span>TOTAL:</span>
            <span>${formatCurrency(data.sale.total_amount)}</span>
          </div>
        </div>

        ${data.sale.notes ? `
          <div class="section">
            <div class="section-title">OBSERVAÇÕES</div>
            <div style="font-style: italic;">${data.sale.notes}</div>
          </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <div>Obrigado pela preferência!</div>
          <div style="margin-top: 5px;">Estoque Manager - Sistema de Gestão</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function printReceipt(data: ReceiptData) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Não foi possível abrir a janela de impressão');
  }

  const htmlContent = generateReceiptHTML(data);
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load before printing
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
}

export function downloadReceiptPDF(data: ReceiptData) {
  // For a simple implementation, we'll open the receipt in a new tab
  // In a production app, you would use a library like jsPDF or generate PDFs server-side
  
  const htmlContent = generateReceiptHTML(data);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `recibo-${data.sale.sale_number}.html`;
  link.click();
  
  URL.revokeObjectURL(url);
}

export function viewReceiptHTML(data: ReceiptData) {
  const receiptWindow = window.open('', '_blank');
  if (!receiptWindow) {
    throw new Error('Não foi possível abrir a janela do recibo');
  }

  const htmlContent = generateReceiptHTML(data);
  receiptWindow.document.write(htmlContent);
  receiptWindow.document.close();
}