import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST — before any other imports that may use them
const envPath = path.join(__dirname, '.env');
console.log(`[server] Loading .env from: ${envPath}`);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error(`[server] Error loading .env: ${result.error.message}`);
} else {
  console.log(`[server] Loaded ${Object.keys(result.parsed || {}).length} env variables`);
}

// Now use dynamic imports to ensure dotenv is loaded first
const { default: app } = await import('./app.js');
const { default: connectDB } = await import('./config/config.js');

const PORT = process.env.PORT || 3005;

const startServer = async () => {
  try {
    // Connect to the payment-service database on the shared Atlas cluster
    await connectDB();

    // Only start listening after a successful DB connection
    app.listen(PORT, () => {
      console.log("\n======================================");
      console.log(` Payment Service running on port ${PORT}`);
      console.log("======================================");
      console.log(`Environment : ${process.env.NODE_ENV}`);
      console.log(`Stripe Mode  : ${process.env.NODE_ENV === 'production' ? 'Live' : 'Test'}`);
      console.log(`Base URL     : http://localhost:${PORT}/api/payments`);
      console.log(`Health check : http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start Payment Service:', error.message);
    process.exit(1);
  }
};

startServer();
