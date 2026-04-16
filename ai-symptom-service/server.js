import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import app from "./app.js";

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log('\n======================================');
  console.log(' AI Symptom Service running on port ' + PORT);
  console.log('======================================');
  console.log(`Port          : ${PORT}`);
  console.log(`Environment   : ${process.env.NODE_ENV || 'development'}`);
  console.log(`Base URL      : http://localhost:${PORT}/api/ai-symptoms`);
  console.log(`Health Check  : http://localhost:${PORT}/health`);
  console.log('======================================\n');
});