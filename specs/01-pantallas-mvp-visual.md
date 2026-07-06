# Spec 01 — Pantallas del MVP (solo visual)

**Estado:** Implemented
**Dependencias:** Ninguna (primer spec del proyecto)
**Fecha:** 2026-07-01

**Objetivo:** Portar las 5 pantallas del prototipo (`references/templates/`) a rutas reales de Next.js App Router — Biblioteca, Detalle, Reproductor, Auth y Salón de la Fama — con el mismo diseño y comportamiento mock (sesión y puntajes en localStorage), sin implementar ningún motor de juego real.

## Alcance

**Incluye:**
- 5 rutas reales de App Router: `/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/auth`, `/salon-de-la-fama`.
- `Nav` (logo, links, contador de créditos, botón de sesión, menú mobile) y footer compartidos vía `app/layout.tsx`.
- Biblioteca: hero, buscador, chips de categoría, grid de `GameCard` con tilt al hover.
- Detalle: cover, tags, descripción, stat strip, acciones (jugar / volver), leaderboard lateral (top 10 con `seededScores`).
- Reproductor: HUD (jugador/puntaje/vidas/nivel), pantalla CRT con arena mock, pausa, fin de partida, modal de guardar puntaje (persistido en `localStorage` bajo `av_scores`).
- Auth: tabs iniciar sesión / crear cuenta, formulario mock, "jugar como invitado", botones sociales decorativos. Sesión persistida en `localStorage` bajo `av_user`.
- Salón de la Fama: tabs por juego, podio (top 3), tabla completa, fila "tu mejor marca" si hay sesión activa.
- Migración de datos mock (`GAMES`, `PLAYERS`, `seededScores`) a `lib/games.ts` en TypeScript.
- Estilos ya portados en `app/globals.css` / `app/layout.tsx` se reutilizan tal cual; solo se ajustan si algún componente lo requiere.

**No incluye:**
- Ningún motor de juego real (canvas, física, colisiones): el reproductor sigue siendo un mock con `setInterval` aleatorio, igual que el prototipo.
- Backend, API routes o base de datos: toda persistencia es `localStorage` en cliente.
- Autenticación real (OAuth de Google/GitHub, validación de contraseña, backend de usuarios).
- Tests automatizados (no hay suite configurada en el proyecto).
- SEO/metadata avanzada por ruta más allá de lo que ya provee `layout.tsx`.
- Cualquier feature nueva no presente en el prototipo (multijugador, perfiles, notificaciones, etc.) — quedaría fuera de este spec.

## Modelo de datos

Todo vive en `lib/games.ts`, tipado en TypeScript, como traducción directa de `references/templates/data.jsx`.

```typescript
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";

export interface Game {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string; // clase CSS del fondo (ej. "cover-bricks")
  color: "cyan" | "magenta" | "yellow" | "green";
  best: number;
  plays: string;
}

export const GAMES: Game[];
export const CATS: readonly ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"];
export const PLAYERS: string[];

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;
}

export function seededScores(seed: number, count?: number): ScoreRow[];
```

**Sesión de usuario: `SessionContext` (React Context), no un hook aislado.**

Se crea `context/SessionContext.tsx` con un `SessionProvider` (client component) montado una sola vez en `app/layout.tsx`, envolviendo `<Nav>` y `{children}`. Expone:

```typescript
interface Session {
  user: { name: string } | null;
  login: (user: { name: string } | null) => void; // null = invitado
  logout: () => void;
}
```

El provider lee/escribe `av_user` en `localStorage` una sola vez; Nav, Auth, Reproductor y Salón de la Fama consumen `useSession()` (hook que envuelve `useContext`) en vez de leer `localStorage` cada uno por su cuenta.

**Persistencia adicional en localStorage (fuera del Context, de escritura puntual):**

- `av_scores`: `Array<{ game: string; score: number; name: string; at: number }>` — historial de puntajes, escrito directamente desde el Reproductor al guardar (no necesita estar en Context porque ninguna otra pantalla lo lee en este spec).

## Plan de implementación

1. **Datos mock.** Crear `lib/games.ts` con `Game`, `GAMES`, `CATS`, `PLAYERS`, `ScoreRow` y `seededScores` (misma lógica pseudoaleatoria que el prototipo, tipada). El sistema sigue compilando y el scaffold por defecto sigue funcionando.

2. **Contexto de sesión.** Crear `context/SessionContext.tsx` con `SessionProvider` y hook `useSession()`, respaldado por `localStorage` (`av_user`). Sin UI todavía, solo la utilidad.

3. **Nav global.** Envolver `app/layout.tsx` con `<SessionProvider>` y montar `components/Nav.tsx` (client component) dentro, portando `nav.jsx`: logo, links activos por ruta (`usePathname`), contador de créditos, botón de sesión vía `useSession()`, menú mobile con backdrop. El layout ya renderiza Nav + footer en todas las rutas futuras.

4. **Biblioteca (`/`).** Reemplazar `app/page.tsx` por la pantalla `Library`: hero, buscador + chips de categoría (estado de cliente), grid de `GameCard` con efecto tilt, estado vacío "NO HAY RESULTADOS". Enlaza cada card a `/juegos/[id]`. La ruta `/` ya es funcional y navegable.

5. **Detalle (`/juegos/[id]`).** Crear `app/juegos/[id]/page.tsx` portando `detalle.jsx`: cover, tags, descripción, stat strip, acciones ("Jugar ahora" → `/juegos/[id]/jugar`, "Volver al vault" → `/`), leaderboard con `seededScores`. Manejar `id` inexistente con `notFound()`.

