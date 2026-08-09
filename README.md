# LeanNodeJsDatabaseBackupUtility

ยูทิลิตีระบบคำสั่ง (CLI Tool) สำหรับสำรองข้อมูลและกู้คืนฐานข้อมูลหลากหลายประเภท (Multi-DBMS Database Backup & Restore Utility) พัฒนาด้วย Node.js

---

## 📌 1. ภาพรวมและคำอธิบายโจทย์ (Project Overview)

เป้าหมายของโครงการนี้คือการสร้างเครื่องมือ **Command-Line Interface (CLI Utility)** ที่มีความยืดหยุ่น ประสิทธิภาพสูง และปลอดภัย สำหรับจัดการกระบวนการสำรองข้อมูล (Backup) และกู้คืนข้อมูล (Restore) ของระบบจัดการฐานข้อมูล (DBMS) หลากหลายชนิด รองรับการตั้งเวลาสำรองข้อมูลอัตโนมัติ การบีบอัดไฟล์ การจัดเก็บไฟล์ทั้งแบบ Local และ Cloud Storage รวมไปถึงการบันทึก Log และส่งการแจ้งเตือนผ่าน Slack

---

## 🚀 2. คุณสมบัติหลักและข้อกำหนดของระบบ (Key Features & Requirements)

### 🔑 2.1 การเชื่อมต่อฐานข้อมูล (Database Connectivity)
- **รองรับ Multi-DBMS:** เชื่อมต่อและทำงานร่วมกับฐานข้อมูลหลักหลายประเภท เช่น
  - **Relational Databases:** MySQL, PostgreSQL, SQLite
  - **NoSQL Databases:** MongoDB
- **พารามิเตอร์การเชื่อมต่อ (Connection Parameters):** ยืดหยุ่นในการระบุ Host, Port, Username, Password, Database Name หรือ Connection URI / File Path (สำหรับ SQLite)
- **ตรวจสอบการเชื่อมต่อ (Connection Testing):** มีระบบการทดสอบและตรวจสอบสิทธิ์ (Validate Credentials & Connectivity) ก่อนเริ่มดำเนินการสำรองข้อมูล
- **ระบบจัดการข้อผิดพลาด (Error Handling):** จัดการและแจ้งเตือนเมื่อเกิดความผิดพลาดในการเชื่อมต่อฐานข้อมูลได้อย่างเหมาะสม

### 📦 2.2 การสำรองข้อมูล (Backup Operations)
- **ประเภทการสำรองข้อมูล (Backup Types):**
  - **Full Backup:** สำรองข้อมูลทั้งหมดของฐานข้อมูล
  - **Incremental Backup:** สำรองเฉพาะข้อมูลที่มีการเปลี่ยนแปลงนับจากการสำรองข้อมูลครั้งล่าสุด (ขึ้นอยู่กับความสามารถของ DBMS)
  - **Differential Backup:** สำรองเฉพาะข้อมูลที่มีการเปลี่ยนแปลงนับจากการทำ Full Backup ครั้งล่าสุด
- **การบีบอัดไฟล์ (Compression):** รองรับการบีบอัดไฟล์สำรองข้อมูล (เช่น `.tar.gz`, `.gz`, `.zip`) เพื่อลดพื้นที่จัดเก็บและเพิ่มความเร็วในการโอนย้ายข้อมูล

### ☁️ 2.3 ตัวเลือกการจัดเก็บข้อมูล (Storage Options)
- **Local Storage:** บันทึกไฟล์สำรองข้อมูลไว้ในระบบดิสก์ในเครื่องตามไดเรกทอรีที่ระบุ
- **Cloud Storage:** รองรับการอัปโหลดไฟล์สำรองไปยังบริการคลาวด์ชั้นนำ ได้แก่
  - Amazon Web Services (AWS S3)
  - Google Cloud Storage (GCS)
  - Microsoft Azure Blob Storage

