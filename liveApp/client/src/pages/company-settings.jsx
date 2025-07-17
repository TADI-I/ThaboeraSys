import React, { useState, useEffect, useRef } from 'react';
import './company-settings.css'; // Import your styles
import Sidebar from '../components/Sidebar';

export default function CompanySettings() {
  // Tab state
  const [activeTab, setActiveTab] = useState('general');

  // Logo upload state
  const [logoPreview, setLogoPreview] = useState('https://via.placeholder.com/150?text=Company+Logo');
  const [logoFileName, setLogoFileName] = useState('No file selected');

  // Favicon upload state
  const [faviconFileName, setFaviconFileName] = useState('No file selected');

  // Refs for file inputs (to reset file input value)
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  // Handlers

  // Tab click
  function handleTabClick(tab) {
    setActiveTab(tab);
  }

  // Logo upload change
  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.type.match('image.*')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setLogoPreview(event.target.result);
        };
        reader.readAsDataURL(file);
        setLogoFileName(file.name);
      } else {
        alert('Please select an image file');
        e.target.value = '';
        setLogoFileName('No file selected');
        setLogoPreview('https://via.placeholder.com/150?text=Company+Logo');
      }
    }
  }

  // Favicon upload change
  function handleFaviconChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith('.ico') || file.type === 'image/x-icon') {
        setFaviconFileName(file.name);
      } else {
        alert('Please select a .ico file');
        e.target.value = '';
        setFaviconFileName('No file selected');
      }
    }
  }

  // Form submit handlers
  function handleSubmit(e, message) {
    e.preventDefault();
    alert(message);
    // In a real app, submit data to server here
  }

  return (
    <>
    <div className="main-view">
    <Sidebar />
    <div className="settings-container" role="main">
      <h1>
        <i className="fas fa-cog" aria-hidden="true"></i> Company Settings
      </h1>

      <div className="settings-tabs" role="tablist" aria-label="Company settings tabs">
        {[
          {
            id: 'general',
            icon: 'fa-building',
            label: 'General',
          },
          {
            id: 'branding',
            icon: 'fa-palette',
            label: 'Branding',
          },
          {
            id: 'invoice',
            icon: 'fa-file-invoice',
            label: 'Invoice',
          },
          {
            id: 'tax',
            icon: 'fa-receipt',
            label: 'Tax',
          },
        ].map(({ id, icon, label }) => (
          <button
            key={id}
            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
            data-tab={id}
            onClick={() => handleTabClick(id)}
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`${id}-tab`}
            id={`tab-${id}`}
            tabIndex={activeTab === id ? 0 : -1}
          >
            <i className={`fas ${icon}`} aria-hidden="true"></i> {label}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {/* General Tab */}
        <section
          id="general-tab"
          className="tab-content"
          role="tabpanel"
          aria-labelledby="tab-general"
          hidden={activeTab !== 'general'}
        >
          <form
            id="companyForm"
            onSubmit={(e) => handleSubmit(e, 'General settings saved successfully!')}
            noValidate
          >
            <div className="form-group">
              <label htmlFor="companyName"><i className="fas fa-signature" aria-hidden="true"></i> Company Name</label>
              <input type="text" id="companyName" defaultValue="My IT Solutions Inc." required />
            </div>

            <div className="form-group">
              <label htmlFor="companyAddress"><i className="fas fa-map-marker-alt" aria-hidden="true"></i> Address</label>
              <textarea id="companyAddress" defaultValue="123 Business St, City, Country" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="companyPhone"><i className="fas fa-phone" aria-hidden="true"></i> Phone</label>
                <input type="tel" id="companyPhone" defaultValue="+1 (555) 123-4567" />
              </div>
              <div className="form-group">
                <label htmlFor="companyEmail"><i className="fas fa-envelope" aria-hidden="true"></i> Email</label>
                <input type="email" id="companyEmail" defaultValue="contact@myitsolutions.com" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="companyWebsite"><i className="fas fa-globe" aria-hidden="true"></i> Website</label>
              <input type="url" id="companyWebsite" defaultValue="https://www.myitsolutions.com" />
            </div>

            <div className="form-group">
              <label htmlFor="businessNumber"><i className="fas fa-id-card" aria-hidden="true"></i> Business Number</label>
              <input type="text" id="businessNumber" defaultValue="123456789" />
            </div>

            <button type="submit" className="btn-primary">
              <i className="fas fa-save" aria-hidden="true"></i> Save General Settings
            </button>
          </form>
        </section>

        {/* Branding Tab */}
        <section
          id="branding-tab"
          className="tab-content"
          role="tabpanel"
          aria-labelledby="tab-branding"
          hidden={activeTab !== 'branding'}
        >
          <form
            id="brandingForm"
            onSubmit={(e) => handleSubmit(e, 'Branding settings saved successfully!')}
            noValidate
          >
            <div className="form-group">
              <label>
                <i className="fas fa-image" aria-hidden="true"></i> Company Logo
              </label>
              <div className="logo-preview">
                <img id="logoPreview" src={logoPreview} alt="Company Logo" />
                <div>
                  <div className="file-upload-wrapper">
                    <label htmlFor="logoUpload" className="file-upload-label">
                      <i className="fas fa-upload" aria-hidden="true"></i> Choose Logo
                    </label>
                    <input
                      type="file"
                      id="logoUpload"
                      accept="image/*"
                      onChange={handleLogoChange}
                      ref={logoInputRef}
                    />
                    <div className="file-name" id="logoFileName">{logoFileName}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="primaryColor">
                <i className="fas fa-fill-drip" aria-hidden="true"></i> Primary Color
              </label>
              <input type="color" id="primaryColor" defaultValue="#3a7bd5" />
            </div>

            <div className="form-group">
              <label htmlFor="secondaryColor">
                <i className="fas fa-fill" aria-hidden="true"></i> Secondary Color
              </label>
              <input type="color" id="secondaryColor" defaultValue="#00d2ff" />
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-star" aria-hidden="true"></i> Favicon
              </label>
              <div className="file-upload-wrapper">
                <label htmlFor="faviconUpload" className="file-upload-label">
                  <i className="fas fa-upload" aria-hidden="true"></i> Choose Favicon (.ico)
                </label>
                <input
                  type="file"
                  id="faviconUpload"
                  accept="image/x-icon,.ico"
                  onChange={handleFaviconChange}
                  ref={faviconInputRef}
                />
                <div className="file-name" id="faviconFileName">{faviconFileName}</div>
              </div>
            </div>

            <button type="submit" className="btn-primary">
              <i className="fas fa-save" aria-hidden="true"></i> Save Branding
            </button>
          </form>
        </section>

        {/* Invoice Tab */}
        <section
          id="invoice-tab"
          className="tab-content"
          role="tabpanel"
          aria-labelledby="tab-invoice"
          hidden={activeTab !== 'invoice'}
        >
          <form
            id="invoiceForm"
            onSubmit={(e) => handleSubmit(e, 'Invoice settings saved successfully!')}
            noValidate
          >
            <div className="form-group">
              <label htmlFor="invoicePrefix"><i className="fas fa-file-alt" aria-hidden="true"></i> Invoice Prefix</label>
              <input type="text" id="invoicePrefix" defaultValue="INV" />
            </div>

            <div className="form-group">
              <label htmlFor="nextInvoiceNumber"><i className="fas fa-sort-numeric-up" aria-hidden="true"></i> Next Invoice Number</label>
              <input type="number" id="nextInvoiceNumber" defaultValue="1001" />
            </div>

            <div className="form-group">
              <label htmlFor="invoiceTerms"><i className="fas fa-file-signature" aria-hidden="true"></i> Invoice Terms</label>
              <textarea id="invoiceTerms" defaultValue="Payment due within 30 days" />
            </div>

            <button type="submit" className="btn-primary">
              <i className="fas fa-save" aria-hidden="true"></i> Save Invoice Settings
            </button>
          </form>
        </section>

        {/* Tax Tab */}
        <section
          id="tax-tab"
          className="tab-content"
          role="tabpanel"
          aria-labelledby="tab-tax"
          hidden={activeTab !== 'tax'}
        >
          <form
            id="taxForm"
            onSubmit={(e) => handleSubmit(e, 'Tax settings saved successfully!')}
            noValidate
          >
            <div className="form-group">
              <label htmlFor="taxRate"><i className="fas fa-percentage" aria-hidden="true"></i> Default Tax Rate (%)</label>
              <input type="number" id="taxRate" defaultValue="15" min="0" max="100" step="0.1" />
            </div>

            <div className="form-group">
              <label htmlFor="taxIdNumber"><i className="fas fa-receipt" aria-hidden="true"></i> Tax Identification Number</label>
              <input type="text" id="taxIdNumber" defaultValue="TAX123456789" />
            </div>

            <div className="form-group">
              <label htmlFor="taxFooter"><i className="fas fa-file-alt" aria-hidden="true"></i> Tax Invoice Footer</label>
              <textarea id="taxFooter" defaultValue="Tax Invoice - GST Included Where Applicable" />
            </div>

            <button type="submit" className="btn-primary">
              <i className="fas fa-save" aria-hidden="true"></i> Save Tax Settings
            </button>
          </form>
        </section>
      </div>
    </div>
    </div>
    </>
  );
}
