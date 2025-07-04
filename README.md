<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <img src="images/logo.png" alt="Logo" width="80" height="80" />
  <h3 align="center">MyTree Journal</h3>
  <p align="center">
    Simple, extensible tree record-keeping.<br />
    <a href="https://github.com/naravid19/mytree-journal"><strong>Explore the docs »</strong></a><br />
    <a href="https://github.com/naravid19/mytree-journal">View Demo</a>
    ·
    <a href="https://github.com/naravid19/mytree-journal/issues/new?labels=bug">Report Bug</a>
    ·
    <a href="https://github.com/naravid19/mytree-journal/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#environment-variables">Environment Variables</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#nginx-deployment">Nginx Deployment</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

[![Screenshot][product-screenshot]](images/screenshot.png)

MyTree Journal คือระบบบันทึกข้อมูลต้นไม้แบบ full-stack ที่ออกแบบมาให้ใช้งานง่าย ขยายต่อได้ เหมาะกับงานวิจัย งานอดิเรก หรือการปลูกในระดับเล็กถึงกลาง  
**ประกอบด้วย:**
- **Backend:** Django REST API (ดูโค้ดใน `trees/`)
- **Frontend:** Next.js + React 19 (ดูโค้ดใน `mytree-frontend/app/`)
- **UI:** Tailwind CSS 4 + Flowbite React (รองรับ Dark Mode)
- **Media:** รองรับการแนบรูปภาพและเอกสาร

**ฟีเจอร์หลัก**
- จัดการสายพันธุ์ (Strains), ชุดการปลูก (Batches), ต้นไม้ (Trees)
- แนบไฟล์ภาพ/เอกสารกับแต่ละต้นไม้
- UI ทันสมัย รองรับมือถือ
- ระบบแจ้งเตือน, Modal, Table, Datepicker ฯลฯ (Flowbite React)
- รองรับการขยาย schema และฟีเจอร์ใหม่

### Built With

