const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const { getEnv } = require("./config/env");
const { initDb } = require("./db/initDb");
const { authRouter } = require("./features/auth/auth.routes");
const { kidsRouter } = require("./features/kids/kids.routes");
const { tasksRouter } = require("./features/tasks/tasks.routes");
const { errorHandler } = require("./middleware/errorHandler");

const env = getEnv();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/docs", express.static(path.join(__dirname, "..", "public")));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy"
  });
});

app.use("/api/auth", authRouter);
app.use("/api/kids", kidsRouter);
app.use("/api/tasks", tasksRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use(errorHandler);

async function startServer() {
  await initDb();

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${env.PORT}`);
  });
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});
