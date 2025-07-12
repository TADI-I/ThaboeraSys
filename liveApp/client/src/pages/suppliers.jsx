import React, { useEffect, useState, useRef } from "react";
import './suppliers.css';


// Helper components for icons (using FontAwesome CDN assumed loaded in HTML or you can install react-icons/fa)
const IconTruck = () => <i className="fas fa-truck" />;
const IconPlus = () => <i className="fas fa-plus" />;
const IconEdit = () => <i className="fas fa-edit" />;
const IconTrash = () => <i className="fas fa-trash-alt" />;
const IconSave = () => <i className="fas fa-save" />;

// Simple multi-select component (no external lib, basic)
function MultiSelect({ options, selected, onChange }) {
  // Handle toggling selection
  const toggleOption = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: 4,
        minHeight: 45,
        padding: 5,
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        cursor: "pointer",
      }}
      onClick={(e) => e.stopPropagation()} // Prevent modal close if used inside modal
    >
      {options.map((opt) => (
        <div
          key={opt.id}
          onClick={() => toggleOption(opt.id)}
          style={{
            padding: "3px 8px",
            borderRadius: 4,
            backgroundColor: selected.includes(opt.id) ? "#d32f2f" : "#f5f5f5",
            color: selected.includes(opt.id) ? "white" : "#333",
            userSelect: "none",
          }}
        >
          {opt.name}
        </div>
      ))}
    </div>
  );
}

export default function SupplierManagement() {
  const [authToken] = React.useState(localStorage.getItem("authToken"));
  const [suppliers, setSuppliers] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [products, setProducts] = React.useState([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalTitle, setModalTitle] = React.useState("Add New Supplier");
  const [formData, setFormData] = React.useState({
  id: "",
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  suppliedProducts: [],
  rawSuppliedProducts: "", // <-- Add this
});

  const [alert, setAlert] = useState(null); // {type, message}

  // Ref for clicking outside modal to close it
  const modalRef = useRef(null);

  // Redirect if no auth token
  useEffect(() => {
    if (!authToken) {
      window.location.href = "login.html";
    }
  }, [authToken]);

// Load suppliers with optional search
async function loadSuppliers(search = "") {
  try {
    const res = await fetch(`/api/suppliers?search=${encodeURIComponent(search)}`);
    const result = await res.json();

    if (res.ok && result.success) {
      setSuppliers(result.data);
    } else {
      console.error("Failed to load suppliers:", result.message || "Unknown error");
    }
  } catch (err) {
    console.error("Error loading suppliers:", err);
  }
}


async function simulateAPICall(url, data = null, method = "GET") {
  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const res = await fetch(url, options);
    const result = await res.json();

    if (!res.ok) {
      console.error(`API Error [${method} ${url}]:`, result.message || res.statusText);
      return { success: false, message: result.message || "API call failed" };
    }

    return result;
  } catch (err) {
    console.error(`Fetch error [${method} ${url}]:`, err);
    return { success: false, message: "Network error" };
  }
}


// Load all products for supplier form
async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    const result = await res.json();

    if (result.success) {
      setProducts(result.data);
    } else {
      console.error("Failed to load products:", result.message);
    }
  } catch (err) {
    console.error("Error loading products:", err);
  }
}



  // Initial load
  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      loadSuppliers(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Modal open handlers
  function openAddModal() {
    console.log("openAddModal called");
    setModalTitle("Add New Supplier");
  setFormData({
  id: "",
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  suppliedProducts: "",
  rawSuppliedProducts: "",
});

    setModalOpen(true);
  }

  async function openEditModal(id) {
    const res = await simulateAPICall(`/api/suppliers/${id}`);
    if (res.success) {
      const s = res.data;
      setModalTitle("Edit Supplier");
      setFormData({
        id: s.id,
        name: s.name,
        contactPerson: s.contactPerson,
        email: s.email,
        phone: s.phone || "",
        address: s.address || "",
        notes: s.notes || "",
        suppliedProducts: s.suppliedProducts || "",
      });
      setModalOpen(true);
    }
  }

  // Close modal on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setModalOpen(false);
      }
    }
    if (modalOpen) {
      window.addEventListener("click", handleClickOutside);
    } else {
      window.removeEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [modalOpen]);

  // Validate email helper
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Show alert helper
  function showAlert(message, type) {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  }

  // Handle form input changes
  function onInputChange(e) {
    const { id, value } = e.target;
    setFormData((f) => ({ ...f, [id]: value }));
  }

  // Handle multi-select change
  function onMultiSelectChange(selectedIds) {
    setFormData((f) => ({ ...f, suppliedProducts: selectedIds }));
  }

  // Submit form
