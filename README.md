<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<div align="center">
  <img src="images/logo.png" alt="Logo" width="80" height="80" />
  <h3 align="center">🌳 MyTree Journal</h3>
  <p align="center">
    <strong>Simple, extensible tree record-keeping for researchers and hobbyists.</strong>
    <br />
    <a href="https://github.com/naravid19/mytree-journal"><strong>📚 Explore the docs »</strong></a>
    <br /><br />
    <a href="https://github.com/naravid19/mytree-journal">View Demo</a>
    ·
    <a href="https://github.com/naravid19/mytree-journal/issues/new?labels=bug">Report Bug</a>
    ·
    <a href="https://github.com/naravid19/mytree-journal/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>

---

## 📖 Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Quick Start](#quick-start)
- [Usage](#usage)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About The Project

[![Product Screenshot][product-screenshot]](images/screenshot.png)

**MyTree Journal** is a full-stack tree record-keeping system designed for simplicity and extensibility. Perfect for researchers, hobbyists, or small-to-medium scale cultivation projects.

### Why MyTree Journal?

- 🎯 **Purpose-built** for tree and plant tracking
- 📱 **Mobile-first** responsive design
- 🌙 **Dark mode** support out of the box
- 📸 **Media management** with automatic thumbnails
- 🔗 **QR codes** for easy sharing and tracking

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Features

### Core Functionality

| Feature                  | Description                            |
| ------------------------ | -------------------------------------- |
| 🌱 **Strain Management** | Organize plants by genetic strains     |
| 📦 **Batch Tracking**    | Group plants by cultivation batches    |
| 🌳 **Tree Records**      | Comprehensive individual plant records |
| 📸 **Media Attachments** | Images and documents per tree          |
| 📊 **QR Codes**          | Generate shareable QR codes            |

### User Experience

| Feature           | Description                                 |
| ----------------- | ------------------------------------------- |
| 🎨 **Modern UI**  | Glassmorphism design with smooth animations |
| 📱 **Responsive** | Works on desktop, tablet, and mobile        |
| 🌙 **Dark Mode**  | System-aware theme switching                |
| ⚡ **Fast**       | Optimized queries and rendering             |
| ♿ **Accessible** | ARIA labels and keyboard navigation         |

### Data Management

| Feature              | Description                       |
| -------------------- | --------------------------------- |
| 📂 **Smart Folders** | Auto-organize images by tree name |
| 🖼️ **Thumbnails**    | Automatic thumbnail generation    |
| 📤 **Drag & Drop**   | Upload files with drag-and-drop   |
| ✅ **Validation**    | Client and server-side validation |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Tech Stack

### Backend

[![Django][Django-badge]][Django-url]
[![DRF][DRF-badge]][DRF-url]

### Frontend

[![Next.js][Next.js-badge]][Next.js-url]
[![React][React-badge]][React-url]
[![Tailwind CSS][Tailwind-badge]][Tailwind-url]
[![Flowbite][Flowbite-badge]][Flowbite-url]

### Infrastructure

[![Nginx][Nginx-badge]][Nginx-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Project Structure

```
mytree-journal/
├── 📁 mytree_journal/        # Django project configuration
│   └── settings.py           # Database, CORS, timezone config
│
├── 📁 trees/                 # Django app (models, views, API)
│   ├── models.py             # Strain, Batch, Tree, Image models
│   ├── serializers.py        # DRF serializers
│   ├── views.py              # API ViewSets
│   └── migrations/           # Database migrations
│
├── 📁 mytree-frontend/       # Next.js frontend
│   ├── app/
│   │   ├── page.tsx          # Dashboard
│   │   ├── strains/          # Strain management
│   │   ├── batches/          # Batch management
│   │   └── tree/[id]/        # Public tree page
│   ├── components/           # Reusable UI components
│   └── hooks/                # Custom React hooks
│
├── 📁 media/                 # Uploaded files
│   ├── tree_images/          # Tree photos & thumbnails
│   └── tree_documents/       # Attached documents
│
├── 📁 nginx/                 # Deployment config
├── 📄 requirements.txt       # Python dependencies
├── 📄 package.json           # Node.js dependencies
├── 📄 CHANGELOG.md           # Version history
└── 📄 README.md              # This file
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Getting Started

### Prerequisites

| Requirement | Version           |
| ----------- | ----------------- |
| Node.js     | v22.13.1+         |
| npm         | v10.8.3+          |
| Python      | 3.11+             |
| PostgreSQL  | 14+ (recommended) |
| Nginx       | For production    |

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/naravid19/mytree-journal.git
   cd mytree-journal
   ```

2. **Set up the backend**

   ```bash
   # Create virtual environment (recommended)
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Run migrations
   python manage.py migrate
   ```

3. **Set up the frontend**
   ```bash
   cd mytree-frontend
   npm install
   cd ..
   ```

### Environment Variables

Create `.env` in the project root:

```ini
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,api.example.com
```

Create `mytree-frontend/.env.local`:

```ini
NEXT_PUBLIC_FRONTEND_ORIGIN=https://www.example.com
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_MEDIA_DOMAIN=api.example.com
```

### Quick Start

**Option 1: One-click (Windows)**

```batch
# Double-click start_app.bat
```

**Option 2: Manual**

```bash
# Terminal 1: Backend
python manage.py runserver

# Terminal 2: Frontend
cd mytree-frontend
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Usage

| Route        | Description                           |
| ------------ | ------------------------------------- |
| `/`          | Dashboard - View and manage all trees |
| `/strains`   | Manage plant strains                  |
| `/batches`   | Manage cultivation batches            |
| `/tree/[id]` | Public tree detail page               |
| `/api/`      | REST API documentation                |

### Data Models

- **Strain**: Name, description, genetics information
- **Batch**: Code, description, start date
- **Tree**: Comprehensive plant data with relationships

### Media Support

- **Images**: JPEG, PNG, WebP (auto-thumbnails)
- **Documents**: PDF attachments
- **Storage**: Organized in `media/tree_images/` and `media/tree_documents/`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Deployment

See the [Nginx configuration example](nginx/conf/nginx.conf) for production deployment.

**Key features:**

- Static & media file serving
- API reverse proxy
- Security headers
- HTTPS support (add your SSL config)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Roadmap

- [ ] 🔐 Authentication & user management
- [ ] 🔍 Advanced search & filtering
- [ ] 📱 Progressive Web App (PWA)
- [ ] 👥 Multi-user collaboration
- [ ] 📊 Analytics dashboard

See the [open issues](https://github.com/naravid19/mytree-journal/issues) for a full list of proposed features.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Contributing

Contributions are what make the open-source community amazing! Any contributions are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Contact

Project Link: [https://github.com/naravid19/mytree-journal](https://github.com/naravid19/mytree-journal)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/)
- [Flowbite](https://flowbite.com/)
- [Flowbite React](https://flowbite-react.com/)
- [Best-README-Template](https://github.com/othneildrew/Best-README-Template)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

[contributors-shield]: https://img.shields.io/github/contributors/naravid19/mytree-journal.svg?style=for-the-badge
[contributors-url]: https://github.com/naravid19/mytree-journal/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/naravid19/mytree-journal.svg?style=for-the-badge
[forks-url]: https://github.com/naravid19/mytree-journal/network/members
[stars-shield]: https://img.shields.io/github/stars/naravid19/mytree-journal.svg?style=for-the-badge
[stars-url]: https://github.com/naravid19/mytree-journal/stargazers
[issues-shield]: https://img.shields.io/github/issues/naravid19/mytree-journal.svg?style=for-the-badge
[issues-url]: https://github.com/naravid19/mytree-journal/issues
[license-shield]: https://img.shields.io/github/license/naravid19/mytree-journal.svg?style=for-the-badge
[license-url]: https://github.com/naravid19/mytree-journal/blob/main/LICENSE
[product-screenshot]: images/screenshot.png
[Django-badge]: https://img.shields.io/badge/Django-5.2-092E20?style=for-the-badge&logo=django&logoColor=white
[Django-url]: https://www.djangoproject.com/
[DRF-badge]: https://img.shields.io/badge/DRF-3.16-red?style=for-the-badge
[DRF-url]: https://www.django-rest-framework.org/
[Next.js-badge]: https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js
[Next.js-url]: https://nextjs.org/
[React-badge]: https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black
[React-url]: https://react.dev/
[Tailwind-badge]: https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Flowbite-badge]: https://img.shields.io/badge/Flowbite-3.1-38BDF8?style=for-the-badge
[Flowbite-url]: https://flowbite.com/
[Nginx-badge]: https://img.shields.io/badge/nginx-009639?style=for-the-badge&logo=nginx&logoColor=white
[Nginx-url]: https://nginx.org/
