
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
    { id: 1, tanggal: "2026-10-01", uraian: "Pengadaan Rapat Koordinasi SKPD", jenis: "pengeluaran", jumlah: 400000, fileNama: "-" }
];

let filterAktif = "Semua";
let keywordPencarian = "";

function simpanData() {
    localStorage.setItem('bku_konfigurasi', JSON.stringify(konfigurasi));
    localStorage.setItem('bku_transaksi', JSON.stringify(daftarTransaksi));
}

function getTanggalHariIni() {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('id-ID', options);
}

// Format tanggal ke yyyy-mm-dd untuk input date
function getFormatTanggalInput(date = new Date()) {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset*60*1000));
    return adjustedDate.toISOString().split('T')[0];
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

// Modal Form Transaksi Baru
const modalTambahTrx = document.getElementById('modalTambahTrx');
const btnBukaFormTrx = document.getElementById('btnBukaFormTrx');
const btnTutupFormTrx = document.getElementById('btnTutupFormTrx');
const btnSimpanTransaksiBaru = document.getElementById('btnSimpanTransaksiBaru');

const inputNoTrx = document.getElementById('inputNoTrx');
const inputTanggalTrx = document.getElementById('inputTanggalTrx');
const inputJenisTrx = document.getElementById('inputJenisTrx');
const inputUraianTrx = document.getElementById('inputUraianTrx');
const inputJumlahTrx = document.getElementById('inputJumlahTrx');
const inputFileTrx = document.getElementById('inputFileTrx');

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
    elTanggalCetakFooter.innerText = getTanggalHariIni();

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
                          trx.tanggal.includes(keywordPencarian);
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
            <td>-</td>
            <td></td>
        </tr>
    `;

    if (data.length === 0) {
        htmlContent += `<tr><td colspan="8" style="text-align: center; color: #888;">Tidak ada transaksi ditemukan</td></tr>`;
    } else {
        data.forEach((trx, index) => {
            let kolomPenerimaan = trx.jenis === 'penerimaan' ? trx.jumlah.toLocaleString('id-ID') : '-';
            let kolomPengeluaran = trx.jenis === 'pengeluaran' ? trx.jumlah.toLocaleString('id-ID') : '-';
            let infoFile = trx.fileNama && trx.fileNama !== '-' ? `<a href="#" title="${trx.fileNama}">📄 Ada</a>` : '-';
            
            htmlContent += `
                <tr>
                    <td><strong>${index + 1}</strong></td>
                    <td>${trx.tanggal}</td>
                    <td>
                        <div class="teks-uraian">${trx.uraian}</div>
                        <div class="sub-teks-uraian">Kategori: ${trx.jenis.toUpperCase()}</div>
                    </td>
                    <td>${kolomPenerimaan}</td>
                    <td class="${trx.jenis === 'pengeluaran' ? 'expense' : ''}">${kolomPengeluaran}</td>
                    <td>${sisaKas.toLocaleString('id-ID')}</td>
                    <td>${infoFile}</td>
                    <td class="action-icons">
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
            <td></td>
        </tr>
    `;

    tabelBody.innerHTML = htmlContent;
}

// ==========================================
// 4. EVENT LISTENERS & FORM MODAL TRANSAKSI
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

// Buka Modal Form Transaksi (Otomatis atur nomor & tanggal hari ini)
btnBukaFormTrx.addEventListener('click', function() {
    inputNoTrx.value = daftarTransaksi.length + 1;
    inputTanggalTrx.value = getFormatTanggalInput(); // Menampilkan tanggal hari ini tanpa diketik
    inputUraianTrx.value = '';
    inputJumlahTrx.value = '';
    inputFileTrx.value = '';
    modalTambahTrx.style.display = 'block';
});

btnTutupFormTrx.addEventListener('click', function() {
    modalTambahTrx.style.display = 'none';
});

// Simpan Transaksi Baru dari Form Modal + Validasi Ukuran File Max 2MB
btnSimpanTransaksiBaru.addEventListener('click', function() {
    let tgl = inputTanggalTrx.value;
    let jenis = inputJenisTrx.value;
    let uraian = inputUraianTrx.value;
    let jumlah = parseInt(inputJumlahTrx.value);
    let fileObj = inputFileTrx.files[0];

    if (!tgl || !uraian || isNaN(jumlah) || jumlah <= 0) {
        alert("Harap isi tanggal, uraian, dan nominal transaksi dengan benar!");
        return;
    }

    let namaFile = "-";
    if (fileObj) {
        // Validasi ukuran maksimal 2MB (2 * 1024 * 1024 bytes)
        if (fileObj.size > 2 * 1024 * 1024) {
            alert("Ukuran file terlalu besar! Maksimal ukuran file adalah 2MB.");
            return;
        }
        namaFile = fileObj.name;
    }

    daftarTransaksi.push({
        id: Date.now(),
        tanggal: tgl,
        uraian: uraian,
        jenis: jenis,
        jumlah: jumlah,
        fileNama: namaFile
    });

    modalTambahTrx.style.display = 'none';
    perbaruiAplikasi();
    alert("Transaksi berhasil ditambahkan!");
});

// Tombol Rekonsiliasi Cepat
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

// Canvas Drawing Tanda Tangan
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

// Hapus Transaksi
window.hapusTransaksi = function(id) {
    if (confirm("Yakin ingin menghapus transaksi ini?")) {
        daftarTransaksi = daftarTransaksi.filter(trx => trx.id !== id);
        perbaruiAplikasi();
    }
};

// Pengaturan Modal Dokumen
btnPengaturan.addEventListener('click', function() {
    inputProgram.value = konfigurasi.program;
    inputKegiatan.value =