async function onSubmit(e) {
  e.preventDefault();

  const data = {
    name: formData.name.trim(),
    contactPerson: formData.contactPerson.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim(),
    address: formData.address.trim(),
    notes: formData.notes.trim(),
    suppliedProducts: formData.suppliedProducts,
  };

  if (!data.name || !data.contactPerson || !data.email) {
    showAlert("Name, contact person and email are required", "error");
    return;
  }

  if (!validateEmail(data.email)) {
    showAlert("Please enter a valid email address", "error");
    return;
  }

  const url = formData.id ? `/api/suppliers/${formData.id}` : "/api/suppliers";
  const method = formData.id ? "PUT" : "POST";

  try {
    const res = await simulateAPICall(url, data, method);

    if (res.success) {
      await loadSuppliers();         // reload updated list
      setModalOpen(false);          // close modal
      showAlert(
        `Supplier ${formData.id ? "updated" : "added"} successfully!`,
        "success"
      );
    } else {
      showAlert(res.message || "Failed to save supplier", "error");
    }
  } catch (err) {
    console.error("Submit Error:", err);
    showAlert("Unexpected error saving supplier", "error");
  }
}


  // Delete supplier
  async function deleteSupplier(id) {
    if (window.confirm("Are you sure you want to delete this supplier? This action cannot be undone.")) {
      const res = await simulateAPICall(`/api/suppliers/${id}`, {}, "DELETE");
      if (res.success) {
        await loadSuppliers();
        showAlert("Supplier deleted successfully!", "success");
      }
    }
  }

  // Render suppliers table rows
  function renderSupplierRow(supplier) {
    return (
      <tr key={supplier.id}>
        <td>
          <strong>{supplier.name}</strong>
          {supplier.notes && <div style={{ color: "#666", fontSize: 13 }}>{supplier.notes}</div>}
        </td>
        <td>{supplier.contactPerson}</td>
        <td>
          <a href={`mailto:${supplier.email}`}>{supplier.email}</a>
        </td>
        <td>{supplier.phone || "-"}</td>
        <td>
          {supplier.suppliedProducts && supplier.suppliedProducts.length > 0
            ? supplier.suppliedProducts.map((p) => (
                <span
                  key={p.id}
                  style={{
                    display: "inline-block",
                    backgroundColor: "#f5f5f5",
                    padding: "3px 8px",
                    borderRadius: 4,
                    margin: 2,
                    fontSize: 12,
                  }}
                >
                  {p.name}
                </span>
              ))
            : "-"}
        </td>
        <td style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-edit"
            onClick={() => openEditModal(supplier.id)}
            style={{
              backgroundColor: "#2196f3",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: 4,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <IconEdit /> Edit
          </button>
          <button
            className="btn-delete"
            onClick={() => deleteSupplier(supplier.id)}
            style={{
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: 4,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <IconTrash /> Delete
          </button>
        </td>
      </tr>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: 30,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#333",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ marginBottom: 25, color: "#d32f2f", display: "flex", alignItems: "center", gap: 10 }}>
        <IconTruck />
        Suppliers & Resellers
      </h1>

      {alert && (
        <div
          style={{
            marginBottom: 20,
            padding: 10,
            borderRadius: 4,
            color: alert.type === "success" ? "#4caf50" : "#f44336",
            border: `1px solid ${alert.type === "success" ? "#4caf50" : "#f44336"}`,
          }}
        >
          {alert.message}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
          marginBottom: 25,
        }}
      >
        <button
          onClick={openAddModal}
          className="btn-primary"
          style={{
            backgroundColor: "#d32f2f",
            color: "white",
            border: "none",
            padding: "12px 25px",
            borderRadius: 4,
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <IconPlus />
          Add New Supplier
        </button>

        <input
          type="text"
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 4,
            border: "1px solid #e0e0e0",
            fontSize: 15,
            flexGrow: 1,
            minWidth: 200,
            maxWidth: 400,
          }}
        />
      </div>

      <table
        
      >
        <thead>
          <tr >
            <th style={{ padding: 15, textAlign: "left", fontWeight: 500 }}>Supplier Name</th>
            <th style={{ padding: 15, textAlign: "left", fontWeight: 500 }}>Contact Person</th>
            <th style={{ padding: 15, textAlign: "left", fontWeight: 500 }}>Email</th>
            <th style={{ padding: 15, textAlign: "left", fontWeight: 500 }}>Phone</th>
            <th style={{ padding: 15, textAlign: "left", fontWeight: 500 }}>Products Supplied</th>
            <th style={{ padding: 15, textAlign: "left", fontWeight: 500 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#666" }}>
                <IconTruck style={{ fontSize: 50, marginBottom: 15, color: "#e0e0e0" }} />
                <p>No suppliers found</p>
              </td>
            </tr>
          ) : (
            suppliers.map(renderSupplierRow)
          )}
        </tbody>
      </table>

      {/* Modal */}
   {modalOpen && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.6)",
      zIndex: 9999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: 30,
        borderRadius: 8,
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        position: "relative",
        maxHeight: "90vh",
        overflowY: "auto",
        width: "100%",
        maxWidth: 700,
      }}
    >
     <span
              className="close"
              onClick={() => setModalOpen(false)}
              style={{
                position: "absolute",
                right: 25,
                top: 25,
                fontSize: 24,
                fontWeight: "bold",
                cursor: "pointer",
                color: "#666",
              }}
              title="Close"
            >
              &times;
            </span>

            <h2 style={{ marginBottom: 20, color: "#d32f2f", display: "flex", alignItems: "center", gap: 10 }}>
              {modalTitle.includes("Add") ? <IconTruck /> : <IconEdit />}
              {modalTitle}
            </h2>

            <form onSubmit={onSubmit}>
              <input type="hidden" id="supplierId" value={formData.id} readOnly />
              <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <label>Supplier Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter supplier name"
                    required
                    value={formData.name}
                    onChange={onInputChange}
                    className="input-style"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Contact Person</label>
                  <input
                    type="text"
                    id="contactPerson"
                    placeholder="Enter contact person"
                    required
                    value={formData.contactPerson}
                    onChange={onInputChange}
                    className="input-style"
                  />
                </div>
              </div>

               <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <label>Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter email"
                    required
                    value={formData.email}
                    onChange={onInputChange}
                    className="input-style"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={onInputChange}
                   className="input-style"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label>Address</label>
                <textarea
                  id="address"
                  placeholder="Enter full address"
                  value={formData.address}
                  className="input-style"
                  onChange={onInputChange}
                  style={{ minHeight: 100, resize: "vertical" }}
                />
              </div>

<div style={{ marginBottom: 20 }}>
  <label htmlFor="suppliedProducts">Products Supplied (comma-separated)</label>
  <textarea
    id="suppliedProducts"
    placeholder="e.g. Laptops, Routers, Cables"
    value={formData.rawSuppliedProducts || ""}
    onChange={(e) => {
      const raw = e.target.value;
      const parsed = raw
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      setFormData((prev) => ({
        ...prev,
        rawSuppliedProducts: raw,
        suppliedProducts: parsed,
      }));
    }}
    className="input-style"
    style={{ minHeight: 100, resize: "vertical" }}
  />
</div>



              <div style={{ marginBottom: 20 }}>
                <label>Notes</label>
                <textarea
                  id="notes"
                  placeholder="Enter any additional notes"
                  value={formData.notes}
                  onChange={onInputChange}
                  className="input-style"
                  style={{ minHeight: 100, resize: "vertical" }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#d32f2f",
                    color: "white",
                    border: "none",
                    padding: "12px 25px",
                    borderRadius: 4,
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <IconSave />
                  Save Supplier
                </button>
                 <button type="button" onClick={() => setModalOpen(false)}>Cancel</button>
              </div>
            </form>
    </div>
  </div>
)}

    </div>
  );
}


