// ==========================================
// 1. DATA AWAL & LOCAL STORAGE
// ==========================================
let konfigurasi = JSON.parse(localStorage.getItem('bku_konfigurasi')) || {
    program: "1.03.01.1 Program Penunjang Urusan Pemerintah Daerah Provinsi",
    kegiatan: "1.03.01.1.06 Administrasi Umum Perangkat Daerah",
    subKegiatan: "1.03.01.1.06.0009 Penyelenggaraan Rapat Koordinasi dan Konsultasi SKPD",
    saldoAwal: 500000000,
    namaKPA: "HARRY KUSWIAN, S.T., M.T.",
    nipKPA: "198004 201201 1 011",
    kasTunai: 0,
    saldoBank: 0,
    suratBerharga: 0,
    pajakBelumDisetor: 0,
    tandaTanganUrl: ""
};

let daftarTransaksi = JSON.parse(localStorage.getItem('bku_transaksi')) || [
    { id: 1, noBukti: "TRX-001", tanggal: "2021-10-01", uraian: "Pengadaan Rapat Koordinasi SKPD", jenis: "pengeluaran", jumlah: 400000, fileName: null }
];

let filterAktif = "Semua";
let keywordPencarian = "";

function simpanData() {
    localStorage.setItem('bku_konfigurasi', JSON.stringify(konfigurasi));
    localStorage.setItem('bku_transaksi', JSON.stringify(daftarTransaksi));
}

function getTanggalHariIniFormat() {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('id-ID', options);
}

// Mendapatkan format YYYY-MM-DD untuk input date HTML
function getTodayDateString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    if (mm < 10) mm = '0' + mm;
    if (dd < 10) dd = '0' + dd;
    return `${yyyy}-${mm}-${dd}`;
}

// ==========================================
// 2. SELEKTOR ELEMEN DOM
// ==========================================
const elSaldoAwal = document.querySelectorAll('.summary-cards .card')[0].querySelector('h2');
const elTotalPenerimaan = document.querySelectorAll('.summary-cards .card')[1].querySelector('h2');
const elTotalPengeluaran = document.querySelectorAll('.summary-cards .card')[2].querySelector('h2');
const elSisaKas = document.querySelectorAll('.summary-cards .card')[3].querySelector('h2');

const elViewProgram = document.getElementById('viewProgram');
const elViewKegiatan = document.getElementById('viewKegiatan');
const elViewSubKegiatan = document.getElementById('viewSubKegiatan');
const elViewNamaKPA = document.getElementById('viewNamaKPA');
const elViewNIPKPA = document.getElementById('viewNIPKPA');
const elTanggalCetakFooter = document.getElementById('tanggalCetakFooter');
const imgTandaTangan = document.getElementById('imgTandaTangan');

const elRekonBku = document.getElementById('rekonBku');
const elValKasTunai = document.getElementById('valKasTunai');
const elValSaldoBank = document.getElementById('valSaldoBank');
const elValTotalFisik = document.getElementById('valTotalFisik');
const elValPajak = document.getElementById('valPajak');
const elTextWarning = document.getElementById('textWarning');
const elWarningBox = document.querySelector('.warning-box');

const inputPencarian = document.querySelector('.search-bar input');
const tombolTabs = document.querySelectorAll('.tabs button');
const tabelBody = document.querySelector('table tbody');

// Tombol Aksi Utama
const btnCetak = document.getElementById('btnCetak');
const btnEkspor = document.getElementById('btnEkspor');
const btnPengaturan = document.getElementById('btnPengaturan');
const btnTambahKas = document.getElementById('btnTambahKas');
const btnSaldoBank = document.getElementById('btnSaldoBank');
const btnPajak = document.getElementById('btnPajak');
const btnBukaDrawing = document.getElementById('btnBukaDrawing');

