This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Authentication and database setup

Authentication requires `DATABASE_URL` and an `AUTH_SECRET` containing at least 32 random bytes. Keep both values in the local environment or deployment secret store; do not commit them. Next.js loads `.env.local`; Prisma CLI commands load a root `.env` file or variables exported in the shell. For example, generate a secret with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Apply the Prisma schema to a development database, then seed the first administrator and the sample exam:

```sh
npx prisma db push
npm run seed:admin
```

When updating an existing development database after schema changes, run `npx prisma db push` again before starting the app.

Before running the seed command, provide `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the environment. In PowerShell:

```powershell
$env:ADMIN_NAME = "Seen Administrator"
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "use-a-unique-password-of-at-least-12-characters"
npm run seed:admin
```

The password must contain 12–128 characters. Running the seed again resets the password and role for that administrator account. The seed also creates the published `sample` exam used by the home-page test link. Store administrator credentials securely and never commit them.

Student accounts can register at `/auth`. Examiners are created by an administrator in the protected dashboard; administrator accounts are provisioned only by the seed command. Passwords are hashed with bcrypt; existing scrypt password hashes are upgraded to bcrypt after a successful login. Sessions use an eight-hour signed, HttpOnly, SameSite=Strict cookie, and role checks use the current database record. Legacy accounts without a password hash must have their password reset by an administrator before they can sign in.

Login attempts are recorded with the normalized email, outcome, and timestamp; records older than 90 days are removed during login processing. IP addresses and passwords are not stored in the audit log.

The admin dashboard, admin APIs, test start/submission APIs, and AI endpoints enforce server-side authorization. Configure `GEMINI_API_KEY` to enable AI question generation and `OPENAI_API_KEY` to enable text-to-speech; both upstream requests have a 30-second timeout. Reading passages entered or generated in the admin question form are saved with the question. Test answer keys remain in the database and are graded on submission. Certificate pages display only completed certificates found in the database; unknown codes are not treated as valid.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
