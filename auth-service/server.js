import dotenv from "dotenv";
import path from "path";
import app from "./app.js";
import connectDB from "./config/config.js";

// Get the directory of the current file
const __dirname = new URL(".", import.meta.url).pathname;

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start server
app.listen(PORT, () => {
  console.log("\n======================================");
  console.log(" Auth Service running on port " + PORT);
  console.log("======================================\n");
  console.log(`MongoDB Connection: ${process.env.MONGO_URI.split("@")[1]}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