// Modal Transaksi
const modalTransaksi = document.getElementById('modalTransaksi');
const btnBukaModalTransaksi = document.getElementById('btnBukaModalTransaksi');
const btnTutupModalTransaksi = document.getElementById('btnTutupModalTransaksi');
const btnSimpanTransaksi = document.getElementById('btnSimpanTransaksi');
const inputNoBukti = document.getElementById('inputNoBukti');
const inputTanggal = document.getElementById('inputTanggal');
const inputJenis = document.getElementById('inputJenis');
const inputUraian = document.getElementById('inputUraian');
const inputJumlah = document.getElementById('inputJumlah');
const inputFile = document.getElementById('inputFile');

// Modal Pengaturan & Drawing
const modalPengaturan = document.getElementById('modalPengaturan');
const btnTutupModal = document.getElementById('btnTutupModal');
const btnSimpanPengaturan = document.getElementById('btnSimpanPengaturan');
const modalDrawing = document.getElementById('modalDrawing');
const btnTutupDrawing = document.getElementById('btnTutupDrawing');
const btnSimpanDrawing = document.getElementById('btnSimpanDrawing');
const btnClearCanvas = document.getElementById('btnClearCanvas');
const canvas = document.getElementById('canvasTandaTangan');
const ctx = canvas.getContext('2d');

const inputProgram = document.getElementById('inputProgram');
const inputKegiatan = document.getElementById('inputKegiatan');
const inputSubKegiatan = document.getElementById('inputSubKegiatan');
const inputSaldoAwal = document.getElementById('inputSaldoAwal');
const inputNamaKPA = document.getElementById('inputNamaKPA');
const inputNIPKPA = document.getElementById('inputNIPKPA');

function formatRupiah(angka) {
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const inputAiPrompt = document.getElementById('inputAiPrompt');
const btnKirimAi = document.getElementById('btnKirimAi');
const aiResponse = document.getElementById('aiResponse');
}
// ==========================================
// 3. FUNGSI UTAMA RENDER & KALKULASI
// ==========================================
function perbaruiAplikasi() {
    let totalPenerimaan = 0;
    let totalPengeluaran = 0;

    daftarTransaksi.forEach(trx => {
        if (trx.jenis === 'penerimaan') {
            totalPenerimaan += trx.jumlah;
        } else if (trx.jenis === 'pengeluaran') {
            totalPengeluaran += trx.jumlah;
        }
    });

    let sisaKas = konfigurasi.saldoAwal + totalPenerimaan - totalPengeluaran;

    elViewProgram.innerText = konfigurasi.program;
    elViewKegiatan.innerText = konfigurasi.kegiatan;
    elViewSubKegiatan.innerText = konfigurasi.subKegiatan;
    elViewNamaKPA.innerText = konfigurasi.namaKPA;
    elViewNIPKPA.innerText = konfigurasi.nipKPA;
    elTanggalCetakFooter.innerText = getTanggalHariIniFormat();

    if (konfigurasi.tandaTanganUrl) {
        imgTandaTangan.src = konfigurasi.tandaTanganUrl;
        imgTandaTangan.style.display = 'block';
    } else {
        imgTandaTangan.style.display = 'none';
    }

    elSaldoAwal.innerText = formatRupiah(konfigurasi.saldoAwal);
    elTotalPenerimaan.innerText = formatRupiah(totalPenerimaan);
    elTotalPengeluaran.innerText = formatRupiah(totalPengeluaran);
    elSisaKas.innerText = formatRupiah(sisaKas);
    elRekonBku.innerText = formatRupiah(sisaKas);

    let totalKasFisik = konfigurasi.kasTunai + konfigurasi.saldoBank + konfigurasi.suratBerharga;
    elValKasTunai.innerText = formatRupiah(konfigurasi.kasTunai);
    elValSaldoBank.innerText = formatRupiah(konfigurasi.saldoBank);
    elValTotalFisik.innerText = formatRupiah(totalKasFisik);
    elValPajak.innerText = formatRupiah(konfigurasi.pajakBelumDisetor);

    let selisih = sisaKas - totalKasFisik;
    if (elWarningBox) {
        if (selisih !== 0) {
            elWarningBox.style.display = 'flex';
            elTextWarning.innerText = `Selisih ${formatRupiah(Math.abs(selisih))} antara BKU dan kas fisik.`;
        } else {
            elWarningBox.style.display = 'none';
        }
    }

    let transaksiTampil = daftarTransaksi.filter(trx => {
        let matchTab = true;
        if (filterAktif === 'Penerimaan') matchTab = trx.jenis === 'penerimaan';
        if (filterAktif === 'Pengeluaran') matchTab = trx.jenis === 'pengeluaran';

        let matchSearch = trx.uraian.toLowerCase().includes(keywordPencarian.toLowerCase()) || 
                          trx.tanggal.includes(keywordPencarian) ||
                          trx.noBukti.toLowerCase().includes(keywordPencarian.toLowerCase());
        return matchTab && matchSearch;
    });

    renderTabel(transaksiTampil, totalPenerimaan, totalPengeluaran, sisaKas);
    simpanData();
}

