# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.4.0] - 2026-01-30

### Added

- **Internationalization (i18n)**: Complete Thai/English language support
  - Language switcher in Navbar
  - Context-based translation system (`LanguageContext`)
  - Persistent language preference
- **Tree Detail Enhancement**: Comprehensive 6-card layout displaying 20+ data points
  - **Dates**: Germination, planting, harvest dates, and age
  - **Genetics**: Strain, variety, genotype, phenotype, generation
  - **Lineage**: Male/Female parents, clone source
  - **Pollination**: pollination date, pollinator, seed count
  - **Yield**: Weight, flower quality, tree code
  - **Notes**: General and disease/issue notes
- **Design System**: "Organic Biophilic" styling foundation (colors, rounded corners)

### Changed

- **Dark Mode**: Improved contrast ratios for text and cards in dark mode
- **Performance**: Optimized `useTreeData` hook with `AbortController` for request cancellation
- **Type Safety**: Enhanced `Tree` interface with strict typing for all new fields

### Fixed

- **Hydration Errors**: Resolved `next-themes` hydration mismatch by properly wrapping `ThemeProvider`
- **Sex Badges**: Corrected Thai translations for plant sex labels

---

## [1.3.0] - 2026-01-19

### Added

- **Accessibility**: Added `aria-label` attributes to all icon-only buttons across the application
  - TreeTable: 4 action buttons (Public Page, QR Code, Edit, Delete)
  - TreeCard: 5 action buttons (View, QR Code, Public Page, Edit, Delete)
  - Strains/Batches pages: Edit and Delete buttons
- **Loading States**: Skeleton UI loading for Public Tree Page matching actual layout
- **Error States**: Enhanced error page with illustration and helpful messaging
- **Documentation**: Professional README.md with tables and improved structure
- **Documentation**: CHANGELOG.md following Keep a Changelog standard

### Changed

- **Startup Script**: Enhanced `start_app.bat` with dependency checking and Unicode UI
- **Code Quality**: Removed unused imports from multiple components
  - `strains/page.tsx`: Removed `Card`, `Badge`
  - `batches/page.tsx`: Removed `Card`
  - `FilterBar.tsx`: Removed `TextInput`
- **Consistency**: Standardized z-index values across components (`z-9999` instead of `z-[10000]`)
- **CSS**: Fixed conflicting classes in `QRCodeModal.tsx` (`inline-block` with `flex`)

### Fixed

- Navbar visual overlap with modals (z-index hierarchy)
- Image click opening edit modal instead of image viewer (event propagation)
- Public Tree Page API fetching errors
- Tailwind CSS class syntax (`p-1!` postfix, `bg-linear-to-*` gradients)

---

## [1.2.0] - 2026-01-15

### Added

- **QR Code Feature**: Generate and download QR codes for each tree
- **Public Tree Page**: Shareable public page for individual trees
- **Image Viewer Modal**: Full-screen lightbox for viewing tree images

### Changed

- **Dashboard Revamp**: Complete UI overhaul with modern glassmorphism design
- **Responsive Navbar**: Mobile-friendly navigation with scroll effects
- **TreeCard Enhancements**: Sex icons, age display, improved hover effects

### Fixed

- Public Tree Page layout and header issues
- React Hooks Order Error on public page
- Mobile UI table responsiveness

---

## [1.1.0] - 2025-12-01

### Added

- **Tree Detail Modal**: Premium UI with glassmorphism design
- **Image Gallery**: Large main image with scrollable thumbnails
- **Stats Grid**: Easy-to-read grid for key tree information
- **Drag-and-Drop Upload**: Upload documents and images via drag-and-drop
- **Dynamic Image Paths**: Smart folder management for tree images

### Changed

- **Modal Centering**: Fixed modal positioning issues
- **Z-Index Management**: Resolved element stacking issues
- **Tree Detail Fields**: Added health and notes separation

### Fixed

- Incorrect table head background class
- RGBA to JPEG thumbnail conversion issues
- Image hover effects in TreeTable

---

## [1.0.0] - 2025-11-28

### Added

- **Initial Release**
- Django REST API backend with Strain, Batch, Tree models
- Next.js 15 + React 19 frontend
- Tailwind CSS 4 + Flowbite React UI components
- CRUD operations for Strains, Batches, and Trees
- Image and document upload support with automatic thumbnails
- Dark mode support
- Mobile-responsive design
- Nginx deployment configuration

### Tech Stack

- Django 5.2.8 + Django REST Framework 3.16.1
- Next.js 16.0.3 + React 19.2.0
- Tailwind CSS 4.1.17 + Flowbite React 0.12.10

---

[1.4.0]: https://github.com/naravid19/mytree-journal/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/naravid19/mytree-journal/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/naravid19/mytree-journal/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/naravid19/mytree-journal/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/naravid19/mytree-journal/releases/tag/v1.0.0
