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
            DEFAULT: "#0d1117",   // fundo principal da página
            card:    "#161b22",   // fundo de cards / painéis
            hover:   "#21262d",   // hover de itens / bordas internas
            focus:    "#2ecb73",
          },
 
          // ── Texto ───────────────────────────────
          text: {
            DEFAULT:   "#e6edf3", // texto principal (branco suave)
            muted:     "#8b949e", // texto secundário (cinza)
            link:      "#58a6ff", // links azuis
          },
 
          // ── Bordas ──────────────────────────────
          border: "#30363d",
 
          // ── Botões ──────────────────────────────
          btn: {
            green:       "#238636", // botão verde "Code"
            "green-hover": "#2ea043", // verde hover
            dark:        "#21262d", // botão cinza escuro
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
          bg:          '#0d1117',
          surface:     '#161b22',
          card:        '#10171f',
          border:      'rgba(255,255,255,0.07)',
          text:        '#ffffff',
          muted:       '#8b949e',
          green:       '#3fb950',
          'green-dark':'#1a2e1a',
          badge:       '#21262d',
        }
      },
    },
  },
  plugins: [],
}