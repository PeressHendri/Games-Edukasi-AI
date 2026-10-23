import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const dbPath = join(__dirname, 'leaderboard.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Gagal membuka database SQLite:', err.message);
  } else {
    console.log('Berhasil terhubung ke database SQLite terpusat.');
    initDatabase();
  }
});

function initDatabase() {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS leaderboard (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        rawName TEXT DEFAULT '',
        kelas TEXT DEFAULT '',
        school TEXT DEFAULT '',
        score INTEGER DEFAULT 0,
        timeSpent INTEGER DEFAULT 300,
        date TEXT,
        createdAt TEXT DEFAULT '',
        kloter INTEGER DEFAULT 1,
        isArchived INTEGER DEFAULT 0,
        archivedAt TEXT DEFAULT ''
      )`,
      () => {
        // Tambahkan kolom-kolom baru jika tabel dibuat dari versi lama
        db.run(`ALTER TABLE leaderboard ADD COLUMN timeSpent INTEGER DEFAULT 300`, () => {});
        db.run(`ALTER TABLE leaderboard ADD COLUMN rawName TEXT DEFAULT ''`, () => {});
        db.run(`ALTER TABLE leaderboard ADD COLUMN kelas TEXT DEFAULT ''`, () => {});
        db.run(`ALTER TABLE leaderboard ADD COLUMN school TEXT DEFAULT ''`, () => {});
        db.run(`ALTER TABLE leaderboard ADD COLUMN createdAt TEXT DEFAULT ''`, () => {});
        db.run(`ALTER TABLE leaderboard ADD COLUMN kloter INTEGER DEFAULT 1`, () => {});
        db.run(`ALTER TABLE leaderboard ADD COLUMN isArchived INTEGER DEFAULT 0`, () => {});
        db.run(`ALTER TABLE leaderboard ADD COLUMN archivedAt TEXT DEFAULT ''`, () => {});

        // Cek apakah tabel lama masih punya constraint UNIQUE pada kolom name
        // Jika ada, migrasikan agar nama yang sama bisa bermain di kloter berbeda setelah direset
        db.get(
          `SELECT sql FROM sqlite_master WHERE type='table' AND name='leaderboard'`,
          [],
          (err, row) => {
            if (!err && row && row.sql && /name\s+TEXT\s+UNIQUE/i.test(row.sql)) {
              console.log('Memigrasikan skema tabel leaderboard untuk mendukung multi-kloter...');
              db.serialize(() => {
                db.run(`CREATE TABLE IF NOT EXISTS leaderboard_new (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT,
                  rawName TEXT DEFAULT '',
                  kelas TEXT DEFAULT '',
                  school TEXT DEFAULT '',
                  score INTEGER DEFAULT 0,
                  timeSpent INTEGER DEFAULT 300,
                  date TEXT,
                  createdAt TEXT DEFAULT '',
                  kloter INTEGER DEFAULT 1,
                  isArchived INTEGER DEFAULT 0,
                  archivedAt TEXT DEFAULT ''
                )`);
                db.run(`INSERT INTO leaderboard_new (id, name, rawName, kelas, school, score, timeSpent, date, createdAt, kloter, isArchived, archivedAt)
                        SELECT id, name, COALESCE(rawName, ''), COALESCE(kelas, ''), COALESCE(school, ''), COALESCE(score, 0), COALESCE(timeSpent, 300), date, COALESCE(createdAt, ''), COALESCE(kloter, 1), COALESCE(isArchived, 0), COALESCE(archivedAt, '')
                        FROM leaderboard`);
                db.run(`DROP TABLE leaderboard`);
                db.run(`ALTER TABLE leaderboard_new RENAME TO leaderboard`);
              });
            }
          }
        );
      }
    );
  });
}

// Helper mendapatkan nomor kloter aktif saat ini
function getActiveKloterNumber(callback) {
  db.get(
    `SELECT COALESCE(MAX(CASE WHEN COALESCE(isArchived, 0) = 1 THEN COALESCE(kloter, 1) ELSE 0 END), 0) AS maxArchived FROM leaderboard`,
    [],
    (err, row) => {
      if (err) {
        callback(1);
        return;
      }
      const nextKloter = (row?.maxArchived || 0) + 1;
      callback(nextKloter);
    }
  );
}

const fmtTime = (s) => {
  const secTotal = s != null ? Number(s) : 300;
  const min = Math.floor(secTotal / 60);
  const sec = String(secTotal % 60).padStart(2, '0');
  return `${min}:${sec}`;
};

// GET: Ambil Top 10 Leaderboard AKTIF (Hanya kloter yang sedang berjalan / belum di-reset)
app.get('/api/leaderboard', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  db.all(
    `SELECT * FROM leaderboard 
     WHERE COALESCE(isArchived, 0) = 0 
     ORDER BY score DESC, COALESCE(timeSpent, 300) ASC, id ASC 
     LIMIT 10`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows || []);
    }
  );
});

// GET: Ambil SEMUA Data Pemain (Baik Kloter Aktif maupun Semua Kloter yang Sudah Direset/Diarsipkan)
app.get('/api/players', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  db.all(
    `SELECT * FROM leaderboard 
     ORDER BY COALESCE(kloter, 1) DESC, score DESC, COALESCE(timeSpent, 300) ASC, id ASC`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows || []);
    }
  );
});

// GET: Export / Download Rekap Data Pemain ke CSV (Bisa filter per ?kloter=1, ?kloter=active, atau semua)
app.get('/api/players/export', (req, res) => {
  const kloterParam = req.query.kloter;
  let query = `SELECT * FROM leaderboard`;
  const params = [];

  if (kloterParam === 'active') {
    query += ` WHERE COALESCE(isArchived, 0) = 0`;
  } else if (kloterParam && !isNaN(Number(kloterParam))) {
    query += ` WHERE COALESCE(kloter, 1) = ?`;
    params.push(Number(kloterParam));
  }

  query += ` ORDER BY COALESCE(kloter, 1) ASC, score DESC, COALESCE(timeSpent, 300) ASC, id ASC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const list = rows || [];
    const escapeCsv = (val) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      'No',
      'Kloter',
      'Status Kloter',
      'Nama',
      'Kelas',
      'Asal Sekolah',
      'Format Lengkap',
      'Skor Akhir',
      'Waktu Bermain (Detik)',
      'Waktu Bermain (Menit:Detik)',
      'Tanggal',
    ];

    const csvRows = [headers.join(',')];
    list.forEach((r, idx) => {
      let parsedName = r.rawName || '';
      let parsedKelas = r.kelas || '';
      let parsedSchool = r.school || '';
      if (!parsedName && r.name) {
        const [leftPart, rightPart] = String(r.name).split('/').map((s) => s.trim());
        if (rightPart) parsedSchool = rightPart;
        if (leftPart && leftPart.includes('-')) {
          const dashParts = leftPart.split('-').map((s) => s.trim());
          parsedName = dashParts[0] || r.name;
          parsedKelas = dashParts.slice(1).join(' - ') || '-';
        } else {
          parsedName = leftPart || r.name;
        }
      }

      const kloterNum = r.kloter || 1;
      const statusText = r.isArchived ? `Arsip Kloter ${kloterNum}` : `Kloter ${kloterNum} (Aktif)`;

      csvRows.push(
        [
          idx + 1,
          `Kloter ${kloterNum}`,
          escapeCsv(statusText),
          escapeCsv(parsedName || r.name),
          escapeCsv(parsedKelas || '-'),
          escapeCsv(parsedSchool || '-'),
          escapeCsv(r.name),
          r.score ?? 0,
          r.timeSpent ?? 300,
          escapeCsv(fmtTime(r.timeSpent)),
          escapeCsv(r.date || '-'),
        ].join(',')
      );
    });

    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Rekap-Data-Pemain-FIKOM-UKWMS${kloterParam ? '-Kloter-' + kloterParam : ''}.csv"`
    );
    res.send(csvContent);
  });
});

