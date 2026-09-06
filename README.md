
---

## 🚀 Instalasi & Menjalankan Proyek

### 1. Clone Repository
```bash
git clone https://github.com/fatimaah0123/Skripsi_AV.git
cd Skripsi_AV
```

### 2. Setup Frontend
```bash
cd Frontend
npm install
npm run dev
```

### 3. Setup Backend
```bash
cd Backend
npm install
```
Buat file `.env` di dalam folder `Backend/` (lihat contoh di bagian [Environment Variables](#-environment-variables)), lalu jalankan migrasi database:
```bash
npm run migrate
npm run dev
```

### 4. Setup Python Service (ML)
```bash
cd python-service
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

### 5. Jalankan RabbitMQ
Pastikan RabbitMQ berjalan (disarankan lewat Docker):
```bash
docker run -d --hostname rabbitmq-avatar --name rabbitmq-avatar -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

---

## 🔐 Environment Variables

Contoh variabel yang dibutuhkan di `Backend/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/avatar_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# AI Copilot (Groq)
GROQ_API_KEY=your_groq_api_key
```

> ⚠️ Jangan pernah meng-commit file `.env` ke repository. Pastikan sudah masuk `.gitignore`.

---

## 👥 Role & Kontribusi Tim

| 👩‍💻 Nama | 🆔 Student ID | 🎓 Learning Path | Kontribusi / Task |
|---|---|---|---|
| Nafiza Mahadri Widyatamaka | M183D5Y1435 | Machine Learning | Membuat dan menganalisis dataset sintetis, melakukan EDA dan feature engineering. |
| Fajar Teguh Permana | R179D5Y0581 | Back-End | Melakukan pengembangan API untuk dashboard dan sistem prediksi, integrasi model machine learning ke dalam sistem backend, pengembangan layanan chatbot menggunakan LangChain, serta penyusunan dokumentasi API. |
| Kaesar Albert Bancin | R891D5Y0935 | Back-End | Merancang struktur tabel SQL database, merancang route endpoint API beserta services dan controller. |
| Siti Fatimah Nur Cahya | R179D5X1857 | Front-end | Merancang arsitektur sistem, mengembangkan dashboard frontend (React), integrasi API backend. |
| Azimatul Chamidah | M179D5X0324 | Machine Learning | Membuat model time series dan klasifikasi, membuat pipeline untuk integrasi dengan backend. |

---

## 🕵️‍♂️ Informasi Repository

- **Repository:** [github.com/fatimaah0123/Skripsi_AV](https://github.com/fatimaah0123/Skripsi_AV)
- **Branch utama:** `main`
- **Status:** Dalam pengembangan aktif — bagian dari proyek capstone & tugas akhir (skripsi)
- **Metodologi:** Waterfall

---

## 📌 Catatan Pengembangan

- Alur validasi data mengikuti kontrak API yang didefinisikan lewat Swagger dan telah disesuaikan melalui beberapa iterasi versi backend.
- Antarmuka menggunakan label berbahasa Indonesia, sementara enum/kode tetap dalam bahasa Inggris untuk konsistensi dengan backend.
- Proyek ini merupakan bagian dari tugas akhir (skripsi) dan dikembangkan secara bertahap mengikuti metode **Waterfall**.

---
