
import express from "express";
import cors from "cors";
import staffRoutes from "./routes/staffRoutes.js";
import orderRoutes from "./routes/orderRoutes.js"; // import orders routes
import cron from "node-cron";
import restaurantStockRoutes from "./routes/restaurantStockRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/staff", staffRoutes);          // Staff module
app.use("/api/orders", orderRoutes);     // Orders module

app.use("/api/restaurant-stocks", restaurantStockRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("✅ Backend running (Staff + Orders + stock)");
});

//  Reset used_today every midnight
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("🔄 Resetting daily used stock values...");
    const { error } = await supabase
      .from("restaurant_stocks")
      .update({ used_today: 0 })
      .neq("id", 0); // ✅ ensures Supabase allows update for all rows

    if (error) throw error;
    console.log("✅ All used_today values reset to 0 successfully");
  } catch (err) {
    console.error("❌ Error resetting used_today:", err.message);
  }
});




// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
