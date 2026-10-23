import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'qrcode'
import useGameStore from '../store/gameStore'
import { FikomLogo, LOGO_SRC } from './BrandBadge'

const fmtTime = (s) => {
  if (s == null) return '-'
  const secTotal = Number(s) || 0
  const min = Math.floor(secTotal / 60)
  const sec = String(secTotal % 60).padStart(2, '0')
  return `${min}:${sec}`
}

const parsePlayerFields = (r) => {
  let parsedName = r.rawName || ''
  let parsedKelas = r.kelas || ''
  let parsedSchool = r.school || ''

  if ((!parsedName || !parsedSchool) && r.name) {
    const [leftPart, rightPart] = String(r.name)
      .split('/')
      .map((s) => s.trim())
    if (rightPart && !parsedSchool) parsedSchool = rightPart
    if (leftPart && leftPart.includes('-')) {
      const dashParts = leftPart.split('-').map((s) => s.trim())
      if (!parsedName) parsedName = dashParts[0] || r.name
      if (!parsedKelas) parsedKelas = dashParts.slice(1).join(' - ') || '-'
    } else if (!parsedName) {
      parsedName = leftPart || r.name
    }
  }

  return {
    rawName: parsedName || r.name || '-',
    kelas: parsedKelas || '-',
    school: parsedSchool || '-',
    fullName: r.name || `${parsedName} - ${parsedKelas} / ${parsedSchool}`,
    kloter: Number(r.kloter) || 1,
    isArchived: Boolean(r.isArchived),
  }
}

