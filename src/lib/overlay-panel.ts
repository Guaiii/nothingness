// 抽屉/遮罩面板交互的统一 module（架构评审候选②）。
// 三个 adapter（文章目录、小说目录、搜索面板）共享同一实现，各自只传入元素。
// 作用域在 root 内，不使用全局 id 查询，因此同页多实例互不串扰。

export interface OverlayPanelOptions {
  /** 触发按钮（点击切换开合） */
  trigger: HTMLElement;
  /** 面板本体，开合时切换 active */
  panel: HTMLElement;
  /** 遮罩元素；搜索这类「面板即遮罩」的场景可省略，改为点面板空白处关闭 */
  overlay?: HTMLElement | null;
  /** 额外的关闭按钮 */
  closers?: HTMLElement[];
  /** 打开时聚焦的元素（如搜索输入框） */
  focusTarget?: HTMLElement | null;
  /** 视口宽度超过该值时自动收起（桌面端复位） */
  closeAbove?: number;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface OverlayPanelHandle {
  open: () => void;
  close: () => void;
  toggle: () => void;
  get isOpen(): boolean;
  destroy: () => void;
}

export function createOverlayPanel(options: OverlayPanelOptions): OverlayPanelHandle {
  const { trigger, panel, overlay, closers = [], focusTarget, closeAbove, onOpen, onClose } = options;

  let openState = false;
  let lastFocused: HTMLElement | null = null;

  function open(): void {
    if (openState) return;
    openState = true;
    lastFocused = document.activeElement as HTMLElement | null;
    panel.classList.add("active");
    overlay?.classList.add("active");
    trigger.classList.add("active");
    trigger.setAttribute("aria-expanded", "true");
    lockScroll();
    focusTarget?.focus();
    onOpen?.();
  }

  function close(): void {
    if (!openState) return;
    openState = false;
    panel.classList.remove("active");
    overlay?.classList.remove("active");
    trigger.classList.remove("active");
    trigger.setAttribute("aria-expanded", "false");
    unlockScroll();
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    onClose?.();
  }

  function toggle(): void {
    openState ? close() : open();
  }

  function onTriggerClick(event: Event): void {
    event.preventDefault();
    toggle();
  }

  function onDismissClick(event: Event): void {
    // 无独立遮罩时（搜索），点击面板自身空白处关闭
    if (!overlay && event.target === panel) close();
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") close();
  }

  function onResize(): void {
    if (closeAbove !== undefined && window.innerWidth > closeAbove) close();
  }

  // 嵌套计数：同一时刻可能有多个面板锁滚动，全部关闭才恢复
  let lockCount = 0;
  function lockScroll(): void {
    lockCount += 1;
    document.body.style.overflow = "hidden";
  }
  function unlockScroll(): void {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) document.body.style.overflow = "";
  }

  trigger.addEventListener("click", onTriggerClick);
  overlay?.addEventListener("click", close);
  panel.addEventListener("click", onDismissClick);
  closers.forEach((el) => el.addEventListener("click", close));
  document.addEventListener("keydown", onKeydown);
  window.addEventListener("resize", onResize);

  return {
    open,
    close,
    toggle,
    get isOpen() {
      return openState;
    },
    destroy() {
      trigger.removeEventListener("click", onTriggerClick);
      overlay?.removeEventListener("click", close);
      panel.removeEventListener("click", onDismissClick);
      closers.forEach((el) => el.removeEventListener("click", close));
      document.removeEventListener("keydown", onKeydown);
      window.removeEventListener("resize", onResize);
      unlockScroll();
    },
  };
}
