export const ESTILOS = `
  @page { margin: 40px; }              /* 14 mm */
  * { box-sizing: border-box; }
  body {
    margin: 0; color: #191F29; font-size: 10px; line-height: 1.45;
    font-family: -apple-system, "Helvetica Neue", Roboto, sans-serif;
  }

  /* cabecera */
  .cabecera { display: flex; align-items: center; justify-content: space-between;
              border-bottom: 2px solid #1C469C; padding-bottom: 9px; margin-bottom: 14px; }
  .marca { display: flex; align-items: center; gap: 9px; }
  .marca-nombre { font-size: 16px; font-weight: 700; letter-spacing: 1px; color: #1C469C; }
  .marca-bajada, .cabecera-derecha { font-size: 8px; color: #717B8E; }
  .cabecera-derecha { text-align: right; line-height: 1.4; }

  /* identidad */
  .identidad { display: flex; justify-content: space-between; align-items: flex-start; gap: 18px; }
  .identidad h1 { font-size: 20px; margin: 0 0 5px; }
  .datos { font-size: 9px; color: #575F70; }
  .datos span { margin-right: 12px; }
  .sangre { border: 2px solid #B81E1E; border-radius: 6px; padding: 6px 10px;
            text-align: center; min-width: 62px; }
  .sangre b { display: block; font-size: 20px; color: #B81E1E; line-height: 1.1; }
  .sangre i { font-style: normal; font-size: 7px; letter-spacing: 1px; color: #B81E1E; }

  /* bloque del QR */
  .bloque-qr { display: flex; gap: 18px; align-items: center; margin: 14px 0;
               padding: 12px; border: 1px solid #E3E6ED; border-radius: 8px; }
  .bloque-qr img { width: 170px; height: 170px; display: block; }   /* 60 mm */
  .bloque-qr h3 { margin: 0 0 6px; font-size: 11px; }
  .bloque-qr p { margin: 0 0 5px; font-size: 9px; color: #575F70; }

  /* secciones y filas */
  section { margin-bottom: 14px; }
  h2 { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #717B8E;
       margin: 0 0 6px; border-bottom: 1px solid #E3E6ED; padding-bottom: 4px; }
  .fila { padding: 5px 0; border-bottom: 1px solid #E3E6ED; }
  .fila:last-child { border-bottom: none; }
  .cabeza { display: flex; align-items: baseline; gap: 8px; }
  .titulo { font-weight: 600; font-size: 11px; }
  .nota { margin: 2px 0 0; font-size: 8.5px; color: #575F70; }
  .chip { margin-left: auto; font-size: 7.5px; padding: 2px 6px; white-space: nowrap;
          border: 1px solid #CFD4DD; border-radius: 4px; color: #575F70; }

  /* Las alergias son lo unico con fondo: son lo primero que hay que ver, y
     llenar la hoja de fondos gasta tinta sin sumar legibilidad. */
  .alergia { background: #FEF1F1; border-bottom: none; border-radius: 4px;
             padding: 6px 8px; margin-bottom: 3px; }
  .alergia .chip { border-color: #B81E1E; color: #B81E1E; font-weight: 700; }
  .contacto .chip { font-size: 11px; font-weight: 700; border: none; color: #191F29; }

  .pie { margin-top: 18px; padding-top: 7px; border-top: 1px solid #E3E6ED;
         font-size: 7.5px; color: #717B8E; }

  /* El carnet va en su propia pagina a proposito: si estuviera en la primera,
     recortarlo destruiria la hoja de detalle. */
  .pagina-carnet { page-break-before: always; padding-top: 18px; }
  .carnet { width: 243px; height: 153px;          /* ISO ID-1: 85.6 x 54 mm */
            border: 1px dashed #CFD4DD; border-radius: 8px; padding: 10px;
            display: flex; gap: 10px; align-items: center; }
  .carnet img { width: 113px; height: 113px; }    /* 40 mm */
  .carnet-rotulo { font-size: 6.5px; letter-spacing: 1px; color: #1C469C; font-weight: 700; }
  .carnet-nombre { font-size: 10px; font-weight: 700; margin: 3px 0; }
  .carnet-dato { font-size: 7.5px; color: #575F70; }
  .carnet-sangre { font-size: 14px; font-weight: 700; color: #B81E1E; margin-top: 4px; }
`