export default function PlayerRecapModal({ isOpen, onClose, initialTab = 'rekap' }) {
  const {
    allPlayers,
    leaderboard,
    loadLeaderboard,
    archiveLeaderboardLocal,
    clearLeaderboard,
    isOnlineSync,
    gsheetUrl,
    setGsheetUrl,
  } = useGameStore()

  const [tab, setTab] = useState(initialTab)
  const [selectedKloterFilter, setSelectedKloterFilter] = useState('active') // 'active' | 'all' | number (1, 2, ...)
  const [search, setSearch] = useState('')
  const [showGsheetConfig, setShowGsheetConfig] = useState(false)
  const [tempGsheetUrl, setTempGsheetUrl] = useState(gsheetUrl || '')

  // QR Code state
  const defaultGameUrl =
    typeof window !== 'undefined' && !window.location.origin.includes('localhost')
      ? window.location.origin
      : 'https://gamess.portofolio.dev/'
  const [qrUrl, setQrUrl] = useState(defaultGameUrl)
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab)
      loadLeaderboard()
    }
  }, [isOpen, initialTab])

  useEffect(() => {
    if (!qrUrl) return
    QRCode.toDataURL(qrUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: '#7F1D1D',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Gagal membuat QR Code:', err))
  }, [qrUrl])

  const playersList = useMemo(
    () => (allPlayers && allPlayers.length > 0 ? allPlayers : leaderboard),
    [allPlayers, leaderboard]
  )

  // Hitung daftar kloter yang ada (Aktif & Riwayat Arsip Kloter 1, 2, dst.)
  const { activePlayers, archivedKloterNumbers, currentKloterNum } = useMemo(() => {
    const active = playersList.filter((p) => !p.isArchived)
    const archivedNums = [
      ...new Set(
        playersList
          .filter((p) => p.isArchived)
          .map((p) => Number(p.kloter) || 1)
      ),
    ].sort((a, b) => a - b)
    const maxArchived = archivedNums.length > 0 ? Math.max(...archivedNums) : 0
    return {
      activePlayers: active,
      archivedKloterNumbers: archivedNums,
      currentKloterNum: maxArchived + 1,
    }
  }, [playersList])

  if (!isOpen) return null

  // Filter berdasarkan Kloter yang dipilih (Aktif, Kloter 1, Kloter 2, atau Semua Kloter)
  const kloterFilteredList = playersList.filter((p) => {
    if (selectedKloterFilter === 'all') return true
    if (selectedKloterFilter === 'active') return !p.isArchived
    return Boolean(p.isArchived) && (Number(p.kloter) || 1) === Number(selectedKloterFilter)
  })

  // Filter berdasarkan kata kunci pencarian
  const filteredPlayers = kloterFilteredList.filter((p) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    const { rawName, kelas, school, fullName } = parsePlayerFields(p)
    return (
      fullName.toLowerCase().includes(q) ||
      rawName.toLowerCase().includes(q) ||
      kelas.toLowerCase().includes(q) ||
      school.toLowerCase().includes(q)
    )
  })

  const getFilterLabel = (filterVal = selectedKloterFilter) => {
    if (filterVal === 'all') return 'Semua-Kloter'
    if (filterVal === 'active') return `Kloter-${currentKloterNum}-Aktif`
    return `Kloter-${filterVal}`
  }

  // Download CSV (Bisa untuk Kloter terpilih atau Kloter spesifik)
  const handleDownloadCSV = (targetList = kloterFilteredList, label = getFilterLabel()) => {
    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`
    const headers = [
      'Peringkat',
      'Kloter',
      'Nama',
      'Kelas',
      'Asal Sekolah',
      'Format Identitas (Nama - Kelas / Sekolah)',
      'Skor Akhir',
      'Waktu Bermain (Detik)',
      'Waktu Bermain (Menit:Detik)',
      'Tanggal',
    ]

    const rows = [headers.join(',')]
    targetList.forEach((p, idx) => {
      const { rawName, kelas, school, fullName, kloter, isArchived } = parsePlayerFields(p)
      const kloterText = isArchived ? `Kloter ${kloter} (Arsip)` : `Kloter ${currentKloterNum} (Aktif)`
      rows.push(
        [
          idx + 1,
          escapeCsv(kloterText),
          escapeCsv(rawName),
          escapeCsv(kelas),
          escapeCsv(school),
          escapeCsv(fullName),
          p.score ?? 0,
          p.timeSpent ?? 300,
          escapeCsv(fmtTime(p.timeSpent)),
          escapeCsv(p.date || '-'),
        ].join(',')
      )
    })

    const csvContent = '\uFEFF' + rows.join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Rekap-Pemain-FIKOM-UKWMS-${label}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Download Excel (.xls) untuk Kloter terpilih atau Kloter spesifik
  const handleDownloadExcel = (targetList = kloterFilteredList, label = getFilterLabel()) => {
    const escapeHtml = (s) =>
      String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

    const tableRows = targetList
      .map((p, idx) => {
        const { rawName, kelas, school, fullName, kloter, isArchived } = parsePlayerFields(p)
        const bg = idx % 2 === 0 ? '#FFFFFF' : '#FEF2F2'
        const kloterText = isArchived ? `Kloter ${kloter}` : `Kloter ${currentKloterNum} (Aktif)`
        return `
          <tr style="background:${bg};">
            <td style="text-align:center;font-weight:bold;border:1px solid #E5E7EB;padding:6px;">${idx + 1}</td>
            <td style="text-align:center;font-weight:bold;border:1px solid #E5E7EB;padding:6px;color:#7F1D1D;">${escapeHtml(kloterText)}</td>
            <td style="border:1px solid #E5E7EB;padding:6px;font-weight:bold;">${escapeHtml(rawName)}</td>
            <td style="text-align:center;border:1px solid #E5E7EB;padding:6px;">${escapeHtml(kelas)}</td>
            <td style="border:1px solid #E5E7EB;padding:6px;">${escapeHtml(school)}</td>
            <td style="border:1px solid #E5E7EB;padding:6px;color:#4B5563;">${escapeHtml(fullName)}</td>
            <td style="text-align:center;font-weight:bold;color:#990000;border:1px solid #E5E7EB;padding:6px;">${p.score ?? 0}</td>
            <td style="text-align:center;border:1px solid #E5E7EB;padding:6px;">${escapeHtml(fmtTime(p.timeSpent))}</td>
            <td style="text-align:center;border:1px solid #E5E7EB;padding:6px;">${p.timeSpent ?? 300}</td>
            <td style="text-align:center;border:1px solid #E5E7EB;padding:6px;">${escapeHtml(p.date || '-')}</td>
          </tr>
        `
      })
      .join('')

    const htmlExcel = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${escapeHtml(label.slice(0, 30))}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      </head>
      <body>
        <table border="1" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:11pt;">
          <thead>
            <tr>
              <th colspan="10" style="background:#7F1D1D;color:#FFFFFF;font-size:14pt;padding:12px;text-align:center;">
                REKAPITULASI DATA PEMAIN GAME LITERASI DIGITAL AI — FIKOM UKWMS (${escapeHtml(label.replace(/-/g, ' ').toUpperCase())})
              </th>
            </tr>
            <tr style="background:#990000;color:#FFFFFF;font-weight:bold;">
              <th style="padding:8px;border:1px solid #7F1D1D;">Peringkat</th>
              <th style="padding:8px;border:1px solid #7F1D1D;">Kloter</th>
              <th style="padding:8px;border:1px solid #7F1D1D;">Nama Siswa</th>
              <th style="padding:8px;border:1px solid #7F1D1D;">Kelas</th>
              <th style="padding:8px;border:1px solid #7F1D1D;">Asal Sekolah</th>
              <th style="padding:8px;border:1px solid #7F1D1D;">Format Lengkap (Nama - Kelas / Sekolah)</th>
              <th style="padding:8px;border:1px solid #7F1D1D;">Skor Akhir</th>
              <th style="padding:8px;border:1px solid #7F1D1D;">Waktu (Menit:Detik)</th>
              <th style="padding:8px;border:1px solid #7F1D1D;">Waktu (Detik)</th>
              <th style="padding:8px;border:1px solid #7F1D1D;">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `

    const blob = new Blob(['\uFEFF' + htmlExcel], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Rekap-Pemain-FIKOM-UKWMS-${label}-${new Date().toISOString().slice(0, 10)}.xls`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Download Poster QR Code PNG
  const handleDownloadQrPoster = async () => {
    if (!qrDataUrl) return
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1350
    const ctx = canvas.getContext('2d')

    const grad = ctx.createLinearGradient(0, 0, 1080, 1350)
    grad.addColorStop(0, '#450A0A')
    grad.addColorStop(0.5, '#7F1D1D')
    grad.addColorStop(1, '#990000')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 1080, 1350)

    ctx.fillStyle = 'rgba(251, 191, 36, 0.12)'
    ctx.beginPath()
    ctx.arc(150, 150, 280, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(950, 1200, 320, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.roundRect(90, 110, 900, 1130, 48)
    ctx.fill()

    ctx.fillStyle = '#F59E0B'
    ctx.beginPath()
    ctx.roundRect(380, 145, 320, 10, 5)
    ctx.fill()

    const loadImg = (src) =>
      new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
        img.src = src
      })

    const logoImg = await loadImg(LOGO_SRC)
    if (logoImg) {
      ctx.drawImage(logoImg, 430, 175, 220, 140)
    }

    ctx.fillStyle = '#7F1D1D'
    ctx.font = 'bold 42px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('FAKULTAS ILMU KOMUNIKASI', 540, 360)

    ctx.fillStyle = '#B91C1C'
    ctx.font = 'bold 26px sans-serif'
    ctx.fillText('UNIVERSITAS KATOLIK WIDYA MANDALA SURABAYA', 540, 402)

    ctx.fillStyle = '#FEF2F2'
    ctx.strokeStyle = '#FECACA'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(170, 435, 740, 95, 24)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#990000'
    ctx.font = 'italic 900 38px sans-serif'
    ctx.fillText('GAME LITERASI DIGITAL AI', 540, 495)

    const qrImg = await loadImg(qrDataUrl)
    if (qrImg) {
      ctx.strokeStyle = '#990000'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.roundRect(280, 565, 520, 520, 32)
      ctx.stroke()
      ctx.drawImage(qrImg, 295, 580, 490, 490)
    }

    ctx.fillStyle = '#1F2937'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText('📱 SCAN QR CODE UNTUK BERMAIN DI HP!', 540, 1140)

    ctx.fillStyle = '#6B7280'
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText(qrUrl, 540, 1185)

    const dataUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'Poster-QR-Code-Game-FIKOM-UKWMS.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Reset Leaderboard Aktif & Otomatis Simpan ke Arsip Kloter (Data Kloter 1, 2, dst TIDAK HILANG!)
  const handleResetAndArchiveKloter = async () => {
    if (activePlayers.length === 0) {
      alert(
        `ℹ️ Leaderboard Kloter ${currentKloterNum} saat ini sudah kosong (0 pemain).\nAnda tetap dapat mengunduh rekap Kloter sebelumnya pada tombol Arsip Kloter di bawah.`
      )
      return
    }

    if (
      !window.confirm(
        `🔄 RESET LEADERBOARD UNTUK KLOTER BERIKUTNYA?\n\n• Sebanyak ${activePlayers.length} data pemain saat ini akan OTOMATIS DISIMPAN ke dalam "Arsip Kloter ${currentKloterNum}" (tidak hilang & tetap bisa didownload Excel-nya kapan saja).\n• Tampilan Leaderboard utama akan dikosongkan untuk memulai Kloter ${currentKloterNum + 1}.`
      )
    ) {
      return
    }

    archiveLeaderboardLocal()
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'DELETE',
        headers: { 'x-admin-secret': 'peress2026' },
      })
      if (res.ok) {
        const data = await res.json()
        await loadLeaderboard()
        setSelectedKloterFilter(currentKloterNum)
        alert(
          `✅ ${data.message || `Data berhasil disimpan ke Arsip Kloter ${currentKloterNum} dan Leaderboard siap untuk Kloter ${currentKloterNum + 1}!`}`
        )
      } else {
        setSelectedKloterFilter(currentKloterNum)
        alert(`✅ Data berhasil disimpan ke Arsip Kloter ${currentKloterNum}!`)
      }
    } catch (e) {
      setSelectedKloterFilter(currentKloterNum)
      alert(`✅ Data lokal disimpan ke Arsip Kloter ${currentKloterNum}!`)
    }
  }

  // Opsional: Hapus permanen seluruh arsip jika acara sudah benar-benar selesai
  const handlePermanentDeleteAll = async () => {
    if (
      !window.confirm(
        '⚠️ PERINGATAN: Apakah Anda yakin ingin MENGHAPUS PERMANEN seluruh arsip semua Kloter? Pastikan semua file Excel sudah diunduh!'
      )
    ) {
      return
    }
    clearLeaderboard()
    try {
      await fetch('/api/leaderboard?permanent=true', {
        method: 'DELETE',
        headers: { 'x-admin-secret': 'peress2026' },
      })
      await loadLeaderboard()
      setSelectedKloterFilter('active')
      alert('🗑️ Seluruh riwayat arsip kloter telah dihapus permanen.')
    } catch {
      alert('🗑️ Data lokal telah dihapus permanen.')
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center px-3 sm:px-6 py-6 overflow-y-auto"
        style={{ background: 'rgba(15, 3, 3, 0.78)', backdropFilter: 'blur(10px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-5xl rounded-3xl overflow-hidden flex flex-col max-h-[92vh]"
          style={{
            background: '#FFFFFF',
            border: '2px solid rgba(153,0,0,0.25)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          }}
        >
          {/* Modal Header */}
          <div
            className="px-5 sm:px-6 py-4 flex items-center justify-between gap-3 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #7F1D1D, #990000, #B91C1C)',
              color: '#FFFFFF',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <FikomLogo size={38} dark asLink={false} />
              <div className="min-w-0">
                <h2 className="ws-title text-base sm:text-lg text-white truncate">
                  🎯 Panel Khusus Admin — Rekap Data Per Kloter & Reset Leaderboard
                </h2>
                <div className="flex items-center gap-2 text-xs text-red-100">
                  <span>FIKOM UKWMS</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-bold">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ background: isOnlineSync ? '#4ADE80' : '#FBBF24' }}
                    />
                    {isOnlineSync
                      ? 'Database Terpusat Aktif (Data Kloter Tersimpan Aman)'
                      : 'Mode Penyimpanan Lokal'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white bg-white/15 hover:bg-white/25 transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50 px-5 pt-2 gap-2 flex-shrink-0">
            <button
              onClick={() => setTab('rekap')}
              className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 ${
                tab === 'rekap'
                  ? 'bg-white text-red-800 border-red-700 shadow-sm'
                  : 'text-gray-600 border-transparent hover:text-red-700'
              }`}
            >
              📊 Rekap Data Excel Per Kloter ({playersList.length} Total Pemain)
            </button>
            <button
              onClick={() => setTab('qr')}
              className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 ${
                tab === 'qr'
                  ? 'bg-white text-red-800 border-red-700 shadow-sm'
                  : 'text-gray-600 border-transparent hover:text-red-700'
              }`}
            >
              📱 QR Code Akses Game (HP)
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1">
            {tab === 'rekap' ? (
              <div className="flex flex-col gap-4">
                {/* ── Pemilih Kloter (Kloter Aktif, Arsip Kloter 1, Kloter 2, dst., & Semua Kloter) ── */}
                <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-200/80 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-red-900">
                      🗂️ Pilih Kloter Rekap Data (Data yang sudah di-reset otomatis tersimpan per Kloter):
                    </span>
                    <span className="text-[0.7rem] font-bold text-red-700">
                      Menampilkan: {filteredPlayers.length} Pemain
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Tombol Kloter Aktif */}
                    <button
                      onClick={() => setSelectedKloterFilter('active')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 border ${
                        selectedKloterFilter === 'active'
                          ? 'bg-red-700 text-white border-red-800 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-red-400'
                      }`}
                    >
                      <span>🟢</span>
                      <span>
                        Kloter {currentKloterNum} (Sedang Berjalan: {activePlayers.length} Pemain)
                      </span>
                    </button>

                    {/* Tombol Riwayat Arsip Kloter 1, 2, dst. */}
                    {archivedKloterNumbers.map((kNum) => {
                      const kPlayers = playersList.filter(
                        (p) => p.isArchived && (Number(p.kloter) || 1) === kNum
                      )
                      const isSel = Number(selectedKloterFilter) === kNum
                      return (
                        <div key={kNum} className="inline-flex items-center rounded-xl overflow-hidden border border-amber-400 shadow-sm">
                          <button
                            onClick={() => setSelectedKloterFilter(kNum)}
                            className={`px-3 py-2 text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                              isSel
                                ? 'bg-amber-600 text-white'
                                : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                            }`}
                          >
                            <span>📦</span>
                            <span>
                              Kloter {kNum} ({kPlayers.length} Pemain)
                            </span>
                          </button>
                          <button
                            onClick={() =>
                              handleDownloadExcel(kPlayers, `Kloter-${kNum}`)
                            }
                            title={`Langsung Download Excel Kloter ${kNum}`}
                            className="px-2.5 py-2 text-xs font-black bg-green-700 hover:bg-green-800 text-white transition-colors"
                          >
                            📥 Excel
                          </button>
                        </div>
                      )
                    })}

                    {/* Tombol Gabungan Semua Kloter */}
                    {archivedKloterNumbers.length > 0 && (
                      <button
                        onClick={() => setSelectedKloterFilter('all')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 border ${
                          selectedKloterFilter === 'all'
                            ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <span>📚</span>
                        <span>Semua Kloter ({playersList.length} Pemain)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Bar: Search + Export Excel/CSV + Reset (Simpan Kloter) */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      🔍
                    </span>
                    <input
                      type="text"
                      placeholder="Cari nama siswa, kelas, atau asal sekolah..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleDownloadExcel(kloterFilteredList, getFilterLabel())}
                      disabled={kloterFilteredList.length === 0}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #15803D, #16A34A)' }}
                    >
                      <span>📥</span>
                      <span>
                        Download Excel{' '}
                        {selectedKloterFilter === 'all'
                          ? '(Semua Kloter)'
                          : selectedKloterFilter === 'active'
                          ? `(Kloter ${currentKloterNum})`
                          : `(Kloter ${selectedKloterFilter})`}
                      </span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleDownloadCSV(kloterFilteredList, getFilterLabel())}
                      disabled={kloterFilteredList.length === 0}
                      className="px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #0369A1, #0284C7)' }}
                    >
                      <span>📄</span>
                      <span>CSV</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleResetAndArchiveKloter}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #990000, #DC2626)' }}
                      title="Mengosongkan Leaderboard layar utama & menyimpan data saat ini ke Arsip Kloter agar tetap bisa didownload"
                    >
                      <span>🔄</span>
                      <span>Reset Leaderboard (Simpan Kloter {currentKloterNum})</span>
                    </motion.button>
                  </div>
                </div>

                {/* Data Table */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto max-h-[38vh]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr
                          className="text-xs uppercase font-extrabold sticky top-0 z-10"
                          style={{
                            background: '#FEF2F2',
                            color: '#7F1D1D',
                            borderBottom: '2px solid #FECACA',
                          }}
                        >
                          <th className="py-3 px-3 text-center w-12">No</th>
                          <th className="py-3 px-3 text-center">Kloter</th>
                          <th className="py-3 px-3">Nama</th>
                          <th className="py-3 px-3 text-center">Kelas</th>
                          <th className="py-3 px-3">Asal Sekolah</th>
                          <th className="py-3 px-3">Format Lengkap</th>
                          <th className="py-3 px-3 text-right">Skor</th>
                          <th className="py-3 px-3 text-center">Waktu</th>
                          <th className="py-3 px-3 text-center">Tanggal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                        {filteredPlayers.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-gray-400 font-medium">
                              Belum ada data pemain pada pilihan Kloter ini.
                            </td>
                          </tr>
                        ) : (
                          filteredPlayers.map((p, idx) => {
                            const { rawName, kelas, school, fullName, kloter, isArchived } =
                              parsePlayerFields(p)
                            return (
                              <tr key={p.id || idx} className="hover:bg-red-50/40 transition-colors">
                                <td className="py-2.5 px-3 text-center font-black text-gray-500">
                                  #{idx + 1}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[0.68rem] font-extrabold ${
                                      isArchived
                                        ? 'bg-amber-100 text-amber-900'
                                        : 'bg-green-100 text-green-800'
                                    }`}
                                  >
                                    Kloter {isArchived ? kloter : currentKloterNum}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-bold text-gray-900">{rawName}</td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-800 font-bold text-xs">
                                    {kelas}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-gray-700">
                                  {school}
                                </td>
                                <td className="py-2.5 px-3 text-xs text-gray-500">{fullName}</td>
                                <td className="py-2.5 px-3 text-right font-black text-red-700">
                                  {p.score ?? 0} pts
                                </td>
                                <td className="py-2.5 px-3 text-center font-semibold text-gray-600">
                                  ⏱️ {fmtTime(p.timeSpent)}
                                </td>
                                <td className="py-2.5 px-3 text-center text-gray-500 text-xs">
                                  {p.date || '-'}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer Admin Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowGsheetConfig((v) => !v)}
                      className="font-bold text-red-700 hover:underline flex items-center gap-1"
                    >
                      ⚙️{' '}
                      {showGsheetConfig
                        ? 'Tutup Konfigurasi Google Sheets'
                        : 'Konfigurasi Google Sheets (Opsional)'}
                    </button>

                    <button
                      onClick={() => loadLeaderboard()}
                      className="font-bold text-gray-600 hover:text-red-700 transition-colors"
                    >
                      🔄 Refresh Data Server
                    </button>
                  </div>

                  {playersList.length > 0 && (
                    <button
                      onClick={handlePermanentDeleteAll}
                      className="font-semibold text-gray-400 hover:text-red-600 transition-colors"
                      title="Hapus permanen semua riwayat kloter dari database"
                    >
                      🗑️ Hapus Permanen Semua Arsip Kloter
                    </button>
                  )}
                </div>

                {showGsheetConfig && (
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs flex flex-col gap-2">
                    <p className="font-bold text-gray-800">
                      🔗 Hubungkan ke Google Sheets (Via Google Apps Script Web App URL)
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://script.google.com/macros/s/.../exec"
                        value={tempGsheetUrl}
                        onChange={(e) => setTempGsheetUrl(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs"
                      />
                      <button
                        onClick={() => {
                          setGsheetUrl(tempGsheetUrl)
                          loadLeaderboard()
                          alert('✅ Pengaturan URL Google Sheets tersimpan!')
                        }}
                        className="px-4 py-2 rounded-xl font-bold text-white bg-red-700 hover:bg-red-800"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Tab QR Code */
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-2">
                <div
                  className="p-6 rounded-3xl flex flex-col items-center text-center border-2"
                  style={{
                    background: 'linear-gradient(180deg, #FFFDFD 0%, #FEF2F2 100%)',
                    borderColor: '#FECACA',
                    boxShadow: '0 12px 32px rgba(153,0,0,0.12)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FikomLogo size={32} asLink={false} />
                    <span className="font-black text-sm text-red-900 uppercase tracking-wider">
                      FIKOM UKWMS
                    </span>
                  </div>
                  <p className="font-black text-xs text-red-700 uppercase tracking-widest mb-3">
                    SCAN UNTUK BERMAIN DI HP
                  </p>
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR Code Game FIKOM UKWMS"
                      className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl border-4 border-red-800 shadow-md bg-white p-2"
                    />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-gray-400">
                      Membuat QR...
                    </div>
                  )}
                  <p className="mt-3 font-bold text-xs text-gray-600 break-all max-w-[260px]">
                    {qrUrl}
                  </p>
                </div>

                <div className="flex flex-col gap-4 max-w-md w-full">
                  <div>
                    <h3 className="ws-title text-lg text-red-900 mb-1">
                      📱 QR Code Akses Cepat Pemain
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Gunakan QR Code ini agar siswa/pemain dapat langsung mengakses website game
                      lewat HP masing-masing.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Tautan / URL Website Game:
                    </label>
                    <input
                      type="text"
                      value={qrUrl}
                      onChange={(e) => setQrUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-800 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleDownloadQrPoster}
                      className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #990000, #DC2626)' }}
                    >
                      <span>🖼️</span>
                      <span>Download Poster QR (PNG)</span>
                    </motion.button>

                    {qrDataUrl && (
                      <a
                        href={qrDataUrl}
                        download="QR-Code-Only-Game-FIKOM-UKWMS.png"
                        className="py-3 px-4 rounded-xl font-bold text-sm border-2 border-red-700 text-red-800 hover:bg-red-50 flex items-center justify-center gap-1.5 text-center"
                      >
                        <span>📥</span>
                        <span>QR Saja (PNG)</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
