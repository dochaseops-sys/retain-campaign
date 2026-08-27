/**
 * Retain Social Growth Challenge - React 18 Admin Portal Entry
 */

import { AdminApp } from './AdminApp.js';

const html = window.htm ? window.htm.bind(React.createElement) : null;

function init() {
  const rootElement = document.getElementById('admin-react-root');
  if (rootElement && window.ReactDOM && html) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(html`<${AdminApp} />`);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
