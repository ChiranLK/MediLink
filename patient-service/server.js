require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log(`MongoDB Connected: ${mongoose.connection.host}`);
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error.message);
  process.exit(1);
});

// Start the server
app.listen(PORT, () => {
  console.log('\n======================================');
  console.log(' Patient Service running on port ' + PORT);
  console.log('======================================');
  console.log(`Port          : ${PORT}`);
  console.log(`Environment   : ${process.env.NODE_ENV || 'development'}`);
  console.log(`Base URL      : http://localhost:${PORT}/api/patients`);
  console.log(`Health Check  : http://localhost:${PORT}/health`);
  console.log('======================================\n');
});