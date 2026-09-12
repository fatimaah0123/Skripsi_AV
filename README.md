# 🛡️ AVATAR
### *Accenture Virtual Assistant for Technical Analysis and Reliability*

Dashboard interaktif untuk sistem **predictive maintenance** pada sektor energi — dikembangkan sebagai proyek capstone sekaligus tugas akhir (skripsi) dengan metodologi **Waterfall**.

<p align="left">
  <img src="https://img.shields.io/badge/React-Vite-blue?logo=react" alt="React + Vite" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?logo=node.js" alt="Node.js + Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/RabbitMQ-Message%20Broker-FF6600?logo=rabbitmq&logoColor=white" alt="RabbitMQ" />
  <img src="https://img.shields.io/badge/Python-FastAPI-3776AB?logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Status-Active%20Development-yellow" alt="Status" />
</p>

---

## 📑 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Instalasi & Menjalankan Proyek](#-instalasi--menjalankan-proyek)
- [Environment Variables](#-environment-variables)
- [Role & Kontribusi Tim](#-role--kontribusi-tim)
- [Catatan Pengembangan](#-catatan-pengembangan)

---

## 📖 Tentang Proyek

**AVATAR** adalah platform *full-stack predictive maintenance* untuk sektor energi, terdiri dari empat komponen utama yang saling terhubung melalui RabbitMQ sebagai message broker:

| Komponen | Teknologi | Fungsi |
|---|---|---|
| 🎨 **Frontend** | React + Vite + Tailwind CSS | Dashboard monitoring, manajemen tiket, dan AI Copilot |
| ⚙️ **Backend** | Node.js (Express) + PostgreSQL | REST API, autentikasi, dan orkestrasi data |
| 🤖 **ML Service** | Python (FastAPI) | Prediksi RUL & klasifikasi kegagalan (5 kategori) |
| 💬 **AI Copilot** | Groq `llama-3.3-70b-versatile` | Asisten percakapan untuk tim teknisi & admin |

---

## 🚀 Instalasi & Menjalankan Proyek

> ⚠️ **Ikuti urutan di bawah ini.** RabbitMQ harus aktif lebih dulu sebelum Backend dan Python Service dijalankan, karena keduanya langsung melakukan koneksi ke RabbitMQ saat *start up*.

### 1️⃣ Clone Repository
```bash
git clone https://github.com/fatimaah0123/Skripsi_AV.git
cd Skripsi_AV
```

### 2️⃣ Setup Frontend
```bash
cd Frontend
npm install
npm run dev
```

### 3️⃣ Setup Backend
```bash
cd Backend
npm install
```
Buat file `.env` di dalam folder `Backend/` (lihat contoh di bagian [Environment Variables](#-environment-variables)), lalu jalankan migrasi database dan seed data awal:
```bash
npm run migrate up
npm run seed
npm run dev
```

### 4️⃣ Setup Python Service (ML)
```bash
cd python-service
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```
Buat file `.env` di dalam folder `python-service/` (lihat contoh di bagian [Environment Variables](#-environment-variables)), pastikan folder `model/` berisi `scaler.pkl` dan `failure_model.pkl`, lalu jalankan:
```bash
python main.py
```

### 5️⃣ Jalankan RabbitMQ
Pastikan RabbitMQ berjalan (disarankan lewat Docker).
 
**Pertama kali setup (container belum pernah dibuat):**
```bash
docker run -d --hostname rabbitmq-avatar --name rabbitmq-avatar -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```
 
**Jika container sudah pernah dibuat sebelumnya** (misalnya setelah restart device, atau muncul error `Conflict. The container name "/rabbitmq-avatar" is already in use`), cukup jalankan ulang container yang sudah ada — tidak perlu `docker run` lagi:
```bash
docker start rabbitmq-avatar
```
 
Verifikasi RabbitMQ sudah aktif:
```bash
docker ps
```
Pastikan `rabbitmq-avatar` muncul dengan status `Up`.

---

## 🔐 Environment Variables

**`Backend/.env`**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/avatar_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# AI Copilot (Groq)
GROQ_API_KEY=your_groq_api_key
```

**`python-service/.env`**
```env
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```
---

## 👥 Role & Kontribusi Tim

| Nama | Student ID | Learning Path | Kontribusi / Task |
|---|---|---|---|
| Nafiza Mahadri Widyatamaka | `M183D5Y1435` | Machine Learning | Membuat dan menganalisis dataset sintetis, melakukan EDA dan feature engineering. |
| Fajar Teguh Permana | `R179D5Y0581` | Back-End | Pengembangan API untuk dashboard dan sistem prediksi, integrasi model machine learning ke backend, pengembangan layanan chatbot menggunakan LangChain, serta dokumentasi API. |
| Kaesar Albert Bancin | `R891D5Y0935` | Back-End | Merancang struktur tabel SQL database, merancang route endpoint API beserta services dan controller. |
| Siti Fatimah Nur Cahya | `R179D5X1857` | Front-End | Merancang arsitektur sistem, mengembangkan dashboard frontend (React), integrasi API backend. |
| Azimatul Chamidah | `M179D5X0324` | Machine Learning | Membuat model time series dan klasifikasi, membuat pipeline integrasi dengan backend. |

---


## 📌 Catatan Pengembangan

- Alur validasi data mengikuti kontrak API yang didefinisikan lewat Swagger dan telah disesuaikan melalui beberapa iterasi versi backend.
- Antarmuka menggunakan label berbahasa Indonesia, sementara enum/kode tetap dalam bahasa Inggris untuk konsistensi dengan backend.
- Proyek ini merupakan bagian dari Capstone Project Asah Led by Accenture dan tugas akhir (skripsi) yang dikembangkan secara bertahap mengikuti metode **Waterfall**.

---

<p align="center"><sub>© 2026 Tim AVATAR Project</sub></p>
