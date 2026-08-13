import json
import time
import urllib.request
import urllib.error

# ─── Konfigurasi ─────────────────────────────────────────────
BASE_URL      = "http://localhost:3000"
ENDPOINT      = "/api/predict"
DATA_FILE     = "sensor_data.json"
DELAY_SECONDS = 0.1   # jeda antar request (detik) — naikkan jika BE kewalahan
# ─────────────────────────────────────────────────────────────


def convert_datetime(dt_str):
    """
    Konversi format datetime dari spasi ke ISO 8601
    '2026-06-14 00:01:48' → '2026-06-14T00:01:48Z'
    """
    return dt_str.replace(" ", "T") + "Z"


def send_record(record, index, total):
    """Kirim satu record ke POST /api/predict"""
    # Konversi format date_time
    payload = {**record, "date_time": convert_datetime(record["date_time"])}

    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(
        f"{BASE_URL}{ENDPOINT}",
        data    = data,
        headers = {"Content-Type": "application/json"},
        method  = "POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.getcode()
            print(f"[{index+1:>4}/{total}] machine_id={record['machine_id']:>2} "
                  f"date={record['date_time']} → HTTP {status} ✓")
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"[{index+1:>4}/{total}] machine_id={record['machine_id']:>2} "
              f"→ ERROR {e.code}: {body[:100]}")
        return False
    except urllib.error.URLError as e:
        print(f"[{index+1:>4}/{total}] → KONEKSI GAGAL: {e.reason}")
        return False


def main():
    print("=" * 60)
    print("  AVATAR — Kirim Data Sensor ke Backend")
    print("=" * 60)
    print(f"  Endpoint : {BASE_URL}{ENDPOINT}")
    print(f"  File     : {DATA_FILE}")
    print(f"  Jeda     : {DELAY_SECONDS}s per request")
    print("=" * 60)

    # Baca file JSON
    try:
        with open(DATA_FILE, "r") as f:
            records = json.load(f)
    except FileNotFoundError:
        print(f"\n❌ File '{DATA_FILE}' tidak ditemukan.")
        print("   Pastikan file sensor_data.json ada di folder yang sama dengan script ini.")
        return
    except json.JSONDecodeError as e:
        print(f"\n❌ File JSON tidak valid: {e}")
        return

    total   = len(records)
    success = 0
    failed  = 0

    print(f"\n📡 Mulai mengirim {total} record...\n")

    for i, record in enumerate(records):
        ok = send_record(record, i, total)
        if ok:
            success += 1
        else:
            failed += 1

        # Jeda antar request agar backend tidak kewalahan
        if i < total - 1:
            time.sleep(DELAY_SECONDS)

    print()
    print("=" * 60)
    print(f"  Selesai!")
    print(f"  ✓ Berhasil : {success}/{total} record")
    print(f"  ✗ Gagal    : {failed}/{total} record")
    print("=" * 60)

    if failed == 0:
        print("\n✅ Semua data sensor berhasil dikirim ke backend.")
        print("   Model ML sekarang akan memproses prediksi RUL untuk setiap mesin.")
    else:
        print(f"\n⚠️  {failed} record gagal dikirim.")
        print("   Periksa apakah backend aktif dan coba jalankan ulang script ini.")


if __name__ == "__main__":
    main()