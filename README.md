# FitManage — Nuxt 3 + Vuetify 3 + SCSS

Aplikasi manajemen gym (member, membership/paket, transaksi, jadwal kelas,
laporan) dengan tema dark + violet mengikuti brand FitManage, dan login
Google. Dibangun di atas kumpulan base component reusable.

## Menjalankan

```bash
npm install
cp .env.example .env   # opsional, isi kalau backend sudah siap
npm run dev
```

Buka http://localhost:3000 — akan redirect ke `/login`. Klik
"Continue with Google" (saat ini pakai flow dummy, lihat bagian Auth di
bawah) untuk masuk ke dashboard.

## Struktur

```
components/base/     TabBase, HeaderBase, TableBase, ButtonBase,
                      FormUploadBase, DialogBase, DialogAlertBase, NotifBase
composables/
  useTabs.ts          state tab bar global
  useAuth.ts          session (cookie) + loginWithGoogle()
  useApi.ts           satu pintu pemanggilan API dari halaman (-> /api/*)
  useAlert.ts         trigger dialog alert/confirm dari mana saja
  useNotif.ts         trigger toast dari mana saja
middleware/
  auth.global.ts      redirect ke /login kalau belum login
layouts/default.vue   sidebar (Dashboard, Members, Membership & paket,
                       Transaksi, Jadwal, Laporan) + tab bar + user info
pages/
  login.vue            halaman login (layout: false)
  index.vue             dashboard
  members/index.vue     daftar member + tambah member
  memberships/index.vue paket membership (card grid)
  transactions/index.vue riwayat transaksi
  schedule/index.vue     jadwal kelas
  reports/index.vue      laporan & analitik
server/
  api/**/*.ts          endpoint yang dipanggil frontend lewat useApi()
  utils/proxyOrDummy.ts  "middleware" tunggal: proxy ke backend asli kalau
                          BACKEND_BASE_URL di-set, dummy kalau belum
  utils/dummyData.ts    data bikinan (in-memory) untuk mode dummy
```

## Arsitektur API (dummy → backend asli)

Semua halaman memanggil backend lewat `useApi()`, yang selalu hit route
lokal Nuxt `/api/...`. Route itu (di `server/api/*.ts`) memanggil
`proxyOrDummy()`:

- **Belum ada `BACKEND_BASE_URL`** → balikin data dummy dari
  `server/utils/dummyData.ts`, dengan simulasi delay network.
- **`BACKEND_BASE_URL` di-set** (di `.env`) → request diteruskan apa
  adanya ke backend asli, termasuk header Authorization.

Artinya: kalau backend sudah jadi, **tidak perlu ubah kode di halaman
maupun composable** — cukup set env `BACKEND_BASE_URL=https://api...`.
Kalau bentuk response backend asli beda dari dummy, sesuaikan saja bagian
`dummy()` di masing-masing `server/api/*.ts` supaya bentuknya sama.

Tambah endpoint baru: buat file di `server/api/<resource>/index.get.ts`
(atau `.post.ts`, dst), panggil `proxyOrDummy(event, '/path-di-backend', () => data)`.

## Auth & login Google

- **Login Google (redirect asli):** klik "Continue with Google" akan
  benar-benar melempar browser ke `accounts.google.com` (Authorization
  Code flow, bukan popup/dummy). Setelah user approve, Google redirect
  balik ke `/auth/google-callback?code=...`, halaman itu langsung tukar
  `code` ke sesi login lewat `POST /api/auth/google`.
