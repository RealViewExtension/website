# RealView website

The landing page and update log for [RealView](https://github.com/ericlmao/RealViewExtension),
the Chrome extension that shows engaged views in YouTube Studio. Built with
[Astro](https://astro.build) and published to GitHub Pages.

| Environment | Branch    | URL                                                    |
| ----------- | --------- | ------------------------------------------------------ |
| Production  | `main`    | https://realviewextension.github.io/website/           |
| Staging     | `staging` | https://realviewextension.github.io/website/staging/   |

## Publishing an update

Every release is one markdown file in `src/content/updates/`, named after the version:

```markdown
---
version: "1.8.4"
date: 2026-09-20
kind: feature        # feature or fix
title: "Short headline for this release"
---

- One line per change, written for the person using the extension.
- What they will see differently, not which function changed.
```

The updates page, each version's own page, the RSS feed and the "latest version" badge in the
header all come from these files. Nothing else needs editing.

To pull entries straight from the extension's `src/changelog.json`:

```sh
npm run sync-updates                        # fetch from GitHub
npm run sync-updates -- ../src/changelog.json   # or read a local checkout
```

The script writes a file for every version that does not have one yet and never touches existing
files, so titles you have edited stay as they are. It guesses `kind` from the version number
(middle number moved: feature; third number moved: fix) and takes the title from the first change,
so open the new file and give it a better title before committing.

## Previewing changes on staging

1. Branch from `main`, make your changes, and open a pull request. The **Check** workflow builds
   the site so broken pages never reach a branch that deploys.
2. Push (or merge) the branch to `staging`:

   ```sh
   git push origin my-branch:staging --force
   ```

   The **Deploy** workflow publishes it under `/staging/` within a couple of minutes. Staging
   pages carry a striped banner and a `noindex` tag, so search engines ignore them.
3. Happy with it? Merge to `main`. The same workflow publishes it to the production URL.

Both environments are rebuilt on every run, so staging is always the head of the `staging` branch
and production is always the head of `main`. To retire staging, delete the branch; the next
production deploy drops the `/staging/` folder.

## One-time GitHub setup

1. **Make the repository public, or upgrade the organisation.** GitHub Pages on a private
   repository needs a paid plan; the `RealViewExtension` organisation is on the free plan.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.** Or from a terminal:

   ```sh
   gh api -X POST repos/RealViewExtension/website/pages -f build_type=workflow
   ```
3. Push `main`. The first run creates the `github-pages` environment and publishes the site.

If you later rename the repository to `realviewextension.github.io`, the site moves to the root
of that domain. The workflow works out the base path from the repository name, so nothing in the
code changes.

## Local development

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run preview    # serve dist/ locally
```

Things you may want to change:

- `src/lib/site.ts`: the GitHub links, and `WEB_STORE_URL` once the Chrome Web Store listing is
  approved. Setting it swaps the download button for "Add to Chrome".
- `src/pages/index.astro`: the landing page copy and the example figures.
- `src/styles/global.css`: colours and type. The red is `#ff0033`, the same as the charts.
