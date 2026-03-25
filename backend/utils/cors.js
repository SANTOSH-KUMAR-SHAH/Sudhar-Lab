const isProd = process.env.NODE_ENV === "production";

const corsOptions = {
  origin: isProd
    ? ["https://localhelpfrontendv2.vercel.app", "https://localhelp-app.vercel.app"]
    : ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
module.exports = corsOptions;
