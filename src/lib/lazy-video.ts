// 第三方视频「点击才加载」：页面初始不插入 iframe、不发起第三方请求（见 ADR-0005）。
// 调用方只传入已校验的嵌入地址与封面；真正的 iframe 在用户点击后才创建。
export interface LazyVideoHandle {
  destroy: () => void;
}

export function initLazyVideos(root: ParentNode = document): LazyVideoHandle {
  const controllers: Array<() => void> = [];

  root.querySelectorAll<HTMLElement>(".video-lazy:not([data-ready])").forEach((frame) => {
    frame.setAttribute("data-ready", "");
    const button = frame.querySelector<HTMLButtonElement>(".video-play");

    const activate = () => {
      const src = frame.dataset.src;
      if (!src || frame.classList.contains("is-loaded")) return;

      const iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.title = frame.dataset.title ?? "嵌入视频";
      iframe.loading = "lazy";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

      frame.replaceChildren(iframe);
      frame.classList.add("is-loaded");
    };

    button?.addEventListener("click", activate);
    controllers.push(() => button?.removeEventListener("click", activate));
  });

  return {
    destroy() {
      controllers.forEach((off) => off());
    },
  };
}
