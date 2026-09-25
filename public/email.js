// Assemble mailto links from data attributes so the address never appears in
// the HTML source. Links with their own text keep it; empty links get the address.
document.querySelectorAll('a[data-u][data-d]').forEach(function (a) {
  var addr = a.dataset.u + '@' + a.dataset.d;
  a.href = 'mailto:' + addr + (a.dataset.q || '');
  if (!a.textContent.trim()) a.textContent = addr;
});
