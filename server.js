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
<<<<<<< HEAD
      timeSpent INTEGER DEFAULT 300,
      date TEXT
    )`, () => {
      // Pastikan kolom timeSpent ada jika tabel lama sudah pernah dibuat
      db.run(`ALTER TABLE leaderboard ADD COLUMN timeSpent INTEGER DEFAULT 300`, () => {});
    });
  }
});

// GET: Ambil Top 10 Leaderboard (Poin tertinggi, lalu waktu tercepat)
app.get('/api/leaderboard', (req, res) => {
  db.all('SELECT * FROM leaderboard ORDER BY score DESC, COALESCE(timeSpent, 300) ASC, id ASC LIMIT 10', [], (err, rows) => {
=======
      date TEXT
    )`);
  }
});

// GET: Ambil Top 10 Leaderboard
app.get('/api/leaderboard', (req, res) => {
  db.all('SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10', [], (err, rows) => {
>>>>>>> 6aa0231601f9ef2ec46a251fa68d4f864444715b
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST: Simpan atau Update Skor
app.post('/api/leaderboard', (req, res) => {
<<<<<<< HEAD
  const { name, score, timeSpent, date } = req.body;
=======
  const { name, score, date } = req.body;
>>>>>>> 6aa0231601f9ef2ec46a251fa68d4f864444715b
  if (!name || score == null) {
    res.status(400).json({ error: 'Nama dan skor wajib diisi!' });
    return;
  }
<<<<<<< HEAD
  const safeTime = timeSpent != null ? Number(timeSpent) : 300;

  // Cek apakah pemain sudah ada
  db.get('SELECT score, timeSpent FROM leaderboard WHERE name = ?', [name], (err, row) => {
=======

  // Cek apakah pemain sudah ada
  db.get('SELECT score FROM leaderboard WHERE name = ?', [name], (err, row) => {
>>>>>>> 6aa0231601f9ef2ec46a251fa68d4f864444715b
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (row) {
<<<<<<< HEAD
      const prevTime = row.timeSpent != null ? row.timeSpent : 300;
      const isBetterScore = score > row.score;
      const isBetterTime = score === row.score && safeTime < prevTime;

      // Update jika skor lebih tinggi atau skor sama namun waktu lebih cepat
      if (isBetterScore || isBetterTime) {
        db.run('UPDATE leaderboard SET score = ?, timeSpent = ?, date = ? WHERE name = ?', [score, safeTime, date, name], function(err) {
          if (err) res.status(500).json({ error: err.message });
          else res.json({ success: true, message: 'Skor/waktu diperbarui!' });
        });
      } else {
        res.json({ success: true, message: 'Rekor sebelumnya lebih baik atau sama, tidak diperbarui.' });
      }
    } else {
      // Masukkan pemain baru
      db.run('INSERT INTO leaderboard (name, score, timeSpent, date) VALUES (?, ?, ?, ?)', [name, score, safeTime, date], function(err) {
=======
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
>>>>>>> 6aa0231601f9ef2ec46a251fa68d4f864444715b
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true, id: this.lastID });
      });
    }
  });
});

// DELETE: Reset Leaderboard (Hidden Admin API)
app.delete('/api/leaderboard', (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== 'peress2026') { // Password rahasia untuk admin
    res.status(403).json({ error: 'Akses ditolak!' });
    return;
  }

  db.run('DELETE FROM leaderboard', function(err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ success: true, message: 'Semua skor berhasil dihapus!' });
  });
});

// Serve Frontend React (folder dist) dengan Caching Agresif
app.use(express.static(join(__dirname, 'dist'), {
  setHeaders: (res, path) => {
    // Cache file assets (JS/CSS/Image) selama 1 tahun penuh!
    if (path.includes('/assets/') || path.endsWith('.jpg') || path.endsWith('.png')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else {
      // index.html tidak boleh di-cache agar selalu mendapat versi terbaru
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));
app.use((req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ Backend & Frontend berjalan di http://localhost:${port}`);
});
