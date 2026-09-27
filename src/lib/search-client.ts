// 搜索客户端：首次打开面板时才拉取 /search-index.json，之后内存缓存。
// 匹配标题、标签与描述；index 的 url 已在构建期带好 base。
import { createOverlayPanel } from "./overlay-panel";

const COLLECTION_LABEL: Record<string, string> = {
  tech: "技术",
  media: "媒体",
  novel: "小说",
};

interface SearchItem {
  title: string;
  description: string;
  tags: string[];
  collection: string;
  url: string;
}

export function initSearch(root: HTMLElement): void {
  const trigger = root.querySelector<HTMLElement>(".search-icon");
  const panel = root.querySelector<HTMLElement>(".search-panel");
  const closer = root.querySelector<HTMLElement>(".close-search");
  const input = root.querySelector<HTMLInputElement>(".search-input");
  const resultBox = root.querySelector<HTMLElement>(".search-results");
  if (!trigger || !panel || !input || !resultBox) return;
  const results: HTMLElement = resultBox;

  let index: SearchItem[] | null = null;
  let inflight: Promise<SearchItem[]> | null = null;

  async function loadIndex(): Promise<SearchItem[]> {
    if (index) return index;
    if (!inflight) {
      inflight = fetch(`${import.meta.env.BASE_URL}search-index.json`)
        .then((response) => {
          if (!response.ok) throw new Error(`search index ${response.status}`);
          return response.json() as Promise<SearchItem[]>;
        })
        .then((data) => {
          index = data;
          return data;
        })
        .catch((error) => {
          inflight = null; // 允许下次重试
          throw error;
        });
    }
    return inflight;
  }

  const debounce = <A extends unknown[]>(fn: (...args: A) => void, wait: number) => {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: A) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  };

  function escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlight(text: string, query: string): string {
    if (!query) return escapeHtml(text);
    const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
    return escapeHtml(text).replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  function render(items: SearchItem[], query: string): void {
    if (items.length === 0) {
      results.innerHTML = `
        <div class="no-results">
          <p>没有找到与 “${escapeHtml(query)}” 相关的内容</p>
          <p style="font-size: var(--step--1); margin-top: 1rem; opacity: 0.7;">尝试更换关键词</p>
        </div>`;
      return;
    }

    const header = `<div class="search-results-header">找到 ${items.length} 个结果</div>`;
    const cards = items
      .map((item) => {
        const label = COLLECTION_LABEL[item.collection] ?? "内容";
        return `
          <div class="search-result-item">
            <div class="collection">${label}</div>
            <a href="${item.url}" style="text-decoration:none;color:inherit;">
              <h3>${highlight(item.title, query)}</h3>
            </a>
          </div>`;
      })
      .join("");
    results.innerHTML = `${header}<div class="search-results-grid">${cards}</div>`;
  }

  const onInput = debounce(async () => {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      results.innerHTML = "";
      return;
    }
    try {
      const data = await loadIndex();
      const matched = data.filter((item) => {
        return (
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      });
      render(matched, query);
    } catch {
      results.innerHTML = `<div class="no-results"><p>搜索索引加载失败，请稍后重试</p></div>`;
    }
  }, 300);

  input.addEventListener("input", onInput);

  createOverlayPanel({
    trigger,
    panel,
    closers: closer ? [closer] : [],
    focusTarget: input,
    onOpen: () => {
      void loadIndex().catch(() => {});
    },
  });
}
