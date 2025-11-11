import { supabase } from "../config/supabaseClient.js";

// ➕ Add or update restaurant stock item
export const addOrUpdateStock = async (req, res) => {
  try {
    const {
      item_name,
      category,
      unit,
      quantity,
      price_per_unit,
      used_today,
      received_by,
      supplier_name,
      payment_mode,
      date,
    } = req.body;

    // Validation
    if (!item_name || !category || !unit || !quantity || !price_per_unit || !received_by) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    const qty = Number(quantity);
    const price = Number(price_per_unit);
    const total_price = qty * price;

    // 1️⃣ Check if item already exists
    const { data: existing, error: fetchError } = await supabase
      .from("restaurant_stocks")
      .select("*")
      .eq("item_name", item_name)
      .eq("category", category)
      .eq("unit", unit)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      // 2️⃣ Item exists → update quantity and remaining_stock
      const newQuantity = existing.quantity + qty;
      const newRemaining = existing.remaining_stock + qty;

      const { error: updateError } = await supabase
        .from("restaurant_stocks")
        .update({
          quantity: newQuantity,
          remaining_stock: newRemaining,
          price_per_unit: price, // latest price
        
          date: date || new Date().toISOString().split("T")[0],
          received_by,
          supplier_name,
          payment_mode,
        })
        .eq("id", existing.id);

      if (updateError) throw updateError;

      return res.json({ message: "✅ Existing stock updated successfully" });
    }

    // 3️⃣ Item doesn’t exist → insert a new record
    const { error: insertError } = await supabase.from("restaurant_stocks").insert([
      {
        item_name,
        category,
        unit,
        quantity: qty,
        price_per_unit: price,
    
        used_today: used_today || 0,
        remaining_stock: qty,
        received_by,
        supplier_name,
        payment_mode,
        date: date || new Date().toISOString().split("T")[0],
      },
    ]);

    if (insertError) throw insertError;

    res.status(201).json({ message: "🆕 New stock record added successfully" });

  } catch (err) {
    console.error("❌ Error adding/updating stock:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// 📋 Get all restaurant stocks
export const getRestaurantStocks = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("restaurant_stocks")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching stocks:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Update used_today and remaining_stock
export const updateUsedStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { used_today } = req.body;

    const { data: stock, error: fetchError } = await supabase
      .from("restaurant_stocks")
      .select("quantity, remaining_stock, used_today")
      .eq("id", id)
      .single();

    if (fetchError || !stock) throw fetchError || new Error("Stock item not found");

    const usedDiff = used_today - stock.used_today;
    const newRemaining = Math.max(stock.remaining_stock - usedDiff, 0);

    const { error: updateError } = await supabase
      .from("restaurant_stocks")
      .update({ used_today, remaining_stock: newRemaining })
      .eq("id", id);

    if (updateError) throw updateError;

    res.json({ message: "Stock updated successfully" });
  } catch (err) {
    console.error("Error updating stock:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ❌ Delete a stock item
export const deleteRestaurantStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("restaurant_stocks")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({ message: "Stock item deleted successfully" });
  } catch (err) {
    console.error("Error deleting stock:", err.message);
    res.status(500).json({ error: err.message });
  }
};
