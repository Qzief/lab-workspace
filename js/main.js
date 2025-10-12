// Blog System with Markdown Support
class BlogSystem {
  constructor() {
    this.posts = [];
    this.filteredPosts = [];
    this.currentPost = null;
    this.isDarkMode = localStorage.getItem("darkMode") === "true";

    this.availableTags = [];
    this.selectedTags = new Set();
    this.currentQuery = "";

    this.init();
  }

  async init() {
    this.setupDarkMode();
    this.setupEventListeners();
    this.setupRouting();
    if (window.marked && typeof window.marked.setOptions === "function") {
      window.marked.setOptions({
        gfm: true,
        breaks: true,
        smartypants: true,
        headerIds: true,
        mangle: false,
      });
    }
    await this.loadPosts();

    this.buildAvailableTags();
    this.setupTagFilter();
    this.setupTagFilterMobile();

    this.renderPosts();
    this.handleInitialRoute();
  }

  setupRouting() {
    // Listen for hash changes
    window.addEventListener("hashchange", () => {
      this.handleRouteChange();
    });
  }

  handleInitialRoute() {
    // Handle initial route when page loads
    this.handleRouteChange();
  }

  handleRouteChange() {
    const hash = window.location.hash;

    if (hash.startsWith("#/")) {
      const postId = hash.substring(2); // Remove '#/' prefix
      const post = this.posts.find((p) => p.id === postId);

      if (post) {
        this.openPost(postId, false); // false = don't update hash again
      } else {
        // Post not found, redirect to home
        this.showHomePage();
      }
    } else {
      // No hash or invalid hash, show home page
      this.showHomePage();
    }
  }