// POST: Simpan atau Update Skor Pemain pada Kloter Aktif
app.post('/api/leaderboard', (req, res) => {
  const { name, rawName = '', kelas = '', school = '', score, timeSpent, date } = req.body;
  if (!name || score == null) {
    res.status(400).json({ error: 'Data pemain dan skor wajib diisi!' });
    return;
  }

  const cleanName = String(name).trim();
  const cleanRawName = String(rawName || '').trim();
  const cleanKelas = String(kelas || '').trim();
  const cleanSchool = String(school || '').trim();
  const safeScore = Number(score) || 0;
  const safeTime = timeSpent != null ? Number(timeSpent) : 300;
  const safeDate = date || new Date().toLocaleDateString('id-ID');
  const nowIso = new Date().toISOString();

  getActiveKloterNumber((activeKloter) => {
    // Cek apakah pemain sudah ada di KLOTER AKTIF saat ini (isArchived = 0)
    db.get(
      `SELECT id, name, score, timeSpent FROM leaderboard 
       WHERE LOWER(name) = LOWER(?) AND COALESCE(isArchived, 0) = 0`,
      [cleanName],
      (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        if (row) {
          const prevTime = row.timeSpent != null ? row.timeSpent : 300;
          const isBetterScore = safeScore > row.score;
          const isBetterTime = safeScore === row.score && safeTime < prevTime;

          if (isBetterScore || isBetterTime) {
            db.run(
              `UPDATE leaderboard 
               SET name = ?, rawName = ?, kelas = ?, school = ?, score = ?, timeSpent = ?, date = ?, createdAt = ?, kloter = ?
               WHERE id = ?`,
              [cleanName, cleanRawName, cleanKelas, cleanSchool, safeScore, safeTime, safeDate, nowIso, activeKloter, row.id],
              function (updateErr) {
                if (updateErr) res.status(500).json({ error: updateErr.message });
                else res.json({ success: true, updated: true, kloter: activeKloter });
              }
            );
          } else {
            db.run(
              `UPDATE leaderboard 
               SET rawName = COALESCE(NULLIF(?, ''), rawName), 
                   kelas = COALESCE(NULLIF(?, ''), kelas), 
                   school = COALESCE(NULLIF(?, ''), school),
                   kloter = ?
               WHERE id = ?`,
              [cleanRawName, cleanKelas, cleanSchool, activeKloter, row.id],
              () => {
                res.json({ success: true, updated: false, kloter: activeKloter });
              }
            );
          }
        } else {
          db.run(
            `INSERT INTO leaderboard (name, rawName, kelas, school, score, timeSpent, date, createdAt, kloter, isArchived)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [cleanName, cleanRawName, cleanKelas, cleanSchool, safeScore, safeTime, safeDate, nowIso, activeKloter],
            function (insertErr) {
              if (insertErr) res.status(500).json({ error: insertErr.message });
              else res.json({ success: true, id: this.lastID, kloter: activeKloter });
            }
          );
        }
      }
    );
  });
});

// DELETE: Reset Leaderboard Aktif & Simpan ke Arsip Kloter (atau Hapus Permanen jika ?permanent=true)
app.delete('/api/leaderboard', (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== 'peress2026') {
    res.status(403).json({ error: 'Akses ditolak!' });
    return;
  }

  const isPermanent = req.query.permanent === 'true';
  const targetKloter = req.query.kloter ? Number(req.query.kloter) : null;

  // Jika admin memilih menghapus permanen arsip tertentu atau semua
  if (isPermanent) {
    if (targetKloter) {
      db.run(`DELETE FROM leaderboard WHERE COALESCE(kloter, 1) = ?`, [targetKloter], function (err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true, message: `Data Kloter ${targetKloter} dihapus permanen.` });
      });
    } else {
      db.run('DELETE FROM leaderboard', function (err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true, message: 'Semua riwayat kloter dihapus permanen!' });
      });
    }
    return;
  }

  // Default: Arsipkan data aktif saat ini menjadi Kloter N agar tidak hilang dan tetap bisa didownload Excel-nya!
  getActiveKloterNumber((activeKloter) => {
    db.get(
      `SELECT COUNT(*) AS cnt FROM leaderboard WHERE COALESCE(isArchived, 0) = 0`,
      [],
      (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        const activeCount = row?.cnt || 0;
        if (activeCount === 0) {
          res.json({
            success: true,
            archivedKloter: null,
            archivedCount: 0,
            message: 'Leaderboard aktif saat ini sudah kosong.',
          });
          return;
        }

        const nowStr = new Date().toLocaleString('id-ID');
        db.run(
          `UPDATE leaderboard 
           SET isArchived = 1, kloter = ?, archivedAt = ? 
           WHERE COALESCE(isArchived, 0) = 0`,
          [activeKloter, nowStr],
          function (updateErr) {
            if (updateErr) {
              res.status(500).json({ error: updateErr.message });
              return;
            }
            res.json({
              success: true,
              archivedKloter: activeKloter,
              archivedCount: activeCount,
              nextKloter: activeKloter + 1,
              message: `Berhasil! ${activeCount} data pemain telah disimpan ke Arsip Kloter ${activeKloter}, dan Leaderboard siap untuk Kloter ${activeKloter + 1}.`,
            });
          }
        );
      }
    );
  });
});

// Serve Frontend React (folder dist)
app.use(
  express.static(join(__dirname, 'dist'), {
    setHeaders: (res, path) => {
      if (path.includes('/assets/') || path.endsWith('.jpg') || path.endsWith('.png')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      } else {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

app.use((req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ Backend & Frontend FIKOM UKWMS berjalan di http://localhost:${port}`);
});
