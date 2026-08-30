const isProd = process.env.NODE_ENV === "production";

const corsOptions = {
  origin: isProd
    ? ["https://localhelpfrontendv2.vercel.app", "https://localhelp-app.vercel.app"]
    : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:5073", "http://localhost:5173", "http://localhost:4040", "http://localhost:5000", "http://localhost:5050"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
module.exports = corsOptions;
