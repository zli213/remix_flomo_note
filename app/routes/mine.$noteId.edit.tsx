import { ActionFunction, json, redirect } from "@remix-run/node";
import { prisma } from "~/prisma.server";

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const content = formData.get("content") as string;
  const noteId = params.noteId;
  if (!content) {
    throw new Response("Content is required", { status: 400 });
  }

  try {
    await prisma.note.update({
      where: { id: noteId },
      data: { content },
    });
    return json({ message: "Note updated" });
  } catch (error) {
    console.error("Failed to update note:", error);
    // Handle the error appropriately, maybe return a different response
    throw new Response("Failed to update note", { status: 500 });
  }
};