function renderTabel(data, totalPenerimaan, totalPengeluaran, sisaKas) {
    tabelBody.innerHTML = '';

    let htmlContent = `
        <tr class="summary-row">
            <td>-</td>
            <td>-</td>
            <td><strong>Saldo Awal / Saldo Sebelumnya</strong></td>
            <td>-</td>
            <td>-</td>
            <td>${konfigurasi.saldoAwal.toLocaleString('id-ID')}</td>
            <td></td>
        </tr>
    `;

    if (data.length === 0) {
        htmlContent += `<tr><td colspan="7" style="text-align: center; color: #888;">Tidak ada transaksi ditemukan</td></tr>`;
    } else {
        data.forEach((trx, index) => {
            let kolomPenerimaan = trx.jenis === 'penerimaan' ? trx.jumlah.toLocaleString('id-ID') : '-';
            let kolomPengeluaran = trx.jenis === 'pengeluaran' ? trx.jumlah.toLocaleString('id-ID') : '-';
            let infoFile = trx.fileName ? `<br><small style="color: #00796b;">📎 ${trx.fileName}</small>` : '';
            
            htmlContent += `
                <tr>
                    <td><strong>${index + 1}</strong></td>
                    <td>${trx.tanggal}<br><small style="color:#666;">${trx.noBukti}</small></td>
                    <td>
                        <div class="teks-uraian">${trx.uraian}</div>
                        <div class="sub-teks-uraian">Kategori: ${trx.jenis.toUpperCase()}</div>
                        ${infoFile}
                    </td>
                    <td>${kolomPenerimaan}</td>
                    <td class="${trx.jenis === 'pengeluaran' ? 'expense' : ''}">${kolomPengeluaran}</td>
                    <td>${sisaKas.toLocaleString('id-ID')}</td>
                    <td class="action-icons">
                        <img src="https://img.icons8.com/material-outlined/20/737373/edit.png" onclick="editTransaksi(${trx.id})" title="Edit"/>
                        <img src="https://img.icons8.com/material-outlined/20/737373/trash.png" onclick="hapusTransaksi(${trx.id})" title="Hapus"/>
                    </td>
                </tr>
            `;
        });
    }

    htmlContent += `
        <tr class="final-row">
            <td></td>
            <td><strong>TOTAL</strong></td>
            <td></td>
            <td><strong>${totalPenerimaan.toLocaleString('id-ID')}</strong></td>
            <td><strong>${totalPengeluaran.toLocaleString('id-ID')}</strong></td>
            <td><strong>${sisaKas.toLocaleString('id-ID')}</strong></td>
            <td></td>
        </tr>
    `;

    tabelBody.innerHTML = htmlContent;
}

// ==========================================
// 4. EVENT LISTENERS & FORM TRANSAKSI BARU
// ==========================================

if (inputPencarian) {
    inputPencarian.addEventListener('input', function(e) {
        keywordPencarian = e.target.value;
        perbaruiAplikasi();
    });
}

tombolTabs.forEach(btn => {
    btn.addEventListener('click', function() {
        tombolTabs.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        filterAktif = this.innerText;
        perbaruiAplikasi();
    });
});

