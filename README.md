# 🏓 GUILLE vs BEER — Pong Multijugador

Pong en tiempo real con estética synthwave/arcade, servidor autoritativo y salas por URL.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite + TypeScript |
| Backend | Node.js + Express |
| Networking | Socket.IO (WebSockets) |
| Gráficos | Canvas 2D + WebGL (Star Nest shader) |

---

## Instalación y ejecución local

### 1. Prerequisitos

- Node.js ≥ 18
- npm ≥ 9

### 2. Instalar dependencias

```bash
npm run install:all
```

### 3. Agregar assets

Copiar los siguientes archivos a la carpeta `assets/` en la raíz del proyecto:

```
assets/
├── guille.png    ← sprite jugador 1
├── beer.png      ← sprite jugador 2
├── yeyeye.mp3    ← audio gol Guille
└── beer-time.mp3 ← audio gol Beer
```

### 4. Iniciar en modo desarrollo

```bash
npm run dev
```

- **Cliente:** http://localhost:5173
- **Servidor:** http://localhost:3001

---

## Cómo jugar

1. Abrí http://localhost:5173 en tu browser
2. Hacé clic en **CREAR SALA** — se genera un código único
3. Compartí el link con el segundo jugador
4. Cuando ambos estén conectados comienza la cuenta regresiva
5. **Primer jugador en llegar a 3 goles gana**

### Controles

| Jugador | Arriba | Abajo |
|---------|--------|-------|
| Guille (izquierda) | `W` | `S` |
| Beer (derecha) | `↑` | `↓` |

---

## Arquitectura

```
project/
├── assets/          ← sprites y audio
├── shared/          ← tipos TypeScript y constantes compartidas
│   ├── types.ts
│   └── constants.ts
├── server/          ← backend Node.js
│   └── src/
│       ├── index.ts        ← Express + Socket.IO
│       ├── RoomManager.ts  ← gestión de salas
│       └── GameRoom.ts     ← lógica de juego autoritativa
└── client/          ← frontend React
    └── src/
        ├── App.tsx
        ├── socket/         ← capa Socket.IO
        ├── components/     ← UI y canvas
        ├── hooks/          ← estado de juego
        └── audio/          ← sistema de audio
```

### Decisiones de diseño clave

- **Servidor autoritativo:** toda la física (pelota, colisiones, marcador) corre en el servidor. Los clientes solo envían inputs (`up`/`down`).
- **Game loop a 60 fps:** `setInterval` de 16ms en el servidor. El cliente renderiza con `requestAnimationFrame`.
- **WebGL shader:** Star Nest (Pablo Román Andrioli, MIT) corriendo en un canvas WebGL de fondo.
- **Audio procedural:** rebotes y fanfarrias generados con Web Audio API para no requerir assets adicionales.

---

## Despliegue en producción

### Variables de entorno

```bash
PORT=3001          # puerto del servidor (default: 3001)
NODE_ENV=production
```

### Build

```bash
npm run build   # compila server (tsc) y client (vite build)
npm start       # levanta el servidor Express que sirve el cliente compilado
```

El servidor en producción sirve los archivos estáticos del cliente desde `client/dist/` y los assets desde `assets/`.

### Railway / Render / Fly.io

1. Apuntar el root al directorio del proyecto
2. Build command: `npm run install:all && npm run build`
3. Start command: `npm start`
4. Exponer el puerto 3001 (o el que definas con `PORT`)

### Docker (opcional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm run install:all && npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

---

## Mecánicas

- La pelota acelera levemente con cada rebote (hasta `BALL_SPEED_MAX`)
- El ángulo de rebote depende de qué parte de la paleta golpea la pelota
- Partida a **3 goles**
- **Rematch** requiere que ambos jugadores voten

---

## Licencia

MIT