### 📜 2.4 การบันทึกประวัติและการแจ้งเตือน (Logging & Notifications)
- **การบันทึก Log (Activity Logging):** บันทึกรายละเอียดการทำงานอย่างสมบูรณ์ เช่น เวลาเริ่มต้น (Start Time), เวลาสิ้นสุด (End Time), สถานะ (Status: Success/Failed), ระยะเวลาที่ใช้ (Duration) และ Error Trace เมื่อเกิดปัญหา
- **การแจ้งเตือน (Slack Notifications):** ส่งข้อความแจ้งเตือนผลการสำรองข้อมูล (สำเร็จ/ล้มเหลว) พร้อมรายละเอียดสรุปเข้า Slack Channel ผ่าน Webhook

### 🔄 2.5 การกู้คืนข้อมูล (Restore Operations)
- **Full Restore:** การกู้คืนฐานข้อมูลจากไฟล์สำรองข้อมูลทั้งหมด
- **Selective Restore:** การเลือกกู้คืนเฉพาะบางตาราง (Table) หรือเฉพาะ Collection (สำหรับ MongoDB) ตามที่กำหนด

### 🛡️ 2.6 ข้อพิจารณาด้านความปลอดภัย ประสิทธิภาพ และการทำงานร่วมกัน (Constraints & Standards)
- **Performance Optimization:** จัดการกระบวนการสำรองข้อมูลขนาดใหญ่ (Large Databases) ได้อย่างมีประสิทธิภาพโดยคำนึงถึงภาระงาน (Load) บน Database Server
- **Security & Reliability:** มีมาตรการรักษาความปลอดภัยของไฟล์และรหัสผ่าน การจัดการแบบ Stream เพื่อป้องกัน Memory Leak
- **Cross-Platform Compatibility:** สามารถติดตั้งและทำงานได้ราบรื่นทั้งบน Windows, Linux และ macOS (รวมถึง WSL)
- **User-Friendly CLI:** มีระบบคำสั่งช่วยเหลือ (`--help`, `-h`) และข้อความแนะนำผู้ใช้ที่ชัดเจน

---

## 🛠️ 3. โครงสร้างคำสั่ง CLI (CLI Command Concept)

```bash
# ตัวอย่างรูปแบบคำสั่งทั่วไป
db-backup backup --type mysql --host localhost --port 3306 --user root --pass secret --db my_database --out ./backups/ --compress gzip --storage s3

# ตัวอย่างการทดสอบเชื่อมต่อ
db-backup test-connection --type postgres --host localhost --user postgres --pass secret --db production_db

# ตัวอย่างการกู้คืนข้อมูล
db-backup restore --type mongodb --uri "mongodb://localhost:27017" --db my_db --file ./backups/mongo_backup.gz
```

---

## 🐧 4. ขั้นตอนและวิธีการทดสอบบน WSL (WSL Testing Guide)

คำแนะนำต่อไปนี้จะช่วยให้คุณสามารถเตรียมสภาพแวดล้อม และทดสอบเครื่องมือนี้บน **WSL (Windows Subsystem for Linux)** ได้อย่างเป็นขั้นตอน

### 📋 4.1 การเตรียมความพร้อมของระบบบน WSL (Prerequisites Setup)

เปิด Ubuntu บน WSL แล้วอัปเดตและติดตั้งระบบพื้นฐาน:

```bash
# 1. Update Package Manager
sudo apt update && sudo apt upgrade -y

# 2. ติดตั้ง Node.js (เวอร์ชัน LTS 18+ หรือ 20+) และ npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential

# ตรวจสอบเวอร์ชัน
node -v
npm -v

# 3. ติดตั้ง Docker & Docker Compose บน WSL (หรือใช้ Docker Desktop ที่เปิดใช้งาน WSL 2 Integration)
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
# (ปิดแล้วเปิด WSL terminal ใหม่ หรือใช้ newgrp docker เพื่ออัปเดตกลุ่มสิทธิ์)
```

---

### 🐳 4.2 การจัดเตรียม Database สำหรับทดสอบด้วย Docker Compose

สร้างไฟล์ `docker-compose.yml` เพื่อจำลองฐานข้อมูล MySQL, PostgreSQL และ MongoDB บน WSL:

