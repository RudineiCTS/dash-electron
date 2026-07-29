/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,html}',
    './index.html',
  ],
 theme: {
    extend: {
      colors: {
        github: {
          // ── Fundos ──────────────────────────────
          bg: {
            DEFAULT: "var(--gh-bg)",       // fundo principal da página
            card:    "var(--gh-bg-card)",  // fundo de cards / painéis
            hover:   "var(--gh-bg-hover)", // hover de itens / bordas internas
            focus:   "var(--gh-bg-focus)",
          },

          // ── Texto ───────────────────────────────
          text: {
            DEFAULT:   "var(--gh-text)",       // texto principal
            muted:     "var(--gh-text-muted)", // texto secundário (cinza)
            link:      "var(--gh-text-link)",  // links
            linkAlt:    "var(--gh-text-linkAlt)",
            textSecond: ' --btn-secondary-text: #1a2138',
            textSecondHover:  '--btn-secondary-hover-bg: #f3f4f6'
          },

          // ── Bordas ──────────────────────────────
          border: "var(--gh-border)",

          // ── Botões ──────────────────────────────
          btn: {
            green:       "var(--gh-btn-green)",       // botão/destaque de marca
            "green-hover": "var(--gh-btn-green-hover)", // destaque hover
            dark:        "var(--gh-btn-dark)",        // botão cinza escuro
          },

          // ── Linguagens (barra de linguagens) ────
          lang: {
            typescript: "#3178c6",
            javascript: "#f1e05a",
            css:        "#f78166",
            html:       "#e34c26",
          },
        },
         other: {
          bg:          'var(--other-bg)',
          surface:     'var(--other-surface)',
          card:        'var(--other-card)',
          border:      'var(--other-border)',
          text:        'var(--other-text)',
          muted:       'var(--other-muted)',
          green:       'var(--other-green)',
          'green-dark':'var(--other-green-dark)',
          badge:       'var(--other-badge)',
          hoverbg:     'var(--btn-secondary-hover-bg)',
          accent: 'var(--accent)',
          bgAlternative: 'var(--bg-alternative)'
        }
      },
      keyframes:{
        shimmer:{
          "100%": {transform: "translateX(100%)"}
        }
      }
    },
  },
  plugins: [],
}