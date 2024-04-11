import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { prisma } from "~/prisma.server";

export const action = async (c: ActionFunctionArgs) => {
  const noteId = c.params.noteId as string;
  await prisma.note.delete({
    where: {
      id: noteId,
    },
  });
  return json({ message: "Note deleted" });
};