- **Setup Google OAuth** (supaya redirect beneran jalan):
  1. Buat OAuth Client ID di [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
     (tipe **Web application**).
  2. Authorized redirect URI wajib diisi persis:
     `http://localhost:3000/auth/google-callback` (dev) dan URL production
     kamu nanti.
  3. Isi `.env`: `GOOGLE_CLIENT_ID=...` dan `GOOGLE_CLIENT_SECRET=...`
     (lihat `.env.example`).
  4. Restart `npm run dev`.
  5. Tanpa backend asli, `server/api/auth/google.post.ts` akan langsung
     tukar `code` ke Google sendiri (client_secret aman, cuma dipakai di
     server) dan login pakai akun Google asli kamu bisa langsung dites.
  6. Setelah backend beneran siap, set `BACKEND_BASE_URL` — request akan
     diteruskan ke backend (backend yang urus tukar code & bikin sesi).
- **Kirim event "user login pakai Google"** — setiap kali login Google
  sukses, `composables/useAuth.ts` otomatis panggil
  `POST /api/auth/login-event` dengan `{ provider: 'google', email }`.
  Sekarang cuma di-`console.log` di server (mode dummy); begitu
  `BACKEND_BASE_URL` di-set, otomatis diteruskan ke endpoint
  `/auth/login-event` di backend asli. Gagal kirim event ini tidak
  menggagalkan proses login (non-blocking).
- **Dev login (tanpa Google sama sekali):** tombol "Masuk sebagai Super
  Admin (Dev)" di halaman login langsung memberi sesi role `superadmin`
  lewat `POST /api/auth/dev-login`. Berguna selama development supaya
  tidak perlu nunggu setup Google OAuth kelar. Otomatis **hilang di
  production build** (dikontrol `runtimeConfig.public.allowDevLogin`,
  lihat `nuxt.config.ts` / `.env.example` -> `ALLOW_DEV_LOGIN`).
- Semua halaman terproteksi otomatis lewat `middleware/auth.global.ts` —
  belum login akan diarahkan ke `/login`. `/login` dan
  `/auth/google-callback` sengaja dikecualikan (harus bisa diakses tanpa
  sesi).

## Sistem tema (3 pilihan)

Ada 3 tema siap pakai: **Dark Violet** (default), **Light**, **Blue Sky**.
Diganti lewat dropdown di footer sidebar (di atas kartu user), disimpan di
cookie `fm_theme` supaya persist antar sesi.

Arsitektur tema (`assets/scss/_theme-tokens.scss`):

- Semua warna didefinisikan sebagai **CSS custom property**
  (`--color-primary`, `--color-bg-page`, dst) di 3 blok
  `[data-theme='dark-violet']` / `[data-theme='light']` / `[data-theme='blue-sky']`.
- `assets/scss/_variables.scss` cuma jembatan: `$color-primary: var(--color-primary);`
  dst — jadi semua base component yang sudah pakai `$color-primary` dkk
  **otomatis ikut berubah** tanpa perlu diedit satu-satu.
- `composables/useAppTheme.ts` yang mengganti atribut `data-theme` di
  `<html>` (men-trigger CSS var di atas) SEKALIGUS ganti tema Vuetify
  (`vuetifyTheme.global.name`) supaya `v-btn`, `v-select`, `v-chip`, dst
  ikut konsisten.

**Tambah tema baru:**
1. Copy satu blok `[data-theme='...']` di `_theme-tokens.scss`, ganti
   warnanya.
2. Tambah entry baru di `THEME_LIST` (`composables/useAppTheme.ts`).
3. Tambah tema baru yang senilai di `plugins/vuetify.ts` (`themes: {...}`).

## Cara pakai base component

Sama seperti sebelumnya (TabBase buka tab dari sidebar, TableBase +
pagination, DialogBase, ButtonBase, FormUploadBase, `useAlert()` /
`useNotif()` untuk alert & toast dari mana saja). Lihat contoh lengkap di
`pages/members/index.vue`.

## Kustomisasi warna per tema

Ubah `assets/scss/_theme-tokens.scss` (dipakai semua base component +
Vuetify lewat `plugins/vuetify.ts`, samakan nilainya manual di sana). Warna
brand default (Dark Violet): `#7C6FEA` gradient ke `#5B8DEF`, background
gelap `#0B0B14`. Lihat bagian "Sistem tema" di atas untuk detail arsitektur
dan cara nambah tema baru.

## Role & 3 akun dev login

3 role tersedia, dipilih lewat 3 tombol "Masuk sebagai ..." (Dev) di
halaman login — semua pakai domain dummy `@example.co.id`:

| Role | Email dev | Akses menu |
|---|---|---|
| **Owner** | owner@example.co.id | Semua menu, termasuk Pengaturan Gym |
| **Super User** | superuser@example.co.id | Semua menu operasional + laporan, TANPA Pengaturan Gym |
| **Operator** | operator@example.co.id | Dashboard, Members, POS (Kasir + master data), Jadwal kelas saja |

Peta akses lengkap ada di `composables/usePermissions.ts` (`MENU_ACCESS`) —
tinggal edit array di situ kalau mau ubah menu apa aja yang boleh diakses
role tertentu. Filtering menu terjadi di `layouts/default.vue`
(`visibleMenus`), dan ada proteksi tambahan di `middleware/auth.global.ts`
buat halaman sensitif (`/settings`) supaya nggak bisa diakses langsung
lewat URL sama role yang nggak berhak, bukan cuma disembunyikan dari
sidebar doang.

Login Google (bukan dev login) otomatis dapat role **owner** — asumsinya,
yang register lewat Google adalah pemilik gym yang lagi setup pertama
kali.

## Onboarding wizard (simulasi first-run)

Begitu **owner** login pertama kali (Google ATAU dev login) dan belum
pernah isi data gym, otomatis diarahkan ke `/onboarding` — form isi Nama
gym, Alamat, Kota, No telepon, Jam operasional, Deskripsi, dan Logo
(opsional). Submit -> data gym tersimpan (dummy, lihat
`server/utils/dummyData.ts` -> `gymProfile`) dan owner masuk ke dashboard.

- Status "sudah onboarding atau belum" di-cache di cookie `fm_onboarded`
  (`composables/useGymProfile.ts`) supaya middleware bisa cek cepat tanpa
  hit API tiap pindah halaman.
- Karena belum ada backend beneran buat deteksi "user baru", simulasi ini
  murni berdasarkan flag dummy `gymProfile.isOnboarded` (default `false`).
  Begitu backend asli udah ada, ganti logic ini supaya `isOnboarded`
  beneran dicek dari data user yang baru register, bukan flag global.
- Super User dan Operator TIDAK kena redirect ini (cuma owner yang
  dianggap "yang setup gym").
- Data yang sama bisa diedit ulang kapan pun lewat menu **Pengaturan
  Gym** (`pages/settings/index.vue`, owner-only).

## Sistem POS (kasir + master data)

Menu **POS** (submenu flyout, sama kayak Laporan & Analitik) berisi:

- **Kasir** (`pages/pos/kasir.vue`) — grid produk (suplemen +
  makanan/minuman kulkas jadi satu, bisa difilter per kategori atau
  dicari), klik produk buat nambah ke keranjang, atur qty, lihat total
  otomatis, tombol "Bayar" konfirmasi dulu (`useAlert().confirm`) sebelum
  checkout. Checkout (`POST /api/pos/checkout`) validasi stok SEMUA item
  dulu sebelum ngurangin apa pun (biar nggak ada perubahan stok
  parsial kalau salah satu item ternyata stoknya kurang), lalu catat
  transaksi (`type: 'merchandise'`) yang otomatis nongol juga di halaman
  Transaksi & Pembayaran dan ikut kehitung di Dashboard/Laporan
  Pendapatan (karena semua baca dari array `transactions` yang sama).
- **Master Data Suplemen** (`pages/pos/supplements.vue`) dan **Master
  Data Kulkas** (`pages/pos/fridge.vue`) — CRUD dasar produk (nama, harga,
  stok, satuan), dua halaman ini share logic lewat
  `composables/usePosProducts.ts` (bedanya cuma filter `category`).

## Form "Tambah member" terintegrasi POS

Di halaman Members, tombol "Tambah member" sekarang:

1. Pilih **paket membership** dari dropdown (harga kelihatan langsung di
   label pilihan).
2. Toggle opsional **"Tambah instruktur gym?"** — kalau aktif, pilih
   instruktur + jumlah pertemuan (sesi).
3. Total otomatis terhitung (harga paket + harga instruktur × jumlah
   sesi), ditampilkan real-time sebelum submit.
4. Submit (`POST /api/members`) sekaligus: hitung tanggal expired dari
   durasi paket, tambah `activeMembers` di paket terkait, DAN catat 1-2
   transaksi otomatis (`type: 'membership'` buat paket,
   `type: 'personal-training'` buat instruktur kalau dipilih) — semuanya
   kelihatan langsung di halaman Transaksi & Pembayaran.

Mode **edit** member (klik baris di tabel) SENGAJA tidak mengizinkan ganti
paket/instruktur dari situ — itu transaksi yang udah kejadian, cuma data
kontak (nama/email/telepon) yang bisa diubah, supaya nggak ada risiko
"kebayar dua kali" atau data transaksi yang nggak konsisten.

## Changelog rev 8

- Fix bug kontras di halaman login pas tema di-switch ke Light/Blue Sky:
  panel hero KIRI itu backgroundnya sengaja fixed gelap (buat branding,
  nggak ikut tema dashboard), tapi warna teks/aksen di dalamnya kemarin
  masih pakai `$color-text-primary` dkk yang ikut berubah sesuai tema
  aktif. Begitu tema di-switch ke Light/Blue Sky, warna teks itu jadi
  gelap juga (didesain buat background terang) — ditaruh di atas
  background yang tetap gelap, jadinya nyaris nggak kebaca.
  Sekarang semua warna di panel hero (`pages/login.vue`) di-hardcode fix
  ke token Dark Violet, nggak ikut sistem tema lagi — panel ini "brand-
  locked", selalu tampil sama persis apa pun tema yang lagi aktif di
  dashboard. Panel kanan (kartu "Welcome back!") TETAP ikut tema seperti
  biasa karena emang dirancang adaptif (card putih di tema terang, dst)
  dan nggak ada masalah kontras di situ.

## Changelog rev 7

- Menu yang punya submenu (Laporan & Analitik, POS) sekarang juga
  nampilin tooltip label pas hover di rail mode, sama kayak menu biasa —
  sebelumnya cuma diem aja pas di-hover (nggak ada preview nama menu sama
  sekali, beda dari menu tanpa submenu yang udah bisa). Dipisah jadi 2
  komponen independen di activator yang sama: `v-tooltip` buat
  hover-preview label, `v-menu` (klik doang, sejak rev 6) buat buka
  flyout submenu — keduanya nggak saling ganggu karena beda event
  (hover vs klik).

## Changelog rev 6

- Flyout submenu (Laporan & Analitik, POS) sekarang CUMA kebuka kalau
  di-klik, nggak lagi otomatis kebuka pas cursor sekadar lewat di atas
  icon-nya (`open-on-hover` dimatikan total buat menu ini). Tooltip label
  menu biasa yang nggak punya submenu (tetap butuh hover buat preview,
  cuma buat lihat nama menu) nggak kena perubahan ini — itu tetap ikut
  aturan `useHoverCapable` yang sebelumnya (nyala di device yang beneran
  punya mouse doang).

## Changelog rev 5

- Fix bug: klik parent menu yang punya submenu (**Laporan & Analitik**,
  **POS**) sebelumnya langsung navigasi ke child pertama (mis. klik
  "Laporan & Analitik" langsung buka "Ringkasan"), padahal harusnya
  parent cuma "wadah" — nggak punya halamannya sendiri. Sekarang klik/tap
  parent CUMA buka daftar submenu-nya (flyout), user harus pilih salah
  satu child buat navigasi ke halaman yang sesuai. Berlaku buat sidebar
  mode penuh maupun rail/icon-only, karena keduanya share 1 blok template
  yang sama di `layouts/default.vue`.

## Changelog rev 4

- Fix: halaman onboarding sebelumnya jalan buntu — begitu owner masuk ke
  `/onboarding`, middleware bakal terus lempar balik ke situ (belum
  onboarded = belum boleh ke mana-mana), jadi nggak ada cara buat batal/
  ganti akun kalau salah pilih role pas dev login. Sekarang ada tombol
  "Keluar / ganti akun" di pojok kanan atas halaman onboarding yang
  logout beneran (clear cookie) dan balik ke `/login` — nggak ke-loop lagi
  karena `isLoggedIn` jadi `false` begitu logout.

## Changelog rev 3

- Fix tooltip/flyout sidebar (rail mode) nyangkut kebuka terus di HP/touch
  device — sebelumnya semua tooltip menu icon-only dan dropdown tema pakai
  `open-on-hover` yang dipaksa nyala di semua device. Di touch device
  nggak ada event "hover keluar" beneran, jadi begitu tooltip kebuka
  (tersimulasi dari tap), dia nggak pernah nutup sendiri. Sekarang dicek
  dulu lewat `composables/useHoverCapable.ts` (media query
  `hover: hover` + `pointer: fine`) — hover cuma nyala di device yang
  BENERAN punya mouse presisi. Di touch, tap tetap langsung navigasi
  normal (fallback klik yang udah ada sebelumnya), cuma tanpa
  tooltip/flyout preview yang bisa nyangkut.

## Changelog rev 2

- `ButtonBase` sekarang punya varian `icon-only` (tombol kotak kecil isi
  icon doang) — dipakai buat tombol pagination `‹ ›` di `TableBase` yang
  sebelumnya pakai raw `<button>`.
- `TableBase` sekarang bisa emit `@rowClick` — dengerin event ini bikin
  baris jadi clickable (cursor pointer otomatis). Klik di tombol/link/
  input di dalam row (misal tombol hapus lewat slot custom) sengaja
  diabaikan (dicek lewat `event.target.closest(...)`), jadi aman dipakai
  bareng slot aksi tanpa perlu `@click.stop` manual di parent. Contoh
  pemakaian lengkap (buka dialog edit pas klik baris): lihat
  `pages/members/index.vue` + endpoint baru `PUT /api/members/:id`.

## Changelog rev 1

- Kontras teks di Dashboard dinaikkan (card surface lebih terang dari page,
  border lebih tegas, warna teks primary jadi putih penuh).
- Icon di sidebar dirapikan — semua icon sekarang dalam kotak 24×24 yang
  seragam supaya sejajar, terlepas dari bentuk asli tiap glyph, dan dikasih
  jarak ke label.
- Menu **Laporan & Analitik** sekarang punya 4 submenu (expand/collapse):
  Ringkasan, Pendapatan, Member per paket, Kehadiran kelas — masing-masing
  halaman + endpoint dummy sendiri.
- Logic tutup tab diperbaiki (`components/base/TabBase.vue`): tab terakhir
  yang tersisa tidak pernah bisa ditutup; selama masih ada tab lain, semua
  tab (termasuk Dashboard) boleh ditutup.
- Fix bug icon sidebar hilang saat menu aktif (salah taruh `background` di
  CSS selector gabungan).
- Tambah 3 pilihan tema (Dark Violet / Light / Blue Sky), lihat bagian
  "Sistem tema" di atas.
- Login Google sekarang redirect asli ke `accounts.google.com`
  (Authorization Code flow), plus tombol dev login "Masuk sebagai Super
  Admin" dan pengiriman event login ke backend — lihat bagian "Auth &
  login Google" di atas.

