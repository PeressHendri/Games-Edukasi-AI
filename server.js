import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Izinkan akses dari frontend (CORS)
app.use(cors());
app.use(express.json());

// Inisialisasi Database SQLite
const dbPath = join(__dirname, 'leaderboard.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Gagal membuka database SQLite', err.message);
  } else {
    console.log('Berhasil terhubung ke database SQLite.');
    db.run(`CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      score INTEGER,
      date TEXT
    )`);
  }
});

// GET: Ambil Top 10 Leaderboard
app.get('/api/leaderboard', (req, res) => {
  db.all('SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST: Simpan atau Update Skor
app.post('/api/leaderboard', (req, res) => {
  const { name, score, date } = req.body;
  if (!name || score == null) {
    res.status(400).json({ error: 'Nama dan skor wajib diisi!' });
    return;
  }

  // Cek apakah pemain sudah ada
  db.get('SELECT score FROM leaderboard WHERE name = ?', [name], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (row) {
      // Hanya update jika skor baru lebih tinggi
      if (score > row.score) {
        db.run('UPDATE leaderboard SET score = ?, date = ? WHERE name = ?', [score, date, name], function(err) {
          if (err) res.status(500).json({ error: err.message });
          else res.json({ success: true, message: 'Skor diperbarui!' });
        });
      } else {
        res.json({ success: true, message: 'Skor sebelumnya lebih tinggi, tidak diperbarui.' });
      }
    } else {
      // Masukkan pemain baru
      db.run('INSERT INTO leaderboard (name, score, date) VALUES (?, ?, ?)', [name, score, date], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true, id: this.lastID });
      });
    }
  });
});

// Serve Frontend React (folder dist)
app.use(express.static(join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ Backend & Frontend berjalan di http://localhost:${port}`);
});
