(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const videos = [...document.querySelectorAll('video')];
  const visible = new WeakSet();
  const update = video => {
    if (document.hidden || reduced.matches || !visible.has(video)) {
      video.pause();
      return;
    }
    const sources = [...video.querySelectorAll('source[data-src]')];
    if (sources.length) {
      sources.forEach(source => { source.src = source.dataset.src; source.removeAttribute('data-src'); });
      video.load();
    }
    video.muted = true;
    video.play().catch(() => {}); // A poster remains visible if autoplay is blocked.
  };
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target);
    update(entry.target);
  }), {threshold: 0.01});
  videos.forEach(video => observer.observe(video));
  document.addEventListener('visibilitychange', () => videos.forEach(update));
  reduced.addEventListener('change', () => videos.forEach(update));
})();
