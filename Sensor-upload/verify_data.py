import json
import urllib.request
import urllib.error
import getpass

BASE_URL = "http://localhost:3000"


def request(method, path, body=None, token=None):
    data    = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(
        f"{BASE_URL}{path}", data=data, headers=headers, method=method
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {"error": e.code, "msg": e.read().decode()}


def main():
    print("=" * 55)
    print("  AVATAR — Verifikasi Data Sensor")
    print("=" * 55)

    # Login dulu untuk dapat token
    email    = input("\nEmail Admin: ").strip()
    password = getpass.getpass("Password  : ")

    print("\n🔐 Login...")
    res = request("POST", "/api/auth", {"email": email, "password": password})
    if "error" in res:
        print(f"❌ Login gagal: {res}")
        return

    token = res["data"]["accessToken"]
    user  = res["data"]["user"]
    print(f"✅ Login berhasil sebagai {user['name']} ({user['role']})")

    # Cek dashboard
    print("\n📊 Cek data dashboard...")
    dash = request("GET", "/api/dashboard", token=token)
    if "error" in dash:
        print(f"❌ Gagal ambil dashboard: {dash}")
    else:
        d = dash["data"]
        print(f"  Total mesin         : {d['summary']['total_machines']}")
        print(f"  Tiket aktif         : {d['summary']['active_tickets']}")
        print(f"  Mesin kritis (top5) : {len(d.get('critical_machines',[]))}")

        if d.get("critical_machines"):
            print("\n  5 Mesin paling kritis:")
            for m in d["critical_machines"]:
                print(f"    - {m['name']}: RUL {m['rul_days']} hari")

    # Cek tiket yang dibuat otomatis dari prediksi
    print("\n🎫 Cek tiket pemeliharaan...")
    tickets = request("GET", "/api/ticket-maintenance", token=token)
    if "error" in tickets:
        print(f"❌ Gagal ambil tiket: {tickets}")
    else:
        all_tickets = tickets["data"]["tickets"]
        print(f"  Total tiket : {len(all_tickets)}")

        from collections import Counter
        status_count = Counter(t["status"] for t in all_tickets)
        for status, count in status_count.items():
            print(f"    {status}: {count}")

    print("\n" + "=" * 55)
    print("  Verifikasi selesai!")
    print("=" * 55)


if __name__ == "__main__":
    main()