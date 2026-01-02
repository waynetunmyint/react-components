
import { IMAGE_URL } from "@/config";
import { formatNumber } from "../HelperComps/TextCaseComp";

export function printBookOrderReceipt(item: any) {
  let orderItems: any[] = [];
  try {
    orderItems = typeof item.OrderItems === 'string' ? JSON.parse(item.OrderItems) : item.OrderItems || [];
  } catch (e) {
    console.error('Failed to parse order items:', e);
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  // format short English date like: Dec 6, 2025
  const shortDate = item && item.CreatedAt ? new Date(item.CreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - Order #${item.Id}</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 10px; margin-bottom: 10px; }
          .customer { margin: 15px 0; font-size: 12px; }
          .items { margin: 15px 0; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; font-size: 12px; }
          .item-name { flex: 1; }
          .item-qty { width: 50px; text-align: center; }
          .item-price { width: 80px; text-align: right; }
          .total { border-top: 2px dashed #333; padding-top: 10px; margin-top: 10px; font-size: 14px; font-weight: bold; text-align: right; }
          .footer { text-align: center; margin-top: 20px; font-size: 11px; border-top: 2px dashed #333; padding-top: 10px; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
      <img src="${IMAGE_URL}/uploads/${item?.ContactInfoVoucherHeaderImage || ''}" alt="Header" style="max-width: 100%; height: auto;"/>
        <div class="header" style="display:flex; justify-content:space-between; align-items:center; gap:12px; border-bottom:2px dashed #333; padding-bottom:10px; margin-bottom:10px;">
          <div style="text-align:left;">
            <h2 style="margin: 0; font-size:18px;">ORDER RECEIPT</h2>
          </div>
          <div style="text-align:right; font-size:12px;">
            <div><strong>Order #${item.Id}</strong></div>
            <div>${shortDate}</div>
          </div>
        </div>

        <div class="customer">
          <div><strong>Customer:</strong> ${item.CustomerName || 'N/A'}</div>
          <div><strong>Phone:</strong> ${item.CustomerPhone || 'N/A'}</div>
          ${item.CustomerAddress ? `<div><strong>Address:</strong> ${item.CustomerAddress}</div>` : ''}
        </div>

        <div class="items">
          <div style="border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 5px;">
            <div class="item" style="font-weight: bold;"><div class="item-name">Item</div><div class="item-qty">Qty</div><div class="item-price">Price</div></div>
          </div>
          ${orderItems.map((orderItem: any) => `
            <div class="item">
              <div class="item-name">${orderItem.Title || 'Item'}</div>
              <div class="item-qty">x${orderItem.Qty || 1}</div>
              <div class="item-price">${formatNumber(orderItem.PriceTotal || orderItem.Price || 0)}</div>
            </div>
          `).join('')}
        </div>

        <div class="total">TOTAL: ${formatNumber(Number(item.OrderGrandTotal) || 0)} MMK</div>

        <!-- Signature rows -->
        <div style="margin-top:20px; display:flex; gap:20px;">
          <div style="flex:1; text-align:left;">
            <div style="height:60px; border-bottom:1px solid #000; width:80%;"></div>
            <div style="margin-top:6px; font-size:12px;">Customer Signature</div>
          </div>
          <div style="flex:1; text-align:right;">
            <div style="height:60px; border-bottom:1px solid #000; width:80%; margin-left:auto;"></div>
            <div style="margin-top:6px; font-size:12px;">Seller Signature</div>
          </div>
        </div>

        <div class="footer"><div>Thank you for your order!</div></div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
}

export default printBookOrderReceipt;
