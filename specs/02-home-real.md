# Spec 02 — Inicio (Home) real y reubicación de Biblioteca

**Estado:** Aprobado
**Dependencias:** Spec 01 (Pantallas del MVP visual) — reutiliza rutas, `SessionContext`, `Nav`, `lib/games.ts` ya existentes.
**Fecha:** 2026-07-06

**Objetivo:** Construir la pantalla de Inicio (landing) real portando `home.jsx` del prototipo a la ruta `/`, mover la Biblioteca (que hoy vive en `/`) a `/games`, y actualizar el Nav y las navegaciones que hoy tratan `/` como "el vault" para que apunten a `/games` — sin implementar todavía "Acerca de".

## Alcance

**Incluye:**
- Nueva pantalla Home/Inicio en la ruta `/`, portando `references/templates/home-about/home.jsx`: hero con CTAs ("EXPLORAR JUEGOS" → `/games`, "CREAR CUENTA" → `/auth`), sección "¿Por qué Arcade Vault?" (feature grid), vitrina de juegos (mini-rail con `GAMES.slice(0, 6)` desde `lib/games.ts`, cada mini-card navega a `/juegos/[id]`), sección de stats, "Actividad en vivo" (ticker de puntuaciones + top jugadores, datos mock hardcodeados igual que el prototipo), sección de precios ("Plan único $0/siempre"), CTA final ("INSERTAR MONEDA" → `/games`).
- Silhouettes decorativas (`FloatingSilhouettes`, SVGs pixel-art) y animación de scroll-reveal (`IntersectionObserver` sobre `.reveal`) portadas tal cual.
- Migración del contenido actual de `app/page.tsx` (Biblioteca) a la nueva ruta `app/games/page.tsx`, sin cambios funcionales.
- Actualización de `components/Nav.tsx`: nuevo link "Inicio" → `/`; el link "Biblioteca" pasa a apuntar a `/games`; "Salón de la Fama" sin cambios; sin link "Acerca de" (se agrega en un spec futuro).
- Actualización de las 4 navegaciones que hoy usan `/` como "volver al vault" para que apunten a `/games`: botón "VOLVER AL VAULT" en Detalle (`app/juegos/[id]/page.tsx`), botón "VOLVER AL VAULT" en Reproductor (`app/juegos/[id]/jugar/page.tsx`), link inferior en Salón de la Fama (`app/salon-de-la-fama/page.tsx`), y el `router.push("/")` tras iniciar sesión/jugar como invitado en Auth (`app/auth/page.tsx`).
- Estilos CSS necesarios para Home (secciones `home-*`, `mini-card`, `feature-*`, `activity-*`, `pricing-*`, animaciones de las silhouettes, `.reveal`/`.in`) portados desde `references/templates/home-about/styles.css` hacia `app/globals.css`.

**No incluye:**
- La pantalla "Acerca de" (`about.jsx`) ni su formulario de contacto — spec futuro.
- Conectar "Actividad en vivo" o "Precios" a datos reales/backend — siguen siendo mock hardcodeado, igual que el prototipo.
- Redirección automática o alias de `/` hacia `/games` para bookmarks antiguos — no hay usuarios reales todavía.
- Cambios funcionales a Detalle, Reproductor, Auth o Salón de la Fama más allá de actualizar el destino de sus botones/redirects mencionados arriba.
- Tests automatizados (no hay suite configurada en el proyecto).

## Modelo de datos

Esta spec no introduce estructuras de datos nuevas ni cambios a `lib/games.ts`. La vitrina de juegos en Home reutiliza `GAMES` (ya existente). Las secciones de "Actividad en vivo" (ticker de puntuaciones, top jugadores) y "Precios" usan arrays literales hardcodeados dentro del propio componente `Home`, igual que en el prototipo (`home.jsx`) — no se persisten ni se leen desde `lib/games.ts` ni `localStorage`.

## Plan de implementación

1. **Mover Biblioteca a `/games`.** Crear `app/games/page.tsx` con el contenido actual de `app/page.tsx` (hero, buscador, chips de categoría, grid de `GameCard`), sin cambios funcionales. `/games` queda funcional y idéntica a la actual `/`.

2. **Estilos de Home.** Portar a `app/globals.css` las clases necesarias desde `references/templates/home-about/styles.css`: `home`, `home-hero`, `home-silos`/`silo` (s1–s8 y sus animaciones), `hero-eyebrow`, `home-title` (`line-1/2/3`), `home-sub`, `home-ctas`, `hero-scroll`, `home-section`, `section-head`, `kicker`, `section-title`, `section-rule`, `feature-grid`/`feature-card`/`ft-icon`/`ft-title`/`ft-desc`, `mini-rail`/`mini-card`/`mini-cover`/`mini-meta`/`mini-title`/`mini-cat`, `home-stats`/`stats-inner`/`stat-block`/`stat-n`/`stat-u`/`stat-s`, `activity-grid`/`activity-card`/`ac-head`/`ac-title`/`ticker`/`tick-row`/`tk-*`/`lb-link`/`top-list`/`top-row`/`tp-*`, `pricing-grid`/`price-card`/`pc-*`/`pricing-faq`/`faq-*`, `home-final`/`final-title`/`final-cta`/`final-tag`, y `.reveal`/`.in`. El sistema sigue compilando; sin uso visible todavía.