- [Django 5.2.3][Django-url]
- [DRF 3.16.0][DRF-url]
- [Next.js 15][Next.js-url]
- [React 19][React-url]
- [Tailwind CSS 4.1][Tailwind-url]
- [Flowbite 3.1.2][Flowbite-url]
- [Flowbite React 0.11.8][FlowbiteReact-url]
- [Nginx 1.25+][https://nginx.org/]

---

## Project Structure

```
mytree-journal/
│
├── mytree_journal/         # Django project settings, URLs, WSGI/ASGI
│   └── settings.py         # Database, CORS, Timezone, Static/Media config
│
├── trees/                  # Django app: models, serializers, views, admin
│   ├── models.py           # Strain, Batch, Tree, Image, Document models
│   ├── serializers.py      # DRF serializers with validation
│   ├── views.py            # DRF ViewSets (Strain, Batch, Tree)
│   ├── urls.py             # App-level API routes
│   └── migrations/         # Database migrations
│
├── mytree-frontend/        # Next.js 15 + React 19 frontend
│   ├── app/
│   │   ├── page.tsx        # Dashboard (Tree list, add/edit/view)
│   │   ├── strains/page.tsx# Strain management UI
│   │   ├── batches/page.tsx# Batch management UI
│   │   └── globals.css     # Tailwind + Flowbite styles
│   ├── public/             # Static assets (SVG, favicon)
│   ├── tailwind.config.js  # Tailwind CSS config
│   └── flowbite_all_docs.txt, flowbite_react_all_docs.txt, tailwind_all_docs.txt
│
├── media/                  # Uploaded images & documents
│   ├── tree_images/        # รูปภาพต้นไม้ (และ thumbnails)
│   └── tree_documents/     # เอกสารแนบ
│
├── nginx/                  # Nginx config for deployment
│   └── conf/nginx.conf     # ตัวอย่าง reverse proxy + static/media
│
├── requirements.txt        # Python dependencies
├── package.json            # Node.js dependencies
└── README.md               # This file
```

---

## Getting Started

### Prerequisites

- Node.js `v22.13.1` + npm `10.8.3`
- Python `3.11`
- PostgreSQL
- Nginx (สำหรับ production)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/example/mytree-journal.git
   cd mytree-journal
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node dependencies**
   ```bash
   cd mytree-frontend
   npm install
   cd ..
   ```

### Environment Variables

สร้างไฟล์ `.env` ที่ root:
```ini
PUBLIC_DOMAIN=api.example.com
```

สร้าง `mytree-frontend/.env.local`:
```ini
NEXT_PUBLIC_FRONTEND_ORIGIN=https://www.example.com
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_MEDIA_DOMAIN=api.example.com
```

### Running Locally

**Backend:**
```bash
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd mytree-frontend
npm run dev
```

---

## Usage

- เข้าหน้า dashboard ที่ [http://localhost:3000](http://localhost:3000)
- จัดการข้อมูลสายพันธุ์ (Strains) ที่ `/strains`
- จัดการชุดการปลูก (Batches) ที่ `/batches`
- เพิ่ม/แก้ไข/ลบต้นไม้ พร้อมแนบรูปภาพและเอกสาร
- API docs อัตโนมัติที่ `/api/` (หลังรัน backend)

**โครงสร้างข้อมูลหลัก**
- **Strain:** ชื่อสายพันธุ์, รายละเอียด
- **Batch:** รหัสชุด, รายละเอียด, วันที่เริ่มต้น
- **Tree:** ข้อมูลต้นไม้, ความสัมพันธ์กับ Strain/Batch, รูปภาพ, เอกสาร, หมายเหตุ ฯลฯ

**Media**
- อัปโหลดไฟล์ภาพ (JPEG, PNG, WebP) และเอกสาร (PDF)
- ไฟล์จะถูกเก็บใน `media/tree_images/` และ `media/tree_documents/`
- มีระบบสร้าง thumbnail อัตโนมัติ

**UI/UX**
- ใช้ Flowbite React (Modal, Table, Alert, Datepicker, Toast, Tooltip ฯลฯ)
- Tailwind CSS 4.1 (ดู config ที่ `tailwind.config.js`)
- รองรับ Dark Mode (ปุ่ม toggle มุมขวาบน)
- ฟอร์มมี validation ทั้ง client/server (แจ้งเตือนซ้ำ, ข้อมูลไม่ครบ ฯลฯ)

---

## Nginx Deployment

ตัวอย่างไฟล์ `nginx/conf/nginx.conf` สำหรับ production (ใช้โดเมนตัวอย่าง):

```nginx
server {
    listen 80;
    server_name api.example.com;

    # Static files
    location /static/ {
        alias /path/to/mytree-journal/static/;
        autoindex off;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Media files
    location /media/ {
        alias /path/to/mytree-journal/media/;
        autoindex off;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Proxy API to Django backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 20M;
    }

    # Proxy frontend (Next.js SSR)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    client_max_body_size 20M;
}
```

**หมายเหตุ**
- เปลี่ยน `/path/to/mytree-journal/` เป็น path จริงบน server
- รองรับ static/media, API, และ SSR frontend ใน server เดียว
- สามารถเพิ่ม HTTPS config ได้ตามต้องการ

---

## Roadmap

* [ ] Authentication support
* [ ] Filtering & advanced search
* [ ] Mobile layout enhancements
* [ ] Improved batch/strain management
* [ ] Multi-user collaboration

ดูรายการเต็มที่ [open issues](https://github.com/example/mytree-journal/issues)

---

## Contributing

Contributions make the open-source community amazing! Any contribution is **greatly appreciated**.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/FeatureName`)
3. Commit your changes (`git commit -m 'Add FeatureName'`)
4. Push to the branch (`git push origin feature/FeatureName`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

## Contact

Project Link: [https://github.com/example/mytree-journal](https://github.com/example/mytree-journal)

---

## Acknowledgments

* [Tailwind CSS](https://tailwindcss.com/)
* [Flowbite](https://flowbite.com/)
* [Flowbite React](https://flowbite-react.com/)
* [Best-README-Template](https://github.com/othneildrew/Best-README-Template)

<!-- MARKDOWN LINKS & IMAGES -->

[contributors-shield]: https://img.shields.io/github/contributors/example/mytree-journal.svg?style=for-the-badge
[contributors-url]: https://github.com/example/mytree-journal/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/example/mytree-journal.svg?style=for-the-badge
[forks-url]: https://github.com/example/mytree-journal/network/members
[stars-shield]: https://img.shields.io/github/stars/example/mytree-journal.svg?style=for-the-badge
[stars-url]: https://github.com/example/mytree-journal/stargazers
[issues-shield]: https://img.shields.io/github/issues/example/mytree-journal.svg?style=for-the-badge
[issues-url]: https://github.com/example/mytree-journal/issues
[license-shield]: https://img.shields.io/github/license/example/mytree-journal.svg?style=for-the-badge
[license-url]: https://github.com/example/mytree-journal/blob/main/LICENSE
[Django-badge]: https://img.shields.io/badge/Django-5.2.3-blue?style=for-the-badge&logo=django&logoColor=white
[Django-url]: https://www.djangoproject.com/
[DRF-badge]: https://img.shields.io/badge/DRF-3.16.0-blue?style=for-the-badge
[DRF-url]: https://www.django-rest-framework.org/
[Next.js-badge]: https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js
[Next.js-url]: https://nextjs.org/
[React-badge]: https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white
[React-url]: https://react.dev/
[Tailwind-badge]: https://img.shields.io/badge/Tailwind%20CSS-4.1.10-06B6D4?style=for-the-badge&logo=tailwindcss
[Tailwind-url]: https://tailwindcss.com/
[Flowbite-badge]: https://img.shields.io/badge/Flowbite-3.1.2-38BDF8?style=for-the-badge&logo=flowbite
[Flowbite-url]: https://flowbite.com/
[FlowbiteReact-badge]: https://img.shields.io/badge/Flowbite%20React-0.11.8-0EA5E9?style=for-the-badge&logo=react
[FlowbiteReact-url]: https://flowbite-react.com/
[product-screenshot]: images/screenshot.png

---

ถ้าต้องการรายละเอียดเชิงเทคนิคหรืออธิบายแต่ละไฟล์ย่อยเพิ่มเติม แจ้งได้เลยครับ!