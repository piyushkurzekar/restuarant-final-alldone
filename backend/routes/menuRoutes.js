import express from "express";
import { supabase } from "../config/supabaseClient.js";

const router = express.Router();

// GET all menu items
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("menu_items").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error("Error fetching menu items:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST add new menu item
router.post("/add", async (req, res) => {
  const { name, price, img, category } = req.body;
  if (!name || !price) return res.status(400).json({ error: "Name and price are required" });

  try {
    const { data, error } = await supabase
      .from("menu_items")
      .insert([{ name, price, img, category }])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  } catch (err) {
    console.error("Error adding menu item:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT edit existing menu item
router.put("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, img, category } = req.body;

  try {
    const { data, error } = await supabase
      .from("menu_items")
      .update({ name, price, img, category })
      .eq("id", id)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  } catch (err) {
    console.error("Error updating menu item:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE a menu item
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Menu item deleted successfully" });
  } catch (err) {
    console.error("Error deleting menu item:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
