# Private Data Instructions

The `private_data/` directory contains personal health records (PDFs, images) that **MUST NOT** be committed to the public repository or exposed on the public website.

## Security Rules

1.  **Git Ignore**: The `private_data/` folder is added to `.gitignore`.
2.  **No Server Access**: Do not link to these files in `index.html`.
3.  **Local Only**: These files are for extracting data to populate the tables manually.

## Workflow

When new results arrive:
1.  Save them to `private_data/` locally.
2.  **AI Permission**: The AI agent is ALLOWED to read files in `private_data/` to extract metrics and populate the tables.
3.  Manually update the tables in `index.html` with the new values.
4.  **Do not** upload the raw files.
