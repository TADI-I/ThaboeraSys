let subtotal = 0;
let vat = 0;
let total = 0;

function showClientInfo() {
  const clientName = document.getElementById("clientName").value;
  const contactPerson = document.getElementById("contactPerson").value;
  const contactNumber = document.getElementById("contactNumber").value;
  const email = document.getElementById("email").value;
  const address = document.getElementById("address").value;
  const regNumber = document.getElementById("regNumber").value;

  const clientInfoDiv = document.getElementById("clientInfoDisplay");
  clientInfoDiv.innerHTML = `
    <h3>Client Details</h3>
    <div style="display: flex; justify-content: space-between;">
      <div>
        <p><strong>Client:</strong> ${clientName}</p>
        <p><strong>Contact Person:</strong> ${contactPerson}</p>
        <p><strong>Contact:</strong> ${contactNumber}</p>
      </div>
      <div>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Reg Number:</strong> ${regNumber}</p>
      </div>
    </div>
  `;
   document.getElementById("confirmation").textContent = "✅ Client info added successfully!";

}


function addItem() {
  const item = document.getElementById("item").value;
  const description = document.getElementById("description").value;
  const qty = parseFloat(document.getElementById("qty").value);
  const unitPrice = parseFloat(document.getElementById("unitPrice").value);
  const discount = parseFloat(document.getElementById("discount").value) || 0;
  const taxable = document.getElementById("taxable").value;

  if (!item || isNaN(qty) || isNaN(unitPrice)) {
    alert("Please enter all required item fields.");
    return;
  }

  const discountedPrice = unitPrice - (unitPrice * discount / 100);
  const itemTotal = qty * discountedPrice;
  const vatAmount = taxable === "yes" ? itemTotal * 0.15 : 0;

  subtotal += itemTotal;
  vat += vatAmount;
  total = subtotal + vat;

  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${item}</td>
    <td>${description}</td>
    <td>${qty}</td>
    
    <td>${discount}%</td>
    <td>${taxable}</td>
    <td>${unitPrice.toFixed(2)}</td>
    <td>${itemTotal.toFixed(2)}</td>
    <td>
      <button onclick="editRow(this)">Edit</button>
      <button onclick="deleteRow(this)">Delete</button>
    </td>
  `;

  document.getElementById("invoiceBody").appendChild(row);
  updateTotals();

  // Reset input fields
  document.getElementById("item").value = '';
  document.getElementById("description").value = '';
  document.getElementById("qty").value = '';
  document.getElementById("unitPrice").value = '';
  document.getElementById("discount").value = '';
  document.getElementById("taxable").value = 'yes';
  document.getElementById("unitPrice").value = '';
}
function updateTotals() {
  document.getElementById("subtotal").innerText = subtotal.toFixed(2);
  document.getElementById("vat").innerText = vat.toFixed(2);
  document.getElementById("total").innerText = total.toFixed(2);
}

function deleteRow(button) {
  const row = button.closest("tr");
  const cells = row.querySelectorAll("td");

  const qty = parseFloat(cells[2].innerText);
  const discountText = cells[3].innerText.replace('%', '');
  const discount = parseFloat(discountText) || 0;
  const taxable = cells[4].innerText;
  const unitPrice = parseFloat(cells[5].innerText);
  const itemTotal = parseFloat(cells[6].innerText);

  const isTaxable = taxable === "yes";
  const vatAmount = isTaxable ? itemTotal * 0.15 : 0;

  subtotal -= itemTotal;
  vat -= vatAmount;
  total = subtotal + vat;

  row.remove();
  updateTotals();
}


function editRow(button) {
  const row = button.closest("tr");
  const cells = row.querySelectorAll("td");

  // Pre-fill form fields
  document.getElementById("item").value = cells[0].innerText;
  document.getElementById("description").value = cells[1].innerText;
  document.getElementById("qty").value = cells[2].innerText;
  document.getElementById("discount").value = cells[3].innerText.replace('%', '');
  document.getElementById("taxable").value = cells[4].innerText;
  document.getElementById("unitPrice").value = cells[5].innerText;

  // Revert values
  const itemTotal = parseFloat(cells[6].innerText);
  const isTaxable = cells[4].innerText === "yes";
  const vatAmount = isTaxable ? itemTotal * 0.15 : 0;

  subtotal -= itemTotal;
  vat -= vatAmount;
  total = subtotal + vat;

  row.remove();
  updateTotals();
}




function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);

  const key = `invoiceCount-${year}${month}${day}`;
  let count = localStorage.getItem(key);
  count = count ? parseInt(count) + 1 : 1;
  localStorage.setItem(key, count);

  const invoiceNum = `INV-${year}${month}${day}${count}`;
  document.getElementById("invoiceNumber").innerText = `Invoice No: ${invoiceNum}`;
  return invoiceNum;
}

function showInvoiceDetails() {
  const salesRep = document.getElementById("salesRep").value;
  const fob = document.getElementById("fob").value;
  const shipVia = document.getElementById("shipVia").value;
  const terms = document.getElementById("terms").value;
  const taxId = document.getElementById("taxId").value;
  const invoiceDate = document.getElementById("invoiceDate").value;

const detailsDisplay = document.getElementById("invoiceDetailsDisplay");
detailsDisplay.innerHTML = `
  <h2>Invoice Details</h2>
  <table class="boxed-details">
    <tr>
      <td><strong>Sales Rep:</strong></td><td>${salesRep}</td>
      <td><strong>FOB:</strong></td><td>${fob}</td>
      <td><strong>Tax ID:</strong></td><td>${taxId}</td>
    </tr>
    <tr>
      <td><strong>Ship Via:</strong></td><td>${shipVia}</td>
      <td><strong>Terms:</strong></td><td>${terms}</td>
      <td><strong>Date:</strong></td><td>${invoiceDate}</td>
    </tr>
  </table>
`
document.getElementById("conf").textContent = "✅ Invoice details added successfully!";
 ;

}

const html2canvas = window.html2canvas;

async function downloadInvoice() {
  const { jsPDF } = window.jspdf;
  const invoiceElement = document.getElementById("invoiceContent");

  const canvas = await html2canvas(invoiceElement, {
    scale: 4, // Max practical quality for crisp rendering
    useCORS: true,
    backgroundColor: '#ffffff',
    scrollY: -window.scrollY
  });

  const imgData = canvas.toDataURL("image/jpeg", 1.0); // Max quality

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = pageWidth;
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  let heightLeft = imgHeight;
  let position = 0;

  while (heightLeft > 0) {
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    if (heightLeft > 1) {
      pdf.addPage();
      position = - (imgHeight - heightLeft);
    }
  }

  const fileName = `${document.getElementById("invoiceNumber").textContent || "invoice"}.pdf`;
  pdf.save(fileName);

  const blob = pdf.output("blob");
uploadPDF(blob, invoiceNumber, clientName, "invoice"); // or "quote"

}




// Automatically generate invoice number on page load
window.addEventListener("DOMContentLoaded", generateInvoiceNumber);
function downloadAndRedirect() {
  const clientInfo = {
    clientName: document.getElementById("clientName").value,
    contactPerson: document.getElementById("contactPerson").value,
    contactNumber: document.getElementById("contactNumber").value,
    email: document.getElementById("email").value,
    address: document.getElementById("address").value,
    regNumber: document.getElementById("regNumber").value
  };

  const invoiceDetails = {
    salesRep: document.getElementById("salesRep").value,
    fob: document.getElementById("fob").value,
    shipVia: document.getElementById("shipVia").value,
    terms: document.getElementById("terms").value,
    taxId: document.getElementById("taxId").value,
    invoiceDate: document.getElementById("invoiceDate").value
  };

  const rows = Array.from(document.querySelectorAll("#invoiceBody tr"));
  const invoiceItems = rows.map(row => {
    const cells = row.querySelectorAll("td");
    return {
      item: cells[0].textContent,
      description: cells[1].textContent,
      qty: cells[2].textContent,
      discount: cells[3].textContent,
      taxable: cells[4].textContent,
      unitPrice: cells[5].textContent,
      total: cells[6].textContent
    };
  });

  const totals = {
    subtotal: document.getElementById("subtotal").textContent,
    vat: document.getElementById("vat").textContent,
    total: document.getElementById("total").textContent
  };

  const invoiceNumber = document.getElementById("invoiceNumber").textContent;

  localStorage.setItem("clientInfo", JSON.stringify(clientInfo));
  localStorage.setItem("invoiceDetails", JSON.stringify(invoiceDetails));
  localStorage.setItem("invoiceItems", JSON.stringify(invoiceItems));
  localStorage.setItem("totals", JSON.stringify(totals));
  localStorage.setItem("invoiceNumber", invoiceNumber);

  

  setTimeout(() => {
    window.location.href = "Inv.html";
  }, 500); // redirect after storing
}

async function uploadPDF(pdfBlob, invoiceNumber, clientName, docType) {
  const formData = new FormData();
  formData.append("pdf", pdfBlob, `${invoiceNumber}.pdf`);
  formData.append("invoice_number", invoiceNumber);
  formData.append("client_name", clientName);
  formData.append("doc_type", docType); // "invoice" or "quote"

  await fetch("http://localhost:3000/upload", {
    method: "POST",
    body: formData,
  });
}

