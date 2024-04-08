import { ActionFunctionArgs, LoaderFunction, json } from "@remix-run/node";
import { prisma } from "~/prisma.server";

export const action: LoaderFunction = async (c: ActionFunctionArgs) => {
  const formData = await c.request.formData();
  const content = formData.get("content") as string;
  const noteId = formData.get("noteId") as string;
  if (!content) {
    return json({ message: "Content is required" }, { status: 400 });
  }
  await prisma.note.update({
    where: { id: noteId },
    data: {
      content,
    },
  });
  return json({ message: "Note updated" });
};
