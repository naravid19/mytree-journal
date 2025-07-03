# MyTree Journal

MyTree Journal is a simple system for recording information about your trees. The project consists of a **Django REST API** backend and a **Next.js** frontend styled with **Tailwind CSS** and **Flowbite React**. It allows you to create and manage strains, batches, and individual tree records with images and documents.

## Table of Contents
1. [About](#about)
2. [Built With](#built-with)
3. [Getting Started](#getting-started)
4. [Usage](#usage)
5. [Roadmap](#roadmap)
6. [Contributing](#contributing)
7. [License](#license)
8. [Contact](#contact)

## About

This repository provides both backend and frontend code. The backend exposes a REST API defined in `trees/urls.py` and powered by viewsets in `trees/views.py`. Key models are defined in `trees/models.py` and serialized in `trees/serializers.py`.

The frontend is a Next.js app located under `mytree-frontend`. Global styles live in `mytree-frontend/app/globals.css` while `mytree-frontend/app/page.tsx` implements the main dashboard with Flowbite React components.

<p align="right">(<a href="#top">back to top</a>)</p>

## Built With

- [Django 5.2.3](https://www.djangoproject.com/)
- [djangorestframework 3.16.0](https://www.django-rest-framework.org/)
- [Next.js 15.3.4](https://nextjs.org/)
- [React 19.1.0](https://react.dev/)
- [Tailwind CSS 4.1.10](https://tailwindcss.com/)
- [Flowbite 3.1.2](https://flowbite.com/)
- [Flowbite React 0.11.8](https://flowbite.com/docs/getting-started/react/)

<p align="right">(<a href="#top">back to top</a>)</p>

## Getting Started

### Prerequisites
- Node.js v22.13.1 and npm 10.8.3
- Python 3.11
- PostgreSQL

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Install Node dependencies:
```bash
cd mytree-frontend
npm install
```

### Environment Variables
Create a `.env` file at the project root:
```ini
PUBLIC_DOMAIN=example.com
```

Create `mytree-frontend/.env.local`:
```ini
NEXT_PUBLIC_FRONTEND_ORIGIN=https://app.example.com
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_MEDIA_DOMAIN=example.com
```

### Running Locally
Start the backend:
```bash
python manage.py migrate
python manage.py runserver
```

Start the frontend:
```bash
cd mytree-frontend
npm run dev
```

<p align="right">(<a href="#top">back to top</a>)</p>

## Usage

Navigate to `http://localhost:3000` to access the dashboard. Use the **Strains** and **Batches** pages to manage your reference data. The main page (implemented in [`page.tsx`](mytree-frontend/app/page.tsx)) lets you add, edit, and delete trees with images and documents.

<p align="right">(<a href="#top">back to top</a>)</p>

## Roadmap
- [ ] Authentication support
- [ ] Filtering and search improvements
- [ ] Mobile layout enhancements

<p align="right">(<a href="#top">back to top</a>)</p>

## Contributing
1. Fork the project
2. Create your feature branch (`git checkout -b feature/FeatureName`)
3. Commit your changes (`git commit -m 'Add FeatureName'`)
4. Push to the branch (`git push origin feature/FeatureName`)
5. Open a pull request

<p align="right">(<a href="#top">back to top</a>)</p>

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

## Contact

Project Link: [https://github.com/naravid19/mytree-journal](https://github.com/naravid19/mytree-journal)

<p align="right">(<a href="#top">back to top</a>)</p>
