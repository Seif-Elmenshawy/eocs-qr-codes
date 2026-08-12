"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongo";
import Participant from "@/models/participant";

const FIELDS = ["got_on_the_bus", "entered_uni", "ate", "left_uni"] as const;

export async function updateStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");
  const value = formData.get("value") === "true";

  if (!mongoose.isValidObjectId(id)) return;
  if (!(FIELDS as readonly string[]).includes(field)) return;

  await connectDB();
  await Participant.findByIdAndUpdate(id, { [field]: value });
  revalidatePath(`/data/${id}`);
}
