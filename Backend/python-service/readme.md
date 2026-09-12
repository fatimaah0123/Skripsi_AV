# Python Prediction Service

Python Prediction Service merupakan microservice yang bertugas melakukan prediksi kondisi mesin menggunakan model Machine Learning. Service ini menerima data dari Backend melalui RabbitMQ, memproses data menggunakan model yang telah dilatih, kemudian mengirimkan hasil prediksi kembali ke Backend.

---

## Requirements

- Python 3.11+
- RabbitMQ Server
- Virtual Environment (venv)

---

## Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd python-service
```

### 2. Membuat Virtual Environment

```bash
python3 -m venv venv
```

### 3. Mengaktifkan Virtual Environment

```bash
source venv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Buat file `.env` pada root project.

```env
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
```

Contoh struktur project:

```text
python-service/
│
├── .env
├── model/
├── main.py
├── requirements.txt
└── README.md
```

---

## Menjalankan Service

Pastikan RabbitMQ sudah berjalan, kemudian jalankan service:

```bash
python main.py
```

---

## Dependencies

```txt
joblib==1.5.3
numpy==2.4.6
pandas==3.0.3
pika==1.4.1
python-dateutil==2.9.0.post0
python-dotenv
scikit-learn==1.8.0
scipy==1.17.1
six==1.17.0
threadpoolctl==3.6.0
xgboost==3.2.0
```

---

## Cara Kerja

1. Backend mengirimkan data prediksi ke RabbitMQ (`prediction_queue`).
2. Python Service menerima pesan dari queue.
3. Data diproses menggunakan model Machine Learning.
4. Model menghasilkan hasil prediksi.
5. Hasil prediksi dikirim kembali ke RabbitMQ (`prediction_result_queue`).
6. Backend menerima hasil prediksi dan menyimpannya ke database.

```
Backend
    │
    ▼
prediction_queue
    │
    ▼
Python Prediction Service
    │
    ▼
Machine Learning Model
    │
    ▼
prediction_result_queue
    │
    ▼
Backend
```

---

## Queue yang Digunakan

| Queue                     | Fungsi                                 |
| ------------------------- | -------------------------------------- |
| `prediction_queue`        | Menerima request prediksi dari Backend |
| `prediction_result_queue` | Mengirim hasil prediksi ke Backend     |

---

## Catatan

- Pastikan RabbitMQ aktif sebelum menjalankan service.
- Jalankan service di dalam virtual environment (`venv`).
- Konfigurasi RabbitMQ dapat diubah melalui file `.env`.
- Model Machine Learning harus tersedia pada folder `model/`.

---

## Author

**Fajar Teguh Permana**
