(() => {
    const escapeHtml = (value) => value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const slugify = (value) => value
        .toLowerCase()
        .trim()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const addHeadingAnchors = (root) => {
        const seen = new Map();

        root.querySelectorAll("h2, h3, h4").forEach((heading) => {
            const baseSlug = slugify(heading.textContent || "section") || "section";
            const count = seen.get(baseSlug) || 0;
            seen.set(baseSlug, count + 1);
            const id = count ? `${baseSlug}-${count + 1}` : baseSlug;

            heading.id = id;

            const anchor = document.createElement("a");
            anchor.href = `#${id}`;
            anchor.className = "heading-anchor";
            anchor.setAttribute("aria-label", `Link to ${heading.textContent}`);
            anchor.textContent = "#";
            heading.append(" ", anchor);
        });
    };

    const wrapTables = (root) => {
        root.querySelectorAll("table").forEach((table) => {
            const wrapper = document.createElement("div");
            wrapper.className = "table-wrap";
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
    };

    const wrapImages = (root) => {
        root.querySelectorAll("img").forEach((image) => {
            if (image.closest("figure")) {
                return;
            }

            image.loading = "lazy";
            image.decoding = "async";

            const figure = document.createElement("figure");
            figure.className = "article-figure";

            const parent = image.parentElement;
            const imageOnlyParagraph = parent
                && parent.tagName === "P"
                && parent.textContent.trim() === ""
                && parent.querySelectorAll("img").length === 1;

            if (imageOnlyParagraph) {
                parent.parentNode.insertBefore(figure, parent);
                parent.remove();
            } else {
                image.parentNode.insertBefore(figure, image);
            }

            figure.appendChild(image);

            const captionText = image.getAttribute("alt");
            if (captionText) {
                const caption = document.createElement("figcaption");
                caption.textContent = captionText;
                figure.appendChild(caption);
            }
        });
    };

    const buildArticleHeader = (article) => {
        const title = article.querySelector("h1");
        if (!title) {
            return null;
        }

        const header = document.createElement("header");
        header.className = "article-header";
        article.insertBefore(header, title);

        if (article.dataset.articleKicker) {
            const kicker = document.createElement("p");
            kicker.className = "article-kicker";
            kicker.textContent = article.dataset.articleKicker;
            header.appendChild(kicker);
        }

        header.appendChild(title);

        const maybeDeck = header.nextElementSibling;
        if (maybeDeck && maybeDeck.tagName === "P") {
            maybeDeck.classList.add("article-deck");
            header.appendChild(maybeDeck);
        }

        if (article.dataset.articleMeta) {
            const meta = document.createElement("p");
            meta.className = "article-meta";
            meta.textContent = article.dataset.articleMeta;
            header.appendChild(meta);
        }

        return title;
    };

    const setExternalLinks = (root) => {
        root.querySelectorAll("a[href]").forEach((link) => {
            const href = link.getAttribute("href");
            if (!href || href.startsWith("#")) {
                return;
            }

            const url = new URL(href, window.location.href);
            if (url.origin !== window.location.origin) {
                link.target = "_blank";
                link.rel = "noopener noreferrer";
            }
        });
    };

    const renderMarkdown = async (article) => {
        const src = article.dataset.markdownSrc || "index.md";

        if (!window.markdownit || !window.DOMPurify) {
            throw new Error("Markdown renderer failed to load.");
        }

        const md = window.markdownit({
            html: false,
            linkify: true,
            typographer: true,
            highlight(source, language) {
                if (window.hljs && language && window.hljs.getLanguage(language)) {
                    try {
                        const highlighted = window.hljs.highlight(source, {
                            language,
                            ignoreIllegals: true,
                        }).value;

                        return `<pre class="hljs"><code>${highlighted}</code></pre>`;
                    } catch (_) {
                        // Fall through to escaped plain text.
                    }
                }

                return `<pre class="hljs"><code>${escapeHtml(source)}</code></pre>`;
            },
        });

        const response = await fetch(src, { cache: "no-cache" });
        if (!response.ok) {
            throw new Error(`Could not load ${src}.`);
        }

        const markdown = await response.text();
        article.innerHTML = window.DOMPurify.sanitize(md.render(markdown));

        const title = buildArticleHeader(article);
        addHeadingAnchors(article);
        wrapTables(article);
        wrapImages(article);
        setExternalLinks(article);

        if (title) {
            document.title = `${title.textContent.trim()} | lustoykov`;
        }

        article.classList.add("is-rendered");

        if (window.location.hash) {
            const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
            if (target) {
                target.scrollIntoView();
            }
        }
    };

    document.addEventListener("DOMContentLoaded", () => {
        const article = document.querySelector("[data-markdown-src]");
        if (!article) {
            return;
        }

        renderMarkdown(article).catch((error) => {
            article.innerHTML = `<p class="markdown-error">${escapeHtml(error.message)}</p>`;
        });
    });
})();
