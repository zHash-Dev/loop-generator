class footer extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        /* CSS TOTALMENTE INTEGRADO E ISOLADO */
        .zhash-footer {
          background: #1a1a1a;
          border-top: 2px solid #333;
          padding: 25px 20px;
          margin-top: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-sizing: border-box;
        }

        .zhash-footer-content {
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        /* No PC, os elementos ficam lado a lado */
        @media (min-width: 600px) {
          .zhash-footer-content {
            flex-direction: row;
          }
        }

        .zhash-copyright {
          font-size: 14px;
          color: #888;
          margin: 0;
        }

        .zhash-copyright span {
          color: #eee;
          font-weight: 600;
        }

        .zhash-footer-links {
          display: flex;
          gap: 15px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          margin: 0;
        }

        .zhash-footer-links a {
          color: #4caf50;
          text-decoration: none;
          transition: color 0.2s, transform 0.2s;
        }

        .zhash-footer-links a:hover {
          color: #00bcd4; /* O azul dos números do seu editor */
        }

        .zhash-footer-links span {
          color: #444;
          user-select: none;
        }
      </style>

      <footer class="zhash-footer">
        <div class="zhash-footer-content">
          <p class="zhash-copyright">
            © <span id="dynamic-year"></span> <span>zHash Dev</span>. All rights reserved.
          </p>
          <div class="zhash-footer-links">
            <a href="https://zhash-dev.github.io/">Hub</a>
            <span>|</span>
            <a href="https://zhash-dev.github.io/loop-generator/">Loop Gen</a>
            <span>|</span>
            <a href="https://zhash-dev.github.io/manifest-generator/">Manifest Gen</a>
          </div>
        </div>
      </footer>
    `;

    const yearSpan = this.querySelector("#dynamic-year");
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear().toString();
    }
  }
}


customElements.define('zhash-footer', footer);