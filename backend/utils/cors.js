const isProd = process.env.NODE_ENV === "production";

const corsOptions = {
  origin: isProd
    ? "https://localhelpfrontendv2.vercel.app"
    : "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

module.exports = corsOptions;
