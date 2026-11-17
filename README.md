# Dreamy portfolio — Cloudflare Pages + Decap CMS

Run `npm run dev` for a local preview at http://127.0.0.1:4173. Run `npm run build` to create `dist`. Run `npm run check` for syntax and OAuth security checks. No dependencies are required for the static build.

Content lives in `content/portfolio.json`; uploads go in `assets/uploads`. The production editor is `/admin/`. Decap commits edits to GitHub; Cloudflare deploys each published change. The initial photos are illustrative Unsplash images. The supplied background is assets/background.png. About and detail-page descriptions are placeholders until real content is supplied.

## Cloudflare Pages settings

Use a public GitHub repository with branch main and Git integration. Framework: None. Build command: npm run build. Output directory: dist. Keep functions/ at the repository root; Pages automatically deploys these OAuth endpoints. Do not use Direct Upload, because Git integration is needed for automatic CMS publishing.

Set the following variables for production:

- GITHUB_REPOSITORY: ricechickengames/sarah-kostuk-portfolio (build and runtime)
- SITE_URL: exact HTTPS production origin, e.g. https://your-site.pages.dev (build and runtime)
- ALLOWED_GITHUB_LOGIN: ricechickengames (runtime)
- GITHUB_CLIENT_ID: GitHub OAuth app client ID (runtime)
- GITHUB_CLIENT_SECRET: GitHub OAuth app client secret, encrypted in Cloudflare (runtime). Never put this secret in source files or chat.

Register a GitHub OAuth App with the production SITE_URL as its homepage and SITE_URL/callback as the authorization callback URL. The app uses public_repo scope, which GitHub describes on its consent screen. This permits access to public repositories the signed-in account can write. Our callback additionally permits only ALLOWED_GITHUB_LOGIN and checks portfolio repository write access. Private repositories are not supported by the current OAuth scope.

The account owner must complete any new account terms, approve app installation/OAuth access, and create/configure credentials through their account. Local build success does not mean hosting or login is connected. Until the repository is configured, the local editor shows a setup message.

## Editing

Open /admin/, sign in to GitHub, and choose Your portfolio → Pages & folder photos. Replace images, adjust horizontal and vertical crop percentages, edit page text, or add attachments. Click Publish, then wait for Cloudflare's new deployment. About is the landing page, Projects is second in the navigation, and Contact supports an email link.

The portfolio repository, uploaded media, page text, and Git history are public. Only upload content intended to be shared. Media removed from a page may remain in Git history. Keep uploaded media below 10 MB. Compress photos before uploading. Firebase is no longer used; no paid billing has been enabled. Old browser drafts are not automatically migrated; retain any exported backup.

## Website projects

In Portfolio Studio, choose **Website projects → New website project**. Enter a title and description, choose **Upload website folder**, and select the full built website directory. Pick its **Starting page** (usually `index.html`) and Publish. The project appears under Computer Science → A little more after Cloudflare deploys it. Reopen the entry to change the starting page or replace the folder.

Folders may contain up to 250 files and 20 MB of HTML, CSS, JavaScript, images, fonts and other supported static assets. Folder paths are retained. Projects with a server/database need separate hosting. Each project is isolated from the portfolio editor; browser-storage-dependent features may need adaptation. Do not include API keys or personal information in a public project folder. The source bundles stay outside the public build; visitors load only the compiled website and a small project listing.
