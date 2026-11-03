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
    { id: 1, noBukti: "TRX-001", tanggal: "2026-11-01", uraian: "Pengadaan Rapat Koordinasi SKPD", jenis: "pengeluaran", jumlah: 400000, fileName: null }
];

let filterAktif = "Semua";
let keywordPencarian = "";
let currentPage = 1;
let rowsPerPage = 10;

function simpanData() {
    localStorage.setItem('bku_konfigurasi', JSON.stringify(konfigurasi));
    localStorage.setItem('bku_transaksi', JSON.stringify(daftarTransaksi));
}

function getNamaBulan(angkaBulan) {
    const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return bulan[parseInt(angkaBulan) - 1];
}

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

const inputPencarian = document.querySelector('.search-bar-input');
const selectLimit = document.getElementById('selectLimit');
const filterBulan = document.getElementById('filterBulan');
const filterTahun = document.getElementById('filterTahun');

const tombolTabs = document.querySelectorAll('.tabs button');
const tabelBody = document.querySelector('table tbody');
const selectAllCheckbox = document.getElementById('selectAll');
const btnHapusTerpilih = document.getElementById('btnHapusTerpilih');
const btnPrevPage = document.getElementById('btnPrevPage');
const btnNextPage = document.getElementById('btnNextPage');
const pageIndicator = document.getElementById('pageIndicator');
const infoPagination = document.getElementById('infoPagination');

// Tombol Utama & Modal
const btnCetak = document.getElementById('btnCetak');
const btnEkspor = document.getElementById('btnEkspor');
const btnPengaturan = document.getElementById('btnPengaturan');
const btnTambahKas = document.getElementById('btnTambahKas');
const btnSaldoBank = document.getElementById('btnSaldoBank');
const btnPajak = document.getElementById('btnPajak');
const btnBukaDrawing = document.getElementById('btnBukaDrawing');

const modalTransaksi = document.getElementById('modalTransaksi');
const modalTitle = document.getElementById('modalTitle');
const btnBukaModalTransaksi = document.getElementById('btnBukaModalTransaksi');
const btnTutupModalTransaksi = document.getElementById('btnTutupModalTransaksi');
const btnSimpanTransaksi = document.getElementById('btnSimpanTransaksi');
const editIndexId = document.getElementById('editIndexId');
const inputNoBukti = document.getElementById('inputNoBukti');
const inputTanggal = document.getElementById('inputTanggal');
const inputJenis = document.getElementById('inputJenis');
const inputUraian = document.getElementById('inputUraian');
const inputJumlah = document.getElementById('inputJumlah');
const inputFile = document.getElementById('inputFile');

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

const inputAiPrompt = document.getElementById('inputAiPrompt');
const btnKirimAi = document.getElementById('btnKirimAi');
const aiResponse = document.getElementById('aiResponse');

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
    elTanggalCetakFooter.innerText = `1 ${getNamaBulan(filterBulan.value)} ${filterTahun.value}`;

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

    // Filter berdasarkan Periode (Bulan & Tahun), Tab, dan Pencarian
    let selectedBulan = filterBulan.value;
    let selectedTahun = filterTahun.value;

    let transaksiTampil = daftarTransaksi.filter(trx => {
        let tglParts = trx.tanggal.split('-'); // Format YYYY-MM-DD
        let trxTahun = tglParts[0];
        let trxIBulan = tglParts[1];

        let matchPeriode = (trxTahun === selectedTahun && trxIBulan === selectedBulan);
        
        let matchTab = true;
        if (filterAktif === 'Penerimaan') matchTab = trx.jenis === 'penerimaan';
        if (filterAktif === 'Pengeluaran') matchTab = trx.jenis === 'pengeluaran';

        let matchSearch = trx.uraian.toLowerCase().includes(keywordPencarian.toLowerCase()) || 
                          trx.tanggal.includes(keywordPencarian) ||
                          trx.noBukti.toLowerCase().includes(keywordPencarian.toLowerCase());
        
        return matchPeriode && matchTab && matchSearch;
    });

    renderTabel(transaksiTampil, totalPenerimaan, totalPengeluaran, sisaKas);
    simpanData();
}

