import { ActionFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/prisma.server";

export const action = async (c: ActionFunctionArgs) => {
  const tagTitle = c.params.tagTitle as string;

  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.note.deleteMany({
        where: {
          tags: {
            some: {
              tag: {
                title: tagTitle,
              },
            },
          },
        },
      });

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