3. **Componente Home (`app/page.tsx`).** Reemplazar el contenido actual de `app/page.tsx` (que se movió en el paso 1) por la pantalla `Home`, portando `home.jsx`: hook de scroll-reveal (`useReveal`, `IntersectionObserver` sobre `.reveal`), `FloatingSilhouettes`, hero con CTAs (`EXPLORAR JUEGOS` → `/games`, `CREAR CUENTA` → `/auth`), sección de features (`FeatureIcon` + feature grid), vitrina de juegos (`MiniCard` con `GAMES.slice(0, 6)`, click navega a `/juegos/[id]`), sección de stats, "Actividad en vivo" (ticker + top jugadores con datos mock hardcodeados, "VER SALÓN →" hacia `/salon-de-la-fama`), sección de precios ("EMPEZAR GRATIS →" hacia `/auth`), CTA final (hacia `/games`). Todo como client component, con `Link`/`useRouter` de Next en vez de la función `navigate` del prototipo. `/` ya sirve la nueva landing.

4. **Actualizar `components/Nav.tsx`.** Agregar link "Inicio" → `/` (activo cuando `pathname === "/"`); cambiar el link "Biblioteca" para que apunte a `/games` (activo cuando `pathname === "/games"` o `pathname.startsWith("/juegos")`, igual que hoy); "Salón de la Fama" sin cambios; sin link "Acerca de". Replicar en el panel mobile.

5. **Actualizar navegaciones "volver al vault".** Cambiar `href="/"` → `href="/games"` en Detalle y Salón de la Fama; cambiar `router.push("/")` → `router.push("/games")` en Reproductor y en Auth (tanto login/registro como invitado).

6. **Verificación cruzada.** Recorrer manualmente en el navegador (`npm run dev`): `/` muestra la nueva landing con silhouettes, scroll-reveal y CTAs funcionando; `/games` muestra la Biblioteca igual que antes; Nav resalta "Inicio" en `/` y "Biblioteca" en `/games` y en detalle/reproductor; los 4 botones "volver al vault"/redirect llevan a `/games`; `npm run lint` sin errores nuevos.

## Criterios de aceptación

- [ ] `npm run dev` sirve `/` con la nueva pantalla Home (hero, silhouettes, secciones de features, vitrina de juegos, stats, actividad en vivo, precios, CTA final).
- [ ] `/games` sirve la Biblioteca (buscador, chips de categoría, grid de `GameCard`) con el mismo comportamiento que tenía antes en `/`.
- [ ] En Home, el scroll-reveal (`.reveal`) activa la clase `.in` al hacer scroll hasta cada sección.
- [ ] En Home, "▶ EXPLORAR JUEGOS" y "VER TODOS LOS JUEGOS →" y el CTA final "INSERTAR MONEDA →" navegan a `/games`; "✦ CREAR CUENTA" y "EMPEZAR GRATIS →" navegan a `/auth`.
- [ ] En Home, cada `MiniCard` de la vitrina de juegos navega a `/juegos/[id]` con el `id` correcto; "VER SALÓN →" navega a `/salon-de-la-fama`.
- [ ] El Nav muestra "Inicio", "Biblioteca" y "Salón de la Fama" (sin "Acerca de"), tanto en desktop como en el panel mobile.
- [ ] El link "Inicio" del Nav está resaltado como activo solo en `/`; el link "Biblioteca" está resaltado como activo en `/games`, `/juegos/[id]` y `/juegos/[id]/jugar`.
- [ ] En Detalle (`/juegos/[id]`), "VOLVER AL VAULT" navega a `/games`.
- [ ] En Reproductor (`/juegos/[id]/jugar`), el botón "Volver al vault" del modal de fin de partida navega a `/games`.
- [ ] En Salón de la Fama, el link inferior navega a `/games`.
- [ ] En Auth, tanto enviar el formulario (login/registro) como "JUGAR COMO INVITADO" redirigen a `/games` (no a `/`).
- [ ] `npm run lint` pasa sin errores nuevos.

## Decisiones tomadas y descartadas

- **Biblioteca se mueve a `/games` (no `/biblioteca` ni `/juegos`).** Decisión explícita del usuario, priorizada sobre la recomendación inicial (`/biblioteca`, por consistencia con el label del Nav) y sobre `/juegos` (que ya usa el patrón `/juegos/[id]`).
- **Los botones "volver al vault" y los redirects de Auth apuntan a `/games`, no a `/`.** Semánticamente esos botones significan "volver a jugar", no "ir a la landing". Mantiene el comportamiento actual, solo cambia la URL destino.
- **"Acerca de" se omite por completo del Nav (no placeholder ni link deshabilitado).** La pantalla no existe todavía; un link roto o deshabilitado sería peor UX que no mostrarlo. Se agrega en un spec futuro junto con la pantalla.
- **Las secciones "Actividad en vivo" y "Precios" se portan tal cual, con datos mock hardcodeados dentro del componente.** Igual que el resto del prototipo (ver Spec 01: reproductor mock, sesión/puntajes en localStorage) — no hay backend definido aún; introducir datos reales sería infraestructura no solicitada.
- **No hay redirección ni alias de `/` hacia `/games`.** No hay usuarios reales ni bookmarks que romper todavía; agregar un redirect sería complejidad no solicitada.
- **Home vive como un único client component en `app/page.tsx`, con subcomponentes locales no exportados (`FloatingSilhouettes`, `MiniCard`, `FeatureIcon`).** Replica la estructura del prototipo (`home.jsx`) y el patrón ya usado en la Biblioteca actual (todo en un archivo, sin fragmentar prematuramente en `components/`).
