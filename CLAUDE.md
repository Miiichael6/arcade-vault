# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Qué es esto

Arcade Vault: plataforma para jugar minijuegos online y competir por puntaje ("Salón de la Fama"). Es un proyecto Next.js (App Router) recién creado con `create-next-app` — `app/` todavía contiene el scaffold por defecto, sin features propias implementadas aún.

⚠️ Esta versión de Next.js (16.2.9) tiene cambios respecto a lo que conoces. Antes de escribir código, lee la guía relevante en `node_modules/next/dist/docs/` (organizada en `01-app/`, `02-pages/`, `03-architecture/`, `04-community/`). Presta atención a los avisos de deprecación.

## Comandos

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run start` — servidor de producción (requiere build previo)
- `npm run lint` — ESLint (flat config en `eslint.config.mjs`, basado en `eslint-config-next`)

No hay suite de tests configurada todavía.

## Spec Driven Design

El proyecto sigue el flujo de `/spec` y `/spec-impl` basado en https://github.com/Klerith/fernando-skills (instalable con `npx skills@latest add Klerith/fernando-skills`). Antes de implementar features grandes, prioriza ese flujo de specs si los skills están disponibles.

## `resources/templates/` — prototipo de referencia (NO es el código de la app)

Esta carpeta contiene un prototipo standalone en HTML + React 18 vía UMD/Babel-in-browser (sin build step, sin Next.js) que sirve como **referencia de diseño y comportamiento** para construir la app real en `app/`. No se ejecuta como parte del proyecto Next.js; es solo material de partida a portar/adaptar.

Estructura del prototipo:
- `Arcade Vault.html` — shell HTML que carga los scripts en orden de dependencia.
- `data.jsx` — datos mock de los juegos (`GAMES`: id, título, categoría, color de neón, mejor puntaje, etc.).
- `app.jsx` — componente raíz con routing manual vía `location.hash` (JSON serializado) y persistencia de sesión/puntajes en `localStorage` (`av_user`, `av_scores`). Pantallas: `biblioteca`, `detalle`, `player`, `auth`, `salon`.
- `nav.jsx` — barra de navegación.
- `biblioteca.jsx` — listado/grid de juegos (Library).
- `detalle.jsx` — vista de detalle de un juego (GameDetail).
- `reproductor.jsx` — reproductor del juego (GamePlayer), reporta puntajes vía `onSaveScore`.
- `auth.jsx` — login/registro mock (no hay backend real, solo guarda nombre de usuario).
- `salon.jsx` — Salón de la Fama / leaderboard (HallOfFame).
- `styles.css` — estética retro/neón (variables CSS, glow, tipografía pixel `Press Start 2P` + monoespaciada).

Al portar esto a Next.js: reemplazar el routing por hash con App Router real (rutas en `app/`), reemplazar `localStorage` por la estrategia de persistencia que se defina (server actions / API / DB), y convertir los componentes de React UMD a componentes de cliente/servidor según corresponda.
