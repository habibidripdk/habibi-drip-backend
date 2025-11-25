import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

// ✅ Basic check route
app.get("/", (req, res) => {
  res.send("Habibi Drip backend is running");
});

// ✅ Fetch all Printify products (auto-load mockups)
app.get("/products", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.printify.com/v1/shops/${process.env.SHOP_ID}/products.json`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`
        }
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ✅ Test order (DRAFT MODE — safe)
app.post("/test-order", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.printify.com/v1/shops/${process.env.SHOP_ID}/orders.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PRINTIFY_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          external_id: "test-order-001",
          label: "Test Order",
          draft: true,
          line_items: [
            {
              product_id: process.env.PRODUCT_ID,
              variant_id: Number(process.env.VARIANT_ID),
              quantity: 1
            }
          ],
          shipping_method: 1,
          send_shipping_notification: false,
          address_to: {
            first_name: "Test",
            last_name: "Customer",
            email: "test@example.com",
            phone: "00000000",
            country: "DK",
            address1: "Test Street 1",
            city: "København",
            zip: "1000"
          }
        })
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("Error creating test order:", err);
    res.status(500).json({ error: "Failed to create test order" });
  }
});

// ✅ Create REAL order after PayPal payment
app.post("/create-order", async (req, res) => {
  const { product_id, variant_id, customer } = req.body;

  if (!product_id || !variant_id || !customer) {
    return res.status(400).json({ error: "Missing order data" });
  }

  try {
    const response = await fetch(
      `https://api.printify.com/v1/shops/${process.env.SHOP_ID}/orders.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PRINTIFY_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          external_id: `order-${Date.now()}`,
          label: "Habibi Drip Order",
          line_items: [
            {
              product_id,
              variant_id: Number(variant_id),
              quantity: 1
            }
          ],
          shipping_method: 1,
          send_shipping_notification: true,
          address_to: {
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email,
            phone: customer.phone,
            country: customer.country,
            address1: customer.address1,
            city: customer.city,
            zip: customer.zip
          }
        })
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("Error creating real order:", err);
    res.status(500).json({ error: "Failed to create real order" });
  }
});

// ✅ Start server
app.listen(3000, () => {
  console.log("Habibi Drip backend running on port 3000");
});
