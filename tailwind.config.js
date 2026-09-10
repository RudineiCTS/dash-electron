/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,html}',
    './index.html',
  ],
 theme: {
    extend: {
      fontFamily:{
          poppins:['Poppins','sans-serif'],
          inter:['Inter','-apple-system','BlinkMacSystemFont','"Segoe UI"','sans-serif']
      },
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
        general: {
          orange:     '#fb923c', // grifo da aba ativa (General.tsx)
          indigo:     '#312e81', // fundo do badge numerado quando a aba está ativa (General.tsx)
          badgeBg:    '#f3f4f6', // fundo do badge numerado quando a aba está inativa (General.tsx)
          border:     '#e5e7eb', // borda do nav de abas (General.tsx)
          textMuted:  '#9ca3af', // texto de aba inativa (General.tsx)
          textStrong: '#111827', // texto de aba ativa (General.tsx)
          // FieldSelectComponent (MetaSelectionHeader)
          labelText:      '#6b6b7a', // label dos selects (ex: "PERÍODO DE COMPETÊNCIA")
          selectText:     '#1c1c28', // valor selecionado
          chevron:        '#9a9aab', // seta do select
          cardBorder:     '#e4e4ec', // borda do card
          accent:         '#6e5ef2', // grifo superior do card
          divider:        '#ececf2', // linha divisória entre os selects
          buttonBorder:   '#dcdce6', // borda do botão "Copiar da competência anterior"
          buttonActiveBg: '#f1effe', // fundo do botão após copiar
          buttonText:     '#3d3d52', // texto do botão
          footerText:     '#8b8b9c', // texto "Lote atual: ..."
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
          bgAlternative: 'var(--bg-alternative)',
          secondaryBlue: 'var(--blue-seconday)',
          orange: 'var(--orange-seconday)',
          redflag: '#A60321',
          greenflag: '#16B84F'
         
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