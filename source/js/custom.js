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

  ready(() => {
    markCards();
    improveSearchA11y();

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
