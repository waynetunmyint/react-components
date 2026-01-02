import { IMAGE_URL } from "@/config";
import { formatNumber } from "../HelperComps/TextCaseComp";

const getHeaderStyles = () => `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1f2937; line-height: 1.5; }
    .header-container { display: flex; justify-content: space-between; border-bottom: 2px solid #e5e7eb; padding-bottom: 24px; margin-bottom: 32px; }
    .school-info h1 { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 8px 0; }
    .school-info p { margin: 2px 0; font-size: 13px; color: #4b5563; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { font-size: 32px; font-weight: 800; margin: 0 0 4px 0; letter-spacing: -0.02em; }
    .invoice-meta p { margin: 2px 0; font-size: 13px; color: #6b7280; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; margin-bottom: 8px; }
    
    .bill-to { margin-bottom: 32px; background: #f9fafb; padding: 24px; border-radius: 12px; border: 1px solid #f3f4f6; }
    .bill-to h3 { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6b7280; margin: 0 0 16px 0; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    .bill-row { display: flex; margin-bottom: 12px; font-size: 14px; }
    .bill-row:last-child { margin-bottom: 0; }
    .bill-label { width: 120px; color: #6b7280; font-weight: 500; }
    .bill-value { font-weight: 600; color: #111827; flex: 1; }

    .amount-box { background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; text-align: center; margin: 40px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .amount-label { font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
    .amount-value { font-size: 42px; font-weight: 800; color: #111827; letter-spacing: -0.02em; }
    
    .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 24px; }
    .footer p { margin: 4px 0; }
    .footer-note { font-style: italic; color: #6b7280; }

    @media print { 
        body { padding: 0; max-width: 100%; }
        .amount-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
`;

export function printSchoolBillInvoice(item: any) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  console.log("Item Data", item);

  const shortDate = item && item.CreatedAt ? new Date(item.CreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  // Use direct fields as per user edits, with fallback
  const pageTitle = item.PageTitle || item.SchoolBillOrders?.PageTitle || 'School Name';
  const pageAddress = item.PageAddress || item.SchoolBillOrders?.PageAddress || '';
  const contactAddress = item.ContactInfoAddress || item.SchoolBillOrders?.ContactInfoAddress || '';
  const contactEmail = item.ContactInfoEmail || item.SchoolBillOrders?.ContactInfoEmail || '';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice #${item.Id}</title>
        <style>
          ${getHeaderStyles()}
          .invoice-color { color: #d97706; }
          .badge-invoice { background: #fffbeb; color: #d97706; border: 1px solid #fcd34d; }
          .amount-value { color: #d97706; }
        </style>
      </head>
      <body>
        <div class="header-container">
            <div class="school-info">
                ${item?.ContactInfoVoucherHeaderImage ? `<img src="${IMAGE_URL}/uploads/${item.ContactInfoVoucherHeaderImage}" alt="Logo" style="height: 56px; margin-bottom: 16px;" />` : ''}
                <h1>${pageTitle}</h1>
                <p>${pageAddress}</p>
                <p>${contactAddress}</p>
                <p>${contactEmail}</p>
            </div>
            <div class="invoice-meta">
                <span class="badge badge-invoice">Pending Payment</span>
                <h2 class="invoice-color">INVOICE</h2>
                <p>Invoice #: <strong>${item.Id}</strong></p>
                <p>Date: ${shortDate}</p>
            </div>
        </div>

        <div class="bill-to">
            <h3>Bill To</h3>
            <div class="bill-row">
                <span class="bill-label">Student Name</span>
                <span class="bill-value">${item.StudentTitle || item.StudentName || 'N/A'}</span>
            </div>
             <div class="bill-row">
                <span class="bill-label">Description</span>
                <span class="bill-value">${item.Title || 'N/A'}</span>
            </div>
        </div>

        <div class="amount-box">
             <div class="amount-label">Total Amount Due</div>
             <div class="amount-value">${formatNumber(Number(item.Amount) || 0)} <span style="font-size: 18px; color: #6b7280; font-weight: 600;">MMK</span></div>
        </div>

        <div class="footer">
            <p class="footer-note">Thank you for choosing our school.</p>
            <p>Please present this invoice when making payment.</p>
            <p>&copy; ${new Date().getFullYear()} ${pageTitle}. All rights reserved.</p>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
}

export function printSchoolBillReceipt(item: any) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const shortDate = item && item.CreatedAt ? new Date(item.CreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  // Use direct fields as per user edits, with fallback
  const pageTitle = item.PageTitle || item.SchoolBillOrders?.PageTitle || 'School Name';
  const pageAddress = item.PageAddress || item.SchoolBillOrders?.PageAddress || '';
  const contactAddress = item.ContactInfoAddress || item.SchoolBillOrders?.ContactInfoAddress || '';
  const contactEmail = item.ContactInfoEmail || item.SchoolBillOrders?.ContactInfoEmail || '';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt #${item.Id}</title>
        <style>
          ${getHeaderStyles()}
          .receipt-color { color: #059669; }
          .badge-receipt { background: #ecfdf5; color: #059669; border: 1px solid #6ee7b7; }
          .amount-value { color: #059669; }
          .stamp { position: absolute; top: 160px; right: 100px; transform: rotate(-15deg); border: 4px double #059669; color: #059669; font-size: 32px; font-weight: 800; padding: 12px 40px; border-radius: 8px; opacity: 0.15; text-transform: uppercase; letter-spacing: 0.15em; pointer-events: none; z-index: 0; }
        </style>
      </head>
      <body>
        <div class="stamp">PAID</div>
        
        <div class="header-container">
            <div class="school-info">
                ${item?.ContactInfoVoucherHeaderImage ? `<img src="${IMAGE_URL}/uploads/${item.ContactInfoVoucherHeaderImage}" alt="Logo" style="height: 56px; margin-bottom: 16px;" />` : ''}
                <h1>${pageTitle}</h1>
                <p>${pageAddress}</p>
                <p>${contactAddress}</p>
                <p>${contactEmail}</p>
            </div>
            <div class="invoice-meta">
                <span class="badge badge-receipt">Paid</span>
                <h2 class="receipt-color">RECEIPT</h2>
                 <p>Receipt #: <strong>${item.Id}</strong></p>
                <p>Date: ${shortDate}</p>
            </div>
        </div>

        <div class="bill-to">
            <h3>Bill To</h3>
            <div class="bill-row">
                <span class="bill-label">Student Name</span>
                <span class="bill-value">${item.StudentTitle || item.StudentName || 'N/A'}</span>
            </div>
             <div class="bill-row">
                <span class="bill-label">Description</span>
                <span class="bill-value">${item.Title || 'N/A'}</span>
            </div>
        </div>

        <div class="amount-box" style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border-color: #a7f3d0;">
             <div class="amount-label" style="color: #065f46;">Amount Paid</div>
             <div class="amount-value">${formatNumber(Number(item.Amount) || 0)} <span style="font-size: 18px; color: #065f46; font-weight: 600;">MMK</span></div>
        </div>

        <div class="footer">
            <p class="footer-note">Payment Received with Thanks.</p>
            <p>This is a computer-generated receipt.</p>
            <p>&copy; ${new Date().getFullYear()} ${pageTitle}. All rights reserved.</p>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
}

export default { printSchoolBillInvoice, printSchoolBillReceipt };
