export const generateInvoiceHTML = (order) => {
  order.notes = order.notes || order.extralist || [];

  const formatDate = (date) =>
    new Date(date || Date.now()).toLocaleString("en-IN");

  const itemsHTML = order.items
    ?.map(
      (item) => `
      <tr>
        <td>${item.name}</td>
        <td class="text-center">₹ ${item.price.toFixed(2)}</td>
        <td class="text-center">${item.quantity || 1}</td>
        <td class="text-end">₹ ${(item.total || item.price * (item.quantity || 1)).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const extrasHTML = (order.notes || [])
    .map((note) => {
      const subtotal = (note.price || 0) * (note.qty || 1);
      return `
      <tr class="extra-row">
        <td>${note.text} (Extra)</td>
        <td class="text-center">₹ ${note.price?.toFixed(2) || "0.00"}</td>
        <td class="text-center">${note.qty || 1}</td>
        <td class="text-end">₹ ${subtotal.toFixed(2)}</td>
      </tr>`;
    })
    .join("");

  const totalItems =
    order.items?.reduce(
      (acc, i) => acc + (i.total || i.price * (i.quantity || 1)),
      0
    ) || 0;

  const totalExtras =
    order.notes?.reduce(
      (acc, n) => acc + (n.price || 0) * (n.qty || 1),
      0
    ) || 0;

  const subtotal = totalItems + totalExtras;
  const gstRate = 0.05;
  const gstAmount = subtotal * gstRate;
  const grandTotal = subtotal + gstAmount;

  // ✅ Improved GST handling
  let gstHTML = "";
  const gstType = order.gstType?.toLowerCase?.() || order.gst_type?.toLowerCase?.() || "inter";

  if (gstType === "intra") {
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    gstHTML = `
      <tr><td>CGST (2.5%)</td><td class="text-end">₹ ${cgst.toFixed(2)}</td></tr>
      <tr><td>SGST (2.5%)</td><td class="text-end">₹ ${sgst.toFixed(2)}</td></tr>`;
  } else {
    gstHTML = `
      <tr><td>IGST (5%)</td><td class="text-end">₹ ${gstAmount.toFixed(2)}</td></tr>`;
  }

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Invoice - ${order.guestName}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: "Poppins", Arial, sans-serif;
        background: #f6f8f7;
        margin: 0;
        padding: 0;
      }
      .invoice-container {
        max-width: 700px;
        background: #fff;
        margin: 15px auto;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
      }
      .header {
        padding: 20px;
      }
      .header h2 {
        margin: 0;
        font-size: 22px;
        color: #1b8c48;
        font-weight: 700;
      }
      .header p {
        margin: 2px 0;
        font-size: 13px;
      }
      .invoice-info {
        text-align: right;
        font-size: 13px;
      }
      .content {
        padding: 15px 20px 25px 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      th, td {
        padding: 8px;
        border: 1px solid #ddd;
      }
      th {
        background: #dff2e1;
        text-align: left;
      }
      tr:nth-child(even) {
        background: #f9f9f9;
      }
      .extra-row {
        background: #e8f6ff;
      }
      .totals {
        margin-top: 10px;
      }
      .totals th {
        background: #fff7d6;
      }
      .gst-row {
        background: #e8f6ff;
        font-weight: bold;
      }
      .grand-total {
        background: #e6ffe6;
        font-weight: bold;
        font-size: 15px;
      }
      @media screen and (max-width: 600px) {
        .header, .invoice-info {
          text-align: center;
        }
        .invoice-info {
          margin-top: 10px;
        }
      }
    </style>
  </head>
  <body>
    <div class="invoice-container">
      <div class="header">
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
          <div>
            <h2>SHIVAAM FARMS & RESORTS</h2>
            <p>01, AB, Green Planet, Omkar Nagar</p>
            <p>Phone: +91 7387750307</p>
            <p>Email: shivaamfarmsandresorts@gmail.com</p>
          </div>
          <div class="invoice-info">
            <p><b>Invoice To:</b> ${order.guestName}</p>
            <p><b>Table:</b> ${order.tableNumber}</p>
            <p><b>Contact:</b> ${order.contact || "-"}</p>
            <p><b>Date:</b> ${formatDate(order.dateTime)}</p>
            ${order.receiveby ? `<p><b>Received By:</b> ${order.receiveby}</p>` : ""}
            <p><b>Payment Mode:</b> ${order.paymentmode || "Not Selected"}</p>
          </div>
        </div>
      </div>

      <div class="content">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Rate (₹)</th>
              <th>Qty</th>
              <th>Subtotal (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
            ${extrasHTML}
            <tr>
              <td colspan="3" style="text-align:right; font-weight:bold;">Sub Total</td>
              <td>₹ ${subtotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <th>Tax Type</th>
              <th>Amount (₹)</th>
            </tr>
            ${gstHTML}
            <tr class="gst-row">
              <td>Total GST</td>
              <td>₹ ${gstAmount.toFixed(2)}</td>
            </tr>
            <tr class="grand-total">
              <td>Grand Total</td>
              <td>₹ ${grandTotal.toFixed(2)}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </body>
  </html>`;
};
