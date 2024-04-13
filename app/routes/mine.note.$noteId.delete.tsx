import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { prisma } from "~/prisma.server";

export const action = async (c: ActionFunctionArgs) => {
  const noteId = c.params.noteId as string;
  try {
    // First delete the data in the NoteTag table
    await prisma.noteTag.deleteMany({
      where: {
        noteId,
      },
    });
    // Then delete the data in the Note table
    await prisma.note.delete({
      where: {
        id: noteId,
      },
    });
  } catch (error) {
    console.error("Failed to delete note:", error);
    // Handle the error appropriately, maybe return a different response
    throw new Response("Failed to delete note", { status: 500 });
  }
  return json({ message: "Note deleted" });
};
