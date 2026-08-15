import "dotenv/config";
import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import QRCode from "qrcode";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoUri = process.env.MONGODB_URI ?? process.env.MONGODB_URL;

const requiredEnv = ["SMTP_HOST", "EMAIL_FROM", "BASE_URL"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing ${key}. Add it to your environment before running the email script.`);
  }
}
if (!mongoUri) {
  throw new Error("Missing MongoDB connection string. Set MONGODB_URI or MONGODB_URL.");
}

const BASE_URL = process.env.BASE_URL.replace(/\/+$/, "");
const FROM = process.env.EMAIL_FROM;
const SUBJECT = process.env.EMAIL_SUBJECT ?? "Your EOCS QR Code";
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_SECURE = String(process.env.SMTP_SECURE ?? "").toLowerCase() === "true";

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const toIndex = args.indexOf("--to");
const overrideRecipient = toIndex !== -1 ? args[toIndex + 1] : undefined;

const participantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    id_card: { type: String, required: true },
    email: { type: String, required: false },
    got_on_the_bus: { type: Boolean, required: true },
    entered_uni: { type: Boolean, required: true },
    ate: { type: Boolean, required: true },
    left_uni: { type: Boolean, required: true },
  },
  { collection: "Participant" }
);

const Participant = mongoose.models.Participant || mongoose.model("Participant", participantSchema, "Participant");

function loadTemplate() {
  const templatePath = path.join(path.dirname(fileURLToPath(import.meta.url)), "email-template.html");
  return fs.readFileSync(templatePath, "utf8");
}

function renderTemplate(template, participant) {
  const link = `${BASE_URL}/data/${participant._id}`;
  const qrImg =
    '<img src="cid:qr@eocs-qr-codes" alt="QR code" width="220" height="220" style="display:block;margin:0 auto;border:0;" />';

  return template
    .replaceAll("{{name}}", participant.name ?? "")
    .replaceAll("{{id_card}}", participant.id_card ?? "")
    .replaceAll("{{link}}", link)
    .replaceAll("{{qr}}", qrImg);
}

function buildPlainText(participant) {
  return [
    `Hello ${participant.name ?? ""},`,
    "",
    "Your QR code is ready. Present it at the event entrance to check in.",
    "",
    `Or open this link as a backup: ${BASE_URL}/data/${participant._id}`,
  ].join("\n");
}

async function main() {
  const transporter = isDryRun
    ? null
    : nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

  await mongoose.connect(mongoUri);

  const participants = await Participant.find({ email: { $ne: "" } }).lean();
  const withEmail = participants.filter((p) => p.email);
  const withoutEmail = participants.filter((p) => !p.email);

  console.log(`Found ${participants.length} participant(s); ${withEmail.length} with an email, ${withoutEmail.length} without.`);
  if (withoutEmail.length > 0) {
    console.log(`Skipping (no email): ${withoutEmail.map((p) => p.id_card ?? p._id).join(", ")}`);
  }

  if (withEmail.length === 0) {
    console.log("Nothing to send.");
    return;
  }

  const template = loadTemplate();
  const results = { sent: 0, skipped: 0, failed: 0 };

  for (const participant of withEmail) {
    const to = overrideRecipient ?? participant.email;
    const qrBuffer = await QRCode.toBuffer(`${BASE_URL}/data/${participant._id}`, {
      type: "png",
      width: 512,
      margin: 2,
    });

    const html = renderTemplate(template, participant);
    const text = buildPlainText(participant);

    if (isDryRun) {
      console.log(`[dry-run] would email ${to} (${participant.name}) -> ${BASE_URL}/data/${participant._id}`);
      results.sent += 1;
      continue;
    }

    try {
      await transporter.sendMail({
        from: FROM,
        to,
        subject: SUBJECT,
        text,
        html,
        attachments: [{ filename: "qr-code.png", content: qrBuffer, cid: "qr@eocs-qr-codes" }],
      });
      results.sent += 1;
      console.log(`Sent to ${to} (${participant.name})`);
    } catch (error) {
      results.failed += 1;
      console.error(`Failed for ${to} (${participant.name}): ${error.message}`);
    }
  }

  console.log(`Done. Sent: ${results.sent}, failed: ${results.failed}.`);

  if (results.failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    console.error("Email script failed:", error);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
