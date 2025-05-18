export const generateLowStockEmailHtml = (workspaceId: number, totalLowStock: number, variants: any[]) => {
    const itemsList = variants
        .map((item) => {
            return `
            <tr>
                <td>${item.product.name}</td>
                <td>${item.title}</td>
                <td>${item.sku}</td>
                <td>${item.stock}</td>
                <td>${item.price}</td>
                <td>${item.size || 'N/A'}</td>
            </tr>
        `
        })
        .join('')

    return `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Low Stock Alert</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #ffffff;
      color: #333333;
      padding: 20px;
      font-size: 14px;
      line-height: 1.6;
    }
    h2 {
      color: #d9534f;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      border: 1px solid #dddddd;
      padding: 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #888888;
    }
  </style>
</head>
<body>
  <h2>⚠️ Low Stock Alert</h2>
  <p><strong>Workspace ID:</strong> {{workspaceId}}</p>
  <p><strong>Total Items with Low Stock:</strong> {{totalLowStock}}</p>

  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Variant</th>
        <th>SKU</th>
        <th>Stock</th>
        <th>Price</th>
        <th>Size</th>
      </tr>
    </thead>
    <tbody>
      {{itemsList}}
    </tbody>
  </table>

  <div class="footer">
    <p>This is an automated alert. Please restock the listed items to avoid stockouts.</p>
  </div>
</body>
</html>
    `
}
