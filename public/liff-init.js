/* A案用: /shop のときだけ CDN で LIFF を先読み・init。Order では実行しない。 */
(function(){
  var path = window.location.pathname;
  if (path.indexOf('/shop') === -1) return;
  var liffId = '2009034946-LkF5LngF';
  var s = document.createElement('script');
  s.charset = 'utf-8';
  s.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
  s.onload = function() {
    if (window.liff) {
      window.liff.init({ liffId: liffId }).then(function() {
        window.__LIFF_INIT_DONE__ = true;
        window.dispatchEvent(new Event('liff-init-done'));
      }).catch(function(e) {
        window.__LIFF_INIT_ERROR__ = (e && e.message) ? e.message : 'LIFF init failed';
        window.dispatchEvent(new Event('liff-init-done'));
      });
    }
  };
  document.head.appendChild(s);
})();
