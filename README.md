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
    <li><a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#environment-variables">Environment Variables</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

[![Screenshot][product-screenshot]](images/screenshot.png)

MyTree Journal is a simple, full-stack system for recording and managing tree data. Built for research, hobby, or small-scale cultivation, the system consists of a **Django REST API** backend and a **Next.js** frontend, styled with **Tailwind CSS** and **Flowbite React**.

- **Manage strains, batches, and tree records**
- **Attach images & documents**
- **Modern UI, responsive, and easily extensible**

The backend API is organized in [`trees/`](./trees/) and the main dashboard UI is in [`mytree-frontend/app/page.tsx`](./mytree-frontend/app/page.tsx).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![Django][Django-badge]][Django-url]
- [![DRF][DRF-badge]][DRF-url]
- [![Next.js][Next.js-badge]][Next.js-url]
- [![React][React-badge]][React-url]
- [![Tailwind CSS][Tailwind-badge]][Tailwind-url]
- [![Flowbite][Flowbite-badge]][Flowbite-url]
- [![Flowbite React][FlowbiteReact-badge]][FlowbiteReact-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

These instructions will get your copy of the project up and running locally for development and testing purposes.

### Prerequisites

- Node.js `v22.13.1` + npm `10.8.3`
- Python `3.11`
- PostgreSQL

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/naravid19/mytree-journal.git
   cd mytree-journal

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

Start the **backend**:

```bash
python manage.py migrate
python manage.py runserver
```

Start the **frontend**:

```bash
cd mytree-frontend
npm run dev
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

* Access the dashboard at [http://localhost:3000](http://localhost:3000)
* Manage your reference data via **Strains** and **Batches** pages
* Add, edit, or delete trees with images and attached documents
* Built-in API docs via Django REST Framework at `/api/` (after server start)

> The backend API is defined in [`trees/urls.py`](./trees/urls.py) and powered by viewsets in [`trees/views.py`](./trees/views.py).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

* [ ] Authentication support
* [ ] Filtering & advanced search
* [ ] Mobile layout enhancements
* [ ] Improved batch/strain management
* [ ] Multi-user collaboration

See [open issues](https://github.com/naravid19/mytree-journal/issues) for full list.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Contributions make the open-source community amazing! Any contribution is **greatly appreciated**.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/FeatureName`)
3. Commit your changes (`git commit -m 'Add FeatureName'`)
4. Push to the branch (`git push origin feature/FeatureName`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Project Link: [https://github.com/naravid19/mytree-journal](https://github.com/naravid19/mytree-journal)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Acknowledgments

* [Tailwind CSS](https://tailwindcss.com/)
* [Flowbite](https://flowbite.com/)
* [Flowbite React](https://flowbite-react.com/)
* [Best-README-Template](https://github.com/othneildrew/Best-README-Template)

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