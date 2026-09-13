# RealView website

The landing page and update log for [RealView](https://github.com/RealViewExtension/RealViewExtension),
the Chrome extension that shows engaged views in YouTube Studio. Built with
[Astro](https://astro.build) and published to GitHub Pages.

| Environment | Branch    | URL                                                    |
| ----------- | --------- | ------------------------------------------------------ |
| Production  | `main`    | https://tryrealview.com/          |
| Staging     | `staging` | https://tryrealview.com/staging/  |

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

The updates page, each version's own page and the "latest version" badge in the
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

   The **Deploy** workflow publishes it under `/staging/` within a couple of minutes, with no
   approval needed. Staging pages carry a striped banner and a `noindex` tag, so search engines
   ignore them.
3. Happy with it? Merge to `main` and approve the production deploy (below).

## Deploying to production

Production only changes when you say so. A push to `main` starts a Deploy run that pauses at the
**Approve production** job:

1. Open the run under **Actions** (or follow the email GitHub sends).
2. Click **Review deployments**, tick `production`, and click **Approve and deploy**.

Approving fast-forwards the `production` branch to that commit and publishes it. Rejecting, or
just leaving it, keeps the live site exactly as it was; staging pushes in the meantime still go
out on their own. The `production` branch is a marker of what is live: never push to it by hand.

## Rolling back

Approve an older commit. Find the Deploy run for the version you want under **Actions**, click
**Re-run all jobs**, and approve it. Or reset `production` and re-run any Deploy run:

```sh
git push origin <good-commit>:production --force
```

## One-time GitHub setup

1. **Make the repository public, or upgrade the organisation.** GitHub Pages on a private
   repository needs a paid plan; the `RealViewExtension` organisation is on the free plan.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.** Or from a terminal:

   ```sh
   gh api -X POST repos/RealViewExtension/website/pages -f build_type=workflow
   ```
3. Create the `production` branch from `main` and protect it with a reviewer:

   ```sh
   git push origin main:production
   gh api -X PUT repos/RealViewExtension/website/environments/production \
     --input - <<'JSON'
   {"reviewers":[{"type":"User","id":<your user id>}],
    "deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}
   JSON
   gh api -X POST repos/RealViewExtension/website/environments/production/deployment-branch-policies \
     -f name=main -f type=branch
   ```

   Or Settings → Environments → New environment → `production` → tick **Required reviewers** and
   add yourself → Deployment branches: `main` only.
4. Push `main`. The first run creates the `github-pages` environment and publishes the site.
5. Allow the `staging` branch to deploy. GitHub creates the environment with a branch policy
   that only permits `main`, so the first staging run fails at the Publish step until you add it:

   ```sh
   gh api -X POST repos/RealViewExtension/website/environments/github-pages/deployment-branch-policies \
     -f name=staging -f type=branch
   ```

   Or Settings → Environments → github-pages → Deployment branches → add `staging`.

## Custom domain

The site is served from `tryrealview.com`, set by `public/CNAME`. The deploy workflow reads that
file: when it exists the site is built for the root of that domain, and when it is removed the
site goes back to `https://realviewextension.github.io/website/`. The same domain must also be set
under Settings → Pages → Custom domain.

DNS is on Cloudflare. Records, all set to **DNS only** (grey cloud):

| Type  | Name  | Content                     |
| ----- | ----- | --------------------------- |
| A     | `@`   | `185.199.108.153`           |
| A     | `@`   | `185.199.109.153`           |
| A     | `@`   | `185.199.110.153`           |
| A     | `@`   | `185.199.111.153`           |
| AAAA  | `@`   | `2606:50c0:8000::153`       |
| AAAA  | `@`   | `2606:50c0:8001::153`       |
| AAAA  | `@`   | `2606:50c0:8002::153`       |
| AAAA  | `@`   | `2606:50c0:8003::153`       |
| CNAME | `www` | `realviewextension.github.io` |

Keep them grey-clouded. GitHub issues the HTTPS certificate itself and cannot do so while
Cloudflare proxies the traffic.

## Local development

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run preview    # serve dist/ locally
```

Things you may want to change:

- `src/lib/site.ts`: the Chrome Web Store link and the GitHub links. The store link is the main
  install button; the GitHub release zip is offered as an early access build.
- `src/pages/index.astro`: the landing page copy and the example figures.
- `src/pages/privacy.md`: the privacy policy. It mirrors `PRIVACY.md` in the extension repository,
  so update both together.
- `src/styles/global.css`: colours and type. The red is `#ff0033`, the same as the charts.
