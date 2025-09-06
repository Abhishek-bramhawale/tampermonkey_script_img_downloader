// ==UserScript==
// @name         YouTube Thumbnail Direct Downloader (Desktop + Mobile)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Adds direct thumbnail download buttons on YouTube (desktop + mobile results) with HD priority
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  const style = document.createElement("style");
  style.textContent = `
    .yt-thumb-dl-btn {
      position: absolute;
      bottom: 6px;
      right: 6px;
      background: rgba(0,0,0,0.7);
      color: #fff;
      font-size: 40px;
      padding: 3px 6px;
      border-radius: 4px;
      cursor: pointer;
      z-index: 9999;
      user-select: none;
    }
  `;
  document.head.appendChild(style);

  // Always prefer maxres, then fallback
  async function downloadYouTubeThumbnail(videoId) {
    const qualities = ["maxresdefault", "sddefault", "hqdefault", "mqdefault", "default"];

    for (let q of qualities) {
      const url = `https://i.ytimg.com/vi/${videoId}/${q}.jpg`;
      try {
        const resp = await fetch(url, { method: "HEAD" });
        if (resp.ok) {
          const blobResp = await fetch(url);
          const blob = await blobResp.blob();
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `thumbnail-${videoId}-${q}.jpg`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          return; // stop once found
        }
      } catch (e) {
        console.warn("Not found:", url);
      }
    }
  }

  function addYouTubeButtons() {
    document.querySelectorAll("img").forEach((img) => {
      if (img.dataset.dlBtnAdded) return;

      const match = img.src.match(/\/vi\/([^\/\?]+)/);
      if (match) {
        const videoId = match[1];
        const btn = document.createElement("div");
        btn.className = "yt-thumb-dl-btn";
        btn.textContent = "↓";

        btn.onclick = (e) => {
          e.stopPropagation(); // prevent video play
          e.preventDefault();
          downloadYouTubeThumbnail(videoId);
        };

        const container = img.parentElement;
        if (!container) return;
        container.style.position = "relative";
        container.appendChild(btn);

        img.dataset.dlBtnAdded = "1";
      }
    });
  }

  function runScript() {
    addYouTubeButtons();
  }

  window.addEventListener("load", runScript);

  let timeout;
  const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(runScript, 500);
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
