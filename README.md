# mytree-journal

MyTree Journal tracks your trees and related data.

## Strains Page

The frontend provides a `/strains` page for managing tree strains. You can add, edit and delete strain entries through the UI. Saved strains automatically populate the strain dropdown when creating or editing trees.

Ensure the backend API is running at `http://localhost:8000` so the page can load and save data.

## Batches Page

The `/batches` page lets you manage planting batches. You can create new batches and edit or delete existing ones. As with strains, it relies on the backend API running at `http://localhost:8000` to load and persist data.
