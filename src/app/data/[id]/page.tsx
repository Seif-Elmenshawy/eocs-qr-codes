import { connectDB } from "@/lib/mongo";
import { notFound } from "next/navigation";
import Participant from "@/models/participant";
import mongoose from "mongoose";
import CheckInPanel from "./checkin";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DataPage({ params }: PageProps) {
  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    notFound();
  }

  await connectDB();

  let participant;
  try {
    participant = await Participant.findById(id).lean();
  } catch {
    notFound();
  }

  if (!participant) {
    notFound();
  }

  return (
    <CheckInPanel
      participant={{
        id: String(participant._id),
        name: participant.name,
        gotOnTheBus: participant.got_on_the_bus,
        enteredUni: participant.entered_uni,
        ate: participant.ate,
        leftUni: participant.left_uni,
      }}
    />
  );
}
