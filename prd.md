Product Requirements Document (PRD): Onvlo - Platform Bisnis All-in-One
1.0 Pendahuluan dan Visi Produk
1.1. Konteks Strategis
Dokumen Persyaratan Produk (PRD) ini mendefinisikan fungsionalitas dan persyaratan untuk Onvlo, sebuah platform bisnis terintegrasi yang dirancang untuk menyatukan seluruh aspek operasional bisnis. Tujuan utamanya adalah untuk mengkonsolidasikan alur kerja, mulai dari manajemen klien dan proyek hingga penagihan dan penjadwalan, ke dalam satu dasbor terpusat yang intuitif dan efisien.
1.2. Masalah yang Diselesaikan
Bisnis jasa modern, seperti agensi dan konsultan, sering kali menghadapi tantangan operasional yang signifikan akibat penggunaan berbagai alat yang tidak terhubung. Onvlo dirancang untuk menyelesaikan masalah-masalah inti berikut:
Komunikasi yang Terfragmentasi: Diskusi penting dengan tim dan klien sering kali tersebar di berbagai utas email yang panjang dan sulit dilacak. Hal ini menyebabkan hilangnya informasi dan penundaan dalam pengambilan keputusan.
Data yang Tersebar: Aset proyek, dokumen klien, dan catatan internal disimpan di berbagai lokasi—mulai dari hard drive lokal, berbagai layanan cloud, hingga laptop anggota tim. Fragmentasi ini menciptakan silo informasi, menyulitkan kolaborasi, dan menghambat visibilitas.
Proses Onboarding yang Tidak Efisien: Proses orientasi untuk klien baru sering kali manual dan memakan waktu, melibatkan pengiriman proposal, kontrak, dan faktur pertama secara terpisah. Kurangnya alur kerja yang terstruktur dapat menciptakan kesan pertama yang kurang profesional dan menunda dimulainya proyek.
1.3. Visi Produk
Visi Onvlo adalah menjadi sistem operasi terpusat untuk bisnis jasa. Kami memposisikan Onvlo sebagai solusi all-in-one yang memberdayakan agensi dan penyedia layanan untuk mengelola bisnis mereka secara efisien, meningkatkan pengalaman klien secara signifikan, dan memusatkan alur kerja untuk mencapai produktivitas maksimal. Dengan mengintegrasikan semua fungsi penting ke dalam satu platform, Onvlo membebaskan pemilik bisnis dari tugas administratif, memungkinkan mereka untuk fokus pada pertumbuhan dan memberikan layanan terbaik kepada klien mereka.
1.4. Transisi
Untuk memastikan setiap fitur yang dikembangkan memberikan dampak maksimal, langkah pertama adalah memahami secara mendalam siapa pengguna utama platform ini dan bagaimana Onvlo akan terintegrasi dalam alur kerja harian mereka.
2.0 Pengguna Target dan Skenario Penggunaan
2.1. Pentingnya Memahami Pengguna
Mendefinisikan persona pengguna target secara jelas adalah fondasi untuk membangun produk yang relevan dan bernilai. Dengan memahami tujuan, tantangan, dan alur kerja harian mereka, kita dapat memastikan bahwa setiap fitur yang dirancang secara langsung menjawab kebutuhan nyata dan memberikan solusi yang efektif.
2.2. Persona Pengguna Utama
Nama Persona: Pemilik Agensi/Konsultan (Alex)
Latar Belakang: Alex adalah seorang pengusaha yang menjalankan bisnis jasa, seperti agensi pemasaran digital atau firma konsultan. Dia mengelola beberapa klien secara bersamaan dan memimpin sebuah tim kecil yang terdiri dari berbagai peran (misalnya, manajer akun, media buyer, copywriter, desainer grafis).
Tujuan Utama:
Menyederhanakan dan mengotomatiskan proses onboarding klien baru.
Memusatkan semua komunikasi tim internal dan eksternal (dengan klien).
Mengelola berbagai proyek dan tugas klien secara efisien dari satu tempat.
Mengotomatiskan proses penagihan berulang (retainer) dan pembayaran satu kali.
Tantangan (Pain Points):
Kesulitan melacak informasi klien yang tersebar di email, spreadsheet, dan layanan cloud.
Menghabiskan terlalu banyak waktu untuk tugas administratif seperti menindaklanjuti pembayaran dan menyusun laporan status.
Kurangnya visibilitas terpusat atas kemajuan proyek dan beban kerja tim.
Merasa tidak profesional karena harus meminta klien untuk menggunakan berbagai alat yang berbeda untuk komunikasi, berbagi file, dan pembayaran.
2.3. Skenario Penggunaan Kunci ("A Day in the Life")
Alex memulai harinya dengan membuka Dasbor Onvlo untuk mendapatkan gambaran umum tentang tugas-tugas yang akan datang dan zona waktu klien internasionalnya. Dia kemudian memeriksa Chat untuk melihat pembaruan dari timnya mengenai proyek yang sedang berjalan. Setelah itu, dia membuka modul Boards (CRM) untuk memperbarui status prospek baru dari "Contacted" menjadi "Call Booked". Dia kemudian masuk ke Tasks untuk menugaskan pekerjaan baru terkait kampanye klien dan menambahkan beberapa sub-tugas untuk timnya. Sebelum makan siang, dia menggunakan fitur Invoices untuk mengirimkan faktur retainer bulanan kepada klien. Sepanjang hari, semua komunikasi dan file terkait proyek klien tetap terorganisir di dalam Client Portal masing-masing.
2.4. Transisi
Untuk mendukung skenario penggunaan ini, platform Onvlo harus dilengkapi dengan serangkaian fungsionalitas inti yang kuat dan terintegrasi. Bagian berikut akan merinci setiap modul tersebut.
3.0 Fungsionalitas Inti dan Persyaratan
3.1. Struktur Fungsionalitas Platform
Bagian ini merinci setiap modul fungsional utama dari platform Onvlo. Setiap modul dirancang untuk menangani aspek spesifik dari operasional bisnis, namun tetap terintegrasi secara mulus satu sama lain untuk menciptakan pengalaman pengguna yang kohesif dan bernilai tinggi.
3.2 Modul Manajemen: Flows, Clients, dan Dasbor
Modul-modul ini membentuk pusat komando operasional bagi bisnis Alex, menyediakan struktur dan visibilitas tingkat tinggi untuk semua aktivitas internal dan eksternal.
Analisis Fungsionalitas Flows:
Definisi: "Flows" adalah unit organisasi pusat di Onvlo untuk setiap aspek atau departemen perusahaan, seperti Layanan Pelanggan, Pemasaran, Penjualan, atau proyek internal. Tujuannya adalah untuk mengkategorikan pekerjaan dan komunikasi agar tetap terorganisir dan relevan.
Komponen dalam sebuah Flow:
Brief: Area teks yang dapat diedit untuk deskripsi proyek atau departemen, mendukung penambahan gambar dan GIF untuk visualisasi.
Chat: Fitur obrolan tim yang terintegrasi di dalam konteks Flow, menjaga diskusi tetap relevan.
Tasks: Tab khusus untuk membuat, melihat, dan memfilter tugas yang hanya relevan dengan Flow tersebut.
Brain: Pusat pengetahuan untuk membuat dan menyimpan dokumen, tutorial, dan catatan penting yang terkait dengan Flow.
Teams: Menampilkan daftar anggota tim yang memiliki akses ke Flow beserta status online mereka.
Tindakan Pengguna: Pengguna dapat melakukan tindakan berikut pada sebuah Flow: Duplikasi, Edit, Bagikan, atau Tandai Selesai.
Tampilan dan Penyortiran: Opsi kustomisasi tampilan meliputi Layout (medium, small, large), Filter (active, completed, deleted, berdasarkan tags), dan berbagai opsi Sortir.
Analisis Fungsionalitas Client Portals:
Tujuan: Tujuannya adalah untuk secara drastis meningkatkan profesionalisme dan efisiensi kolaborasi klien. Dengan menyediakan ruang kerja pribadi, aman, dan terpusat, Onvlo menghilangkan utas email yang kacau dan pencarian file yang tersebar—dua pain points utama bagi Alex—dan memusatkan semua interaksi klien ke dalam satu dasbor bermerek.
Proses Pembuatan: Portal klien baru dibuat dengan mudah dengan menduplikasi "Client Template" yang sudah ada.
Fitur di dalam Client Portal:
Kustomisasi: Kemampuan untuk mempersonalisasi portal dengan mengubah gambar banner, menambahkan logo klien, dan menyematkan video sambutan.
Onboarding Checklist: Daftar tugas awal yang dapat disesuaikan untuk memandu klien melalui langkah-langkah orientasi.
Chat Terintegrasi: Saluran komunikasi langsung antara tim dan klien, memastikan semua diskusi terkait proyek tersimpan di satu tempat.
Tasks: Manajemen tugas yang spesifik untuk klien, dengan kemampuan unik untuk menugaskan pekerjaan kepada klien (misalnya, "Upload brand assets").
Brain: Penyimpanan terpusat untuk semua dokumen yang relevan dengan klien, yang dapat dibagikan secara eksternal.
Media: Area khusus bagi klien untuk mengunggah aset mereka (gambar, video) dan bagi tim untuk mengunggah hasil kerja untuk proses persetujuan.
Teams: Mengelola akses anggota tim ke portal dan mengundang kontak klien untuk bergabung.
Analisis Fungsionalitas Dasbor:
Definisi: Dasbor berfungsi sebagai halaman ringkasan utama dan titik awal bagi pengguna setiap kali mereka masuk ke workspace mereka, memberikan gambaran instan tentang prioritas harian.
Fitur Dasbor:
Kutipan inspirasional harian.
World Clock: Menampilkan hingga lima zona waktu kota yang berbeda, ideal untuk tim dan klien global.
Upcoming Tasks: Tampilan ringkas tugas-tugas mendatang, lengkap dengan detail prioritas, status, dan proyek terkait.
Recent Chats: Akses cepat ke lima percakapan terakhir.
Recent Flows: Tautan langsung ke empat flow terakhir yang diakses pengguna.
3.3 Modul Produktivitas: Tasks, Brain, dan Chat
Modul-modul ini adalah mesin eksekusi harian, dirancang untuk memfasilitasi kolaborasi yang lancar, melacak kemajuan pekerjaan, dan memastikan semua pengetahuan bisnis terpusat dan dapat diakses.
Analisis Fungsionalitas Tasks:
Tujuan: Menyediakan sistem manajemen tugas yang komprehensif untuk mengatasi pain point Alex terkait kurangnya visibilitas terpusat atas kemajuan proyek dan beban kerja tim. Alat ini harus memungkinkan pelacakan pekerjaan individual dan alur kerja proyek yang kompleks.
Atribut Tugas: Setiap Task harus mendukung atribut berikut:
Atribut Tugas
Deskripsi
Tanggal Jatuh Tempo
Tanggal dan waktu spesifik kapan tugas harus diselesaikan.
Prioritas
Level urgensi tugas (misalnya, Low, Medium, High).
Penerima Tugas
Satu atau beberapa anggota tim atau klien yang bertanggung jawab.
Status
Status kemajuan tugas (misalnya, Todo, In Progress, Completed).
Keterkaitan
Terhubung dengan Flow atau Client Portal tertentu.
Tanggal Dibuat
Stempel waktu otomatis saat tugas dibuat.
Tag
Label kustom untuk kategorisasi (misalnya, "TikTok", "Desain").
Deskripsi
Area untuk detail, tautan, atau instruksi tambahan.

