document.addEventListener('error', event => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || !image.classList.contains('boot-logo')) return;
  const fallback = image.dataset.bootFallback;
  if (fallback) {
    delete image.dataset.bootFallback;
    image.src = fallback;
    return;
  }
  image.hidden = true;
}, true);