6. **Reproductor (`/juegos/[id]/jugar`).** Crear `app/juegos/[id]/jugar/page.tsx` portando `reproductor.jsx`: HUD, arena CRT mock, pausa/fin vía estado de cliente, modal de fin de partida con input de nombre y botón "Guardar puntuación" que persiste en `av_scores` vía `localStorage`. "Salir" vuelve a `/juegos/[id]`, "Volver al vault" vuelve a `/`.

7. **Auth (`/auth`).** Crear `app/auth/page.tsx` portando `auth.jsx`: tabs iniciar sesión/crear cuenta, formulario mock que llama a `useSession().login(...)` y redirige a `/`, botón de invitado (`login(null)`), botones sociales decorativos sin acción.

8. **Salón de la Fama (`/salon-de-la-fama`).** Crear `app/salon-de-la-fama/page.tsx` portando `salon.jsx`: tabs por juego, podio top 3, tabla completa, fila "tu mejor marca" condicionada a `useSession()`.

9. **Verificación cruzada.** Recorrer manualmente las 5 rutas en el navegador (`npm run dev`): login persiste entre pantallas, logout limpia estado, guardar puntaje aparece reflejado tras recargar, responsive/menú mobile funciona, `npm run lint` sin errores.

## Criterios de aceptación

- [ ] `npm run dev` sirve las 5 rutas sin errores: `/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/auth`, `/salon-de-la-fama`.
- [ ] `Nav` y footer aparecen en todas las rutas, con el link activo resaltado según la ruta actual (incluyendo `/juegos/[id]` y `/jugar` resaltando "Biblioteca").
- [ ] En `/`, el buscador y los chips de categoría filtran el grid en tiempo real; buscar algo sin resultados muestra el estado "NO HAY RESULTADOS".
- [ ] Click en una `GameCard` o su botón "JUGAR" navega a `/juegos/[id]` con el `id` correcto.
- [ ] `/juegos/[id]` con un `id` inexistente devuelve 404 (`notFound()`).
- [ ] En `/juegos/[id]`, "JUGAR AHORA" navega a `/juegos/[id]/jugar`; "VOLVER AL VAULT" navega a `/`.
- [ ] En `/juegos/[id]/jugar`, el puntaje incrementa automáticamente mientras no está pausado ni terminado; "PAUSA" detiene el incremento y cambia a "REANUDAR"; "FIN" abre el modal de fin de partida.
- [ ] En el modal de fin de partida, "GUARDAR PUNTUACIÓN" persiste una entrada en `localStorage` bajo `av_scores` y muestra el toast "PUNTUACIÓN GUARDADA_"; "JUGAR DE NUEVO" reinicia el estado del HUD; "VOLVER AL VAULT" navega a `/`.
- [ ] En `/auth`, enviar el formulario (cualquier tab) guarda `av_user` en `localStorage`, redirige a `/` y el Nav pasa a mostrar el nombre de usuario.
- [ ] En `/auth`, "JUGAR COMO INVITADO" limpia/deja `av_user` en `null`, redirige a `/`, y el Nav muestra "Iniciar Sesión".
- [ ] Click en el botón de sesión del Nav (cuando hay usuario) cierra sesión (borra `av_user`) sin navegar a otra ruta.
- [ ] En `/salon-de-la-fama`, cambiar de tab entre juegos actualiza podio y tabla; si hay sesión activa aparece la fila "TU MEJOR MARCA EN {juego}", y no aparece si no hay sesión.
- [ ] En viewport móvil, el botón hamburguesa abre el panel lateral de navegación con backdrop, y se cierra al elegir una opción o tocar el backdrop.
- [ ] `npm run lint` pasa sin errores nuevos.

## Decisiones tomadas y descartadas

- **Tailwind solo donde aporta valor (layout, espaciado, responsive); CSS global para todo lo demás.** Los efectos de fondo y animaciones del prototipo (CRT, scanlines, grilla de perspectiva, neon glow, variables de tema) requieren CSS que Tailwind no modela bien; replicarlos con clases arbitrarias sería ilegible. Por eso `globals.css` conserva las variables de tema y esos efectos complejos tal como ya se portaron, y Tailwind se usa para la maquetación de los componentes nuevos.
- **`SessionContext` compartido en el layout en vez de un hook con lecturas repetidas de localStorage.** Nav y Reproductor (y Auth y Salón de la Fama) necesitan leer/escribir el mismo usuario; sin contexto habría lecturas duplicadas y desincronizadas de `localStorage` entre componentes. El `SessionProvider` centraliza la fuente de verdad en memoria, respaldada por `localStorage`.
- **Rutas reales de App Router en vez de hash-routing con estado React.** El patrón de `location.hash` + JSON serializado es válido para una SPA vanilla como el prototipo HTML, pero es un antipatrón en App Router, que ya resuelve routing, deep-linking y `notFound()` de forma nativa.
- **Reproductor mock, sin motor de juego real.** El prototipo ya simula el juego con `setInterval` aleatorio (no hay canvas ni lógica real). Se mantiene ese mock porque el spec pide explícitamente "solo la parte visual, sin implementar ningún juego".
- **Sesión y puntajes en `localStorage`, sin backend.** No hay backend definido aún; introducir API routes o DB para esto sería infraestructura no solicitada.
- **Datos mock centralizados en `lib/games.ts`.** Evita duplicar `GAMES`/`PLAYERS`/`seededScores` entre Detalle, Biblioteca y Salón de la Fama.
- **Covers como clases CSS con gradientes, sin imágenes reales.** No se pidieron portadas reales; el CSS ya está portado en `globals.css`.
- **Botones sociales (Google/GitHub) decorativos.** Fuera de alcance de un MVP "solo visual"; no hay integración OAuth real.
