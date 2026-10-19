import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// cPanel CloudLinux Passenger automatically provides PORT via process.env.PORT
const PORT = process.env.PORT || 3000;

// Serve static production build files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback all routes to index.html for Single Page Application (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GPS Timestamp Camera server running on port ${PORT}`);
});