  setupDarkMode() {
    const html = document.documentElement;
    const darkModeToggle = document.getElementById("darkModeToggle");

    if (this.isDarkMode) {
      html.classList.add("dark");
      this.setHljsTheme(true);
    } else {
      this.setHljsTheme(false);
    }

    darkModeToggle.addEventListener("click", () => {
      this.isDarkMode = !this.isDarkMode;
      html.classList.toggle("dark");
      localStorage.setItem("darkMode", this.isDarkMode);
      this.setHljsTheme(this.isDarkMode);
    });
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("searchInput");
    const mobileSearchInput = document.getElementById("mobileSearchInput");

    const handleSearch = (e) => {
      const query = e.target.value.toLowerCase().trim();
      this.currentQuery = query;
      this.applyFilters();
    };

    searchInput.addEventListener("input", handleSearch);
    mobileSearchInput.addEventListener("input", handleSearch);

    // Sync search inputs
    searchInput.addEventListener("input", (e) => {
      mobileSearchInput.value = e.target.value;
    });

    mobileSearchInput.addEventListener("input", (e) => {
      searchInput.value = e.target.value;
    });

    // Back button
    document.getElementById("backButton").addEventListener("click", () => {
      this.showHomePage();
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.showHomePage();
      }
    });
  }

  async loadPosts() {
    try {
      // Get list of markdown files
      const markdownFiles = [
        "tips-merawat-galon.md",
        "belajar-javascript-modern.md",
        "css-grid-vs-flexbox.md",
        "testing.md",
        "Labsheet 3.md",
      ];

      const posts = [];

      for (const filename of markdownFiles) {
        try {
          const response = await fetch(`posts/${encodeURIComponent(filename)}`);
          if (!response.ok) continue;

          const content = await response.text();
          const post = this.parseMarkdownPost(content, filename);
          if (post) {
            posts.push(post);
          }
        } catch (error) {
          console.warn(`Failed to load ${filename}:`, error);
        }
      }

      // Sort posts by date (newest first)
      this.posts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      this.filteredPosts = [...this.posts];
    } catch (error) {
      console.error("Error loading posts:", error);
      // Fallback to empty array
      this.posts = [];
      this.filteredPosts = [];
    }
    this.renderPopular();
  }

  parseMarkdownPost(content, filename) {
    try {
      // Simple frontmatter parser
      const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
      const match = content.match(frontmatterRegex);

      if (!match) {
        console.warn(`No frontmatter found in ${filename}`);
        return null;
      }

      const [, frontmatterStr, markdownContent] = match;
      const frontmatter = this.parseFrontmatter(frontmatterStr);

      // Generate ID from filename
      const id = filename
        .replace(".md", "")
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase();

      // Unescape code fences so Marked can parse them (handles \"\`\`\`\" → \"\`\`\`\")
      // also normalize line endings to be safe
      const unescapedContent = markdownContent
        .replace(/\\```/g, "```") // opening/closing fenced code blocks
        .replace(/\\`/g, "`") // inline code that was escaped
        .replace(/\r\n?/g, "\n") // normalize CRLF to LF
        .trim();

      return {
        id,
        title: frontmatter.title || "Untitled",
        excerpt: frontmatter.excerpt || this.generateExcerpt(unescapedContent),
        date: frontmatter.date || new Date().toISOString().split("T")[0],
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        category: frontmatter.category || "Uncategorized",
        author: frontmatter.author || "Anonymous",
        content: unescapedContent,
      };
    } catch (error) {
      console.error(`Error parsing ${filename}:`, error);
      return null;
    }
  }

  parseFrontmatter(frontmatterStr) {
    const frontmatter = {};
    const lines = frontmatterStr.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const colonIndex = trimmedLine.indexOf(":");
      if (colonIndex === -1) continue;

      const key = trimmedLine.substring(0, colonIndex).trim();
      let value = trimmedLine.substring(colonIndex + 1).trim();

      // Handle arrays (simple format: [item1, item2, item3])
      if (value.startsWith("[") && value.endsWith("]")) {
        value = value
          .slice(1, -1)
          .split(",")
          .map((item) => item.trim());
      }

      frontmatter[key] = value;
    }

    return frontmatter;
  }

  generateExcerpt(content) {
    // Remove markdown syntax and get first paragraph
    const plainText = content
      .replace(/#{1,6}\s+/g, "") // Remove headers
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italic
      .replace(/`(.*?)`/g, "$1") // Remove inline code
      .replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1") // Remove links
      .replace(/```[\s\S]*?```/g, "") // Remove code blocks
      .trim();

    const firstParagraph = plainText.split("\n\n")[0];
    return firstParagraph.length > 150
      ? firstParagraph.substring(0, 150) + "..."
      : firstParagraph;
  }

  buildAvailableTags() {
    const set = new Set();
    this.posts.forEach((p) =>
      (Array.isArray(p.tags) ? p.tags : []).forEach((t) => set.add(String(t)))
    );
    this.availableTags = Array.from(set).sort((a, b) =>
      a.localeCompare(b, "id-ID", { sensitivity: "base" })
    );
  }

  setupTagFilter() {
    const btn = document.getElementById("tagFilterButton");
    const dd = document.getElementById("tagDropdown");
    const list = document.getElementById("tagList");
    const clearBtn = document.getElementById("clearTagsBtn");

    if (!btn || !dd || !list || !clearBtn) return;

    // Toggle dropdown
    const toggle = () => {
      const isHidden = dd.classList.contains("hidden");
      dd.classList.toggle("hidden");
      btn.setAttribute("aria-expanded", isHidden ? "true" : "false");
    };

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });

    // Close jika klik di luar
    document.addEventListener("click", (e) => {
      if (!dd.classList.contains("hidden")) {
        const within = dd.contains(e.target) || btn.contains(e.target);
        if (!within) {
          dd.classList.add("hidden");
          btn.setAttribute("aria-expanded", "false");
        }
      }
    });

    // Render list awal
    this.renderTagList();

    // Delegasi perubahan checkbox
    list.addEventListener("change", (e) => {
      const target = e.target;
      if (target && target.matches('input[type="checkbox"][data-tag]')) {
        const raw = target.getAttribute("data-tag") || "";
        const tag = raw.toString();
        if (target.checked) {
          this.selectedTags.add(tag.toLowerCase());
        } else {
          this.selectedTags.delete(tag.toLowerCase());
        }
        this.updateSelectedTagCount();
        this.applyFilters();
        // sinkronkan daftar desktop
        this.renderTagListMobile();
      }
    });

    // Clear tags
    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.selectedTags.clear();
      this.renderTagList();
      this.renderTagListMobile();
      this.updateSelectedTagCount();
      this.applyFilters();
    });
  }

  renderTagList() {
    const list = document.getElementById("tagList");
    if (!list) return;

    list.innerHTML = this.availableTags
      .map((tag) => {
        const id = `tag-${tag.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        const checked = this.selectedTags.has(tag.toLowerCase())
          ? "checked"
          : "";
        return `
          <label for="${id}" class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/40 dark:hover:bg-gray-700/40 transition-colors cursor-pointer">
            <input id="${id}" type="checkbox" data-tag="${tag}" class="accent-blue-600" ${checked} />
            <span class="text-sm text-gray-700 dark:text-gray-200">${tag}</span>
          </label>
        `;
      })
      .join("");
    this.updateSelectedTagCount();
  }

  updateSelectedTagCount() {
    const badge = document.getElementById("selectedTagCount");
    const mobileBadge = document.getElementById("mobileSelectedTagCount");
    const count = this.selectedTags.size;

    if (badge) {
      if (count > 0) {
        badge.textContent = String(count);
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    }
    if (mobileBadge) {
      if (count > 0) {
        mobileBadge.textContent = String(count);
        mobileBadge.classList.remove("hidden");
      } else {
        mobileBadge.classList.add("hidden");
      }
    }
  }

  applyFilters() {
    const q = (this.currentQuery || "").toLowerCase();

    // Start dari semua posts
    let result = [...this.posts];

    // Filter berdasarkan query teks
    if (q) {
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          post.excerpt.toLowerCase().includes(q) ||
          post.content.toLowerCase().includes(q) ||
          post.tags.some((tag) => (tag || "").toLowerCase().includes(q)) ||
          post.category.toLowerCase().includes(q) ||
          post.author.toLowerCase().includes(q)
      );
    }

    // Filter berdasarkan selected tags (match ANY dari tag terpilih)
    if (this.selectedTags.size > 0) {
      result = result.filter((post) => {
        const lowerTags = post.tags.map((t) => (t || "").toLowerCase());
        for (const sel of this.selectedTags) {
          if (lowerTags.includes(sel)) return true;
        }
        return false;
      });
    }

    this.filteredPosts = result;
    this.renderPosts();
  }

  filterPosts(query) {
    if (!query) {
      this.filteredPosts = [...this.posts];
    } else {
      this.filteredPosts = this.posts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          post.category.toLowerCase().includes(query) ||
          post.author.toLowerCase().includes(query)
      );
    }
    this.renderPosts();
  }

  renderPosts() {
    const container = document.getElementById("blogPosts");
    const noResults = document.getElementById("noResults");
    const postCount = document.getElementById("postCount");

    const useGridLTR = false;
    container.classList.toggle("grid-mode", useGridLTR);

    // Update post count
    postCount.textContent = `${this.filteredPosts.length} artikel`;

    if (this.filteredPosts.length === 0) {
      container.innerHTML = "";
      noResults.classList.remove("hidden");
      return;
    }

    noResults.classList.add("hidden");

    container.innerHTML = this.filteredPosts
      .map(
        (post) => `
          <a class="block py-5 group" onclick="blogSystem.openPost('${
            post.id
          }', true)">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <div class="flex flex-wrap gap-2 mb-2">
                  ${post.tags
                    .slice(0, 4)
                    .map(
                      (tag) => `
                    <span class="px-2.5 py-0.5 text-xs font-medium rounded-md border border-blue-200/50 text-blue-700 dark:text-blue-300 dark:border-blue-500/20">${tag}</span>
                  `
                    )
                    .join("")}
                </div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                  ${post.title}
                </h2>
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                  ${post.excerpt}
                </p>
                <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  ${this.formatDate(post.date)} • oleh ${post.author}
                </div>
              </div>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </a>
        `
      )
      .join("");

    this.renderPopular();
  }

  openPost(postId, updateHash = true) {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return;

    this.incrementView(post.id);

    this.currentPost = post;

    if (updateHash) {
      window.location.hash = `#/${postId}`;
    }

    document.getElementById("heroSection").style.display = "none";
    document.getElementById("blogPostsSection").style.display = "none";

    const articlePage = document.getElementById("articlePage");
    articlePage.classList.remove("hidden");

    const articleMeta = document.getElementById("articleMeta");
    articleMeta.innerHTML = `
      <div class="flex flex-wrap gap-2 mb-3">
        ${post.tags
          .map(
            (tag) => `
          <span class="px-2.5 py-0.5 text-xs font-medium rounded-md border border-blue-200/50 text-blue-700 dark:text-blue-300 dark:border-blue-500/20">
            ${tag}
          </span>
        `
          )
          .join("")}
      </div>
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
        ${post.title}
      </h1>
      <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          ${this.formatDate(post.date)}
        </div>
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          ${post.author}
        </div>
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
          </svg>
          ${post.category}
        </div>
      </div>
    `;

    const articleContent = document.getElementById("articleContent");
    const marked = window.marked;
    const normalizedContent = (post.content || "")
      .replace(/^```mysql/gm, "```sql")
      .replace(/^```js/gm, "```javascript");

    articleContent.innerHTML = marked.parse(normalizedContent);

    this.enhanceCodeBlocks();
    window.scrollTo(0, 0);

    this.renderPopular();
  }

  showHomePage() {
    // Update URL hash to empty
    if (window.location.hash) {
      window.location.hash = "";
    }

    // Hide article page
    const articlePage = document.getElementById("articlePage");
    articlePage.classList.add("hidden");

    // Show home page content
    document.getElementById("heroSection").style.display = "block";
    document.getElementById("blogPostsSection").style.display = "block";

    // Scroll to top
    window.scrollTo(0, 0);

    this.currentPost = null;
  }

  formatDate(dateString) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  }

  setupTagFilterMobile() {
    const btn = document.getElementById("mobileTagFilterButton");
    const dd = document.getElementById("mobileTagDropdown");
    const list = document.getElementById("mobileTagList");
    const clearBtn = document.getElementById("mobileClearTagsBtn");

    if (!btn || !dd || !list || !clearBtn) return;

    const toggle = () => {
      const isHidden = dd.classList.contains("hidden");
      dd.classList.toggle("hidden");
      btn.setAttribute("aria-expanded", isHidden ? "true" : "false");
    };

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });

    document.addEventListener("click", (e) => {
      if (!dd.classList.contains("hidden")) {
        const within = dd.contains(e.target) || btn.contains(e.target);
        if (!within) {
          dd.classList.add("hidden");
          btn.setAttribute("aria-expanded", "false");
        }
      }
    });

    // render awal
    this.renderTagListMobile();

    // perubahan checkbox
    list.addEventListener("change", (e) => {
      const target = e.target;
      if (target && target.matches('input[type="checkbox"][data-tag]')) {
        const raw = target.getAttribute("data-tag") || "";
        const tag = raw.toString();
        if (target.checked) {
          this.selectedTags.add(tag.toLowerCase());
        } else {
          this.selectedTags.delete(tag.toLowerCase());
        }
        this.updateSelectedTagCount();
        this.applyFilters();
        // sinkronkan daftar desktop
        this.renderTagList();
      }
    });

    // hapus semua tag
    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.selectedTags.clear();
      this.renderTagListMobile();
      this.renderTagList();
      this.updateSelectedTagCount();
      this.applyFilters();
    });
  }

  renderTagListMobile() {
    const list = document.getElementById("mobileTagList");
    if (!list) return;

    list.innerHTML = this.availableTags
      .map((tag) => {
        const id = `mobile-tag-${tag
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}`;
        const checked = this.selectedTags.has(tag.toLowerCase())
          ? "checked"
          : "";
        return `
          <label for="${id}" class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/40 dark:hover:bg-gray-700/40 transition-colors cursor-pointer">
            <input id="${id}" type="checkbox" data-tag="${tag}" class="accent-blue-600" ${checked} />
            <span class="text-sm text-gray-700 dark:text-gray-200">${tag}</span>
          </label>
        `;
      })
      .join("");
    this.updateSelectedTagCount();
  }

  // Sinkronisasi tema highlight (light/dark)
  setHljsTheme(isDark) {
    const light = document.getElementById("hljs-light");
    const dark = document.getElementById("hljs-dark");
    if (!light || !dark) return;
    if (isDark) {
      light.setAttribute("disabled", "true");
      dark.removeAttribute("disabled");
    } else {
      dark.setAttribute("disabled", "true");
      light.removeAttribute("disabled");
    }
  }

  // Highlight code + fitur "klik untuk salin"
  enhanceCodeBlocks() {
    const articleContent = document.getElementById("articleContent");
    if (!articleContent) return;

    const codeBlocks = articleContent.querySelectorAll("pre > code");
    codeBlocks.forEach((codeEl) => {
      const pre = codeEl.parentElement;
      if (!pre) return;

      // Hindari double-enhance
      if (
        pre.parentElement &&
        pre.parentElement.classList.contains("code-wrapper")
      ) {
        // Sudah di-wrap sebelumnya: tetap highlight ulang jika perlu
      } else {
        // Bungkus pre dengan wrapper untuk posisi tombol
        const wrapper = document.createElement("div");
        wrapper.className = "code-wrapper relative";
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        // Tombol salin
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "code-copy-btn absolute top-2 right-2 z-10 glass-button px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white/40 dark:bg-gray-800/40 border border-white/20 dark:border-gray-700/20 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all";
        btn.textContent = "Salin";
        btn.setAttribute("aria-label", "Salin kode");
        wrapper.appendChild(btn);

        const copyHandler = async (e) => {
          // Bila klik tombol, jangan bubble ke pre untuk menghindari trigger ganda
          e && e.stopPropagation && e.stopPropagation();
          try {
            await navigator.clipboard.writeText(codeEl.innerText || "");
            const prev = btn.textContent;
            btn.textContent = "Disalin!";
            setTimeout(() => {
              btn.textContent = prev;
            }, 1500);
          } catch (err) {
            console.error("Gagal menyalin:", err);
            const prev = btn.textContent;
            btn.textContent = "Gagal!";
            setTimeout(() => {
              btn.textContent = prev;
            }, 1500);
          }
        };

        btn.addEventListener("click", copyHandler);

        // Klik di area pre juga menyalin
        if (!pre.dataset.copyBound) {
          pre.dataset.copyBound = "1";
          pre.style.cursor = "pointer";
          pre.title = "Klik untuk menyalin kode";
          pre.addEventListener("click", copyHandler);
        }
      }

      // Highlight menggunakan highlight.js bila tersedia
      if (window.hljs && typeof window.hljs.highlightElement === "function") {
        try {
          window.hljs.highlightElement(codeEl);
        } catch (e) {
          // fallback diam
        }
      }
    });
  }

  getViewCount(id) {
    try {
      return Number.parseInt(localStorage.getItem(`views:${id}`) || "0", 10);
    } catch {
      return 0;
    }
  }

  incrementView(id) {
    try {
      const next = this.getViewCount(id) + 1;
      localStorage.setItem(`views:${id}`, String(next));
    } catch {}
  }

  computePopularPosts(limit = 5) {
    const withStats = (this.posts || []).map((p) => ({
      ...p,
      views: this.getViewCount(p.id),
      likes: 0, // reserved if you add likes later
    }));
    withStats.sort((a, b) => {
      if (b.views !== a.views) return b.views - a.views;
      if (b.likes !== a.likes) return b.likes - a.likes;
      return new Date(b.date) - new Date(a.date);
    });
    return withStats.slice(0, Math.min(limit, withStats.length));
  }

  renderPopular() {
    const list = document.getElementById("popularList");
    if (!list) return;
    const popular = this.computePopularPosts(5);
    if (popular.length === 0) {
      list.innerHTML = `<li class="text-sm text-gray-500 dark:text-gray-400">Belum ada data populer.</li>`;
      return;
    }
    list.innerHTML = popular
      .map(
        (p) => `
      <li>
        <a class="block py-2 text-blue-600 dark:text-blue-400 hover:underline truncate"
           onclick="blogSystem.openPost('${p.id}', true)">
          ${p.title}
        </a>
      </li>
    `
      )
      .join("");
  }
}

// Initialize the blog system when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.blogSystem = new BlogSystem();
});

// Add some utility CSS classes for line clamping
const style = document.createElement("style");
style.textContent = `
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .grid-mode {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
    }
`;
document.head.appendChild(style);