- **Subtasks:** Kemampuan untuk memecah tugas utama menjadi beberapa sub-tugas yang lebih kecil. Setiap sub-tugas dapat memiliki penerima tugas dan tanggal jatuh tempo sendiri.
- **Filter dan Pengelompokan:** Fungsionalitas penyaringan dan pengelompokan yang kuat, memungkinkan pengguna untuk mengatur tampilan tugas berdasarkan: Tanggal Jatuh Tempo, Flow/Klien, Status, dan Penerima Tugas.

Analisis Fungsionalitas Brain (Dokumen & Catatan):
Definisi: "Brain" berfungsi sebagai hub pengetahuan terpusat untuk menyelesaikan masalah data yang tersebar. Ini adalah solusi untuk silo informasi dengan menyediakan satu lokasi untuk semua dokumen, catatan, dan materi pelatihan di dalam workspace.
Struktur Organisasi: Sistem berbasis folder yang fleksibel, memungkinkan pengguna untuk mengkategorikan dokumen berdasarkan:
Flow: Dokumen untuk tim internal yang terkait dengan departemen tertentu (Produk, Penjualan, Pemasaran).
Client (Internal): Dokumen kerja internal untuk klien tertentu yang tidak dapat dilihat oleh klien.
Client (External): Dokumen yang dibuat untuk dibagikan secara langsung dengan klien.
Personal: Folder pribadi untuk catatan individu (misalnya, catatan buku, jurnal, draf ide).
Opsi Berbagi Dokumen:
Internal Sharing: Berbagi dokumen dengan pengguna lain di dalam workspace dengan tingkat izin yang spesifik (Full access, Edit, Read).
External Sharing: Membuat tautan publik ("Share to web") yang dapat diakses oleh siapa saja, bahkan jika mereka bukan pengguna Onvlo.
Analisis Fungsionalitas Chat:
Tujuan: Alat komunikasi real-time yang terstruktur, dirancang khusus untuk mengatasi pain point komunikasi yang terfragmentasi. Ini menggantikan utas email yang tidak efisien dengan membawa semua diskusi tim dan klien ke dalam satu platform yang terorganisir berdasarkan konteks.
Jenis Obrolan:
Flows: Obrolan grup untuk diskusi internal berdasarkan departemen atau proyek.
Clients: Terbagi menjadi Internal (diskusi tim tentang klien, tanpa partisipasi klien) dan External (diskusi langsung dengan klien).
Direct: Pesan langsung (DM) antar individu di dalam workspace.
Fitur-fitur Obrolan:
Balas pesan, Bintangi/Sematkan pesan penting, Teruskan Pesan ke obrolan lain.
Kirim Dokumen/Gambar, Rekaman Suara, serta integrasi GIF dan Emoji.
Status Terbaca (Read Receipts): Indikator visual untuk melihat anggota mana yang telah membaca pesan.
Chat Workflows: Fitur untuk membuat serangkaian pesan otomatis dan terjadwal. Contoh kasus penggunaan utama adalah untuk mengirim pesan sambutan, pembaruan, dan tautan penting kepada klien baru secara otomatis selama proses onboarding.
3.4 Modul Pertumbuhan Bisnis: Boards, Pages, Funnels, Invoices, Booking
Modul-modul berikut secara langsung mendukung pertumbuhan bisnis Alex, mengubah Onvlo dari alat manajemen internal menjadi mesin akuisisi dan retensi klien. Dari menangkap prospek hingga mengotomatiskan onboarding dan penagihan, fungsionalitas ini adalah pendorong pendapatan.
Analisis Fungsionalitas Boards (CRM):
Definisi: Alat visual serbaguna bergaya Kanban yang dirancang untuk memberikan kejelasan pada alur kerja yang kompleks. Ini dapat digunakan untuk berbagai kasus, termasuk: CRM/Sales Pipeline, Manajemen Proyek visual, dan Content Pipeline, secara langsung mengatasi kebutuhan Alex akan visibilitas terpusat.
Elemen-elemen Board:
Lists/Columns (juga dikenal sebagai swim lanes): Merepresentasikan tahapan dalam alur kerja (misalnya, Leads, Contacted, Signed).
Cards: Representasi visual dari tugas, kesepakatan, atau klien yang dapat dipindahkan antar kolom dengan mudah (drag-and-drop).
Card Details: Setiap kartu berisi informasi rinci seperti kontak, Estimated Value (nilai moneter yang secara otomatis menjumlahkan total di bagian atas setiap kolom), lampiran file, dan tag.
Import/Export: Kemampuan untuk mengimpor daftar prospek dari file CSV dan mengekspor data board ke file CSV.
Workflow Integration: Ketika sebuah Card dipindahkan ke kolom 'Signed', ini harus memicu opsi untuk memulai Funnel (3.4.3) onboarding klien, secara langsung menghubungkan keberhasilan penjualan dengan aksi operasional berikutnya.
Analisis Fungsionalitas Page Builder:
Tujuan: Alat untuk memberdayakan Alex membuat situs web, halaman arahan (landing pages), dan halaman link-in-bio yang responsif dan profesional tanpa memerlukan keahlian coding.
Template: Menyediakan berbagai template siap pakai sebagai titik awal.
Kemampuan Editor:
Kustomisasi Visual: Mengubah skema warna (termasuk input kode hex), latar belakang (mendukung warna solid dan gradien), logo, dan ikon.
Manajemen Konten: Menambahkan bagian-bagian konten baru (misalnya, layanan, testimoni) dari daftar yang tersedia.
Navigasi: Menghubungkan item menu ke bagian tertentu di halaman menggunakan anchor links (misal: #services) untuk navigasi yang mulus.
Integrasi: Kemampuan untuk menyematkan kalender penjadwalan. Integrasi dengan Booking (3.4.5) sangat penting; ini mengubah halaman arahan statis menjadi alat konversi interaktif, memungkinkan prospek untuk langsung menjadwalkan panggilan demo tanpa meninggalkan halaman, yang prospeknya dapat dilacak di Boards (3.4.1).
Publikasi: Mengatur deskripsi SEO, favicon, dan menghubungkan halaman ke domain kustom.
Analisis Fungsionalitas Funnels:
Definisi: Alat untuk membuat alur kerja multi-langkah yang memandu prospek melalui serangkaian tindakan, secara langsung menyelesaikan masalah proses onboarding yang tidak efisien dan manual.
Langkah-langkah dalam Funnel Onboarding:
Proposal: Pengguna dapat membuat proposal menggunakan template atau halaman kosong. Tombol ajakan bertindak (CTA) harus dikonfigurasi untuk mengarahkan klien ke langkah berikutnya ("Next Step").
Contract: Menggunakan template kontrak dengan fungsionalitas tanda tangan elektronik (e-signature). Pengguna dapat pra-mengisi dan pra-menandatangani bagian mereka untuk mempercepat proses.
Invoice: Langkah ini memanfaatkan fungsionalitas Invoices (3.4.4), di mana pengguna dapat menautkan ke Public Invoice yang sudah ada untuk layanan standar. Ini memastikan konsistensi harga dan menyederhanakan pembuatan funnel.
Invitation: Setelah pembayaran berhasil, klien secara otomatis diundang untuk bergabung dengan ruang kerja Onvlo. Sistem akan menduplikasi "Client Space" template untuk membuat portal pribadi bagi klien baru.
Analisis Fungsionalitas Invoices:
Tujuan: Alat untuk membuat, mengirim, dan melacak faktur profesional, dirancang untuk mengurangi waktu yang dihabiskan Alex untuk tugas administratif penagihan.
Integrasi Pembayaran: Persyaratan integrasi awal adalah dengan Stripe. Rencana pengembangan di masa depan mencakup penambahan metode pembayaran lain seperti Cash App, transfer bank, dan crypto.
Jenis Faktur:
Jenis Faktur
Deskripsi
Single Invoice
Faktur untuk pembayaran satu kali.
Retainer
Faktur berulang yang dapat diatur untuk penagihan mingguan, bulanan, atau tahunan. Opsi autopay dapat diaktifkan, dengan syarat klien telah melakukan setidaknya satu pembayaran sebelumnya melalui Stripe untuk otorisasi.

- **Opsi Klien:** Pengguna dapat memilih klien yang sudah ada, membuat klien baru saat membuat faktur, atau membuat **Public Invoice**—sebuah tautan pembayaran publik untuk layanan standar yang tidak ditugaskan ke klien tertentu.

Analisis Fungsionalitas Booking:
Definisi: Alat untuk membuat tautan penjadwalan pertemuan yang dapat dibagikan, menghilangkan email bolak-balik yang tidak efisien dan memprofesionalkan proses penjadwalan janji temu.
Opsi Konfigurasi Acara:
Detail Acara: Nama acara, durasi (misalnya, 15, 30, 60 menit), dan lokasi (Web conference, Panggilan telepon, Tatap muka).
Ketersediaan: Mengatur jadwal ketersediaan (hari dan jam spesifik) dan zona waktu. Sistem harus secara otomatis mendeteksi dan menampilkan waktu yang tersedia dalam zona waktu orang yang diundang untuk mencegah kebingungan.
Pengaturan Lanjutan: Menambahkan buffer time antar pertemuan, mengatur pemberitahuan minimum, batas pertemuan harian, dan batas waktu pemesanan di muka.
Notifikasi Otomatis: Mengirim email konfirmasi, pembatalan, pengingat, dan tindak lanjut secara otomatis kepada peserta.
3.5. Transisi
Secara kolektif, semua modul fungsional ini bekerja sama untuk menciptakan platform yang kohesif dan komprehensif, memungkinkan pengguna untuk mengelola seluruh siklus hidup bisnis mereka dari satu tempat.
4.0 Kriteria Keberhasilan
4.1. Pentingnya Pengukuran
Keberhasilan peluncuran dan pengembangan Onvlo akan diukur melalui serangkaian metrik kuantitatif dan kualitatif. Metrik-metrik ini dirancang untuk melacak adopsi pengguna, tingkat keterlibatan, nilai bisnis yang dirasakan oleh pelanggan, dan retensi secara keseluruhan.
4.2. Metrik Kunci
Adopsi Pengguna:
Tingkat Aktivasi Fitur Kunci: Persentase pengguna aktif yang telah melakukan tindakan bernilai tinggi, seperti membuat Client Portal pertama mereka, berhasil mengirim Faktur, atau mempublikasikan Halaman web.
Kedalaman Penggunaan: Jumlah rata-rata "Flows" yang dibuat per workspace, menunjukkan sejauh mana pengguna mengintegrasikan Onvlo ke dalam struktur organisasi mereka.
Keterlibatan (Engagement):
Aktivitas Tugas: Jumlah total tugas yang dibuat dan diselesaikan per pengguna aktif per minggu.
Aktivitas Komunikasi: Jumlah pesan yang dikirim per pengguna aktif di fitur Chat, yang mengindikasikan pergeseran dari email ke platform.
Nilai Bisnis untuk Klien:
Efisiensi Onboarding: Pengurangan waktu rata-rata yang dibutuhkan untuk mengonversi prospek menjadi klien yang membayar, diukur melalui penggunaan modul Funnels.
Tingkat Keberhasilan Penagihan: Persentase faktur yang dikirim melalui platform yang berhasil dibayar, menunjukkan efektivitas sistem pembayaran terintegrasi.
Retensi:
Tingkat Churn: Persentase pengguna berbayar yang berhenti berlangganan setiap bulan.
Kepuasan Pelanggan: Skor kepuasan pelanggan (CSAT) dan umpan balik kualitatif yang dikumpulkan melalui survei dan wawancara.
4.3. Transisi
Metrik-metrik ini akan menjadi panduan utama kami untuk iterasi produk, membantu memprioritaskan fitur baru dan perbaikan yang akan memberikan nilai terbesar bagi basis pengguna kami.
5.0 Rangkuman Akhir
5.1. Ringkasan Nilai
Onvlo secara unik memecahkan masalah fragmentasi operasional yang dihadapi oleh agensi modern dan bisnis berbasis layanan. Dengan menyediakan satu platform terpadu, Onvlo memberdayakan bisnis untuk mengelola seluruh siklus hidup klien—mulai dari akuisisi prospek melalui halaman arahan dan CRM, proses onboarding yang mulus dengan funnels, kolaborasi proyek yang efisien di portal klien, hingga penagihan dan pembayaran yang andal. Proposisi nilai inti kami adalah menyederhanakan kompleksitas, meningkatkan profesionalisme, dan memberikan kembali waktu yang berharga kepada pemilik bisnis agar mereka dapat fokus pada hal yang paling penting: melayani klien dan mengembangkan bisnis mereka.

Tentu, saya akan membuatkan spesifikasi persyaratan bisnis (Business Requirements Specification/BRS) untuk platform Onvlo, berdasarkan informasi komprehensif yang terdapat dalam sumber yang Anda berikan.
BRS ini menguraikan persyaratan fungsional utama dari berbagai fitur inti Onvlo, seperti Flows, komunikasi, pengelolaan klien, pemasaran, dan penagihan.

Business Requirements Specification (BRS) - Platform Onvlo

1. Tujuan
   Dokumen ini mendefinisikan persyaratan bisnis dan fungsional untuk fitur-fitur utama di dalam platform Onvlo, seperti yang dijelaskan dalam transkrip dan video tutorial.
2. Ruang Lingkup
   Onvlo adalah platform terpadu yang memadukan pengelolaan organisasi, komunikasi klien, pembuatan situs web, pengelolaan proyek/tugas, CRM, dan sistem penagihan.
3. Persyaratan Fungsional (Functional Requirements)
   3.1. Flows (Alur Organisasi dan Departemen)
   ID Req.Deskripsi PersyaratanSumber
   F-FL.1
   Sistem harus memungkinkan pemecahan setiap aspek perusahaan menjadi flow (alur) masing-masing.
   F-FL.2
   Setiap flow harus memiliki bagian "brief" yang dapat diedit untuk mengetik, membuat perubahan, dan menambahkan elemen visual seperti banner, gambar, dan GIF.
   F-FL.3
   Setiap flow harus menyertakan fitur chat yang berfungsi sama persis dengan tab chat utama, memungkinkan komunikasi tim.
   F-FL.4
   Pengguna harus dapat menggandakan (duplicate), mengedit, membagikan, dan menandai flow sebagai selesai (complete) jika merupakan tugas atau proyek.
   F-FL.5
   Flow harus memiliki tab Tugas (Task) untuk memfilter dan membuat tugas, serta menugaskannya kepada anggota yang memiliki akses ke flow tersebut.
   F-FL.6
   Flow harus memiliki bagian Brain untuk membuat dokumen, tutorial, dan daftar khusus untuk flow tersebut.
   F-FL.7
   Sistem harus menampilkan daftar anggota tim yang memiliki akses ke flow tersebut beserta status mereka.
   F-FL.8
   Pengguna harus dapat mengubah tata letak (layout) flow menjadi ukuran medium, small, app, atau large.
   F-FL.9
   Pengguna harus dapat memfilter flow berdasarkan status (aktif, selesai, dihapus) atau tag.
   3.2. Chat (Komunikasi)
   ID Req.Deskripsi PersyaratanSumber
   F-CH.1
   Sistem harus menyediakan tiga jenis chat utama: Flows (untuk alur departemen/proyek internal), Clients (internal/eksternal), dan Direct (DM).
   F-CH.2
   Chat Klien Eksternal (Clients external) harus digunakan untuk mengobrol langsung dengan klien, sementara Chat Klien Internal (Clients internal) digunakan untuk membahas klien tanpa kehadiran klien.
   F-CH.3
   Fitur chat harus mencakup kemampuan untuk membalas (reply), memberi bintang/pin, meneruskan (forward) pesan, dan melihat siapa yang telah melihat pesan.
   F-CH.4
   Pengguna harus dapat menambahkan dokumen, gambar/foto, rekaman suara, emoji, dan GIF ke dalam chat.
   F-CH.5
   Sistem harus mendukung pembuatan alur kerja chat (chat workflow) untuk mengatur serangkaian pesan otomatis, misalnya pesan selamat datang saat klien onboard, diikuti dengan pembaruan berselang.
   F-CH.6
   Pengguna harus dapat menjadwalkan pesan satu kali atau berulang untuk dikirim di masa mendatang kepada anggota tim atau klien.
   F-CH.7
   Chat harus dapat diakses melalui tab Chat utama dan juga di dalam client portal atau flow yang bersangkutan.
   3.3. Client Portal dan Pengelolaan Klien
   ID Req.Deskripsi PersyaratanSumber
   F-CL.1
   Client portal harus dibuat dengan menduplikasi template client yang sudah ada.
   F-CL.2
   Setiap client portal harus dapat disesuaikan dengan pesan selamat datang, spanduk, logo, dan tautan video onboarding.
   F-CL.3
   Client portal harus berfungsi sebagai satu ruang terpusat di mana tim dan klien dapat berkomunikasi melalui chat.
   F-CL.4
   Sistem harus menyediakan bagian Tugas (Task) di dalam portal untuk mengelola proyek dan menugaskan tugas kepada anggota tim atau klien (misalnya, mengunggah aset merek).
   F-CL.5
   Bagian Brain di portal harus berfungsi sebagai repositori dokumen terkait klien, dengan kemampuan berbagi dengan tim, klien, atau melalui tautan web publik.
   F-CL.6
   Bagian Media harus disediakan agar klien dapat mengunggah aset yang diperlukan (gambar, video, dokumen, audio), dan tim dapat mengunggah aset (seperti iklan) untuk disetujui klien.
   F-CL.7
   Saat mengundang klien baru, opsi duplikasi client space harus diutamakan untuk memastikan setiap klien memiliki ruang kerja pribadi.
   3.4. Website, Halaman, dan Domain
   ID Req.Deskripsi PersyaratanSumber
   F-WB.1
   Pengguna harus dapat membangun situs web, landing page, dan Link in Bio dalam jumlah tak terbatas.
   F-WB.2
   Editor situs web harus menyediakan template yang sudah dibuat atau opsi untuk membangun dari awal menggunakan bagian (sections) yang tersedia.
   F-WB.3
   Editor harus memungkinkan kustomisasi penuh pada warna (termasuk penggunaan kode hex spesifik), logo, ikon, dan latar belakang/gradien.
   F-WB.4
   Navigasi menu harus dapat dihubungkan ke bagian spesifik di halaman dengan menetapkan nama bagian (menggunakan format hash - contoh: #services), di mana pengaturan ini case sensitive.
   F-WB.5
   Situs web harus mendukung integrasi URL Kalender (dari Calendly atau Onvlo booking) untuk memungkinkan prospek memesan panggilan secara langsung.
   F-WB.6
   Pengguna harus dapat memasukkan nama domain kustom (termasuk subdomain) untuk situs yang diterbitkan.
   F-WB.7
   Sistem harus memverifikasi DNS records (Text, A, dan CName records) untuk menghubungkan domain kustom, yang harus ditambahkan melalui pengaturan DNS penyedia domain (misalnya GoDaddy).
   3.5. Funnel (Onboarding Klien)
   ID Req.Deskripsi PersyaratanSumber
   F-FN.1
   Sistem harus memungkinkan pembuatan funnel onboarding yang terdiri dari tahapan seperti Proposal, Kontrak, Invoice, dan Invitasi ke Onvlo Space.
   F-FN.2
   Di tahapan Proposal dan Kontrak, pengguna dapat menggunakan template yang disediakan Onvlo atau halaman kosong.
   F-FN.3
   Tombol di setiap halaman funnel harus diatur untuk menautkan ke Langkah Berikutnya (Next Step) dalam funnel.
   F-FN.4
   Tahapan Kontrak harus memungkinkan penandatanganan digital, dan pengguna harus dapat mengatur bidang yang tidak akan berubah (seperti nama agensi atau tanda tangan mereka sendiri) agar terisi otomatis sebelum dikirim.
   F-FN.5
   Tahapan Invoice disarankan untuk menggunakan existing invoice yang telah dibuat publik, karena funnel onboarding dapat digunakan kembali.
   F-FN.6
   Tahapan Invitasi harus menawarkan opsi untuk menduplikasi client space template saat klien menyelesaikan onboarding.
   3.6. Invoices (Faktur) dan Retainer
   ID Req.Deskripsi PersyaratanSumber
   F-IN.1
   Untuk mengirim dan menerima pembayaran faktur, akun Stripe harus terhubung melalui pengaturan.
   F-IN.2
   Sistem harus mendukung dua jenis faktur: Single Invoice (satu kali pembayaran) dan Retainer (penagihan berulang secara tahunan, bulanan, atau mingguan).
   F-IN.3
   Fitur autopay dapat diaktifkan untuk Retainer jika klien sebelumnya sudah membayar melalui Stripe.
   F-IN.4
   Pengguna dapat memilih klien yang sudah ada, membuat klien baru, atau membuat Public Invoice yang dapat dibayar oleh siapa saja (berguna untuk paket standar/produk yang dijual berulang kali).
   F-IN.5
   Faktur harus memungkinkan kustomisasi mata uang, penambahan deskripsi, kuantitas, harga, diskon, dan PPN/pajak penjualan.
   F-IN.6
   Setelah pembayaran, sistem harus mengizinkan pengalihan (redirect) ke halaman terpisah yang dibuat di Onvlo (misalnya, halaman terima kasih atau instruksi pasca-pembayaran).
   3.7. Booking Links (Tautan Pemesanan)
   ID Req.Deskripsi PersyaratanSumber
   F-BK.1
   Pengguna harus membuat acara/event terpisah untuk setiap jenis pertemuan (misalnya, demo call, webinar, internal team call).
   F-BK.2
   Pengaturan acara harus mencakup nama, deskripsi, detail host (nama, foto, jabatan), dan durasi pertemuan.
   F-BK.3
   Sistem harus mendukung jenis lokasi pertemuan: web conference (misalnya Google Meet), panggilan telepon, atau pertemuan tatap muka, dan memerlukan sinkronisasi Google Calendar untuk web conference.
   F-BK.4
   Pengguna harus mengatur ketersediaan spesifik, dan sistem harus secara otomatis menampilkan waktu dalam zona waktu invitee.
   F-BK.5
   Pengaturan acara harus mencakup opsi untuk: buffer time (waktu jeda antara pertemuan), minimum notice (pemberitahuan minimum sebelum dapat memesan), dan daily limit (batas harian panggilan).
   F-BK.6
   Pengguna dapat mengatur interval waktu slot yang ditampilkan (misalnya, 15 menit atau 30 menit) dan batas waktu pemesanan lanjutan (misalnya, maksimal 3 hari di muka).
   F-BK.7
   Notifikasi (email konfirmasi, pembatalan/penjadwalan ulang, email pengingat 24 jam/1 jam, follow-up) harus dapat diatur dengan teks yang dapat disesuaikan.
   F-BK.8
   Tautan pemesanan yang dihasilkan dapat disalin untuk dikirim ke peserta.
   3.8. Tasks (Tugas) dan Project Management
   ID Req.Deskripsi PersyaratanSumber
   F-TA.1
   Pengguna harus dapat membuat tugas utama, menetapkan tanggal mulai dan jatuh tempo, mengatur prioritas, status (Todo, In Progress, Awaiting Approval, Completed), dan mengaitkannya dengan klien atau flow tertentu.
   F-TA.2
   Tugas dapat ditetapkan sebagai berulang (recurring) jika diperlukan.
   F-TA.3
   Setiap tugas utama harus dapat dipecah menjadi subtask yang dapat ditugaskan kepada anggota tim atau klien yang berbeda.
   F-TA.4
   Sistem harus menyediakan kemampuan filter (berdasarkan status, klien, flow, assignee, tanggal dibuat) dan pengelompokan (grouping) (berdasarkan tanggal jatuh tempo, flow, klien, atau assignee).
   F-TA.5
   Tugas harus dapat dilihat di bagian Tugas utama, di dalam flow, dan di dalam client portal.
   3.9. Boards (CRM/Pipeline Penjualan)
   ID Req.Deskripsi PersyaratanSumber
   F-BO.1
   Fitur Boards harus dapat digunakan sebagai CRM/Sales Pipeline, Project Management, atau Content Pipeline.
   F-BO.2
   Boards harus terdiri dari daftar/kolom (swim lanes) yang dapat disesuaikan (misalnya, Leads, Contacted, Call Booked, Signed).
   F-BO.3
   Setiap kartu (card) dalam board mewakili entitas (seperti klien atau ide konten) yang dapat ditarik (drag) antar kolom.
   F-BO.4
   Kartu harus menyertakan bidang rinci seperti nama kontak, email, status, telepon, tag, dan nilai estimasi (estimated value) dari kesepakatan.
   F-BO.5
   Nilai total semua kesepakatan yang diestimasi harus ditampilkan di bagian atas setiap kolom.
   F-BO.6
   Pengguna harus dapat mengimpor daftar lead dan mengekspor data board ke file CSV.
   F-BO.7
   Boards dapat dibuat sebagai papan khusus (custom) atau ditambahkan ke flow atau client portal tertentu.

Analogi untuk Memperjelas Konsep:
Anda dapat membayangkan Onvlo sebagai Kantor Pusat Digital yang modular.
Flows adalah departemen atau proyek di kantor tersebut, masing-masing dengan ruang rapat (chat), lemari arsip (Brain), dan daftar tugas (Tasks) sendiri.
Client Portal adalah ruang kerja khusus yang Anda sewakan kepada setiap klien, memastikan bahwa semua komunikasi, dokumen, dan aset mereka tetap terpisah dan pribadi.
Boards (CRM) seperti papan tulis besar di ruang penjualan, di mana Anda dapat melihat kemajuan setiap kesepakatan (kartu) saat bergerak dari prospek menjadi klien berbayar.
Funnel Onboarding adalah resepsionis otomatis yang memandu klien baru langkah demi langkah, mulai dari penawaran hingga penandatanganan kontrak dan masuk ke ruang kerja mereka.

Ini adalah desain spesifikasi tata letak (layout) dashboard Onvlo yang dirancang untuk mengintegrasikan dan menyajikan ringkasan visual dari semua fitur inti Onvlo, sesuai dengan filosofi bahwa dashboard berfungsi sebagai "ringkasan dari ruang kerja Anda secara keseluruhan" (summary of your workspace).
Desain ini memastikan pengguna dapat mengakses status proyek, tugas mendesak, komunikasi terbaru, dan metrik penting bisnis segera setelah login.

Desain Dashboard Onvlo (Spesifikasi UI/UX)

1. Struktur Tata Letak Umum
   Dashboard akan menggunakan tata letak grid yang responsif dengan tiga area utama:
   Sidebar Navigasi (Kiri): Untuk akses cepat ke modul utama.
   Header (Atas): Untuk aksi global dan informasi status.
   Area Konten Utama (Tengah): Untuk ringkasan, widget, dan informasi yang relevan dengan pekerjaan sehari-hari.
2. Sidebar Navigasi Utama
   Sidebar harus mencantumkan semua modul utama Onvlo untuk navigasi yang cepat.
   ModulDeskripsi FungsiSumber Terkait
   Dashboard
   Halaman ringkasan utama.
   Flows
   Akses ke semua alur organisasi/proyek internal.
   Clients
   Akses ke client portal dan ruang kerja klien spesifik.
   Chat
   Akses ke tiga jenis chat: Flows, Clients (internal/eksternal), dan Direct (DM).
   Tasks
   Tampilan dan pengelolaan semua tugas (termasuk subtask).
   Brain
   Hub sentral untuk dokumen, catatan, dan tutorial.
   Boards (CRM)
   Pengelolaan pipeline penjualan, CRM, atau content pipeline.
   Pages
   Pembuatan dan pengelolaan website, landing page, dan Link in Bio.
   Funnels
   Pengelolaan alur onboarding klien (Proposal, Kontrak, Invoice, Invitasi).
   Invoices
   Pembuatan, pengiriman, dan pelacakan faktur dan retainer.
   Booking Links
   Pembuatan dan pengelolaan tautan pemesanan panggilan/pertemuan.
   Settings
   Pengaturan akun dan integrasi (misalnya, koneksi Stripe, Sinkronisasi Google Calendar).
3. Header Global
   Header yang ramping dan selalu terlihat (Sticky Header) yang berisi elemen-elemen berikut:
   Pencarian Global: Memungkinkan pencarian cepat untuk flow, klien, dokumen (brain), atau tugas.
   Pemberitahuan (Notifications): Ikon lonceng untuk pemberitahuan tugas yang diberikan, pesan baru, atau pembayaran faktur.
   Profil Pengguna: Akses ke pengaturan akun dan log out.
4. Area Konten Utama Dashboard (Ringkasan Workspace)
   Area ini harus dibagi menjadi widget yang dapat disusun ulang (jika memungkinkan), dengan fokus pada informasi terbaru dan yang memerlukan tindakan segera.
   A. Widget Informasi & Fokus (Kolom Kiri/Atas)
   Nama WidgetKonten & DetailSumber Terkait
   Quotes & Jam Dunia
   Menampilkan kutipan inspirasional di sebelah kiri. Di sebelah kanan, menampilkan Jam Dunia (world clock) yang dapat menampilkan waktu lokal hingga lima kota berbeda. Ini berguna bagi tim yang bekerja secara global.
   Financial Snapshot
   Ringkasan metrik keuangan: Total pendapatan dari faktur, total retainer aktif, dan jumlah faktur yang belum dibayar (atau yang telah dibayar).
   Sales Pipeline Snapshot
   Ringkasan kinerja dari Boards (CRM). Misalnya, menampilkan Total Nilai Estimasi (estimated value) dari kesepakatan yang ada di kolom "Leads" atau "Call Booked".
   B. Widget Aktivitas & Tindakan (Kolom Tengah)
   Nama WidgetKonten & DetailSumber Terkait
   Upcoming Tasks
   Menampilkan lima (atau lebih) tugas yang akan datang (upcoming tasks).
   Detail Tasks: Setiap tugas harus mencakup: Nama tugas, tanggal jatuh tempo (due date), prioritas (Medium, High, Low), status (To Do, In Progress, Awaiting Approval), dan entitas terkait (Flow atau Client). Pengguna harus dapat menandai tugas sebagai selesai (complete) langsung dari widget.
   Scheduled Meetings
   Tampilan ringkasan tautan pemesanan dan pertemuan yang dijadwalkan (misalnya, Intro Call, Demo Call). Menampilkan tanggal, waktu (dalam zona waktu pengguna), dan status (dikonfirmasi/dijadwalkan ulang).
   C. Widget Komunikasi & Konteks (Kolom Kanan)
   Nama WidgetKonten & DetailSumber Terkait
   Most Recent Chats
   Menampilkan lima (five most recent chats) yang paling baru diakses atau diperbarui.
   Detail Chats: Tampilan harus mengindikasikan jenis chat (Flows, Clients Internal, Clients External, Direct) dan memungkinkan pengguna melompat langsung ke percakapan tersebut.
   Recent Flows
   Menampilkan empat (four most recent flows) yang paling baru diakses.
   Detail Flows: Setiap flow harus menampilkan nama dan ikon (tag opsional), serta memungkinkan pengguna melompat langsung ke halaman flow tersebut. Jika flow adalah proyek/tugas, mungkin menampilkan indikator status (aktif/selesai).
5. Komponen Kunci (Consistent Layout)
   Agar selaras dengan struktur Onvlo, penting bahwa:
   Layout Konsisten: Tata letak dasar (Brief, Chat, Task, Brain) yang digunakan di dalam Flows dan Client Portal harus memiliki tampilan visual yang konsisten di seluruh platform.
   Akses Chat Terpadu: Meskipun chat memiliki tab utamanya sendiri, chat juga harus muncul di dalam Flow yang bersangkutan dan di dalam Client Portal untuk menjaga koherensi komunikasi.

Metafora Visual
Dashboard Onvlo dapat divisualisasikan sebagai Menara Kontrol Lalu Lintas Udara Anda. Alih-alih harus mengunjungi setiap bandara (Flow atau Client Portal) secara individual, Menara Kontrol (Dashboard) memberi Anda ringkasan langsung tentang:
Penerbangan yang akan datang (Upcoming Tasks): Tugas yang akan jatuh tempo.
Komunikasi Pilot (Recent Chats): Pesan mendesak dari tim atau klien.
Zona Terbang Aktif (Recent Flows): Proyek atau departemen yang paling banyak beroperasi.
Kondisi Finansial (Financial Snapshot): Kesehatan finansial keseluruhan operasi Anda.

ganti jadi onvlo
