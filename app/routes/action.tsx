import { ActionFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/prisma.server";

export const action = async (c: ActionFunctionArgs) => {
  const formData = await c.request.formData();
  const content = formData.get("content") as string;
  const userId = formData.get("userId") as string;
  // get all tags start with #
  const tagReg = new RegExp(/(#[\p{L}\p{N}_-]+(?:\/[\p{L}\p{N}_-]+)*)/gu);
  const tags = content.match(tagReg)?.map((tag) => tag.slice(1));
  if (!content) {
    throw new Response("Content is required", { status: 400 });
  }
  // This regular expression is used to find tag words starting with #
  const tagMatches = content.match(tagReg) || [];
  // Remove duplicate tags
  const uniqueTags = [...new Set(tagMatches.map((tag) => tag.slice(1)))];

  const note = await prisma.note.create({
    data: {
      content,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
  // For each unique tag, connect or create a Tag
  for (const title of uniqueTags) {
    const tag = await prisma.tag.upsert({
      where: { title },
      create: { title },
      update: {},
    });

    // For each Tag, create a NoteTag to establish the relationship with the Note
    await prisma.noteTag.create({
      data: {
        noteId: note.id,
        tagTitle: tag.title,
      },
    });
  }

  return json({ message: "Note created" });
};
