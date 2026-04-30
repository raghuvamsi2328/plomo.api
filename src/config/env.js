const { z } = require("zod");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DB_HOST: z.string().default("db"),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().default("plomo"),
  DB_USER: z.string().default("postgres"),
  DB_PASSWORD: z.string().default("postgres"),
  JWT_SECRET: z.string().min(10).default("change-this-secret"),
  JWT_EXPIRES_IN: z.string().default("7d")
});

function getEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment variables: ${message}`);
  }

  return parsed.data;
}

module.exports = {
  getEnv
};
