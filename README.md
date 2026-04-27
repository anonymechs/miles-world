# Miles World

Landing page for Miles' world of AI-generated stories and games.

## Tech stack

- React + TypeScript + Vite
- Vitest + Testing Library
- ESLint
- GitHub Actions (CI + deployment)
- GitHub Pages hosting

## Local development

```bash
npm install
npm run dev
```

Open the local URL from Vite and edit `src/App.tsx` / `src/App.css`.

## Design workflow

Use this lightweight flow for every update:

1. Define content first (new story/game cards, section text, CTA labels).
2. Update layout/styles in `src/App.tsx` and `src/App.css`.
3. Test visually in desktop + mobile widths (browser responsive mode).
4. Keep the page simple and story-first (fast loading, readable text, big touch targets).

## Development workflow

Main scripts:

- `npm run dev` - local development
- `npm run lint` - lint checks
- `npm run test` - unit tests
- `npm run build` - production build
- `npm run preview` - preview production output

Recommended branch workflow:

1. Create a feature branch from `main`.
2. Commit regularly with clear messages.
3. Open a pull request.
4. Merge only after CI passes.

## Testing workflow

- Unit tests live next to app code (`src/App.test.tsx`).
- CI automatically runs lint + tests + build on every pull request and push to `main`.
- Add one or more tests whenever you add a new section or behavior.

## Deployment workflow

GitHub Actions deploys to GitHub Pages from `main` using `.github/workflows/deploy.yml`.

After the first push:

1. In GitHub repo settings, enable **Pages** and set source to **GitHub Actions**.
2. Push to `main`; deployment will run automatically.
3. Your site URL will be:
   `https://<github-username>.github.io/<repo-name>/`

The workflow sets `VITE_BASE_PATH` automatically so asset paths work on project pages.

## GitHub integration setup

From this project folder:

```bash
git init
git add .
git commit -m "Initial Miles World landing page and workflow setup"
git branch -M main
gh repo create miles-world --public --source=. --remote=origin --push
```

If the GitHub CLI (`gh`) is not installed, create the repo in the GitHub web UI, then:

```bash
git remote add origin https://github.com/<github-username>/<repo-name>.git
git push -u origin main
```
