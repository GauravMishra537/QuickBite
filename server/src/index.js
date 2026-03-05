// QuickBite Server - Entry Point
// This file will be expanded in Commit 2 with Express setup and MongoDB connection

const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'QuickBite API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 QuickBite server running on port ${PORT}`);
});
