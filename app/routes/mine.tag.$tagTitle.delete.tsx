import { ActionFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/prisma.server";

export const action = async (c: ActionFunctionArgs) => {
  const tagTitle = c.params.tagTitle as string;
  try {
    await prisma.$transaction(async (prisma) => {
      // Step 1: Delete all related NoteTag entries
      await prisma.noteTag.deleteMany({
        where: {
          tagTitle: tagTitle,
        },
      });

      // Step 2: Check for notes that are now without any tags
      const potentiallyOrphanedNotes = await prisma.note.findMany({
        where: {
          tags: {
            every: {
              tagTitle: {
                not: tagTitle,
              },
            },
          },
        },
        include: {
          tags: true,
        },
      });

      const notesToDelete = potentiallyOrphanedNotes.filter(
        (note) => note.tags.length === 0
      );

      for (const note of notesToDelete) {
        await prisma.note.delete({
          where: {
            id: note.id,
          },
        });
      }

      // Step 3: Delete the Tag itself
      await prisma.tag.delete({
        where: {
          title: tagTitle,
        },
      });
    });

    return json({ message: "tags and related notes deleted" });
  } catch (error) {
    console.error("Error deleting tag", error);
    return json({ error: "Error deleting tag" }, { status: 500 });
  }
};
