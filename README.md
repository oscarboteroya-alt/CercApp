# CercApp | Los servicios que necesitas, más cerca

Plataforma web desarrollada como parte del Seminario en Gestión de Software Ágil asistido por IA en la Fundación Escuela Tecnológica de Neiva (FET).

## Descripción del proyecto:
CercApp es una aplicación web responsiva diseñada bajo el enfoque *mobile-first* y *utility-first* utilizando **Tailwind CSS 4**. Su objetivo es conectar de forma rápida y segura a los ciudadanos de Neiva (Huila) con profesionales locales verificados (plomeros, electricistas, personal de aseo, etc.).

## Estructura del repositorio:
- `index.html`: Estructura principal de la interfaz y marcado semántico.
- `CSS/styles.css`: Estilos personalizados, directiva `@theme` y configuraciones visuales.
- `JS/app.js`: Lógica interactiva pura (validación de formularios, modales accesibles, tema oscuro y filtros por barrios).

---

## Bitácora de Prompts e Iteraciones:

| # | Prompt de ajuste enviado a la IA | Problema o requerimiento que buscaba resolver | ¿Funcionó? / Resultado |
|---|---|---|---|
| 1 | *"Ajusta el menú móvil en JavaScript para que se cierre automáticamente al hacer clic en cualquier enlace interno"* | El menú hamburguesa se quedaba abierto al navegar por las secciones en dispositivos móviles. | **Sí.** Se agregó el evento de cierre al hacer clic en los enlaces. |
| 2 | *"Valida en JavaScript que el campo de teléfono celular comience obligatoriamente por el número 3 y tenga exactamente 10 dígitos"* | Asegurar el formato correcto de los números de contacto para la ciudad de Neiva. | **Sí.** Se implementó una expresión regular para restringir y validar el campo. |
| 3 | *"Configura la directiva `@theme` en Tailwind CSS 4 para definir los colores personalizados `#0284C7` y `#F59E0B`"* | Aplicar la paleta de colores corporativa solicitada (60-30-10) de manera centralizada. | **Sí.** Se logró la integración de los tokens visuales institucionales. |
| 4 | *"Agrega un botón para alternar entre modo claro y modo oscuro guardando la preferencia del usuario en el navegador"* | Cumplir con el requisito de accesibilidad e interacción visual nocturna mediante `localStorage`. | **Sí.** El estado del tema se recuerda al recargar la página. |
| 5 | *"Haz que el formulario muestre un toast verde flotante de confirmación que desaparezca a los pocos segundos tras enviar con éxito"* | Proveer retroalimentación visual inmediata al usuario al registrar una solicitud de prueba. | **Sí.** Se integró un componente flotante animado y accesible. |
