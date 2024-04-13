import { ActionFunction, json, redirect } from "@remix-run/node";
import { prisma } from "~/prisma.server";

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const content = formData.get("content") as string;
  const noteId = params.noteId as string;
  const tagReg = new RegExp(/(#[\p{L}\p{N}_-]+(?:\/[\p{L}\p{N}_-]+)*)/gu);
  // This regular expression is used to find tag words starting with #
  const tagMatches = content.match(tagReg) || [];
  // Remove duplicate tags
  const uniqueTags = [...new Set(tagMatches.map((tag) => tag.slice(1)))];

  if (!content) {
    throw new Response("Content is required", { status: 400 });
  }

  try {
    // Delete all existing NoteTag connections
    await prisma.noteTag.deleteMany({
      where: { noteId },
    });
    // Update the note's content
    await prisma.note.update({
      where: { id: noteId },
      data: { content },
    });
    // Update the note's tags
    // For each unique tag, connect or create a Tag
    for (const title of uniqueTags) {
      const tag = await prisma.tag.upsert({
        where: { title },
        create: { title },
        update: { title },
      });
      await prisma.noteTag.create({
        data: {
          noteId: noteId,
          tagTitle: tag.title,
        },
      });
    }

    return json({ message: "Note updated" });
  } catch (error) {
    console.error("Failed to update note:", error);
    // Handle the error appropriately, maybe return a different response
    throw new Response("Failed to update note", { status: 500 });
  }
};
