const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");

const Supplier = require("../models/Suppliers");
const Product = require("../models/Product");

// 🔧 Helper: Convert product names to IDs
async function getProductIdsByNames(names) {
  const products = await Product.findAll({
    where: { name: { [Op.in]: names } },
  });
  return products.map(p => p.id);
}

// 🔍 GET all suppliers with products
router.get("/", async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      include: [{ model: Product, as: "suppliedProducts" }],
    });
    res.json({ success: true, data: suppliers });
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    res.status(500).json({ success: false, message: "Failed to fetch suppliers" });
  }
});

// 🔍 GET single supplier by ID with products
router.get("/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id, {
      include: [{ model: Product, as: "suppliedProducts" }],
    });
    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }
    res.json({ success: true, data: supplier });
  } catch (err) {
    console.error("Error fetching supplier:", err);
    res.status(500).json({ success: false, message: "Failed to fetch supplier" });
  }
});

// ➕ POST create supplier and link products
router.post("/", async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address, notes, suppliedProducts = [] } = req.body;
    const supplier = await Supplier.create({ name, contactPerson, email, phone, address, notes });

    if (Array.isArray(suppliedProducts) && suppliedProducts.length > 0) {
      const productIds = await getProductIdsByNames(suppliedProducts);
      await supplier.setSuppliedProducts(productIds);
    }

    const createdSupplier = await Supplier.findByPk(supplier.id, {
      include: [{ model: Product, as: "suppliedProducts" }],
    });

    res.status(201).json({ success: true, data: createdSupplier });
  } catch (err) {
    console.error("Error creating supplier:", err);
    res.status(500).json({ success: false, message: "Failed to create supplier" });
  }
});

// ✏️ PUT update supplier and linked products
router.put("/:id", async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address, notes, suppliedProducts = [] } = req.body;
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    await supplier.update({ name, contactPerson, email, phone, address, notes });

    if (Array.isArray(suppliedProducts)) {
      const productIds = await getProductIdsByNames(suppliedProducts);
      await supplier.setSuppliedProducts(productIds);
    }

    const updatedSupplier = await Supplier.findByPk(supplier.id, {
      include: [{ model: Product, as: "suppliedProducts" }],
    });

    res.json({ success: true, data: updatedSupplier });
  } catch (err) {
    console.error("Error updating supplier:", err);
    res.status(500).json({ success: false, message: "Failed to update supplier" });
  }
});

// ❌ DELETE supplier
router.delete("/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    await supplier.destroy();
    res.json({ success: true, message: "Supplier deleted successfully" });
  } catch (err) {
    console.error("Error deleting supplier:", err);
    res.status(500).json({ success: false, message: "Failed to delete supplier" });
  }
});

module.exports = router;
