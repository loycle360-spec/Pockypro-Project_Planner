# Architecture

`app` contains routes only. Screens call Zustand stores, stores coordinate repositories, repositories use parameterised SQLite statements, and domain functions live in `src/lib`. SQLite is the local source of truth. Schema migrations are append-only in `src/db/database.ts`.
