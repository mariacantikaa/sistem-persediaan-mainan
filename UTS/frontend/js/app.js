// =====================================================
// APP.JS
// SISTEM AKUNTANSI PERSEDIAAN TOKO MAINAN
// VERSI BARU - SEARCHABLE MASTER DATA
// =====================================================


// =====================================================
// DATA SEMENTARA
// =====================================================

let pemasok = [];
let pelanggan = [];
let pembelianData = [];
let penjualanData = [];
let penyesuaianData = [];


// =====================================================
// DATA LOOKUP / PENCARIAN
// =====================================================

const lookupCache = {
    pemasokPembelian: [],
    barangPembelian: [],
    pelangganPenjualan: [],
    barangPenjualan: []
};

const lookupSelected = {
    pemasokPembelian: null,
    barangPembelian: null,
    pelangganPenjualan: null,
    barangPenjualan: null
};

const lookupTimers = {};
const lookupRequestToken = {};

const LOOKUP_LIMIT = 20;


// =====================================================
// KONFIGURASI LOOKUP
// =====================================================

const lookupConfig = {

    pemasokPembelian: {
        inputId: "cariPemasokPembelian",
        resultsId: "hasilPemasokPembelian",
        hiddenId: "pemasokPembelian",
        selectedId: "detailPemasokPembelian"
    },

    barangPembelian: {
        inputId: "cariBarangPembelian",
        resultsId: "hasilBarangPembelian",
        hiddenId: "barangPembelian",
        selectedId: "detailBarangPembelian",
        priceId: "hargaPembelian",
        stockInfoId: "infoStokPembelian",
        quantityId: "jumlahPembelian"
    },

    pelangganPenjualan: {
        inputId: "cariPelangganPenjualan",
        resultsId: "hasilPelangganPenjualan",
        hiddenId: "pelangganPenjualan",
        selectedId: "detailPelangganPenjualan"
    },

    barangPenjualan: {
        inputId: "cariBarangPenjualan",
        resultsId: "hasilBarangPenjualan",
        hiddenId: "barangPenjualan",
        selectedId: "detailBarangPenjualan",
        priceId: "hargaPenjualan",
        stockInfoId: "infoStokPenjualan",
        quantityId: "jumlahPenjualan"
    }

};


// =====================================================
// SAAT APLIKASI DIBUKA
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        pasangStyleLookup();

        inisialisasiSupabase();

        loadTema();

        await dashboard();

    }
);


// =====================================================
// STYLE PENCARIAN
// =====================================================

function pasangStyleLookup() {

    if (
        document.getElementById(
            "lookupStyle"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "lookupStyle";


    style.textContent = `

        .lookup-wrapper {
            position: relative;
            width: 100%;
        }

        .lookup-input-wrap {
            position: relative;
            width: 100%;
        }

        .lookup-input {
            width: 100%;
            box-sizing: border-box;
            padding: 12px 42px 12px 14px;
            border: 1px solid #e5b5c9;
            border-radius: 10px;
            background: #ffffff;
            color: #333333;
            outline: none;
            transition: 0.2s;
        }

        .lookup-input:focus {
            border-color: #d98aaa;
            box-shadow: 0 0 0 3px rgba(217, 138, 170, 0.15);
        }

        .lookup-search-icon {
            position: absolute;
            right: 13px;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            opacity: 0.65;
        }

        .lookup-results {
            display: none;
            position: absolute;
            z-index: 9999;
            left: 0;
            right: 0;
            top: calc(100% + 5px);
            max-height: 300px;
            overflow-y: auto;
            background: #ffffff;
            border: 1px solid #e5b5c9;
            border-radius: 12px;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
        }

        .lookup-results.open {
            display: block;
        }

        .lookup-result {
            display: block;
            width: 100%;
            border: none;
            border-bottom: 1px solid #f1e2e8;
            background: transparent;
            text-align: left;
            padding: 12px 14px;
            cursor: pointer;
            color: #333333;
        }

        .lookup-result:last-child {
            border-bottom: none;
        }

        .lookup-result:hover {
            background: #fff1f6;
        }

        .lookup-result-code {
            font-weight: 700;
            color: #c45d85;
        }

        .lookup-result-name {
            margin-top: 3px;
            font-weight: 600;
        }

        .lookup-result-info {
            margin-top: 4px;
            font-size: 12px;
            color: #777777;
        }

        .lookup-message {
            padding: 14px;
            text-align: center;
            color: #777777;
            font-size: 14px;
        }

        .lookup-selected {
            display: none;
            margin-top: 8px;
            padding: 12px 14px;
            border-radius: 10px;
            border: 1px solid #efc6d6;
            background: #fff7fa;
        }

        .lookup-selected.show {
            display: block;
        }

        .lookup-selected-title {
            font-weight: 700;
            margin-bottom: 4px;
        }

        .lookup-selected-info {
            font-size: 13px;
            color: #666666;
            line-height: 1.6;
        }

        .lookup-clear {
            margin-top: 7px;
            border: none;
            background: transparent;
            color: #c45d85;
            cursor: pointer;
            font-size: 12px;
            padding: 0;
        }

        .transaction-summary {
            margin-top: 20px;
            padding: 15px 18px;
            border-radius: 12px;
            background: #fff6fa;
            border: 1px solid #f0cad9;
        }

        .transaction-summary-row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin: 6px 0;
        }

        .transaction-summary-total {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #ecc3d3;
            font-size: 18px;
            font-weight: 700;
        }

        .search-master-box {
            margin-bottom: 18px;
        }

        .search-master-box input {
            max-width: 450px;
        }

        .stok-aman {
            color: #2e8b57;
            font-weight: 700;
        }

        .stok-menipis {
            color: #d47b24;
            font-weight: 700;
        }

        .stok-habis {
            color: #d9534f;
            font-weight: 700;
        }

        .lookup-loading {
            padding: 14px;
            text-align: center;
            color: #777777;
        }

        .theme-dark .lookup-input {
            background: #2a2a32;
            color: #ffffff;
            border-color: #555566;
        }

        .theme-dark .lookup-results {
            background: #292930;
            border-color: #555566;
        }

        .theme-dark .lookup-result {
            color: #ffffff;
            border-bottom-color: #44444d;
        }

        .theme-dark .lookup-result:hover {
            background: #383842;
        }

        .theme-dark .lookup-result-info {
            color: #bbbbbb;
        }

        .theme-dark .lookup-selected {
            background: #33333c;
            border-color: #555566;
        }

        .theme-dark .lookup-selected-info {
            color: #cccccc;
        }

        .theme-dark .transaction-summary {
            background: #33333c;
            border-color: #555566;
        }

    `;


    document.head.appendChild(
        style
    );

}


// =====================================================
// UBAH JUDUL
// =====================================================

function ubahJudul(judul) {

    const elemen =
        document.getElementById(
            "judulHalaman"
        );


    if (elemen) {

        elemen.textContent =
            judul;

    }

}


// =====================================================
// AKTIFKAN MENU
// =====================================================

function aktifkanMenu(namaMenu) {

    const semuaMenu =
        document.querySelectorAll(
            ".menu-button"
        );


    semuaMenu.forEach(
        function (button) {

            button.classList.remove(
                "active"
            );


            const span =
                button.querySelector(
                    "span"
                );


            const teks =
                span
                    ? span.textContent.trim().toLowerCase()
                    : button.innerText.trim().toLowerCase();


            if (
                teks ===
                namaMenu.trim().toLowerCase()
            ) {

                button.classList.add(
                    "active"
                );

            }

        }
    );

}


// =====================================================
// CEK SUPABASE
// =====================================================

function cekSupabase() {

    if (
        typeof supabaseClient ===
        "undefined" ||
        !supabaseClient
    ) {

        alert(
            "Supabase belum terhubung."
        );

        return false;

    }


    return true;

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// FORMAT RUPIAH
// =====================================================

function formatRupiah(angka) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(
        Number(angka) || 0
    );

}


// =====================================================
// FORMAT TANGGAL HARI INI
// =====================================================

function tanggalHariIniInput() {

    const sekarang =
        new Date();


    const tahun =
        sekarang.getFullYear();


    const bulan =
        String(
            sekarang.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const hari =
        String(
            sekarang.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${tahun}-${bulan}-${hari}`;

}


// =====================================================
// SANITASI PENCARIAN
// =====================================================

function bersihkanQueryPencarian(query) {

    return String(
        query || ""
    )
        .replace(
            /[%(),'"\\]/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim()
        .slice(
            0,
            50
        );

}


// =====================================================
// NOMOR TRANSAKSI OTOMATIS
// =====================================================

async function buatNomorTransaksi(
    tabel,
    kolom,
    prefix
) {

    if (!cekSupabase()) {
        return "";
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from(tabel)
            .select(kolom)
            .like(
                kolom,
                `${prefix}%`
            );


    if (error) {

        console.error(
            "Gagal membuat nomor transaksi:",
            error
        );

        return "";

    }


    let nomorTerakhir = 0;


    const pola =
        new RegExp(
            "^" +
            prefix.replace(
                /[-/\\^$*+?.()|[\]{}]/g,
                "\\$&"
            ) +
            "(\\d+)$"
        );


    (data || []).forEach(
        function (item) {

            const nilai =
                String(
                    item[kolom] || ""
                );


            const cocok =
                nilai.match(
                    pola
                );


            if (cocok) {

                const nomor =
                    Number(
                        cocok[1]
                    );


                if (
                    nomor >
                    nomorTerakhir
                ) {

                    nomorTerakhir =
                        nomor;

                }

            }

        }
    );


    return (
        prefix +
        String(
            nomorTerakhir + 1
        ).padStart(
            3,
            "0"
        )
    );

}

// =====================================================
// DASHBOARD
// =====================================================

async function dashboard() {

    ubahJudul("Dashboard");

    aktifkanMenu("Dashboard");

    const isi = document.getElementById("isi");

    isi.innerHTML = `

        <!-- =========================================
             HEADER DASHBOARD
        ========================================== -->

        <div class="dashboard-welcome">

            <div class="dashboard-welcome-text">

                <div class="dashboard-label">
                    SISTEM AKUNTANSI PERSEDIAAN
                </div>

                <h2>
                    Selamat Datang di Toko Mainan 🧸
                </h2>

                <p>
                    Pantau persediaan dan aktivitas toko
                    melalui satu dashboard.
                </p>

            </div>

            <div class="dashboard-welcome-icon">
                🧸
            </div>

        </div>


        <!-- =========================================
             KPI
        ========================================== -->

        <div class="dashboard-kpi-grid">

            <div class="dashboard-kpi">

                <div class="dashboard-kpi-icon">
                    📦
                </div>

                <div class="dashboard-kpi-content">

                    <span>
                        Total Barang
                    </span>

                    <strong id="dashboardTotalBarang">
                        0
                    </strong>

                    <small>
                        Jenis barang
                    </small>

                </div>

            </div>


            <div class="dashboard-kpi">

                <div class="dashboard-kpi-icon">
                    🏢
                </div>

                <div class="dashboard-kpi-content">

                    <span>
                        Total Pemasok
                    </span>

                    <strong id="dashboardTotalPemasok">
                        0
                    </strong>

                    <small>
                        Pemasok terdaftar
                    </small>

                </div>

            </div>


            <div class="dashboard-kpi">

                <div class="dashboard-kpi-icon">
                    👤
                </div>

                <div class="dashboard-kpi-content">

                    <span>
                        Total Pelanggan
                    </span>

                    <strong id="dashboardTotalPelanggan">
                        0
                    </strong>

                    <small>
                        Pelanggan terdaftar
                    </small>

                </div>

            </div>


            <div class="dashboard-kpi">

                <div class="dashboard-kpi-icon">
                    🛒
                </div>

                <div class="dashboard-kpi-content">

                    <span>
                        Total Pembelian
                    </span>

                    <strong id="dashboardTotalPembelian">
                        0
                    </strong>

                    <small>
                        Transaksi pembelian
                    </small>

                </div>

            </div>


            <div class="dashboard-kpi">

                <div class="dashboard-kpi-icon">
                    💰
                </div>

                <div class="dashboard-kpi-content">

                    <span>
                        Total Penjualan
                    </span>

                    <strong id="dashboardTotalPenjualan">
                        0
                    </strong>

                    <small>
                        Transaksi penjualan
                    </small>

                </div>

            </div>

        </div>


        <!-- =========================================
             INFORMASI PERSEDIAAN
        ========================================== -->

        <div class="dashboard-section-header">

            <div>

                <span class="dashboard-section-label">
                    PERSEDIAAN
                </span>

                <h3>
                    Ringkasan Persediaan
                </h3>

            </div>

        </div>


        <div class="dashboard-stock-grid">

            <div class="dashboard-stock-card">

                <div class="stock-card-top">

                    <span>
                        Total Stok
                    </span>

                    <div class="stock-card-icon">
                        📦
                    </div>

                </div>

                <strong id="dashboardTotalStok">
                    0
                </strong>

                <p>
                    Unit barang tersedia
                </p>

            </div>


            <div class="dashboard-stock-card warning">

                <div class="stock-card-top">

                    <span>
                        Stok Menipis
                    </span>

                    <div class="stock-card-icon">
                        ⚠️
                    </div>

                </div>

                <strong id="dashboardStokMenipis">
                    0
                </strong>

                <p>
                    Barang perlu diperhatikan
                </p>

            </div>


            <div class="dashboard-stock-card danger">

                <div class="stock-card-top">

                    <span>
                        Stok Habis
                    </span>

                    <div class="stock-card-icon">
                        🔴
                    </div>

                </div>

                <strong id="dashboardStokHabis">
                    0
                </strong>

                <p>
                    Barang tidak tersedia
                </p>

            </div>


            <div class="dashboard-stock-card value">

                <div class="stock-card-top">

                    <span>
                        Nilai Persediaan
                    </span>

                    <div class="stock-card-icon">
                        💎
                    </div>

                </div>

                <strong id="dashboardNilaiPersediaan">
                    Rp 0
                </strong>

                <p>
                    Berdasarkan harga beli
                </p>

            </div>

        </div>


        <!-- =========================================
             AREA BAWAH
        ========================================== -->

        <div class="dashboard-two-column">

            <div class="dashboard-panel">

                <div class="dashboard-panel-header">

                    <div>

                        <span>
                            PERHATIAN
                        </span>

                        <h3>
                            Stok Perlu Diperhatikan
                        </h3>

                    </div>

                    <button
                        type="button"
                        onclick="dataBarang()"
                        class="dashboard-link-button"
                    >
                        Lihat Barang
                    </button>

                </div>

               <div
    id="dashboardStokAlert"
    style="max-height: 260px; overflow-y: auto; padding-right: 8px;"
>
    Memuat data...
</div>

            </div>


            <div class="dashboard-panel">

                <div class="dashboard-panel-header">

                    <div>

                        <span>
                            KATEGORI
                        </span>

                        <h3>
                            Komposisi Barang
                        </h3>

                    </div>

                </div>

                <div
    id="dashboardKategori"
    style="max-height: 260px; overflow-y: auto; padding-right: 8px;"
>
    Memuat data...
</div>

            </div>

        </div>
    
        <!-- =========================================
             BARANG TERBANYAK
        ========================================== -->

        <div class="dashboard-panel dashboard-full-panel">

            <div class="dashboard-panel-header">

                <div>

                    <span>
                        PERSEDIAAN
                    </span>

                    <h3>
                        Barang dengan Stok Terbanyak
                    </h3>

                </div>

            </div>

          <div
    id="dashboardBarangTerbanyak"
    style="max-height: 260px; overflow-y: auto; padding-right: 8px;"
>
    Memuat data...
</div>

        </div>


        <!-- =========================================
             INSIGHT
        ========================================== -->

        <div class="dashboard-insight">

            <div class="dashboard-insight-icon">
                💡
            </div>

            <div>

                <span>
                    INSIGHT PERSEDIAAN
                </span>

                <p id="dashboardInsight">
                    Menganalisis kondisi persediaan...
                </p>

            </div>

        </div>

    `;

    await tampilkanDataDashboard();

}



// =====================================================
// DATA DASHBOARD
// =====================================================

async function tampilkanDataDashboard() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "Supabase client belum tersedia."
        );

        return;

    }


    try {

        // =============================================
        // AMBIL DATA DARI SUPABASE
        // =============================================

        const hasilBarang =
            await supabaseClient
                .from("barang")
                .select(`
                    id_barang,
                    kode_barang,
                    nama_barang,
                    kategori,
                    satuan,
                    stok,
                    harga_beli,
                    harga_jual,
                    stok_minimum
                `)
                .order(
                    "id_barang",
                    {
                        ascending: true
                    }
                );


        // =============================================
        // CEK ERROR BARANG
        // =============================================

        if (hasilBarang.error) {

            console.error(
                "Gagal mengambil data barang:",
                hasilBarang.error
            );

            return;

        }


        // =============================================
        // DATA BARANG
        // =============================================

        const barang =
            Array.isArray(hasilBarang.data)
                ? hasilBarang.data
                : [];


        console.log(
            "DATA BARANG DASHBOARD:",
            barang
        );

        console.log(
            "JUMLAH BARANG DASHBOARD:",
            barang.length
        );


        // =============================================
        // TOTAL BARANG
        // =============================================

        const elementTotalBarang =
            document.getElementById(
                "dashboardTotalBarang"
            );

        if (elementTotalBarang) {

            elementTotalBarang.textContent =
                barang.length;

        }


        // =============================================
        // AMBIL DATA JUMLAH MASTER
        // =============================================

        const [
            hasilPemasok,
            hasilPelanggan,
            hasilPembelian,
            hasilPenjualan
        ] = await Promise.all([

            supabaseClient
                .from("pemasok")
                .select(
                    "id_pemasok",
                    {
                        count: "exact",
                        head: true
                    }
                ),

            supabaseClient
                .from("pelanggan")
                .select(
                    "id_pelanggan",
                    {
                        count: "exact",
                        head: true
                    }
                ),

            supabaseClient
                .from("pembelian")
                .select(
                    "id_pembelian",
                    {
                        count: "exact",
                        head: true
                    }
                ),

            supabaseClient
                .from("penjualan")
                .select(
                    "id_penjualan",
                    {
                        count: "exact",
                        head: true
                    }
                )

        ]);


        // =============================================
        // TOTAL PEMASOK
        // =============================================

        const elementTotalPemasok =
            document.getElementById(
                "dashboardTotalPemasok"
            );

        if (elementTotalPemasok) {

            elementTotalPemasok.textContent =
                hasilPemasok.error
                    ? 0
                    : (hasilPemasok.count || 0);

        }


        // =============================================
        // TOTAL PELANGGAN
        // =============================================

        const elementTotalPelanggan =
            document.getElementById(
                "dashboardTotalPelanggan"
            );

        if (elementTotalPelanggan) {

            elementTotalPelanggan.textContent =
                hasilPelanggan.error
                    ? 0
                    : (hasilPelanggan.count || 0);

        }


        // =============================================
        // TOTAL PEMBELIAN
        // =============================================

        const elementTotalPembelian =
            document.getElementById(
                "dashboardTotalPembelian"
            );

        if (elementTotalPembelian) {

            elementTotalPembelian.textContent =
                hasilPembelian.error
                    ? 0
                    : (hasilPembelian.count || 0);

        }


        // =============================================
        // TOTAL PENJUALAN
        // =============================================

        const elementTotalPenjualan =
            document.getElementById(
                "dashboardTotalPenjualan"
            );

        if (elementTotalPenjualan) {

            elementTotalPenjualan.textContent =
                hasilPenjualan.error
                    ? 0
                    : (hasilPenjualan.count || 0);

        }


        // =============================================
        // TOTAL STOK
        // =============================================

        const totalStok =
            barang.reduce(
                function(total, item) {

                    return (
                        total +
                        Number(
                            item.stok || 0
                        )
                    );

                },
                0
            );


        const elementTotalStok =
            document.getElementById(
                "dashboardTotalStok"
            );

        if (elementTotalStok) {

            elementTotalStok.textContent =
                totalStok;

        }


        // =============================================
        // STOK HABIS
        // =============================================

        const stokHabis =
            barang.filter(
                function(item) {

                    return (
                        Number(
                            item.stok || 0
                        ) === 0
                    );

                }
            );


        const elementStokHabis =
            document.getElementById(
                "dashboardStokHabis"
            );

        if (elementStokHabis) {

            elementStokHabis.textContent =
                stokHabis.length;

        }


        // =============================================
        // STOK MENIPIS
        // =============================================

        const stokMenipis =
            barang.filter(
                function(item) {

                    const stok =
                        Number(
                            item.stok || 0
                        );

                    const minimum =
                        Number(
                            item.stok_minimum || 0
                        );

                    return (
                        stok > 0 &&
                        stok <= minimum
                    );

                }
            );


        const elementStokMenipis =
            document.getElementById(
                "dashboardStokMenipis"
            );

        if (elementStokMenipis) {

            elementStokMenipis.textContent =
                stokMenipis.length;

        }


        // =============================================
        // NILAI PERSEDIAAN
        // =============================================

        const nilaiPersediaan =
            barang.reduce(
                function(total, item) {

                    const stok =
                        Number(
                            item.stok || 0
                        );

                    const hargaBeli =
                        Number(
                            item.harga_beli || 0
                        );

                    return (
                        total +
                        (
                            stok *
                            hargaBeli
                        )
                    );

                },
                0
            );


        const elementNilaiPersediaan =
            document.getElementById(
                "dashboardNilaiPersediaan"
            );

        if (elementNilaiPersediaan) {

            elementNilaiPersediaan.textContent =
                formatRupiahDashboard(
                    nilaiPersediaan
                );

        }


        // =============================================
        // STOK ALERT
        // =============================================

        tampilkanStokAlertDashboard(
            stokHabis,
            stokMenipis
        );


        // =============================================
        // KATEGORI
        // =============================================

        tampilkanKategoriDashboard(
            barang
        );


        // =============================================
        // STOK TERBANYAK
        // =============================================

        tampilkanBarangTerbanyakDashboard(
            barang
        );


        // =============================================
        // INSIGHT
        // =============================================

        tampilkanInsightDashboard(
            barang,
            totalStok,
            stokHabis.length,
            stokMenipis.length,
            nilaiPersediaan
        );


    }
    catch (error) {

        console.error(
            "Gagal memuat dashboard:",
            error
        );

    }

}



// =====================================================
// FORMAT RUPIAH DASHBOARD
// =====================================================

function formatRupiahDashboard(nilai) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(
        Number(nilai) || 0
    );

}



// =====================================================
// STOK ALERT DASHBOARD
// =====================================================

function tampilkanStokAlertDashboard(
    stokHabis,
    stokMenipis
) {

    const container =
        document.getElementById(
            "dashboardStokAlert"
        );

    if (!container) {
        return;
    }


    const semuaAlert = [
        ...(stokHabis || []),
        ...(stokMenipis || [])
    ];


    if (semuaAlert.length === 0) {

        container.innerHTML = `

            <div class="dashboard-empty">

                <div>
                    ✅
                </div>

                <strong>
                    Semua stok aman
                </strong>

                <span>
                    Tidak ada barang yang
                    membutuhkan perhatian.
                </span>

            </div>

        `;

        return;

    }


    container.innerHTML =
        semuaAlert
            .slice(0, 6)
            .map(
                function(item) {

                    const stok =
                        Number(
                            item.stok || 0
                        );

                    const habis =
                        stok === 0;


                    return `

                        <div class="dashboard-alert-item">

                            <div class="dashboard-alert-icon ${
                                habis
                                    ? "danger"
                                    : "warning"
                            }">

                                ${
                                    habis
                                        ? "🔴"
                                        : "⚠️"
                                }

                            </div>


                            <div class="dashboard-alert-info">

                                <strong>
                                    ${escapeHtml(
                                        item.nama_barang || "-"
                                    )}
                                </strong>

                                <span>
                                    ${escapeHtml(
                                        item.kode_barang || "-"
                                    )}
                                </span>

                            </div>


                            <div class="dashboard-alert-stock">

                                <strong>
                                    ${stok}
                                </strong>

                                <span>
                                    ${escapeHtml(
                                        item.satuan || "Unit"
                                    )}
                                </span>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}



// =====================================================
// KATEGORI DASHBOARD
// =====================================================

function tampilkanKategoriDashboard(
    barang
) {

    const container =
        document.getElementById(
            "dashboardKategori"
        );


    if (!container) {
        return;
    }


    // =============================================
    // CEK DATA
    // =============================================

    if (
        !Array.isArray(barang) ||
        barang.length === 0
    ) {

        container.innerHTML = `

            <div class="dashboard-empty">

                <strong>
                    Belum ada data barang
                </strong>

                <span>
                    Tambahkan barang untuk
                    melihat komposisi kategori.
                </span>

            </div>

        `;

        return;

    }


    // =============================================
    // HITUNG KATEGORI
    // =============================================

    const kategoriMap = new Map();


    barang.forEach(
        function(item) {

            let namaKategori =
                String(
                    item.kategori || ""
                ).trim();


            if (
                namaKategori === ""
            ) {

                namaKategori =
                    "Tanpa Kategori";

            }


            // Normalisasi hanya untuk KEY.
            // Nama asli tetap ditampilkan.

            const key =
                namaKategori
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        " "
                    );


            if (
                !kategoriMap.has(key)
            ) {

                kategoriMap.set(
                    key,
                    {
                        nama: namaKategori,
                        jumlah: 0
                    }
                );

            }


            kategoriMap.get(key).jumlah++;

        }
    );


    // =============================================
    // UBAH MENJADI ARRAY
    // =============================================

    const daftarKategori =
        Array.from(
            kategoriMap.values()
        )
        .sort(
            function(a, b) {

                if (
                    b.jumlah !==
                    a.jumlah
                ) {

                    return (
                        b.jumlah -
                        a.jumlah
                    );

                }


                return a.nama.localeCompare(
                    b.nama,
                    "id"
                );

            }
        );


    // =============================================
    // TOTAL BARANG
    // =============================================

    const totalBarang =
        barang.length;


    // =============================================
    // RENDER KATEGORI
    // =============================================

    container.innerHTML =
        daftarKategori
            .slice(0, 6)
            .map(
                function(item) {

                    const persentase =
                        totalBarang > 0
                            ? Math.round(
                                (
                                    item.jumlah /
                                    totalBarang
                                ) * 100
                            )
                            : 0;


                    return `

                        <div class="dashboard-category-item">

                            <div class="dashboard-category-header">

                                <span>
                                    ${escapeHtml(
                                        item.nama
                                    )}
                                </span>

                                <strong>
                                    ${item.jumlah}
                                </strong>

                            </div>


                            <div class="dashboard-progress">

                                <div
                                    class="dashboard-progress-bar"
                                    style="width: ${persentase}%"
                                ></div>

                            </div>


                            <small>
                                ${persentase}% dari seluruh barang
                            </small>

                        </div>

                    `;

                }
            )
            .join("");

}



// =====================================================
// BARANG DENGAN STOK TERBANYAK
// =====================================================

function tampilkanBarangTerbanyakDashboard(
    barang
) {

    const container =
        document.getElementById(
            "dashboardBarangTerbanyak"
        );


    if (!container) {
        return;
    }


    const daftar =
        Array.isArray(barang)
            ? [...barang]
                .sort(
                    function(a, b) {

                        return (
                            Number(b.stok || 0) -
                            Number(a.stok || 0)
                        );

                    }
                )
                .slice(0, 5)
            : [];


    if (daftar.length === 0) {

        container.innerHTML = `

            <div class="dashboard-empty">

                <strong>
                    Belum ada data barang.
                </strong>

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div class="dashboard-product-table">

            <div class="dashboard-product-row header">

                <span>
                    Barang
                </span>

                <span>
                    Kategori
                </span>

                <span>
                    Stok
                </span>

                <span>
                    Nilai Stok
                </span>

            </div>


            ${
                daftar
                    .map(
                        function(item) {

                            const stok =
                                Number(
                                    item.stok || 0
                                );

                            const harga =
                                Number(
                                    item.harga_beli || 0
                                );

                            const nilai =
                                stok * harga;


                            return `

                                <div class="dashboard-product-row">

                                    <div class="dashboard-product-name">

                                        <strong>
                                            ${escapeHtml(
                                                item.nama_barang || "-"
                                            )}
                                        </strong>

                                        <small>
                                            ${escapeHtml(
                                                item.kode_barang || "-"
                                            )}
                                        </small>

                                    </div>


                                    <span>
                                        ${escapeHtml(
                                            item.kategori ||
                                            "Tanpa Kategori"
                                        )}
                                    </span>


                                    <strong>
                                        ${stok}
                                        ${escapeHtml(
                                            item.satuan ||
                                            "Unit"
                                        )}
                                    </strong>


                                    <span>
                                        ${formatRupiahDashboard(
                                            nilai
                                        )}
                                    </span>

                                </div>

                            `;

                        }
                    )
                    .join("")
            }

        </div>

    `;

}



// =====================================================
// INSIGHT DASHBOARD
// =====================================================

function tampilkanInsightDashboard(
    barang,
    totalStok,
    jumlahHabis,
    jumlahMenipis,
    nilaiPersediaan
) {

    const container =
        document.getElementById(
            "dashboardInsight"
        );


    if (!container) {
        return;
    }


    if (
        !Array.isArray(barang) ||
        barang.length === 0
    ) {

        container.textContent =
            "Belum ada data barang yang dapat dianalisis.";

        return;

    }


    if (jumlahHabis > 0) {

        container.textContent =
            "Terdapat " +
            jumlahHabis +
            " barang yang stoknya habis. " +
            "Periksa kebutuhan pembelian agar persediaan tetap tersedia.";

        return;

    }


    if (jumlahMenipis > 0) {

        container.textContent =
            "Terdapat " +
            jumlahMenipis +
            " barang dengan stok menipis. " +
            "Sebaiknya pantau barang tersebut sebelum stok habis.";

        return;

    }


    container.textContent =
        "Kondisi persediaan saat ini terlihat aman. " +
        "Terdapat " +
        barang.length +
        " jenis barang dengan total " +
        totalStok +
        " unit dan nilai persediaan sekitar " +
        formatRupiahDashboard(
            nilaiPersediaan
        ) +
        ".";

}

// =====================================================
// DATA BARANG
// =====================================================

async function dataBarang() {

    ubahJudul(
        "Data Barang"
    );

    aktifkanMenu(
        "Data Barang"
    );

    document.getElementById(
        "isi"
    ).innerHTML = `

        <div class="content-box">

            <div class="page-header">

                <div>

                    <h2>
                        Data Barang
                    </h2>

                    <p>
                        Mengelola data persediaan barang toko.
                    </p>

                </div>

                <button
                    class="btn-primary"
                    onclick="tambahBarang()"
                >
                    + Tambah Barang
                </button>

            </div>


            <div class="search-master-box">

                <input
                    type="text"
                    id="pencarianDataBarang"
                    placeholder="🔍 Cari kode atau nama barang..."
                >

                <select
                    id="filterKategoriBarang"
                >
                    <option value="">
                        Semua Kategori
                    </option>
                </select>

            </div>


            <div id="tabelBarang">

                <div class="empty-state">
                    Memuat data barang...
                </div>

            </div>

        </div>

    `;


    // =====================================================
    // PENCARIAN BARANG
    // =====================================================

    const input =
        document.getElementById(
            "pencarianDataBarang"
        );


    let timer;


    input.addEventListener(
        "input",
        function () {

            clearTimeout(
                timer
            );


            const query =
                this.value.trim();


            timer =
                setTimeout(
                    function () {

                        const kategori =
                            document.getElementById(
                                "filterKategoriBarang"
                            ).value;


                        tampilkanBarang(
                            query,
                            kategori
                        );

                    },
                    300
                );

        }
    );


    // =====================================================
    // FILTER KATEGORI
    // =====================================================

    const filterKategori =
        document.getElementById(
            "filterKategoriBarang"
        );


    filterKategori.addEventListener(
        "change",
        function () {

            const query =
                document.getElementById(
                    "pencarianDataBarang"
                ).value.trim();


            tampilkanBarang(
                query,
                this.value
            );

        }
    );


    await muatKategoriBarang();

    await tampilkanBarang();

}


// =====================================================
// MUAT KATEGORI BARANG
// =====================================================

async function muatKategoriBarang() {

    const select =
        document.getElementById(
            "filterKategoriBarang"
        );


    if (!select) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("barang")
            .select("kategori")
            .order(
                "kategori",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Gagal mengambil kategori:",
            error.message
        );

        return;
    }


    const daftarKategori = [];


    (data || []).forEach(
        function (item) {

            const kategori =
                String(
                    item.kategori || ""
                ).trim();


            if (
                kategori &&
                !daftarKategori.includes(
                    kategori
                )
            ) {

                daftarKategori.push(
                    kategori
                );

            }

        }
    );


    daftarKategori.sort(
        function (a, b) {

            return a.localeCompare(
                b,
                "id",
                {
                    sensitivity: "base"
                }
            );

        }
    );


    select.innerHTML = `
        <option value="">
            Semua Kategori
        </option>
    `;


    daftarKategori.forEach(
        function (kategori) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                kategori;


            option.textContent =
                kategori;


            select.appendChild(
                option
            );

        }
    );

}


// =====================================================
// TAMPILKAN BARANG
// =====================================================

let halamanBarang = 1;
const dataPerHalamanBarang = 10;

async function tampilkanBarang(
    query = "",
    kategori = "",
    halaman = 1
) {

    const container =
        document.getElementById(
            "tabelBarang"
        );

    if (!container) {
        return;
    }

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        container.innerHTML = `

            <div class="empty-state">

                Supabase belum terhubung.

            </div>

        `;

        return;
    }


    // =====================================================
    // SIMPAN HALAMAN AKTIF
    // =====================================================

    halamanBarang = halaman;


    const safeQuery =
        bersihkanQueryPencarian(
            query
        );


    let request =
        supabaseClient
            .from("barang")
            .select(
                "*",
                {
                    count: "exact"
                }
            );


    // =====================================================
    // FILTER PENCARIAN
    // =====================================================

    if (safeQuery) {

        const pattern =
            `%${safeQuery}%`;

        request =
            request.or(
                `kode_barang.ilike.${pattern},nama_barang.ilike.${pattern}`
            );

    }


    // =====================================================
    // FILTER KATEGORI
    // =====================================================

    if (kategori) {

        request =
            request.eq(
                "kategori",
                kategori
            );

    }


    // =====================================================
    // PAGINATION
    // =====================================================

    const mulai =
        (halaman - 1) *
        dataPerHalamanBarang;

    const selesai =
        mulai +
        dataPerHalamanBarang -
        1;


    const {
        data,
        error,
        count
    } =
        await request
            .order(
                "kode_barang",
                {
                    ascending: true
                }
            )
            .range(
                mulai,
                selesai
            );


    // =====================================================
    // CEK ERROR
    // =====================================================

    if (error) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Gagal mengambil data
                </h3>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            </div>

        `;

        return;
    }


    // =====================================================
    // DATA KOSONG
    // =====================================================

    if (
        !data ||
        data.length === 0
    ) {

        let pesanJudul =
            "Belum Ada Data Barang";

        let pesanIsi =
            "Silakan tambahkan barang terlebih dahulu.";


        if (
            safeQuery ||
            kategori
        ) {

            pesanJudul =
                "Data Tidak Ditemukan";


            if (kategori) {

                pesanIsi =
                    "Tidak ada barang pada kategori yang dipilih.";

            } else {

                pesanIsi =
                    "Coba gunakan kode atau nama barang lain.";

            }

        }


        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    ${pesanJudul}
                </h3>

                <p>
                    ${pesanIsi}
                </p>

            </div>

        `;

        return;
    }


    // =====================================================
    // TABEL BARANG
    // =====================================================

    let html = `

        <div class="table-container">

            <table>

                <thead>

                    <tr>

                        <th>
                            No
                        </th>

                        <th>
                            Kode Barang
                        </th>

                        <th>
                            Nama Barang
                        </th>

                        <th>
                            Kategori
                        </th>

                        <th>
                            Satuan
                        </th>

                        <th>
                            Harga Beli
                        </th>

                        <th>
                            Harga Jual
                        </th>

                        <th>
                            Stok
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Aksi
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    // =====================================================
    // TAMPILKAN SETIAP BARANG
    // =====================================================

    data.forEach(
        function (
            item,
            index
        ) {

            const status =
                String(
                    item.status || "AKTIF"
                ).toUpperCase();


            const statusAktif =
                status === "AKTIF";


            const nomor =
                mulai +
                index +
                1;


            html += `

                <tr>

                    <td>
                        ${nomor}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.kode_barang
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.nama_barang
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.kategori
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.satuan
                        )}
                    </td>

                    <td>
                        ${formatRupiah(
                            item.harga_beli
                        )}
                    </td>

                    <td>
                        ${formatRupiah(
                            item.harga_jual
                        )}
                    </td>

                    <td>
                        ${item.stok}
                    </td>

                    <td>

                        <span
                            class="${
                                statusAktif
                                    ? "stok-aman"
                                    : "stok-habis"
                            }"
                        >

                            ${
                                statusAktif
                                    ? "AKTIF"
                                    : "NONAKTIF"
                            }

                        </span>

                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn-small"
                            onclick="
                                editBarang(
                                    ${item.id_barang}
                                )
                            "
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="btn-small ${
                                statusAktif
                                    ? "btn-danger"
                                    : ""
                            }"
                            onclick="
                                ubahStatusBarang(
                                    ${item.id_barang},
                                    '${
                                        statusAktif
                                            ? "NONAKTIF"
                                            : "AKTIF"
                                    }'
                                )
                            "
                        >

                            ${
                                statusAktif
                                    ? "Nonaktifkan"
                                    : "Aktifkan"
                            }

                        </button>

                    </td>

                </tr>

            `;

        }
    );


    // =====================================================
    // SELESAI MEMBUAT TABEL
    // =====================================================

    html += `

                </tbody>

            </table>

        </div>

    `;


    // =====================================================
    // PAGINATION
    // =====================================================

    const totalData =
        count || 0;


    const totalHalaman =
        Math.ceil(
            totalData /
            dataPerHalamanBarang
        );


    if (totalHalaman > 1) {

        html += `

            <div
                style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    margin-top: 20px;
                    flex-wrap: wrap;
                "
            >

                <button
                    type="button"
                    class="btn-secondary"
                    ${
                        halaman <= 1
                            ? "disabled"
                            : ""
                    }
                    onclick="
                        tampilkanBarang(
                            '${safeQuery.replace(
                                /'/g,
                                "\\'"
                            )}',
                            '${kategori.replace(
                                /'/g,
                                "\\'"
                            )}',
                            ${halaman - 1}
                        )
                    "
                >
                    ← Sebelumnya
                </button>


                <span
                    style="
                        font-weight: 600;
                    "
                >
                    Halaman
                    ${halaman}
                    dari
                    ${totalHalaman}
                </span>


                <button
                    type="button"
                    class="btn-secondary"
                    ${
                        halaman >= totalHalaman
                            ? "disabled"
                            : ""
                    }
                    onclick="
                        tampilkanBarang(
                            '${safeQuery.replace(
                                /'/g,
                                "\\'"
                            )}',
                            '${kategori.replace(
                                /'/g,
                                "\\'"
                            )}',
                            ${halaman + 1}
                        )
                    "
                >
                    Berikutnya →
                </button>

            </div>

        `;

    }


    // =====================================================
    // TAMPILKAN KE HALAMAN
    // =====================================================

    container.innerHTML =
        html;

}

// =====================================================
// UBAH STATUS BARANG
// =====================================================

async function ubahStatusBarang(
    id,
    statusBaru
) {

    if (!cekSupabase()) {
        return;
    }


    // =====================================================
    // KONFIRMASI
    // =====================================================

    let pesan;


    if (statusBaru === "NONAKTIF") {

        pesan =
            "Barang akan dinonaktifkan.\n\n" +
            "Barang tidak dapat digunakan untuk transaksi baru,\n" +
            "tetapi riwayat transaksi tetap aman.\n\n" +
            "Lanjutkan?";

    } else {

        pesan =
            "Barang akan diaktifkan kembali.\n\n" +
            "Barang dapat digunakan untuk transaksi baru.\n\n" +
            "Lanjutkan?";

    }


    const yakin =
        confirm(
            pesan
        );


    if (!yakin) {
        return;
    }


    // =====================================================
    // UPDATE STATUS DI SUPABASE
    // =====================================================

   const {
    data: dataUpdate,
    error
} =
    await supabaseClient
        .from("barang")
        .update({
            status: statusBaru
        })
        .eq(
            "id_barang",
            id
        )
        .select(
            "id_barang, status"
        )
        .single();

    // =====================================================
    // CEK ERROR
    // =====================================================

    if (error) {

        console.error(
            "Gagal mengubah status barang:",
            error
        );

        alert(
            "Gagal mengubah status barang:\n\n" +
            error.message
        );

        return;

    }


    // =====================================================
    // BERHASIL
    // =====================================================

    if (statusBaru === "NONAKTIF") {

        alert(
            "Barang berhasil dinonaktifkan."
        );

    } else {

        alert(
            "Barang berhasil diaktifkan kembali."
        );

    }


    // =====================================================
    // REFRESH DATA BARANG
    // =====================================================

    await dataBarang();

}

// =====================================================
// GENERATE KODE BARANG OTOMATIS
// =====================================================

async function generateKodeBarang() {

    const {
        data,
        error
    } = await supabaseClient
        .from("barang")
        .select("kode_barang")
        .order("id_barang", {
            ascending: false
        })
        .limit(1);

    if (error) {

        console.error(
            "Gagal mengambil kode barang terakhir:",
            error
        );

        return "BRG001";
    }

    if (
        !data ||
        data.length === 0 ||
        !data[0].kode_barang
    ) {

        return "BRG001";
    }

    const kodeTerakhir =
        data[0].kode_barang;

    const nomorTerakhir =
        parseInt(
            kodeTerakhir.replace(
                "BRG",
                ""
            ),
            10
        );

    const nomorBaru =
        (nomorTerakhir || 0) + 1;

    return (
        "BRG" +
        String(nomorBaru).padStart(
            3,
            "0"
        )
    );
} 

// =====================================================
// TAMBAH BARANG
// =====================================================

function tambahBarang() {

    ubahJudul(
        "Tambah Barang"
    );


    aktifkanMenu(
        "Data Barang"
    );

    document.getElementById(
        "isi"
    ).innerHTML = `

        <div class="content-box">

            <div class="page-header">

                <div>

                    <h2>
                        Tambah Barang
                    </h2>

                    <p>
                        Masukkan data barang baru.
                    </p>

                </div>

            </div>


            <form
                onsubmit="simpanBarang(event)"
            >

                <div class="form-grid">


                    <div class="form-group">

                        <label>
                            Kode Barang
                        </label>

<input 
    type="text" 
    id="kodeBarang" 
    placeholder="Membuat kode otomatis..."
    readonly
    required
>

                    </div>


                    <div class="form-group">

                        <label>
                            Nama Barang
                        </label>

                        <input
                            type="text"
                            id="namaBarang"
                            placeholder="Nama barang"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Kategori
                        </label>

                        <input
                            type="text"
                            id="kategoriBarang"
                            placeholder="Contoh: Rumah"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Satuan
                        </label>

                        <input
                            type="text"
                            id="satuanBarang"
                            placeholder="Contoh: Unit"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Harga Beli
                        </label>

                        <input
                            type="number"
                            id="hargaBeli"
                            min="0"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Harga Jual
                        </label>

                        <input
                            type="number"
                            id="hargaJual"
                            min="0"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Stok Awal
                        </label>

                        <input
                            type="number"
                            id="stokBarang"
                            min="0"
                            value="0"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Stok Minimum
                        </label>

                        <input
                            type="number"
                            id="stokMinimum"
                            min="0"
                            value="0"
                            required
                        >

                    </div>


                </div>


                <div class="form-actions">

                    <button
                        type="button"
                        class="btn-secondary"
                        onclick="dataBarang()"
                    >
                        Batal
                    </button>


                    <button
                        type="submit"
                        class="btn-primary"
                    >
                        Simpan Barang
                    </button>

                </div>


            </form>

        </div>

    `;
        generateKodeBarang()
        .then(function(kode) {

            document.getElementById(
                "kodeBarang"
            ).value = kode;

        })
        .catch(function(error) {

            console.error(
                "Gagal membuat kode barang:",
                error
            );

            document.getElementById(
                "kodeBarang"
            ).value = "BRG001";

        });

}

// =====================================================
// SIMPAN BARANG
// =====================================================

async function simpanBarang(event) {

    event.preventDefault();

    // =============================================
    // CEK SUPABASE
    // =============================================

    if (!cekSupabase()) {
        return;
    }

    // =============================================
    // AMBIL NILAI FORM
    // =============================================

    const kodeBarang =
        document.getElementById("kodeBarang").value.trim();


    const namaBarang =
        document.getElementById("namaBarang").value.trim();


    const kategoriBarang =
        document.getElementById("kategoriBarang").value.trim();


    const satuanBarang =
        document.getElementById("satuanBarang").value.trim();


    const hargaBeli =
        Number(
            document.getElementById("hargaBeli").value
        );


    const hargaJual =
        Number(
            document.getElementById("hargaJual").value
        );


    const stokBarang =
        Number(
            document.getElementById("stokBarang").value
        );


    const stokMinimum =
        Number(
            document.getElementById("stokMinimum").value
        );


    // =============================================
    // VALIDASI
    // =============================================

    if (!kodeBarang) {

        alert(
            "Kode barang wajib diisi."
        );

        return;

    }


    if (!namaBarang) {

        alert(
            "Nama barang wajib diisi."
        );

        return;

    }


    if (!kategoriBarang) {

        alert(
            "Kategori barang wajib diisi."
        );

        return;

    }


    if (!satuanBarang) {

        alert(
            "Satuan barang wajib diisi."
        );

        return;

    }


    if (
        Number.isNaN(hargaBeli) ||
        hargaBeli < 0
    ) {

        alert(
            "Harga beli tidak valid."
        );

        return;

    }


    if (
        Number.isNaN(hargaJual) ||
        hargaJual < 0
    ) {

        alert(
            "Harga jual tidak valid."
        );

        return;

    }


    if (
        Number.isNaN(stokBarang) ||
        stokBarang < 0
    ) {

        alert(
            "Stok barang tidak valid."
        );

        return;

    }


    if (
        Number.isNaN(stokMinimum) ||
        stokMinimum < 0
    ) {

        alert(
            "Stok minimum tidak valid."
        );

        return;

    }


    // =============================================
    // DATA BARANG BARU
    // =============================================

    const dataBarangBaru = {

        kode_barang:
            kodeBarang,

        nama_barang:
            namaBarang,

        kategori:
            kategoriBarang,

        satuan:
            satuanBarang,

        harga_beli:
            hargaBeli,

        harga_jual:
            hargaJual,

        stok:
            stokBarang,

        stok_minimum:
            stokMinimum,

        status:
            "AKTIF"

    };


    console.log(
        "DATA YANG AKAN DISIMPAN:",
        dataBarangBaru
    );


    // =============================================
    // SIMPAN KE SUPABASE
    // =============================================

    const {
        data,
        error
    } =
        await supabaseClient
            .from("barang")
            .insert([
                dataBarangBaru
            ])
            .select();


    // =============================================
    // CEK ERROR
    // =============================================

    if (error) {

        console.error(
            "ERROR SIMPAN BARANG:",
            error
        );

        alert(
            "Gagal menyimpan barang:\n\n" +
            error.message
        );

        return;

    }


    // =============================================
    // CEK HASIL INSERT
    // =============================================

    console.log(
        "BARANG BERHASIL DISIMPAN:",
        data
    );


    if (
        !data ||
        data.length === 0
    ) {

        alert(
            "Data tidak masuk ke database."
        );

        return;

    }


    // =============================================
    // BERHASIL
    // =============================================

    alert(
        "Barang berhasil disimpan ke Supabase!"
    );


    // =============================================
    // KEMBALI KE DATA BARANG
    // =============================================

    await dataBarang();

}

// =====================================================
// EDIT BARANG
// =====================================================

async function editBarang(id) {

    if (!cekSupabase()) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("barang")
            .select("*")
            .eq(
                "id_barang",
                id
            )
            .single();


    if (error) {

        alert(
            "Gagal mengambil data barang:\n\n" +
            error.message
        );

        return;

    }


    ubahJudul(
        "Edit Barang"
    );


    aktifkanMenu(
        "Data Barang"
    );


    document.getElementById(
        "isi"
    ).innerHTML = `

        <div class="content-box">

            <div class="page-header">

                <div>

                    <h2>
                        Edit Barang
                    </h2>

                    <p>
                        Perbarui data barang.
                    </p>

                </div>

            </div>


            <form
                onsubmit="
                    updateBarang(
                        event,
                        ${data.id_barang}
                    )
                "
            >

                <div class="form-grid">


                    <div class="form-group">

                        <label>
                            Kode Barang
                        </label>

                        <input
                            type="text"
                            id="kodeBarang"
                            value="${escapeHtml(data.kode_barang)}"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Nama Barang
                        </label>

                        <input
                            type="text"
                            id="namaBarang"
                            value="${escapeHtml(data.nama_barang)}"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Kategori
                        </label>

                        <input
                            type="text"
                            id="kategoriBarang"
                            value="${escapeHtml(data.kategori)}"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Satuan
                        </label>

                        <input
                            type="text"
                            id="satuanBarang"
                            value="${escapeHtml(data.satuan)}"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Harga Beli
                        </label>

                        <input
                            type="number"
                            id="hargaBeli"
                            value="${data.harga_beli}"
                            min="0"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Harga Jual
                        </label>

                        <input
                            type="number"
                            id="hargaJual"
                            value="${data.harga_jual}"
                            min="0"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Stok Saat Ini
                        </label>

                        <input
                            type="number"
                            value="${data.stok}"
                            readonly
                        >

                        <small>
                            Stok diubah melalui Pembelian,
                            Penjualan, atau Penyesuaian Stok.
                        </small>

                    </div>


                    <div class="form-group">

                        <label>
                            Stok Minimum
                        </label>

                        <input
                            type="number"
                            id="stokMinimum"
                            value="${data.stok_minimum}"
                            min="0"
                            required
                        >

                    </div>


                </div>


                <div class="form-actions">

                    <button
                        type="button"
                        class="btn-secondary"
                        onclick="dataBarang()"
                    >
                        Batal
                    </button>


                    <button
                        type="submit"
                        class="btn-primary"
                    >
                        Simpan Perubahan
                    </button>

                </div>


            </form>

        </div>

    `;

}


// =====================================================
// UPDATE BARANG
// =====================================================

async function updateBarang(
    event,
    id
) {

    event.preventDefault();


    if (!cekSupabase()) {
        return;
    }


    const updateData = {

        kode_barang:
            document.getElementById(
                "kodeBarang"
            ).value.trim(),

        nama_barang:
            document.getElementById(
                "namaBarang"
            ).value.trim(),

        kategori:
            document.getElementById(
                "kategoriBarang"
            ).value.trim(),

        satuan:
            document.getElementById(
                "satuanBarang"
            ).value.trim(),

        harga_beli:
            Number(
                document.getElementById(
                    "hargaBeli"
                ).value
            ),

        harga_jual:
            Number(
                document.getElementById(
                    "hargaJual"
                ).value
            ),

        stok_minimum:
            Number(
                document.getElementById(
                    "stokMinimum"
                ).value
            )

    };


    const {
        error
    } =
        await supabaseClient
            .from("barang")
            .update(
                updateData
            )
            .eq(
                "id_barang",
                id
            );


    if (error) {

        alert(
            "Gagal mengubah barang:\n\n" +
            error.message
        );

        return;

    }


    alert(
        "Data barang berhasil diubah!"
    );


    await dataBarang();

}


// =====================================================
// HAPUS BARANG
// =====================================================

async function hapusBarang(id) {

    if (!cekSupabase()) {
        return;
    }


    const yakin =
        confirm(
            "Apakah kamu yakin ingin menghapus barang ini?"
        );


    if (!yakin) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("barang")
            .delete()
            .eq(
                "id_barang",
                id
            );


    if (error) {

        alert(
            "Gagal menghapus barang:\n\n" +
            error.message
        );

        return;

    }


    alert(
        "Barang berhasil dihapus."
    );


    await dataBarang();

}

// =====================================================
// DATA PEMASOK
// =====================================================

async function dataPemasok() {

    ubahJudul(
        "Data Pemasok"
    );


    aktifkanMenu(
        "Data Pemasok"
    );


    document.getElementById(
        "isi"
    ).innerHTML = `

        <div class="content-box">

            <div class="page-header">

                <div>

                    <h2>
                        Data Pemasok
                    </h2>

                    <p>
                        Mengelola data pemasok.
                    </p>

                </div>

                <button
                    class="btn-primary"
                    onclick="tambahPemasok()"
                >
                    + Tambah Pemasok
                </button>

            </div>


            <div
                id="tabelPemasok"
            >

                <div class="empty-state">
                    Memuat data...
                </div>

            </div>

        </div>

    `;


    await tampilkanPemasok();

}

// =====================================================
// TAMPILKAN PEMASOK
// =====================================================

let halamanPemasok = 1;
const dataPerHalamanPemasok = 10;

async function tampilkanPemasok(
    halaman = 1
) {

    const container =
        document.getElementById(
            "tabelPemasok"
        );

    if (!container) {
        return;
    }

    if (!cekSupabase()) {
        return;
    }

    halamanPemasok = halaman;

    // =====================================================
    // PAGINATION
    // =====================================================

    const mulai =
        (halaman - 1) *
        dataPerHalamanPemasok;

    const selesai =
        mulai +
        dataPerHalamanPemasok -
        1;

    const {
        data,
        error,
        count
    } =
        await supabaseClient
            .from("pemasok")
            .select(
                "*",
                {
                    count: "exact"
                }
            )
            .order(
                "kode_pemasok",
                {
                    ascending: true
                }
            )
            .range(
                mulai,
                selesai
            );

    // =====================================================
    // CEK ERROR
    // =====================================================

    if (error) {

        container.innerHTML = `

            <div class="empty-state">

                ${escapeHtml(
                    error.message
                )}

            </div>

        `;

        return;
    }

    // =====================================================
    // DATA KOSONG
    // =====================================================

    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                Belum ada data pemasok.

            </div>

        `;

        return;
    }

    // =====================================================
    // TABEL PEMASOK
    // =====================================================

    let html = `

        <div class="table-container">

            <table>

                <thead>

                    <tr>

                        <th>No</th>

                        <th>Kode Pemasok</th>

                        <th>Nama Pemasok</th>

                        <th>Alamat</th>

                        <th>No. Telepon</th>
                        <th>Aksi</th>

                    </tr>

                </thead>

                <tbody>

    `;

    // =====================================================
    // TAMPILKAN SETIAP PEMASOK
    // =====================================================

    data.forEach(
        function (
            item,
            index
        ) {

            const nomor =
                mulai +
                index +
                1;

            html += `

                <tr>

                    <td>
                        ${nomor}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.kode_pemasok
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.nama_pemasok
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.alamat || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.no_telepon || "-"
                        )}
                    </td>
<td>
    <button
        type="button"
        class="btn-primary"
        onclick="
            editPemasok(
                ${item.id_pemasok}
            )
        "
    >
        ✏️ Edit
    </button>
</td>
                </tr>

            `;

        }
    );

    // =====================================================
    // SELESAI MEMBUAT TABEL
    // =====================================================

    html += `

                </tbody>

            </table>

        </div>

    `;

    // =====================================================
    // PAGINATION
    // =====================================================

    const totalData =
        count || 0;

    const totalHalaman =
        Math.ceil(
            totalData /
            dataPerHalamanPemasok
        );

    if (totalHalaman > 1) {

        html += `

            <div
                style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    margin-top: 20px;
                    flex-wrap: wrap;
                "
            >

                <button
                    type="button"
                    class="btn-secondary"
                    ${
                        halaman <= 1
                            ? "disabled"
                            : ""
                    }
                    onclick="
                        tampilkanPemasok(
                            ${halaman - 1}
                        )
                    "
                >
                    ← Sebelumnya
                </button>

                <span
                    style="
                        font-weight: 600;
                    "
                >
                    Halaman
                    ${halaman}
                    dari
                    ${totalHalaman}
                </span>

                <button
                    type="button"
                    class="btn-secondary"
                    ${
                        halaman >= totalHalaman
                            ? "disabled"
                            : ""
                    }
                    onclick="
                        tampilkanPemasok(
                            ${halaman + 1}
                        )
                    "
                >
                    Berikutnya →
                </button>

            </div>

        `;

    }

    // =====================================================
    // TAMPILKAN KE HALAMAN
    // =====================================================

    container.innerHTML =
        html;
}

// =====================================================
// EDIT PEMASOK
// =====================================================

async function editPemasok(idPemasok) {

    const {
        data,
        error
    } = await supabaseClient
        .from("pemasok")
        .select("*")
        .eq(
            "id_pemasok",
            idPemasok
        )
        .single();

    if (error) {

        alert(
            "Gagal mengambil data pemasok:\n\n" +
            error.message
        );

        return;
    }

    document.getElementById(
        "isi"
    ).innerHTML = `

        <div class="content-box">

            <div class="page-header">

                <div>

                    <h2>
                        Edit Pemasok
                    </h2>

                    <p>
                        Ubah informasi pemasok.
                    </p>

                </div>

            </div>


            <form
                onsubmit="
                    simpanEditPemasok(
                        event,
                        ${idPemasok}
                    )
                "
            >

                <div class="form-grid">


                    <div class="form-group">

                        <label>
                            Kode Pemasok
                        </label>

                        <input
                            type="text"
                            id="editKodePemasok"
                            value="${escapeHtml(
                                data.kode_pemasok || ""
                            )}"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Nama Pemasok
                        </label>

                        <input
                            type="text"
                            id="editNamaPemasok"
                            value="${escapeHtml(
                                data.nama_pemasok || ""
                            )}"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Alamat
                        </label>

                        <input
                            type="text"
                            id="editAlamatPemasok"
                            value="${escapeHtml(
                                data.alamat || ""
                            )}"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            No. Telepon
                        </label>

                        <input
                            type="text"
                            id="editTeleponPemasok"
                            value="${escapeHtml(
                                data.no_telepon || ""
                            )}"
                        >

                    </div>


                </div>


                <div class="form-actions">

                    <button
                        type="button"
                        class="btn-secondary"
                        onclick="dataPemasok()"
                    >
                        Batal
                    </button>


                    <button
                        type="submit"
                        class="btn-primary"
                    >
                        💾 Simpan Perubahan
                    </button>

                </div>

            </form>

        </div>

    `;
}

// =====================================================
// GENERATE KODE PEMASOK OTOMATIS
// =====================================================

async function generateKodePemasok() {

    const {
        data,
        error
    } = await supabaseClient
        .from("pemasok")
        .select("kode_pemasok")
        .order("id_pemasok", {
            ascending: false
        })
        .limit(1);

    if (error) {

        console.error(
            "Gagal mengambil kode pemasok terakhir:",
            error
        );

        return "SUP001";
    }

    if (
        !data ||
        data.length === 0 ||
        !data[0].kode_pemasok
    ) {

        return "SUP001";
    }

    const kodeTerakhir =
        data[0].kode_pemasok;

    const nomorTerakhir =
        parseInt(
            kodeTerakhir.replace("SUP", ""),
            10
        );

    const nomorBaru =
        (nomorTerakhir || 0) + 1;

    return (
        "SUP" +
        String(nomorBaru).padStart(3, "0")
    );
} 

// =====================================================
// TAMBAH PEMASOK
// =====================================================

function tambahPemasok() {

    ubahJudul(
        "Tambah Pemasok"
    );


    aktifkanMenu(
        "Data Pemasok"
    );


    document.getElementById(
        "isi"
    ).innerHTML = `

        <div class="content-box">

            <div class="page-header">

                <div>

                    <h2>
                        Tambah Pemasok
                    </h2>

                    <p>
                        Masukkan data pemasok baru.
                    </p>

                </div>

            </div>


            <form
                onsubmit="simpanPemasok(event)"
            >

                <div class="form-grid">

                    <div class="form-group">

                        <label>
                            Kode Pemasok
                        </label>

                        <input
                            type="text"
                            id="kodePemasok"
                            placeholder="Membuat kode otomatis..."
                            readonly
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Nama Pemasok
                        </label>

                        <input
                            type="text"
                            id="namaPemasok"
                            placeholder="Nama pemasok"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Alamat
                        </label>

                        <input
                            type="text"
                            id="alamatPemasok"
                            placeholder="Alamat pemasok"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            No. Telepon
                        </label>

                        <input
                            type="text"
                            id="teleponPemasok"
                            placeholder="Nomor telepon"
                        >

                    </div>

                </div>


                <div class="form-actions">

                    <button
                        type="button"
                        class="btn-secondary"
                        onclick="dataPemasok()"
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        class="btn-primary"
                    >
                        Simpan Pemasok
                    </button>

                </div>

            </form>

        </div>

    `;


    // MEMBUAT KODE PEMASOK OTOMATIS

    generateKodePemasok()
        .then(function(kode) {

            const inputKode =
                document.getElementById(
                    "kodePemasok"
                );

            if (inputKode) {

                inputKode.value = kode;

            }

        })
        .catch(function(error) {

            console.error(
                "Gagal membuat kode pemasok:",
                error
            );

            const inputKode =
                document.getElementById(
                    "kodePemasok"
                );

            if (inputKode) {

                inputKode.value = "SUP001";

            }

        });

}

// =====================================================
// SIMPAN PEMASOK
// =====================================================

async function simpanPemasok(event) {

    event.preventDefault();


    if (!cekSupabase()) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("pemasok")
            .insert([

                {
                    kode_pemasok:
                        document.getElementById(
                            "kodePemasok"
                        ).value.trim(),

                    nama_pemasok:
                        document.getElementById(
                            "namaPemasok"
                        ).value.trim(),

                    alamat:
                        document.getElementById(
                            "alamatPemasok"
                        ).value.trim(),

                    no_telepon:
                        document.getElementById(
                            "teleponPemasok"
                        ).value.trim()
                }

            ]);


    if (error) {

        alert(
            "Gagal menyimpan pemasok:\n\n" +
            error.message
        );

        return;

    }


    alert(
        "Pemasok berhasil disimpan!"
    );


    await dataPemasok();

}

// =====================================================
// SIMPAN EDIT PEMASOK
// =====================================================

async function simpanEditPemasok(
    event,
    idPemasok
) {

    event.preventDefault();

    if (!cekSupabase()) {
        return;
    }

    const kodePemasok =
        document
            .getElementById(
                "editKodePemasok"
            )
            .value
            .trim();

    const namaPemasok =
        document
            .getElementById(
                "editNamaPemasok"
            )
            .value
            .trim();

    const alamat =
        document
            .getElementById(
                "editAlamatPemasok"
            )
            .value
            .trim();

    const noTelepon =
        document
            .getElementById(
                "editTeleponPemasok"
            )
            .value
            .trim();


    const {
        error
    } =
        await supabaseClient
            .from("pemasok")
            .update({

                kode_pemasok:
                    kodePemasok,

                nama_pemasok:
                    namaPemasok,

                alamat:
                    alamat,

                no_telepon:
                    noTelepon

            })
            .eq(
                "id_pemasok",
                idPemasok
            );


    if (error) {

        alert(
            "Gagal memperbarui pemasok:\n\n" +
            error.message
        );

        return;
    }


    alert(
        "Data pemasok berhasil diperbarui!"
    );


    await dataPemasok();
}

// =====================================================
// DATA PELANGGAN
// =====================================================

async function dataPelanggan() {

    ubahJudul(
        "Data Pelanggan"
    );


    aktifkanMenu(
        "Data Pelanggan"
    );


    document.getElementById(
        "isi"
    ).innerHTML = `

        <div class="content-box">

            <div class="page-header">

                <div>

                    <h2>
                        Data Pelanggan
                    </h2>

                    <p>
                        Mengelola data pelanggan.
                    </p>

                </div>

                <button
                    class="btn-primary"
                    onclick="tambahPelanggan()"
                >
                    + Tambah Pelanggan
                </button>

            </div>


            <div
                id="tabelPelanggan"
            >

                <div class="empty-state">
                    Memuat data...
                </div>

            </div>

        </div>

    `;


    await tampilkanPelanggan();

}

// =====================================================
// TAMPILKAN PELANGGAN
// =====================================================

let halamanPelanggan = 1;
const dataPerHalamanPelanggan = 10;

async function tampilkanPelanggan(
    halaman = 1
) {

    const container =
        document.getElementById(
            "tabelPelanggan"
        );

    if (!container) {
        return;
    }

    if (!cekSupabase()) {
        return;
    }

    halamanPelanggan = halaman;


    // =====================================================
    // PAGINATION
    // =====================================================

    const mulai =
        (halaman - 1) *
        dataPerHalamanPelanggan;

    const selesai =
        mulai +
        dataPerHalamanPelanggan -
        1;


    const {
        data,
        error,
        count
    } =
        await supabaseClient
            .from("pelanggan")
            .select(
                "*",
                {
                    count: "exact"
                }
            )
            .order(
                "kode_pelanggan",
                {
                    ascending: true
                }
            )
            .range(
                mulai,
                selesai
            );


    // =====================================================
    // CEK ERROR
    // =====================================================

    if (error) {

        container.innerHTML = `

            <div class="empty-state">

                ${escapeHtml(
                    error.message
                )}

            </div>

        `;

        return;
    }


    // =====================================================
    // DATA KOSONG
    // =====================================================

    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                Belum ada data pelanggan.

            </div>

        `;

        return;
    }


    // =====================================================
    // TABEL PELANGGAN
    // =====================================================

    let html = `

        <div class="table-container">

            <table>

                <thead>

                    <tr>

                        <th>No</th>

                        <th>Kode Pelanggan</th>

                        <th>Nama Pelanggan</th>

                        <th>Alamat</th>

                        <th>No. Telepon</th>

                        <th>Aksi</th>

                    </tr>

                </thead>

                <tbody>

    `;


    // =====================================================
    // TAMPILKAN SETIAP PELANGGAN
    // =====================================================

    data.forEach(
        function (
            item,
            index
        ) {

            const nomor =
                mulai +
                index +
                1;


            html += `

                <tr>

                    <td>
                        ${nomor}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.kode_pelanggan
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.nama_pelanggan
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.alamat || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.no_telepon || "-"
                        )}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn-primary"
                            onclick="
                                editPelanggan(
                                    ${item.id_pelanggan}
                                )
                            "
                        >
                            ✏️ Edit
                        </button>

                    </td>

                </tr>

            `;

        }
    );


    // =====================================================
    // SELESAI MEMBUAT TABEL
    // =====================================================

    html += `

                </tbody>

            </table>

        </div>

    `;


    // =====================================================
    // PAGINATION
    // =====================================================

    const totalData =
        count || 0;


    const totalHalaman =
        Math.ceil(
            totalData /
            dataPerHalamanPelanggan
        );


    if (totalHalaman > 1) {

        html += `

            <div
                style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    margin-top: 20px;
                    flex-wrap: wrap;
                "
            >

                <button
                    type="button"
                    class="btn-secondary"
                    ${
                        halaman <= 1
                            ? "disabled"
                            : ""
                    }
                    onclick="
                        tampilkanPelanggan(
                            ${halaman - 1}
                        )
                    "
                >
                    ← Sebelumnya
                </button>


                <span
                    style="
                        font-weight: 600;
                    "
                >
                    Halaman
                    ${halaman}
                    dari
                    ${totalHalaman}
                </span>


                <button
                    type="button"
                    class="btn-secondary"
                    ${
                        halaman >= totalHalaman
                            ? "disabled"
                            : ""
                    }
                    onclick="
                        tampilkanPelanggan(
                            ${halaman + 1}
                        )
                    "
                >
                    Berikutnya →
                </button>

            </div>

        `;

    }


    // =====================================================
    // TAMPILKAN KE HALAMAN
    // =====================================================

    container.innerHTML =
        html;

}

// =====================================================
// EDIT PELANGGAN
// =====================================================

async function editPelanggan(idPelanggan) {

    const { data, error } = await supabaseClient
        .from("pelanggan")
        .select("*")
        .eq("id_pelanggan", idPelanggan)
        .single();

    if (error) {

        alert(
            "Gagal mengambil data pelanggan:\n\n" +
            error.message
        );

        return;
    }

    document.getElementById("isi").innerHTML = `

        <div class="content-box">

            <div class="page-header">

                <div>

                    <h2>
                        Edit Pelanggan
                    </h2>

                    <p>
                        Ubah informasi pelanggan.
                    </p>

                </div>

            </div>


            <form
                onsubmit="simpanEditPelanggan(event, ${idPelanggan})"
            >

                <div class="form-grid">

                    <div class="form-group">

                        <label>
                            Kode Pelanggan
                        </label>

                        <input
                            type="text"
                            id="editKodePelanggan"
                            value="${escapeHtml(data.kode_pelanggan || "")}"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Nama Pelanggan
                        </label>

                        <input
                            type="text"
                            id="editNamaPelanggan"
                            value="${escapeHtml(data.nama_pelanggan || "")}"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Alamat
                        </label>

                        <input
                            type="text"
                            id="editAlamatPelanggan"
                            value="${escapeHtml(data.alamat || "")}"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            No. Telepon
                        </label>

                        <input
                            type="text"
                            id="editTeleponPelanggan"
                            value="${escapeHtml(data.no_telepon || "")}"
                        >

                    </div>

                </div>


                <div class="form-actions">

                    <button
                        type="button"
                        class="btn-secondary"
                        onclick="dataPelanggan()"
                    >
                        Batal
                    </button>


                    <button
                        type="submit"
                        class="btn-primary"
                    >
                        💾 Simpan Perubahan
                    </button>

                </div>

            </form>

        </div>

    `;
}

// =====================================================
// GENERATE KODE PELANGGAN OTOMATIS
// =====================================================

async function generateKodePelanggan() {

    const {
        data,
        error
    } = await supabaseClient
        .from("pelanggan")
        .select("kode_pelanggan")
        .order("id_pelanggan", {
            ascending: false
        })
        .limit(1);

    if (error) {

        console.error(
            "Gagal mengambil kode pelanggan terakhir:",
            error
        );

        return "PLG001";
    }

    if (
        !data ||
        data.length === 0 ||
        !data[0].kode_pelanggan
    ) {

        return "PLG001";
    }

    const kodeTerakhir =
        data[0].kode_pelanggan;

    const nomorTerakhir =
        parseInt(
            kodeTerakhir.replace("PLG", ""),
            10
        );

    const nomorBaru =
        (nomorTerakhir || 0) + 1;

    return (
        "PLG" +
        String(nomorBaru).padStart(3, "0")
    );
}

// =====================================================
// TAMBAH PELANGGAN
// =====================================================

function tambahPelanggan() {

    ubahJudul(
        "Tambah Pelanggan"
    );


    aktifkanMenu(
        "Data Pelanggan"
    );


    document.getElementById(
        "isi"
    ).innerHTML = `

        <div class="content-box">

            <div class="page-header">

                <div>

                    <h2>
                        Tambah Pelanggan
                    </h2>

                    <p>
                        Masukkan data pelanggan baru.
                    </p>

                </div>

            </div>


            <form
                onsubmit="simpanPelanggan(event)"
            >

                <div class="form-grid">

                    <div class="form-group">

                        <label>
                            Kode Pelanggan
                        </label>

                        <input
                            type="text"
                            id="kodePelanggan"
                            placeholder="Membuat kode otomatis..."
                            readonly
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Nama Pelanggan
                        </label>

                        <input
                            type="text"
                            id="namaPelanggan"
                            placeholder="Nama pelanggan"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Alamat
                        </label>

                        <input
                            type="text"
                            id="alamatPelanggan"
                            placeholder="Alamat pelanggan"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            No. Telepon
                        </label>

                        <input
                            type="text"
                            id="teleponPelanggan"
                            placeholder="Nomor telepon"
                        >

                    </div>

                </div>


                <div class="form-actions">

                    <button
                        type="button"
                        class="btn-secondary"
                        onclick="dataPelanggan()"
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        class="btn-primary"
                    >
                        Simpan Pelanggan
                    </button>

                </div>

            </form>

        </div>

    `;


    // MEMBUAT KODE PELANGGAN OTOMATIS

    generateKodePelanggan()
        .then(function(kode) {

            const inputKode =
                document.getElementById(
                    "kodePelanggan"
                );

            if (inputKode) {

                inputKode.value = kode;

            }

        })
        .catch(function(error) {

            console.error(
                "Gagal membuat kode pelanggan:",
                error
            );

            const inputKode =
                document.getElementById(
                    "kodePelanggan"
                );

            if (inputKode) {

                inputKode.value = "PLG001";

            }

        });

}

// =====================================================
// SIMPAN EDIT PELANGGAN
// =====================================================

async function simpanEditPelanggan(event, idPelanggan) {

    event.preventDefault();

    if (!cekSupabase()) {
        return;
    }

    const kodePelanggan =
        document.getElementById("editKodePelanggan")
            .value.trim();

    const namaPelanggan =
        document.getElementById("editNamaPelanggan")
            .value.trim();

    const alamat =
        document.getElementById("editAlamatPelanggan")
            .value.trim();

    const noTelepon =
        document.getElementById("editTeleponPelanggan")
            .value.trim();


    const { error } = await supabaseClient
        .from("pelanggan")
        .update({
            kode_pelanggan: kodePelanggan,
            nama_pelanggan: namaPelanggan,
            alamat: alamat,
            no_telepon: noTelepon
        })
        .eq("id_pelanggan", idPelanggan);


    if (error) {

        alert(
            "Gagal memperbarui pelanggan:\n\n" +
            error.message
        );

        return;
    }


    alert(
        "Data pelanggan berhasil diperbarui!"
    );


    await dataPelanggan();
} 

// =====================================================
// SIMPAN PELANGGAN
// =====================================================

async function simpanPelanggan(event) {

    event.preventDefault();


    if (!cekSupabase()) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("pelanggan")
            .insert([

                {
                    kode_pelanggan:
                        document.getElementById(
                            "kodePelanggan"
                        ).value.trim(),

                    nama_pelanggan:
                        document.getElementById(
                            "namaPelanggan"
                        ).value.trim(),

                    alamat:
                        document.getElementById(
                            "alamatPelanggan"
                        ).value.trim(),

                    no_telepon:
                        document.getElementById(
                            "teleponPelanggan"
                        ).value.trim()
                }

            ]);


    if (error) {

        alert(
            "Gagal menyimpan pelanggan:\n\n" +
            error.message
        );

        return;

    }


    alert(
        "Pelanggan berhasil disimpan!"
    );


    await dataPelanggan();

}


// =====================================================
// PEMBELIAN
// =====================================================

async function pembelian() {

    ubahJudul(
        "Pembelian"
    );


    aktifkanMenu(
        "Pembelian"
    );


    document.getElementById(
        "isi"
    ).innerHTML = `

        <div class="content-box">

            <div class="page-header">

                <div>

                    <h2>
                        Pembelian
                    </h2>

                    <p>
                        Mencatat transaksi
                        pembelian barang.
                    </p>

                </div>

                <button
                    class="btn-primary"
                    onclick="pembelianBaru()"
                >
                    + Pembelian Baru
                </button>

            </div>


            <div id="tabelPembelian">

                <div class="empty-state">
                    Memuat data pembelian...
                </div>

            </div>

        </div>

    `;


    await tampilkanPembelian();

}

/// =====================================================
// PEMBELIAN BARU
// =====================================================

window.pembelianBaru = async function pembelianBaru() {

    if (!cekSupabase()) {
        return;
    }


    ubahJudul(
        "Pembelian Baru"
    );


    aktifkanMenu(
        "Pembelian"
    );


    // =================================================
    // NOMOR PEMBELIAN OTOMATIS
    // =================================================

    const nomor =
        await buatNomorTransaksi(
            "pembelian",
            "nomor_pembelian",
            "PB-"
        );


    if (!nomor) {

        alert(
            "Nomor pembelian gagal dibuat."
        );

        return;

    }


    // =================================================
    // TANGGAL HARI INI
    // =================================================

    const tanggalHariIni =
        new Date()
            .toISOString()
            .split("T")[0];


    // =================================================
    // TAMPILKAN FORM
    // =================================================

    document.getElementById(
        "isi"
    ).innerHTML = `

        <div class="content-box">

            <div class="page-header">

                <div>

                    <h2>
                        Pembelian Baru
                    </h2>

                    <p>
                        Catat transaksi pembelian
                        barang dari pemasok.
                    </p>

                </div>

            </div>


            <form
                onsubmit="simpanPembelian(event)"
            >


                <!-- ================================= -->
                <!-- DATA TRANSAKSI -->
                <!-- ================================= -->

                <div class="form-grid">


                    <!-- NOMOR PEMBELIAN -->

                    <div class="form-group">

                        <label>
                            Nomor Pembelian
                        </label>

                        <input
                            type="text"
                            id="nomorPembelian"
                            value="${nomor}"
                            readonly
                        >

                    </div>


                    <!-- TANGGAL -->

                    <div class="form-group">

                        <label>
                            Tanggal Pembelian
                        </label>

                        <input
                            type="date"
                            id="tanggalPembelian"
                            value="${tanggalHariIni}"
                            required
                        >

                    </div>


                    <!-- ================================= -->
                    <!-- PEMASOK -->
                    <!-- ================================= -->

                    <div class="form-group">

                        <label>
                            Pemasok
                        </label>

                        <div class="lookup-wrapper">

                            <div class="lookup-input-wrap">

                                <input
                                    type="text"
                                    id="cariPemasokPembelian"
                                    class="lookup-input"
                                    autocomplete="off"
                                    placeholder="Ketik kode atau nama pemasok..."
                                >

                                <span class="lookup-search-icon">
                                    🔍
                                </span>

                            </div>


                            <input
                                type="hidden"
                                id="pemasokPembelian"
                            >


                            <div
                                id="hasilPemasokPembelian"
                                class="lookup-results"
                            ></div>

                        </div>


                        <div
                            id="detailPemasokPembelian"
                            class="lookup-selected"
                        ></div>

                    </div>


                    <!-- ================================= -->
                    <!-- BARANG -->
                    <!-- ================================= -->

                    <div class="form-group">

                        <label>
                            Barang
                        </label>

                        <div class="lookup-wrapper">

                            <div class="lookup-input-wrap">

                                <input
                                    type="text"
                                    id="cariBarangPembelian"
                                    class="lookup-input"
                                    autocomplete="off"
                                    placeholder="Ketik kode atau nama barang..."
                                >

                                <span class="lookup-search-icon">
                                    🔍
                                </span>

                            </div>


                            <input
                                type="hidden"
                                id="barangPembelian"
                            >


                            <div
                                id="hasilBarangPembelian"
                                class="lookup-results"
                            ></div>

                        </div>


                        <div
                            id="detailBarangPembelian"
                            class="lookup-selected"
                        ></div>

                    </div>


                    <!-- ================================= -->
                    <!-- JUMLAH -->
                    <!-- ================================= -->

                    <div class="form-group">

                        <label>
                            Jumlah
                        </label>

                        <input
                            type="number"
                            id="jumlahPembelian"
                            min="1"
                            value="1"
                            oninput="hitungSubtotalPembelian()"
                            required
                        >

                        <small id="infoStokPembelian">
                            Pilih barang terlebih dahulu.
                        </small>

                    </div>


                    <!-- ================================= -->
                    <!-- HARGA BELI -->
                    <!-- ================================= -->

                    <div class="form-group">

                        <label>
                            Harga Beli Transaksi
                        </label>

                        <input
                            type="number"
                            id="hargaPembelian"
                            min="0"
                            value="0"
                            oninput="hitungSubtotalPembelian()"
                            required
                        >

                        <small>
                            Harga diambil dari Data Barang
                            dan masih dapat disesuaikan
                            untuk transaksi ini.
                        </small>

                    </div>


                    <!-- ================================= -->
                    <!-- METODE PEMBAYARAN -->
                    <!-- ================================= -->

                    <div class="form-group">

                        <label>
                            Metode Pembayaran
                        </label>

                        <select
                            id="metodePembayaranPembelian"
                            required
                        >

                            <option value="TUNAI">
                                Tunai
                            </option>

                            <option value="KREDIT">
                                Kredit
                            </option>

                        </select>

                    </div>


                    <!-- ================================= -->
                    <!-- KETERANGAN -->
                    <!-- ================================= -->

                    <div class="form-group">

                        <label>
                            Keterangan Transaksi
                        </label>

                        <textarea
                            id="keteranganPembelian"
                            rows="3"
                            placeholder="Contoh: Pembelian stok boneka untuk persiapan Natal"
                        ></textarea>

                    </div>

                </div>


                <!-- ================================= -->
                <!-- RINGKASAN -->
                <!-- ================================= -->

                <div
                    id="ringkasanPembelian"
                    class="transaction-summary"
                >

                    <div class="transaction-summary-row">

                        <span>
                            Jumlah
                        </span>

                        <strong id="ringkasJumlahPembelian">
                            1
                        </strong>

                    </div>


                    <div class="transaction-summary-row">

                        <span>
                            Harga
                        </span>

                        <strong id="ringkasHargaPembelian">
                            Rp0
                        </strong>

                    </div>


                    <div
                        class="transaction-summary-row transaction-summary-total"
                    >

                        <span>
                            Total Pembelian
                        </span>

                        <strong id="ringkasTotalPembelian">
                            Rp0
                        </strong>

                    </div>

                </div>


                <!-- ================================= -->
                <!-- TOMBOL -->
                <!-- ================================= -->

                <div class="form-actions">

                    <button
                        type="button"
                        class="btn-secondary"
                        onclick="pembelian()"
                    >
                        Batal
                    </button>


                    <button
                        type="submit"
                        class="btn-primary"
                    >
                        Simpan Pembelian
                    </button>

                </div>


            </form>

        </div>

    `;


    // =================================================
    // PASANG LOOKUP PEMASOK
    // =================================================

    pasangLookup(
        "pemasokPembelian"
    );


    // =================================================
    // PASANG LOOKUP BARANG
    // =================================================

    pasangLookup(
        "barangPembelian"
    );


    // =================================================
    // HITUNG SUBTOTAL AWAL
    // =================================================

    hitungSubtotalPembelian();

}; 

// =====================================================
// PAGINATION PEMBELIAN
// =====================================================

let halamanPembelian = 1;
const dataPerHalamanPembelian = 10;


// =====================================================
// TAMPILKAN PEMBELIAN
// =====================================================

async function tampilkanPembelian(halaman = 1) {

    const container =
        document.getElementById(
            "tabelPembelian"
        );


    if (!container) {
        return;
    }


    if (!cekSupabase()) {
        return;
    }


    // =================================================
    // AMBIL DATA PEMBELIAN
    // =================================================

    const {
        data,
        error
    } =
        await supabaseClient
            .from("pembelian")
            .select(`
                id_pembelian,
                nomor_pembelian,
                tanggal_pembelian,
                total_pembelian,

                pemasok (
                    kode_pemasok,
                    nama_pemasok
                ),

                detail_pembelian (
                    jumlah,
                    harga_beli,
                    subtotal,

                    barang (
                        kode_barang,
                        nama_barang
                    )
                )
            `)
            .order(
                "nomor_pembelian",
                {
                    ascending: true
                }
            );


    // =================================================
    // CEK ERROR
    // =================================================

    if (error) {

        console.error(
            "ERROR TAMPILKAN PEMBELIAN:",
            error
        );


        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Gagal mengambil data
                </h3>

                <p>
                    ${escapeHtml(error.message)}
                </p>

            </div>

        `;

        return;
    }


    // =================================================
    // JIKA BELUM ADA DATA
    // =================================================

    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Belum Ada Pembelian
                </h3>

                <p>
                    Silakan tambahkan
                    transaksi pembelian.
                </p>

            </div>

        `;

        return;
    }


    // =================================================
    // HITUNG PAGINATION
    // =================================================

    const totalData =
        data.length;

    const totalHalaman =
        Math.ceil(
            totalData /
            dataPerHalamanPembelian
        );


    // Pastikan halaman valid

    if (halaman < 1) {
        halaman = 1;
    }

    if (halaman > totalHalaman) {
        halaman = totalHalaman;
    }


    halamanPembelian =
        halaman;


    const mulai =
        (
            halaman - 1
        ) *
        dataPerHalamanPembelian;


    const selesai =
        mulai +
        dataPerHalamanPembelian;


    const dataHalaman =
        data.slice(
            mulai,
            selesai
        );


    // =================================================
    // TABEL PEMBELIAN
    // =================================================

    let html = `

        <div class="table-container">

            <table>

                <thead>

                    <tr>

                        <th>
                            No
                        </th>

                        <th>
                            Nomor Pembelian
                        </th>

                        <th>
                            Tanggal
                        </th>

                        <th>
                            Pemasok
                        </th>

                        <th>
                            Nama Barang
                        </th>

                        <th>
                            Jumlah
                        </th>

                        <th>
                            Harga Beli
                        </th>

                        <th>
                            Total Pembelian
                        </th>

                        <th>
                            Aksi
                        </th>

                    </tr>

                </thead>


                <tbody>

    `;


    // =================================================
    // TAMPILKAN DATA HALAMAN
    // =================================================

    dataHalaman.forEach(
        function (
            item,
            index
        ) {


            // =========================================
            // AMBIL DETAIL PEMBELIAN
            // =========================================

            const detail =
                item.detail_pembelian &&
                item.detail_pembelian.length
                    ? item.detail_pembelian[0]
                    : null;


            // =========================================
            // DATA PEMASOK
            // =========================================

            const pemasok =
                item.pemasok
                    ? (
                        item.pemasok.kode_pemasok +
                        " - " +
                        item.pemasok.nama_pemasok
                    )
                    : "-";


            // =========================================
            // NAMA BARANG
            // =========================================

            const namaBarang =
                detail &&
                detail.barang
                    ? detail.barang.nama_barang
                    : "-";


            // =========================================
            // JUMLAH
            // =========================================

            const jumlah =
                detail
                    ? Number(
                        detail.jumlah
                    )
                    : 0;


            // =========================================
            // HARGA BELI
            // =========================================

            const hargaBeli =
                detail
                    ? Number(
                        detail.harga_beli || 0
                    )
                    : 0;


            // =========================================
            // TOTAL PEMBELIAN
            // =========================================

            const total =
                Number(
                    item.total_pembelian || 0
                );


            // =========================================
            // BARIS TABEL
            // =========================================

            html += `

                <tr>

                    <td>
                        ${mulai + index + 1}
                    </td>


                    <td>

                        <strong>
                            ${escapeHtml(
                                item.nomor_pembelian
                            )}
                        </strong>

                    </td>


                    <td>

                        ${formatTanggal(
                            item.tanggal_pembelian
                        )}

                    </td>


                    <td>

                        ${escapeHtml(
                            pemasok
                        )}

                    </td>


                    <td>

                        ${escapeHtml(
                            namaBarang
                        )}

                    </td>


                    <td>

                        ${jumlah}

                    </td>


                    <td>

                        ${formatRupiah(
                            hargaBeli
                        )}

                    </td>


                    <td>

                        ${formatRupiah(
                            total
                        )}

                    </td>


                    <td>

                        <button
                            type="button"
                            class="btn-danger"
                            onclick="hapusPembelian(${item.id_pembelian})"
                        >
                            Hapus
                        </button>

                    </td>

                </tr>

            `;

        }
    );


    // =================================================
    // SELESAI TABEL
    // =================================================

    html += `

                </tbody>

            </table>

        </div>


        <!-- =========================================
             PAGINATION
        ========================================== -->

        <div
            class="pagination"
            style="
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
                margin-top: 20px;
                flex-wrap: wrap;
            "
        >

            <button
                type="button"
                class="btn-secondary"
                onclick="tampilkanPembelian(${halaman - 1})"
                ${halaman === 1 ? "disabled" : ""}
            >
                ← Sebelumnya
            </button>


            <span
                style="
                    padding: 8px 14px;
                    font-weight: 600;
                "
            >
                Halaman ${halaman}
                dari ${totalHalaman}
            </span>


            <button
                type="button"
                class="btn-secondary"
                onclick="tampilkanPembelian(${halaman + 1})"
                ${halaman === totalHalaman ? "disabled" : ""}
            >
                Berikutnya →
            </button>

        </div>

    `;


    // =================================================
    // TAMPILKAN KE HALAMAN
    // =================================================

    container.innerHTML =
        html;

}

// =====================================================
// HAPUS PEMBELIAN
// =====================================================

async function hapusPembelian(idPembelian) {

    if (!cekSupabase()) {
        return;
    }


    // =================================================
    // AMBIL DATA PEMBELIAN
    // =================================================

    const {
        data: pembelianData,
        error: errorAmbil
    } =
        await supabaseClient
            .from("pembelian")
            .select(`
                id_pembelian,
                nomor_pembelian,
                total_pembelian,

                detail_pembelian (
                    jumlah,

                    barang (
                        nama_barang
                    )
                )
            `)
            .eq(
                "id_pembelian",
                idPembelian
            )
            .single();


    if (errorAmbil) {

        console.error(
            "ERROR AMBIL PEMBELIAN:",
            errorAmbil
        );


        alert(
            "Data pembelian tidak ditemukan:\n\n" +
            errorAmbil.message
        );

        return;
    }


    const nomor =
        pembelianData.nomor_pembelian;


    const detail =
        pembelianData.detail_pembelian &&
        pembelianData.detail_pembelian.length
            ? pembelianData.detail_pembelian[0]
            : null;


    const namaBarang =
        detail &&
        detail.barang
            ? detail.barang.nama_barang
            : "-";


    const jumlah =
        detail
            ? Number(detail.jumlah)
            : 0;


    // =================================================
    // KONFIRMASI
    // =================================================

    const yakin =
        confirm(

            "Apakah kamu yakin ingin menghapus pembelian ini?\n\n" +

            "Nomor Pembelian: " +
            nomor +

            "\nBarang: " +
            namaBarang +

            "\nJumlah: " +
            jumlah +

            "\nTotal: " +
            formatRupiah(
                pembelianData.total_pembelian
            ) +

            "\n\n" +

            "Stok akan dikembalikan " +
            "seperti sebelum pembelian.\n" +

            "Jurnal pembelian juga akan dihapus."
        );


    if (!yakin) {
        return;
    }


    // =================================================
    // HAPUS DETAIL PEMBELIAN
    // =================================================
    // Trigger database akan otomatis
    // mengurangi stok kembali.
    // =================================================

    const {
        error: errorDetail
    } =
        await supabaseClient
            .from("detail_pembelian")
            .delete()
            .eq(
                "id_pembelian",
                idPembelian
            );


    if (errorDetail) {

        console.error(
            "ERROR HAPUS DETAIL PEMBELIAN:",
            errorDetail
        );


        alert(
            "Gagal menghapus detail pembelian:\n\n" +
            errorDetail.message
        );

        return;
    }


    // =================================================
    // HAPUS HEADER PEMBELIAN
    // =================================================
    // Trigger database akan otomatis
    // menghapus jurnal pembelian.
    // =================================================

    const {
        error: errorPembelian
    } =
        await supabaseClient
            .from("pembelian")
            .delete()
            .eq(
                "id_pembelian",
                idPembelian
            );


    if (errorPembelian) {

        console.error(
            "ERROR HAPUS PEMBELIAN:",
            errorPembelian
        );


        alert(
            "Gagal menghapus pembelian:\n\n" +
            errorPembelian.message
        );

        return;
    }


    // =================================================
    // BERHASIL
    // =================================================

    alert(
        "Pembelian berhasil dihapus.\n\n" +
        "✓ Pembelian dihapus.\n" +
        "✓ Stok dikembalikan.\n" +
        "✓ Jurnal pembelian dihapus."
    );


    await pembelian();

}

// =====================================================
// SIMPAN PEMBELIAN
// =====================================================

async function simpanPembelian(event) {

    event.preventDefault();


    if (!cekSupabase()) {
        return;
    }


    // =================================================
    // AMBIL DATA FORM
    // =================================================

    const nomor =
        document.getElementById(
            "nomorPembelian"
        ).value.trim();


    const tanggal =
        document.getElementById(
            "tanggalPembelian"
        ).value;


    const idPemasok =
        Number(
            document.getElementById(
                "pemasokPembelian"
            ).value
        );


    const idBarang =
        Number(
            document.getElementById(
                "barangPembelian"
            ).value
        );


    const jumlah =
        Number(
            document.getElementById(
                "jumlahPembelian"
            ).value
        );


    const harga =
        Number(
            document.getElementById(
                "hargaPembelian"
            ).value
        );


    const metodePembayaran =
        document.getElementById(
            "metodePembayaranPembelian"
        ).value;


    // =================================================
    // KETERANGAN TRANSAKSI
    // =================================================

    const keteranganElement =
        document.getElementById(
            "keteranganPembelian"
        );


    const keterangan =
        keteranganElement
            ? keteranganElement.value.trim()
            : "";


    const subtotal =
        jumlah * harga;


    // =================================================
    // VALIDASI
    // =================================================

    if (!nomor) {

        alert(
            "Nomor pembelian tidak boleh kosong."
        );

        return;
    }


    if (!tanggal) {

        alert(
            "Tanggal pembelian wajib diisi."
        );

        return;
    }


    if (!idPemasok) {

        alert(
            "Silakan pilih pemasok terlebih dahulu."
        );

        return;
    }


    if (!idBarang) {

        alert(
            "Silakan pilih barang terlebih dahulu."
        );

        return;
    }


    if (!jumlah || jumlah <= 0) {

        alert(
            "Jumlah pembelian harus lebih dari 0."
        );

        return;
    }


    if (harga < 0) {

        alert(
            "Harga beli tidak boleh negatif."
        );

        return;
    }


    if (subtotal <= 0) {

        alert(
            "Total pembelian harus lebih dari 0."
        );

        return;
    }


    // =================================================
    // SIMPAN TRANSAKSI PEMBELIAN
    // =================================================

    const hasilPembelian =
        await supabaseClient
            .from("pembelian")
            .insert([
                {
                    nomor_pembelian:
                        nomor,

                    tanggal_pembelian:
                        tanggal,

                    id_pemasok:
                        idPemasok,

                    total_pembelian:
                        subtotal,

                    keterangan:
                        keterangan || null
                }
            ])
            .select()
            .single();


    if (hasilPembelian.error) {

        console.error(
            "ERROR SIMPAN PEMBELIAN:",
            hasilPembelian.error
        );


        alert(
            "Pembelian gagal disimpan:\n" +
            hasilPembelian.error.message
        );

        return;
    }


    const idPembelian =
        hasilPembelian.data.id_pembelian;


    // =================================================
    // AMBIL AKUN UNTUK JURNAL
    // =================================================

    const hasilAkun =
        await supabaseClient
            .from("akun")
            .select(
                "id_akun, kode_akun, nama_akun"
            )
            .in(
                "kode_akun",
                [
                    "1-1100",
                    "1-1000",
                    "2-1000"
                ]
            );


    if (hasilAkun.error) {

        console.error(
            "ERROR AMBIL AKUN:",
            hasilAkun.error
        );


        alert(
            "Pembelian tersimpan, tetapi akun jurnal gagal diambil."
        );

        return;
    }


    const akunPersediaan =
        hasilAkun.data.find(
            akun =>
                akun.kode_akun === "1-1100"
        );


    const akunKas =
        hasilAkun.data.find(
            akun =>
                akun.kode_akun === "1-1000"
        );


    const akunUtang =
        hasilAkun.data.find(
            akun =>
                akun.kode_akun === "2-1000"
        );


    if (!akunPersediaan) {

        alert(
            "Akun Persediaan Barang tidak ditemukan."
        );

        return;
    }


    let akunKredit;


    if (metodePembayaran === "TUNAI") {

        akunKredit =
            akunKas;

    } else {

        akunKredit =
            akunUtang;

    }


    if (!akunKredit) {

        alert(
            "Akun untuk metode pembayaran tidak ditemukan."
        );

        return;
    }


    // =================================================
    // BUAT JURNAL PEMBELIAN
    // =================================================

    const dataJurnalPembelian = [

        {
            tanggal_jurnal:
                tanggal,

            nomor_bukti:
                nomor,

            sumber_transaksi:
                "PEMBELIAN",

            id_akun:
                akunPersediaan.id_akun,

            keterangan:
                keterangan || null,

            debit:
                subtotal,

            kredit:
                0
        },


        {
            tanggal_jurnal:
                tanggal,

            nomor_bukti:
                nomor,

            sumber_transaksi:
                "PEMBELIAN",

            id_akun:
                akunKredit.id_akun,

            keterangan:
                keterangan || null,

            debit:
                0,

            kredit:
                subtotal
        }

    ];


    const hasilJurnal =
        await supabaseClient
            .from("jurnal_umum")
            .insert(
                dataJurnalPembelian
            );


    if (hasilJurnal.error) {

        console.error(
            "ERROR SIMPAN JURNAL:",
            hasilJurnal.error
        );


        alert(
            "Pembelian tersimpan, tetapi jurnal gagal dibuat:\n" +
            hasilJurnal.error.message
        );

        return;
    }


    // =================================================
    // SIMPAN DETAIL PEMBELIAN
    // =================================================
    // Trigger database akan otomatis
    // menambah stok barang.
    // =================================================

    const hasilDetail =
        await supabaseClient
            .from("detail_pembelian")
            .insert([
                {
                    id_pembelian:
                        idPembelian,

                    id_barang:
                        idBarang,

                    jumlah:
                        jumlah,

                    harga_beli:
                        harga,

                    subtotal:
                        subtotal
                }
            ]);


    if (hasilDetail.error) {

        console.error(
            "ERROR SIMPAN DETAIL PEMBELIAN:",
            hasilDetail.error
        );


        alert(
            "Transaksi pembelian gagal diselesaikan:\n" +
            hasilDetail.error.message
        );

        return;
    }


    // =================================================
    // BERHASIL
    // =================================================

    alert(
        "Pembelian berhasil disimpan."
    );


    // Kembali ke halaman Pembelian
    await pembelian();

}

// =====================================================
// PEMASANG LOOKUP
// =====================================================

function pasangLookup(type) {

    const config =
        lookupConfig[type];


    if (!config) {
        return;
    }


    const input =
        document.getElementById(
            config.inputId
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        function () {

            const query =
                this.value.trim();


            clearTimeout(
                lookupTimers[type]
            );


            resetLookupSelection(
                type
            );


            if (!query) {

                sembunyikanLookup(
                    type
                );

                return;

            }


            tampilkanLoadingLookup(
                type
            );


            lookupTimers[type] =
                setTimeout(
                    function () {

                        cariLookup(
                            type,
                            query
                        );

                    },
                    300
                );

        }
    );


    input.addEventListener(
        "focus",
        function () {

            const query =
                this.value.trim();


            if (query) {

                cariLookup(
                    type,
                    query
                );

            }

        }
    );

}

// =====================================================
// CARI LOOKUP
// =====================================================

async function cariLookup(
    type,
    query
) {

    if (
        typeof supabaseClient ===
        "undefined" ||
        !supabaseClient
    ) {

        tampilkanPesanLookup(
            type,
            "Supabase belum terhubung."
        );

        return;

    }


    const safeQuery =
        bersihkanQueryPencarian(
            query
        );


    if (!safeQuery) {

        sembunyikanLookup(
            type
        );

        return;

    }


    lookupRequestToken[type] =
        (lookupRequestToken[type] || 0) + 1;


    const token =
        lookupRequestToken[type];


    let request;


    const pattern =
        `%${safeQuery}%`;


    // =================================================
    // BARANG PEMBELIAN & PENJUALAN
    // HANYA BARANG AKTIF
    // =================================================

    if (
        type ===
        "barangPembelian" ||
        type ===
        "barangPenjualan"
    ) {

        request =
            supabaseClient
                .from("barang")
                .select(`
                    id_barang,
                    kode_barang,
                    nama_barang,
                    kategori,
                    satuan,
                    harga_beli,
                    harga_jual,
                    stok,
                    stok_minimum,
                    status
                `)
                .eq(
                    "status",
                    "AKTIF"
                )
                .or(
                    `kode_barang.ilike.${pattern},nama_barang.ilike.${pattern},kategori.ilike.${pattern}`
                )
                .order(
                    "kode_barang"
                )
                .limit(
                    LOOKUP_LIMIT
                );

    }


    // =================================================
    // PEMASOK
    // =================================================

    if (
        type ===
        "pemasokPembelian"
    ) {

        request =
            supabaseClient
                .from("pemasok")
                .select(`
                    id_pemasok,
                    kode_pemasok,
                    nama_pemasok,
                    alamat,
                    no_telepon
                `)
                .or(
                    `kode_pemasok.ilike.${pattern},nama_pemasok.ilike.${pattern}`
                )
                .order(
                    "kode_pemasok"
                )
                .limit(
                    LOOKUP_LIMIT
                );

    }


    // =================================================
    // PELANGGAN
    // =================================================

    if (
        type ===
        "pelangganPenjualan"
    ) {

        request =
            supabaseClient
                .from("pelanggan")
                .select(`
                    id_pelanggan,
                    kode_pelanggan,
                    nama_pelanggan,
                    alamat,
                    no_telepon
                `)
                .or(
                    `kode_pelanggan.ilike.${pattern},nama_pelanggan.ilike.${pattern}`
                )
                .order(
                    "kode_pelanggan"
                )
                .limit(
                    LOOKUP_LIMIT
                );

    }


    if (!request) {
        return;
    }


    const {
        data,
        error
    } =
        await request;


    if (
        token !==
        lookupRequestToken[type]
    ) {

        return;

    }


    if (error) {

        console.error(
            "ERROR LOOKUP:",
            error
        );

        tampilkanPesanLookup(
            type,
            error.message
        );

        return;

    }


    tampilkanHasilLookup(
        type,
        data || []
    );

}

// =====================================================
// LOADING LOOKUP
// =====================================================

function tampilkanLoadingLookup(type) {

    const config =
        lookupConfig[type];


    const results =
        document.getElementById(
            config.resultsId
        );


    if (!results) {
        return;
    }


    results.innerHTML = `

        <div class="lookup-loading">
            🔍 Mencari data...
        </div>

    `;


    results.classList.add(
        "open"
    );

}


// =====================================================
// PESAN LOOKUP
// =====================================================

function tampilkanPesanLookup(
    type,
    pesan
) {

    const config =
        lookupConfig[type];


    const results =
        document.getElementById(
            config.resultsId
        );


    if (!results) {
        return;
    }


    results.innerHTML = `

        <div class="lookup-message">
            ${escapeHtml(pesan)}
        </div>

    `;


    results.classList.add(
        "open"
    );

}


// =====================================================
// HASIL LOOKUP
// =====================================================

function tampilkanHasilLookup(
    type,
    data
) {

    const config =
        lookupConfig[type];


    const results =
        document.getElementById(
            config.resultsId
        );


    if (!results) {
        return;
    }


    lookupCache[type] =
        data;


    if (
        !data ||
        data.length === 0
    ) {

        results.innerHTML = `

            <div class="lookup-message">
                Data tidak ditemukan.
            </div>

        `;


        results.classList.add(
            "open"
        );


        return;

    }


    let html = "";


    data.forEach(
        function (
            item,
            index
        ) {

            if (
                type ===
                "barangPembelian" ||
                type ===
                "barangPenjualan"
            ) {

                html += `

                    <button
                        type="button"
                        class="lookup-result"
                        data-index="${index}"
                    >

                        <div class="lookup-result-code">
                            ${escapeHtml(
                                item.kode_barang
                            )}
                        </div>

                        <div class="lookup-result-name">
                            ${escapeHtml(
                                item.nama_barang
                            )}
                        </div>

                        <div class="lookup-result-info">

                            ${
                                escapeHtml(
                                    item.kategori
                                )
                            }

                            &nbsp; • &nbsp;

                            Stok:
                            ${item.stok}

                            &nbsp; • &nbsp;

                            ${
                                type ===
                                "barangPembelian"
                                    ? formatRupiah(
                                        item.harga_beli
                                    )
                                    : formatRupiah(
                                        item.harga_jual
                                    )
                            }

                        </div>

                    </button>

                `;

            }


            if (
                type ===
                "pemasokPembelian"
            ) {

                html += `

                    <button
                        type="button"
                        class="lookup-result"
                        data-index="${index}"
                    >

                        <div class="lookup-result-code">
                            ${escapeHtml(
                                item.kode_pemasok
                            )}
                        </div>

                        <div class="lookup-result-name">
                            ${escapeHtml(
                                item.nama_pemasok
                            )}
                        </div>

                        <div class="lookup-result-info">
                            ${escapeHtml(
                                item.no_telepon ||
                                item.alamat ||
                                "-"
                            )}
                        </div>

                    </button>

                `;

            }


            if (
                type ===
                "pelangganPenjualan"
            ) {

                html += `

                    <button
                        type="button"
                        class="lookup-result"
                        data-index="${index}"
                    >

                        <div class="lookup-result-code">
                            ${escapeHtml(
                                item.kode_pelanggan
                            )}
                        </div>

                        <div class="lookup-result-name">
                            ${escapeHtml(
                                item.nama_pelanggan
                            )}
                        </div>

                        <div class="lookup-result-info">
                            ${escapeHtml(
                                item.no_telepon ||
                                item.alamat ||
                                "-"
                            )}
                        </div>

                    </button>

                `;

            }

        }
    );


    results.innerHTML =
        html;


    results.classList.add(
        "open"
    );


    const tombol =
        results.querySelectorAll(
            ".lookup-result"
        );


    tombol.forEach(
        function (
            button
        ) {

            button.addEventListener(
                "click",
                function () {

                    const index =
                        Number(
                            this.dataset.index
                        );


                    pilihLookup(
                        type,
                        index
                    );

                }
            );

        }
    );

}


// =====================================================
// PILIH LOOKUP
// =====================================================

function pilihLookup(
    type,
    index
) {

    const item =
        lookupCache[type][index];


    if (!item) {
        return;
    }


    lookupSelected[type] =
        item;


    const config =
        lookupConfig[type];


    const input =
        document.getElementById(
            config.inputId
        );


    const hidden =
        document.getElementById(
            config.hiddenId
        );


    const detail =
        document.getElementById(
            config.selectedId
        );


    if (
        type ===
        "pemasokPembelian"
    ) {

        input.value =
            item.kode_pemasok +
            " — " +
            item.nama_pemasok;


        hidden.value =
            item.id_pemasok;


        detail.innerHTML = `

            <div class="lookup-selected-title">
                🏢 ${escapeHtml(
                    item.nama_pemasok
                )}
            </div>

            <div class="lookup-selected-info">

                Kode:
                <strong>
                    ${escapeHtml(
                        item.kode_pemasok
                    )}
                </strong>

                <br>

                Telepon:
                ${escapeHtml(
                    item.no_telepon || "-"
                )}

            </div>

        `;

    }


    if (
        type ===
        "pelangganPenjualan"
    ) {

        input.value =
            item.kode_pelanggan +
            " — " +
            item.nama_pelanggan;


        hidden.value =
            item.id_pelanggan;


        detail.innerHTML = `

            <div class="lookup-selected-title">
                👤 ${escapeHtml(
                    item.nama_pelanggan
                )}
            </div>

            <div class="lookup-selected-info">

                Kode:
                <strong>
                    ${escapeHtml(
                        item.kode_pelanggan
                    )}
                </strong>

                <br>

                Telepon:
                ${escapeHtml(
                    item.no_telepon || "-"
                )}

            </div>

        `;

    }


    if (
        type ===
        "barangPembelian"
    ) {

        input.value =
            item.kode_barang +
            " — " +
            item.nama_barang;


        hidden.value =
            item.id_barang;


        detail.innerHTML = `

            <div class="lookup-selected-title">
                📦 ${escapeHtml(
                    item.nama_barang
                )}
            </div>

            <div class="lookup-selected-info">

                Kode:
                <strong>
                    ${escapeHtml(
                        item.kode_barang
                    )}
                </strong>

                <br>

                Kategori:
                ${escapeHtml(
                    item.kategori
                )}

                <br>

                Stok sekarang:
                <strong>
                    ${item.stok}
                </strong>

                ${escapeHtml(
                    item.satuan
                )}

            </div>

        `;


        document.getElementById(
            "hargaPembelian"
        ).value =
            Number(
                item.harga_beli
            ) || 0;


        document.getElementById(
            "infoStokPembelian"
        ).textContent =
            "Stok saat ini: " +
            item.stok +
            " " +
            item.satuan;


        hitungSubtotalPembelian();

    }


    if (
        type ===
        "barangPenjualan"
    ) {

        input.value =
            item.kode_barang +
            " — " +
            item.nama_barang;


        hidden.value =
            item.id_barang;


        detail.innerHTML = `

            <div class="lookup-selected-title">
                📦 ${escapeHtml(
                    item.nama_barang
                )}
            </div>

            <div class="lookup-selected-info">

                Kode:
                <strong>
                    ${escapeHtml(
                        item.kode_barang
                    )}
                </strong>

                <br>

                Kategori:
                ${escapeHtml(
                    item.kategori
                )}

                <br>

                Stok tersedia:
                <strong>
                    ${item.stok}
                </strong>

                ${escapeHtml(
                    item.satuan
                )}

            </div>

        `;


        document.getElementById(
            "hargaPenjualan"
        ).value =
            Number(
                item.harga_jual
            ) || 0;


        const jumlah =
            document.getElementById(
                "jumlahPenjualan"
            );


        const info =
            document.getElementById(
                "infoStokPenjualan"
            );


        if (
            item.stok <= 0
        ) {

            jumlah.disabled =
                true;


            jumlah.value =
                0;


            info.innerHTML = `

                <span class="stok-habis">
                    Stok habis.
                </span>

            `;

        }

        else {

            jumlah.disabled =
                false;


            jumlah.min =
                1;


            jumlah.max =
                item.stok;


            if (
                Number(
                    jumlah.value
                ) < 1
            ) {

                jumlah.value =
                    1;

            }


            info.innerHTML = `

                <span class="stok-aman">
                    Stok tersedia:
                    ${item.stok}
                    ${escapeHtml(
                        item.satuan
                    )}
                </span>

            `;

        }


        hitungSubtotalPenjualan();

    }


    detail.classList.add(
        "show"
    );


    sembunyikanLookup(
        type
    );

}


// =====================================================
// RESET LOOKUP SELECTION
// =====================================================

function resetLookupSelection(
    type
) {

    const config =
        lookupConfig[type];


    const hidden =
        document.getElementById(
            config.hiddenId
        );


    const detail =
        document.getElementById(
            config.selectedId
        );


    if (hidden) {

        hidden.value =
            "";

    }


    if (detail) {

        detail.innerHTML =
            "";

        detail.classList.remove(
            "show"
        );

    }


    lookupSelected[type] =
        null;


    if (
        config.priceId
    ) {

        const price =
            document.getElementById(
                config.priceId
            );


        if (price) {

            price.value =
                0;

        }

    }


    if (
        type ===
        "barangPembelian"
    ) {

        const info =
            document.getElementById(
                "infoStokPembelian"
            );


        if (info) {

            info.textContent =
                "Pilih barang terlebih dahulu.";

        }

    }


    if (
        type ===
        "barangPenjualan"
    ) {

        const jumlah =
            document.getElementById(
                "jumlahPenjualan"
            );


        if (jumlah) {

            jumlah.disabled =
                false;

            jumlah.removeAttribute(
                "max"
            );

        }


        const info =
            document.getElementById(
                "infoStokPenjualan"
            );


        if (info) {

            info.textContent =
                "Pilih barang terlebih dahulu.";

        }

    }


}


// =====================================================
// BERSIHKAN LOOKUP
// =====================================================

function bersihkanLookup(type) {

    const config =
        lookupConfig[type];


    const input =
        document.getElementById(
            config.inputId
        );


    if (input) {

        input.value =
            "";

    }


    resetLookupSelection(
        type
    );


    sembunyikanLookup(
        type
    );

}


// =====================================================
// SEMBUNYIKAN LOOKUP
// =====================================================

function sembunyikanLookup(type) {

    const config =
        lookupConfig[type];


    const results =
        document.getElementById(
            config.resultsId
        );


    if (results) {

        results.classList.remove(
            "open"
        );

    }

}


// =====================================================
// KLIK DI LUAR LOOKUP
// =====================================================

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.closest(
                ".lookup-wrapper"
            )
        ) {

            Object.keys(
                lookupConfig
            ).forEach(
                function (type) {

                    sembunyikanLookup(
                        type
                    );

                }
            );

        }

    }
);


// =====================================================
// HITUNG SUBTOTAL PEMBELIAN
// =====================================================

function hitungSubtotalPembelian() {

    const jumlah =
        Number(
            document.getElementById(
                "jumlahPembelian"
            )?.value
        ) || 0;


    const harga =
        Number(
            document.getElementById(
                "hargaPembelian"
            )?.value
        ) || 0;


    const total =
        jumlah *
        harga;


    const jumlahEl =
        document.getElementById(
            "ringkasJumlahPembelian"
        );


    const hargaEl =
        document.getElementById(
            "ringkasHargaPembelian"
        );


    const totalEl =
        document.getElementById(
            "ringkasTotalPembelian"
        );


    if (jumlahEl) {

        jumlahEl.textContent =
            jumlah;

    }


    if (hargaEl) {

        hargaEl.textContent =
            formatRupiah(
                harga
            );

    }


    if (totalEl) {

        totalEl.textContent =
            formatRupiah(
                total
            );

    }

}

// =====================================================
// SIMPAN PEMBELIAN
// SEKALIGUS MEMBUAT JURNAL UMUM
// =====================================================

async function simpanPembelian(event) {

    event.preventDefault();

    console.log("=== SIMPAN PEMBELIAN DIPANGGIL ===");


    // =================================================
    // CEK SUPABASE
    // =================================================

    if (!cekSupabase()) {

        console.log(
            "Supabase tidak tersedia."
        );

        return;
    }


    // =================================================
    // AMBIL DATA FORM
    // =================================================

    const nomor =
        document
            .getElementById("nomorPembelian")
            .value
            .trim();


    const tanggal =
        document
            .getElementById("tanggalPembelian")
            .value;


    const idPemasok =
        Number(
            document
                .getElementById("pemasokPembelian")
                .value
        );


    const idBarang =
        Number(
            document
                .getElementById("barangPembelian")
                .value
        );


    const jumlah =
        Number(
            document
                .getElementById("jumlahPembelian")
                .value
        );


    const harga =
        Number(
            document
                .getElementById("hargaPembelian")
                .value
        );


    // =================================================
    // AMBIL METODE PEMBAYARAN
    // =================================================

    const metodePembayaran =
        document
            .getElementById("metodePembayaranPembelian")
            .value;


    // =================================================
    // AMBIL KETERANGAN PEMBELIAN
    // =================================================

    const keteranganElement =
        document.getElementById(
            "keteranganPembelian"
        );


    const keterangan =
        keteranganElement
            ? keteranganElement.value.trim()
            : "";


    // =================================================
    // HITUNG SUBTOTAL
    // =================================================

    const subtotal =
        jumlah * harga;


    // =================================================
    // VALIDASI
    // =================================================

    if (!nomor) {

        alert(
            "Nomor pembelian tidak boleh kosong."
        );

        return;
    }


    if (!tanggal) {

        alert(
            "Tanggal pembelian wajib diisi."
        );

        return;
    }


    if (!idPemasok) {

        alert(
            "Silakan pilih pemasok terlebih dahulu."
        );

        return;
    }


    if (!idBarang) {

        alert(
            "Silakan pilih barang terlebih dahulu."
        );

        return;
    }


    if (!jumlah || jumlah <= 0) {

        alert(
            "Jumlah pembelian harus lebih dari 0."
        );

        return;
    }


    if (harga < 0) {

        alert(
            "Harga beli tidak boleh negatif."
        );

        return;
    }


    if (subtotal <= 0) {

        alert(
            "Total pembelian harus lebih dari 0."
        );

        return;
    }


    if (
        metodePembayaran !== "TUNAI" &&
        metodePembayaran !== "KREDIT"
    ) {

        alert(
            "Silakan pilih metode pembayaran."
        );

        return;
    }


    console.log(
        "METODE PEMBAYARAN:",
        metodePembayaran
    );


    console.log(
        "TOTAL PEMBELIAN:",
        subtotal
    );


    console.log(
        "KETERANGAN:",
        keterangan
    );


    // =================================================
    // SIMPAN HEADER PEMBELIAN
    // =================================================

    console.log(
        "1. Menyimpan pembelian..."
    );


    const hasilPembelian =
        await supabaseClient
            .from("pembelian")
            .insert([
                {
                    nomor_pembelian:
                        nomor,

                    tanggal_pembelian:
                        tanggal,

                    id_pemasok:
                        idPemasok,

                    total_pembelian:
                        subtotal,

                    keterangan:
                        keterangan || null
                }
            ])
            .select()
            .single();


    if (hasilPembelian.error) {

        console.error(
            "ERROR PEMBELIAN:",
            hasilPembelian.error
        );


        alert(
            "Gagal menyimpan pembelian:\n\n" +
            hasilPembelian.error.message
        );


        return;
    }


    const idPembelian =
        hasilPembelian.data.id_pembelian;


    console.log(
        "2. Pembelian berhasil:",
        idPembelian
    );


    // =================================================
    // TENTUKAN AKUN JURNAL
    // =================================================

    console.log(
        "3. Mengambil akun jurnal..."
    );


    const hasilAkun =
        await supabaseClient
            .from("akun")
            .select(
                "id_akun, kode_akun, nama_akun"
            )
            .in(
                "kode_akun",
                [
                    "1-1100",
                    "1-1000",
                    "2-1000"
                ]
            );


    if (hasilAkun.error) {

        console.error(
            "ERROR AKUN:",
            hasilAkun.error
        );


        alert(
            "Gagal mengambil data akun:\n\n" +
            hasilAkun.error.message
        );


        return;
    }


    // =================================================
    // CARI AKUN PERSEDIAAN
    // =================================================

    const akunPersediaan =
        hasilAkun.data.find(
            function (akun) {

                return (
                    akun.kode_akun ===
                    "1-1100"
                );

            }
        );


    // =================================================
    // CARI AKUN KAS
    // =================================================

    const akunKas =
        hasilAkun.data.find(
            function (akun) {

                return (
                    akun.kode_akun ===
                    "1-1000"
                );

            }
        );


    // =================================================
    // CARI AKUN UTANG
    // =================================================

    const akunUtang =
        hasilAkun.data.find(
            function (akun) {

                return (
                    akun.kode_akun ===
                    "2-1000"
                );

            }
        );


    // =================================================
    // VALIDASI AKUN
    // =================================================

    if (!akunPersediaan) {

        alert(
            "Akun Persediaan Barang tidak ditemukan."
        );

        return;
    }


    if (
        metodePembayaran === "TUNAI" &&
        !akunKas
    ) {

        alert(
            "Akun Kas tidak ditemukan."
        );

        return;
    }


    if (
        metodePembayaran === "KREDIT" &&
        !akunUtang
    ) {

        alert(
            "Akun Utang Usaha tidak ditemukan."
        );

        return;
    }


    // =================================================
    // TENTUKAN AKUN KREDIT
    // =================================================

    let akunKredit;


    if (
        metodePembayaran === "TUNAI"
    ) {

        akunKredit =
            akunKas;

    }
    else {

        akunKredit =
            akunUtang;

    }


    // =================================================
    // BUAT JURNAL UMUM
    // =================================================

    console.log(
        "4. Membuat jurnal umum..."
    );


    const dataJurnalPembelian = [

        // ---------------------------------------------
        // DEBIT PERSEDIAAN
        // ---------------------------------------------

        {

            tanggal_jurnal:
                tanggal,

            nomor_bukti:
                nomor,

            sumber_transaksi:
                "PEMBELIAN",

            id_akun:
                akunPersediaan.id_akun,

            keterangan:
                keterangan ||
                "Pembelian barang",

            debit:
                subtotal,

            kredit:
                0

        },


        // ---------------------------------------------
        // KREDIT KAS / UTANG
        // ---------------------------------------------

        {

            tanggal_jurnal:
                tanggal,

            nomor_bukti:
                nomor,

            sumber_transaksi:
                "PEMBELIAN",

            id_akun:
                akunKredit.id_akun,

            keterangan:
                keterangan ||
                "Pembelian barang",

            debit:
                0,

            kredit:
                subtotal

        }

    ];


    console.log(
        "DATA JURNAL YANG AKAN DISIMPAN:",
        dataJurnalPembelian
    );


    // =================================================
    // SIMPAN JURNAL
    // =================================================

    const hasilJurnal =
        await supabaseClient
            .from("jurnal_umum")
            .insert(
                dataJurnalPembelian
            );


    console.log(
        "HASIL INSERT JURNAL:",
        hasilJurnal
    );


    if (hasilJurnal.error) {

        console.error(
            "ERROR JURNAL:",
            hasilJurnal.error
        );


        alert(
            "Pembelian berhasil, tetapi jurnal gagal dibuat:\n\n" +
            hasilJurnal.error.message
        );


        return;
    }


    console.log(
        "5. Jurnal berhasil dibuat!"
    );


    // =================================================
    // SIMPAN DETAIL PEMBELIAN
    // =================================================

    console.log(
        "6. Menyimpan detail pembelian..."
    );


    const hasilDetail =
        await supabaseClient
            .from("detail_pembelian")
            .insert([
                {

                    id_pembelian:
                        idPembelian,

                    id_barang:
                        idBarang,

                    jumlah:
                        jumlah,

                    harga_beli:
                        harga,

                    subtotal:
                        subtotal

                }
            ]);


    if (hasilDetail.error) {

        console.error(
            "ERROR DETAIL:",
            hasilDetail.error
        );


        alert(
            "Detail pembelian gagal disimpan:\n\n" +
            hasilDetail.error.message
        );


        return;
    }


    // =================================================
    // BERHASIL
    // =================================================

    console.log(
        "7. PEMBELIAN + JURNAL BERHASIL!"
    );


    alert(

        "Pembelian berhasil disimpan!\n\n" +

        "Nomor: " +
        nomor +

        "\nMetode: " +
        (
            metodePembayaran === "TUNAI"
                ? "Tunai"
                : "Kredit"
        ) +

        "\nBarang masuk: " +
        jumlah +

        "\nNilai: " +
        formatRupiah(subtotal) +

        "\n\n" +

        "✓ Stok otomatis bertambah." +

        "\n✓ Jurnal umum otomatis dibuat."

    );


    await pembelian();

}

// =====================================================
// PENJUALAN
// =====================================================

async function penjualan() {

    ubahJudul(
        "Penjualan"
    );


    aktifkanMenu(
        "Penjualan"
    );


    document.getElementById(
        "isi"
    ).innerHTML = `

        <div class="content-box">

            <div class="page-header">

                <div>

                    <h2>
                        Penjualan
                    </h2>

                    <p>
                        Mencatat transaksi
                        penjualan barang.
                    </p>

                </div>

                <button
                    class="btn-primary"
                    onclick="penjualanBaru()"
                >
                    + Penjualan Baru
                </button>

            </div>


            <div id="tabelPenjualan">

                <div class="empty-state">
                    Memuat data penjualan...
                </div>

            </div>

        </div>

    `;


    await tampilkanPenjualan();

}

// =====================================================
// PAGINATION PENJUALAN
// =====================================================

let halamanPenjualan = 1;
const dataPerHalamanPenjualan = 10;


// =====================================================
// TAMPILKAN PENJUALAN
// =====================================================

async function tampilkanPenjualan(halaman = 1) {

    const container =
        document.getElementById(
            "tabelPenjualan"
        );


    if (!container) {
        return;
    }


    if (!cekSupabase()) {
        return;
    }


    // =================================================
    // AMBIL DATA PENJUALAN
    // =================================================

    const {
        data,
        error
    } =
        await supabaseClient
            .from("penjualan")
            .select(`
                id_penjualan,
                nomor_penjualan,
                tanggal_penjualan,
                total_penjualan,

                pelanggan (
                    kode_pelanggan,
                    nama_pelanggan
                ),

                detail_penjualan (
                    jumlah,
                    harga_jual,
                    subtotal,

                    barang (
                        kode_barang,
                        nama_barang
                    )
                )
            `)
            .order(
                "tanggal_penjualan",
                {
                    ascending: false
                }
            );


    // =================================================
    // CEK ERROR
    // =================================================

    if (error) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Gagal mengambil data
                </h3>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            </div>

        `;

        return;
    }


    // =================================================
    // JIKA BELUM ADA DATA
    // =================================================

    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Belum Ada Penjualan
                </h3>

                <p>
                    Silakan tambahkan
                    transaksi penjualan.
                </p>

            </div>

        `;

        return;
    }


    // =================================================
    // HITUNG PAGINATION
    // =================================================

    const totalData =
        data.length;


    const totalHalaman =
        Math.ceil(
            totalData /
            dataPerHalamanPenjualan
        );


    if (halaman < 1) {
        halaman = 1;
    }


    if (halaman > totalHalaman) {
        halaman = totalHalaman;
    }


    halamanPenjualan =
        halaman;


    const mulai =
        (
            halaman - 1
        ) *
        dataPerHalamanPenjualan;


    const selesai =
        mulai +
        dataPerHalamanPenjualan;


    const dataHalaman =
        data.slice(
            mulai,
            selesai
        );


    // =================================================
    // TABEL PENJUALAN
    // =================================================

    let html = `

        <div class="table-container">

            <table>

                <thead>

                    <tr>

                        <th>
                            No
                        </th>

                        <th>
                            Nomor Penjualan
                        </th>

                        <th>
                            Tanggal
                        </th>

                        <th>
                            Pelanggan
                        </th>

                        <th>
                            Barang
                        </th>

                        <th>
                            Jumlah
                        </th>

                        <th>
                            Harga Jual
                        </th>

                        <th>
                            Total
                        </th>

                        <th>
                            Aksi
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    // =================================================
    // TAMPILKAN DATA HALAMAN
    // =================================================

    dataHalaman.forEach(
        function (
            item,
            index
        ) {

            // =========================================
            // AMBIL DETAIL
            // =========================================

            const detail =
                item.detail_penjualan &&
                item.detail_penjualan.length
                    ? item.detail_penjualan[0]
                    : null;


            // =========================================
            // AMBIL DATA BARANG
            // =========================================

            const barang =
                detail &&
                detail.barang
                    ? detail.barang
                    : null;


            // =========================================
            // TAMPILKAN BARIS
            // =========================================

            html += `

                <tr>

                    <td>
                        ${mulai + index + 1}
                    </td>


                    <td>

                        <strong>
                            ${escapeHtml(
                                item.nomor_penjualan
                            )}
                        </strong>

                    </td>


                    <td>
                        ${formatTanggal(
                            item.tanggal_penjualan
                        )}
                    </td>


                    <td>

                        ${
                            item.pelanggan
                                ? escapeHtml(
                                    item.pelanggan.kode_pelanggan +
                                    " - " +
                                    item.pelanggan.nama_pelanggan
                                )
                                : "-"
                        }

                    </td>


                    <td>

                        ${
                            barang
                                ? escapeHtml(
                                    barang.kode_barang +
                                    " - " +
                                    barang.nama_barang
                                )
                                : "-"
                        }

                    </td>


                    <td>

                        ${
                            detail
                                ? detail.jumlah
                                : 0
                        }

                    </td>


                    <td>

                        ${formatRupiah(
                            detail
                                ? detail.harga_jual
                                : 0
                        )}

                    </td>


                    <td>

                        ${formatRupiah(
                            item.total_penjualan
                        )}

                    </td>


                    <td>

                        <button
                            type="button"
                            class="btn-danger"
                            onclick="hapusPenjualan(${item.id_penjualan})"
                        >
                            Hapus
                        </button>

                    </td>

                </tr>

            `;

        }
    );


    // =================================================
    // PAGINATION
    // =================================================

    html += `

                </tbody>

            </table>

        </div>


        <div
            class="pagination"
            style="
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
                margin-top: 20px;
                flex-wrap: wrap;
            "
        >

            <button
                type="button"
                class="btn-secondary"
                onclick="tampilkanPenjualan(${halaman - 1})"
                ${halaman === 1 ? "disabled" : ""}
            >
                ← Sebelumnya
            </button>


            <span
                style="
                    padding: 8px 14px;
                    font-weight: 600;
                "
            >
                Halaman ${halaman}
                dari ${totalHalaman}
            </span>


            <button
                type="button"
                class="btn-secondary"
                onclick="tampilkanPenjualan(${halaman + 1})"
                ${halaman === totalHalaman ? "disabled" : ""}
            >
                Berikutnya →
            </button>

        </div>

    `;


    // =================================================
    // TAMPILKAN KE HALAMAN
    // =================================================

    container.innerHTML =
        html;

}

// =====================================================
// HAPUS PENJUALAN
// =====================================================

async function hapusPenjualan(idPenjualan) {

    if (!cekSupabase()) {
        return;
    }


    // =================================================
    // AMBIL DATA PENJUALAN
    // =================================================

    const {
        data: penjualanData,
        error: errorAmbil
    } =
        await supabaseClient
            .from("penjualan")
            .select(`
                id_penjualan,
                nomor_penjualan,
                total_penjualan,

                detail_penjualan (
                    jumlah,

                    barang (
                        nama_barang
                    )
                )
            `)
            .eq(
                "id_penjualan",
                idPenjualan
            )
            .single();


    if (errorAmbil) {

        console.error(
            "ERROR AMBIL PENJUALAN:",
            errorAmbil
        );

        alert(
            "Data penjualan tidak ditemukan:\n\n" +
            errorAmbil.message
        );

        return;
    }


    const nomor =
        penjualanData.nomor_penjualan;


    const detail =
        penjualanData.detail_penjualan &&
        penjualanData.detail_penjualan.length
            ? penjualanData.detail_penjualan[0]
            : null;


    const namaBarang =
        detail &&
        detail.barang
            ? detail.barang.nama_barang
            : "-";


    const jumlah =
        detail
            ? Number(detail.jumlah)
            : 0;


    // =================================================
    // KONFIRMASI
    // =================================================

    const yakin =
        confirm(

            "Apakah kamu yakin ingin menghapus penjualan ini?\n\n" +

            "Nomor Penjualan: " +
            nomor +

            "\nBarang: " +
            namaBarang +

            "\nJumlah: " +
            jumlah +

            "\nTotal: " +
            formatRupiah(
                penjualanData.total_penjualan
            ) +

            "\n\n" +

            "Stok barang akan dikembalikan " +
            "seperti sebelum penjualan.\n" +

            "Jurnal penjualan juga akan dihapus."
        );


    if (!yakin) {
        return;
    }


    // =================================================
    // HAPUS DETAIL PENJUALAN
    // =================================================
    // Trigger database akan otomatis
    // mengembalikan stok.
    // =================================================

    const {
        error: errorDetail
    } =
        await supabaseClient
            .from("detail_penjualan")
            .delete()
            .eq(
                "id_penjualan",
                idPenjualan
            );


    if (errorDetail) {

        console.error(
            "ERROR HAPUS DETAIL PENJUALAN:",
            errorDetail
        );

        alert(
            "Gagal menghapus detail penjualan:\n\n" +
            errorDetail.message
        );

        return;
    }


    // =================================================
    // HAPUS HEADER PENJUALAN
    // =================================================
    // Trigger database akan otomatis
    // menghapus jurnal penjualan.
    // =================================================

    const {
        error: errorPenjualan
    } =
        await supabaseClient
            .from("penjualan")
            .delete()
            .eq(
                "id_penjualan",
                idPenjualan
            );


    if (errorPenjualan) {

        console.error(
            "ERROR HAPUS PENJUALAN:",
            errorPenjualan
        );

        alert(
            "Gagal menghapus penjualan:\n\n" +
            errorPenjualan.message
        );

        return;
    }


    // =================================================
    // BERHASIL
    // =================================================

    alert(

        "Penjualan berhasil dihapus.\n\n" +

        "✓ Transaksi penjualan dihapus.\n" +
        "✓ Stok dikembalikan.\n" +
        "✓ Jurnal penjualan dihapus."

    );


    await penjualan();

}

// =====================================================
// PENJUALAN BARU
// =====================================================

async function penjualanBaru() {

    if (!cekSupabase()) {
        return;
    }


    ubahJudul(
        "Penjualan Baru"
    );


    aktifkanMenu(
        "Penjualan"
    );


    const nomor =
        await buatNomorTransaksi(
            "penjualan",
            "nomor_penjualan",
            "PJ-"
        );


    if (!nomor) {

        alert(
            "Nomor penjualan gagal dibuat."
        );

        return;

    }


    document.getElementById(
        "isi"
    ).innerHTML = `

        <div class="content-box">

            <div class="page-header">

                <div>

                    <h2>
                        Penjualan Baru
                    </h2>

                    <p>
                        Cari pelanggan dan barang
                        berdasarkan kode atau nama.
                    </p>

                </div>

            </div>


            <form
                onsubmit="simpanPenjualan(event)"
            >


                <div class="form-grid">


                    <!-- ================================= -->
                    <!-- NOMOR PENJUALAN -->
                    <!-- ================================= -->

                    <div class="form-group">

                        <label>
                            Nomor Penjualan
                        </label>

                        <input
                            type="text"
                            id="nomorPenjualan"
                            value="${nomor}"
                            readonly
                        >

                    </div>


                    <!-- ================================= -->
                    <!-- TANGGAL PENJUALAN -->
                    <!-- ================================= -->

                    <div class="form-group">

                        <label>
                            Tanggal Penjualan
                        </label>

                        <input
                            type="date"
                            id="tanggalPenjualan"
                            value="${tanggalHariIniInput()}"
                            required
                        >

                    </div>


                    <!-- ================================= -->
                    <!-- PELANGGAN -->
                    <!-- ================================= -->

                    <div class="form-group">

                        <label>
                            Pelanggan
                        </label>

                        <div class="lookup-wrapper">

                            <div class="lookup-input-wrap">

                                <input
                                    type="text"
                                    id="cariPelangganPenjualan"
                                    class="lookup-input"
                                    autocomplete="off"
                                    placeholder="Ketik kode atau nama pelanggan..."
                                >

                                <span class="lookup-search-icon">
                                    🔍
                                </span>

                            </div>


                            <input
                                type="hidden"
                                id="pelangganPenjualan"
                            >


                            <div
                                id="hasilPelangganPenjualan"
                                class="lookup-results"
                            ></div>

                        </div>


                        <div
                            id="detailPelangganPenjualan"
                            class="lookup-selected"
                        ></div>

                    </div>


                    <!-- ================================= -->
                    <!-- BARANG -->
                    <!-- ================================= -->

                    <div class="form-group">

                        <label>
                            Barang
                        </label>

                        <div class="lookup-wrapper">

                            <div class="lookup-input-wrap">

                                <input
                                    type="text"
                                    id="cariBarangPenjualan"
                                    class="lookup-input"
                                    autocomplete="off"
                                    placeholder="Ketik kode atau nama barang..."
                                >

                                <span class="lookup-search-icon">
                                    🔍
                                </span>

                            </div>


                            <input
                                type="hidden"
                                id="barangPenjualan"
                            >


                            <div
                                id="hasilBarangPenjualan"
                                class="lookup-results"
                            ></div>

                        </div>


                        <div
                            id="detailBarangPenjualan"
                            class="lookup-selected"
                        ></div>

                    </div>


                    <!-- ================================= -->
                    <!-- JUMLAH -->
                    <!-- ================================= -->

                    <div class="form-group">

                        <label>
                            Jumlah
                        </label>

                        <input
                            type="number"
                            id="jumlahPenjualan"
                            min="1"
                            value="1"
                            oninput="hitungSubtotalPenjualan()"
                            required
                        >


                        <small id="infoStokPenjualan">
                            Pilih barang terlebih dahulu.
                        </small>

                    </div>


                    <!-- ================================= -->
                    <!-- HARGA JUAL -->
                    <!-- ================================= -->

                    <div class="form-group">

                        <label>
                            Harga Jual Transaksi
                        </label>

                        <input
                            type="number"
                            id="hargaPenjualan"
                            min="0"
                            value="0"
                            oninput="hitungSubtotalPenjualan()"
                            required
                        >


                        <small>
                            Harga diambil dari Data Barang
                            dan masih dapat disesuaikan
                            untuk transaksi ini.
                        </small>

                    </div>


                    <!-- ================================= -->
                    <!-- KETERANGAN -->
                    <!-- ================================= -->

                    <div class="form-group">

                        <label>
                            Keterangan
                        </label>

                        <textarea
                            id="keteranganPenjualan"
                            rows="3"
                            placeholder="Masukkan keterangan penjualan..."
                        ></textarea>

                        <small>
                            Keterangan ini akan tersimpan
                            pada transaksi dan Jurnal Umum.
                        </small>

                    </div>


                </div>


                <!-- ================================= -->
                <!-- RINGKASAN TRANSAKSI -->
                <!-- ================================= -->

                <div
                    class="transaction-summary"
                >


                    <div class="transaction-summary-row">

                        <span>
                            Jumlah
                        </span>

                        <strong
                            id="ringkasJumlahPenjualan"
                        >
                            1
                        </strong>

                    </div>


                    <div class="transaction-summary-row">

                        <span>
                            Harga
                        </span>

                        <strong
                            id="ringkasHargaPenjualan"
                        >
                            Rp0
                        </strong>

                    </div>


                    <div
                        class="transaction-summary-row transaction-summary-total"
                    >

                        <span>
                            Total Penjualan
                        </span>

                        <strong
                            id="ringkasTotalPenjualan"
                        >
                            Rp0
                        </strong>

                    </div>


                </div>


                <!-- ================================= -->
                <!-- TOMBOL -->
                <!-- ================================= -->

                <div class="form-actions">


                    <button
                        type="button"
                        class="btn-secondary"
                        onclick="penjualan()"
                    >
                        Batal
                    </button>


                    <button
                        type="submit"
                        class="btn-primary"
                    >
                        Simpan Penjualan
                    </button>


                </div>


            </form>


        </div>

    `;


    // ================================================
    // PASANG LOOKUP PELANGGAN
    // ================================================

    pasangLookup(
        "pelangganPenjualan"
    );


    // ================================================
    // PASANG LOOKUP BARANG
    // ================================================

    pasangLookup(
        "barangPenjualan"
    );

}

// =====================================================
// HITUNG SUBTOTAL PENJUALAN
// =====================================================

function hitungSubtotalPenjualan() {

    const jumlah =
        Number(
            document.getElementById(
                "jumlahPenjualan"
            )?.value
        ) || 0;


    const harga =
        Number(
            document.getElementById(
                "hargaPenjualan"
            )?.value
        ) || 0;


    const total =
        jumlah *
        harga;


    const jumlahEl =
        document.getElementById(
            "ringkasJumlahPenjualan"
        );


    const hargaEl =
        document.getElementById(
            "ringkasHargaPenjualan"
        );


    const totalEl =
        document.getElementById(
            "ringkasTotalPenjualan"
        );


    if (jumlahEl) {

        jumlahEl.textContent =
            jumlah;

    }


    if (hargaEl) {

        hargaEl.textContent =
            formatRupiah(
                harga
            );

    }


    if (totalEl) {

        totalEl.textContent =
            formatRupiah(
                total
            );

    }

}

// =====================================================
// SIMPAN PENJUALAN
// =====================================================

async function simpanPenjualan(event) {

    event.preventDefault();


    // =================================================
    // CEK SUPABASE
    // =================================================

    if (!cekSupabase()) {

        return;
    }


    // =================================================
    // AMBIL DATA FORM
    // =================================================

    const nomor =
        document
            .getElementById("nomorPenjualan")
            .value
            .trim();


    const tanggal =
        document
            .getElementById("tanggalPenjualan")
            .value;


    const idPelanggan =
        Number(
            document
                .getElementById("pelangganPenjualan")
                .value
        );


    const idBarang =
        Number(
            document
                .getElementById("barangPenjualan")
                .value
        );


    const jumlah =
        Number(
            document
                .getElementById("jumlahPenjualan")
                .value
        );


    const harga =
        Number(
            document
                .getElementById("hargaPenjualan")
                .value
        );


    // =================================================
    // AMBIL KETERANGAN
    // =================================================

    const keteranganElement =
        document.getElementById(
            "keteranganPenjualan"
        );


    const keterangan =
        keteranganElement
            ? keteranganElement.value.trim()
            : "";


    // =================================================
    // HITUNG SUBTOTAL PENJUALAN
    // =================================================

    const subtotal =
        jumlah * harga;


    // =================================================
    // VALIDASI
    // =================================================

    if (!nomor) {

        alert(
            "Nomor penjualan tidak boleh kosong."
        );

        return;
    }


    if (!tanggal) {

        alert(
            "Tanggal penjualan wajib diisi."
        );

        return;
    }


    if (!idPelanggan) {

        alert(
            "Silakan pilih pelanggan terlebih dahulu."
        );

        return;
    }


    if (!idBarang) {

        alert(
            "Silakan pilih barang terlebih dahulu."
        );

        return;
    }


    if (!jumlah || jumlah <= 0) {

        alert(
            "Jumlah penjualan harus lebih dari 0."
        );

        return;
    }


    if (harga < 0) {

        alert(
            "Harga jual tidak boleh negatif."
        );

        return;
    }


    if (subtotal <= 0) {

        alert(
            "Total penjualan harus lebih dari 0."
        );

        return;
    }


    // =================================================
    // CEK BARANG, STATUS, STOK DAN HARGA BELI
    // =================================================

    const hasilBarang =
        await supabaseClient
            .from("barang")
            .select(
                "id_barang, nama_barang, stok, harga_beli, harga_jual, status"
            )
            .eq(
                "id_barang",
                idBarang
            )
            .single();


    // =================================================
    // CEK ERROR DATA BARANG
    // =================================================

    if (hasilBarang.error) {

        console.error(
            "ERROR CEK BARANG:",
            hasilBarang.error
        );


        alert(
            "Gagal mengecek data barang:\n\n" +
            hasilBarang.error.message
        );

        return;
    }


    // =================================================
    // CEK STATUS BARANG
    // BARANG NONAKTIF TIDAK BOLEH DIJUAL
    // =================================================

    const statusBarang =
        String(
            hasilBarang.data.status || ""
        )
            .trim()
            .toUpperCase();


    if (
        statusBarang !== "AKTIF"
    ) {

        alert(

            "Barang tersebut sudah NONAKTIF.\n\n" +

            "Barang NONAKTIF tidak dapat digunakan " +
            "untuk transaksi penjualan.\n\n" +

            "Silakan aktifkan kembali barang tersebut " +
            "jika ingin menggunakannya."

        );

        return;
    }


    // =================================================
    // AMBIL STOK TERSEDIA
    // =================================================

    const stokTersedia =
        Number(
            hasilBarang.data.stok
        );


    // =================================================
    // AMBIL HARGA BELI
    // =================================================

    const hargaBeli =
        Number(
            hasilBarang.data.harga_beli
        ) || 0;


    // =================================================
    // VALIDASI STOK
    // =================================================

    if (
        stokTersedia < jumlah
    ) {

        alert(

            "Stok tidak mencukupi!\n\n" +

            "Barang: " +
            hasilBarang.data.nama_barang +

            "\nStok tersedia: " +
            stokTersedia +

            "\nJumlah penjualan: " +
            jumlah

        );

        return;
    }


    // =================================================
    // HITUNG HPP
    // =================================================

    const totalHPP =
        jumlah * hargaBeli;


    // =================================================
    // DEBUG
    // =================================================

    console.log(
        "TOTAL PENJUALAN:",
        subtotal
    );


    console.log(
        "HARGA BELI:",
        hargaBeli
    );


    console.log(
        "TOTAL HPP:",
        totalHPP
    );


    console.log(
        "KETERANGAN:",
        keterangan
    );


    // =================================================
    // SIMPAN HEADER PENJUALAN
    // =================================================

    const hasilPenjualan =
        await supabaseClient
            .from("penjualan")
            .insert([

                {

                    nomor_penjualan:
                        nomor,

                    tanggal_penjualan:
                        tanggal,

                    id_pelanggan:
                        idPelanggan,

                    total_penjualan:
                        subtotal,

                    keterangan:
                        keterangan || null

                }

            ])
            .select()
            .single();


    // =================================================
    // CEK HEADER PENJUALAN
    // =================================================

    if (
        hasilPenjualan.error
    ) {

        console.error(
            "ERROR PENJUALAN:",
            hasilPenjualan.error
        );


        alert(

            "Gagal menyimpan penjualan:\n\n" +

            hasilPenjualan.error.message

        );

        return;
    }


    const idPenjualan =
        hasilPenjualan
            .data
            .id_penjualan;


    console.log(
        "PENJUALAN BERHASIL:",
        idPenjualan
    );


    // =================================================
    // SIMPAN DETAIL PENJUALAN
    // =================================================

    const hasilDetail =
        await supabaseClient
            .from("detail_penjualan")
            .insert([

                {

                    id_penjualan:
                        idPenjualan,

                    id_barang:
                        idBarang,

                    jumlah:
                        jumlah,

                    harga_jual:
                        harga,

                    subtotal:
                        subtotal

                }

            ]);


    // =================================================
    // CEK DETAIL PENJUALAN
    // =================================================

    if (
        hasilDetail.error
    ) {

        console.error(
            "ERROR DETAIL PENJUALAN:",
            hasilDetail.error
        );


        // ---------------------------------------------
        // HAPUS HEADER JIKA DETAIL GAGAL
        // ---------------------------------------------

        await supabaseClient
            .from("penjualan")
            .delete()
            .eq(
                "id_penjualan",
                idPenjualan
            );


        alert(

            "Detail penjualan gagal disimpan:\n\n" +

            hasilDetail.error.message

        );

        return;
    }


    // =================================================
    // AMBIL AKUN JURNAL
    // =================================================

    const hasilAkun =
        await supabaseClient
            .from("akun")
            .select(
                "id_akun, kode_akun, nama_akun"
            )
            .in(
                "kode_akun",
                [

                    "1-1200",
                    "4-1000",
                    "5-1000",
                    "1-1100"

                ]
            );


    // =================================================
    // CEK AKUN JURNAL
    // =================================================

    if (
        hasilAkun.error
    ) {

        console.error(
            "ERROR AKUN JURNAL:",
            hasilAkun.error
        );


        alert(

            "Penjualan dan stok berhasil disimpan,\n" +
            "tetapi jurnal gagal dibuat:\n\n" +

            hasilAkun.error.message

        );

        return;
    }


    // =================================================
    // CARI AKUN PIUTANG
    // =================================================

    const akunPiutang =
        hasilAkun.data.find(
            function (akun) {

                return (
                    akun.kode_akun ===
                    "1-1200"
                );

            }
        );


    // =================================================
    // CARI AKUN PENJUALAN
    // =================================================

    const akunPenjualan =
        hasilAkun.data.find(
            function (akun) {

                return (
                    akun.kode_akun ===
                    "4-1000"
                );

            }
        );


    // =================================================
    // CARI AKUN HPP
    // =================================================

    const akunHPP =
        hasilAkun.data.find(
            function (akun) {

                return (
                    akun.kode_akun ===
                    "5-1000"
                );

            }
        );


    // =================================================
    // CARI AKUN PERSEDIAAN
    // =================================================

    const akunPersediaan =
        hasilAkun.data.find(
            function (akun) {

                return (
                    akun.kode_akun ===
                    "1-1100"
                );

            }
        );


    // =================================================
    // VALIDASI AKUN
    // =================================================

    if (!akunPiutang) {

        alert(
            "Akun Piutang Usaha tidak ditemukan."
        );

        return;
    }


    if (!akunPenjualan) {

        alert(
            "Akun Penjualan tidak ditemukan."
        );

        return;
    }


    if (!akunHPP) {

        alert(
            "Akun Harga Pokok Penjualan tidak ditemukan."
        );

        return;
    }


    if (!akunPersediaan) {

        alert(
            "Akun Persediaan Barang tidak ditemukan."
        );

        return;
    }


    // =================================================
    // KETERANGAN JURNAL
    // =================================================

    const keteranganJurnal =
        keterangan ||
        "Penjualan barang";


    const keteranganHPP =
        keterangan ||
        "Pengakuan harga pokok penjualan";


    // =================================================
    // BUAT JURNAL PENJUALAN
    // =================================================

    const dataJurnalPenjualan = [

        // ---------------------------------------------
        // PIUTANG USAHA
        // DEBIT
        // ---------------------------------------------

        {

            tanggal_jurnal:
                tanggal,

            nomor_bukti:
                nomor,

            sumber_transaksi:
                "PENJUALAN",

            id_akun:
                akunPiutang.id_akun,

            keterangan:
                keteranganJurnal,

            debit:
                subtotal,

            kredit:
                0

        },


        // ---------------------------------------------
        // PENJUALAN
        // KREDIT
        // ---------------------------------------------

        {

            tanggal_jurnal:
                tanggal,

            nomor_bukti:
                nomor,

            sumber_transaksi:
                "PENJUALAN",

            id_akun:
                akunPenjualan.id_akun,

            keterangan:
                keteranganJurnal,

            debit:
                0,

            kredit:
                subtotal

        },


        // ---------------------------------------------
        // HPP
        // DEBIT
        // ---------------------------------------------

        {

            tanggal_jurnal:
                tanggal,

            nomor_bukti:
                nomor,

            sumber_transaksi:
                "PENJUALAN",

            id_akun:
                akunHPP.id_akun,

            keterangan:
                keteranganHPP,

            debit:
                totalHPP,

            kredit:
                0

        },


        // ---------------------------------------------
        // PERSEDIAAN
        // KREDIT
        // ---------------------------------------------

        {

            tanggal_jurnal:
                tanggal,

            nomor_bukti:
                nomor,

            sumber_transaksi:
                "PENJUALAN",

            id_akun:
                akunPersediaan.id_akun,

            keterangan:
                keteranganHPP,

            debit:
                0,

            kredit:
                totalHPP

        }

    ];


    console.log(
        "DATA JURNAL PENJUALAN:",
        dataJurnalPenjualan
    );


    // =================================================
    // SIMPAN JURNAL
    // =================================================

    const hasilJurnal =
        await supabaseClient
            .from("jurnal_umum")
            .insert(
                dataJurnalPenjualan
            );


    // =================================================
    // CEK JURNAL
    // =================================================

    if (
        hasilJurnal.error
    ) {

        console.error(
            "ERROR JURNAL:",
            hasilJurnal.error
        );


        alert(

            "Penjualan berhasil disimpan,\n" +
            "tetapi jurnal gagal dibuat:\n\n" +

            hasilJurnal.error.message

        );

        return;
    }


    // =================================================
    // BERHASIL
    // =================================================

    alert(

        "Penjualan berhasil disimpan!\n\n" +

        "Nomor: " +
        nomor +

        "\nBarang: " +
        hasilBarang.data.nama_barang +

        "\nJumlah terjual: " +
        jumlah +

        "\nNilai penjualan: " +
        formatRupiah(subtotal) +

        "\nHPP: " +
        formatRupiah(totalHPP) +

        "\n\n" +

        "✓ Stok otomatis berkurang." +

        "\n✓ Jurnal penjualan otomatis dibuat." +

        "\n✓ Jurnal HPP otomatis dibuat."

    );


    // =================================================
    // KEMBALI KE DATA PENJUALAN
    // =================================================

    await penjualan();

}

// =====================================================
// PENYESUAIAN STOK
// =====================================================

let daftarBarangPenyesuaian = [];


// =====================================================
// HALAMAN PENYESUAIAN STOK
// =====================================================

async function penyesuaianStok() {

    ubahJudul("Penyesuaian Stok");

    aktifkanMenu("Penyesuaian Stok");

    document.getElementById("isi").innerHTML = `

        <div class="content-box">

            <div class="page-header">

                <div>
                    <h2>Penyesuaian Stok</h2>

                    <p>
                        Sesuaikan stok sistem dengan hasil stok fisik.
                    </p>
                </div>

            </div>


            <div class="form-grid">

                <!-- CARI BARANG -->

                <div class="form-group">

                    <label>
                        Cari Barang
                    </label>

                    <input 
    type="text" 
    id="inputBarangPenyesuaian" 
    class="lookup-input"
    placeholder="Ketik kode atau nama barang..." 
    autocomplete="off"
    oninput="cariBarangPenyesuaian()"
    onfocus="cariBarangPenyesuaian()"
>

                    <input
                        type="hidden"
                        id="idBarangPenyesuaian"
                    >

                    <div
                        id="hasilBarangPenyesuaian"
                        class="lookup-results"
                    ></div>

                </div>


                <!-- STOK SISTEM -->

                <div class="form-group">

                    <label>
                        Stok Sistem
                    </label>

                    <input
                        type="number"
                        id="stokSistemPenyesuaian"
                        readonly
                        placeholder="Otomatis"
                    >

                </div>


                <!-- STOK FISIK -->

                <div class="form-group">

                    <label>
                        Stok Fisik
                    </label>

                    <input
                        type="number"
                        id="stokFisikPenyesuaian"
                        min="0"
                        placeholder="Masukkan stok fisik"
                    >

                </div>


                <!-- PENYESUAIAN -->

                <div class="form-group">

                    <label>
                        Penyesuaian
                    </label>

                    <input
                        type="number"
                        id="jumlahPenyesuaian"
                        readonly
                        placeholder="Otomatis"
                    >

                </div>


                <!-- ALASAN -->

                <div class="form-group">

                    <label>
                        Alasan
                    </label>

                    <select id="alasanPenyesuaian">

                        <option value="">
                            -- Pilih Alasan --
                        </option>

                    </select>

                </div>


                <!-- KETERANGAN -->

                <div class="form-group">

                    <label>
                        Keterangan
                    </label>

                    <textarea
                        id="keteranganPenyesuaian"
                        rows="3"
                        placeholder="Keterangan tambahan..."
                    ></textarea>

                </div>

            </div>


            <div class="form-actions">

                <button
                    type="button"
                    class="btn-secondary"
                    onclick="penyesuaianStok()"
                >
                    Batal
                </button>

                <button
                    type="button"
                    class="btn-primary"
                    onclick="simpanPenyesuaianStok()"
                >
                    Simpan Penyesuaian
                </button>

            </div>


            <hr>


            <h3>
                Riwayat Penyesuaian Stok
            </h3>

            <div id="riwayatPenyesuaian">
                Memuat data...
            </div>

        </div>

    `;


    // MUAT ALASAN
    await muatAlasanPenyesuaian();

    // MUAT RIWAYAT
    await muatRiwayatPenyesuaian();

    // EVENT STOK FISIK

    document
        .getElementById("stokFisikPenyesuaian")
        .addEventListener(
            "input",
            hitungPenyesuaianStok
        );

}

async function cariBarangPenyesuaian() {

    const input = document.getElementById("inputBarangPenyesuaian");
    const hasil = document.getElementById("hasilBarangPenyesuaian");

    if (!input || !hasil) return;

    const keyword = input.value.trim().toLowerCase();

    // Ambil data barang dari Supabase
    const { data, error } = await supabaseClient
        .from("barang")
        .select("id_barang, kode_barang, nama_barang, satuan, stok")
        .order("kode_barang", { ascending: true });

    if (error) {

        console.error("Gagal mengambil data barang:", error);

        hasil.innerHTML = `
            <div class="lookup-empty">
                Gagal mengambil data barang.
            </div>
        `;

        hasil.classList.add("open");

        return;
    }

    daftarBarangPenyesuaian = data || [];

    // Filter berdasarkan kode atau nama
    const barangDitemukan = daftarBarangPenyesuaian.filter(function(barang) {

        const kode = String(barang.kode_barang || "").toLowerCase();
        const nama = String(barang.nama_barang || "").toLowerCase();

        return (
            kode.includes(keyword) ||
            nama.includes(keyword)
        );

    });

    // Kalau tidak ada barang
    if (barangDitemukan.length === 0) {

        hasil.innerHTML = `
            <div class="lookup-empty">
                Barang tidak ditemukan.
            </div>
        `;

        hasil.classList.add("open");

        return;
    }

    // Tampilkan pilihan barang
    hasil.innerHTML = barangDitemukan.map(function(barang) {

        return `
            <div
                class="lookup-item"
                data-id-barang="${barang.id_barang}"
            >
                <strong>${barang.kode_barang}</strong>
                <span>${barang.nama_barang}</span>
                <small>
                    Stok: ${barang.stok} ${barang.satuan}
                </small>
            </div>
        `;

    }).join("");

    // Tampilkan dropdown
    hasil.classList.add("open");

    // Pasang event klik ke setiap barang
    hasil.querySelectorAll(".lookup-item").forEach(function(item) {

        item.addEventListener("mousedown", function(event) {

            event.preventDefault();

            const idBarang = Number(
                item.getAttribute("data-id-barang")
            );

            pilihBarangPenyesuaian(idBarang);

        });

    });
}


function pilihBarangPenyesuaian(idBarang) {

    const barang = daftarBarangPenyesuaian.find(function(item) {

        return Number(item.id_barang) === Number(idBarang);

    });

    if (!barang) return;

    // Simpan ID barang
    document.getElementById("idBarangPenyesuaian").value =
        barang.id_barang;

    // Tampilkan barang yang dipilih
    document.getElementById("inputBarangPenyesuaian").value =
        barang.kode_barang + " - " + barang.nama_barang;

    // Masukkan stok sistem otomatis
    document.getElementById("stokSistemPenyesuaian").value =
        barang.stok;

    // Kosongkan stok fisik
    document.getElementById("stokFisikPenyesuaian").value = "";

    // Kosongkan hasil penyesuaian
    document.getElementById("jumlahPenyesuaian").value = "";

    // Tutup daftar pilihan
    document
        .getElementById("hasilBarangPenyesuaian")
        .classList.remove("open");

    // Langsung fokus ke stok fisik
    document
        .getElementById("stokFisikPenyesuaian")
        .focus();
}

// =====================================================
// HITUNG PENYESUAIAN
// =====================================================

function hitungPenyesuaianStok() {

    const stokSistem =
        Number(
            document.getElementById(
                "stokSistemPenyesuaian"
            ).value
        );


    const stokFisikInput =
        document.getElementById(
            "stokFisikPenyesuaian"
        );


    const hasil =
        document.getElementById(
            "jumlahPenyesuaian"
        );


    if (
        stokFisikInput.value === ""
    ) {

        hasil.value = "";

        return;
    }


    const stokFisik =
        Number(
            stokFisikInput.value
        );


    hasil.value =
        stokFisik -
        stokSistem;

}


// =====================================================
// MUAT ALASAN
// =====================================================

async function muatAlasanPenyesuaian() {

    const select =
        document.getElementById(
            "alasanPenyesuaian"
        );


    if (!select) {
        return;
    }


    const {
        data,
        error
    } = await supabaseClient

        .from("alasan_penyesuaian")

        .select(
            "id_alasan, nama_alasan"
        )

        .eq(
            "aktif",
            true
        )

        .order(
            "nama_alasan"
        );


    if (error) {

        console.error(
            "Gagal mengambil alasan:",
            error
        );

        return;
    }


    select.innerHTML = `
        <option value="">
            -- Pilih Alasan --
        </option>
    `;


    (data || []).forEach(
        function (alasan) {

            select.innerHTML += `

                <option
                    value="${alasan.id_alasan}"
                >
                    ${alasan.nama_alasan}
                </option>

            `;

        }
    );

}


// =====================================================
// SIMPAN PENYESUAIAN
// =====================================================

async function simpanPenyesuaianStok() {

    const idBarang =
        Number(
            document.getElementById(
                "idBarangPenyesuaian"
            ).value
        );


    const stokSistem =
        Number(
            document.getElementById(
                "stokSistemPenyesuaian"
            ).value
        );


    const stokFisikInput =
        document.getElementById(
            "stokFisikPenyesuaian"
        );


    const stokFisik =
        Number(
            stokFisikInput.value
        );


    const idAlasan =
        Number(
            document.getElementById(
                "alasanPenyesuaian"
            ).value
        );


    const keterangan =
        document.getElementById(
            "keteranganPenyesuaian"
        ).value.trim();


    if (!idBarang) {

        alert(
            "Silakan pilih barang terlebih dahulu."
        );

        return;
    }


    if (
        stokFisikInput.value === ""
    ) {

        alert(
            "Silakan masukkan stok fisik."
        );

        return;
    }


    if (!idAlasan) {

        alert(
            "Silakan pilih alasan penyesuaian."
        );

        return;
    }


    const penyesuaian =
        stokFisik -
        stokSistem;


    const {
        error
    } = await supabaseClient

        .from("penyesuaian_stok")

        .insert([

            {
                id_barang:
                    idBarang,

                stok_sistem:
                    stokSistem,

                stok_fisik:
                    stokFisik,

                penyesuaian:
                    penyesuaian,

                id_alasan:
                    idAlasan,

                keterangan:
                    keterangan || null
            }

        ]);


    if (error) {

        console.error(
            "Gagal menyimpan penyesuaian:",
            error
        );

        alert(
            "Gagal menyimpan penyesuaian:\n\n" +
            error.message
        );

        return;
    }


    alert(
        "Penyesuaian stok berhasil disimpan."
    );


    await penyesuaianStok();

}

// =====================================================
// PAGINATION RIWAYAT PENYESUAIAN
// =====================================================

let halamanPenyesuaian = 1;
const dataPerHalamanPenyesuaian = 10;

// =====================================================
// RIWAYAT PENYESUAIAN
// =====================================================

async function muatRiwayatPenyesuaian(halaman = 1) {

    const container =
        document.getElementById(
            "riwayatPenyesuaian"
        );


    if (!container) {
        return;
    }


    const {
        data,
        error
    } = await supabaseClient

        .from("penyesuaian_stok")

        .select(`
            id_penyesuaian,
            stok_sistem,
            stok_fisik,
            penyesuaian,
            keterangan,
            tanggal_penyesuaian,
            barang (
                kode_barang,
                nama_barang
            ),
            alasan_penyesuaian (
                nama_alasan
            )
        `)

        .order(
            "tanggal_penyesuaian",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Gagal mengambil riwayat:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                Gagal mengambil riwayat penyesuaian.
            </div>
        `;

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                Belum ada riwayat penyesuaian.
            </div>
        `;

        return;
    }


    // =================================================
    // PAGINATION
    // =================================================

    const totalData =
        data.length;


    const totalHalaman =
        Math.ceil(
            totalData /
            dataPerHalamanPenyesuaian
        );


    if (halaman < 1) {
        halaman = 1;
    }


    if (halaman > totalHalaman) {
        halaman = totalHalaman;
    }


    halamanPenyesuaian =
        halaman;


    const mulai =
        (
            halaman - 1
        ) *
        dataPerHalamanPenyesuaian;


    const selesai =
        mulai +
        dataPerHalamanPenyesuaian;


    const dataHalaman =
        data.slice(
            mulai,
            selesai
        );


    // =================================================
    // TABEL
    // =================================================

    let html = `

        <div class="table-container">

            <table>

                <thead>

                    <tr>

                        <th>No</th>
                        <th>Tanggal</th>
                        <th>Kode</th>
                        <th>Barang</th>
                        <th>Stok Sistem</th>
                        <th>Stok Fisik</th>
                        <th>Penyesuaian</th>
                        <th>Alasan</th>
                        <th>Keterangan</th>

                    </tr>

                </thead>

                <tbody>

    `;


    dataHalaman.forEach(
        function (
            item,
            index
        ) {

            html += `

                <tr>

                    <td>
                        ${mulai + index + 1}
                    </td>

                    <td>
                        ${
                            new Date(
                                item.tanggal_penyesuaian
                            ).toLocaleString(
                                "id-ID"
                            )
                        }
                    </td>

                    <td>
                        ${
                            item.barang?.kode_barang ||
                            "-"
                        }
                    </td>

                    <td>
                        ${
                            item.barang?.nama_barang ||
                            "-"
                        }
                    </td>

                    <td>
                        ${item.stok_sistem}
                    </td>

                    <td>
                        ${item.stok_fisik}
                    </td>

                    <td>
                        ${item.penyesuaian}
                    </td>

                    <td>
                        ${
                            item.alasan_penyesuaian?.nama_alasan ||
                            "-"
                        }
                    </td>

                    <td>
                        ${
                            item.keterangan ||
                            "-"
                        }
                    </td>

                </tr>

            `;

        }
    );


    // =================================================
    // PAGINATION
    // =================================================

    html += `

                </tbody>

            </table>

        </div>


        <div
            class="pagination"
            style="
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
                margin-top: 20px;
                flex-wrap: wrap;
            "
        >

            <button
                type="button"
                class="btn-secondary"
                onclick="muatRiwayatPenyesuaian(${halaman - 1})"
                ${halaman === 1 ? "disabled" : ""}
            >
                ← Sebelumnya
            </button>


            <span
                style="
                    padding: 8px 14px;
                    font-weight: 600;
                "
            >
                Halaman ${halaman}
                dari ${totalHalaman}
            </span>


            <button
                type="button"
                class="btn-secondary"
                onclick="muatRiwayatPenyesuaian(${halaman + 1})"
                ${halaman === totalHalaman ? "disabled" : ""}
            >
                Berikutnya →
            </button>

        </div>

    `;


    container.innerHTML =
        html;

}

// =====================================================
// LAPORAN STOK
// =====================================================

async function laporanStok() {

    ubahJudul("Laporan Stok");

    aktifkanMenu("Laporan Stok");

    const isi = document.getElementById("isi");

    isi.innerHTML = `

        <!-- =================================================
             HEADER LAPORAN
        ================================================== -->

        <div class="report-header">

            <div>

                <span class="report-label">
                    LAPORAN & ANALISIS
                </span>

                <h2>
                    Laporan Stok
                </h2>

                <p>
                    Monitoring posisi, kondisi, dan nilai
                    persediaan barang toko.
                </p>

            </div>

            <div class="report-header-date">

                <span>
                    Tanggal Laporan
                </span>

                <strong>
                    ${tanggalHariIni()}
                </strong>

            </div>

        </div>


        <!-- =================================================
             RINGKASAN
        ================================================== -->

        <div class="report-summary-grid">

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    📦
                </div>

                <div>

                    <span>
                        Total Barang
                    </span>

                    <strong id="laporanTotalBarang">
                        0
                    </strong>

                    <small>
                        Jenis barang
                    </small>

                </div>

            </div>


            <div class="report-summary-card">

                <div class="report-summary-icon">
                    📊
                </div>

                <div>

                    <span>
                        Total Stok
                    </span>

                    <strong id="laporanTotalStok">
                        0
                    </strong>

                    <small>
                        Unit tersedia
                    </small>

                </div>

            </div>


            <div class="report-summary-card">

                <div class="report-summary-icon">
                    💰
                </div>

                <div>

                    <span>
                        Nilai Persediaan
                    </span>

                    <strong id="laporanNilaiPersediaan">
                        Rp 0
                    </strong>

                    <small>
                        Berdasarkan harga beli
                    </small>

                </div>

            </div>


            <div class="report-summary-card danger">

                <div class="report-summary-icon">
                    🔴
                </div>

                <div>

                    <span>
                        Stok Habis
                    </span>

                    <strong id="laporanStokHabis">
                        0
                    </strong>

                    <small>
                        Barang
                    </small>

                </div>

            </div>


            <div class="report-summary-card warning">

                <div class="report-summary-icon">
                    ⚠️
                </div>

                <div>

                    <span>
                        Stok Menipis
                    </span>

                    <strong id="laporanStokMenipis">
                        0
                    </strong>

                    <small>
                        Barang
                    </small>

                </div>

            </div>


            <div class="report-summary-card success">

                <div class="report-summary-icon">
                    🟢
                </div>

                <div>

                    <span>
                        Stok Aman
                    </span>

                    <strong id="laporanStokAman">
                        0
                    </strong>

                    <small>
                        Barang
                    </small>

                </div>

            </div>

        </div>


        <!-- =================================================
             FILTER
        ================================================== -->

        <div class="report-filter-box">

            <div class="report-filter-header">

                <div>

                    <span>
                        FILTER LAPORAN
                    </span>

                    <h3>
                        Cari dan Filter Persediaan
                    </h3>

                </div>

                <button
                    type="button"
                    class="report-reset-button"
                    onclick="resetFilterLaporanStok()"
                >
                    Reset Filter
                </button>

            </div>


            <div class="report-filter-grid">


                <!-- SEARCH -->

                <div class="report-filter-group">

                    <label>
                        Cari Barang
                    </label>

                    <input
                        type="text"
                        id="searchLaporanStok"
                        placeholder="Cari kode atau nama barang..."
                        oninput="filterLaporanStok()"
                    >

                </div>


                <!-- KATEGORI -->

                <div class="report-filter-group">

                    <label>
                        Kategori
                    </label>

                    <select
                        id="kategoriLaporanStok"
                        onchange="filterLaporanStok()"
                    >

                        <option value="">
                            Semua Kategori
                        </option>

                    </select>

                </div>


                <!-- STATUS -->

                <div class="report-filter-group">

                    <label>
                        Status Stok
                    </label>

                    <select
                        id="statusLaporanStok"
                        onchange="filterLaporanStok()"
                    >

                        <option value="">
                            Semua Status
                        </option>

                        <option value="habis">
                            Habis
                        </option>

                        <option value="menipis">
                            Menipis
                        </option>

                        <option value="aman">
                            Aman
                        </option>

                    </select>

                </div>

            </div>

        </div>


        <!-- =================================================
             TABEL LAPORAN
        ================================================== -->

        <div class="report-table-box">

            <div class="report-table-header">

                <div>

                    <span>
                        DAFTAR PERSEDIAAN
                    </span>

                    <h3>
                        Posisi Stok Barang
                    </h3>

                </div>

                <div
                    id="jumlahDataLaporanStok"
                    class="report-data-count"
                >
                    0 data
                </div>

            </div>


            <div id="laporanStokContainer">

                <div class="report-loading">
                    Memuat data persediaan...
                </div>

            </div>

        </div>

        <!-- =================================================
             TOMBOL CETAK
        ================================================== -->

        <div class="report-action-box">

            <div>

                <span>
                    DOKUMENTASI LAPORAN
                </span>

                <h3>
                    Cetak Laporan Stok
                </h3>

                <p>
                    Cetak laporan posisi persediaan
                    dalam format laporan yang siap
                    digunakan sebagai dokumentasi.
                </p>

            </div>

            <button
                type="button"
                class="report-print-button"
                onclick="cetakLaporanStok()"
            >
                🖨️ Cetak Laporan Stok
            </button>

        </div>

    `;

    if (!cekSupabase()) {
        return;
    }

    await muatDataLaporanStok();

}

// =====================================================
// DATA LAPORAN STOK
// =====================================================

let dataLaporanStok = [];

// =====================================================
// MUAT DATA LAPORAN STOK
// =====================================================

async function muatDataLaporanStok() {

    const container =
        document.getElementById(
            "laporanStokContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="report-loading">
            Memuat data persediaan...
        </div>
    `;

    const {
        data,
        error
    } = await supabaseClient
        .from("barang")
        .select(`
            id_barang,
            kode_barang,
            nama_barang,
            kategori,
            satuan,
            stok,
            harga_beli,
            harga_jual,
            stok_minimum
        `)
        .order(
            "nama_barang",
            {
                ascending: true
            }
        );

    if (error) {

        console.error(
            "Gagal memuat laporan stok:",
            error
        );

        container.innerHTML = `

            <div class="empty-state">

                ${escapeHtml(
                    error.message
                )}

            </div>

        `;

        return;

    }

    dataLaporanStok =
        data || [];

    isiKategoriLaporanStok();

    tampilkanRingkasanLaporanStok();

    tampilkanTabelLaporanStok(
        dataLaporanStok
    );

}

// =====================================================
// KATEGORI FILTER
// =====================================================

function isiKategoriLaporanStok() {

    const select =
        document.getElementById(
            "kategoriLaporanStok"
        );

    if (!select) {
        return;
    }

    const kategoriUnik =
        [
            ...new Set(
                dataLaporanStok
                    .map(
                        function(item) {
                            return item.kategori;
                        }
                    )
                    .filter(
                        function(kategori) {
                            return kategori &&
                                kategori.trim() !== "";
                        }
                    )
            )
        ]
        .sort();


    select.innerHTML = `

        <option value="">
            Semua Kategori
        </option>

        ${
            kategoriUnik
                .map(
                    function(kategori) {

                        return `

                            <option value="${escapeHtml(kategori)}">
                                ${escapeHtml(kategori)}
                            </option>

                        `;

                    }
                )
                .join("")
        }

    `;

}



// =====================================================
// STATUS STOK
// =====================================================

function tentukanStatusStokLaporan(
    stok,
    minimum
) {

    stok =
        Number(stok || 0);

    minimum =
        Number(minimum || 0);


    if (stok === 0) {

        return "habis";

    }


    if (stok <= minimum) {

        return "menipis";

    }


    return "aman";

}

// =====================================================
// NAMA STATUS
// =====================================================

function namaStatusStokLaporan(
    status
) {

    if (status === "habis") {

        return `
            <span class="report-status habis">
                🔴 Habis
            </span>
        `;

    }

    if (status === "menipis") {

        return `
            <span class="report-status menipis">
                🟡 Menipis
            </span>
        `;

    }

    return `
        <span class="report-status aman">
            🟢 Aman
        </span>
    `;

}

// =====================================================
// RINGKASAN
// =====================================================

function tampilkanRingkasanLaporanStok() {

    const data =
        dataLaporanStok;

    const totalBarang =
        data.length;

    const totalStok =
        data.reduce(
            function(total, item) {

                return total +
                    Number(
                        item.stok || 0
                    );

            },
            0
        );

    const nilaiPersediaan =
        data.reduce(
            function(total, item) {

                const stok =
                    Number(
                        item.stok || 0
                    );


                const hargaBeli =
                    Number(
                        item.harga_beli || 0
                    );


                return total +
                    (
                        stok *
                        hargaBeli
                    );

            },
            0
        );


    let stokHabis = 0;
    let stokMenipis = 0;
    let stokAman = 0;


    data.forEach(
        function(item) {

            const status =
                tentukanStatusStokLaporan(
                    item.stok,
                    item.stok_minimum
                );


            if (
                status === "habis"
            ) {

                stokHabis++;

            }
            else if (
                status === "menipis"
            ) {

                stokMenipis++;

            }
            else {

                stokAman++;

            }

        }
    );


    const totalBarangElement =
        document.getElementById(
            "laporanTotalBarang"
        );


    const totalStokElement =
        document.getElementById(
            "laporanTotalStok"
        );


    const nilaiElement =
        document.getElementById(
            "laporanNilaiPersediaan"
        );


    const habisElement =
        document.getElementById(
            "laporanStokHabis"
        );


    const menipisElement =
        document.getElementById(
            "laporanStokMenipis"
        );


    const amanElement =
        document.getElementById(
            "laporanStokAman"
        );


    if (totalBarangElement) {

        totalBarangElement.textContent =
            totalBarang;

    }


    if (totalStokElement) {

        totalStokElement.textContent =
            totalStok;

    }


    if (nilaiElement) {

        nilaiElement.textContent =
            formatRupiahLaporanStok(
                nilaiPersediaan
            );

    }


    if (habisElement) {

        habisElement.textContent =
            stokHabis;

    }


    if (menipisElement) {

        menipisElement.textContent =
            stokMenipis;

    }


    if (amanElement) {

        amanElement.textContent =
            stokAman;

    }

}



// =====================================================
// FILTER LAPORAN STOK
// =====================================================

function filterLaporanStok() {

    const searchElement =
        document.getElementById(
            "searchLaporanStok"
        );


    const kategoriElement =
        document.getElementById(
            "kategoriLaporanStok"
        );


    const statusElement =
        document.getElementById(
            "statusLaporanStok"
        );


    const keyword =
        (
            searchElement
                ? searchElement.value
                : ""
        )
        .toLowerCase()
        .trim();


    const kategori =
        kategoriElement
            ? kategoriElement.value
            : "";


    const status =
        statusElement
            ? statusElement.value
            : "";


    const hasil =
        dataLaporanStok.filter(
            function(item) {

                const kode =
                    String(
                        item.kode_barang || ""
                    )
                    .toLowerCase();


                const nama =
                    String(
                        item.nama_barang || ""
                    )
                    .toLowerCase();


                const kategoriItem =
                    String(
                        item.kategori || ""
                    );


                const statusItem =
                    tentukanStatusStokLaporan(
                        item.stok,
                        item.stok_minimum
                    );


                const cocokSearch =
                    !keyword ||
                    kode.includes(keyword) ||
                    nama.includes(keyword);


                const cocokKategori =
                    !kategori ||
                    kategoriItem === kategori;


                const cocokStatus =
                    !status ||
                    statusItem === status;


                return (
                    cocokSearch &&
                    cocokKategori &&
                    cocokStatus
                );

            }
        );
tampilkanTabelLaporanStok(
    hasil,
    1
);

}


// =====================================================
// RESET FILTER LAPORAN STOK
// =====================================================

function resetFilterLaporanStok() {

    const search =
        document.getElementById(
            "searchLaporanStok"
        );


    const kategori =
        document.getElementById(
            "kategoriLaporanStok"
        );


    const status =
        document.getElementById(
            "statusLaporanStok"
        );


    if (search) {

        search.value = "";

    }


    if (kategori) {

        kategori.value = "";

    }


    if (status) {

        status.value = "";

    }

tampilkanTabelLaporanStok(
    dataLaporanStok,
    1
);

}

// =====================================================
// PAGINATION LAPORAN STOK
// =====================================================

let halamanLaporanStok = 1;
const dataPerHalamanLaporanStok = 10;

// =====================================================
// TABEL LAPORAN STOK
// =====================================================

function tampilkanTabelLaporanStok(
    data,
    halaman = 1
) {

    const container =
        document.getElementById(
            "laporanStokContainer"
        );


    const jumlahElement =
        document.getElementById(
            "jumlahDataLaporanStok"
        );


    if (!container) {
        return;
    }


    // =================================================
    // JUMLAH DATA
    // =================================================

    if (jumlahElement) {

        jumlahElement.textContent =
            `${data.length} data`;

    }


    // =================================================
    // JIKA DATA KOSONG
    // =================================================

    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML = `

            <div class="report-empty">

                <div>
                    📦
                </div>

                <strong>
                    Data tidak ditemukan
                </strong>

                <span>
                    Tidak ada barang yang sesuai
                    dengan filter laporan.
                </span>

            </div>

        `;

        return;

    }


    // =================================================
    // HITUNG PAGINATION
    // =================================================

    const totalData =
        data.length;


    const totalHalaman =
        Math.ceil(
            totalData /
            dataPerHalamanLaporanStok
        );


    if (halaman < 1) {
        halaman = 1;
    }


    if (halaman > totalHalaman) {
        halaman = totalHalaman;
    }


    halamanLaporanStok =
        halaman;


    const mulai =
        (
            halaman - 1
        ) *
        dataPerHalamanLaporanStok;


    const selesai =
        mulai +
        dataPerHalamanLaporanStok;


    const dataHalaman =
        data.slice(
            mulai,
            selesai
        );


    // =================================================
    // TABEL
    // =================================================

    let html = `

        <div class="table-container">

            <table class="report-stock-table">

                <thead>

                    <tr>

                        <th>No</th>

                        <th>Kode</th>

                        <th>Nama Barang</th>

                        <th>Kategori</th>

                        <th>Satuan</th>

                        <th>Stok</th>

                        <th>Minimum</th>

                        <th>Status</th>

                        <th>Harga Beli</th>

                        <th>Nilai Persediaan</th>

                    </tr>

                </thead>

                <tbody>

    `;

    // =================================================
    // TAMPILKAN DATA HALAMAN
    // =================================================

    dataHalaman.forEach(
        function(
            item,
            index
        ) {

            const stok =
                Number(
                    item.stok || 0
                );


            const minimum =
                Number(
                    item.stok_minimum || 0
                );


            const hargaBeli =
                Number(
                    item.harga_beli || 0
                );


            const nilai =
                stok *
                hargaBeli;


            const status =
                tentukanStatusStokLaporan(
                    stok,
                    minimum
                );


            html += `

                <tr>

                    <td>
                        ${mulai + index + 1}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(
                                item.kode_barang || "-"
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            item.nama_barang || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.kategori || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.satuan || "-"
                        )}
                    </td>

                    <td>

                        <strong>
                            ${stok}
                        </strong>

                    </td>

                    <td>
                        ${minimum}
                    </td>

                    <td>
                        ${namaStatusStokLaporan(
                            status
                        )}
                    </td>

                    <td>
                        ${formatRupiahLaporanStok(
                            hargaBeli
                        )}
                    </td>

                    <td>

                        <strong>
                            ${formatRupiahLaporanStok(
                                nilai
                            )}
                        </strong>

                    </td>

                </tr>

            `;

        }
    );


    // =================================================
    // PAGINATION
    // =================================================

    html += `

                </tbody>

            </table>

        </div>


        <div
            class="pagination"
            style="
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
                margin-top: 20px;
                flex-wrap: wrap;
            "
        >

            <button
                type="button"
                class="btn-secondary"
                onclick="tampilkanTabelLaporanStok(
                    dataLaporanStok,
                    ${halaman - 1}
                )"
                ${halaman === 1 ? "disabled" : ""}
            >
                ← Sebelumnya
            </button>


            <span
                style="
                    padding: 8px 14px;
                    font-weight: 600;
                "
            >
                Halaman ${halaman}
                dari ${totalHalaman}
            </span>


            <button
                type="button"
                class="btn-secondary"
                onclick="tampilkanTabelLaporanStok(
                    dataLaporanStok,
                    ${halaman + 1}
                )"
                ${halaman === totalHalaman ? "disabled" : ""}
            >
                Berikutnya →
            </button>

        </div>

    `;


    container.innerHTML =
        html;

}

// =====================================================
// FORMAT RUPIAH
// =====================================================

function formatRupiahLaporanStok(
    nilai
) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(
        Number(nilai || 0)
    );

}

// =====================================================
// CETAK LAPORAN STOK
// =====================================================

function cetakLaporanStok() {

    if (
        !dataLaporanStok ||
        dataLaporanStok.length === 0
    ) {

        alert(
            "Tidak ada data stok yang dapat dicetak."
        );

        return;
    }

    // =================================================
    // AMBIL FILTER
    // =================================================

    const searchElement =
        document.getElementById(
            "searchLaporanStok"
        );

    const kategoriElement =
        document.getElementById(
            "kategoriLaporanStok"
        );

    const statusElement =
        document.getElementById(
            "statusLaporanStok"
        );


    const keyword =
        searchElement
            ? searchElement.value.trim().toLowerCase()
            : "";

    const kategori =
        kategoriElement
            ? kategoriElement.value
            : "";

    const status =
        statusElement
            ? statusElement.value
            : "";


    // =================================================
    // FILTER DATA
    // =================================================

    const dataCetak =
        dataLaporanStok.filter(
            function (item) {

                const kode =
                    String(
                        item.kode_barang || ""
                    ).toLowerCase();


                const nama =
                    String(
                        item.nama_barang || ""
                    ).toLowerCase();


                const kategoriItem =
                    String(
                        item.kategori || ""
                    );


                const statusItem =
                    tentukanStatusStokLaporan(
                        item.stok,
                        item.stok_minimum
                    );


                const cocokSearch =
                    !keyword ||
                    kode.includes(keyword) ||
                    nama.includes(keyword);


                const cocokKategori =
                    !kategori ||
                    kategoriItem === kategori;


                const cocokStatus =
                    !status ||
                    statusItem === status;


                return (
                    cocokSearch &&
                    cocokKategori &&
                    cocokStatus
                );

            }
        );


    if (dataCetak.length === 0) {

        alert(
            "Tidak ada data sesuai filter yang dapat dicetak."
        );

        return;
    }


    // =================================================
    // HITUNG RINGKASAN
    // =================================================

    const totalBarang =
        dataCetak.length;


    const totalStok =
        dataCetak.reduce(
            function (total, item) {

                return (
                    total +
                    Number(
                        item.stok || 0
                    )
                );

            },
            0
        );


    const nilaiPersediaan =
        dataCetak.reduce(
            function (total, item) {

                return (
                    total +
                    (
                        Number(
                            item.stok || 0
                        ) *
                        Number(
                            item.harga_beli || 0
                        )
                    )
                );

            },
            0
        );


    const stokHabis =
        dataCetak.filter(
            function (item) {

                return (
                    tentukanStatusStokLaporan(
                        item.stok,
                        item.stok_minimum
                    ) === "habis"
                );

            }
        ).length;


    const stokMenipis =
        dataCetak.filter(
            function (item) {

                return (
                    tentukanStatusStokLaporan(
                        item.stok,
                        item.stok_minimum
                    ) === "menipis"
                );

            }
        ).length;


    const stokAman =
        dataCetak.filter(
            function (item) {

                return (
                    tentukanStatusStokLaporan(
                        item.stok,
                        item.stok_minimum
                    ) === "aman"
                );

            }
        ).length;


    // =================================================
    // KETERANGAN FILTER
    // =================================================

    let filterKeterangan =
        "Semua Data";


    if (
        kategori &&
        status
    ) {

        filterKeterangan =
            `${kategori} - ${status}`;

    }
    else if (kategori) {

        filterKeterangan =
            kategori;

    }
    else if (status) {

        filterKeterangan =
            status;

    }
    else if (keyword) {

        filterKeterangan =
            `Pencarian: ${keyword}`;

    }


    // =================================================
    // NOMOR DOKUMEN
    // =================================================

    const nomorDokumen =
        "LST-" +
        tanggalHariIni()
            .replace(/\//g, "")
            .replace(/\s/g, "") +
        "-" +
        String(
            dataCetak.length
        ).padStart(
            3,
            "0"
        );


    // =================================================
    // BUKA JENDELA CETAK
    // =================================================

    const jendelaCetak =
        window.open(
            "",
            "_blank",
            "width=1400,height=900"
        );


    if (!jendelaCetak) {

        alert(
            "Pop-up diblokir browser. Izinkan pop-up untuk mencetak laporan."
        );

        return;
    }


    // =================================================
    // BUAT TABEL
    // =================================================

    let tabelRows = "";


    dataCetak.forEach(
        function (item, index) {

            const stok =
                Number(
                    item.stok || 0
                );


            const minimum =
                Number(
                    item.stok_minimum || 0
                );


            const hargaBeli =
                Number(
                    item.harga_beli || 0
                );


            const nilai =
                stok *
                hargaBeli;


            const statusItem =
                tentukanStatusStokLaporan(
                    stok,
                    minimum
                );


            let statusText = "";


            if (
                statusItem === "habis"
            ) {

                statusText =
                    "HABIS";

            }
            else if (
                statusItem === "menipis"
            ) {

                statusText =
                    "MENIPIS";

            }
            else {

                statusText =
                    "AMAN";

            }


            tabelRows += `

                <tr>

                    <td class="center">
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.kode_barang || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.nama_barang || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.kategori || "-"
                        )}
                    </td>

                    <td class="center">
                        ${escapeHtml(
                            item.satuan || "-"
                        )}
                    </td>

                    <td class="number">
                        ${stok}
                    </td>

                    <td class="number">
                        ${minimum}
                    </td>

                    <td class="center">

                        <span
                            class="status status-${statusItem}"
                        >
                            ${statusText}
                        </span>

                    </td>

                    <td class="money">
                        ${formatRupiahLaporanStok(
                            hargaBeli
                        )}
                    </td>

                    <td class="money">
                        ${formatRupiahLaporanStok(
                            nilai
                        )}
                    </td>

                </tr>

            `;

        }
    );


    // =================================================
    // DOKUMEN CETAK
    // =================================================

    jendelaCetak.document.write(`

        <!DOCTYPE html>

        <html lang="id">

        <head>

            <meta charset="UTF-8">

            <title>
                Laporan Stok - Toko Mainan
            </title>


            <style>

                * {
                    box-sizing: border-box;
                }


                @page {

                    size: A4 landscape;

                    margin: 12mm;

                }


                body {

                    margin: 0;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    color: #222;

                    background: #fff;

                    font-size: 9px;

                    line-height: 1.4;

                }


                .document {

                    width: 100%;

                }

                /* =====================================
                   HEADER PERUSAHAAN
                   ===================================== */

                .company-header {

                    display: flex;

                    justify-content:
                        space-between;

                    align-items:
                        flex-start;

                    padding-bottom:
                        12px;

                    border-bottom:
                        2px solid #222;

                }


                .company-name {

                    font-size: 20px;

                    font-weight: bold;

                    letter-spacing:
                        0.8px;

                    margin-bottom:
                        3px;

                }


                .company-subtitle {

                    font-size: 10px;

                    color: #555;

                }


                .document-meta {

                    text-align:
                        right;

                    color: #555;

                    font-size: 8px;

                    line-height:
                        1.6;

                }


                .document-meta strong {

                    display: block;

                    color: #222;

                    font-size: 9px;

                }


                /* =====================================
                   JUDUL
                   ===================================== */

                .document-title {

                    text-align:
                        center;

                    margin:
                        16px 0 14px;

                }


                .document-title h1 {

                    margin:
                        0 0 4px;

                    font-size: 17px;

                    letter-spacing:
                        0.7px;

                }


                .document-title p {

                    margin: 0;

                    color: #555;

                    font-size: 9px;

                }


                /* =====================================
                   PERIODE / FILTER
                   ===================================== */

                .period-box {

                    display: flex;

                    justify-content:
                        space-between;

                    align-items:
                        center;

                    border:
                        1px solid #bbb;

                    padding:
                        8px 11px;

                    margin-bottom:
                        13px;

                    background:
                        #fafafa;

                }


                .period-label {

                    color: #555;

                    font-size: 8px;

                    font-weight: bold;

                    text-transform:
                        uppercase;

                    letter-spacing:
                        0.5px;

                }


                .period-value {

                    font-size: 9px;

                    font-weight: bold;

                }


                /* =====================================
                   SUMMARY
                   ===================================== */

                .summary-grid {

                    display: grid;

                    grid-template-columns:
                        repeat(6, 1fr);

                    gap: 7px;

                    margin-bottom:
                        16px;

                }


                .summary-card {

                    border:
                        1px solid #c7c7c7;

                    padding:
                        9px 10px;

                    min-height:
                        55px;

                }


                .summary-card span {

                    display: block;

                    margin-bottom:
                        4px;

                    color: #666;

                    font-size: 7.5px;

                    font-weight: bold;

                    text-transform:
                        uppercase;

                }


                .summary-card strong {

                    display: block;

                    color: #222;

                    font-size: 12px;

                }


                /* =====================================
                   SECTION
                   ===================================== */

                .section-title {

                    margin:
                        0 0 7px;

                    padding-bottom:
                        5px;

                    border-bottom:
                        1px solid #999;

                    font-size: 10px;

                    font-weight: bold;

                    text-transform:
                        uppercase;

                    letter-spacing:
                        0.4px;

                }


                /* =====================================
                   TABLE
                   ===================================== */

                table {

                    width: 100%;

                    border-collapse:
                        collapse;

                    margin-bottom:
                        12px;

                }


                th {

                    padding:
                        6px 5px;

                    border:
                        1px solid #999;

                    background:
                        #eeeeee;

                    color: #222;

                    font-size: 7.5px;

                    font-weight: bold;

                    text-align:
                        center;

                    vertical-align:
                        middle;

                }


                td {

                    padding:
                        6px 5px;

                    border:
                        1px solid #bbb;

                    font-size: 8px;

                    vertical-align:
                        middle;

                }


                tbody tr:nth-child(even) {

                    background:
                        #fafafa;

                }


                .center {

                    text-align:
                        center;

                }


                .number {

                    text-align:
                        right;

                    white-space:
                        nowrap;

                }


                .money {

                    text-align:
                        right;

                    white-space:
                        nowrap;

                }


                /* =====================================
                   STATUS
                   ===================================== */

                .status {

                    display:
                        inline-block;

                    padding:
                        3px 6px;

                    border:
                        1px solid #999;

                    border-radius:
                        3px;

                    font-size:
                        7px;

                    font-weight:
                        bold;

                    letter-spacing:
                        0.3px;

                }


                .status-habis {

                    background:
                        #eeeeee;

                    color:
                        #222;

                }


                .status-menipis {

                    background:
                        #f5f5f5;

                    color:
                        #444;

                }


                .status-aman {

                    background:
                        #ffffff;

                    color:
                        #222;

                }


                /* =====================================
                   TOTAL BOX
                   ===================================== */

                .total-box {

                    width:
                        340px;

                    margin-left:
                        auto;

                    border:
                        1px solid #999;

                }


                .total-row {

                    display: flex;

                    justify-content:
                        space-between;

                    gap: 20px;

                    padding:
                        6px 9px;

                    border-bottom:
                        1px solid #ddd;

                }


                .total-row:last-child {

                    border-bottom:
                        none;

                    background:
                        #eeeeee;

                    font-weight:
                        bold;

                }


                .total-label {

                    color: #555;

                }


                .total-value {

                    text-align:
                        right;

                    white-space:
                        nowrap;

                }


                /* =====================================
                   CATATAN
                   ===================================== */

                .notes {

                    margin-top:
                        15px;

                    padding:
                        8px 10px;

                    border:
                        1px solid #ccc;

                    background:
                        #fafafa;

                    font-size:
                        8px;

                    color:
                        #555;

                }


                .notes strong {

                    display:
                        block;

                    margin-bottom:
                        3px;

                    color:
                        #333;

                }


                /* =====================================
                   TANDA TANGAN
                   ===================================== */

                .signature-section {

                    margin-top:
                        27px;

                    display:
                        grid;

                    grid-template-columns:
                        repeat(3, 1fr);

                    gap:
                        25px;

                    page-break-inside:
                        avoid;

                }


                .signature {

                    text-align:
                        center;

                }


                .signature-title {

                    margin-bottom:
                        38px;

                    font-size:
                        8px;

                    color:
                        #555;

                }


                .signature-line {

                    border-bottom:
                        1px solid #333;

                    margin:
                        0 20px 4px;

                }


                .signature-role {

                    font-size:
                        8px;

                    font-weight:
                        bold;

                }


                /* =====================================
                   FOOTER
                   ===================================== */

                .footer {

                    margin-top:
                        20px;

                    padding-top:
                        7px;

                    border-top:
                        1px solid #ccc;

                    text-align:
                        center;

                    color:
                        #777;

                    font-size:
                        7.5px;

                }


                /* =====================================
                   PRINT
                   ===================================== */

                @media print {

                    body {

                        margin: 0;

                    }


                    thead {

                        display:
                            table-header-group;

                    }


                    tr {

                        page-break-inside:
                            avoid;

                    }

                }

            </style>

        </head>


        <body>

            <div class="document">


                <!-- =================================
                     HEADER PERUSAHAAN
                     ================================= -->

                <div class="company-header">

                    <div>

                        <div class="company-name">
                            TOKO MAINAN
                        </div>

                        <div class="company-subtitle">
                            Sistem Akuntansi Persediaan
                        </div>

                    </div>


                    <div class="document-meta">

                        Nomor Dokumen

                        <strong>
                            ${nomorDokumen}
                        </strong>


                        Tanggal Cetak

                        <strong>
                            ${tanggalHariIni()}
                        </strong>

                    </div>

                </div>


                <!-- =================================
                     JUDUL
                     ================================= -->

                <div class="document-title">

                    <h1>
                        LAPORAN POSISI PERSEDIAAN
                    </h1>

                    <p>
                        Rekapitulasi posisi stok barang
                    </p>

                </div>


                <!-- =================================
                     FILTER
                     ================================= -->

                <div class="period-box">

                    <span class="period-label">
                        Filter Laporan
                    </span>

                    <span class="period-value">

                        ${escapeHtml(
                            filterKeterangan
                        )}

                    </span>

                </div>


                <!-- =================================
                     SUMMARY
                     ================================= -->

                <div class="summary-grid">


                    <div class="summary-card">

                        <span>
                            Total Barang
                        </span>

                        <strong>
                            ${totalBarang}
                        </strong>

                    </div>


                    <div class="summary-card">

                        <span>
                            Total Stok
                        </span>

                        <strong>
                            ${totalStok}
                        </strong>

                    </div>


                    <div class="summary-card">

                        <span>
                            Nilai Persediaan
                        </span>

                        <strong>
                            ${formatRupiahLaporanStok(
                                nilaiPersediaan
                            )}
                        </strong>

                    </div>


                    <div class="summary-card">

                        <span>
                            Stok Habis
                        </span>

                        <strong>
                            ${stokHabis}
                        </strong>

                    </div>


                    <div class="summary-card">

                        <span>
                            Stok Menipis
                        </span>

                        <strong>
                            ${stokMenipis}
                        </strong>

                    </div>


                    <div class="summary-card">

                        <span>
                            Stok Aman
                        </span>

                        <strong>
                            ${stokAman}
                        </strong>

                    </div>


                </div>


                <!-- =================================
                     DAFTAR PERSEDIAAN
                     ================================= -->

                <div class="section-title">

                    Daftar Persediaan Barang

                </div>


                <table>

                    <thead>

                        <tr>

                            <th style="width: 3%;">
                                No
                            </th>

                            <th style="width: 8%;">
                                Kode
                            </th>

                            <th style="width: 17%;">
                                Nama Barang
                            </th>

                            <th style="width: 11%;">
                                Kategori
                            </th>

                            <th style="width: 7%;">
                                Satuan
                            </th>

                            <th style="width: 6%;">
                                Stok
                            </th>

                            <th style="width: 7%;">
                                Minimum
                            </th>

                            <th style="width: 9%;">
                                Status
                            </th>

                            <th style="width: 15%;">
                                Harga Beli
                            </th>

                            <th style="width: 17%;">
                                Nilai Persediaan
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${tabelRows}

                    </tbody>

                </table>


                <!-- =================================
                     TOTAL
                     ================================= -->

                <div class="total-box">

                    <div class="total-row">

                        <span class="total-label">
                            Total Barang
                        </span>

                        <span class="total-value">
                            ${totalBarang}
                        </span>

                    </div>


                    <div class="total-row">

                        <span class="total-label">
                            Total Stok
                        </span>

                        <span class="total-value">
                            ${totalStok}
                        </span>

                    </div>


                    <div class="total-row">

                        <span class="total-label">
                            Nilai Persediaan
                        </span>

                        <span class="total-value">
                            ${formatRupiahLaporanStok(
                                nilaiPersediaan
                            )}
                        </span>

                    </div>


                    <div class="total-row">

                        <span class="total-label">
                            Kondisi Stok
                        </span>

                        <span class="total-value">
                            ${stokAman} Aman /
                            ${stokMenipis} Menipis /
                            ${stokHabis} Habis
                        </span>

                    </div>

                </div>


                <!-- =================================
                     CATATAN
                     ================================= -->

                <div class="notes">

                    <strong>
                        Catatan Laporan
                    </strong>

                    HABIS berarti stok barang berjumlah
                    0. MENIPIS berarti stok berada pada
                    atau di bawah batas minimum. AMAN
                    berarti stok berada di atas batas
                    minimum.

                    <br><br>

                    Nilai persediaan dihitung berdasarkan
                    jumlah stok dikalikan harga beli
                    masing-masing barang.

                </div>


                <!-- =================================
                     TANDA TANGAN
                     ================================= -->

                <div class="signature-section">


                    <div class="signature">

                        <div class="signature-title">
                            Dibuat Oleh
                        </div>

                        <div class="signature-line"></div>

                        <div class="signature-role">
                            Petugas Persediaan
                        </div>

                    </div>


                    <div class="signature">

                        <div class="signature-title">
                            Diperiksa Oleh
                        </div>

                        <div class="signature-line"></div>

                        <div class="signature-role">
                            Supervisor
                        </div>

                    </div>


                    <div class="signature">

                        <div class="signature-title">
                            Disetujui Oleh
                        </div>

                        <div class="signature-line"></div>

                        <div class="signature-role">
                            Pimpinan
                        </div>

                    </div>


                </div>


                <!-- =================================
                     FOOTER
                     ================================= -->

                <div class="footer">

                    Dokumen ini dibuat secara otomatis
                    oleh Sistem Akuntansi Persediaan Toko Mainan.

                    <br>

                    Dicetak pada:
                    ${tanggalHariIni()}

                </div>


            </div>


            <script>

                window.onload = function () {

                    setTimeout(
                        function () {

                            window.print();

                        },
                        500
                    );

                };

            <\/script>


        </body>

        </html>

    `);


    jendelaCetak.document.close();

}

// =====================================================
// LAPORAN PEMBELIAN
// =====================================================

let dataLaporanPembelian = [];
let dataLaporanPembelianTerfilter = [];

// =====================================================
// TAMPILAN LAPORAN PEMBELIAN
// =====================================================

async function laporanPembelian() {

    ubahJudul("Laporan Pembelian");

    aktifkanMenu("Laporan Pembelian");

    const isi = document.getElementById("isi");

    isi.innerHTML = `

        <!-- =========================================
             HEADER LAPORAN
             ========================================= -->

        <div class="report-header">

            <div>

                <span class="report-label">
                    LAPORAN TRANSAKSI
                </span>

                <h2>
                    Laporan Pembelian
                </h2>

                <p>
                    Ringkasan transaksi pembelian dan pengadaan barang toko.
                </p>

                <div class="report-period-info">

    <span>
        Periode Data
    </span>

    <strong id="pembelianPeriode">
        Semua
    </strong>

</div>
            </div>


            <div class="report-header-date">

                <span>
                    Tanggal Laporan
                </span>

                <strong>
                    ${tanggalHariIni()}
                </strong>

            </div>

        </div>


         <!-- =========================================
             SUMMARY
             ========================================= -->

        <div class="report-summary-grid">


            <!-- TOTAL TRANSAKSI -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    🛒
                </div>

                <div>

                    <span>
                        Total Transaksi
                    </span>

                    <strong id="pembelianTotalTransaksi">
                        0
                    </strong>

                    <small>
                        Transaksi pembelian
                    </small>

                </div>

            </div>


            <!-- TOTAL BARANG -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    📦
                </div>

                <div>

                    <span>
                        Total Barang Dibeli
                    </span>

                    <strong id="pembelianTotalBarang">
                        0
                    </strong>

                    <small>
                        Unit barang
                    </small>

                </div>

            </div>


            <!-- TOTAL NILAI -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    💰
                </div>

                <div>

                    <span>
                        Total Nilai Pembelian
                    </span>

                    <strong id="pembelianTotalNilai">
                        Rp 0
                    </strong>

                    <small>
                        Nilai seluruh pembelian
                    </small>

                </div>

            </div>


            <!-- TOTAL PEMASOK -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    🏢
                </div>

                <div>

                    <span>
                        Total Pemasok
                    </span>

                    <strong id="pembelianTotalPemasok">
                        0
                    </strong>

                    <small>
                        Pemasok terlibat
                    </small>

                </div>

            </div>


            <!-- RATA-RATA -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    📊
                </div>

                <div>

                    <span>
                        Rata-rata Pembelian
                    </span>

                    <strong id="pembelianRataRata">
                        Rp 0
                    </strong>

                    <small>
                        Per transaksi
                    </small>

                </div>

            </div>


            <!-- PEMBELIAN TERTINGGI -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    🔝
                </div>

                <div>

                    <span>
                        Pembelian Tertinggi
                    </span>

                    <strong id="pembelianTertinggi">
                        Rp 0
                    </strong>

                    <small>
                        Nilai transaksi terbesar
                    </small>

                </div>

            </div>


        </div>


        <!-- =========================================
             FILTER
             ========================================= -->

        <div class="report-filter-box">


            <div class="report-filter-header">

                <div>

                    <span>
                        FILTER DATA
                    </span>

                    <h3>
                        Filter Laporan Pembelian
                    </h3>

                </div>


                <button
                    type="button"
                    class="report-reset-button"
                    onclick="resetFilterLaporanPembelian()"
                >
                    ↻ Reset Filter
                </button>

            </div>


            <div class="report-filter-grid">


                <!-- PENCARIAN -->

                <div class="report-filter-group">

                    <label>
                        Cari Transaksi / Pemasok
                    </label>

                    <input
                        type="text"
                        id="filterCariPembelian"
                        placeholder="Nomor pembelian atau nama pemasok..."
                        oninput="terapkanFilterLaporanPembelian()"
                    >

                </div>


                <!-- TANGGAL MULAI -->

                <div class="report-filter-group">

                    <label>
                        Dari Tanggal
                    </label>

                    <input
                        type="date"
                        id="filterTanggalMulaiPembelian"
                        onchange="terapkanFilterLaporanPembelian()"
                    >

                </div>


                <!-- TANGGAL AKHIR -->

                <div class="report-filter-group">

                    <label>
                        Sampai Tanggal
                    </label>

                    <input
                        type="date"
                        id="filterTanggalAkhirPembelian"
                        onchange="terapkanFilterLaporanPembelian()"
                    >

                </div>


            </div>

        </div>

        <!-- ========================================= 
     TABEL TRANSAKSI 
     ========================================= -->

<div class="report-table-box">


    <div class="report-table-header">

        <div>

            <span>
                TRANSAKSI
            </span>

            <h3>
                Daftar Pembelian
            </h3>

        </div>


        <div
            class="report-data-count"
            id="pembelianDataCount"
        >
            0 transaksi
        </div>

    </div>


    <div class="table-container">

        <table class="report-stock-table">

            <thead>

                <tr>

                    <th>
                        No
                    </th>

                    <th>
                        Nomor Pembelian
                    </th>

                    <th>
                        Tanggal
                    </th>

                    <th>
                        Pemasok
                    </th>

                    <th>
                        Nama Barang
                    </th>

                    <th>
                        Jumlah Barang
                    </th>

                    <th>
                        Total Pembelian
                    </th>

                </tr>

            </thead>


            <tbody id="tabelLaporanPembelian">

                <tr>

                    <td colspan="7">

                        <div class="report-loading">
                            Memuat data...
                        </div>

                    </td>

                </tr>

            </tbody>

        </table>

    </div>

</div>


        <!-- =========================================
             CETAK
             ========================================= -->

        <div class="report-action-box">

            <div>

                <span>
                    CETAK LAPORAN
                </span>

                <h3>
                    Laporan Pembelian
                </h3>

                <p>
                    Cetak laporan pembelian sesuai data dan filter yang sedang ditampilkan.
                </p>

            </div>


            <button
                type="button"
                class="report-print-button"
                onclick="cetakLaporanPembelian()"
            >
                🖨️ Cetak Laporan Pembelian
            </button>

        </div>

    `;


    if (!cekSupabase()) {
        return;
    }


    await muatDataLaporanPembelian();

}


// =====================================================
// MUAT DATA LAPORAN PEMBELIAN
// =====================================================

async function muatDataLaporanPembelian() {

    const tabel =
        document.getElementById(
            "tabelLaporanPembelian"
        );


    const { data, error } =
        await supabaseClient
            .from("pembelian")
            .select(`
                id_pembelian,
                nomor_pembelian,
                tanggal_pembelian,
                total_pembelian,

                pemasok (
                    id_pemasok,
                    kode_pemasok,
                    nama_pemasok
                ),

                detail_pembelian (
                    id_detail_pembelian,
                    id_barang,
                    jumlah,
                    harga_beli,
                    subtotal,

                    barang (
                        kode_barang,
                        nama_barang
                    )
                )
            `)
            .order(
                "tanggal_pembelian",
                {
                    ascending: false
                }
            )
            .order(
                "nomor_pembelian",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Gagal memuat laporan pembelian:",
            error
        );


        tabel.innerHTML = `

            <tr>

                <td colspan="7">

                    <div class="report-empty">

                        <div>⚠️</div>

                        <strong>
                            Gagal memuat laporan
                        </strong>

                        <span>
                            ${escapeHtml(error.message)}
                        </span>

                    </div>

                </td>

            </tr>

        `;

        return;
    }


    dataLaporanPembelian =
        data || [];


    terapkanFilterLaporanPembelian();

}

// =====================================================
// FILTER LAPORAN
// =====================================================

function terapkanFilterLaporanPembelian() {

    const inputCari =
        document.getElementById(
            "filterCariPembelian"
        );


    const inputMulai =
        document.getElementById(
            "filterTanggalMulaiPembelian"
        );


    const inputAkhir =
        document.getElementById(
            "filterTanggalAkhirPembelian"
        );


    if (!inputCari || !inputMulai || !inputAkhir) {
        return;
    }


    const keyword =
        inputCari.value
            .trim()
            .toLowerCase();


    const tanggalMulai =
        inputMulai.value;


    const tanggalAkhir =
        inputAkhir.value;


    const hasil =
        dataLaporanPembelian.filter(
            function (item) {

                const nomor =
                    String(
                        item.nomor_pembelian || ""
                    ).toLowerCase();


                const namaPemasok =
                    item.pemasok
                        ? String(
                            item.pemasok.nama_pemasok || ""
                        ).toLowerCase()
                        : "";


                const kodePemasok =
                    item.pemasok
                        ? String(
                            item.pemasok.kode_pemasok || ""
                        ).toLowerCase()
                        : "";


                const cocokCari =
                    !keyword ||
                    nomor.includes(keyword) ||
                    namaPemasok.includes(keyword) ||
                    kodePemasok.includes(keyword);


                const tanggal =
                    item.tanggal_pembelian || "";


                const cocokMulai =
                    !tanggalMulai ||
                    tanggal >= tanggalMulai;


                const cocokAkhir =
                    !tanggalAkhir ||
                    tanggal <= tanggalAkhir;


                return (
                    cocokCari &&
                    cocokMulai &&
                    cocokAkhir
                );

            }
        );

    dataLaporanPembelianTerfilter = hasil;

tampilkanDataLaporanPembelian(
    hasil,
    1
);

    tampilkanRekapPemasokPembelian(
        hasil
    );


    tampilkanSummaryLaporanPembelian(
        hasil
    );

}

// =====================================================
// PAGINATION LAPORAN PEMBELIAN
// =====================================================

let halamanLaporanPembelian = 1;
const dataPerHalamanLaporanPembelian = 10;

function tampilkanDataLaporanPembelian(
    data,
    halaman = 1
) {

    const tabel =
        document.getElementById(
            "tabelLaporanPembelian"
        );


    const count =
        document.getElementById(
            "pembelianDataCount"
        );


    if (!tabel) {
        return;
    }


    if (!data || data.length === 0) {

        if (count) {
            count.textContent = "0 transaksi";
        }

        tabel.innerHTML = `

            <tr>

                <td colspan="7">

                    <div class="report-empty">

                        <div>📭</div>

                        <strong>
                            Tidak ada transaksi
                        </strong>

                        <span>
                            Tidak ditemukan pembelian sesuai filter.
                        </span>

                    </div>

                </td>

            </tr>

        `;

        return;
    }


    // =========================================
    // PAGINATION
    // =========================================

    const totalData =
        data.length;


    const totalHalaman =
        Math.ceil(
            totalData /
            dataPerHalamanLaporanPembelian
        );


    if (halaman < 1) {
        halaman = 1;
    }


    if (halaman > totalHalaman) {
        halaman = totalHalaman;
    }


    halamanLaporanPembelian =
        halaman;


    const mulai =
        (halaman - 1) *
        dataPerHalamanLaporanPembelian;


    const selesai =
        mulai +
        dataPerHalamanLaporanPembelian;


    const dataHalaman =
        data.slice(
            mulai,
            selesai
        );


    if (count) {

        count.textContent =
            `${totalData} transaksi`;

    }


    let html = "";


    dataHalaman.forEach(
        function (item, index) {


            const detail =
                item.detail_pembelian || [];


            // =========================================
            // NAMA BARANG
            // =========================================

            const namaBarang =
                detail.length > 0
                    ? detail
                        .map(
                            function (detailItem) {

                                if (
                                    detailItem.barang
                                ) {

                                    const kode =
                                        detailItem.barang.kode_barang || "";

                                    const nama =
                                        detailItem.barang.nama_barang || "";

                                    if (
                                        kode &&
                                        nama
                                    ) {

                                        return (
                                            kode +
                                            " - " +
                                            nama
                                        );

                                    }

                                    return (
                                        nama ||
                                        kode ||
                                        "-"
                                    );

                                }

                                return "-";

                            }
                        )
                        .join("<br>")
                    : "-";


            // =========================================
            // JUMLAH BARANG
            // =========================================

            const jumlahBarang =
                detail.reduce(
                    function (
                        total,
                        detailItem
                    ) {

                        return (
                            total +
                            Number(
                                detailItem.jumlah || 0
                            )
                        );

                    },
                    0
                );


            // =========================================
            // DATA PEMASOK
            // =========================================

            const namaPemasok =
                item.pemasok
                    ? `${item.pemasok.kode_pemasok} - ${item.pemasok.nama_pemasok}`
                    : "-";


            // =========================================
            // TAMPILKAN BARIS
            // =========================================

            html += `

                <tr>

                    <td>
                        ${mulai + index + 1}
                    </td>

                    <td>

                        <strong>
                            ${escapeHtml(
                                item.nomor_pembelian || "-"
                            )}
                        </strong>

                    </td>

                    <td>
                        ${formatTanggalPembelian(
                            item.tanggal_pembelian
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            namaPemasok
                        )}
                    </td>

                    <td>
                        ${namaBarang}
                    </td>

                    <td>
                        ${jumlahBarang}
                    </td>

                    <td>
                        ${formatRupiah(
                            item.total_pembelian
                        )}
                    </td>

                </tr>

            `;

        }
    );

// =========================================
// PAGINATION BUTTON
// =========================================

html += `

    <tr>

        <td colspan="7">

            <div
                class="pagination"
                style="
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    gap:12px;
                    margin-top:15px;
                "
            >

                <button
                    type="button"
                    class="btn-secondary"
                    onclick="
                        tampilkanDataLaporanPembelian(
                            dataLaporanPembelianTerfilter,
                            ${halaman - 1}
                        )
                    "
                    ${halaman === 1 ? "disabled" : ""}
                >
                    ← Sebelumnya
                </button>


                <span>
                    Halaman ${halaman} dari ${totalHalaman}
                </span>


                <button
                    type="button"
                    class="btn-secondary"
                    onclick="
                        tampilkanDataLaporanPembelian(
                            dataLaporanPembelianTerfilter,
                            ${halaman + 1}
                        )
                    "
                    ${halaman === totalHalaman ? "disabled" : ""}
                >
                    Berikutnya →
                </button>

            </div>

        </td>

    </tr>

`;

    tabel.innerHTML =
        html;

}

// =====================================================
// SUMMARY
// =====================================================

function tampilkanSummaryLaporanPembelian(
    data
) {

    const totalTransaksi =
        data.length;


    let totalBarang = 0;
    let totalNilai = 0;


    const pemasokSet =
        new Set();


    data.forEach(
        function (item) {

            totalNilai +=
                Number(
                    item.total_pembelian || 0
                );


            if (
                item.pemasok &&
                item.pemasok.id_pemasok
            ) {

                pemasokSet.add(
                    item.pemasok.id_pemasok
                );

            }


            const detail =
                item.detail_pembelian || [];


            detail.forEach(
                function (detailItem) {

                    totalBarang +=
                        Number(
                            detailItem.jumlah || 0
                        );

                }
            );

        }
    );


    const rataRata =
        totalTransaksi > 0
            ? totalNilai / totalTransaksi
            : 0;


    setText(
        "pembelianTotalTransaksi",
        totalTransaksi
    );


    setText(
        "pembelianTotalBarang",
        totalBarang
    );


    setText(
        "pembelianTotalNilai",
        formatRupiah(totalNilai)
    );


    setText(
        "pembelianTotalPemasok",
        pemasokSet.size
    );


    setText(
        "pembelianRataRata",
        formatRupiah(rataRata)
    );


    let periode =
        "Semua";


    if (data.length > 0) {

        const tanggal =
            data
                .map(
                    item =>
                        item.tanggal_pembelian
                )
                .filter(Boolean)
                .sort();


        if (tanggal.length > 0) {

            const awal =
                formatTanggalPembelian(
                    tanggal[0]
                );


            const akhir =
                formatTanggalPembelian(
                    tanggal[tanggal.length - 1]
                );


            periode =
                awal === akhir
                    ? awal
                    : `${awal} - ${akhir}`;

        }

    }


    setText(
        "pembelianPeriode",
        periode
    );

}


// =====================================================
// REKAP PER PEMASOK
// =====================================================

function tampilkanRekapPemasokPembelian(
    data
) {

    const tabel =
        document.getElementById(
            "tabelRekapPemasok"
        );


    if (!tabel) {
        return;
    }


    const rekap = {};


    data.forEach(
        function (item) {

            if (!item.pemasok) {
                return;
            }


            const id =
                item.pemasok.id_pemasok;


            if (!rekap[id]) {

                rekap[id] = {

                    kode:
                        item.pemasok.kode_pemasok,

                    nama:
                        item.pemasok.nama_pemasok,

                    transaksi: 0,

                    barang: 0,

                    total: 0

                };

            }


            rekap[id].transaksi += 1;


            rekap[id].total +=
                Number(
                    item.total_pembelian || 0
                );


            const detail =
                item.detail_pembelian || [];


            detail.forEach(
                function (detailItem) {

                    rekap[id].barang +=
                        Number(
                            detailItem.jumlah || 0
                        );

                }
            );

        }
    );


    const daftar =
        Object.values(rekap)
            .sort(
                function (a, b) {

                    return b.total - a.total;

                }
            );


    if (daftar.length === 0) {

        tabel.innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="report-empty">

                        <div>🏢</div>

                        <strong>
                            Belum ada rekap pemasok
                        </strong>

                        <span>
                            Belum terdapat data pemasok pada transaksi.
                        </span>

                    </div>

                </td>

            </tr>

        `;

        return;
    }


    let html = "";


    daftar.forEach(
        function (item, index) {

            html += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.kode || "-"
                        )}
                    </td>

                    <td>

                        <strong>
                            ${escapeHtml(
                                item.nama || "-"
                            )}
                        </strong>

                    </td>

                    <td>
                        ${item.transaksi}
                    </td>

                    <td>
                        ${item.barang}
                    </td>

                    <td>
                        ${formatRupiah(
                            item.total
                        )}
                    </td>

                </tr>

            `;

        }
    );


    tabel.innerHTML =
        html;

}


// =====================================================
// RESET FILTER
// =====================================================

function resetFilterLaporanPembelian() {

    const cari =
        document.getElementById(
            "filterCariPembelian"
        );


    const mulai =
        document.getElementById(
            "filterTanggalMulaiPembelian"
        );


    const akhir =
        document.getElementById(
            "filterTanggalAkhirPembelian"
        );


    if (cari) {
        cari.value = "";
    }


    if (mulai) {
        mulai.value = "";
    }


    if (akhir) {
        akhir.value = "";
    }


    terapkanFilterLaporanPembelian();

}


// =====================================================
// FORMAT TANGGAL
// =====================================================

function formatTanggalPembelian(
    tanggal
) {

    if (!tanggal) {
        return "-";
    }


    const parts =
        String(tanggal).split("-");


    if (parts.length !== 3) {
        return tanggal;
    }


    return `${parts[2]}-${parts[1]}-${parts[0]}`;

}


// =====================================================
// HELPER SET TEXT
// =====================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}

// =====================================================
// CETAK LAPORAN PEMBELIAN
// =====================================================

function cetakLaporanPembelian() {

    const cari =
        document.getElementById(
            "filterCariPembelian"
        );

    const mulai =
        document.getElementById(
            "filterTanggalMulaiPembelian"
        );

    const akhir =
        document.getElementById(
            "filterTanggalAkhirPembelian"
        );


    const keyword =
        cari
            ? cari.value.trim().toLowerCase()
            : "";

    const tanggalMulai =
        mulai
            ? mulai.value
            : "";

    const tanggalAkhir =
        akhir
            ? akhir.value
            : "";


    // =================================================
    // FILTER DATA
    // =================================================

    const data =
        dataLaporanPembelian.filter(
            function (item) {

                const nomor =
                    String(
                        item.nomor_pembelian || ""
                    ).toLowerCase();


                const namaPemasok =
                    item.pemasok
                        ? String(
                            item.pemasok.nama_pemasok || ""
                        ).toLowerCase()
                        : "";


                const kodePemasok =
                    item.pemasok
                        ? String(
                            item.pemasok.kode_pemasok || ""
                        ).toLowerCase()
                        : "";


                const cocokCari =
                    !keyword ||
                    nomor.includes(keyword) ||
                    namaPemasok.includes(keyword) ||
                    kodePemasok.includes(keyword);


                const tanggal =
                    item.tanggal_pembelian || "";


                const cocokMulai =
                    !tanggalMulai ||
                    tanggal >= tanggalMulai;


                const cocokAkhir =
                    !tanggalAkhir ||
                    tanggal <= tanggalAkhir;


                return (
                    cocokCari &&
                    cocokMulai &&
                    cocokAkhir
                );

            }
        );


    // =================================================
    // HITUNG RINGKASAN
    // =================================================

    let totalNilai = 0;
    let totalBarang = 0;

    let pembelianTertinggi = 0;

    const pemasokSet =
        new Set();


    data.forEach(
        function (item) {

            const nilai =
                Number(
                    item.total_pembelian || 0
                );


            totalNilai += nilai;


            if (
                nilai >
                pembelianTertinggi
            ) {
                pembelianTertinggi =
                    nilai;
            }


            if (
                item.pemasok &&
                item.pemasok.id_pemasok
            ) {

                pemasokSet.add(
                    item.pemasok.id_pemasok
                );

            }


            const detail =
                item.detail_pembelian || [];


            detail.forEach(
                function (detailItem) {

                    totalBarang +=
                        Number(
                            detailItem.jumlah || 0
                        );

                }
            );

        }
    );


    const rataRata =
        data.length > 0
            ? totalNilai / data.length
            : 0;


    // =================================================
    // PERIODE
    // =================================================

    let periode =
        "Semua Data";


    if (
        tanggalMulai &&
        tanggalAkhir
    ) {

        periode =
            `${formatTanggalPembelian(
                tanggalMulai
            )} - ${formatTanggalPembelian(
                tanggalAkhir
            )}`;

    } else if (tanggalMulai) {

        periode =
            `Mulai ${formatTanggalPembelian(
                tanggalMulai
            )}`;

    } else if (tanggalAkhir) {

        periode =
            `Sampai ${formatTanggalPembelian(
                tanggalAkhir
            )}`;

    } else if (data.length > 0) {

        const tanggal =
            data
                .map(
                    function (item) {
                        return item.tanggal_pembelian;
                    }
                )
                .filter(Boolean)
                .sort();


        if (tanggal.length > 0) {

            const awal =
                formatTanggalPembelian(
                    tanggal[0]
                );

            const akhir =
                formatTanggalPembelian(
                    tanggal[tanggal.length - 1]
                );


            periode =
                awal === akhir
                    ? awal
                    : `${awal} - ${akhir}`;

        }

    }


    // =================================================
    // NOMOR DOKUMEN
    // =================================================

    const nomorDokumen =
        "LPB-" +
        tanggalHariIni()
            .replace(/\//g, "")
            .replace(/\s/g, "") +
        "-" +
        String(
            data.length
        ).padStart(
            3,
            "0"
        );


    // =================================================
    // BUKA JENDELA CETAK
    // =================================================

    const windowCetak =
        window.open(
            "",
            "_blank",
            "width=1200,height=900"
        );


    if (!windowCetak) {

        alert(
            "Popup diblokir browser. Silakan izinkan popup untuk mencetak laporan."
        );

        return;
    }


// =================================================
// BUAT BARIS TABEL
// =================================================

let rows = "";

let nomor = 1;


data.forEach(
    function (item) {

        const detail =
            item.detail_pembelian || [];


        const jumlahBarang =
            detail.reduce(
                function (
                    total,
                    detailItem
                ) {

                    return (
                        total +
                        Number(
                            detailItem.jumlah || 0
                        )
                    );

                },
                0
            );


        const pemasok =
            item.pemasok
                ? `${item.pemasok.kode_pemasok || "-"} - ${item.pemasok.nama_pemasok || "-"}`
                : "-";


        // =============================================
        // NAMA BARANG
        // =============================================

        const namaBarang =
            detail.length > 0
                ? detail
                    .map(
                        function (detailItem) {

                            if (
                                detailItem.barang
                            ) {

                                const kode =
                                    detailItem.barang.kode_barang || "";

                                const nama =
                                    detailItem.barang.nama_barang || "";

                                if (
                                    kode &&
                                    nama
                                ) {

                                    return (
                                        kode +
                                        " - " +
                                        nama
                                    );

                                }

                                return (
                                    nama ||
                                    kode ||
                                    "-"
                                );

                            }

                            return "-";

                        }
                    )
                    .join("<br>")
                : "-";


        rows += `

            <tr>

                <td class="center">
                    ${nomor}
                </td>

                <td>
                    ${escapeHtml(
                        item.nomor_pembelian || "-"
                    )}
                </td>

                <td class="center">
                    ${formatTanggalPembelian(
                        item.tanggal_pembelian
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        pemasok
                    )}
                </td>

                <td>
                    ${namaBarang}
                </td>

                <td class="number">
                    ${jumlahBarang}
                </td>

                <td class="number">
                    ${formatRupiah(
                        item.total_pembelian
                    )}
                </td>

            </tr>

        `;


        nomor++;

    }
);


if (!rows) {

    rows = `

        <tr>

            <td
                colspan="7"
                class="empty"
            >
                Tidak ada data pembelian
                pada periode yang dipilih.
            </td>

        </tr>

    `;

}

    // =================================================
    // DOKUMEN CETAK
    // =================================================

    windowCetak.document.write(`

        <!DOCTYPE html>

        <html lang="id">

        <head>

            <meta charset="UTF-8">

            <title>
                Laporan Pembelian - Toko Mainan
            </title>


            <style>

                * {
                    box-sizing: border-box;
                }


                @page {
                    size: A4 portrait;
                    margin: 15mm;
                }


                body {

                    margin: 0;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    color: #222;

                    background: #fff;

                    font-size: 10.5px;

                    line-height: 1.45;

                }


                .document {

                    width: 100%;

                }


                /* =====================================
                   HEADER PERUSAHAAN
                   ===================================== */

                .company-header {

                    display: flex;

                    justify-content:
                        space-between;

                    align-items:
                        flex-start;

                    padding-bottom: 14px;

                    border-bottom:
                        2px solid #222;

                }


                .company-name {

                    font-size: 20px;

                    font-weight: bold;

                    letter-spacing:
                        0.8px;

                    margin-bottom: 3px;

                }


                .company-subtitle {

                    font-size: 11px;

                    color: #555;

                }


                .document-meta {

                    text-align: right;

                    font-size: 9px;

                    color: #555;

                }


                .document-meta strong {

                    display: block;

                    margin-top: 2px;

                    color: #222;

                    font-size: 10px;

                }


                /* =====================================
                   JUDUL
                   ===================================== */

                .document-title {

                    text-align: center;

                    margin:
                        20px 0 18px;

                }


                .document-title h1 {

                    margin: 0 0 5px;

                    font-size: 18px;

                    letter-spacing:
                        0.8px;

                }


                .document-title p {

                    margin: 0;

                    color: #555;

                    font-size: 10px;

                }


                /* =====================================
                   PERIODE
                   ===================================== */

                .period-box {

                    display: flex;

                    justify-content:
                        space-between;

                    align-items: center;

                    border:
                        1px solid #bbb;

                    padding:
                        9px 12px;

                    margin-bottom:
                        15px;

                    background: #fafafa;

                }


                .period-box span {

                    color: #555;

                    font-size: 9px;

                    text-transform:
                        uppercase;

                    letter-spacing:
                        0.5px;

                }


                .period-box strong {

                    font-size: 11px;

                }


                /* =====================================
                   SUMMARY
                   ===================================== */

                .summary-grid {

                    display: grid;

                    grid-template-columns:
                        repeat(5, 1fr);

                    gap: 8px;

                    margin-bottom:
                        18px;

                }


                .summary-card {

                    border:
                        1px solid #c7c7c7;

                    padding:
                        10px;

                    min-height:
                        65px;

                }


                .summary-card span {

                    display: block;

                    margin-bottom: 5px;

                    color: #666;

                    font-size: 8px;

                    font-weight: bold;

                    text-transform:
                        uppercase;

                }


                .summary-card strong {

                    display: block;

                    font-size: 13px;

                    color: #222;

                }


                /* =====================================
                   SECTION TITLE
                   ===================================== */

                .section-title {

                    margin:
                        0 0 8px;

                    padding-bottom:
                        5px;

                    border-bottom:
                        1px solid #999;

                    font-size: 11px;

                    font-weight: bold;

                    text-transform:
                        uppercase;

                    letter-spacing:
                        0.4px;

                }


                /* =====================================
                   TABLE
                   ===================================== */

                table {

                    width: 100%;

                    border-collapse:
                        collapse;

                    margin-bottom:
                        15px;

                }


                th {

                    padding:
                        7px 6px;

                    border:
                        1px solid #999;

                    background:
                        #eeeeee;

                    color: #222;

                    font-size: 9px;

                    font-weight: bold;

                    text-align:
                        center;

                }


                td {

                    padding:
                        7px 6px;

                    border:
                        1px solid #bbb;

                    vertical-align:
                        middle;

                }


                tbody tr:nth-child(even) {

                    background:
                        #fafafa;

                }


                .center {

                    text-align:
                        center;

                }


                .number {

                    text-align:
                        right;

                    white-space:
                        nowrap;

                }


                .empty {

                    text-align:
                        center;

                    padding:
                        20px;

                    color: #777;

                }


                /* =====================================
                   TOTAL
                   ===================================== */

                .total-box {

                    width: 330px;

                    margin-left:
                        auto;

                    margin-top:
                        8px;

                    border:
                        1px solid #999;

                }


                .total-row {

                    display: flex;

                    justify-content:
                        space-between;

                    gap: 20px;

                    padding:
                        7px 10px;

                    border-bottom:
                        1px solid #ddd;

                }


                .total-row:last-child {

                    border-bottom:
                        none;

                    background:
                        #eeeeee;

                    font-weight:
                        bold;

                }


                .total-label {

                    color: #555;

                }


                .total-value {

                    text-align:
                        right;

                    white-space:
                        nowrap;

                }


                /* =====================================
                   CATATAN
                   ===================================== */

                .notes {

                    margin-top:
                        20px;

                    padding:
                        10px 12px;

                    border:
                        1px solid #ccc;

                    background:
                        #fafafa;

                    font-size: 9px;

                    color: #555;

                }


                .notes strong {

                    display: block;

                    margin-bottom:
                        4px;

                    color: #333;

                }


                /* =====================================
                   TANDA TANGAN
                   ===================================== */

                .signature-section {

                    margin-top:
                        35px;

                    display: grid;

                    grid-template-columns:
                        repeat(3, 1fr);

                    gap: 25px;

                    page-break-inside:
                        avoid;

                }


                .signature {

                    text-align:
                        center;

                }


                .signature-title {

                    margin-bottom:
                        50px;

                    font-size: 9px;

                    color: #555;

                }


                .signature-line {

                    border-bottom:
                        1px solid #333;

                    margin:
                        0 15px 5px;

                }


                .signature-role {

                    font-size: 9px;

                    font-weight: bold;

                }


                /* =====================================
                   FOOTER
                   ===================================== */

                .footer {

                    margin-top:
                        28px;

                    padding-top:
                        8px;

                    border-top:
                        1px solid #ccc;

                    text-align:
                        center;

                    color: #777;

                    font-size: 8px;

                }


                /* =====================================
                   PRINT
                   ===================================== */

                @media print {

                    body {

                        margin: 0;

                    }

                    .no-print {

                        display: none !important;

                    }

                    thead {

                        display: table-header-group;

                    }

                    tr {

                        page-break-inside:
                            avoid;

                    }

                }

            </style>

        </head>


        <body>

            <div class="document">


                <!-- =================================
                     HEADER PERUSAHAAN
                     ================================= -->

                <div class="company-header">

                    <div>

                        <div class="company-name">
                            TOKO MAINAN
                        </div>

                        <div class="company-subtitle">
                            Sistem Akuntansi Persediaan
                        </div>

                    </div>


                    <div class="document-meta">

                        Nomor Dokumen

                        <strong>
                            ${nomorDokumen}
                        </strong>


                        Tanggal Cetak

                        <strong>
                            ${tanggalHariIni()}
                        </strong>

                    </div>

                </div>


                <!-- =================================
                     JUDUL
                     ================================= -->

                <div class="document-title">

                    <h1>
                        LAPORAN PEMBELIAN
                    </h1>

                    <p>
                        Rekapitulasi transaksi pembelian barang
                    </p>

                </div>


                <!-- =================================
                     PERIODE
                     ================================= -->

                <div class="period-box">

                    <span>
                        Periode Laporan
                    </span>

                    <strong>
                        ${escapeHtml(
                            periode
                        )}
                    </strong>

                </div>


                <!-- =================================
                     SUMMARY
                     ================================= -->

                <div class="summary-grid">


                    <div class="summary-card">

                        <span>
                            Total Transaksi
                        </span>

                        <strong>
                            ${data.length}
                        </strong>

                    </div>


                    <div class="summary-card">

                        <span>
                            Total Barang
                        </span>

                        <strong>
                            ${totalBarang}
                        </strong>

                    </div>


                    <div class="summary-card">

                        <span>
                            Total Pemasok
                        </span>

                        <strong>
                            ${pemasokSet.size}
                        </strong>

                    </div>


                    <div class="summary-card">

                        <span>
                            Rata-rata Pembelian
                        </span>

                        <strong>
                            ${formatRupiah(
                                rataRata
                            )}
                        </strong>

                    </div>


                    <div class="summary-card">

                        <span>
                            Pembelian Tertinggi
                        </span>

                        <strong>
                            ${formatRupiah(
                                pembelianTertinggi
                            )}
                        </strong>

                    </div>


                </div>


                <!-- =================================
                     TABLE
                     ================================= -->

                <div class="section-title">

                    Detail Transaksi Pembelian

                </div>


                <table>

                    <thead>

    <tr>

        <th style="width: 5%;">
            No
        </th>

        <th style="width: 15%;">
            Nomor Pembelian
        </th>

        <th style="width: 13%;">
            Tanggal
        </th>

        <th style="width: 25%;">
            Pemasok
        </th>

        <th style="width: 20%;">
            Nama Barang
        </th>

        <th style="width: 12%;">
            Jumlah Barang
        </th>

        <th style="width: 10%;">
            Total Pembelian
        </th>

    </tr>

</thead>

                    <tbody>

                        ${rows}

                    </tbody>

                </table>


                <!-- =================================
                     TOTAL
                     ================================= -->

                <div class="total-box">

                    <div class="total-row">

                        <span class="total-label">
                            Total Transaksi
                        </span>

                        <span class="total-value">
                            ${data.length}
                        </span>

                    </div>


                    <div class="total-row">

                        <span class="total-label">
                            Total Barang
                        </span>

                        <span class="total-value">
                            ${totalBarang}
                        </span>

                    </div>


                    <div class="total-row">

                        <span class="total-label">
                            Total Nilai Pembelian
                        </span>

                        <span class="total-value">
                            ${formatRupiah(
                                totalNilai
                            )}
                        </span>

                    </div>

                </div>


                <!-- =================================
                     CATATAN
                     ================================= -->

                <div class="notes">

                    <strong>
                        Catatan Laporan
                    </strong>

                    Laporan ini menampilkan transaksi
                    pembelian berdasarkan data yang tersedia
                    pada Sistem Akuntansi Persediaan Toko Mainan.
                    Nilai pembelian dihitung berdasarkan total
                    pembelian pada setiap transaksi.

                </div>


                <!-- =================================
                     TANDA TANGAN
                     ================================= -->

                <div class="signature-section">


                    <div class="signature">

                        <div class="signature-title">
                            Dibuat Oleh
                        </div>

                        <div class="signature-line"></div>

                        <div class="signature-role">
                            Petugas Pembelian
                        </div>

                    </div>


                    <div class="signature">

                        <div class="signature-title">
                            Diperiksa Oleh
                        </div>

                        <div class="signature-line"></div>

                        <div class="signature-role">
                            Supervisor
                        </div>

                    </div>


                    <div class="signature">

                        <div class="signature-title">
                            Disetujui Oleh
                        </div>

                        <div class="signature-line"></div>

                        <div class="signature-role">
                            Pimpinan
                        </div>

                    </div>


                </div>


                <!-- =================================
                     FOOTER
                     ================================= -->

                <div class="footer">

                    Dokumen ini dibuat secara otomatis
                    oleh Sistem Akuntansi Persediaan Toko Mainan.

                    <br>

                    Dicetak pada:
                    ${tanggalHariIni()}

                </div>


            </div>


            <script>

                window.onload = function () {

                    setTimeout(
                        function () {

                            window.print();

                        },
                        500
                    );

                };

            <\/script>


        </body>

        </html>

    `);


    windowCetak.document.close();

}

// =====================================================
// LAPORAN PENJUALAN
// =====================================================

let dataLaporanPenjualan = [];


// =====================================================
// TAMPILAN LAPORAN PENJUALAN
// =====================================================

async function laporanPenjualan() {

    ubahJudul("Laporan Penjualan");

    aktifkanMenu("Laporan Penjualan");

    const isi = document.getElementById("isi");

    isi.innerHTML = `

        <!-- =========================================
             HEADER LAPORAN
             ========================================= -->

        <div class="report-header">

            <div>

                <span class="report-label">
                    LAPORAN TRANSAKSI
                </span>

                <h2>
                    Laporan Penjualan
                </h2>

                <p>
                    Ringkasan transaksi penjualan dan aktivitas penjualan toko.
                </p>


                <!-- PERIODE DATA -->

                <div class="report-period-info">

                    <span>
                        Periode Data
                    </span>

                    <strong id="penjualanPeriode">
                        Semua
                    </strong>

                </div>

            </div>


            <div class="report-header-date">

                <span>
                    Tanggal Laporan
                </span>

                <strong>
                    ${tanggalHariIni()}
                </strong>

            </div>

        </div>


        <!-- =========================================
             SUMMARY
             ========================================= -->

        <div class="report-summary-grid">


            <!-- =====================================
                 1. TOTAL TRANSAKSI
                 ===================================== -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    💰
                </div>

                <div>

                    <span>
                        Total Transaksi
                    </span>

                    <strong id="penjualanTotalTransaksi">
                        0
                    </strong>

                    <small>
                        Transaksi penjualan
                    </small>

                </div>

            </div>


            <!-- =====================================
                 2. TOTAL BARANG
                 ===================================== -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    📦
                </div>

                <div>

                    <span>
                        Total Barang Terjual
                    </span>

                    <strong id="penjualanTotalBarang">
                        0
                    </strong>

                    <small>
                        Unit barang
                    </small>

                </div>

            </div>


            <!-- =====================================
                 3. TOTAL NILAI
                 ===================================== -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    💵
                </div>

                <div>

                    <span>
                        Total Nilai Penjualan
                    </span>

                    <strong id="penjualanTotalNilai">
                        Rp 0
                    </strong>

                    <small>
                        Nilai seluruh penjualan
                    </small>

                </div>

            </div>


            <!-- =====================================
                 4. TOTAL PELANGGAN
                 ===================================== -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    👤
                </div>

                <div>

                    <span>
                        Total Pelanggan
                    </span>

                    <strong id="penjualanTotalPelanggan">
                        0
                    </strong>

                    <small>
                        Pelanggan terlibat
                    </small>

                </div>

            </div>


            <!-- =====================================
                 5. RATA-RATA PENJUALAN
                 ===================================== -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    📊
                </div>

                <div>

                    <span>
                        Rata-rata Penjualan
                    </span>

                    <strong id="penjualanRataRata">
                        Rp 0
                    </strong>

                    <small>
                        Per transaksi
                    </small>

                </div>

            </div>


            <!-- =====================================
                 6. PENJUALAN TERTINGGI
                 ===================================== -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    🔝
                </div>

                <div>

                    <span>
                        Penjualan Tertinggi
                    </span>

                    <strong id="penjualanTertinggi">
                        Rp 0
                    </strong>

                    <small>
                        Transaksi terbesar
                    </small>

                </div>

            </div>

        </div>


        <!-- =========================================
             FILTER
             ========================================= -->

        <div class="report-filter-box">

            <div class="report-filter-header">

                <div>

                    <span>
                        FILTER DATA
                    </span>

                    <h3>
                        Filter Laporan Penjualan
                    </h3>

                </div>


                <button
                    type="button"
                    class="report-reset-button"
                    onclick="resetFilterLaporanPenjualan()"
                >
                    ↻ Reset Filter
                </button>

            </div>


            <div class="report-filter-grid">


                <!-- PENCARIAN -->

                <div class="report-filter-group">

                    <label>
                        Cari Transaksi / Pelanggan
                    </label>

                    <input
                        type="text"
                        id="filterCariPenjualan"
                        placeholder="Nomor penjualan atau nama pelanggan..."
                        oninput="terapkanFilterLaporanPenjualan()"
                    >

                </div>


                <!-- TANGGAL MULAI -->

                <div class="report-filter-group">

                    <label>
                        Dari Tanggal
                    </label>

                    <input
                        type="date"
                        id="filterTanggalMulaiPenjualan"
                        onchange="terapkanFilterLaporanPenjualan()"
                    >

                </div>


                <!-- TANGGAL AKHIR -->

                <div class="report-filter-group">

                    <label>
                        Sampai Tanggal
                    </label>

                    <input
                        type="date"
                        id="filterTanggalAkhirPenjualan"
                        onchange="terapkanFilterLaporanPenjualan()"
                    >

                </div>

            </div>

        </div>


        <!-- =========================================
     TABEL TRANSAKSI
     ========================================= -->

<div class="report-table-box">

    <div class="report-table-header">

        <div>

            <span>
                TRANSAKSI
            </span>

            <h3>
                Daftar Penjualan
            </h3>

        </div>


        <div
            class="report-data-count"
            id="penjualanDataCount"
        >
            0 transaksi
        </div>

    </div>


    <div class="table-container">

        <table class="report-stock-table">

            <thead>

                <tr>

                    <th>
                        No
                    </th>

                    <th>
                        Nomor Penjualan
                    </th>

                    <th>
                        Tanggal
                    </th>

                    <th>
                        Pelanggan
                    </th>

                    <th>
                        Nama Barang
                    </th>

                    <th>
                        Jumlah Barang
                    </th>

                    <th>
                        Total Penjualan
                    </th>

                </tr>

            </thead>


            <tbody id="tabelLaporanPenjualan">

                <tr>

                    <td colspan="7">

                        <div class="report-loading">
                            Memuat data...
                        </div>

                    </td>

                </tr>

            </tbody>

        </table>

    </div>

</div>

        <!-- =========================================
             REKAP PELANGGAN
             ========================================= -->

        <div class="report-table-box">

            <div class="report-table-header">

                <div>

                    <span>
                        REKAP PELANGGAN
                    </span>

                    <h3>
                        Ringkasan Penjualan per Pelanggan
                    </h3>

                </div>

            </div>


            <div class="table-container">

                <table>

                    <thead>

    <tr>

        <th>
            No
        </th>

        <th>
            Kode Pelanggan
        </th>

        <th>
            Nama Pelanggan
        </th>

        <th>
            Nama Barang
        </th>

        <th>
            Transaksi
        </th>

        <th>
            Total Barang
        </th>

        <th>
            Total Penjualan
        </th>

    </tr>

</thead>


                    <tbody id="tabelRekapPelanggan">

                        <tr>

                            <td colspan="7">

                                <div class="report-loading">
                                    Memuat rekap...
                                </div>

                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>


        <!-- =========================================
             CETAK
             ========================================= -->

        <div class="report-action-box">

            <div>

                <span>
                    CETAK LAPORAN
                </span>

                <h3>
                    Laporan Penjualan
                </h3>

                <p>
                    Cetak laporan penjualan sesuai data dan filter yang sedang ditampilkan.
                </p>

            </div>


            <button
                type="button"
                class="report-print-button"
                onclick="cetakLaporanPenjualan()"
            >
                🖨️ Cetak Laporan Penjualan
            </button>

        </div>

    `;


    if (!cekSupabase()) {
        return;
    }


    await muatDataLaporanPenjualan();

}

// =====================================================
// MUAT DATA PENJUALAN
// =====================================================

async function muatDataLaporanPenjualan() {

    const tabel =
        document.getElementById(
            "tabelLaporanPenjualan"
        );


    const { data, error } =
        await supabaseClient
            .from("penjualan")
            .select(`
                id_penjualan,
                nomor_penjualan,
                tanggal_penjualan,
                total_penjualan,

                pelanggan (
                    id_pelanggan,
                    kode_pelanggan,
                    nama_pelanggan
                ),

                detail_penjualan (
                    id_detail_penjualan,
                    id_barang,
                    jumlah,
                    harga_jual,
                    subtotal,

                    barang (
                        kode_barang,
                        nama_barang
                    )
                )
            `)
            .order(
                "tanggal_penjualan",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Gagal memuat laporan penjualan:",
            error
        );


        tabel.innerHTML = `

            <tr>

                <td colspan="7">

                    <div class="report-empty">

                        <div>
                            ⚠️
                        </div>

                        <strong>
                            Gagal memuat laporan
                        </strong>

                        <span>
                            ${escapeHtml(error.message)}
                        </span>

                    </div>

                </td>

            </tr>

        `;

        return;
    }


    dataLaporanPenjualan =
        data || [];


    terapkanFilterLaporanPenjualan();

}
 
// ===================================================== 
// FILTER LAPORAN 
// ===================================================== 
 
function terapkanFilterLaporanPenjualan() { 
 
    const inputCari = 
        document.getElementById( 
            "filterCariPenjualan" 
        ); 
 
 
    const inputMulai = 
        document.getElementById( 
            "filterTanggalMulaiPenjualan" 
        ); 
 
 
    const inputAkhir = 
        document.getElementById( 
            "filterTanggalAkhirPenjualan" 
        ); 
 
 
    if ( 
        !inputCari || 
        !inputMulai || 
        !inputAkhir 
    ) { 
        return; 
    } 
 
 
    const keyword = 
        inputCari.value 
            .trim() 
            .toLowerCase(); 
 
 
    const tanggalMulai = 
        inputMulai.value; 
 
 
    const tanggalAkhir = 
        inputAkhir.value; 
 
 
    const hasil = 
        dataLaporanPenjualan.filter( 
            function (item) { 
 
                const nomor = 
                    String( 
                        item.nomor_penjualan || "" 
                    ).toLowerCase(); 
 
 
                const namaPelanggan = 
                    item.pelanggan 
                        ? String( 
                            item.pelanggan.nama_pelanggan || "" 
                        ).toLowerCase() 
                        : ""; 
 
 
                const kodePelanggan = 
                    item.pelanggan 
                        ? String( 
                            item.pelanggan.kode_pelanggan || "" 
                        ).toLowerCase() 
                        : ""; 
 
 
                const cocokCari = 
                    !keyword || 
                    nomor.includes(keyword) || 
                    namaPelanggan.includes(keyword) || 
                    kodePelanggan.includes(keyword); 
 
 
                const tanggal = 
                    item.tanggal_penjualan || ""; 
 
 
                const cocokMulai = 
                    !tanggalMulai || 
                    tanggal >= tanggalMulai; 
 
 
                const cocokAkhir = 
                    !tanggalAkhir || 
                    tanggal <= tanggalAkhir; 
 
 
                return ( 
                    cocokCari && 
                    cocokMulai && 
                    cocokAkhir 
                ); 
 
            } 
        ); 
 
 
  dataLaporanPenjualanTerfilter = hasil;

tampilkanDataLaporanPenjualan(
    hasil,
    1
);
 
 
    tampilkanRekapPelangganPenjualan( 
        hasil 
    ); 
 
 
    tampilkanSummaryLaporanPenjualan( 
        hasil 
    ); 
 
} 
// =====================================================
// PAGINATION LAPORAN PENJUALAN
// =====================================================

let halamanLaporanPenjualan = 1;
const dataPerHalamanLaporanPenjualan = 10;

// =====================================================
// TAMPILKAN TABEL PENJUALAN
// =====================================================

function tampilkanDataLaporanPenjualan(
    data,
    halaman = 1
) {

    const tabel =
        document.getElementById(
            "tabelLaporanPenjualan"
        );

    const count =
        document.getElementById(
            "penjualanDataCount"
        );

    if (!tabel) {
        return;
    }

    if (
        !data ||
        data.length === 0
    ) {

        if (count) {
            count.textContent = "0 transaksi";
        }

        tabel.innerHTML = `

            <tr>

                <td colspan="7">

                    <div class="report-empty">

                        <div>
                            📭
                        </div>

                        <strong>
                            Tidak ada transaksi
                        </strong>

                        <span>
                            Tidak ditemukan penjualan sesuai filter.
                        </span>

                    </div>

                </td>

            </tr>

        `;

        return;
    }


    // =====================================================
    // HITUNG PAGINATION
    // =====================================================

    const totalData =
        data.length;

    const totalHalaman =
        Math.ceil(
            totalData /
            dataPerHalamanLaporanPenjualan
        );


    if (halaman < 1) {
        halaman = 1;
    }

    if (halaman > totalHalaman) {
        halaman = totalHalaman;
    }


    halamanLaporanPenjualan =
        halaman;


    const mulai =
        (halaman - 1) *
        dataPerHalamanLaporanPenjualan;

    const selesai =
        mulai +
        dataPerHalamanLaporanPenjualan;


    const dataHalaman =
        data.slice(
            mulai,
            selesai
        );


    if (count) {

        count.textContent =
            `${totalData} transaksi`;

    }


    let html = "";


    dataHalaman.forEach(
        function (item, index) {

            const detail =
                item.detail_penjualan || [];


            const jumlahBarang =
                detail.reduce(
                    function (
                        total,
                        detailItem
                    ) {

                        return (
                            total +
                            Number(
                                detailItem.jumlah || 0
                            )
                        );

                    },
                    0
                );


            const namaPelanggan =
                item.pelanggan
                    ? `${item.pelanggan.kode_pelanggan} - ${item.pelanggan.nama_pelanggan}`
                    : "-";


            // =========================================
            // NAMA BARANG
            // =========================================

            const namaBarang =
                detail.length > 0
                    ? detail
                        .map(
                            function (detailItem) {

                                if (
                                    detailItem.barang
                                ) {

                                    const kode =
                                        detailItem.barang.kode_barang || "";

                                    const nama =
                                        detailItem.barang.nama_barang || "";


                                    if (
                                        kode &&
                                        nama
                                    ) {

                                        return (
                                            kode +
                                            " - " +
                                            nama
                                        );

                                    }


                                    return (
                                        nama ||
                                        kode ||
                                        "-"
                                    );

                                }


                                return "-";

                            }
                        )
                        .join("<br>")
                    : "-";


            html += `

                <tr>

                    <td>
                        ${mulai + index + 1}
                    </td>

                    <td>

                        <strong>
                            ${escapeHtml(
                                item.nomor_penjualan || "-"
                            )}
                        </strong>

                    </td>

                    <td>
                        ${formatTanggalPenjualan(
                            item.tanggal_penjualan
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            namaPelanggan
                        )}
                    </td>

                    <td>
                        ${namaBarang}
                    </td>

                    <td>
                        ${jumlahBarang}
                    </td>

                    <td>
                        ${formatRupiah(
                            item.total_penjualan
                        )}
                    </td>

                </tr>

            `;

        }
    );


    // =====================================================
    // PAGINATION
    // =====================================================

    html += `

        <tr>

            <td colspan="7">

                <div
                    class="pagination"
                    style="
                        display:flex;
                        justify-content:center;
                        align-items:center;
                        gap:10px;
                        padding:15px 0;
                    "
                >

                    <button
                        type="button"
                        onclick="
                            tampilkanDataLaporanPenjualan(
                                dataLaporanPenjualanTerfilter,
                                ${halaman - 1}
                            )
                        "
                        ${halaman === 1 ? "disabled" : ""}
                    >
                        ← Sebelumnya
                    </button>


                    <span>
                        Halaman ${halaman} dari ${totalHalaman}
                    </span>


                    <button
                        type="button"
                        onclick="
                            tampilkanDataLaporanPenjualan(
                                dataLaporanPenjualanTerfilter,
                                ${halaman + 1}
                            )
                        "
                        ${halaman === totalHalaman ? "disabled" : ""}
                    >
                        Berikutnya →
                    </button>

                </div>

            </td>

        </tr>

    `;


    tabel.innerHTML =
        html;

}

// =====================================================
// SUMMARY
// =====================================================

function tampilkanSummaryLaporanPenjualan(
    data
) {

    const totalTransaksi =
        data.length;


    let totalBarang = 0;
    let totalNilai = 0;
    let penjualanTertinggi = 0;


    const pelangganSet =
        new Set();


    data.forEach(
        function (item) {

            const totalPenjualan =
                Number(
                    item.total_penjualan || 0
                );


            totalNilai +=
                totalPenjualan;


            if (
                totalPenjualan >
                penjualanTertinggi
            ) {

                penjualanTertinggi =
                    totalPenjualan;

            }


            if (
                item.pelanggan &&
                item.pelanggan.id_pelanggan
            ) {

                pelangganSet.add(
                    item.pelanggan.id_pelanggan
                );

            }


            const detail =
                item.detail_penjualan || [];


            detail.forEach(
                function (detailItem) {

                    totalBarang +=
                        Number(
                            detailItem.jumlah || 0
                        );

                }
            );

        }
    );


    const rataRata =
        totalTransaksi > 0
            ? totalNilai / totalTransaksi
            : 0;


    // =============================================
    // TAMPILKAN SUMMARY
    // =============================================

    setText(
        "penjualanTotalTransaksi",
        totalTransaksi
    );


    setText(
        "penjualanTotalBarang",
        totalBarang
    );


    setText(
        "penjualanTotalNilai",
        formatRupiah(
            totalNilai
        )
    );


    setText(
        "penjualanTotalPelanggan",
        pelangganSet.size
    );


    setText(
        "penjualanRataRata",
        formatRupiah(
            rataRata
        )
    );


    setText(
        "penjualanTertinggi",
        formatRupiah(
            penjualanTertinggi
        )
    );


    // =============================================
    // PERIODE DATA
    // =============================================

    let periode =
        "Semua";


    if (data.length > 0) {

        const tanggal =
            data
                .map(
                    function (item) {
                        return item.tanggal_penjualan;
                    }
                )
                .filter(Boolean)
                .sort();


        if (tanggal.length > 0) {

            const awal =
                formatTanggalPenjualan(
                    tanggal[0]
                );


            const akhir =
                formatTanggalPenjualan(
                    tanggal[tanggal.length - 1]
                );


            periode =
                awal === akhir
                    ? awal
                    : `${awal} - ${akhir}`;

        }

    }


    setText(
        "penjualanPeriode",
        periode
    );

}

// =====================================================
// REKAP PER PELANGGAN
// =====================================================

function tampilkanRekapPelangganPenjualan(
    data
) {

    const tabel =
        document.getElementById(
            "tabelRekapPelanggan"
        );


    if (!tabel) {
        return;
    }


    const rekap = {};


    data.forEach(
        function (item) {

            if (!item.pelanggan) {
                return;
            }


            const id =
                item.pelanggan.id_pelanggan;


            if (!rekap[id]) {

                rekap[id] = {

                    kode:
                        item.pelanggan.kode_pelanggan,

                    nama:
                        item.pelanggan.nama_pelanggan,

                    namaBarang: [],

                    transaksi: 0,

                    barang: 0,

                    total: 0

                };

            }


            rekap[id].transaksi +=
                1;


            rekap[id].total +=
                Number(
                    item.total_penjualan || 0
                );


            const detail =
                item.detail_penjualan || [];


            detail.forEach(
                function (detailItem) {

                    rekap[id].barang +=
                        Number(
                            detailItem.jumlah || 0
                        );


                    if (
                        detailItem.barang
                    ) {

                        const kodeBarang =
                            detailItem.barang.kode_barang || "";

                        const namaBarang =
                            detailItem.barang.nama_barang || "";


                        let namaLengkap = "";


                        if (
                            kodeBarang &&
                            namaBarang
                        ) {

                            namaLengkap =
                                kodeBarang +
                                " - " +
                                namaBarang;

                        } else {

                            namaLengkap =
                                namaBarang ||
                                kodeBarang ||
                                "-";

                        }


                        if (
                            !rekap[id].namaBarang.includes(
                                namaLengkap
                            )
                        ) {

                            rekap[id].namaBarang.push(
                                namaLengkap
                            );

                        }

                    }

                }
            );

        }
    );


    const daftar =
        Object.values(rekap)
            .sort(
                function (a, b) {

                    return (
                        b.total -
                        a.total
                    );

                }
            );


    if (daftar.length === 0) {

        tabel.innerHTML = `

            <tr>

                <td colspan="7">

                    <div class="report-empty">

                        <div>
                            👤
                        </div>

                        <strong>
                            Belum ada rekap pelanggan
                        </strong>

                        <span>
                            Belum terdapat data pelanggan pada transaksi.
                        </span>

                    </div>

                </td>

            </tr>

        `;

        return;
    }


    let html = "";


    daftar.forEach(
        function (item, index) {

            html += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.kode || "-"
                        )}
                    </td>

                    <td>

                        <strong>
                            ${escapeHtml(
                                item.nama || "-"
                            )}
                        </strong>

                    </td>

                    <td>

                        ${
                            item.namaBarang.length > 0
                                ? item.namaBarang
                                    .map(
                                        function (namaBarang) {
                                            return escapeHtml(
                                                namaBarang
                                            );
                                        }
                                    )
                                    .join("<br>")
                                : "-"
                        }

                    </td>

                    <td>
                        ${item.transaksi}
                    </td>

                    <td>
                        ${item.barang}
                    </td>

                    <td>
                        ${formatRupiah(
                            item.total
                        )}
                    </td>

                </tr>

            `;

        }
    );


    tabel.innerHTML =
        html;

}

// =====================================================
// RESET FILTER
// =====================================================

function resetFilterLaporanPenjualan() {

    const cari =
        document.getElementById(
            "filterCariPenjualan"
        );


    const mulai =
        document.getElementById(
            "filterTanggalMulaiPenjualan"
        );


    const akhir =
        document.getElementById(
            "filterTanggalAkhirPenjualan"
        );


    if (cari) {
        cari.value = "";
    }


    if (mulai) {
        mulai.value = "";
    }


    if (akhir) {
        akhir.value = "";
    }


    terapkanFilterLaporanPenjualan();

}


// =====================================================
// FORMAT TANGGAL
// =====================================================

function formatTanggalPenjualan(
    tanggal
) {

    if (!tanggal) {
        return "-";
    }


    const parts =
        String(tanggal).split("-");


    if (parts.length !== 3) {
        return tanggal;
    }


    return (
        `${parts[2]}-${parts[1]}-${parts[0]}`
    );

}


// =====================================================
// CETAK LAPORAN PENJUALAN
// =====================================================

function cetakLaporanPenjualan() {

    const cari =
        document.getElementById(
            "filterCariPenjualan"
        );


    const mulai =
        document.getElementById(
            "filterTanggalMulaiPenjualan"
        );


    const akhir =
        document.getElementById(
            "filterTanggalAkhirPenjualan"
        );


    const keyword =
        cari
            ? cari.value.trim().toLowerCase()
            : "";


    const tanggalMulai =
        mulai
            ? mulai.value
            : "";


    const tanggalAkhir =
        akhir
            ? akhir.value
            : "";


    // =================================================
    // FILTER DATA
    // =================================================

    const data =
        dataLaporanPenjualan.filter(
            function (item) {

                const nomor =
                    String(
                        item.nomor_penjualan || ""
                    ).toLowerCase();


                const namaPelanggan =
                    item.pelanggan
                        ? String(
                            item.pelanggan.nama_pelanggan || ""
                        ).toLowerCase()
                        : "";


                const kodePelanggan =
                    item.pelanggan
                        ? String(
                            item.pelanggan.kode_pelanggan || ""
                        ).toLowerCase()
                        : "";


                const cocokCari =
                    !keyword ||
                    nomor.includes(keyword) ||
                    namaPelanggan.includes(keyword) ||
                    kodePelanggan.includes(keyword);


                const tanggal =
                    item.tanggal_penjualan || "";


                const cocokMulai =
                    !tanggalMulai ||
                    tanggal >= tanggalMulai;


                const cocokAkhir =
                    !tanggalAkhir ||
                    tanggal <= tanggalAkhir;


                return (
                    cocokCari &&
                    cocokMulai &&
                    cocokAkhir
                );

            }
        );


    // =================================================
    // HITUNG RINGKASAN
    // =================================================

    let totalNilai = 0;

    let totalBarang = 0;

    let penjualanTertinggi = 0;


    const pelangganSet =
        new Set();


    data.forEach(
        function (item) {

            const nilai =
                Number(
                    item.total_penjualan || 0
                );


            totalNilai += nilai;


            if (
                nilai >
                penjualanTertinggi
            ) {

                penjualanTertinggi =
                    nilai;

            }


            if (
                item.pelanggan &&
                item.pelanggan.id_pelanggan
            ) {

                pelangganSet.add(
                    item.pelanggan.id_pelanggan
                );

            }


            const detail =
                item.detail_penjualan || [];


            detail.forEach(
                function (detailItem) {

                    totalBarang +=
                        Number(
                            detailItem.jumlah || 0
                        );

                }
            );

        }
    );


    const rataRata =
        data.length > 0
            ? totalNilai / data.length
            : 0;


    // =================================================
    // PERIODE
    // =================================================

    let periode =
        "Semua Data";


    if (
        tanggalMulai &&
        tanggalAkhir
    ) {

        periode =
            `${formatTanggalPenjualan(
                tanggalMulai
            )} - ${formatTanggalPenjualan(
                tanggalAkhir
            )}`;

    }
    else if (tanggalMulai) {

        periode =
            `Mulai ${formatTanggalPenjualan(
                tanggalMulai
            )}`;

    }
    else if (tanggalAkhir) {

        periode =
            `Sampai ${formatTanggalPenjualan(
                tanggalAkhir
            )}`;

    }
    else if (data.length > 0) {

        const tanggal =
            data
                .map(
                    function (item) {
                        return item.tanggal_penjualan;
                    }
                )
                .filter(Boolean)
                .sort();


        if (tanggal.length > 0) {

            const awal =
                formatTanggalPenjualan(
                    tanggal[0]
                );


            const akhir =
                formatTanggalPenjualan(
                    tanggal[tanggal.length - 1]
                );


            periode =
                awal === akhir
                    ? awal
                    : `${awal} - ${akhir}`;

        }

    }


    // =================================================
    // NOMOR DOKUMEN
    // =================================================

    const nomorDokumen =
        "LPN-" +
        tanggalHariIni()
            .replace(/\//g, "")
            .replace(/\s/g, "") +
        "-" +
        String(
            data.length
        ).padStart(
            3,
            "0"
        );


    // =================================================
    // BUKA WINDOW CETAK
    // =================================================

    const windowCetak =
        window.open(
            "",
            "_blank",
            "width=1200,height=900"
        );


    if (!windowCetak) {

        alert(
            "Popup diblokir browser. Silakan izinkan popup untuk mencetak laporan."
        );

        return;

    }


// =================================================
// BARIS TABEL
// =================================================

let rows = "";

data.forEach(
    function (item, index) {

        const detail =
            item.detail_penjualan || [];

        const jumlahBarang =
            detail.reduce(
                function (
                    total,
                    detailItem
                ) {

                    return (
                        total +
                        Number(
                            detailItem.jumlah || 0
                        )
                    );

                },
                0
            );

        const namaBarang =
            detail.length > 0
                ? detail
                    .map(
                        function (detailItem) {

                            if (detailItem.barang) {

                                const kode =
                                    detailItem.barang.kode_barang || "";

                                const nama =
                                    detailItem.barang.nama_barang || "";

                                if (kode && nama) {
                                    return kode + " - " + nama;
                                }

                                return nama || kode || "-";
                            }

                            return "-";

                        }
                    )
                    .join("<br>")
                : "-";

        const pelanggan =
            item.pelanggan
                ? `${item.pelanggan.kode_pelanggan || "-"} - ${item.pelanggan.nama_pelanggan || "-"}`
                : "-";

        rows += `

            <tr>

                <td class="center">
                    ${index + 1}
                </td>

                <td>
                    ${escapeHtml(
                        item.nomor_penjualan || "-"
                    )}
                </td>

                <td class="center">
                    ${formatTanggalPenjualan(
                        item.tanggal_penjualan
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        pelanggan
                    )}
                </td>

                <td>
                    ${namaBarang}
                </td>

                <td class="number">
                    ${jumlahBarang}
                </td>

                <td class="number">
                    ${formatRupiah(
                        item.total_penjualan
                    )}
                </td>

            </tr>

        `;

    }
);

    if (!rows) {

        rows = `

            <tr>

                <td
                    colspan="6"
                    class="empty"
                >
                    Tidak ada data penjualan
                    pada periode yang dipilih.
                </td>

            </tr>

        `;

    }


    // =================================================
    // DOKUMEN CETAK
    // =================================================

    windowCetak.document.write(`

        <!DOCTYPE html>

        <html lang="id">

        <head>

            <meta charset="UTF-8">

            <title>
                Laporan Penjualan - Toko Mainan
            </title>


            <style>

                * {
                    box-sizing: border-box;
                }


                @page {

                    size: A4 portrait;

                    margin: 15mm;

                }


                body {

                    margin: 0;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    color: #222;

                    background: #fff;

                    font-size: 10.5px;

                    line-height: 1.45;

                }


                .document {

                    width: 100%;

                }


                /* =====================================
                   HEADER PERUSAHAAN
                   ===================================== */

                .company-header {

                    display: flex;

                    justify-content:
                        space-between;

                    align-items:
                        flex-start;

                    padding-bottom:
                        14px;

                    border-bottom:
                        2px solid #222;

                }


                .company-name {

                    font-size: 20px;

                    font-weight: bold;

                    letter-spacing:
                        0.8px;

                    margin-bottom:
                        3px;

                }


                .company-subtitle {

                    font-size: 11px;

                    color: #555;

                }


                .document-meta {

                    text-align:
                        right;

                    font-size: 9px;

                    color: #555;

                }


                .document-meta strong {

                    display: block;

                    margin-top:
                        2px;

                    color: #222;

                    font-size: 10px;

                }


                /* =====================================
                   JUDUL
                   ===================================== */

                .document-title {

                    text-align:
                        center;

                    margin:
                        20px 0 18px;

                }


                .document-title h1 {

                    margin:
                        0 0 5px;

                    font-size: 18px;

                    letter-spacing:
                        0.8px;

                }


                .document-title p {

                    margin: 0;

                    color: #555;

                    font-size: 10px;

                }


                /* =====================================
                   PERIODE
                   ===================================== */

                .period-box {

                    display: flex;

                    justify-content:
                        space-between;

                    align-items:
                        center;

                    border:
                        1px solid #bbb;

                    padding:
                        9px 12px;

                    margin-bottom:
                        15px;

                    background:
                        #fafafa;

                }


                .period-box span {

                    color: #555;

                    font-size: 9px;

                    font-weight: bold;

                    text-transform:
                        uppercase;

                    letter-spacing:
                        0.5px;

                }


                .period-box strong {

                    font-size: 11px;

                }


                /* =====================================
                   SUMMARY
                   ===================================== */

                .summary-grid {

                    display: grid;

                    grid-template-columns:
                        repeat(3, 1fr);

                    gap: 8px;

                    margin-bottom:
                        18px;

                }


                .summary-card {

                    border:
                        1px solid #c7c7c7;

                    padding:
                        10px;

                    min-height:
                        65px;

                }


                .summary-card span {

                    display: block;

                    margin-bottom:
                        5px;

                    color: #666;

                    font-size: 8px;

                    font-weight: bold;

                    text-transform:
                        uppercase;

                }


                .summary-card strong {

                    display: block;

                    font-size: 13px;

                    color: #222;

                }


                /* =====================================
                   SECTION TITLE
                   ===================================== */

                .section-title {

                    margin:
                        0 0 8px;

                    padding-bottom:
                        5px;

                    border-bottom:
                        1px solid #999;

                    font-size: 11px;

                    font-weight: bold;

                    text-transform:
                        uppercase;

                    letter-spacing:
                        0.4px;

                }


                /* =====================================
                   TABLE
                   ===================================== */

                table {

                    width: 100%;

                    border-collapse:
                        collapse;

                    margin-bottom:
                        15px;

                }


                th {

                    padding:
                        7px 6px;

                    border:
                        1px solid #999;

                    background:
                        #eeeeee;

                    color: #222;

                    font-size: 9px;

                    font-weight: bold;

                    text-align:
                        center;

                }


                td {

                    padding:
                        7px 6px;

                    border:
                        1px solid #bbb;

                    vertical-align:
                        middle;

                }


                tbody tr:nth-child(even) {

                    background:
                        #fafafa;

                }


                .center {

                    text-align:
                        center;

                }


                .number {

                    text-align:
                        right;

                    white-space:
                        nowrap;

                }


                .empty {

                    text-align:
                        center;

                    padding:
                        20px;

                    color:
                        #777;

                }


                /* =====================================
                   TOTAL BOX
                   ===================================== */

                .total-box {

                    width:
                        330px;

                    margin-left:
                        auto;

                    margin-top:
                        8px;

                    border:
                        1px solid #999;

                }


                .total-row {

                    display: flex;

                    justify-content:
                        space-between;

                    gap:
                        20px;

                    padding:
                        7px 10px;

                    border-bottom:
                        1px solid #ddd;

                }


                .total-row:last-child {

                    border-bottom:
                        none;

                    background:
                        #eeeeee;

                    font-weight:
                        bold;

                }


                .total-label {

                    color:
                        #555;

                }


                .total-value {

                    text-align:
                        right;

                    white-space:
                        nowrap;

                }


                /* =====================================
                   CATATAN
                   ===================================== */

                .notes {

                    margin-top:
                        20px;

                    padding:
                        10px 12px;

                    border:
                        1px solid #ccc;

                    background:
                        #fafafa;

                    font-size:
                        9px;

                    color:
                        #555;

                }


                .notes strong {

                    display:
                        block;

                    margin-bottom:
                        4px;

                    color:
                        #333;

                }


                /* =====================================
                   TANDA TANGAN
                   ===================================== */

                .signature-section {

                    margin-top:
                        35px;

                    display:
                        grid;

                    grid-template-columns:
                        repeat(3, 1fr);

                    gap:
                        25px;

                    page-break-inside:
                        avoid;

                }


                .signature {

                    text-align:
                        center;

                }


                .signature-title {

                    margin-bottom:
                        50px;

                    font-size:
                        9px;

                    color:
                        #555;

                }


                .signature-line {

                    border-bottom:
                        1px solid #333;

                    margin:
                        0 15px 5px;

                }


                .signature-role {

                    font-size:
                        9px;

                    font-weight:
                        bold;

                }


                /* =====================================
                   FOOTER
                   ===================================== */

                .footer {

                    margin-top:
                        28px;

                    padding-top:
                        8px;

                    border-top:
                        1px solid #ccc;

                    text-align:
                        center;

                    color:
                        #777;

                    font-size:
                        8px;

                }


                /* =====================================
                   PRINT
                   ===================================== */

                @media print {

                    body {

                        margin: 0;

                    }


                    thead {

                        display:
                            table-header-group;

                    }


                    tr {

                        page-break-inside:
                            avoid;

                    }

                }

            </style>

        </head>


        <body>

            <div class="document">


                <!-- =================================
                     HEADER PERUSAHAAN
                     ================================= -->

                <div class="company-header">

                    <div>

                        <div class="company-name">
                            TOKO MAINAN
                        </div>

                        <div class="company-subtitle">
                            Sistem Akuntansi Persediaan
                        </div>

                    </div>


                    <div class="document-meta">

                        Nomor Dokumen

                        <strong>
                            ${nomorDokumen}
                        </strong>


                        Tanggal Cetak

                        <strong>
                            ${tanggalHariIni()}
                        </strong>

                    </div>

                </div>


                <!-- =================================
                     JUDUL
                     ================================= -->

                <div class="document-title">

                    <h1>
                        LAPORAN PENJUALAN
                    </h1>

                    <p>
                        Rekapitulasi transaksi penjualan barang
                    </p>

                </div>


                <!-- =================================
                     PERIODE
                     ================================= -->

                <div class="period-box">

                    <span>
                        Periode Laporan
                    </span>

                    <strong>
                        ${escapeHtml(
                            periode
                        )}
                    </strong>

                </div>


                <!-- =================================
                     SUMMARY
                     ================================= -->

                <div class="summary-grid">


                    <div class="summary-card">

                        <span>
                            Total Transaksi
                        </span>

                        <strong>
                            ${data.length}
                        </strong>

                    </div>


                    <div class="summary-card">

                        <span>
                            Total Barang Terjual
                        </span>

                        <strong>
                            ${totalBarang}
                        </strong>

                    </div>


                    <div class="summary-card">

                        <span>
                            Total Nilai Penjualan
                        </span>

                        <strong>
                            ${formatRupiah(
                                totalNilai
                            )}
                        </strong>

                    </div>


                    <div class="summary-card">

                        <span>
                            Total Pelanggan
                        </span>

                        <strong>
                            ${pelangganSet.size}
                        </strong>

                    </div>


                    <div class="summary-card">

                        <span>
                            Rata-rata Penjualan
                        </span>

                        <strong>
                            ${formatRupiah(
                                rataRata
                            )}
                        </strong>

                    </div>


                    <div class="summary-card">

                        <span>
                            Penjualan Tertinggi
                        </span>

                        <strong>
                            ${formatRupiah(
                                penjualanTertinggi
                            )}
                        </strong>

                    </div>


                </div>


                <!-- =================================
                     TABEL TRANSAKSI
                     ================================= -->

                <div class="section-title">

                    Detail Transaksi Penjualan

                </div>


                <table>

  <!-- =================================
                     TABEL TRANSAKSI
                     ================================= -->

                <div class="section-title">

                    Detail Transaksi Penjualan

                </div>

                <table>

                    <thead>

    <tr>

        <th style="width: 5%;">
            No
        </th>

        <th style="width: 15%;">
            Nomor Penjualan
        </th>

        <th style="width: 11%;">
            Tanggal
        </th>

        <th style="width: 23%;">
            Pelanggan
        </th>

        <th style="width: 23%;">
            Nama Barang
        </th>

        <th style="width: 10%;">
            Jumlah Barang
        </th>

        <th style="width: 13%;">
            Total Penjualan
        </th>

    </tr>

</thead>

                    <tbody>

                        ${rows}

                    </tbody>

                </table>

                    <tbody>

                        ${rows}

                    </tbody>

                </table>


                <!-- =================================
                     TOTAL
                     ================================= -->

                <div class="total-box">

                    <div class="total-row">

                        <span class="total-label">
                            Total Transaksi
                        </span>

                        <span class="total-value">
                            ${data.length}
                        </span>

                    </div>


                    <div class="total-row">

                        <span class="total-label">
                            Total Barang Terjual
                        </span>

                        <span class="total-value">
                            ${totalBarang}
                        </span>

                    </div>


                    <div class="total-row">

                        <span class="total-label">
                            Total Nilai Penjualan
                        </span>

                        <span class="total-value">
                            ${formatRupiah(
                                totalNilai
                            )}
                        </span>

                    </div>

                </div>


                <!-- =================================
                     CATATAN
                     ================================= -->

                <div class="notes">

                    <strong>
                        Catatan Laporan
                    </strong>

                    Laporan ini menampilkan transaksi
                    penjualan berdasarkan data yang tersedia
                    pada Sistem Akuntansi Persediaan Toko Mainan.
                    Total barang terjual dihitung berdasarkan
                    seluruh detail barang pada setiap transaksi.

                </div>


                <!-- =================================
                     TANDA TANGAN
                     ================================= -->

                <div class="signature-section">


                    <div class="signature">

                        <div class="signature-title">
                            Dibuat Oleh
                        </div>

                        <div class="signature-line"></div>

                        <div class="signature-role">
                            Petugas Penjualan
                        </div>

                    </div>


                    <div class="signature">

                        <div class="signature-title">
                            Diperiksa Oleh
                        </div>

                        <div class="signature-line"></div>

                        <div class="signature-role">
                            Supervisor
                        </div>

                    </div>


                    <div class="signature">

                        <div class="signature-title">
                            Disetujui Oleh
                        </div>

                        <div class="signature-line"></div>

                        <div class="signature-role">
                            Pimpinan
                        </div>

                    </div>


                </div>


                <!-- =================================
                     FOOTER
                     ================================= -->

                <div class="footer">

                    Dokumen ini dibuat secara otomatis
                    oleh Sistem Akuntansi Persediaan Toko Mainan.

                    <br>

                    Dicetak pada:
                    ${tanggalHariIni()}

                </div>


            </div>


            <script>

                window.onload = function () {

                    setTimeout(
                        function () {

                            window.print();

                        },
                        500
                    );

                };

            <\/script>


        </body>

        </html>

    `);


    windowCetak.document.close();

}

// =====================================================
// KARTU PERSEDIAAN
// =====================================================

async function kartuPersediaan() {

    ubahJudul(
        "Kartu Persediaan"
    );

    aktifkanMenu(
        "Kartu Persediaan"
    );

    const isi =
        document.getElementById("isi");

    if (!cekSupabase()) {
        return;
    }

    isi.innerHTML = `

        <div class="report-header">

            <div>

                <span class="report-label">
                    LAPORAN PERSEDIAAN
                </span>

                <h2>
                    Kartu Persediaan
                </h2>

                <p>
                    Riwayat mutasi dan saldo persediaan setiap barang.
                </p>

            </div>

            <div class="report-header-date">

                <span>
                    Tanggal Laporan
                </span>

                <strong>
                    ${tanggalHariIni()}
                </strong>

            </div>

        </div>


        <!-- =========================================
             PILIH BARANG DAN PERIODE
             ========================================= -->

        <div class="report-filter-box">

            <div class="report-filter-header">

                <div>

                    <span>
                        FILTER KARTU PERSEDIAAN
                    </span>

                    <h3>
                        Pilih Barang dan Periode
                    </h3>

                </div>

                <button
                    type="button"
                    class="report-reset-button"
                    onclick="kartuPersediaan()"
                >
                    ↻ Reset
                </button>

            </div>


            <div class="report-filter-grid">


                <!-- BARANG -->

                <div class="report-filter-group">

                    <label>
                        Barang
                    </label>

                    <input
                        type="text"
                        id="kartuBarangInput"
                        list="kartuBarangList"
                        placeholder="Cari kode atau nama barang..."
                    >

                    <datalist id="kartuBarangList">
                    </datalist>

                </div>


                <!-- TANGGAL MULAI -->

                <div class="report-filter-group">

                    <label>
                        Dari Tanggal
                    </label>

                    <input
                        type="date"
                        id="kartuTanggalMulai"
                    >

                </div>


                <!-- TANGGAL AKHIR -->

                <div class="report-filter-group">

                    <label>
                        Sampai Tanggal
                    </label>

                    <input
                        type="date"
                        id="kartuTanggalAkhir"
                    >

                </div>


            </div>


            <div style="
                display:flex;
                justify-content:flex-end;
                margin-top:18px;
            ">

                <button
                    type="button"
                    class="button-primary"
                    onclick="tampilkanKartuPersediaan()"
                >
                    📑 Tampilkan Kartu
                </button>

            </div>

        </div>


        <!-- =========================================
             HASIL KARTU
             ========================================= -->

        <div id="kartuPersediaanContainer">

            <div class="empty-state">

                Pilih barang terlebih dahulu untuk menampilkan kartu persediaan.

            </div>

        </div>

    `;


    // =================================================
    // AMBIL DATA BARANG
    // =================================================

    const {
        data: dataBarangKartu,
        error: errorBarang
    } = await supabaseClient

        .from("barang")

        .select(`
            id_barang,
            kode_barang,
            nama_barang,
            kategori,
            satuan,
            harga_beli,
            harga_jual,
            stok,
            stok_minimum
        `)

        .order(
            "kode_barang",
            {
                ascending: true
            }
        );


    if (errorBarang) {

        document.getElementById(
            "kartuPersediaanContainer"
        ).innerHTML = `

            <div class="empty-state">

                ${escapeHtml(
                    errorBarang.message
                )}

            </div>

        `;

        return;

    }


    const datalist =
        document.getElementById(
            "kartuBarangList"
        );


    (dataBarangKartu || []).forEach(
        function (barang) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                barang.kode_barang +
                " - " +
                barang.nama_barang;

            datalist.appendChild(
                option
            );

        }
    );


    // =================================================
    // SIMPAN DATA BARANG SECARA GLOBAL
    // =================================================

    window.dataBarangKartuPersediaan =
        dataBarangKartu || [];

    }

// =====================================================
// TAMPILKAN KARTU PERSEDIAAN
// =====================================================

async function tampilkanKartuPersediaan() {

    const container =
        document.getElementById(
            "kartuPersediaanContainer"
        );


    const inputBarang =
        document.getElementById(
            "kartuBarangInput"
        );


    const tanggalMulai =
        document.getElementById(
            "kartuTanggalMulai"
        ).value;


    const tanggalAkhir =
        document.getElementById(
            "kartuTanggalAkhir"
        ).value;


    if (!inputBarang.value) {

        alert(
            "Silakan pilih barang terlebih dahulu."
        );

        return;

    }


    if (
        !tanggalMulai ||
        !tanggalAkhir
    ) {

        alert(
            "Silakan tentukan periode kartu persediaan."
        );

        return;

    }


    if (
        tanggalMulai >
        tanggalAkhir
    ) {

        alert(
            "Tanggal mulai tidak boleh lebih besar dari tanggal akhir."
        );

        return;

    }


    const daftarBarang =
        window.dataBarangKartuPersediaan ||
        [];


    const barang =
        daftarBarang.find(
            function (item) {

                return (
                    inputBarang.value ===
                    (
                        item.kode_barang +
                        " - " +
                        item.nama_barang
                    )
                );

            }
        );


    if (!barang) {

        alert(
            "Barang tidak ditemukan. Silakan pilih barang dari daftar."
        );

        return;

    }


    container.innerHTML = `

        <div class="empty-state">

            Memuat kartu persediaan...

        </div>

    `;


    // =================================================
    // AMBIL SEMUA PEMBELIAN
    // =================================================

    const hasilPembelian =
        await supabaseClient

            .from("detail_pembelian")

            .select(`
                id_detail_pembelian,
                id_barang,
                jumlah,
                harga_beli,
                subtotal,
                pembelian (
                    nomor_pembelian,
                    tanggal_pembelian
                )
            `)

            .eq(
                "id_barang",
                barang.id_barang
            );


    if (hasilPembelian.error) {

        container.innerHTML = `

            <div class="empty-state">

                ${escapeHtml(
                    hasilPembelian.error.message
                )}

            </div>

        `;

        return;

    }


    // =================================================
    // AMBIL SEMUA PENJUALAN
    // =================================================

    const hasilPenjualan =
        await supabaseClient

            .from("detail_penjualan")

            .select(`
                id_detail_penjualan,
                id_barang,
                jumlah,
                harga_jual,
                subtotal,
                penjualan (
                    nomor_penjualan,
                    tanggal_penjualan
                )
            `)

            .eq(
                "id_barang",
                barang.id_barang
            );


    if (hasilPenjualan.error) {

        container.innerHTML = `

            <div class="empty-state">

                ${escapeHtml(
                    hasilPenjualan.error.message
                )}

            </div>

        `;

        return;

    }


    // =================================================
    // BENTUK DATA MUTASI
    // =================================================

    const movements = [];


    (
        hasilPembelian.data ||
        []
    ).forEach(
        function (item) {

            if (
                !item.pembelian ||
                !item.pembelian.tanggal_pembelian
            ) {
                return;
            }


            movements.push({

                tanggal:
                    item.pembelian
                        .tanggal_pembelian,

                nomor:
                    item.pembelian
                        .nomor_pembelian,

                jenis:
                    "MASUK",

                keterangan:
                    "Pembelian",

                jumlah:
                    Number(
                        item.jumlah || 0
                    ),

                harga:
                    Number(
                        item.harga_beli || 0
                    ),

                subtotal:
                    Number(
                        item.subtotal || 0
                    ),

                id:
                    Number(
                        item.id_detail_pembelian
                    )

            });

        }
    );


    (
        hasilPenjualan.data ||
        []
    ).forEach(
        function (item) {

            if (
                !item.penjualan ||
                !item.penjualan.tanggal_penjualan
            ) {
                return;
            }


            movements.push({

                tanggal:
                    item.penjualan
                        .tanggal_penjualan,

                nomor:
                    item.penjualan
                        .nomor_penjualan,

                jenis:
                    "KELUAR",

                keterangan:
                    "Penjualan",

                jumlah:
                    Number(
                        item.jumlah || 0
                    ),

                harga:
                    Number(
                        item.harga_jual || 0
                    ),

                subtotal:
                    Number(
                        item.subtotal || 0
                    ),

                id:
                    Number(
                        item.id_detail_penjualan
                    )

            });

        }
    );


    // =================================================
    // URUTKAN DARI YANG PALING LAMA
    // =================================================

    movements.sort(
        function (a, b) {

            const tanggalA =
                new Date(
                    a.tanggal
                ).getTime();

            const tanggalB =
                new Date(
                    b.tanggal
                ).getTime();


            if (
                tanggalA !==
                tanggalB
            ) {

                return (
                    tanggalA -
                    tanggalB
                );

            }


            return (
                a.id -
                b.id
            );

        }
    );


    // =================================================
    // HITUNG MUTASI SEBELUM PERIODE
    // UNTUK MENENTUKAN STOK AWAL
    // =================================================

    let mutasiSebelumPeriode = 0;


    movements.forEach(
        function (item) {

            if (
                item.tanggal <
                tanggalMulai
            ) {

                if (
                    item.jenis ===
                    "MASUK"
                ) {

                    mutasiSebelumPeriode +=
                        item.jumlah;

                } else {

                    mutasiSebelumPeriode -=
                        item.jumlah;

                }

            }

        }
    );


    // =================================================
    // HITUNG MUTASI SETELAH PERIODE
    // =================================================

    let mutasiSetelahPeriode = 0;


    movements.forEach(
        function (item) {

            if (
                item.tanggal >
                tanggalAkhir
            ) {

                if (
                    item.jenis ===
                    "MASUK"
                ) {

                    mutasiSetelahPeriode +=
                        item.jumlah;

                } else {

                    mutasiSetelahPeriode -=
                        item.jumlah;

                }

            }

        }
    );


    // =================================================
    // STOK AWAL PERIODE
    // DITURUNKAN DARI STOK SAAT INI
    // =================================================

    let saldoAwal =
        Number(
            barang.stok || 0
        ) -
        mutasiSetelahPeriode;


    movements.forEach(
        function (item) {

            if (
                item.tanggal >=
                tanggalMulai &&
                item.tanggal <=
                tanggalAkhir
            ) {

                if (
                    item.jenis ===
                    "MASUK"
                ) {

                    saldoAwal -=
                        item.jumlah;

                } else {

                    saldoAwal +=
                        item.jumlah;

                }

            }

        }
    );


    // =================================================
    // AMBIL MUTASI SESUAI PERIODE
    // =================================================

    const movementsPeriode =
        movements.filter(
            function (item) {

                return (
                    item.tanggal >=
                    tanggalMulai &&
                    item.tanggal <=
                    tanggalAkhir
                );

            }
        );


    // =================================================
    // HITUNG TOTAL MASUK DAN KELUAR
    // =================================================

    let totalMasuk = 0;
    let totalKeluar = 0;


    movementsPeriode.forEach(
        function (item) {

            if (
                item.jenis ===
                "MASUK"
            ) {

                totalMasuk +=
                    item.jumlah;

            } else {

                totalKeluar +=
                    item.jumlah;

            }

        }
    );


    const saldoAkhir =
        saldoAwal +
        totalMasuk -
        totalKeluar;


    // =================================================
    // STATUS STOK
    // =================================================

    let statusStok =
        "STOK AMAN";

    let statusClass =
        "stok-aman";


    if (
        Number(barang.stok) <= 0
    ) {

        statusStok =
            "STOK HABIS";

        statusClass =
            "stok-habis";

    } else if (
        Number(barang.stok) <=
        Number(barang.stok_minimum || 0)
    ) {

        statusStok =
            "STOK MENIPIS";

        statusClass =
            "stok-menipis";

    }


    // =================================================
    // HTML KARTU
    // =================================================

    let html = `


        <!-- =========================================
             RINGKASAN
             ========================================= -->

        <div class="report-summary-grid">


            <!-- STOK AWAL -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    📦
                </div>

                <div>

                    <span>
                        Stok Awal
                    </span>

                    <strong>
                        ${saldoAwal}
                    </strong>

                    <small>
                        Unit
                    </small>

                </div>

            </div>


            <!-- TOTAL MASUK -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    📥
                </div>

                <div>

                    <span>
                        Total Masuk
                    </span>

                    <strong>
                        ${totalMasuk}
                    </strong>

                    <small>
                        Unit
                    </small>

                </div>

            </div>


            <!-- TOTAL KELUAR -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    📤
                </div>

                <div>

                    <span>
                        Total Keluar
                    </span>

                    <strong>
                        ${totalKeluar}
                    </strong>

                    <small>
                        Unit
                    </small>

                </div>

            </div>


            <!-- STOK AKHIR -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    📊
                </div>

                <div>

                    <span>
                        Stok Akhir
                    </span>

                    <strong>
                        ${saldoAkhir}
                    </strong>

                    <small>
                        Unit
                    </small>

                </div>

            </div>


        </div>


        <!-- =========================================
             INFORMASI BARANG
             ========================================= -->

        <div class="report-filter-box">

            <div class="report-filter-header">

                <div>

                    <span>
                        INFORMASI BARANG
                    </span>

                    <h3>
                        ${escapeHtml(
                            barang.nama_barang
                        )}
                    </h3>

                </div>

                <span class="${statusClass}">
                    ${statusStok}
                </span>

            </div>


            <div class="report-filter-grid">


                <div class="report-filter-group">

                    <label>
                        Kode Barang
                    </label>

                    <input
                        type="text"
                        value="${escapeHtml(
                            barang.kode_barang
                        )}"
                        readonly
                    >

                </div>


                <div class="report-filter-group">

                    <label>
                        Kategori
                    </label>

                    <input
                        type="text"
                        value="${escapeHtml(
                            barang.kategori || "-"
                        )}"
                        readonly
                    >

                </div>


                <div class="report-filter-group">

                    <label>
                        Satuan
                    </label>

                    <input
                        type="text"
                        value="${escapeHtml(
                            barang.satuan || "-"
                        )}"
                        readonly
                    >

                </div>


                <div class="report-filter-group">

                    <label>
                        Stok Saat Ini
                    </label>

                    <input
                        type="text"
                        value="${Number(
                            barang.stok || 0
                        )} ${escapeHtml(
                            barang.satuan || ""
                        )}"
                        readonly
                    >

                </div>


            </div>

        </div>


        <!-- =========================================
             TABEL MUTASI
             ========================================= -->

        <div class="dashboard-panel dashboard-full-panel">

            <div class="dashboard-panel-header">

                <div>

                    <span>
                        MUTASI PERSEDIAAN
                    </span>

                    <h3>
                        Kartu Persediaan
                    </h3>

                </div>

                <button
                    type="button"
                    class="dashboard-link-button"
                    onclick="cetakKartuPersediaan()"
                >
                    🖨️ Cetak
                </button>

            </div>


            <div class="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>
                                No
                            </th>

                            <th>
                                Tanggal
                            </th>

                            <th>
                                No. Bukti
                            </th>

                            <th>
                                Jenis
                            </th>

                            <th>
                                Keterangan
                            </th>

                            <th>
                                Masuk
                            </th>

                            <th>
                                Keluar
                            </th>

                            <th>
                                Stok
                            </th>

                        </tr>

                    </thead>

                    <tbody>
    `;


    // =================================================
    // BARIS STOK AWAL
    // =================================================

    html += `

        <tr>

            <td>
                1
            </td>

            <td>
                ${formatTanggalKartu(
                    tanggalMulai
                )}
            </td>

            <td>
                -
            </td>

            <td>

                <span class="stok-aman">
                    STOK
                </span>

            </td>

            <td>
                Stok Awal
            </td>

            <td>
                -
            </td>

            <td>
                -
            </td>

            <td>
                <strong>
                    ${saldoAwal}
                </strong>
            </td>

        </tr>

    `;


    // =================================================
    // STOK BERJALAN
    // =================================================

    let saldoBerjalan =
        saldoAwal;


    if (
        movementsPeriode.length === 0
    ) {

        html += `

            <tr>

                <td colspan="8">

                    <div class="empty-state">

                        Tidak ada mutasi persediaan
                        pada periode yang dipilih.

                    </div>

                </td>

            </tr>

        `;

    } else {


        movementsPeriode.forEach(
            function (
                item,
                index
            ) {

                if (
                    item.jenis ===
                    "MASUK"
                ) {

                    saldoBerjalan +=
                        item.jumlah;

                } else {

                    saldoBerjalan -=
                        item.jumlah;

                }


                html += `

                    <tr>

                        <td>
                            ${index + 2}
                        </td>

                        <td>
                            ${formatTanggalKartu(
                                item.tanggal
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.nomor || "-"
                            )}
                        </td>

                        <td>

                            ${
                                item.jenis ===
                                "MASUK"

                                    ? `
                                        <span class="stok-aman">
                                            MASUK
                                        </span>
                                      `

                                    : `
                                        <span class="stok-menipis">
                                            KELUAR
                                        </span>
                                      `
                            }

                        </td>

                        <td>
                            ${escapeHtml(
                                item.keterangan
                            )}
                        </td>

                        <td>

                            ${
                                item.jenis ===
                                "MASUK"

                                    ? `<strong>
                                            ${item.jumlah}
                                       </strong>`

                                    : "-"
                            }

                        </td>

                        <td>

                            ${
                                item.jenis ===
                                "KELUAR"

                                    ? `<strong>
                                            ${item.jumlah}
                                       </strong>`

                                    : "-"
                            }

                        </td>

                        <td>

                            <strong>
                                ${saldoBerjalan}
                            </strong>

                        </td>

                    </tr>

                `;

            }
        );

    }


    html += `

                    </tbody>

                </table>

            </div>


            <!-- =====================================
                 FOOTER KARTU
                 ===================================== -->

            <div style="
                display:flex;
                justify-content:flex-end;
                margin-top:20px;
                padding-top:18px;
                border-top:1px solid var(--border);
            ">

                <div style="
                    text-align:right;
                ">

                    <span style="
                        display:block;
                        color:var(--text-muted);
                        font-size:10px;
                        text-transform:uppercase;
                        margin-bottom:5px;
                    ">
                        Stok Akhir
                    </span>

                    <strong style="
                        color:var(--text);
                        font-size:24px;
                    ">
                        ${saldoAkhir}
                        ${escapeHtml(
                            barang.satuan || ""
                        )}
                    </strong>

                </div>

            </div>

        </div>

    `;


    container.innerHTML =
        html;


    // =================================================
    // SIMPAN DATA UNTUK CETAK
    // =================================================

    window.kartuPersediaanCetak = {

        barang:
            barang,

        tanggalMulai:
            tanggalMulai,

        tanggalAkhir:
            tanggalAkhir,

        saldoAwal:
            saldoAwal,

        totalMasuk:
            totalMasuk,

        totalKeluar:
            totalKeluar,

        saldoAkhir:
            saldoAkhir,

        movements:
            movementsPeriode

    };

}
  
  
// =====================================================  
// FORMAT TANGGAL KARTU PERSEDIAAN  
// =====================================================  
  
function formatTanggalKartu(  
    tanggal  
) {  
  
    if (!tanggal) {  
        return "-";  
    }  
  
  
    const bagian =  
        tanggal.split("-");  
  
  
    if (  
        bagian.length !== 3  
    ) {  
  
        return tanggal;  
  
    }  
  
  
    return (  
        bagian[2] +  
        "/" +  
        bagian[1] +  
        "/" +  
        bagian[0]  
    );  
  
}  

// =====================================================
// CETAK KARTU PERSEDIAAN
// =====================================================

function cetakKartuPersediaan() {

    const data = window.kartuPersediaanCetak;

    if (!data) {
        alert("Silakan tampilkan kartu persediaan terlebih dahulu.");
        return;
    }

    const barang = data.barang;

    const nomorDokumen =
        "KP-" +
        barang.kode_barang +
        "-" +
        data.tanggalMulai.replace(/-/g, "");

    const tanggalCetak = tanggalHariIni();

    // =================================================
    // BARIS MUTASI
    // =================================================

    let baris = `

        <tr class="stok-awal-row">

            <td>
                ${formatTanggalKartu(data.tanggalMulai)}
            </td>

            <td>-</td>

            <td>
                <strong>Stok Awal</strong>
            </td>

            <td class="angka">-</td>

            <td class="angka">-</td>

            <td class="angka stok">
                <strong>
                    ${data.saldoAwal}
                </strong>
            </td>

        </tr>

    `;

    let stok = Number(data.saldoAwal || 0);

    (data.movements || []).forEach(function (item) {

        if (item.jenis === "MASUK") {

            stok += Number(item.jumlah || 0);

        } else {

            stok -= Number(item.jumlah || 0);

        }

        baris += `

            <tr>

                <td>
                    ${formatTanggalKartu(item.tanggal)}
                </td>

                <td class="nomor-bukti">
                    ${escapeHtml(item.nomor || "-")}
                </td>

                <td>
                    ${escapeHtml(item.keterangan || "-")}
                </td>

                <td class="angka masuk">

                    ${
                        item.jenis === "MASUK"
                            ? Number(item.jumlah || 0)
                            : "-"
                    }

                </td>

                <td class="angka keluar">

                    ${
                        item.jenis === "KELUAR"
                            ? Number(item.jumlah || 0)
                            : "-"
                    }

                </td>

                <td class="angka stok">

                    <strong>
                        ${stok}
                    </strong>

                </td>

            </tr>

        `;

    });


    // =================================================
    // BUKA PREVIEW
    // =================================================

    const jendela = window.open(
        "",
        "_blank",
        "width=1100,height=800"
    );

    if (!jendela) {

        alert(
            "Preview tidak dapat dibuka. Silakan izinkan popup pada browser."
        );

        return;

    }


    // =================================================
    // DOKUMEN PREVIEW
    // =================================================

    jendela.document.write(`

<!DOCTYPE html>

<html lang="id">

<head>

    <meta charset="UTF-8">

    <title>
        Preview Kartu Persediaan -
        ${escapeHtml(barang.nama_barang)}
    </title>


    <style>

        * {
            box-sizing: border-box;
        }


        body {

            margin: 0;

            padding: 25px;

            background: #eeeeee;

            color: #222222;

            font-family:
                Arial,
                Helvetica,
                sans-serif;

            font-size: 10px;

        }


        /* =========================================
           TOOLBAR PREVIEW
           ========================================= */

        .preview-toolbar {

            display: flex;

            justify-content: space-between;

            align-items: center;

            width: 210mm;

            max-width: 100%;

            margin: 0 auto 15px;

            padding: 12px 15px;

            background: #ffffff;

            border: 1px solid #dddddd;

            border-radius: 8px;

            box-shadow:
                0 2px 8px rgba(0,0,0,0.08);

        }


        .preview-toolbar-title {

            font-size: 13px;

            font-weight: bold;

        }


        .preview-toolbar-buttons {

            display: flex;

            gap: 8px;

        }


        .preview-button {

            border: none;

            border-radius: 6px;

            padding: 9px 15px;

            font-size: 12px;

            font-weight: 600;

            cursor: pointer;

        }


        .preview-close {

            background: #eeeeee;

            color: #333333;

        }


        .preview-print {

            background: #333333;

            color: #ffffff;

        }


        .preview-button:hover {

            opacity: 0.85;

        }


        /* =========================================
           HALAMAN
           ========================================= */

        .page {

            width: 210mm;

            min-height: 297mm;

            margin: 0 auto;

            padding: 15mm 14mm;

            background: #ffffff;

            box-shadow:
                0 4px 18px rgba(0,0,0,0.15);

        }


        /* =========================================
           HEADER
           ========================================= */

        .company-header {

            display: flex;

            justify-content: space-between;

            align-items: flex-start;

            padding-bottom: 13px;

            border-bottom: 2px solid #222222;

            margin-bottom: 16px;

        }


        .company-name {

            font-size: 18px;

            font-weight: bold;

            letter-spacing: 0.4px;

            margin-bottom: 4px;

        }


        .company-subtitle {

            font-size: 9px;

            color: #666666;

        }


        .document-meta {

            text-align: right;

            font-size: 9px;

            line-height: 1.7;

        }


        .document-meta strong {

            font-size: 10px;

        }


        /* =========================================
           JUDUL
           ========================================= */

        .document-title {

            text-align: center;

            margin: 14px 0 18px;

        }


        .document-title h1 {

            margin: 0 0 5px;

            font-size: 17px;

            letter-spacing: 0.8px;

        }


        .document-title p {

            margin: 0;

            color: #555555;

            font-size: 10px;

        }


        /* =========================================
           IDENTITAS BARANG
           ========================================= */

        .section-title {

            margin-bottom: 7px;

            font-size: 10px;

            font-weight: bold;

            text-transform: uppercase;

            letter-spacing: 0.5px;

        }


        .info-table {

            width: 100%;

            border-collapse: collapse;

            margin-bottom: 15px;

        }


        .info-table td {

            border: 1px solid #aaaaaa;

            padding: 7px 9px;

            vertical-align: middle;

        }


        .info-label {

            width: 16%;

            background: #f3f3f3;

            font-weight: bold;

            color: #444444;

        }


        .info-value {

            width: 34%;

        }


        /* =========================================
           RINGKASAN
           ========================================= */

        .summary-table {

            width: 100%;

            border-collapse: separate;

            border-spacing: 7px 0;

            margin: 0 -7px 17px;

        }


        .summary-table td {

            width: 25%;

            border: 1px solid #aaaaaa;

            padding: 9px 10px;

            text-align: center;

        }


        .summary-label {

            display: block;

            margin-bottom: 5px;

            color: #666666;

            font-size: 8px;

            font-weight: bold;

            text-transform: uppercase;

        }


        .summary-value {

            display: block;

            font-size: 15px;

            font-weight: bold;

        }


        /* =========================================
           TABEL MUTASI
           ========================================= */

        .mutation-title {

            margin: 4px 0 7px;

            font-size: 10px;

            font-weight: bold;

            text-transform: uppercase;

            letter-spacing: 0.5px;

        }


        .mutation-table {

            width: 100%;

            border-collapse: collapse;

            page-break-inside: auto;

        }


        .mutation-table thead {

            display: table-header-group;

        }


        .mutation-table tr {

            page-break-inside: avoid;

            page-break-after: auto;

        }


        .mutation-table th {

            padding: 8px 7px;

            background: #eeeeee;

            border: 1px solid #777777;

            font-size: 8.5px;

            text-align: center;

            text-transform: uppercase;

        }


        .mutation-table td {

            padding: 7px;

            border: 1px solid #aaaaaa;

            font-size: 9px;

            vertical-align: middle;

        }


        .mutation-table th:nth-child(1) {
            width: 13%;
        }


        .mutation-table th:nth-child(2) {
            width: 16%;
        }


        .mutation-table th:nth-child(3) {
            width: 30%;
        }


        .mutation-table th:nth-child(4),
        .mutation-table th:nth-child(5),
        .mutation-table th:nth-child(6) {

            width: 13.5%;

        }


        .angka {

            text-align: right;

        }


        .nomor-bukti {

            font-weight: 600;

        }


        .stok-awal-row {

            background: #f7f7f7;

        }


        .stok {

            font-weight: bold;

        }


        /* =========================================
           STOK AKHIR
           ========================================= */

        .final-section {

            display: flex;

            justify-content: flex-end;

            margin-top: 14px;

        }


        .final-box {

            width: 245px;

            border: 1px solid #555555;

        }


        .final-row {

            display: flex;

            justify-content: space-between;

            padding: 8px 10px;

            border-bottom: 1px solid #cccccc;

        }


        .final-row:last-child {

            border-bottom: none;

            background: #eeeeee;

            font-weight: bold;

        }


        .final-label {

            color: #555555;

        }


        .final-value {

            font-weight: bold;

        }


        /* =========================================
           CATATAN
           ========================================= */

        .note {

            margin-top: 14px;

            padding: 8px 10px;

            border-left: 3px solid #777777;

            background: #f7f7f7;

            color: #555555;

            font-size: 8.5px;

            line-height: 1.5;

        }


        /* =========================================
           TANDA TANGAN
           ========================================= */

        .signature-section {

            display: flex;

            justify-content: space-between;

            margin-top: 55px;

            text-align: center;

            font-size: 9px;

        }


        .signature {

            width: 28%;

        }


        .signature-space {

            height: 60px;

        }


        .signature-line {

            border-bottom: 1px solid #333333;

            margin-bottom: 4px;

        }


        /* =========================================
           FOOTER
           ========================================= */

        .document-footer {

            margin-top: 20px;

            padding-top: 7px;

            border-top: 1px solid #bbbbbb;

            display: flex;

            justify-content: space-between;

            color: #777777;

            font-size: 7.5px;

        }


        /* =========================================
           PRINT
           ========================================= */

        @page {

            size: A4 portrait;

            margin: 15mm 14mm;

        }


        @media print {

            body {

                padding: 0;

                background: #ffffff;

            }


            .preview-toolbar {

                display: none !important;

            }


            .page {

                width: 100%;

                min-height: auto;

                margin: 0;

                padding: 0;

                box-shadow: none;

            }

        }

    </style>

</head>


<body>


    <!-- TOOLBAR -->

    <div class="preview-toolbar">

        <div class="preview-toolbar-title">

            Preview Kartu Persediaan

        </div>


        <div class="preview-toolbar-buttons">

            <button
                type="button"
                class="preview-button preview-close"
                onclick="window.close()"
            >
                ✕ Tutup Preview
            </button>


            <button
                type="button"
                class="preview-button preview-print"
                onclick="window.print()"
            >
                🖨️ Cetak
            </button>

        </div>

    </div>


    <!-- HALAMAN -->

    <div class="page">


        <!-- HEADER -->

        <div class="company-header">

            <div>

                <div class="company-name">
                    TOKO MAINAN
                </div>

                <div class="company-subtitle">
                    Sistem Akuntansi Persediaan
                </div>

            </div>


            <div class="document-meta">

                <div>

                    No. Dokumen:

                    <strong>
                        ${escapeHtml(nomorDokumen)}
                    </strong>

                </div>


                <div>

                    Tanggal Cetak:

                    <strong>
                        ${escapeHtml(tanggalCetak)}
                    </strong>

                </div>

            </div>

        </div>


        <!-- JUDUL -->

        <div class="document-title">

            <h1>
                KARTU PERSEDIAAN BARANG
            </h1>


            <p>

                Periode:

                <strong>
                    ${formatTanggalKartu(data.tanggalMulai)}
                </strong>

                s/d

                <strong>
                    ${formatTanggalKartu(data.tanggalAkhir)}
                </strong>

            </p>

        </div>


        <!-- IDENTITAS -->

        <div class="section-title">
            Identitas Barang
        </div>


        <table class="info-table">

            <tr>

                <td class="info-label">
                    Kode Barang
                </td>

                <td class="info-value">
                    ${escapeHtml(barang.kode_barang)}
                </td>


                <td class="info-label">
                    Nama Barang
                </td>

                <td class="info-value">
                    ${escapeHtml(barang.nama_barang)}
                </td>

            </tr>


            <tr>

                <td class="info-label">
                    Kategori
                </td>

                <td class="info-value">
                    ${escapeHtml(barang.kategori || "-")}
                </td>


                <td class="info-label">
                    Satuan
                </td>

                <td class="info-value">
                    ${escapeHtml(barang.satuan || "-")}
                </td>

            </tr>


            <tr>

                <td class="info-label">
                    Stok Saat Ini
                </td>

                <td class="info-value">

                    <strong>

                        ${Number(barang.stok || 0)}

                        ${escapeHtml(barang.satuan || "")}

                    </strong>

                </td>


                <td class="info-label">
                    Status Stok
                </td>

                <td class="info-value">

                    <strong>

                        ${
                            Number(barang.stok || 0) <= 0
                                ? "STOK HABIS"
                                : "STOK TERSEDIA"
                        }

                    </strong>

                </td>

            </tr>

        </table>


        <!-- RINGKASAN -->

        <div class="section-title">
            Ringkasan Mutasi Persediaan
        </div>


        <table class="summary-table">

            <tr>

                <td>

                    <span class="summary-label">
                        Stok Awal
                    </span>

                    <span class="summary-value">

                        ${data.saldoAwal}

                        ${escapeHtml(barang.satuan || "")}

                    </span>

                </td>


                <td>

                    <span class="summary-label">
                        Total Masuk
                    </span>

                    <span class="summary-value">

                        ${data.totalMasuk}

                        ${escapeHtml(barang.satuan || "")}

                    </span>

                </td>


                <td>

                    <span class="summary-label">
                        Total Keluar
                    </span>

                    <span class="summary-value">

                        ${data.totalKeluar}

                        ${escapeHtml(barang.satuan || "")}

                    </span>

                </td>


                <td>

                    <span class="summary-label">
                        Stok Akhir
                    </span>

                    <span class="summary-value">

                        ${data.saldoAkhir}

                        ${escapeHtml(barang.satuan || "")}

                    </span>

                </td>

            </tr>

        </table>


        <!-- MUTASI -->

        <div class="mutation-title">
            Mutasi Persediaan
        </div>


        <table class="mutation-table">

            <thead>

                <tr>

                    <th>
                        Tanggal
                    </th>

                    <th>
                        No. Bukti
                    </th>

                    <th>
                        Keterangan
                    </th>

                    <th>
                        Masuk
                    </th>

                    <th>
                        Keluar
                    </th>

                    <th>
                        Stok
                    </th>

                </tr>

            </thead>


            <tbody>

                ${baris}

            </tbody>

        </table>


        <!-- STOK AKHIR -->

        <div class="final-section">

            <div class="final-box">


                <div class="final-row">

                    <span class="final-label">
                        Stok Awal
                    </span>

                    <span class="final-value">

                        ${data.saldoAwal}

                        ${escapeHtml(barang.satuan || "")}

                    </span>

                </div>


                <div class="final-row">

                    <span class="final-label">
                        Total Masuk
                    </span>

                    <span class="final-value">

                        + ${data.totalMasuk}

                        ${escapeHtml(barang.satuan || "")}

                    </span>

                </div>


                <div class="final-row">

                    <span class="final-label">
                        Total Keluar
                    </span>

                    <span class="final-value">

                        - ${data.totalKeluar}

                        ${escapeHtml(barang.satuan || "")}

                    </span>

                </div>


                <div class="final-row">

                    <span>
                        STOK AKHIR
                    </span>

                    <span>

                        ${data.saldoAkhir}

                        ${escapeHtml(barang.satuan || "")}

                    </span>

                </div>


            </div>

        </div>


        <!-- CATATAN -->

        <div class="note">

            <strong>
                Catatan:
            </strong>

            Kartu persediaan ini merupakan catatan
            mutasi barang berdasarkan transaksi pembelian
            dan penjualan yang tercatat dalam sistem.
            Jumlah stok menunjukkan jumlah persediaan
            setelah setiap mutasi.

        </div>


        <!-- TANDA TANGAN -->

        <div class="signature-section">


            <div class="signature">

                <div>
                    Dibuat Oleh,
                </div>

                <div class="signature-space"></div>

                <div class="signature-line"></div>

                <div>
                    (____________________)
                </div>

            </div>


            <div class="signature">

                <div>
                    Diperiksa Oleh,
                </div>

                <div class="signature-space"></div>

                <div class="signature-line"></div>

                <div>
                    (____________________)
                </div>

            </div>


            <div class="signature">

                <div>
                    Mengetahui,
                </div>

                <div class="signature-space"></div>

                <div class="signature-line"></div>

                <div>
                    (____________________)
                </div>

            </div>


        </div>


        <!-- FOOTER -->

        <div class="document-footer">

            <span>
                Kartu Persediaan Barang
            </span>

            <span>

                ${escapeHtml(barang.kode_barang)}

                -

                ${escapeHtml(barang.nama_barang)}

            </span>

        </div>


    </div>


</body>

</html>

    `);


    jendela.document.close();

    jendela.focus();

}

// =====================================================
// PENGATURAN
// =====================================================

function pengaturan() {

    ubahJudul(
        "Pengaturan"
    );


    aktifkanMenu(
        "Pengaturan"
    );


    document.getElementById(
        "isi"
    ).innerHTML = `

        <div class="content-box">

            <h2>
                Pengaturan
            </h2>

            <div class="settings-grid">

                <button
                    class="settings-card"
                    onclick="profilToko()"
                >

                    🏪

                    <strong>
                        Profil Toko
                    </strong>

                    <span>
                        Informasi toko
                    </span>

                </button>


                <button
                    class="settings-card"
                    onclick="tampilanSistem()"
                >

                    🎨

                    <strong>
                        Tampilan Sistem
                    </strong>

                    <span>
                        Atur tampilan aplikasi
                    </span>

                </button>


                <button
                    class="settings-card"
                    onclick="tentangAplikasi()"
                >

                    ℹ️

                    <strong>
                        Tentang Aplikasi
                    </strong>

                    <span>
                        Informasi aplikasi
                    </span>

                </button>

            </div>

        </div>

    `;

}

// =====================================================
// PROFIL TOKO
// =====================================================

async function profilToko() {

    const isi = document.getElementById("isi");

    isi.innerHTML = `
        <div class="content-box">

            <button
                type="button"
                class="btn-secondary"
                onclick="pengaturan()"
                style="margin-bottom: 20px;"
            >
                ← Kembali
            </button>

            <h2>
                Profil Toko
            </h2>

            <div id="profilTokoContainer">
                <p>Memuat informasi toko...</p>
            </div>

        </div>
    `;

    await tampilkanProfilToko();
}

// =====================================================
// TAMPILKAN PROFIL TOKO
// =====================================================

async function tampilkanProfilToko() {

    const container =
        document.getElementById("profilTokoContainer");

    if (!container) return;

    const { data, error } = await supabaseClient
        .from("profil_toko")
        .select("*")
        .order("id_profil", {
            ascending: true
        })
        .limit(1);

    if (error) {

        console.error(
            "Gagal mengambil profil toko:",
            error
        );

        container.innerHTML = `
            <div class="alert alert-danger">
                Gagal mengambil informasi toko.
            </div>
        `;

        return;
    }


    // =================================================
    // JIKA BELUM ADA PROFIL
    // =================================================

    if (!data || data.length === 0) {

        container.innerHTML = `

            <div class="profile-card">

                <div class="empty-state">

                    <div class="icon">
                        🏪
                    </div>

                    <h3>
                        Belum Ada Informasi Toko
                    </h3>

                    <p>
                        Silakan tambahkan informasi toko terlebih dahulu.
                    </p>

                    <button
                        type="button"
                        class="btn btn-primary"
                        onclick="tambahProfilToko()"
                    >
                        ➕ Tambah Informasi Toko
                    </button>

                </div>

            </div>

        `;

        return;
    }


    // =================================================
    // JIKA SUDAH ADA PROFIL
    // =================================================

    const profil = data[0];

    container.innerHTML = `

        <div class="profile-card">

            <h3>
                🧸 ${escapeHTML(profil.nama_toko)}
            </h3>

            <p>
                <strong>Nama Pemilik:</strong>
                ${escapeHTML(profil.nama_pemilik || "-")}
            </p>

            <p>
                <strong>Alamat:</strong>
                ${escapeHTML(profil.alamat || "-")}
            </p>

            <p>
                <strong>No. HP / WhatsApp:</strong>
                ${escapeHTML(profil.no_hp || "-")}
            </p>

            <p>
                <strong>Email:</strong>
                ${escapeHTML(profil.email || "-")}
            </p>


            <div class="action-buttons">

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="editProfilToko(${profil.id_profil})"
                >
                    ✏️ Edit
                </button>

                <button
                    type="button"
                    class="btn btn-danger"
                    onclick="hapusProfilToko(${profil.id_profil})"
                >
                    🗑️ Hapus
                </button>

            </div>

        </div>

    `;
}


// =====================================================
// TAMBAH PROFIL TOKO
// =====================================================

function tambahProfilToko() {

    const container =
        document.getElementById("profilTokoContainer");

    if (!container) return;

    container.innerHTML = `

        <div class="profile-card">

            <h3>
                ➕ Tambah Informasi Toko
            </h3>

            <div class="form-group">

                <label>
                    Nama Toko *
                </label>

                <input
                    type="text"
                    id="namaTokoProfil"
                    placeholder="Masukkan nama toko"
                >

            </div>


            <div class="form-group">

                <label>
                    Nama Pemilik
                </label>

                <input
                    type="text"
                    id="namaPemilikProfil"
                    placeholder="Masukkan nama pemilik"
                >

            </div>


            <div class="form-group">

                <label>
                    Alamat
                </label>

                <textarea
                    id="alamatProfil"
                    placeholder="Masukkan alamat toko"
                ></textarea>

            </div>


            <div class="form-grid">

                <div class="form-group">

                    <label>
                        No. HP / WhatsApp
                    </label>

                    <input
                        type="text"
                        id="noHpProfil"
                        placeholder="Contoh: 081234567890"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        id="emailProfil"
                        placeholder="Contoh: toko@gmail.com"
                    >

                </div>

            </div>


            <div class="action-buttons">

                <button
                    type="button"
                    class="btn btn-secondary"
                    onclick="profilToko()"
                >
                    Batal
                </button>

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="simpanProfilToko()"
                >
                    💾 Simpan
                </button>

            </div>

        </div>

    `;
}


// =====================================================
// EDIT PROFIL TOKO
// =====================================================

async function editProfilToko(idProfil) {

    const container =
        document.getElementById("profilTokoContainer");

    if (!container) return;

    const { data, error } = await supabaseClient
        .from("profil_toko")
        .select("*")
        .eq("id_profil", idProfil)
        .single();

    if (error) {

        console.error(
            "Gagal mengambil profil toko:",
            error
        );

        alert("Gagal mengambil data profil toko.");

        return;
    }


    container.innerHTML = `

        <div class="profile-card">

            <h3>
                ✏️ Edit Informasi Toko
            </h3>

            <div class="form-group">

                <label>
                    Nama Toko *
                </label>

                <input
                    type="text"
                    id="namaTokoProfil"
                    value="${escapeHTML(data.nama_toko || "")}"
                >

            </div>


            <div class="form-group">

                <label>
                    Nama Pemilik
                </label>

                <input
                    type="text"
                    id="namaPemilikProfil"
                    value="${escapeHTML(data.nama_pemilik || "")}"
                >

            </div>


            <div class="form-group">

                <label>
                    Alamat
                </label>

                <textarea
                    id="alamatProfil"
                >${escapeHTML(data.alamat || "")}</textarea>

            </div>


            <div class="form-grid">

                <div class="form-group">

                    <label>
                        No. HP / WhatsApp
                    </label>

                    <input
                        type="text"
                        id="noHpProfil"
                        value="${escapeHTML(data.no_hp || "")}"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        id="emailProfil"
                        value="${escapeHTML(data.email || "")}"
                    >

                </div>

            </div>


            <div class="action-buttons">

                <button
                    type="button"
                    class="btn btn-secondary"
                    onclick="profilToko()"
                >
                    Batal
                </button>

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="simpanProfilToko(${idProfil})"
                >
                    💾 Simpan Perubahan
                </button>

            </div>

        </div>

    `;
}


// =====================================================
// SIMPAN PROFIL TOKO
// =====================================================

async function simpanProfilToko(idProfil = null) {

    const namaToko =
        document.getElementById("namaTokoProfil")
            ?.value.trim();

    const namaPemilik =
        document.getElementById("namaPemilikProfil")
            ?.value.trim();

    const alamat =
        document.getElementById("alamatProfil")
            ?.value.trim();

    const noHp =
        document.getElementById("noHpProfil")
            ?.value.trim();

    const email =
        document.getElementById("emailProfil")
            ?.value.trim();


    // =================================================
    // VALIDASI
    // =================================================

    if (!namaToko) {

        alert("Nama toko wajib diisi.");

        document
            .getElementById("namaTokoProfil")
            ?.focus();

        return;
    }


    const dataProfil = {

        nama_toko: namaToko,

        nama_pemilik:
            namaPemilik || null,

        alamat:
            alamat || null,

        no_hp:
            noHp || null,

        email:
            email || null,

        updated_at:
            new Date().toISOString()

    };


    // =================================================
    // UPDATE
    // =================================================

    if (idProfil) {

        const { error } = await supabaseClient
            .from("profil_toko")
            .update(dataProfil)
            .eq("id_profil", idProfil);


        if (error) {

            console.error(
                "Gagal memperbarui profil:",
                error
            );

            alert(
                "Gagal memperbarui informasi toko."
            );

            return;
        }


        alert(
            "Informasi toko berhasil diperbarui."
        );

        await tampilkanProfilToko();

        return;
    }


    // =================================================
    // CEK AGAR HANYA ADA 1 PROFIL TOKO
    // =================================================

    const { data: profilLama, error: errorCek } =
        await supabaseClient
            .from("profil_toko")
            .select("id_profil")
            .limit(1);


    if (errorCek) {

        console.error(
            "Gagal mengecek profil toko:",
            errorCek
        );

        alert(
            "Gagal mengecek data profil toko."
        );

        return;
    }


    // =================================================
    // JIKA SUDAH ADA
    // =================================================

    if (profilLama && profilLama.length > 0) {

        alert(
            "Profil toko sudah ada. Silakan gunakan tombol Edit."
        );

        await tampilkanProfilToko();

        return;
    }


    // =================================================
    // INSERT
    // =================================================

    const { error } = await supabaseClient
        .from("profil_toko")
        .insert([dataProfil]);


    if (error) {

        console.error(
            "Gagal menyimpan profil:",
            error
        );

        alert(
            "Gagal menyimpan informasi toko."
        );

        return;
    }


    alert(
        "Informasi toko berhasil disimpan."
    );

    await tampilkanProfilToko();
}


// =====================================================
// HAPUS PROFIL TOKO
// =====================================================

async function hapusProfilToko(idProfil) {

    const konfirmasi =
        confirm(
            "Apakah kamu yakin ingin menghapus informasi toko?"
        );

    if (!konfirmasi) return;


    const { error } = await supabaseClient
        .from("profil_toko")
        .delete()
        .eq("id_profil", idProfil);


    if (error) {

        console.error(
            "Gagal menghapus profil:",
            error
        );

        alert(
            "Gagal menghapus informasi toko."
        );

        return;
    }


    alert(
        "Informasi toko berhasil dihapus."
    );

    await tampilkanProfilToko();
}


// =====================================================
// TAMPILAN SISTEM
// =====================================================

function escapeHTML(teks) {

    return String(teks)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// =====================================================
// TAMPILAN SISTEM
// =====================================================

function tampilanSistem() {

    document.getElementById(
        "isi"
    ).innerHTML = `

        <div class="content-box">

            <button
                type="button"
                class="btn-secondary"
                onclick="pengaturan()"
                style="margin-bottom: 20px;"
            >
                ← Kembali
            </button>


            <h2>
                Tampilan Sistem
            </h2>


            <div class="settings-grid">

                <button
                    class="settings-card"
                    onclick="ubahTema('pink')"
                >

                    🌸

                    <strong>
                        Soft Pink
                    </strong>

                </button>


                <button
                    class="settings-card"
                    onclick="ubahTema('blue')"
                >

                    💙

                    <strong>
                        Soft Blue
                    </strong>

                </button>


                <button
                    class="settings-card"
                    onclick="ubahTema('dark')"
                >

                    🌙

                    <strong>
                        Dark Mode
                    </strong>

                </button>

            </div>

        </div>

    `;

}

// =====================================================
// UBAH TEMA
// =====================================================

function ubahTema(tema) {

    document.body.classList.remove(
        "theme-blue",
        "theme-dark"
    );


    if (
        tema ===
        "blue"
    ) {

        document.body.classList.add(
            "theme-blue"
        );

    }


    if (
        tema ===
        "dark"
    ) {

        document.body.classList.add(
            "theme-dark"
        );

    }


    localStorage.setItem(
        "temaTokoMainan",
        tema
    );

}


// =====================================================
// LOAD TEMA
// =====================================================

function loadTema() {

    const tema =
        localStorage.getItem(
            "temaTokoMainan"
        );


    document.body.classList.remove(
        "theme-blue",
        "theme-dark"
    );


    if (
        tema ===
        "blue"
    ) {

        document.body.classList.add(
            "theme-blue"
        );

    }


    if (
        tema ===
        "dark"
    ) {

        document.body.classList.add(
            "theme-dark"
        );

    }

}

// =====================================================
// TENTANG APLIKASI
// =====================================================

function tentangAplikasi() {

    document.getElementById(
        "isi"
    ).innerHTML = `

        <div class="content-box">

            <button
                type="button"
                class="btn-secondary"
                onclick="pengaturan()"
                style="margin-bottom: 20px;"
            >
                ← Kembali
            </button>


            <div class="about-app">

                <div class="about-icon">
                    🧸
                </div>

                <h2>
                    ${NAMA_APLIKASI}
                </h2>

                <p>
                    Aplikasi untuk membantu
                    mengelola persediaan,
                    pembelian, penjualan,
                    dan laporan toko mainan.
                </p>

                <p>
                    Versi 1.0
                </p>

            </div>

        </div>

    `;

}

// =====================================================
// JURNAL UMUM
// =====================================================

async function jurnalUmum() {

    ubahJudul("Jurnal Umum");
    aktifkanMenu("Jurnal Umum");

    const isi = document.getElementById("isi");

    isi.innerHTML = `

        <div class="page-header">

            <div>

                <p class="header-small">
                    AKUNTANSI
                </p>

                <h2>
                    Jurnal Umum
                </h2>

                <p class="page-description">
                    Pencatatan transaksi akuntansi perusahaan
                </p>

            </div>

        </div>


        <!-- =================================================
             FILTER
             ================================================= -->

        <div class="report-filter-box">

            <div class="report-filter-header">

                <div>

                    <span>
                        FILTER DATA
                    </span>

                    <h3>
                        Filter Jurnal Umum
                    </h3>

                </div>


                <button
                    type="button"
                    class="report-reset-button"
                    onclick="resetFilterJurnalUmum()"
                >
                    ↻ Reset Filter
                </button>

            </div>


            <div class="report-filter-grid">


                <!-- PENCARIAN -->

                <div class="report-filter-group">

                    <label>
                        Cari Jurnal
                    </label>

                    <input
                        type="text"
                        id="filterCariJurnal"
                        placeholder="Nomor bukti, akun, atau keterangan..."
                        oninput="terapkanFilterJurnalUmum()"
                    >

                </div>


                <!-- TANGGAL MULAI -->

                <div class="report-filter-group">

                    <label>
                        Dari Tanggal
                    </label>

                    <input
                        type="date"
                        id="filterTanggalMulaiJurnal"
                        onchange="terapkanFilterJurnalUmum()"
                    >

                </div>


                <!-- TANGGAL AKHIR -->

                <div class="report-filter-group">

                    <label>
                        Sampai Tanggal
                    </label>

                    <input
                        type="date"
                        id="filterTanggalAkhirJurnal"
                        onchange="terapkanFilterJurnalUmum()"
                    >

                </div>

            </div>

        </div>


        <!-- =================================================
             RINGKASAN
             ================================================= -->

        <div class="report-summary-grid">


            <!-- TOTAL BARIS JURNAL -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    📒
                </div>

                <div>

                    <span>
                        Total Jurnal
                    </span>

                    <strong id="jurnalTotalBaris">
                        0
                    </strong>

                    <small>
                        Baris jurnal
                    </small>

                </div>

            </div>


            <!-- TOTAL TRANSAKSI -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    📅
                </div>

                <div>

                    <span>
                        Total Transaksi
                    </span>

                    <strong id="jurnalTotalTransaksi">
                        0
                    </strong>

                    <small>
                        Nomor bukti
                    </small>

                </div>

            </div>


            <!-- TOTAL DEBIT -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    💳
                </div>

                <div>

                    <span>
                        Total Debit
                    </span>

                    <strong id="jurnalTotalDebit">
                        Rp 0
                    </strong>

                    <small>
                        Jumlah debit
                    </small>

                </div>

            </div>


            <!-- TOTAL KREDIT -->

            <div class="report-summary-card">

                <div class="report-summary-icon">
                    💰
                </div>

                <div>

                    <span>
                        Total Kredit
                    </span>

                    <strong id="jurnalTotalKredit">
                        Rp 0
                    </strong>

                    <small>
                        Jumlah kredit
                    </small>

                </div>

            </div>

        </div>


        <!-- =================================================
             TABEL JURNAL
             ================================================= -->

        <div class="table-card">

            <div class="table-card-header">

                <div>

                    <span>
                        DATA AKUNTANSI
                    </span>

                    <h3>
                        Daftar Jurnal Umum
                    </h3>

                </div>


                <button
                    type="button"
                    class="primary-button"
                    onclick="cetakJurnalUmum()"
                >
                    🖨️ Cetak Jurnal
                </button>

            </div>


            <div class="table-wrapper">

                <table>

                    <thead>

                        <tr>

                            <th>
                                No
                            </th>

                            <th>
                                Tanggal
                            </th>

                            <th>
                                Akun
                            </th>

                            <th>
                                No. Bukti
                            </th>

                            <th>
                                Ref
                            </th>

                            <th class="text-right">
                                Debit
                            </th>

                            <th class="text-right">
                                Kredit
                            </th>

                            <th>
                                Keterangan
                            </th>

                        </tr>

                    </thead>


                    <tbody id="tabelJurnalUmum">

                        <tr>

                            <td
                                colspan="8"
                                class="empty"
                            >
                                Memuat data jurnal...

                            </td>

                        </tr>

                    </tbody>


                    <tfoot id="footerJurnalUmum">

                    </tfoot>

                </table>

            </div>

        </div>

    `;


    await muatJurnalUmum();

}


// =====================================================
// DATA JURNAL UMUM
// =====================================================

let dataJurnalUmum = [];


// =====================================================
// MUAT DATA JURNAL
// =====================================================

async function muatJurnalUmum() {

    if (!cekSupabase()) {
        return;
    }


    const tabel =
        document.getElementById(
            "tabelJurnalUmum"
        );


    if (!tabel) {
        return;
    }


    tabel.innerHTML = `

        <tr>

            <td
                colspan="8"
                class="empty"
            >
                Memuat data jurnal...

            </td>

        </tr>

    `;


    const { data, error } =
        await supabaseClient
            .from("jurnal_umum")
            .select(`
                id_jurnal,
                tanggal_jurnal,
                nomor_bukti,
                sumber_transaksi,
                id_akun,
                keterangan,
                debit,
                kredit,
                akun (
                    kode_akun,
                    nama_akun
                )
            `)
            .order(
                "tanggal_jurnal",
                {
                    ascending: true
                }
            )
            .order(
                "id_jurnal",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Gagal mengambil jurnal umum:",
            error
        );


        tabel.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty"
                >
                    Gagal mengambil data jurnal.

                </td>

            </tr>

        `;

        return;
    }


    dataJurnalUmum =
        Array.isArray(data)
            ? data
            : [];


    console.log(
        "DATA JURNAL UMUM:",
        dataJurnalUmum
    );


    terapkanFilterJurnalUmum();

}

// =====================================================
// PAGINATION JURNAL UMUM
// 10 TRANSAKSI PER HALAMAN
// =====================================================

let dataJurnalUmumTerfilter = [];

let halamanJurnalUmum = 1;

const transaksiPerHalamanJurnal = 10;

// =====================================================
// FILTER JURNAL
// =====================================================

function terapkanFilterJurnalUmum() {

    const cari =
        document.getElementById(
            "filterCariJurnal"
        );


    const mulai =
        document.getElementById(
            "filterTanggalMulaiJurnal"
        );


    const akhir =
        document.getElementById(
            "filterTanggalAkhirJurnal"
        );


    const keyword =
        cari
            ? cari.value
                .trim()
                .toLowerCase()
            : "";


    const tanggalMulai =
        mulai
            ? mulai.value
            : "";


    const tanggalAkhir =
        akhir
            ? akhir.value
            : "";


    const hasil =
        dataJurnalUmum.filter(
            function (item) {

                const nomor =
                    String(
                        item.nomor_bukti || ""
                    )
                    .toLowerCase();


                const keterangan =
                    String(
                        item.keterangan || ""
                    )
                    .toLowerCase();


                const namaAkun =
                    item.akun
                        ? String(
                            item.akun.nama_akun || ""
                        )
                        .toLowerCase()
                        : "";


                const kodeAkun =
                    item.akun
                        ? String(
                            item.akun.kode_akun || ""
                        )
                        .toLowerCase()
                        : "";


                const sumber =
                    String(
                        item.sumber_transaksi || ""
                    )
                    .toLowerCase();


                const cocokCari =
                    !keyword ||
                    nomor.includes(keyword) ||
                    keterangan.includes(keyword) ||
                    namaAkun.includes(keyword) ||
                    kodeAkun.includes(keyword) ||
                    sumber.includes(keyword);


                const tanggal =
                    item.tanggal_jurnal || "";


                const cocokMulai =
                    !tanggalMulai ||
                    tanggal >= tanggalMulai;


                const cocokAkhir =
                    !tanggalAkhir ||
                    tanggal <= tanggalAkhir;


                return (
                    cocokCari &&
                    cocokMulai &&
                    cocokAkhir
                );

            }
        );


    dataJurnalUmumTerfilter = hasil;

halamanJurnalUmum = 1;

tampilkanJurnalUmum(
    dataJurnalUmumTerfilter,
    1
);

}

// =====================================================
// TAMPILKAN JURNAL UMUM
// 10 TRANSAKSI PER HALAMAN
// =====================================================

function tampilkanJurnalUmum(
    data,
    halaman = 1
) {

    const tabel =
        document.getElementById(
            "tabelJurnalUmum"
        );

    const footer =
        document.getElementById(
            "footerJurnalUmum"
        );

    if (!tabel) {
        return;
    }


    // =================================================
    // TOTAL KESELURUHAN DATA
    // =================================================

    let totalDebit = 0;
    let totalKredit = 0;

    const nomorBuktiSet = new Set();


    data.forEach(function(item) {

        totalDebit +=
            Number(item.debit || 0);

        totalKredit +=
            Number(item.kredit || 0);

        if (item.nomor_bukti) {

            nomorBuktiSet.add(
                item.nomor_bukti
            );

        }

    });


    // =================================================
    // UPDATE RINGKASAN
    // =================================================

    const totalBaris =
        document.getElementById(
            "jurnalTotalBaris"
        );

    const totalTransaksi =
        document.getElementById(
            "jurnalTotalTransaksi"
        );

    const totalDebitElement =
        document.getElementById(
            "jurnalTotalDebit"
        );

    const totalKreditElement =
        document.getElementById(
            "jurnalTotalKredit"
        );


    if (totalBaris) {

        totalBaris.textContent =
            data.length;

    }


    if (totalTransaksi) {

        totalTransaksi.textContent =
            nomorBuktiSet.size;

    }


    if (totalDebitElement) {

        totalDebitElement.textContent =
            formatRupiah(totalDebit);

    }


    if (totalKreditElement) {

        totalKreditElement.textContent =
            formatRupiah(totalKredit);

    }


    // =================================================
    // JIKA DATA KOSONG
    // =================================================

    if (data.length === 0) {

        tabel.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty"
                >

                    Belum ada data jurnal umum.

                </td>

            </tr>

        `;


        if (footer) {

            footer.innerHTML = "";

        }

        return;

    }


    // =================================================
    // KELOMPOKKAN BERDASARKAN NOMOR BUKTI
    // =================================================

    const kelompokTransaksi = [];

    const mapTransaksi = new Map();


    data.forEach(function(item) {

        /*
         * Jika ada nomor_bukti,
         * semua baris dengan nomor bukti
         * yang sama dianggap 1 transaksi.
         *
         * Jika tidak ada nomor_bukti,
         * setiap baris dianggap transaksi sendiri.
         */

        const key =
            item.nomor_bukti
                ? "NO:" + item.nomor_bukti
                : "ROW:" + item.id_jurnal;


        if (!mapTransaksi.has(key)) {

            const group = {

                key: key,

                nomor_bukti:
                    item.nomor_bukti || "-",

                items: []

            };


            mapTransaksi.set(
                key,
                group
            );


            kelompokTransaksi.push(
                group
            );

        }


        mapTransaksi
            .get(key)
            .items
            .push(item);

    });


    // =================================================
    // HITUNG PAGINATION
    // =================================================

    const totalHalaman =
        Math.max(
            1,
            Math.ceil(
                kelompokTransaksi.length /
                transaksiPerHalamanJurnal
            )
        );


    if (halaman < 1) {

        halaman = 1;

    }


    if (halaman > totalHalaman) {

        halaman =
            totalHalaman;

    }


    halamanJurnalUmum =
        halaman;


    const mulaiTransaksi =
        (
            halaman - 1
        ) *
        transaksiPerHalamanJurnal;


    const selesaiTransaksi =
        mulaiTransaksi +
        transaksiPerHalamanJurnal;


    const transaksiHalaman =
        kelompokTransaksi.slice(
            mulaiTransaksi,
            selesaiTransaksi
        );


    // =================================================
    // BUAT BARIS TABEL
    // =================================================

    let rows = "";


    transaksiHalaman.forEach(
        function(group, indexTransaksi) {

            const nomorUrut =
                mulaiTransaksi +
                indexTransaksi +
                1;


            group.items.forEach(
                function(item, indexBaris) {

                    const akun =
                        item.akun || {};


                    const kodeAkun =
                        akun.kode_akun ||
                        "-";


                    const namaAkun =
                        akun.nama_akun ||
                        "-";


                    const debit =
                        Number(
                            item.debit || 0
                        );


                    const kredit =
                        Number(
                            item.kredit || 0
                        );


                    const transaksiBaru =
                        indexBaris === 0;


                    rows += `

                        <tr>

                            <!-- NO -->

                            <td>

                                ${
                                    transaksiBaru
                                        ? nomorUrut
                                        : ""
                                }

                            </td>


                            <!-- TANGGAL -->

                            <td>

                                ${
                                    transaksiBaru
                                        ? formatTanggalJurnal(
                                            item.tanggal_jurnal
                                        )
                                        : ""
                                }

                            </td>


                            <!-- AKUN -->

                            <td>

                                <strong>

                                    ${escapeHtml(
                                        namaAkun
                                    )}

                                </strong>

                            </td>


                            <!-- NO. BUKTI -->

                            <td>

                                ${
                                    transaksiBaru
                                        ? `
                                            <strong>

                                                ${escapeHtml(
                                                    group.nomor_bukti
                                                )}

                                            </strong>
                                          `
                                        : ""
                                }

                            </td>


                            <!-- REF -->

                            <td>

                                ${escapeHtml(
                                    kodeAkun
                                )}

                            </td>


                            <!-- DEBIT -->

                            <td
                                class="text-right"
                            >

                                ${
                                    debit > 0
                                        ? formatRupiah(
                                            debit
                                        )
                                        : "-"
                                }

                            </td>


                            <!-- KREDIT -->

                            <td
                                class="text-right"
                            >

                                ${
                                    kredit > 0
                                        ? formatRupiah(
                                            kredit
                                        )
                                        : "-"
                                }

                            </td>


                            <!-- KETERANGAN -->

                            <td>

                                ${
                                    transaksiBaru
                                        ? `
                                            <div
                                                class="jurnal-keterangan"
                                            >

                                                <span>

                                                    ${escapeHtml(
                                                        item.keterangan ||
                                                        "-"
                                                    )}

                                                </span>


                                                <small>

                                                    ${escapeHtml(
                                                        item.sumber_transaksi ||
                                                        "-"
                                                    )}

                                                </small>

                                            </div>
                                          `
                                        : ""
                                }

                            </td>


                        </tr>

                    `;

                }
            );

        }
    );


    tabel.innerHTML =
        rows;


    // =================================================
    // TOTAL + PAGINATION
    // =================================================

    if (footer) {

        footer.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="text-right"
                >

                    <strong>
                        TOTAL
                    </strong>

                </td>


                <td
                    class="text-right"
                >

                    <strong>

                        ${formatRupiah(
                            totalDebit
                        )}

                    </strong>

                </td>


                <td
                    class="text-right"
                >

                    <strong>

                        ${formatRupiah(
                            totalKredit
                        )}

                    </strong>

                </td>


                <td>

                </td>

            </tr>


            <!-- PAGINATION -->

            <tr>

                <td
                    colspan="8"
                    style="
                        padding: 15px;
                        text-align: center;
                    "
                >

                    <div
                        style="
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            gap: 10px;
                            flex-wrap: wrap;
                        "
                    >

                        <button
                            type="button"
                            class="btn-secondary"
                            onclick="
                                tampilkanJurnalUmum(
                                    dataJurnalUmumTerfilter,
                                    ${halamanJurnalUmum - 1}
                                )
                            "
                            ${
                                halamanJurnalUmum <= 1
                                    ? "disabled"
                                    : ""
                            }
                        >

                            ← Sebelumnya

                        </button>


                        <span
                            style="
                                font-weight: 600;
                                padding: 8px 14px;
                            "
                        >

                            Halaman
                            ${halamanJurnalUmum}
                            dari
                            ${totalHalaman}

                        </span>


                        <button
                            type="button"
                            class="btn-primary"
                            onclick="
                                tampilkanJurnalUmum(
                                    dataJurnalUmumTerfilter,
                                    ${halamanJurnalUmum + 1}
                                )
                            "
                            ${
                                halamanJurnalUmum >= totalHalaman
                                    ? "disabled"
                                    : ""
                            }
                        >

                            Berikutnya →

                        </button>

                    </div>

                </td>

            </tr>

        `;

    }

}

// =====================================================
// RESET FILTER
// =====================================================

function resetFilterJurnalUmum() {

    const cari =
        document.getElementById(
            "filterCariJurnal"
        );


    const mulai =
        document.getElementById(
            "filterTanggalMulaiJurnal"
        );


    const akhir =
        document.getElementById(
            "filterTanggalAkhirJurnal"
        );


    if (cari) {

        cari.value = "";

    }


    if (mulai) {

        mulai.value = "";

    }


    if (akhir) {

        akhir.value = "";

    }


    terapkanFilterJurnalUmum();

}


// =====================================================
// FORMAT TANGGAL JURNAL
// =====================================================

function formatTanggalJurnal(tanggal) {

    if (!tanggal) {
        return "-";
    }


    const bagian =
        String(tanggal).split("-");


    if (bagian.length !== 3) {
        return tanggal;
    }


    return (
        bagian[2] +
        "/" +
        bagian[1] +
        "/" +
        bagian[0]
    );

}

// =====================================================
// CETAK JURNAL UMUM - PREVIEW BERDASARKAN PERIODE
// =====================================================

function cetakJurnalUmum() {

    const cari =
        document.getElementById("filterCariJurnal");

    const mulai =
        document.getElementById("filterTanggalMulaiJurnal");

    const akhir =
        document.getElementById("filterTanggalAkhirJurnal");


    const keyword =
        cari
            ? cari.value.trim().toLowerCase()
            : "";

    const tanggalMulai =
        mulai
            ? mulai.value
            : "";

    const tanggalAkhir =
        akhir
            ? akhir.value
            : "";


    // =================================================
    // VALIDASI PERIODE
    // =================================================

    if (
        tanggalMulai &&
        tanggalAkhir &&
        tanggalMulai > tanggalAkhir
    ) {

        alert(
            "Tanggal mulai tidak boleh lebih besar dari tanggal akhir."
        );

        return;
    }


    // =================================================
    // FILTER DATA JURNAL
    // =================================================

    const data =
        dataJurnalUmum.filter(
            function (item) {

                const nomor =
                    String(
                        item.nomor_bukti || ""
                    ).toLowerCase();


                const keterangan =
                    String(
                        item.keterangan || ""
                    ).toLowerCase();


                const namaAkun =
                    item.akun
                        ? String(
                            item.akun.nama_akun || ""
                        ).toLowerCase()
                        : "";


                const sumber =
                    String(
                        item.sumber_transaksi || ""
                    ).toLowerCase();


                const cocokCari =
                    !keyword ||
                    nomor.includes(keyword) ||
                    keterangan.includes(keyword) ||
                    namaAkun.includes(keyword) ||
                    sumber.includes(keyword);


                const tanggal =
                    item.tanggal_jurnal || "";


                const cocokMulai =
                    !tanggalMulai ||
                    tanggal >= tanggalMulai;


                const cocokAkhir =
                    !tanggalAkhir ||
                    tanggal <= tanggalAkhir;


                return (
                    cocokCari &&
                    cocokMulai &&
                    cocokAkhir
                );

            }
        );


    // =================================================
    // FORMAT PERIODE
    // =================================================

    function formatPeriode(tanggal) {

        if (!tanggal) {
            return "";
        }

        const bagian =
            tanggal.split("-");

        if (bagian.length !== 3) {
            return tanggal;
        }

        const tahun =
            Number(bagian[0]);

        const bulan =
            Number(bagian[1]) - 1;

        const hari =
            Number(bagian[2]);


        const namaBulan = [
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember"
        ];


        return (
            String(hari).padStart(2, "0") +
            " " +
            namaBulan[bulan] +
            " " +
            tahun
        );
    }


    let teksPeriode = "Semua Periode";


    if (
        tanggalMulai &&
        tanggalAkhir
    ) {

        teksPeriode =
            "Periode " +
            formatPeriode(tanggalMulai) +
            " s.d. " +
            formatPeriode(tanggalAkhir);

    } else if (tanggalMulai) {

        teksPeriode =
            "Mulai " +
            formatPeriode(tanggalMulai);

    } else if (tanggalAkhir) {

        teksPeriode =
            "Sampai " +
            formatPeriode(tanggalAkhir);
    }


    // =================================================
    // WINDOW PREVIEW
    // =================================================

    const windowCetak =
        window.open(
            "",
            "_blank",
            "width=1200,height=900"
        );


    if (!windowCetak) {

        alert(
            "Popup diblokir browser. Silakan izinkan popup untuk melihat preview jurnal."
        );

        return;
    }


    // =================================================
    // TOTAL
    // =================================================

    let totalDebit = 0;
    let totalKredit = 0;
    let rows = "";


    data.forEach(
        function (item, index) {

            const debit =
                Number(
                    item.debit || 0
                );


            const kredit =
                Number(
                    item.kredit || 0
                );


            totalDebit += debit;
            totalKredit += kredit;


            const akun =
                item.akun || {};


            rows += `

                <tr>

                    <td class="center">
                        ${index + 1}
                    </td>

                    <td class="center">
                        ${formatTanggalJurnal(
                            item.tanggal_jurnal
                        )}
                    </td>

                    <td class="center">
                        ${escapeHtml(
                            item.nomor_bukti || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            akun.nama_akun || "-"
                        )}
                    </td>

                    <td class="center">
                        ${escapeHtml(
                            akun.kode_akun || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.keterangan || "-"
                        )}
                    </td>

                    <td class="number">
                        ${
                            debit > 0
                                ? formatRupiah(debit)
                                : "-"
                        }
                    </td>

                    <td class="number">
                        ${
                            kredit > 0
                                ? formatRupiah(kredit)
                                : "-"
                        }
                    </td>

                </tr>

            `;

        }
    );


    // =================================================
    // JIKA DATA KOSONG
    // =================================================

    if (!rows) {

        rows = `

            <tr>

                <td
                    colspan="8"
                    class="empty"
                >
                    Tidak ada data jurnal
                    pada periode yang dipilih.

                </td>

            </tr>

        `;
    }


    // =================================================
    // HTML PREVIEW
    // =================================================

    windowCetak.document.write(`

        <!DOCTYPE html>

        <html lang="id">

        <head>

            <meta charset="UTF-8">

            <title>
                Preview Jurnal Umum
            </title>


            <style>

                @page {
                    size: A4 landscape;
                    margin: 15mm;
                }


                * {
                    box-sizing: border-box;
                }


                body {

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    color: #222;

                    font-size: 11px;

                    margin: 0;

                    background: #f1f1f1;

                }


                /* =====================================
                   TOOLBAR PREVIEW
                   ===================================== */

                .preview-toolbar {

                    position: sticky;

                    top: 0;

                    background: white;

                    border-bottom: 1px solid #ddd;

                    padding: 12px 20px;

                    display: flex;

                    justify-content: flex-end;

                    gap: 10px;

                    z-index: 100;

                    box-shadow:
                        0 2px 5px
                        rgba(0,0,0,0.08);

                }


                .btn {

                    border: none;

                    border-radius: 6px;

                    padding:
                        10px 18px;

                    font-size: 13px;

                    cursor: pointer;

                    font-weight: bold;

                }


                .btn-print {

                    background: #e9a9bd;

                    color: #ffffff;

                }


                .btn-print:hover {

                    background: #d98fa8;

                }


                .btn-close {

                    background: #eeeeee;

                    color: #333333;

                }


                .btn-close:hover {

                    background: #dddddd;

                }


                /* =====================================
                   KERTAS
                   ===================================== */

                .paper {

                    width: 100%;

                    max-width: 1120px;

                    min-height: 750px;

                    margin:
                        25px auto;

                    background: white;

                    padding: 35px 40px;

                    box-shadow:
                        0 2px 12px
                        rgba(0,0,0,0.12);

                }


                /* =====================================
                   HEADER
                   ===================================== */

                .header {

                    text-align: center;

                    margin-bottom: 18px;

                }


                .company-name {

                    font-size: 20px;

                    font-weight: bold;

                    text-transform: uppercase;

                    margin: 0 0 5px 0;

                }


                .company-subtitle {

                    font-size: 12px;

                    margin: 0;

                    color: #555;

                }


                .line {

                    border-top:
                        2px solid #222;

                    margin-top: 12px;

                }


                /* =====================================
                   JUDUL
                   ===================================== */

                .document-title {

                    text-align: center;

                    margin:
                        18px 0 20px 0;

                }


                .document-title h2 {

                    margin: 0;

                    font-size: 18px;

                    text-transform: uppercase;

                }


                .document-title p {

                    margin: 6px 0 0 0;

                    font-size: 12px;

                    font-weight: bold;

                }


                /* =====================================
                   TABLE
                   ===================================== */

                table {

                    width: 100%;

                    border-collapse:
                        collapse;

                }


                th,
                td {

                    border:
                        1px solid #555;

                    padding:
                        7px 8px;

                    vertical-align:
                        top;

                }


                th {

                    background:
                        #eeeeee;

                    text-align:
                        center;

                    font-weight:
                        bold;

                }


                td.center {

                    text-align:
                        center;

                }


                td.number {

                    text-align:
                        right;

                    white-space:
                        nowrap;

                }


                td.empty {

                    text-align:
                        center;

                    padding:
                        25px;

                    color:
                        #777;

                }


                .total td {

                    font-weight:
                        bold;

                    background:
                        #f5f5f5;

                }


                /* =====================================
                   FOOTER
                   ===================================== */

                .footer {

                    margin-top:
                        45px;

                    display:
                        flex;

                    justify-content:
                        space-between;

                    text-align:
                        center;

                }


                .signature {

                    width:
                        180px;

                }


                .signature-space {

                    height:
                        65px;

                }


                /* =====================================
                   PRINT
                   ===================================== */

                @media print {

                    body {

                        background:
                            white;

                    }


                    .preview-toolbar {

                        display:
                            none;

                    }


                    .paper {

                        width:
                            100%;

                        max-width:
                            none;

                        min-height:
                            auto;

                        margin:
                            0;

                        padding:
                            0;

                        box-shadow:
                            none;

                    }


                    body {

                        print-color-adjust:
                            exact;

                        -webkit-print-color-adjust:
                            exact;

                    }

                }

            </style>

        </head>


        <body>


            <!-- ======================================
                 TOOLBAR PREVIEW
                 ====================================== -->

            <div class="preview-toolbar">

                <button
                    class="btn btn-close"
                    onclick="window.close()"
                >
                    ✕ Tutup
                </button>


                <button
                    class="btn btn-print"
                    onclick="window.print()"
                >
                    🖨 Cetak
                </button>

            </div>


            <!-- ======================================
                 KERTAS LAPORAN
                 ====================================== -->

            <div class="paper">


                <!-- HEADER -->

                <div class="header">

                    <div class="company-name">
                        TOKO MAINAN
                    </div>

                    <div class="company-subtitle">
                        SISTEM AKUNTANSI PERSEDIAAN
                    </div>

                    <div class="line"></div>

                </div>


                <!-- JUDUL -->

                <div class="document-title">

                    <h2>
                        JURNAL UMUM
                    </h2>

                    <p>
                        ${teksPeriode}
                    </p>

                </div>


                <!-- TABEL -->

                <table>

                    <thead>

                        <tr>

                            <th>
                                No
                            </th>

                            <th>
                                Tanggal
                            </th>

                            <th>
                                No. Bukti
                            </th>

                            <th>
                                Akun
                            </th>

                            <th>
                                Ref
                            </th>

                            <th>
                                Keterangan
                            </th>

                            <th>
                                Debit
                            </th>

                            <th>
                                Kredit
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows}


                        <tr class="total">

                            <td
                                colspan="6"
                                style="text-align:right;"
                            >
                                TOTAL

                            </td>

                            <td class="number">

                                ${formatRupiah(
                                    totalDebit
                                )}

                            </td>

                            <td class="number">

                                ${formatRupiah(
                                    totalKredit
                                )}

                            </td>

                        </tr>

                    </tbody>

                </table>


                <!-- TANDA TANGAN -->

                <div class="footer">

                    <div class="signature">

                        Dibuat oleh

                        <div
                            class="signature-space"
                        ></div>

                        (________________)

                    </div>


                    <div class="signature">

                        Diperiksa oleh

                        <div
                            class="signature-space"
                        ></div>

                        (________________)

                    </div>


                    <div class="signature">

                        Disetujui oleh

                        <div
                            class="signature-space"
                        ></div>

                        (________________)

                    </div>

                </div>


            </div>


        </body>

        </html>

    `);


    windowCetak.document.close();

    windowCetak.focus();

}

// =====================================================
// BUKU BESAR
// =====================================================

async function bukuBesar() {

    ubahJudul("Buku Besar");

    aktifkanMenu("Buku Besar");

    document.getElementById("isi").innerHTML = `

        <div class="content-box buku-besar-page">

            <div class="page-header buku-besar-header">

                <div>
                    <h2>Buku Besar</h2>

                    <p>
                        Laporan mutasi dan saldo setiap akun
                        berdasarkan Jurnal Umum.
                    </p>
                </div>

            </div>


            <!-- FILTER -->
            <div class="buku-besar-filter">

                <div class="form-group">

                    <label>Pilih Akun</label>

                    <select id="akunBukuBesar">

                        <option value="">
                            -- Pilih Akun --
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>Tanggal Mulai</label>

                    <input
                        type="date"
                        id="tanggalMulaiBukuBesar"
                    >

                </div>


                <div class="form-group">

                    <label>Tanggal Akhir</label>

                    <input
                        type="date"
                        id="tanggalAkhirBukuBesar"
                    >

                </div>


                <div class="buku-besar-filter-actions">

                    <button
                        type="button"
                        class="btn-primary"
                        onclick="muatBukuBesar()"
                    >
                        Tampilkan
                    </button>

                    <button
                        type="button"
                        class="btn-secondary"
                        onclick="resetBukuBesar()"
                    >
                        Reset
                    </button>

                </div>

            </div>


            <!-- HASIL BUKU BESAR -->
            <div
                id="tabelBukuBesar"
                class="buku-besar-result"
            >

                <div class="buku-besar-empty">

                    <div class="buku-besar-empty-icon">
                        📖
                    </div>

                    <h3>Pilih akun terlebih dahulu</h3>

                    <p>
                        Pilih akun dan periode untuk
                        menampilkan Buku Besar.
                    </p>

                </div>

            </div>

        </div>

    `;


    await muatAkunBukuBesar();

}

// =====================================================
// MUAT AKUN UNTUK BUKU BESAR
// =====================================================

async function muatAkunBukuBesar() {

    const select =
        document.getElementById(
            "akunBukuBesar"
        );


    if (!select) {
        return;
    }


    if (!cekSupabase()) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("akun")
            .select(`
                id_akun,
                kode_akun,
                nama_akun,
                jenis_akun
            `)
            .order(
                "kode_akun",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "ERROR MUAT AKUN BUKU BESAR:",
            error
        );


        select.innerHTML = `

            <option value="">
                Gagal memuat akun
            </option>

        `;

        return;
    }


    select.innerHTML = `

        <option value="">
            -- Semua Akun --
        </option>

    `;


    data.forEach(
        function (akun) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                akun.id_akun;


            option.textContent =
                akun.kode_akun +
                " - " +
                akun.nama_akun;


            select.appendChild(
                option
            );

        }
    );

}

// =====================================================
// MUAT DATA BUKU BESAR
// =====================================================

async function muatBukuBesar() {

    const container =
        document.getElementById("tabelBukuBesar");

    if (!container) {
        return;
    }

    if (!cekSupabase()) {
        return;
    }


    const akunSelect =
        document.getElementById("akunBukuBesar");

    const tanggalMulaiInput =
        document.getElementById(
            "tanggalMulaiBukuBesar"
        );

    const tanggalAkhirInput =
        document.getElementById(
            "tanggalAkhirBukuBesar"
        );


    const idAkun =
        akunSelect ? akunSelect.value : "";

    const tanggalMulai =
        tanggalMulaiInput
            ? tanggalMulaiInput.value
            : "";

    const tanggalAkhir =
        tanggalAkhirInput
            ? tanggalAkhirInput.value
            : "";


    // ==========================================
    // VALIDASI
    // ==========================================

    if (!idAkun) {

        container.innerHTML = `
            <div class="buku-besar-empty">

                <div class="buku-besar-empty-icon">
                    📖
                </div>

                <h3>Akun belum dipilih</h3>

                <p>
                    Silakan pilih akun terlebih dahulu
                    untuk melihat Buku Besar.
                </p>

            </div>
        `;

        return;
    }


    if (
        tanggalMulai &&
        tanggalAkhir &&
        tanggalMulai > tanggalAkhir
    ) {

        alert(
            "Tanggal mulai tidak boleh lebih besar dari tanggal akhir."
        );

        return;
    }


    // ==========================================
    // AMBIL DATA AKUN
    // ==========================================

    const {
        data: akunData,
        error: akunError
    } = await supabaseClient

        .from("akun")

        .select(`
            id_akun,
            kode_akun,
            nama_akun,
            jenis_akun
        `)

        .eq("id_akun", Number(idAkun))

        .single();


    if (akunError) {

        console.error(
            "ERROR AKUN BUKU BESAR:",
            akunError
        );

        container.innerHTML = `
            <div class="buku-besar-empty">
                <h3>Gagal mengambil akun</h3>
                <p>${escapeHtml(akunError.message)}</p>
            </div>
        `;

        return;
    }


    // ==========================================
    // AMBIL SALDO SEBELUM PERIODE
    // ==========================================

    let saldoAwal = 0;

    if (tanggalMulai) {

        let querySaldoAwal =
            supabaseClient

                .from("jurnal_umum")

                .select(`
                    debit,
                    kredit
                `)

                .eq(
                    "id_akun",
                    Number(idAkun)
                )

                .lt(
                    "tanggal_jurnal",
                    tanggalMulai
                );


        const {
            data: dataSaldoAwal,
            error: errorSaldoAwal
        } = await querySaldoAwal;


        if (errorSaldoAwal) {

            console.error(
                "ERROR SALDO AWAL:",
                errorSaldoAwal
            );

            container.innerHTML = `
                <div class="buku-besar-empty">
                    <h3>Gagal mengambil saldo awal</h3>
                    <p>${escapeHtml(errorSaldoAwal.message)}</p>
                </div>
            `;

            return;
        }


        dataSaldoAwal.forEach(function(item) {

            const debit =
                Number(item.debit || 0);

            const kredit =
                Number(item.kredit || 0);


            if (
                akunData.jenis_akun === "KEWAJIBAN" ||
                akunData.jenis_akun === "EKUITAS" ||
                akunData.jenis_akun === "PENDAPATAN"
            ) {

                saldoAwal =
                    saldoAwal +
                    kredit -
                    debit;

            } else {

                saldoAwal =
                    saldoAwal +
                    debit -
                    kredit;

            }

        });

    }


    // ==========================================
    // AMBIL JURNAL PERIODE
    // ==========================================

    let query =
        supabaseClient

            .from("jurnal_umum")

            .select(`
                id_jurnal,
                tanggal_jurnal,
                nomor_bukti,
                sumber_transaksi,
                keterangan,
                debit,
                kredit
            `)

            .eq(
                "id_akun",
                Number(idAkun)
            )

            .order(
                "tanggal_jurnal",
                {
                    ascending: true
                }
            )

            .order(
                "id_jurnal",
                {
                    ascending: true
                }
            );


    if (tanggalMulai) {

        query =
            query.gte(
                "tanggal_jurnal",
                tanggalMulai
            );

    }


    if (tanggalAkhir) {

        query =
            query.lte(
                "tanggal_jurnal",
                tanggalAkhir
            );

    }


    const {
        data,
        error
    } = await query;


    if (error) {

        console.error(
            "ERROR MUAT BUKU BESAR:",
            error
        );

        container.innerHTML = `
            <div class="buku-besar-empty">

                <h3>Gagal mengambil data</h3>

                <p>
                    ${escapeHtml(error.message)}
                </p>

            </div>
        `;

        return;
    }


    // ==========================================
    // HITUNG SALDO
    // ==========================================

    let saldo =
        saldoAwal;

    let totalDebit = 0;

    let totalKredit = 0;


    function hitungSaldo(debit, kredit) {

        if (
            akunData.jenis_akun === "KEWAJIBAN" ||
            akunData.jenis_akun === "EKUITAS" ||
            akunData.jenis_akun === "PENDAPATAN"
        ) {

            return kredit - debit;

        }


        return debit - kredit;

    }


    // ==========================================
    // HEADER BUKU BESAR
    // ==========================================

    const periodeText =
        tanggalMulai && tanggalAkhir

            ? `${formatTanggal(tanggalMulai)} s/d ${formatTanggal(tanggalAkhir)}`

            : tanggalMulai

                ? `Mulai ${formatTanggal(tanggalMulai)}`

                : tanggalAkhir

                    ? `Sampai ${formatTanggal(tanggalAkhir)}`

                    : "Semua Periode";


    let html = `

        <div class="buku-besar-paper">


            <!-- IDENTITAS -->
            <div class="buku-besar-company">

                <div>

                    <div class="buku-besar-company-name">
                        TOKO MAINAN
                    </div>

                    <div class="buku-besar-company-subtitle">
                        SISTEM AKUNTANSI PERSEDIAAN
                    </div>

                </div>

                <div class="buku-besar-report-label">
                    LAPORAN AKUNTANSI
                </div>

            </div>


            <div class="buku-besar-title">

                <h2>BUKU BESAR</h2>

                <div class="buku-besar-period">
                    Periode: ${escapeHtml(periodeText)}
                </div>

            </div>


            <!-- INFORMASI AKUN -->
            <div class="buku-besar-account-info">

                <div class="account-info-item">

                    <span>Kode Akun</span>

                    <strong>
                        ${escapeHtml(akunData.kode_akun)}
                    </strong>

                </div>


                <div class="account-info-item">

                    <span>Nama Akun</span>

                    <strong>
                        ${escapeHtml(akunData.nama_akun)}
                    </strong>

                </div>


                <div class="account-info-item">

                    <span>Jenis Akun</span>

                    <strong>
                        ${escapeHtml(akunData.jenis_akun)}
                    </strong>

                </div>

            </div>


            <!-- TABEL -->
            <div class="table-container buku-besar-table-wrap">

                <table class="buku-besar-table">

                    <thead>

                        <tr>

                            <th class="bb-no">
                                No
                            </th>

                            <th class="bb-date">
                                Tanggal
                            </th>

                            <th>
                                Keterangan
                            </th>

                            <th class="bb-ref">
                                Ref
                            </th>

                            <th class="bb-money">
                                Debit
                            </th>

                            <th class="bb-money">
                                Kredit
                            </th>

                            <th class="bb-money">
                                Saldo
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        <tr class="saldo-awal-row">

                            <td></td>

                            <td></td>

                            <td>
                                <strong>
                                    Saldo Awal
                                </strong>
                            </td>

                            <td></td>

                            <td>-</td>

                            <td>-</td>

                            <td class="bb-money">
                                <strong>
                                    ${formatRupiah(saldoAwal)}
                                </strong>
                            </td>

                        </tr>
    `;


    // ==========================================
    // DATA TRANSAKSI
    // ==========================================

    if (!data || data.length === 0) {

        html += `

            <tr>

                <td colspan="7"
                    class="bb-no-data">

                    Tidak ada transaksi pada
                    periode yang dipilih.

                </td>

            </tr>

        `;

    } else {

        data.forEach(function(item, index) {

            const debit =
                Number(item.debit || 0);

            const kredit =
                Number(item.kredit || 0);


            saldo =
                saldo +
                hitungSaldo(
                    debit,
                    kredit
                );


            totalDebit =
                totalDebit +
                debit;


            totalKredit =
                totalKredit +
                kredit;


            html += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${formatTanggal(
                            item.tanggal_jurnal
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.keterangan || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.nomor_bukti || "-"
                        )}
                    </td>

                    <td class="bb-money">

                        ${
                            debit > 0
                                ? formatRupiah(debit)
                                : "-"
                        }

                    </td>

                    <td class="bb-money">

                        ${
                            kredit > 0
                                ? formatRupiah(kredit)
                                : "-"
                        }

                    </td>

                    <td class="bb-money">

                        ${formatRupiah(saldo)}

                    </td>

                </tr>

            `;

        });

    }


    // ==========================================
    // FOOTER
    // ==========================================

    html += `

            </tbody>

            <tfoot>

                <tr>

                    <td 
                        colspan="4" 
                        class="bb-total-label" 
                    > 
                        TOTAL 
                    </td>

                    <td class="bb-money"> 
                        ${formatRupiah(totalDebit)} 
                    </td>

                    <td class="bb-money"> 
                        ${formatRupiah(totalKredit)} 
                    </td>

                    <td class="bb-money"> 
                        ${formatRupiah(saldo)} 
                    </td>

                </tr>

            </tfoot>

        </table>

    </div>


<!-- TOMBOL CETAK -->
<div class="buku-besar-print-action">

    <button
        type="button"
        class="btn-primary"
        onclick="cetakBukuBesar()"
    >
        🖨️ Cetak Buku Besar
    </button>

</div>

    <!-- FOOTER -->
    <div class="buku-besar-footer">

        <div> 
            Dicetak dari Sistem Akuntansi Persediaan 
        </div>

        <div> 
            ${formatTanggal(new Date().toISOString().slice(0, 10))} 
        </div>

    </div>


</div>

`;


    container.innerHTML = html;

}

// =====================================================
// CETAK BUKU BESAR
// =====================================================

function cetakBukuBesar() {

    const sumber =
        document.getElementById("tabelBukuBesar");

    if (!sumber) {

        alert(
            "Buku Besar belum ditampilkan."
        );

        return;
    }


    // =================================================
    // AMBIL ISI BUKU BESAR
    // =================================================

    const laporan =
        sumber.querySelector(".buku-besar-paper");

    if (!laporan) {

        alert(
            "Buku Besar belum ditampilkan."
        );

        return;
    }


    // =================================================
    // SALIN ISI LAPORAN
    // =================================================

    const salinan =
        laporan.cloneNode(true);


    // =================================================
    // HAPUS TOMBOL CETAK DI DALAM LAPORAN
    // =================================================

    const tombolBawah =
        salinan.querySelector(
            ".buku-besar-print-action"
        );

    if (tombolBawah) {
        tombolBawah.remove();
    }


    // =================================================
    // HAPUS FOOTER "DICETAK DARI..."
    // =================================================

    const footerBawah =
        salinan.querySelector(
            ".buku-besar-footer"
        );

    if (footerBawah) {
        footerBawah.remove();
    }


    // =================================================
    // AMBIL DATA HTML
    // =================================================

    const isiLaporan =
        salinan.innerHTML;


    // =================================================
    // BUKA PREVIEW
    // =================================================

    const windowCetak =
        window.open(
            "",
            "_blank",
            "width=1100,height=800"
        );


    if (!windowCetak) {

        alert(
            "Preview tidak dapat dibuka. Silakan izinkan popup pada browser."
        );

        return;
    }


    // =================================================
    // HTML PREVIEW
    // =================================================

    windowCetak.document.write(`

<!DOCTYPE html>

<html lang="id">

<head>

    <meta charset="UTF-8">

    <title>
        Buku Besar - Toko Mainan
    </title>


    <style>

        * {
            box-sizing: border-box;
        }


        body {

            margin: 0;

            background: #eeeeee;

            font-family:
                Arial,
                Helvetica,
                sans-serif;

            color: #222;

            font-size: 11px;

        }


        /* ==========================================
           TOOLBAR PREVIEW
           ========================================== */

        .preview-toolbar {

            position: sticky;

            top: 0;

            z-index: 1000;

            background: white;

            border-bottom:
                1px solid #dddddd;

            padding: 12px 20px;

            display: flex;

            justify-content: flex-end;

            gap: 10px;

            box-shadow:
                0 2px 6px
                rgba(0,0,0,0.08);

        }


        .preview-toolbar button {

            border: none;

            border-radius: 6px;

            padding:
                9px 18px;

            font-size: 13px;

            font-weight: 600;

            cursor: pointer;

        }


        .btn-tutup {

            background: #eeeeee;

            color: #333333;

        }


        .btn-cetak {

            background: #222222;

            color: white;

        }


        /* ==========================================
           KERTAS LAPORAN
           ========================================== */

        .report-page {

            width: 210mm;

            min-height: 297mm;

            margin: 25px auto;

            padding: 18mm;

            background: white;

            box-shadow:
                0 4px 18px
                rgba(0,0,0,0.15);

        }


        /* ==========================================
           HEADER PERUSAHAAN
           ========================================== */

        .report-header {

            text-align: center;

            border-bottom:
                2px solid #222;

            padding-bottom: 14px;

            margin-bottom: 18px;

        }


        .company-name {

            font-size: 21px;

            font-weight: 700;

            letter-spacing: 0.5px;

            margin-bottom: 4px;

        }


        .company-subtitle {

            font-size: 11px;

            color: #555;

            letter-spacing: 0.8px;

            text-transform: uppercase;

        }


        .report-name {

            margin-top: 16px;

            font-size: 17px;

            font-weight: 700;

            letter-spacing: 0.5px;

        }


        .report-subtitle {

            margin-top: 4px;

            font-size: 11px;

            color: #666;

        }


        /* ==========================================
           INFORMASI LAPORAN
           ========================================== */

        .report-info {

            display: grid;

            grid-template-columns:
                1fr 1fr;

            border:
                1px solid #cccccc;

            margin-bottom: 18px;

        }


        .info-item {

            padding: 8px 10px;

            border-bottom:
                1px solid #dddddd;

        }


        .info-item:nth-child(odd) {

            border-right:
                1px solid #cccccc;

        }


        .info-label {

            display: block;

            font-size: 9px;

            color: #777;

            text-transform: uppercase;

            margin-bottom: 3px;

        }


        .info-value {

            font-size: 11px;

            font-weight: 600;

        }


        /* ==========================================
           BERSIHKAN HEADER LAMA
           ========================================== */

        .buku-besar-company {

            display: none !important;

        }


        .buku-besar-title {

            display: none !important;

        }


        .buku-besar-account-info {

            display: none !important;

        }


        /* ==========================================
           TABEL
           ========================================== */

        table {

            width: 100%;

            border-collapse: collapse;

        }


        th {

            background: #eeeeee;

            border:
                1px solid #777;

            padding: 7px 6px;

            text-align: center;

            font-size: 10px;

            font-weight: 700;

        }


        td {

            border:
                1px solid #aaaaaa;

            padding: 7px 6px;

            font-size: 10px;

        }


        .bb-money {

            text-align: right;

            white-space: nowrap;

        }


        .bb-total-label {

            font-weight: 700;

            text-align: right;

        }


        /* ==========================================
           FOOTER CETAK
           ========================================== */

        .print-footer {

            margin-top: 15px;

            display: flex;

            justify-content: space-between;

            font-size: 9px;

            color: #777;

            border-top:
                1px solid #dddddd;

            padding-top: 7px;

        }


        /* ==========================================
           PRINT
           ========================================== */

        @page {

            size: A4 portrait;

            margin: 15mm;

        }


        @media print {

            body {

                background: white;

            }


            .preview-toolbar {

                display: none !important;

            }


            .report-page {

                width: 100%;

                min-height: auto;

                margin: 0;

                padding: 0;

                box-shadow: none;

            }

        }

    </style>

</head>


<body>


    <!-- ==========================================
         TOMBOL PREVIEW
         ========================================== -->

    <div class="preview-toolbar">

        <button
            type="button"
            class="btn-tutup"
            onclick="window.close()"
        >
            ✕ Tutup
        </button>


        <button
            type="button"
            class="btn-cetak"
            onclick="window.print()"
        >
            🖨️ Cetak
        </button>

    </div>


    <!-- ==========================================
         LAPORAN
         ========================================== -->

    <div class="report-page">


        <!-- HEADER BARU -->

        <div class="report-header">

            <div class="company-name">
                TOKO MAINAN
            </div>

            <div class="company-subtitle">
                Sistem Akuntansi Persediaan
            </div>


            <div class="report-name">
                BUKU BESAR
            </div>

            <div class="report-subtitle">
                Laporan Buku Besar Per Akun
            </div>

        </div>


        <!-- INFORMASI LAPORAN -->

        <div class="report-info">


            <div class="info-item">

                <span class="info-label">
                    Periode
                </span>

                <span class="info-value">

                    ${
                        (
                            salinan.querySelector(
                                ".buku-besar-period"
                            )?.textContent
                            || "-"
                        )
                        .replace(
                            "Periode:",
                            ""
                        )
                        .trim()
                    }

                </span>

            </div>


            <div class="info-item">

                <span class="info-label">
                    Kode Akun
                </span>

                <span class="info-value">

                    ${
                        salinan.querySelector(
                            ".account-info-item:nth-child(1) strong"
                        )?.textContent
                        || "-"
                    }

                </span>

            </div>


            <div class="info-item">

                <span class="info-label">
                    Nama Akun
                </span>

                <span class="info-value">

                    ${
                        salinan.querySelector(
                            ".account-info-item:nth-child(2) strong"
                        )?.textContent
                        || "-"
                    }

                </span>

            </div>


            <div class="info-item">

                <span class="info-label">
                    Jenis Akun
                </span>

                <span class="info-value">

                    ${
                        salinan.querySelector(
                            ".account-info-item:nth-child(3) strong"
                        )?.textContent
                        || "-"
                    }

                </span>

            </div>


        </div>


        <!-- TABEL BUKU BESAR -->

        ${
            (() => {

                const tabel =
                    salinan.querySelector(
                        ".buku-besar-table-wrap"
                    );

                return tabel
                    ? tabel.outerHTML
                    : "";

            })()
        }


        <!-- FOOTER -->

        <div class="print-footer">

            <span>
                Toko Mainan
            </span>

            <span>
                Buku Besar
            </span>

        </div>


    </div>


</body>

</html>

    `);


    windowCetak.document.close();

    windowCetak.focus();

}

// =====================================================
// MUAT LAPORAN LABA RUGI
// =====================================================

async function muatLaporanLabaRugi() {

    const container =
        document.getElementById("hasilLaporanLabaRugi");

    if (!container) {
        return;
    }

    if (!cekSupabase()) {
        return;
    }


    const tanggalMulai =
        document.getElementById(
            "tanggalMulaiLabaRugi"
        ).value;

    const tanggalAkhir =
        document.getElementById(
            "tanggalAkhirLabaRugi"
        ).value;


    // ==========================================
    // VALIDASI TANGGAL
    // ==========================================

    if (
        tanggalMulai &&
        tanggalAkhir &&
        tanggalMulai > tanggalAkhir
    ) {

        alert(
            "Tanggal mulai tidak boleh lebih besar dari tanggal akhir."
        );

        return;
    }


    // ==========================================
    // AMBIL DATA JURNAL
    // ==========================================

    let query =
        supabaseClient
            .from("jurnal_umum")
            .select(`
                id_jurnal,
                tanggal_jurnal,
                id_akun,
                debit,
                kredit,
                keterangan,
                akun (
                    kode_akun,
                    nama_akun,
                    jenis_akun
                )
            `)
            .order(
                "tanggal_jurnal",
                {
                    ascending: true
                }
            );


    if (tanggalMulai) {

        query =
            query.gte(
                "tanggal_jurnal",
                tanggalMulai
            );

    }


    if (tanggalAkhir) {

        query =
            query.lte(
                "tanggal_jurnal",
                tanggalAkhir
            );

    }


    const {
        data,
        error
    } = await query;


    if (error) {

        console.error(
            "ERROR LAPORAN LABA RUGI:",
            error
        );

        container.innerHTML = `

            <div class="laporan-empty">

                <h3>
                    Gagal mengambil data
                </h3>

                <p>
                    ${escapeHtml(error.message)}
                </p>

            </div>

        `;

        return;
    }


    // ==========================================
    // VARIABEL AKUN
    // ==========================================

    let penjualan = 0;

    let hpp = 0;

    let bebanPenyesuaian = 0;


    // ==========================================
    // HITUNG DARI JURNAL
    // ==========================================

    if (data && data.length > 0) {

        data.forEach(function(item) {

            const debit =
                Number(item.debit || 0);

            const kredit =
                Number(item.kredit || 0);

            const akun =
                item.akun;


            if (!akun) {
                return;
            }


            // -------------------------------
            // PENDAPATAN
            // -------------------------------

            if (
                akun.kode_akun === "4-1000"
            ) {

                penjualan =
                    penjualan +
                    kredit -
                    debit;

            }


            // -------------------------------
            // HPP
            // -------------------------------

            if (
                akun.kode_akun === "5-1000"
            ) {

                hpp =
                    hpp +
                    debit -
                    kredit;

            }


            // -------------------------------
            // BEBAN PENYESUAIAN PERSEDIAAN
            // -------------------------------

            if (
                akun.kode_akun === "5-1100"
            ) {

                bebanPenyesuaian =
                    bebanPenyesuaian +
                    debit -
                    kredit;

            }

        });

    }


    // ==========================================
    // HITUNG LABA
    // ==========================================

    const labaKotor =
        penjualan - hpp;


    const totalBeban =
        bebanPenyesuaian;


    const labaBersih =
        labaKotor - totalBeban;


    // ==========================================
    // PERIODE LAPORAN
    // ==========================================

    let periodeText = "Semua Periode";


    if (tanggalMulai && tanggalAkhir) {

        periodeText =
            `${formatTanggal(tanggalMulai)} s/d ${formatTanggal(tanggalAkhir)}`;

    } else if (tanggalMulai) {

        periodeText =
            `Mulai ${formatTanggal(tanggalMulai)}`;

    } else if (tanggalAkhir) {

        periodeText =
            `Sampai ${formatTanggal(tanggalAkhir)}`;

    }


    // ==========================================
    // TAMPILKAN LAPORAN
    // ==========================================

    container.innerHTML = `

        <div class="laporan-paper">

            <!-- HEADER -->

            <div class="laporan-company">

                <div>

                    <div class="laporan-company-name">
                        TOKO MAINAN
                    </div>

                    <div class="laporan-company-subtitle">
                        SISTEM AKUNTANSI PERSEDIAAN
                    </div>

                </div>

                <div class="laporan-label">
                    LAPORAN KEUANGAN
                </div>

            </div>


            <!-- JUDUL -->

            <div class="laporan-title">

                <h2>
                    LAPORAN LABA RUGI
                </h2>

                <div>
                    Periode: ${escapeHtml(periodeText)}
                </div>

            </div>


            <!-- PENDAPATAN -->

            <div class="laporan-section">

                <div class="laporan-section-title">
                    PENDAPATAN
                </div>


                <div class="laporan-row">

                    <span>
                        Penjualan
                    </span>

                    <span>
                        ${formatRupiah(penjualan)}
                    </span>

                </div>

            </div>


            <!-- HPP -->

            <div class="laporan-section">

                <div class="laporan-section-title">
                    HARGA POKOK PENJUALAN
                </div>


                <div class="laporan-row">

                    <span>
                        Harga Pokok Penjualan
                    </span>

                    <span>
                        ${formatRupiah(hpp)}
                    </span>

                </div>


                <div class="laporan-total-row">

                    <span>
                        LABA KOTOR
                    </span>

                    <span>
                        ${formatRupiah(labaKotor)}
                    </span>

                </div>

            </div>


            <!-- BEBAN -->

            <div class="laporan-section">

                <div class="laporan-section-title">
                    BEBAN
                </div>


                <div class="laporan-row">

                    <span>
                        Beban Penyesuaian Persediaan
                    </span>

                    <span>
                        ${formatRupiah(bebanPenyesuaian)}
                    </span>

                </div>


                <div class="laporan-total-row">

                    <span>
                        TOTAL BEBAN
                    </span>

                    <span>
                        ${formatRupiah(totalBeban)}
                    </span>

                </div>

            </div>


            <!-- LABA BERSIH -->

            <div class="laporan-net-income">

                <span>
                    LABA / (RUGI) BERSIH
                </span>

                <strong>
                    ${formatRupiah(labaBersih)}
                </strong>

            </div>


            <!-- FOOTER -->

            <div class="laporan-footer">

                <span>
                    Sistem Akuntansi Persediaan
                </span>

                <span>
                    ${formatTanggal(
                        new Date()
                            .toISOString()
                            .slice(0, 10)
                    )}
                </span>

            </div>

        </div>

    `;

}

// =====================================================
// RESET LAPORAN LABA RUGI
// =====================================================

function resetLaporanLabaRugi() {
    const tanggalMulai = document.getElementById("tanggalMulaiLabaRugi");
    const tanggalAkhir = document.getElementById("tanggalAkhirLabaRugi");
    const hasil = document.getElementById("hasilLaporanLabaRugi");

    if (tanggalMulai) {
        tanggalMulai.value = "";
    }

    if (tanggalAkhir) {
        tanggalAkhir.value = "";
    }

    if (hasil) {
        hasil.innerHTML = `
            <div class="laporan-empty">
                <div class="laporan-empty-icon">📊</div>
                <h3>Periode Belum Dipilih</h3>
                <p>
                    Pilih tanggal mulai dan tanggal akhir
                    untuk menampilkan Laporan Laba Rugi.
                </p>
            </div>
        `;
    }
}

// =====================================================
// LAPORAN LABA RUGI
// =====================================================

async function laporanLabaRugi() {

    ubahJudul("Laporan Laba Rugi");

    aktifkanMenu("Laporan Laba Rugi");

    document.getElementById("isi").innerHTML = `

        <div class="content-box laporan-laba-rugi-page">

            <div class="page-header">

                <div>

                    <h2>Laporan Laba Rugi</h2>

                    <p>
                        Menampilkan pendapatan, harga pokok penjualan,
                        beban, dan laba atau rugi perusahaan.
                    </p>

                </div>

            </div>


            <!-- FILTER PERIODE -->

            <div class="laporan-filter">

                <div class="form-group">

                    <label>Tanggal Mulai</label>

                    <input
                        type="date"
                        id="tanggalMulaiLabaRugi"
                    >

                </div>


                <div class="form-group">

                    <label>Tanggal Akhir</label>

                    <input
                        type="date"
                        id="tanggalAkhirLabaRugi"
                    >

                </div>


                <div class="laporan-filter-actions">

                    <button
                        type="button"
                        class="btn-primary"
                        onclick="muatLaporanLabaRugi()"
                    >
                        Tampilkan
                    </button>


                    <button
                        type="button"
                        class="btn-secondary"
                        onclick="resetLaporanLabaRugi()"
                    >
                        Reset
                    </button>

                </div>

            </div>


            <!-- HASIL LAPORAN -->

            <div id="hasilLaporanLabaRugi">

                <div class="laporan-empty">

                    <div class="laporan-empty-icon">
                        📊
                    </div>

                    <h3>
                        Periode Belum Dipilih
                    </h3>

                    <p>
                        Pilih tanggal mulai dan tanggal akhir
                        untuk menampilkan Laporan Laba Rugi.
                    </p>

                </div>

            </div>


            <!-- TOMBOL CETAK DI BAGIAN BAWAH -->

            <div class="laporan-print-bottom">

                <button
                    type="button"
                    class="btn-secondary"
                    onclick="cetakLaporanLabaRugi()"
                >
                    🖨️ Cetak / Preview
                </button>

            </div>

        </div>

    `;

}

// =====================================================
// CETAK LAPORAN LABA RUGI
// =====================================================

function cetakLaporanLabaRugi() {

    const laporan =
        document.querySelector(
            "#hasilLaporanLabaRugi .laporan-paper"
        );

    if (!laporan) {

        alert(
            "Tampilkan Laporan Laba Rugi terlebih dahulu."
        );

        return;
    }


    const jendela =
        window.open(
            "",
            "_blank",
            "width=1100,height=800"
        );


    if (!jendela) {

        alert(
            "Preview tidak dapat dibuka. Silakan izinkan pop-up pada browser."
        );

        return;
    }


    jendela.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                Laporan Laba Rugi - Toko Mainan
            </title>


            <style>

                * {
                    box-sizing: border-box;
                }


                body {

                    margin: 0;

                    padding: 30px;

                    font-family: Arial, sans-serif;

                    background: #eeeeee;

                    color: #222222;

                }


                .paper {

                    width: 210mm;

                    min-height: 297mm;

                    margin: auto;

                    padding: 25mm 20mm;

                    background: #ffffff;

                    box-shadow:
                        0 4px 15px
                        rgba(0, 0, 0, 0.15);

                }


                .laporan-company {

                    display: flex;

                    justify-content: space-between;

                    align-items: flex-start;

                    padding-bottom: 18px;

                    border-bottom: 2px solid #333333;

                }


                .laporan-company-name {

                    font-size: 23px;

                    font-weight: bold;

                }


                .laporan-company-subtitle {

                    margin-top: 5px;

                    font-size: 12px;

                    color: #666666;

                }


                .laporan-label {

                    padding: 7px 12px;

                    background: #f3f3f3;

                    border: 1px solid #dddddd;

                    border-radius: 6px;

                    font-size: 11px;

                    font-weight: bold;

                }


                .laporan-title {

                    text-align: center;

                    padding: 22px 0;

                }


                .laporan-title h2 {

                    margin: 0 0 8px;

                    font-size: 18px;

                }


                .laporan-title div {

                    font-size: 12px;

                    color: #555555;

                }


                .laporan-section {

                    margin-bottom: 18px;

                    border: 1px solid #dddddd;

                    border-radius: 6px;

                    overflow: hidden;

                }


                .laporan-section-title {

                    padding: 9px 12px;

                    background: #f3f3f3;

                    border-bottom: 1px solid #dddddd;

                    font-size: 12px;

                    font-weight: bold;

                }


                .laporan-row {

                    display: flex;

                    justify-content: space-between;

                    padding: 11px 12px;

                    font-size: 12px;

                    border-bottom: 1px solid #eeeeee;

                }


                .laporan-row:last-child {

                    border-bottom: none;

                }


                .laporan-row span:last-child {

                    min-width: 140px;

                    text-align: right;

                    font-weight: 600;

                }


                .laporan-total-row {

                    display: flex;

                    justify-content: space-between;

                    padding: 12px;

                    background: #fafafa;

                    border-top: 2px solid #555555;

                    font-size: 12px;

                    font-weight: bold;

                }


                .laporan-total-row span:last-child {

                    min-width: 140px;

                    text-align: right;

                }


                .laporan-net-income {

                    display: flex;

                    justify-content: space-between;

                    padding: 15px;

                    margin-top: 25px;

                    border: 2px solid #333333;

                    border-radius: 6px;

                    background: #f5f5f5;

                    font-size: 13px;

                    font-weight: bold;

                }


                .laporan-net-income strong {

                    min-width: 160px;

                    text-align: right;

                }


                .laporan-footer {

                    display: flex;

                    justify-content: space-between;

                    margin-top: 35px;

                    padding-top: 12px;

                    border-top: 1px solid #dddddd;

                    font-size: 10px;

                    color: #777777;

                }


                .preview-buttons {

                    display: flex;

                    justify-content: space-between;

                    align-items: center;

                    margin-top: 35px;

                    padding-top: 15px;

                    border-top: 1px solid #dddddd;

                }


                .preview-buttons button {

                    border: none;

                    border-radius: 6px;

                    padding: 10px 18px;

                    font-size: 13px;

                    cursor: pointer;

                }


                .btn-print {

                    background: #333333;

                    color: #ffffff;

                }


                .btn-close {

                    background: #eeeeee;

                    color: #333333;

                }


                @page {

                    size: A4 portrait;

                    margin: 0;

                }


                @media print {

                    body {

                        padding: 0;

                        background: #ffffff;

                    }


                    .preview-buttons {

                        display: none;

                    }


                    .paper {

                        width: 210mm;

                        min-height: 297mm;

                        margin: 0;

                        padding: 20mm;

                        box-shadow: none;

                    }

                }

            </style>

        </head>


        <body>

            <div class="paper">

                ${laporan.innerHTML}


                <div class="preview-buttons">

                    <button
                        class="btn-close"
                        onclick="window.close()"
                    >
                        ✕ Tutup Preview
                    </button>


                    <button
                        class="btn-print"
                        onclick="window.print()"
                    >
                        🖨️ Cetak
                    </button>

                </div>

            </div>

        </body>

        </html>

    `);


    jendela.document.close();
}

// =====================================================
// NERACA
// =====================================================

async function neraca() {

    ubahJudul("Neraca");

    aktifkanMenu("Neraca");

    document.getElementById("isi").innerHTML = `

        <div class="content-box neraca-page">

            <div class="page-header">

                <div>

                    <h2>Neraca</h2>

                    <p>
                        Menampilkan posisi aset, kewajiban,
                        dan ekuitas perusahaan.
                    </p>

                </div>

            </div>


            <!-- FILTER TANGGAL -->

            <div class="laporan-filter">

                <div class="form-group">

                    <label>Tanggal Neraca</label>

                    <input
                        type="date"
                        id="tanggalNeraca"
                    >

                </div>


                <div class="laporan-filter-actions">

                    <button
                        type="button"
                        class="btn-primary"
                        onclick="muatNeraca()"
                    >
                        Tampilkan
                    </button>


                    <button
                        type="button"
                        class="btn-secondary"
                        onclick="resetNeraca()"
                    >
                        Reset
                    </button>

                </div>

            </div>


            <!-- HASIL NERACA -->

            <div id="hasilNeraca">

                <div class="laporan-empty">

                    <div class="laporan-empty-icon">
                        📊
                    </div>

                    <h3>
                        Tanggal Belum Dipilih
                    </h3>

                    <p>
                        Pilih tanggal neraca untuk
                        menampilkan laporan.
                    </p>

                </div>

            </div>


            <!-- TOMBOL CETAK -->

            <div class="laporan-print-bottom">

                <button
                    type="button"
                    class="btn-secondary"
                    onclick="cetakNeraca()"
                >
                    🖨️ Cetak / Preview
                </button>

            </div>

        </div>

    `;

}

// =====================================================
// MUAT NERACA
// =====================================================

async function muatNeraca() {

    const container =
        document.getElementById("hasilNeraca");

    if (!container) {
        return;
    }

    if (!cekSupabase()) {
        return;
    }

    const tanggal =
        document.getElementById("tanggalNeraca").value;

    if (!tanggal) {

        alert("Silakan pilih tanggal neraca.");

        return;
    }


    // =================================================
    // AMBIL JURNAL SAMPAI TANGGAL NERACA
    // =================================================

    const { data, error } =
        await supabaseClient
            .from("jurnal_umum")
            .select(`
                id_jurnal,
                tanggal_jurnal,
                debit,
                kredit,
                id_akun,
                akun (
                    kode_akun,
                    nama_akun,
                    jenis_akun
                )
            `)
            .lte("tanggal_jurnal", tanggal)
            .order("tanggal_jurnal", {
                ascending: true
            });


    if (error) {

        console.error(
            "ERROR NERACA:",
            error
        );

        container.innerHTML = `

            <div class="laporan-empty">

                <h3>
                    Gagal mengambil data
                </h3>

                <p>
                    ${escapeHtml(error.message)}
                </p>

            </div>

        `;

        return;
    }


    // =================================================
    // HITUNG SALDO AKUN
    // =================================================

    const saldoAkun = {};


    if (data && data.length > 0) {

        data.forEach(function(item) {

            const akun = item.akun;

            if (!akun) {
                return;
            }

            const kode =
                akun.kode_akun;

            const debit =
                Number(item.debit || 0);

            const kredit =
                Number(item.kredit || 0);


            if (!saldoAkun[kode]) {

                saldoAkun[kode] = {

                    kode: kode,

                    nama: akun.nama_akun,

                    jenis: akun.jenis_akun,

                    saldo: 0

                };

            }


            // ASET

            if (
                akun.jenis_akun === "ASET"
            ) {

                saldoAkun[kode].saldo +=
                    debit - kredit;

            }


            // KEWAJIBAN

            else if (
                akun.jenis_akun === "KEWAJIBAN"
            ) {

                saldoAkun[kode].saldo +=
                    kredit - debit;

            }


            // EKUITAS

            else if (
                akun.jenis_akun === "EKUITAS"
            ) {

                saldoAkun[kode].saldo +=
                    kredit - debit;

            }

        });

    }


    // =================================================
    // FUNGSI AMBIL SALDO AKUN
    // =================================================

    function ambilSaldo(kode) {

        if (!saldoAkun[kode]) {
            return 0;
        }

        return Number(
            saldoAkun[kode].saldo || 0
        );

    }


    // =================================================
    // ASET
    // =================================================

    const kas =
        ambilSaldo("1-1000");

    const piutang =
        ambilSaldo("1-1200");

    const persediaan =
        ambilSaldo("1-1100");


    // =================================================
    // KEWAJIBAN
    // =================================================

    const utang =
        ambilSaldo("2-1000");


    // =================================================
    // EKUITAS
    // =================================================

    const modal =
        ambilSaldo("3-1000");


    // =================================================
    // HITUNG LABA / RUGI BERJALAN
    // =================================================

    let penjualan = 0;

    let hpp = 0;

    let bebanPenyesuaian = 0;


    if (data && data.length > 0) {

        data.forEach(function(item) {

            const akun = item.akun;

            if (!akun) {
                return;
            }

            const debit =
                Number(item.debit || 0);

            const kredit =
                Number(item.kredit || 0);


            // PENJUALAN

            if (
                akun.kode_akun === "4-1000"
            ) {

                penjualan +=
                    kredit - debit;

            }


            // HPP

            if (
                akun.kode_akun === "5-1000"
            ) {

                hpp +=
                    debit - kredit;

            }


            // BEBAN PENYESUAIAN

            if (
                akun.kode_akun === "5-1100"
            ) {

                bebanPenyesuaian +=
                    debit - kredit;

            }

        });

    }


    const labaRugi =
        penjualan -
        hpp -
        bebanPenyesuaian;


    // =================================================
    // TOTAL ASET
    // =================================================

    const totalAset =
        kas +
        piutang +
        persediaan;


    // =================================================
    // TOTAL KEWAJIBAN
    // =================================================

    const totalKewajiban =
        utang;


    // =================================================
    // TOTAL EKUITAS
    // =================================================

    const totalEkuitas =
        modal +
        labaRugi;


    // =================================================
    // TOTAL KEWAJIBAN + EKUITAS
    // =================================================

    const totalPasiva =
        totalKewajiban +
        totalEkuitas;


    // =================================================
    // TAMPILKAN NERACA
    // =================================================

    container.innerHTML = `

        <div class="laporan-paper">

            <!-- HEADER -->

            <div class="laporan-company">

                <div>

                    <div class="laporan-company-name">
                        TOKO MAINAN
                    </div>

                    <div class="laporan-company-subtitle">
                        SISTEM AKUNTANSI PERSEDIAAN
                    </div>

                </div>

                <div class="laporan-label">
                    LAPORAN KEUANGAN
                </div>

            </div>


            <!-- JUDUL -->

            <div class="laporan-title">

                <h2>
                    NERACA
                </h2>

                <div>
                    Per tanggal ${formatTanggal(tanggal)}
                </div>

            </div>


            <!-- ================================================= -->
            <!-- ASET -->
            <!-- ================================================= -->

            <div class="laporan-section">

                <div class="laporan-section-title">
                    ASET
                </div>


                <div class="laporan-row">

                    <span>
                        Kas
                    </span>

                    <span>
                        ${formatRupiah(kas)}
                    </span>

                </div>


                <div class="laporan-row">

                    <span>
                        Piutang Usaha
                    </span>

                    <span>
                        ${formatRupiah(piutang)}
                    </span>

                </div>


                <div class="laporan-row">

                    <span>
                        Persediaan Barang
                    </span>

                    <span>
                        ${formatRupiah(persediaan)}
                    </span>

                </div>


                <!-- TOTAL ASET -->

                <div class="neraca-total-akhir">

                    <span>
                        TOTAL ASET
                    </span>

                    <strong>
                        ${formatRupiah(totalAset)}
                    </strong>

                </div>

            </div>


            <!-- ================================================= -->
            <!-- KEWAJIBAN -->
            <!-- ================================================= -->

            <div class="laporan-section">

                <div class="laporan-section-title">
                    KEWAJIBAN
                </div>


                <div class="laporan-row">

                    <span>
                        Utang Usaha
                    </span>

                    <span>
                        ${formatRupiah(utang)}
                    </span>

                </div>


                <!-- TOTAL KEWAJIBAN -->

                <div class="laporan-total-row">

                    <span>
                        TOTAL KEWAJIBAN
                    </span>

                    <strong>
                        ${formatRupiah(totalKewajiban)}
                    </strong>

                </div>

            </div>


            <!-- ================================================= -->
            <!-- EKUITAS -->
            <!-- ================================================= -->

            <div class="laporan-section">

                <div class="laporan-section-title">
                    EKUITAS
                </div>


                <div class="laporan-row">

                    <span>
                        Modal
                    </span>

                    <span>
                        ${formatRupiah(modal)}
                    </span>

                </div>


                <div class="laporan-row">

                    <span>
                        Laba / (Rugi) Berjalan
                    </span>

                    <span>
                        ${formatRupiah(labaRugi)}
                    </span>

                </div>


                <!-- TOTAL EKUITAS -->

                <div class="laporan-total-row">

                    <span>
                        TOTAL EKUITAS
                    </span>

                    <strong>
                        ${formatRupiah(totalEkuitas)}
                    </strong>

                </div>

            </div>


            <!-- ================================================= -->
            <!-- TOTAL KEWAJIBAN + EKUITAS -->
            <!-- ================================================= -->

            <div class="neraca-total-akhir">

                <span>
                    TOTAL KEWAJIBAN + EKUITAS
                </span>

                <strong>
                    ${formatRupiah(totalPasiva)}
                </strong>

            </div>


            <!-- ================================================= -->
            <!-- FOOTER -->
            <!-- ================================================= -->

            <div class="laporan-footer">

                <span>
                    Sistem Akuntansi Persediaan
                </span>

                <span>
                    ${formatTanggal(
                        new Date()
                            .toISOString()
                            .slice(0, 10)
                    )}
                </span>

            </div>

        </div>

    `;

}

// =====================================================
// RESET NERACA
// =====================================================

function resetNeraca() {

    const tanggal =
        document.getElementById("tanggalNeraca");

    const hasil =
        document.getElementById("hasilNeraca");


    if (tanggal) {

        tanggal.value = "";

    }


    if (hasil) {

        hasil.innerHTML = `

            <div class="laporan-empty">

                <div class="laporan-empty-icon">
                    📊
                </div>

                <h3>
                    Tanggal Belum Dipilih
                </h3>

                <p>
                    Pilih tanggal neraca untuk
                    menampilkan laporan.
                </p>

            </div>

        `;

    }

}


// =====================================================
// CETAK / PREVIEW NERACA
// =====================================================

function cetakNeraca() {

    const laporan =
        document.querySelector(
            "#hasilNeraca .laporan-paper"
        );


    if (!laporan) {

        alert(
            "Tampilkan Neraca terlebih dahulu."
        );

        return;
    }


    const jendela =
        window.open(
            "",
            "_blank",
            "width=1100,height=800"
        );


    if (!jendela) {

        alert(
            "Preview tidak dapat dibuka. Silakan izinkan pop-up pada browser."
        );

        return;
    }


    jendela.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                Neraca - Toko Mainan
            </title>


            <style>

                * {
                    box-sizing: border-box;
                }


                body {

                    margin: 0;

                    padding: 30px;

                    font-family: Arial, sans-serif;

                    background: #eeeeee;

                    color: #222222;

                }


                .paper {

                    width: 210mm;

                    min-height: 297mm;

                    margin: auto;

                    padding: 25mm 20mm;

                    background: #ffffff;

                    box-shadow:
                        0 4px 15px
                        rgba(0, 0, 0, 0.15);

                }


                .laporan-company {

                    display: flex;

                    justify-content: space-between;

                    align-items: flex-start;

                    padding-bottom: 18px;

                    border-bottom: 2px solid #333333;

                }


                .laporan-company-name {

                    font-size: 23px;

                    font-weight: bold;

                }


                .laporan-company-subtitle {

                    margin-top: 5px;

                    font-size: 12px;

                    color: #666666;

                }


                .laporan-label {

                    padding: 7px 12px;

                    background: #f3f3f3;

                    border: 1px solid #dddddd;

                    border-radius: 6px;

                    font-size: 11px;

                    font-weight: bold;

                }


                .laporan-title {

                    text-align: center;

                    padding: 22px 0;

                }


                .laporan-title h2 {

                    margin: 0 0 8px;

                    font-size: 18px;

                }


                .laporan-title div {

                    font-size: 12px;

                    color: #555555;

                }


                .laporan-section {

                    margin-bottom: 18px;

                    border: 1px solid #dddddd;

                    border-radius: 6px;

                    overflow: hidden;

                }


                .laporan-section-title {

                    padding: 9px 12px;

                    background: #f3f3f3;

                    border-bottom: 1px solid #dddddd;

                    font-size: 12px;

                    font-weight: bold;

                }


                .laporan-row {

                    display: flex;

                    justify-content: space-between;

                    padding: 11px 12px;

                    font-size: 12px;

                    border-bottom: 1px solid #eeeeee;

                }


                .laporan-row:last-child {

                    border-bottom: none;

                }


                .laporan-row span:last-child {

                    min-width: 140px;

                    text-align: right;

                    font-weight: 600;

                }


                .laporan-total-row {

                    display: flex;

                    justify-content: space-between;

                    padding: 12px;

                    background: #fafafa;

                    border-top: 2px solid #555555;

                    font-size: 12px;

                    font-weight: bold;

                }


                .laporan-total-row span:last-child {

                    min-width: 140px;

                    text-align: right;

                }


                .laporan-net-income {

                    display: flex;

                    justify-content: space-between;

                    padding: 15px;

                    margin-top: 25px;

                    border: 2px solid #333333;

                    border-radius: 6px;

                    background: #f5f5f5;

                    font-size: 13px;

                    font-weight: bold;

                }


                .laporan-net-income strong {

                    min-width: 160px;

                    text-align: right;

                }


                .laporan-footer {

                    display: flex;

                    justify-content: space-between;

                    margin-top: 35px;

                    padding-top: 12px;

                    border-top: 1px solid #dddddd;

                    font-size: 10px;

                    color: #777777;

                }


                .preview-buttons {

                    display: flex;

                    justify-content: space-between;

                    align-items: center;

                    margin-top: 35px;

                    padding-top: 15px;

                    border-top: 1px solid #dddddd;

                }


                .preview-buttons button {

                    border: none;

                    border-radius: 6px;

                    padding: 10px 18px;

                    font-size: 13px;

                    cursor: pointer;

                }


                .btn-print {

                    background: #333333;

                    color: #ffffff;

                }


                .btn-close {

                    background: #eeeeee;

                    color: #333333;

                }


                @page {

                    size: A4 portrait;

                    margin: 0;

                }


                @media print {

                    body {

                        padding: 0;

                        background: #ffffff;

                    }


                    .preview-buttons {

                        display: none;

                    }


                    .paper {

                        width: 210mm;

                        min-height: 297mm;

                        margin: 0;

                        padding: 20mm;

                        box-shadow: none;

                    }

                }

            </style>

        </head>


        <body>

            <div class="paper">

                ${laporan.innerHTML}


                <div class="preview-buttons">

                    <button
                        class="btn-close"
                        onclick="window.close()"
                    >
                        ✕ Tutup Preview
                    </button>


                    <button
                        class="btn-print"
                        onclick="window.print()"
                    >
                        🖨️ Cetak
                    </button>

                </div>

            </div>

        </body>

        </html>

    `);


    jendela.document.close();

}