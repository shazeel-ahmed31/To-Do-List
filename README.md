# Task Manager

A lightweight browser task manager with creation, editing, completion, deletion, search and status filters. HTML, CSS and JavaScript; no backend or account required.

![Original task manager interface](to%20do.png)

The existing screenshot shows the original visual design. Storage validation and accessible controls have since been improved.

## Run locally

Serve this directory with `python -m http.server 8770`, then open http://localhost:8770. Bootstrap 5.3 and Font Awesome styles load from public CDNs; an internet connection is needed for these assets and the edit modal library.

## Usage and implementation

Enter a task of 1–500 characters. Use each checkbox to complete it, Edit to change its text, or Delete to remove it after confirmation. Search and the status filter work together. Clear All asks for confirmation. Escape clears a focused search field; Ctrl/Cmd+Enter adds a task from the entry field.

`script.js` controls the DOM and Bootstrap edit dialog. `task-data.js` validates persisted task records, generates collision-free numeric IDs and filters tasks. `styles.css` provides responsive cards, focus outlines and reduced-motion behavior.

Tasks are stored under `taskManagerTasks` in localStorage for the current browser and origin. Invalid records are rejected as a whole; the original stored value stays intact until a successful change replaces it. Storage failures show a visible message and leave changes available only for this session. Data is not encrypted, synchronized, or backed up, and clearing browser data removes it. Concurrent tabs can overwrite each other's changes.

## Checks

With Node.js 22 installed, run `npm run check` and `npm test`. Tests cover malformed records, injected IDs, duplicate IDs, combined search/filter behavior and same-millisecond creation. GitHub Actions runs both checks. There are no npm runtime dependencies or build step.

## Deployment and next steps

Suitable for GitHub Pages as a static site; no verified public demo is currently configured. Future improvements could add a visible import/export workflow and cross-tab synchronization.

Author: Shazeel Ahmed. No license file is present; this README does not grant a new license.
