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

## Seed the database

Run the seed script once after setting `MONGODB_URI` or `MONGODB_URL`:

```bash
npm run seed
```

The script is idempotent and will only insert the sample participant if it does not already exist.

### On Vercel

The same script also runs automatically via the `postbuild` hook on every Vercel deployment. Because it uses `$setOnInsert` upserts, running it repeatedly is safe.

Requirements:

- `MONGODB_URI` must be set as a Vercel environment variable **and available during builds** (in Vercel's Environment Variables settings, the scope must not be "Runtime only"). If it's only available at runtime, the `postbuild` seed will fail and block the deployment.
- Your MongoDB host must allow connections from Vercel's build machines (e.g. allow `0.0.0.0/0` on Atlas, or add the listed build IPs).

## Send QR code emails

The email script reads participants from MongoDB, generates a QR code for each one
(encoding a link to `/data/<id>`), and sends the code to the participant's email
address via SMTP (nodemailer).

Prerequisites:

- The `Participant` collection must have an `email` field. Add the field to your
  documents or update them before running the script.
- SMTP credentials and a base URL in your environment:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
EMAIL_FROM="EOCS <no-reply@example.com>"
EMAIL_SUBJECT=Your EOCS QR Code
BASE_URL=http://localhost:3000
```

Run:

```bash
npm run send-emails
```

Useful options:

```bash
# Preview what would be sent without actually sending
npm run send-emails -- --dry-run

# Send everything to a single test address
npm run send-emails -- --to you@example.com
```

The email HTML lives in `scripts/email-template.html`. It supports the
placeholders `{{name}}`, `{{id_card}}`, `{{link}}`, and `{{qr}}` (the QR image).
Customize it to match your design.