// Buka Modal Tambah Transaksi (Otomatis set nomor bukti & tanggal hari ini)
btnBukaModalTransaksi.addEventListener('click', function() {
    const nomorUrutBaru = String(daftarTransaksi.length + 1).padStart(3, '0');
    inputNoBukti.value = `TRX-${nomorUrutBaru}`;
    inputTanggal.value = getTodayDateString(); // Tanggal otomatis hari ini tanpa diketik
    inputUraian.value = '';
    inputJumlah.value = '';
    inputFile.value = '';
    modalTransaksi.style.display = 'block';
});

btnTutupModalTransaksi.addEventListener('click', function() {
    modalTransaksi.style.display = 'none';
});

// Simpan Transaksi dari Modal Form
btnSimpanTransaksi.addEventListener('click', function() {
    let tgl = inputTanggal.value;
    let noBuktiVal = inputNoBukti.value;
    let jenisVal = inputJenis.value;
    let uraianVal = inputUraian.value.trim();
    let jumlahVal = parseInt(inputJumlah.value);
    let fileObj = inputFile.files[0];

    if (!tgl || !uraianVal || isNaN(jumlahVal) || jumlahVal <= 0) {
        alert("Mohon isi tanggal, uraian, dan nominal dengan benar!");
        return;
    }

    // Validasi ukuran file maks 2MB jika ada file yang diunggah
    let fileNameVal = null;
    if (fileObj) {
        if (fileObj.size > 2 * 1024 * 1024) {
            alert("Ukuran file terlalu besar! Maksimal ukuran file adalah 2MB.");
            return;
        }
        fileNameVal = fileObj.name;
    }

    daftarTransaksi.push({
        id: Date.now(),
        noBukti: noBuktiVal,
        tanggal: tgl,
        uraian: uraianVal,
        jenis: jenisVal,
        jumlah: jumlahVal,
        fileName: fileNameVal
    });

    modalTransaksi.style.display = 'none';
    perbaruiAplikasi();
    alert("Transaksi berhasil disimpan!");
});

// Rekonsiliasi Tombol Cepat
if (btnTambahKas) {
    btnTambahKas.addEventListener('click', function() {
        let nilaiBaru = prompt("Masukkan jumlah Kas Tunai fisik (Angka saja):", konfigurasi.kasTunai);
        if (nilaiBaru !== null && !isNaN(nilaiBaru)) {
            konfigurasi.kasTunai = parseInt(nilaiBaru);
            perbaruiAplikasi();
        }
    });
}

if (btnSaldoBank) {
    btnSaldoBank.addEventListener('click', function() {
        let nilaiBaru = prompt("Masukkan jumlah Saldo Bank (Angka saja):", konfigurasi.saldoBank);
        if (nilaiBaru !== null && !isNaN(nilaiBaru)) {
            konfigurasi.saldoBank = parseInt(nilaiBaru);
            perbaruiAplikasi();
        }
    });
}

if (btnPajak) {
    btnPajak.addEventListener('click', function() {
        let nilaiBaru = prompt("Masukkan jumlah Pajak Belum Disetor (Angka saja):", konfigurasi.pajakBelumDisetor);
        if (nilaiBaru !== null && !isNaN(nilaiBaru)) {
            konfigurasi.pajakBelumDisetor = parseInt(nilaiBaru);
            perbaruiAplikasi();
        }
    });
}

// Logika Canvas Drawing Tanda Tangan
let isDrawing = false;
let lastX = 0;
let lastY = 0;

btnBukaDrawing.addEventListener('click', function() {
    modalDrawing.style.display = 'block';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
});

btnTutupDrawing.addEventListener('click', function() {
    modalDrawing.style.display = 'none';
});

btnClearCanvas.addEventListener('click', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.touches[0].clientX - rect.left) * (canvas.width / rect.width),
        y: (e.touches[0].clientY - rect.top) * (canvas.height / rect.height)
    };
}

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const pos = getMousePos(e);
    lastX = pos.x;
    lastY = pos.y;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
});

