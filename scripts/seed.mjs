import "dotenv/config";
import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoUri = process.env.MONGODB_URI ?? process.env.MONGODB_URL;

if (!mongoUri) {
  throw new Error("Missing MongoDB connection string. Set MONGODB_URI or MONGODB_URL before running the seed script.");
}

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
  {
    collection: "Participant",
  }
);

const Participant = mongoose.models.Participant || mongoose.model("Participant", participantSchema, "Participant");

const seedParticipants = [
  {
    name: "Sample Participant",
    id_card: "INITIAL-0001",
    email: "participant@example.com",
    got_on_the_bus: false,
    entered_uni: false,
    ate: false,
    left_uni: false,
  },
];

async function seedDatabase() {
  await mongoose.connect(mongoUri);

  for (const participant of seedParticipants) {
    await Participant.updateOne(
      { id_card: participant.id_card },
      { $setOnInsert: participant },
      { upsert: true }
    );
  }

  console.log(`Seeded ${seedParticipants.length} participant(s).`);
}

seedDatabase()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    console.error("Seed script failed:", error);
    await mongoose.disconnect();
    process.exitCode = 1;
  });