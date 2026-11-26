This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Docker (local)

Requisitos: Docker + Docker Compose. La app usa el Firestore real (`bday-ad1e0`): confirmar asistencia escribe en producción.

```bash
cp .env.example .env          # definir ADMIN_PASSWORD (y WEB_PORT / WEB_DEV_PORT si 3000/3001 están ocupados)

# Producción (build standalone)
docker compose up -d --build web               # http://localhost:${WEB_PORT:-3000}

# Desarrollo con hot-reload (monta el código)
docker compose --profile dev up --build web-dev  # http://localhost:${WEB_DEV_PORT:-3001}

docker compose logs -f web
docker compose --profile dev down
```

> Usar `localhost` (no la IP de la LAN): en producción la cookie `admin-session` es `Secure` y el navegador solo la acepta por HTTP en localhost.

### Panel de administración

`/admin` (login con `ADMIN_PASSWORD`) edita sin recompilar: fecha del cumpleaños y año de nacimiento (la edad se calcula sola), textos de la home, la carta, la invitación personal, los eventos (almuerzo y after: fecha, comida, ubicación), los invitados y la lista de regalos.

- Se guarda en `config.json` dentro del volumen `bday-data` (`/app/data`); sobrevive a rebuilds. En el perfil dev vive en `./data/` (ignorado por git).
- La primera vez se crea solo con el contenido que traía el código (`src/lib/config/seed.ts`).
- La sesión es un token firmado con `SESSION_SECRET` (definilo en `.env`); la cookie nunca lleva la contraseña.
- Las confirmaciones de asistencia siguen en Firestore.

Backup / restore del contenido:

```bash
docker compose cp web:/app/data/config.json ./config.backup.json
docker compose cp ./config.backup.json web:/app/data/config.json
```

### Tests E2E contra el contenedor

```bash
docker run --rm --network host --ipc=host \
  -v "$PWD":/work -v bday-e2e-nm:/work/node_modules -w /work \
  -e PLAYWRIGHT_BASE_URL=http://localhost:3000 -e CI=1 \
  mcr.microsoft.com/playwright:v1.49.1-jammy \
  sh -c 'npm ci && npx playwright test'
```

Con `PLAYWRIGHT_BASE_URL` seteada, Playwright no levanta `npm run dev` y testea contra ese server.

Resultado de la última verificación: [`DOCKER_VERIFY_REPORT.md`](DOCKER_VERIFY_REPORT.md).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