window.addEventListener('mouseup', () => { isDrawing = false; });

canvas.addEventListener('touchstart', (e) => {
    isDrawing = true;
    const pos = getTouchPos(e);
    lastX = pos.x;
    lastY = pos.y;
    e.preventDefault();
});

canvas.addEventListener('touchmove', (e) => {
    if (!isDrawing) return;
    const pos = getTouchPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
    e.preventDefault();
});

window.addEventListener('touchend', () => { isDrawing = false; });

btnSimpanDrawing.addEventListener('click', function() {
    konfigurasi.tandaTanganUrl = canvas.toDataURL('image/png');
    imgTandaTangan.src = konfigurasi.tandaTanganUrl;
    imgTandaTangan.style.display = 'block';
    modalDrawing.style.display = 'none';
    perbaruiAplikasi();
});

// Aksi Edit & Hapus Transaksi
window.hapusTransaksi = function(id) {
    if (confirm("Yakin ingin menghapus transaksi ini?")) {
        daftarTransaksi = daftarTransaksi.filter(trx => trx.id !== id);
        perbaruiAplikasi();
    }
};

window.editTransaksi = function(id) {
    let trx = daftarTransaksi.find(t => t.id === id);
    if (!trx) return;
    let nominalBaru = prompt("Ubah nominal transaksi:", trx.jumlah);
    if (nominalBaru !== null && !isNaN(nominalBaru)) {
        trx.jumlah = parseInt(nominalBaru);
        perbaruiAplikasi();
    }
};

// Pengaturan Modal Dokumen
btnPengaturan.addEventListener('click', function() {
    inputProgram.value = konfigurasi.program;
    inputKegiatan.value = konfigurasi.kegiatan;
    inputSubKegiatan.value = konfigurasi.subKegiatan;
    inputSaldoAwal.value = konfigurasi.saldoAwal;
    inputNamaKPA.value = konfigurasi.namaKPA;
    inputNIPKPA.value = konfigurasi.nipKPA;
    modalPengaturan.style.display = 'block';
});

btnTutupModal.addEventListener('click', function() {
    modalDrawing.style.display = 'none';
    modalPengaturan.style.display = 'none';
});

btnSimpanPengaturan.addEventListener('click', function() {
    konfigurasi.program = inputProgram.value;
    konfigurasi.kegiatan = inputKegiatan.value;
    konfigurasi.subKegiatan = inputSubKegiatan.value;
    konfigurasi.saldoAwal = parseInt(inputSaldoAwal.value) || 0;
    konfigurasi.namaKPA = inputNamaKPA.value;
    konfigurasi.nipKPA = inputNIPKPA.value;

    modalPengaturan.style.display = 'none';
    perbaruiAplikasi();
    alert("Pengaturan berhasil disimpan!");
});

// Cetak & Ekspor File
btnCetak.addEventListener('click', function() {
    window.print();
});

