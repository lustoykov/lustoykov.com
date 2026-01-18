# The Blueprint Project

This is a static website implementation of "The Blueprint". It is designed to be lightweight, fast, and easy to deploy.

## Project Structure
- `index.html`: The main content of the website.
- `styles.css`: The styling file (Dark Mode, Premium Aesthetic).

## Deployment Instructions

### Option 1: GitHub Pages (Recommended - Free)

1.  **Initialize Git**:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  **Create a Repository on GitHub**:
    - Go to [GitHub.com/new](https://github.com/new).
    - Name it `lustoykov-blueprint` (or similar).
    - **Important**: If you want the URL to be `lustoykov.github.io`, name the repository `lustoykov.github.io`.
3.  **Push Code**:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```
4.  **Enable GitHub Pages**:
    - Go to your repository **Settings** > **Pages**.
    - Under **Build and deployment** > **Source**, select `Deploy from a branch`.
    - Select `main` branch and `/ (root)` folder.
    - Click **Save**.
    - Your site will be live at `https://yourusername.github.io/repo-name/`.

### Option 2: Drag & Drop (Netlify / Vercel)

1.  Create an account on [Netlify](https://netlify.com) or [Vercel](https://vercel.com).
2.  Drag the entire project folder into their dashboard.
3.  It will be online in seconds.

## Custom Domain Setup (GitHub Pages)

1.  **Buy a Domain**: Use Namecheap, GoDaddy, or Cloudflare.
2.  **Configure GitHub Pages**:
    - Go to Repo Settings > Pages > **Custom domain**.
    - Enter your domain (e.g., `blueprint.lustoykov.com`).
    - Click **Save**. GitHub will create a `CNAME` file in your repo.
3.  **Configure DNS (at your Registrar)**:
    - Login to where you bought your domain.
    - Add a `CNAME` record:
        - **Host**: `www` (or subdomain like `blueprint`)
        - **Value**: `yourusername.github.io`
    - (If using a root domain like `lustoykov.com`):
        - Add `A` records pointing to GitHub's IPs:
            - `185.199.108.153`
            - `185.199.109.153`
            - `185.199.110.153`
            - `185.199.111.153`