function renderTabel(data, totalPenerimaan, totalPengeluaran, sisaKas) {
    tabelBody.innerHTML = '';

    // Logika Pagination
    let totalData = data.length;
    let totalPages = Math.ceil(totalData / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    let startIndex = (currentPage - 1) * rowsPerPage;
    let endIndex = startIndex + rowsPerPage;
    let paginatedData = data.slice(startIndex, endIndex);

    // Update Teks Informasi Pagination
    infoPagination.innerText = `Menampilkan ${totalData > 0 ? startIndex + 1 : 0} - ${Math.min(endIndex, totalData)} dari ${totalData} data`;
    pageIndicator.innerText = `${currentPage} / ${totalPages}`;

    btnPrevPage.disabled = currentPage === 1;
    btnNextPage.disabled = currentPage === totalPages || totalPages === 0;

    let htmlContent = `
        <tr class="summary-row">
            <td></td>
            <td>-</td>
            <td>-</td>
            <td><strong>Saldo Awal / Saldo Sebelumnya</strong></td>
            <td>-</td>
            <td>-</td>
            <td>${konfigurasi.saldoAwal.toLocaleString('id-ID')}</td>
            <td></td>
        </tr>
    `;

    if (paginatedData.length === 0) {
        htmlContent += `<tr><td colspan="8" style="text-align: center; color: #888;">Tidak ada transaksi ditemukan pada periode ini</td></tr>`;
    } else {
        paginatedData.forEach((trx, index) => {
            let nomorUrut = startIndex + index + 1;
            let kolomPenerimaan = trx.jenis === 'penerimaan' ? trx.jumlah.toLocaleString('id-ID') : '-';
            let kolomPengeluaran = trx.jenis === 'pengeluaran' ? trx.jumlah.toLocaleString('id-ID') : '-';
            let infoFile = trx.fileName ? `<br><small style="color: #00796b; cursor:pointer;" onclick="lihatFile(${trx.id})">📎 Lihat File (${trx.fileName})</small>` : '';
            
            htmlContent += `
                <tr>
                    <td><input type="checkbox" class="row-checkbox" data-id="${trx.id}"></td>
                    <td><strong>${nomorUrut}</strong></td>
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
                        <img src="https://img.icons8.com/material-outlined/20/737373/edit.png" onclick="bukaModalEdit(${trx.id})" title="Edit"/>
                        <img src="https://img.icons8.com/material-outlined/20/737373/trash.png" onclick="hapusTransaksi(${trx.id})" title="Hapus"/>
                    </td>
                </tr>
            `;
        });
    }

    htmlContent += `
        <tr class="final-row">
            <td></td>
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
// 4. EVENT LISTENERS FILTER, PAGINATION & PENCARIAN
// ==========================================
if (filterBulan) {
    filterBulan.addEventListener('change', function() { currentPage = 1; perbaruiAplikasi(); });
}
if (filterTahun) {
    filterTahun.addEventListener('change', function() { currentPage = 1; perbaruiAplikasi(); });
}
if (selectLimit) {
    selectLimit.addEventListener('change', function() {
        rowsPerPage = parseInt(this.value);
        currentPage = 1;
        perbaruiAplikasi();
    });
}
if (btnPrevPage) {
    btnPrevPage.addEventListener('click', function() {
        if (currentPage > 1) { currentPage--; perbaruiAplikasi(); }
    });
}
if (btnNextPage) {
    btnNextPage.addEventListener('click', function() {
        currentPage++; perbaruiAplikasi();
    });
}

if (inputPencarian) {
    inputPencarian.addEventListener('input', function(e) {
        keywordPencarian = e.target.value;
        currentPage = 1;
        perbaruiAplikasi();
    });
}

tombolTabs.forEach(btn => {
    btn.addEventListener('click', function() {
        tombolTabs.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        filterAktif = this.innerText;
        currentPage = 1;
        perbaruiAplikasi();
    });
});

if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        checkboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
    });
}

if (btnHapusTerpilih) {
    btnHapusTerpilih.addEventListener('click', function() {
        const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
        if (selectedCheckboxes.length === 0) {
            alert("⚠️ Pilih minimal satu transaksi yang ingin dihapus!");
            return;
        }

        if (confirm(`Yakin ingin menghapus ${selectedCheckboxes.length} transaksi yang dipilih?`)) {
            const idsToDelete = Array.from(selectedCheckboxes).map(cb => parseInt(cb.getAttribute('data-id')));
            daftarTransaksi = daftarTransaksi.filter(trx => !idsToDelete.includes(trx.id));
            selectAllCheckbox.checked = false;
            perbaruiAplikasi();
            alert("Transaksi terpilih berhasil dihapus!");
        }
    });
}

// ==========================================
// 5. FORM TAMBAH & EDIT TRANSAKSI
// ==========================================
btnBukaModalTransaksi.addEventListener('click', function() {
    modalTitle.innerText = "Tambah Transaksi Baru";
    editIndexId.value = "";
    const nomorUrutBaru = String(daftarTransaksi.length + 1).padStart(3, '0');
    inputNoBukti.value = `TRX-${nomorUrutBaru}`;
    inputTanggal.value = getTodayDateString();
    inputJenis.value = "pengeluaran";
    inputUraian.value = '';
    inputJumlah.value = '';
    inputFile.value = '';
    modalTransaksi.style.display = 'block';
});

window.bukaModalEdit = function(id) {
    let trx = daftarTransaksi.find(t => t.id === id);
    if (!trx) return;

    modalTitle.innerText = "Edit Transaksi";
    editIndexId.value = trx.id;
    inputNoBukti.value = trx.noBukti;
    inputTanggal.value = trx.tanggal;
    inputJenis.value = trx.jenis;
    inputUraian.value = trx.uraian;
    inputJumlah.value = trx.jumlah;
    inputFile.value = '';
    modalTransaksi.style.display = 'block';
};

btnTutupModalTransaksi.addEventListener('click', function() {
    modalTransaksi.style.display = 'none';
});

btnSimpanTransaksi.addEventListener('click', function() {
    let idEdit = editIndexId.value;
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

    function prosesSimpan(fileDataUrl = null, fileNameVal = null) {
        if (idEdit) {
            let trx = daftarTransaksi.find(t => t.id == idEdit);
            if (trx) {
                trx.tanggal = tgl;
                trx.jenis = jenisVal;
                trx.uraian = uraianVal;
                trx.jumlah = jumlahVal;
                if (fileDataUrl) {
                    trx.fileData = fileDataUrl;
                    trx.fileName = fileNameVal;
                }
            }
            alert("Transaksi berhasil diperbarui!");
        } else {
            daftarTransaksi.push({
                id: Date.now(),
                noBukti: noBuktiVal,
                tanggal: tgl,
                uraian: uraianVal,
                jenis: jenisVal,
                jumlah: jumlahVal,
                fileName: fileNameVal,
                fileData: fileDataUrl
            });
            alert("Transaksi berhasil ditambahkan!");
        }

        modalTransaksi.style.display = 'none';
        perbaruiAplikasi();
    }

    if (fileObj) {
        if (fileObj.size > 2 * 1024 * 1024) {
            alert("Ukuran file terlalu besar! Maksimal ukuran file adalah 2MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) { prosesSimpan(e.target.result, fileObj.name); };
        reader.readAsDataURL(fileObj);
    } else {
        let trxLama = idEdit ? daftarTransaksi.find(t => t.id == idEdit) : null;
        prosesSimpan(trxLama ? trxLama.fileData : null, trxLama ? trxLama.fileName : null);
    }
});

window.hapusTransaksi = function(id) {
    if (confirm("Yakin ingin menghapus transaksi ini?")) {
        daftarTransaksi = daftarTransaksi.filter(trx => trx.id !== id);
        perbaruiAplikasi();
    }
};

window.lihatFile = function(id) {
    let trx = daftarTransaksi.find(t => t.id === id);
    if (!trx || !trx.fileData) { alert("File tidak ditemukan."); return; }
    let win = window.open();
    if (win) {
        win.document.write(`<iframe src="${trx.fileData}" frameborder="0" style="width:100%; height:100vh;"></iframe>`);
    }
};

// ==========================================
// 6. MESIN AI
// ==========================================
if (btnKirimAi && inputAiPrompt) {
    btnKirimAi.addEventListener('click', function() {
        let teks = inputAiPrompt.value.trim();
        if (!teks) { aiResponse.innerText = "⚠️ Masukkan kalimat perintah AI."; return; }
        AIProsesTransaksi(teks);
    });
}

function AIProsesTransaksi(kalimat) {
    let teksLower = kalimat.toLowerCase();
    let jenis = "pengeluaran";
    const kataPenerimaan = ["terima", "dapat", "masuk", "pendapatan", "sumbangan", "hibah", "bantuan", "setoran"];
    for (let kata of kataPenerimaan) {
        if (teksLower.includes(kata)) { jenis = "penerimaan"; break; }
    }

    let jumlah = 0;
    if (teksLower.includes('juta') || teksLower.includes('jt')) {
        let match = teksLower.match(/(\d+[\.,]?\d*)\s*(juta|jt)/);
        if (match) jumlah = parseFloat(match[1].replace(',', '.')) * 1000000;
    } else if (teksLower.includes('ribu') || teksLower.includes('rb')) {
        let match = teksLower.match(/(\d+[\.,]?\d*)\s*(ribu|rb)/);
        if (match) jumlah = parseFloat(match[1].replace(',', '.')) * 1000;
    } else {
        let matchAngka = teksLower.match(/\d+[\.,]?\d*/g);
        if (matchAngka) {
            let angkaList = matchAngka.map(n => parseInt(n.replace(/[\.,]/g, '')));
            jumlah = Math.max(...angkaList);
        }
    }

    if (isNaN(jumlah) || jumlah <= 0) {
        aiResponse.innerText = "❌ AI gagal mendeteksi nominal angka.";
        return;
    }

    let uraian = kalimat.charAt(0).toUpperCase() + kalimat.slice(1);
    let noBuktiVal = `AI-${String(daftarTransaksi.length + 1).padStart(3, '0')}`;
    let tglHariIni = getTodayDateString();

    daftarTransaksi.push({
        id: Date.now(),
        noBukti: noBuktiVal,
        tanggal: tglHariIni,
        uraian: uraian,
        jenis: jenis,
        jumlah: jumlah,
        fileName: null,
        fileData: null
    });

    aiResponse.innerText = `✨ Sukses! [${jenis.toUpperCase()}] "${uraian}" sebesar Rp ${jumlah.toLocaleString('id-ID')}`;
    inputAiPrompt.value = "";
    perbaruiAplikasi();
}

// Tombol Cepat Rekonsiliasi & Drawing Canvas
if (btnTambahKas) btnTambahKas.addEventListener('click', () => { let v = prompt("Kas Tunai:", konfigurasi.kasTunai); if(v!==null){konfigurasi.kasTunai=parseInt(v)||0; perbaruiAplikasi();} });
if (btnSaldoBank) btnSaldoBank.addEventListener('click', () => { let v = prompt("Saldo Bank:", konfigurasi.saldoBank); if(v!==null){konfigurasi.saldoBank=parseInt(v)||0; perbaruiAplikasi();} });
if (btnPajak) btnPajak.addEventListener('click', () => { let v = prompt("Pajak Belum Disetor:", konfigurasi.pajakBelumDisetor); if(v!==null){konfigurasi.pajakBelumDisetor=parseInt(v)||0; perbaruiAplikasi();} });

let isDrawing = false, lastX = 0, lastY = 0;
btnBukaDrawing.addEventListener('click', () => { modalDrawing.style.display = 'block'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2; });
btnTutupDrawing.addEventListener('click', () => { modalDrawing.style.display = 'none'; });
btnClearCanvas.addEventListener('click', () => { ctx.clearRect(0, 0, canvas.width, canvas.height); });

canvas.addEventListener('mousedown', (e) => { isDrawing = true; lastX = e.offsetX; lastY = e.offsetY; });
canvas.addEventListener('mousemove', (e) => { if(!isDrawing)return; ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); lastX = e.offsetX; lastY = e.offsetY; });
window.addEventListener('mouseup', () => { isDrawing = false; });
btnSimpanDrawing.addEventListener('click', () => {
    konfigurasi.tandaTanganUrl = canvas.toDataURL('image/png');
    imgTandaTangan.src = konfigurasi.tandaTanganUrl;
    imgTandaTangan.style.display = 'block';
    modalDrawing.style.display = 'none';
    perbaruiAplikasi();
});

btnPengaturan.addEventListener('click', () => {
    inputProgram.value = konfigurasi.program;
    inputKegiatan.value = konfigurasi.kegiatan;
    inputSubKegiatan.value = konfigurasi.subKegiatan;
    inputSaldoAwal.value = konfigurasi.saldoAwal;
    inputNamaKPA.value = konfigurasi.namaKPA;
    inputNIPKPA.value = konfigurasi.nipKPA;
    modalPengaturan.style.display = 'block';
});
btnTutupModal.addEventListener('click', () => { modalPengaturan.style.display = 'none'; modalDrawing.style.display = 'none'; });
btnSimpanPengaturan.addEventListener('click', () => {
    konfigurasi.program = inputProgram.value;
    konfigurasi.kegiatan = inputKegiatan.value;
    konfigurasi.subKegiatan = inputSubKegiatan.value;
    konfigurasi.saldoAwal = parseInt(inputSaldoAwal.value) || 0;
    konfigurasi.namaKPA = inputNamaKPA.value;
    konfigurasi.nipKPA = inputNIPKPA.value;
    modalPengaturan.style.display = 'none';
    perbaruiAplikasi();
    alert("Pengaturan disimpan!");
});

btnCetak.addEventListener('click', () => window.print());
btnEkspor.addEventListener('click', () => {
    let ttd = konfigurasi.tandaTanganUrl ? `<img src="${konfigurasi.tandaTanganUrl}" height="60"/>` : `<br/><br/>`;
    let html = `<html><head><meta charset="utf-8"></head><body><h3>Buku Kas Umum</h3><table border="1">${document.querySelector('table').innerHTML}</table><br/>${ttd}</body></html>`;
    let blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel' });
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `BKU_${filterBulan.value}_${filterTahun.value}.xls`;
    a.click();
});

document.addEventListener("DOMContentLoaded", () => perbaruiAplikasi());