btnEkspor.addEventListener('click', function() {
    let ttdHtml = konfigurasi.tandaTanganUrl ? `<img src="${konfigurasi.tandaTanganUrl}" height="60"/>` : `<br/><br/>`;
    
    let htmlContent = `
        <html>
        <head><meta charset="utf-8"></head>
        <body>
            <h3>Buku Kas Umum</h3>
            <p><strong>Tanggal Ekspor:</strong> ${getTanggalHariIniFormat()}</p>
            <p><strong>Program:</strong> ${konfigurasi.program}</p>
            <p><strong>Kegiatan:</strong> ${konfigurasi.kegiatan}</p>
            <p><strong>Sub Kegiatan:</strong> ${konfigurasi.subKegiatan}</p>
            <br/>
            <table border="1">
                ${document.querySelector('table').innerHTML}
            </table>
            <br/><br/>
            <p>Mengetahui,</p>
            <p>Kuasa Pengguna Anggaran</p>
            <div>${ttdHtml}</div>
            <p><b>${konfigurasi.namaKPA}</b></p>
            <p>NIP. ${konfigurasi.nipKPA}</p>
        </body>
        </html>
    `;

    let blob = new Blob(['\ufeff' + htmlContent], { type: 'application/vnd.ms-excel' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = `Buku_Kas_Umum_${new Date().toISOString().slice(0,10)}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

document.addEventListener("DOMContentLoaded", function() {
    perbaruiAplikasi();
});

// ==========================================
// MESIN AI: NATURAL LANGUAGE PROCESSING (NLP)
// ==========================================
if (btnKirimAi && inputAiPrompt) {
    btnKirimAi.addEventListener('click', function() {
        let teks = inputAiPrompt.value.trim();
        if (!teks) {
            aiResponse.innerText = "⚠️ Masukkan kalimat perintah untuk AI terlebih dahulu.";
            return;
        }

        AIProsesTransaksi(teks);
    });
}

function AIProsesTransaksi(kalimat) {
    let teksLower = kalimat.toLowerCase();
    
    // 1. Deteksi Jenis Transaksi (Penerimaan / Pengeluaran)
    let jenis = "pengeluaran"; // default
    const kataPenerimaan = ["terima", "dapat", "masuk", "pendapatan", "sumbangan", "hibah", "bantuan"];
    for (let kata of kataPenerimaan) {
        if (teksLower.includes(kata)) {
            jenis = "penerimaan";
            break;
        }
    }

    // 2. Ekstraksi Nominal Angka & Satuan (ribu, jt, juta)
    let jumlah = 0;
    
    // Cek jika ada kata 'juta' atau 'jt'
    if (teksLower.includes('juta') || teksLower.includes('jt')) {
        let matchJuta = teksLower.match(/(\d+[\.,]?\d*)\s*(juta|jt)/);
        if (matchJuta) {
            jumlah = parseFloat(matchJuta[1].replace(',', '.')) * 1000000;
        }
    } 
    // Cek jika ada kata 'ribu' atau 'rb'
    else if (teksLower.includes('ribu') || teksLower.includes('rb')) {
        let matchRibu = teksLower.match(/(\d+[\.,]?\d*)\s*(ribu|rb)/);
        if (matchRibu) {
            jumlah = parseFloat(matchRibu[1].replace(',', '.')) * 1000;
        }
    } 
    // Cek angka biasa (misal: 50000 atau 50.000)
    else {
        let matchAngka = teksLower.match(/\d+[\.,]?\d*/g);
        if (matchAngka) {
            // Ambil angka terbesar yang ditemukan di kalimat sebagai nominal
            let angkaList = matchAngka.map(n => parseInt(n.replace(/[\.,]/g, '')));
            jumlah = Math.max(...angkaList);
        }
    }

    if (isNaN(jumlah) || jumlah <= 0) {
        aiResponse.innerText = "❌ AI gagal mendeteksi nominal angka. Coba tulis nominal dengan jelas (contoh: 50rb atau 1 juta).";
        return;
    }

    // 3. Bersihkan Uraian (ambil seluruh kalimat sebagai uraian)
    let uraian = kalimat.charAt(0).toUpperCase() + kalimat.slice(1);
    let noBuktiVal = `AI-${String(daftarTransaksi.length + 1).padStart(3, '0')}`;
    let tglHariIni = getTodayDateString();

    // 4. Masukkan ke Daftar Transaksi secara otomatis
    daftarTransaksi.push({
        id: Date.now(),
        noBukti: noBuktiVal,
        tanggal: tglHariIni,
        uraian: uraian,
        jenis: jenis,
        jumlah: jumlah,
        fileName: null
    });

    // 5. Berikan respon sukses dari AI
    aiResponse.innerText = `✨ Sukses! AI mencatat [${jenis.toUpperCase()}] "${uraian}" sebesar Rp ${jumlah.toLocaleString('id-ID')}`;
    inputAiPrompt.value = ""; // Bersihkan input
    
    // Perbarui tampilan tabel dan total kas
    perbaruiAplikasi();
}

