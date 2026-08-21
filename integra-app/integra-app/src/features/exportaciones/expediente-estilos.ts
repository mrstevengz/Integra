//expo-print rinde a 72 PPI (Letter = 612x792 px), o sea 1px = 1pt y 1mm = 2.835px.

export const ESTILOS = `
  @page { margin: 40px; }
  * { box-sizing: border-box; }
  body {
    margin: 0; color: #191F29; font-size: 10px; line-height: 1.45;
    font-family: -apple-system, "Helvetica Neue", Roboto, sans-serif;
  }

  .cabecera { display: flex; align-items: flex-end; justify-content: space-between;
              border-bottom: 2px solid #1C469C; padding-bottom: 9px; margin-bottom: 16px; }
  .marca { font-size: 16px; font-weight: 700; letter-spacing: 1px; color: #1C469C; }
  .bajada { font-size: 8px; color: #717B8E; }
  .cabecera-derecha { text-align: right; font-size: 8px; color: #575F70; line-height: 1.4; }

  h1 { font-size: 20px; margin: 0 0 6px; }
  h2 { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #717B8E;
       margin: 0 0 6px; border-bottom: 1px solid #E3E6ED; padding-bottom: 4px; }
  section { margin-bottom: 16px; }

  .rejilla { display: flex; flex-wrap: wrap; gap: 4px 24px; font-size: 9px; color: #575F70; }
  .rejilla b { color: #191F29; font-weight: 600; }

  .fila { padding: 5px 0; border-bottom: 1px solid #E3E6ED; }
  .fila:last-child { border-bottom: none; }
  .cabeza { display: flex; align-items: baseline; gap: 8px; }
  .titulo { font-weight: 600; font-size: 11px; }
  .nota { margin: 2px 0 0; font-size: 8.5px; color: #575F70; }
  .chip { margin-left: auto; font-size: 7.5px; padding: 2px 6px; white-space: nowrap;
          border: 1px solid #CFD4DD; border-radius: 4px; color: #575F70; }
  .alergia .chip { border-color: #B81E1E; color: #B81E1E; font-weight: 700; }
  .contacto .chip { font-size: 11px; font-weight: 700; border: none; color: #191F29; }

  table { width: 100%; border-collapse: collapse; font-size: 9px; }
  th { text-align: left; font-size: 7.5px; text-transform: uppercase; letter-spacing: .5px;
       color: #717B8E; border-bottom: 1px solid #CFD4DD; padding: 4px 6px 4px 0; }
  td { padding: 4px 6px 4px 0; border-bottom: 1px solid #E3E6ED; }

  .vacio { font-size: 9px; color: #9BA2B0; font-style: italic; }
  .pie { margin-top: 20px; padding-top: 7px; border-top: 1px solid #E3E6ED;
         font-size: 7.5px; color: #717B8E; }
`