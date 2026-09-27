// 首页「技术 / 小说」标签切换：纯客户端，作用域限定在传入容器内，不依赖全局查询。
// 状态写入 URL（?tab=tech|novel）并同步 localStorage，便于分享与回访。
export interface TabsHandle {
  destroy: () => void;
}

export function initTabs(container: HTMLElement): TabsHandle {
  const nav = container.querySelector<HTMLElement>(".tabs-nav");
  const nameToParam: Record<string, string> = {
    技术: "tech",
    小说: "novel",
  };
  const paramToName: Record<string, string> = {
    tech: "技术",
    novel: "小说",
  };

  function switchTab(tabName: string, isInit = false): void {
    if (!tabName) return;

    container
      .querySelectorAll(".nav-item")
      .forEach((el) => el.classList.remove("active"));
    container
      .querySelector(`.nav-item[data-tab="${cssEscape(tabName)}"]`)
      ?.classList.add("active");

    container.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.getAttribute("data-tab") === tabName);
    });

    try {
      localStorage.setItem("homeTab", tabName);
    } catch {
      /* 隐私模式等场景忽略 */
    }

    if (!isInit) {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", nameToParam[tabName] ?? "tech");
      history.replaceState(null, "", url.toString());
    }
  }

  const onNavClick = (event: Event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(".nav-item");
    if (target && container.contains(target)) {
      switchTab(target.getAttribute("data-tab") ?? "");
    }
  };

  const onReady = () => {
    const urlParam = new URLSearchParams(window.location.search).get("tab");
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("homeTab");
    } catch {
      saved = null;
    }
    const activeName = (urlParam && paramToName[urlParam]) || saved || "技术";
    switchTab(activeName, true);
  };

  nav?.addEventListener("click", onNavClick);
  onReady();

  return {
    destroy() {
      nav?.removeEventListener("click", onNavClick);
    },
  };
}

// 属性选择器中的值需转义中文等字符
function cssEscape(value: string): string {
  return window.CSS && CSS.escape ? CSS.escape(value) : value;
}
