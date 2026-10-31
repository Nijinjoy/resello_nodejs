import dotenv from "dotenv";
import app from "./app";
import { pool } from "./config/database";

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

const startServer = async () => {
  try {
    await pool.query("SELECT NOW()");

    console.log("Database connection verified");

    app.listen(PORT, () => {
      console.log(`Resello server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();