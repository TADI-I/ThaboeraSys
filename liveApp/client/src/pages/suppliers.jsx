import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar"; // <-- FIX: Import Sidebar
import './suppliers.css';


// Helper components for icons (using FontAwesome CDN assumed loaded in HTML or you can install react-icons/fa)
const IconTruck = () => <i className="fas fa-truck" />;
const IconPlus = () => <i className="fas fa-plus" />;
const IconEdit = () => <i className="fas fa-edit" />;
const IconTrash = () => <i className="fas fa-trash-alt" />;
const IconSave = () => <i className="fas fa-save" />;

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
    rawSuppliedProducts: "",
  });

  const [alert, setAlert] = useState(null);
  const modalRef = useRef(null);

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
      suppliedProducts: [],
      rawSuppliedProducts: "",
    });

    setModalOpen(true);
  }

  async function openEditModal(id) {
    const res = await simulateAPICall(`/api/suppliers/${id}`);
    if (res.success) {
      const s = res.data;
      // If suppliedProducts is an array of objects, convert to names for textarea
      let rawSuppliedProducts = "";
      if (Array.isArray(s.suppliedProducts)) {
        rawSuppliedProducts = s.suppliedProducts
          .map((p) => (typeof p === "string" ? p : p.name))
          .join(", ");
      } else if (typeof s.suppliedProducts === "string") {
        rawSuppliedProducts = s.suppliedProducts;
      }
      setModalTitle("Edit Supplier");
      setFormData({
        id: s.id,
        name: s.name,
        contactPerson: s.contactPerson,
        email: s.email,
        phone: s.phone || "",
        address: s.address || "",
        notes: s.notes || "",
        suppliedProducts: Array.isArray(s.suppliedProducts)
          ? s.suppliedProducts.map((p) => (typeof p === "string" ? p : p.name))
          : [],
        rawSuppliedProducts,
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
      suppliedProducts: (formData.rawSuppliedProducts || "")
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
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
    let suppliedProducts = supplier.suppliedProducts;
    if (Array.isArray(suppliedProducts)) {
      suppliedProducts = suppliedProducts
        .map((p) => (typeof p === "string" ? p : p.name))
        .filter(Boolean);
    } else if (typeof suppliedProducts === "string") {
      suppliedProducts = suppliedProducts.split(",").map((s) => s.trim());
    } else {
      suppliedProducts = [];
    }
    return (
      <tr key={supplier.id}>
        <td>
          <strong>{supplier.name}</strong>
          {supplier.notes && <div className="supplier-notes">{supplier.notes}</div>}
        </td>
        <td>{supplier.contactPerson}</td>
        <td>
          <a href={`mailto:${supplier.email}`}>{supplier.email}</a>
        </td>
        <td>{supplier.phone || "-"}</td>
        <td>
          {suppliedProducts.length > 0
            ? suppliedProducts.map((name, idx) => (
                <span className="product-tag" key={idx}>
                  {name}
                </span>
              ))
            : "-"}
        </td>
        <td className="actions">
          <button
            className="btn-edit"
            onClick={() => openEditModal(supplier.id)}
          >
            <IconEdit /> Edit
          </button>
          <button
            className="btn-delete"
            onClick={() => deleteSupplier(supplier.id)}
          >
            <IconTrash /> Delete
          </button>
        </td>
      </tr>
    );
  }

  return (
    <>
      <div className="main-view">
        <Sidebar />
        <div className="management-container">
          <h1>
            <IconTruck />
            Suppliers & Resellers
          </h1>

          {alert && (
            <div className={`alert ${alert.type}`}>{alert.message}</div>
          )}

          <div className="table-actions">
            <button
              onClick={openAddModal}
              className="btn-primary"
            >
              <IconPlus />
              Add New Supplier
            </button>

            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <table>
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Products Supplied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    <IconTruck />
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
            <div className="modal" style={{ display: "block" }}>
              <div className="modal-content" ref={modalRef}>
                <span
                  className="close"
                  onClick={() => setModalOpen(false)}
                  title="Close"
                >
                  &times;
                </span>

                <h2>
                  {modalTitle.includes("Add") ? <IconTruck /> : <IconEdit />}
                  {modalTitle}
                </h2>

                <form onSubmit={onSubmit}>
                  <input type="hidden" id="supplierId" value={formData.id} readOnly />
                  <div className="form-row">
                    <div className="form-group">
                      <label>Supplier Name</label>
                      <input
                        type="text"
                        id="name"
                        placeholder="Enter supplier name"
                        required
                        value={formData.name}
                        onChange={onInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Contact Person</label>
                      <input
                        type="text"
                        id="contactPerson"
                        placeholder="Enter contact person"
                        required
                        value={formData.contactPerson}
                        onChange={onInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        id="email"
                        placeholder="Enter email"
                        required
                        value={formData.email}
                        onChange={onInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={onInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      id="address"
                      placeholder="Enter full address"
                      value={formData.address}
                      onChange={onInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="suppliedProducts">Products Supplied (comma-separated)</label>
                    <textarea
                      id="suppliedProducts"
                      placeholder="e.g. Laptops, Routers, Cables"
                      value={formData.rawSuppliedProducts || ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          rawSuppliedProducts: raw,
                        }));
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      id="notes"
                      placeholder="Enter any additional notes"
                      value={formData.notes}
                      onChange={onInputChange}
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      <IconSave />
                      Save Supplier
                    </button>
                    <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" style={{ marginLeft: 10 }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}


