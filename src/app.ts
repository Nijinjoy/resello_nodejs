import express from "express";
import cors from "cors";
import { UPLOADS_DIR } from "./config/uploads";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  })
);

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Resello backend is running",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

export default app;