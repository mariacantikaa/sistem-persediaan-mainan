// =====================================================
// CONFIG.JS
// SISTEM AKUNTANSI PERSEDIAAN TOKO MAINAN
// =====================================================


// =====================================================
// INFORMASI APLIKASI
// =====================================================

const NAMA_APLIKASI =
    "Sistem Akuntansi Persediaan Toko Mainan";

const NAMA_TOKO =
    "Toko Mainan";


// =====================================================
// KONFIGURASI SUPABASE
// =====================================================

const SUPABASE_URL =
    "https://pnggzdcrnoffboccwtmo.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_c2bma6KlRAItaseIwc02ug_zAl9X1eG";


// =====================================================
// CLIENT SUPABASE
// =====================================================

let supabaseClient = null;


// =====================================================
// INISIALISASI SUPABASE
// =====================================================

function inisialisasiSupabase() {

    // Pastikan URL dan key sudah tersedia
    if (
        !SUPABASE_URL ||
        !SUPABASE_ANON_KEY
    ) {

        console.log(
            "Supabase belum dikonfigurasi."
        );

        console.log(
            "Aplikasi berjalan dalam mode lokal."
        );

        return;
    }


    // Cek apakah library Supabase tersedia
    if (
        typeof supabase === "undefined"
    ) {

        console.error(
            "Library Supabase belum dimuat."
        );

        return;
    }


    // Membuat koneksi Supabase
    supabaseClient =
        supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );


    console.log(
        "Supabase berhasil dikonfigurasi."
    );
}


// =====================================================
// FORMAT RUPIAH
// =====================================================

function formatRupiah(angka) {

    angka = Number(angka) || 0;

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(angka);
}


// =====================================================
// FORMAT TANGGAL
// =====================================================

function formatTanggal(tanggal) {

    if (!tanggal) {
        return "-";
    }

    const date =
        new Date(tanggal);

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );
}


// =====================================================
// TANGGAL HARI INI
// =====================================================

function tanggalHariIni() {

    const sekarang =
        new Date();

    return sekarang.toLocaleDateString(
        "id-ID",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );
}