```yaml
version: '3.8'

services:
  # 1. MySQL Database
  mysql-test:
    image: mysql:8.0
    container_name: test-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: testdb
      MYSQL_USER: testuser
      MYSQL_PASSWORD: testpassword
    ports:
      - "3306:3306"

  # 2. PostgreSQL Database
  postgres-test:
    image: postgres:15
    container_name: test-postgres
    environment:
      POSTGRES_DB: testdb
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpassword
    ports:
      - "5432:5432"

  # 3. MongoDB Database
  mongo-test:
    image: mongo:6.0
    container_name: test-mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: adminpassword
      MONGO_INITDB_DATABASE: testdb
    ports:
      - "27017:27017"
```

สั่งให้ Container ทำงานใน Background:
```bash
docker-compose up -d
```

---

### 🧪 4.3 ขั้นตอนการทดสอบฟังก์ชั่นการทำงาน (Testing Workflow)

#### Step 1: ทดสอบการเชื่อมต่อฐานข้อมูล (Database Connection Test)
```bash
# ทดสอบเชื่อมต่อ MySQL
db-backup test-connection --type mysql --host 127.0.0.1 --port 3306 --user testuser --pass testpassword --db testdb

# ทดสอบเชื่อมต่อ PostgreSQL
db-backup test-connection --type postgres --host 127.0.0.1 --port 5432 --user testuser --pass testpassword --db testdb

# ทดสอบเชื่อมต่อ MongoDB
db-backup test-connection --type mongodb --host 127.0.0.1 --port 27017 --user admin --pass adminpassword --db testdb
```

#### Step 2: ทดสอบการสำรองข้อมูลแบบ Local พร้อมการบีบอัด (Local Backup & Compression Test)
```bash
# สำรองข้อมูล MySQL และบีบอัดแบบ Gzip
db-backup backup \
  --type mysql \
  --host 127.0.0.1 \
  --user testuser \
  --pass testpassword \
  --db testdb \
  --out ./backups/mysql \
  --compress gzip

# สำรองข้อมูล SQLite จาก Local File
db-backup backup \
  --type sqlite \
  --db ./sample.sqlite \
  --out ./backups/sqlite \
  --compress gzip
```

#### Step 3: ทดสอบการกู้คืนข้อมูลแบบ Selective & Full Restore (Restore Test)
```bash
# กู้คืนข้อมูล MySQL แบบ Full Restore
db-backup restore \
  --type mysql \
  --host 127.0.0.1 \
  --user testuser \
  --pass testpassword \
  --db testdb \
  --file ./backups/mysql/testdb_backup.sql.gz

# กู้คืนเฉพาะตารางบางส่วน (Selective Restore)
db-backup restore \
  --type postgres \
  --host 127.0.0.1 \
  --user testuser \
  --pass testpassword \
  --db testdb \
  --file ./backups/postgres/testdb_backup.sql \
  --tables users,orders
```

#### Step 4: ทดสอบระบบ Logging และ Slack Notifications
```bash
# ทดสอบการทำงานพร้อมบันทึก Log และส่งคำเตือนไปยัง Slack
db-backup backup \
  --type postgres \
  --host 127.0.0.1 \
  --user testuser \
  --pass testpassword \
  --db testdb \
  --out ./backups/postgres \
  --slack-webhook "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

# ตรวจสอบประวัติการสำรองข้อมูลจาก Log File
cat ./logs/backup-activity.log
```

---

## 📜 5. สรุปขั้นตอนการส่งมอบและประเมินผล (Verification Checklist)

- [x] อธิบายโจทย์และฟีเจอร์หลักของ CLI Backup Utility อย่างสมบูรณ์
- [x] กำหนดโครงสร้างคำสั่งและการสนับสนุน Multi-DBMS (MySQL, PostgreSQL, MongoDB, SQLite)
- [x] อธิบายขั้นตอนการเตรียมความพร้อมสำหรับเครื่อง WSL (Node.js, Docker)
- [x] ให้สคริปต์ Docker Compose สำหรับสร้างสภาพแวดล้อมจำลอง DB บน WSL
- [x] ระบุคำสั่งและขั้นตอนสำหรับการทดสอบ Connection, Backup, Restore, Compression, Storage และ Logging/Slack

https://roadmap.sh/projects/database-backup-utility
