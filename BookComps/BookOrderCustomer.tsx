import { convertDateTime, formatPrice } from "../HelperComps/TextCaseComp";


export function printBookOrderCustomer(item: any) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Customer Info - ${item.CustomerName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .info { margin: 20px 0; }
          .info-row { display: flex; margin: 10px 0; }
          .label { font-weight: bold; width: 150px; }
          .value { flex: 1; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Customer Information</h1>
        <div class="info">
          <div class="info-row"><div class="label">Name:</div><div class="value">${item.CustomerName || 'N/A'}</div></div>
          <div class="info-row"><div class="label">Phone:</div><div class="value">${item.CustomerPhone || 'N/A'}</div></div>
          <div class="info-row"><div class="label">Email:</div><div class="value">${item.CustomerEmail || 'N/A'}</div></div>
          <div class="info-row"><div class="label">Address:</div><div class="value">${item.CustomerAddress || 'N/A'}</div></div>
          <div class="info-row"><div class="label">Order Date:</div><div class="value">${convertDateTime(item.CreatedAt)}</div></div>
          <div class="info-row"><div class="label">Order Total:</div><div class="value">${formatPrice(Number(item.OrderGrandTotal) || 0)} MMK</div></div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
}

export default printBookOrderCustomer;
