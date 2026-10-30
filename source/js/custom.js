/* Small enhancements that complement Butterfly's built-in interactions. */

(() => {
  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  const focusSearch = () => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      const input = document.querySelector('#local-search .local-search-input input');
      attempts += 1;
      if (input) {
        window.clearInterval(timer);
        input.focus();
      } else if (attempts >= 12) {
        window.clearInterval(timer);
      }
    }, 80);
  };

  const openSearch = () => {
    const trigger = document.querySelector('#search-button > .search');
    if (!trigger) return;
    trigger.click();
    focusSearch();
  };

  const markCards = () => {
    document.querySelectorAll('#recent-posts .recent-post-item').forEach((card, index) => {
      card.style.setProperty('--card-index', String(index));
    });
    window.requestAnimationFrame(() => document.documentElement.classList.add('page-ready'));
  };

  const improveSearchA11y = () => {
    const input = document.querySelector('#local-search .local-search-input input');
    const dialog = document.querySelector('#local-search');
    if (!input) return;

    input.setAttribute('aria-label', '搜索站内文章');
    input.setAttribute('autocomplete', 'off');
    if (dialog) {
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
    }
  };

  const fitEmbeddedDemos = () => {
    document.querySelectorAll('.clap-demo-frame').forEach((frame) => {
      let observer;
      let lastHeight = 0;

      const fit = () => {
        try {
          const document = frame.contentDocument;
          const root = document?.querySelector('.lab');
          const body = document?.body;
          if (!root || !body) return;

          const bodyStyle = document.defaultView.getComputedStyle(body);
          const padding =
            Number.parseFloat(bodyStyle.paddingTop) +
            Number.parseFloat(bodyStyle.paddingBottom);
          const height = Math.ceil(root.getBoundingClientRect().height + padding);

          if (height <= 0 || Math.abs(height - lastHeight) < 2) return;

          lastHeight = height;
          frame.style.height = `${height}px`;
        } catch {
          // Keep the CSS fallback if the embedded document is unavailable.
        }
      };

      frame.addEventListener('clap:fit', fit);
      frame.addEventListener('load', () => {
        fit();
        observer?.disconnect();

        const root = frame.contentDocument?.querySelector('.lab');
        if (root && 'ResizeObserver' in window) {
          observer = new ResizeObserver(fit);
          observer.observe(root);
        }
      });

      fit();
    });

    window.addEventListener('resize', () => {
      document.querySelectorAll('.clap-demo-frame').forEach((frame) => {
        frame.dispatchEvent(new Event('clap:fit'));
      });
    }, { passive: true });
  };

  ready(() => {
    markCards();
    improveSearchA11y();
    fitEmbeddedDemos();

    document.addEventListener('keydown', (event) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (isTyping) return;

      const isCommandK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      if (isCommandK || event.key === '/') {
        event.preventDefault();
        openSearch();
      }
    });

    const observer = new MutationObserver(() => {
      improveSearchA11y();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
