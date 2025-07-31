import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/products";
import Quotations from "./pages/quotations";
import Invoices from "./pages/invoices";
import Suppliers from "./pages/suppliers";
import Profile from "./pages/profile";
import UserManagement from "./pages/UserManagement";
import DocumentLibrary from "./pages/DocumentLibrary";
import TenderManagement from "./pages/TenderManagement";
import AuditLogs from "./pages/audit-logs";

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      
      {/* Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Modules */}
      <Route path="/products" element={<Products />} />
      <Route path="/quotations" element={<Quotations />} />
      <Route path="/invoices" element={<Invoices />} />
      <Route path="/suppliers" element={<Suppliers />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/user-management" element={<UserManagement />} />
      <Route path="/documents" element={<DocumentLibrary />} />
      <Route path="/tenders" element={<TenderManagement />} />
      <Route path="/audit-logs" element={<AuditLogs />} />
    </Routes>
  );
}

export default App;
