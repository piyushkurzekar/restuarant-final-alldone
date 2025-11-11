import { supabase } from "../config/supabaseClient.js";
import puppeteer from "puppeteer";
import { generateInvoiceHTML } from "../templates/generateInvoiceHTML.js";

// -------------------- ORDERS --------------------

export const placeOrder = async (req, res) => {
  try {
    const {
      guestName,
      contact,
      tableNumber,
      dateTime,
      items,
      total,
      receiveby,
      notes,
    } = req.body;

    console.log("Incoming Order:", req.body);

    const { data: existingOrder } = await supabase
      .from("orders")
      .select("*")
      .eq("tableNumber", tableNumber)
      .eq("status", "Pending")
      .single();

    if (existingOrder) {

      let oldItems = Array.isArray(existingOrder.items)
        ? existingOrder.items
        : JSON.parse(existingOrder.items || "[]");

      const mergedItems = [...oldItems];
      items.forEach((newItem) => {
        const idx = mergedItems.findIndex((i) => i.name === newItem.name);
        if (idx !== -1) {
          mergedItems[idx].qty += newItem.qty;
          mergedItems[idx].subtotal += newItem.subtotal;
        } else {
          mergedItems.push(newItem);
        }
      });

      const updatedTotal = mergedItems.reduce((sum, i) => sum + i.subtotal, 0);

      await supabase
        .from("orders")
        .update({
          items: mergedItems,
          total: updatedTotal,
          receiveby: receiveby || existingOrder.receiveby,
          notes: JSON.stringify(notes || existingOrder.notes || []),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingOrder.id);

      return res.json({ message: "Order updated successfully", type: "update" });
    }

    // ✅ New order
    await supabase.from("orders").insert([
      {
        guestName,
        contact,
        tableNumber,
        dateTime,
        items,
        total,
        receiveby,
        notes: JSON.stringify(notes || []),
        status: "Pending",
        paymentmode: null,
      },
    ]);

    res.json({ message: "Order placed successfully", type: "new" });
  } catch (err) {
    console.error("placeOrder error:", err);
    res.status(500).json({ error: err.message });
  }
};




// Get pending orders
export const getPendingOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "Pending")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("getPendingOrders error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get cart orders
export const getCartOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["Pending", "Confirmed"])
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("getCartOrders error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Confirm order
export const confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const { data, error } = await supabase
      .from("orders")
      .update({ status: "Confirmed", notes })
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json({ message: "Order sent to Kitchen", data });
  } catch (err) {
    console.error("confirmOrder error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get kitchen orders
export const getKitchenOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["Confirmed", "Completed"])
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("getKitchenOrders error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentmode, gst_type } = req.body;

    // 🟢 Fetch order
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !order)
      return res.status(404).json({ error: "Order not found" });

    // ✅ Calculate base total (items + notes/extras)
    const itemsTotal = Number(order.total) || 0;

    // 🟢 Parse notes if stored as JSON (Supabase may store as text)
    let extrasTotal = 0;
    try {
      const notes = typeof order.notes === "string" ? JSON.parse(order.notes) : order.notes;
      if (Array.isArray(notes)) {
        extrasTotal = notes.reduce(
          (sum, note) => sum + (Number(note.price) || 0) * (Number(note.qty) || 1),
          0
        );
      }
    } catch (e) {
      console.warn("⚠️ Notes parse error:", e);
    }

    const subtotal = itemsTotal + extrasTotal;

    // ✅ GST calculation
    const gstRate = 5;
    const gstTypeNormalized = gst_type?.toLowerCase() || "intra";

    let cgst = 0,
      sgst = 0,
      igst = 0;

    if (gstTypeNormalized === "inter") {
      igst = (subtotal * gstRate) / 100;
    } else {
      cgst = (subtotal * (gstRate / 2)) / 100;
      sgst = (subtotal * (gstRate / 2)) / 100;
    }

    const gst_total = Number((cgst + sgst + igst).toFixed(2));
    const grand_total = Number((subtotal + gst_total).toFixed(2));

    // ✅ Update Supabase
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: "Completed",
        paymentmode: paymentmode || null,
        gst_type: gstTypeNormalized,
        cgst,
        sgst,
        igst,
        gst_total,
        grand_total,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    // ✅ Response
    res.json({
      message: "✅ Order completed with GST + extras",
      totals: {
        itemsTotal,
        extrasTotal,
        subtotal,
        gst_type: gstTypeNormalized,
        cgst,
        sgst,
        igst,
        gst_total,
        grand_total,
      },
      data,
    });
  } catch (err) {
    console.error("completeOrder error:", err);
    res.status(500).json({ error: err.message });
  }
};





// Get completed orders
export const getCompletedOrders = async (req, res) => {
  try {
    const { date } = req.query;
    let query = supabase.from("orders").select("*").eq("status", "Completed");
    if (date) query = query.eq("dateTime", date);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("getCompletedOrders error:", err);
    res.status(500).json({ error: err.message });
  }
};


// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("getOrderById error:", err);
    res.status(404).json({ error: "Order not found" });
  }
};

// -------------------- SEND INVOICE (Puppeteer + Supabase) --------------------

export const sendInvoiceToWhatsApp = async (req, res) => {
  const { orderId } = req.params;

  try {
    // 1️⃣ Fetch order data
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ✅ Safe JSON helper
    const safeJSONParse = (data, fallback = []) => {
      try {
        if (!data) return fallback;
        return typeof data === "string" ? JSON.parse(data) : data;
      } catch {
        return fallback;
      }
    };

    // 2️⃣ Prepare full order object (Items + Notes/Extras)
    const fullOrder = {
      ...order,
      items: Array.isArray(order.items)
        ? order.items
        : safeJSONParse(order.items, []),
      notes: Array.isArray(order.notes)
        ? order.notes
        : Array.isArray(order.extralist)
          ? order.extralist
          : safeJSONParse(order.notes, []),
      finalTotal:
        order.grand_total || (order.total || 0) + (order.gst_total || 0),
    };

    console.log("✅ Notes for invoice:", fullOrder.notes);

    // 3️⃣ Create invoice HTML
    const invoiceHTML = generateInvoiceHTML(fullOrder);

    // 4️⃣ Launch Puppeteer safely for Render
    const browser = await puppeteer.launch({
      headless: true,
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH ||
        (await puppeteer.executablePath()), // ✅ ensures correct path on Render
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(invoiceHTML, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px" },
    });

    await browser.close();

    // 5️⃣ Upload PDF to Supabase Storage
    const fileName = `invoice_${orderId}_${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError)
      return res.status(500).json({ error: uploadError.message });

    // 6️⃣ Get public URL
    const { data: publicData } = supabase.storage
      .from("invoices")
      .getPublicUrl(fileName);

    console.log("✅ Invoice generated:", publicData.publicUrl);

    res.json({ publicUrl: publicData.publicUrl });
  } catch (err) {
    console.error("❌ sendInvoiceToWhatsApp error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};
