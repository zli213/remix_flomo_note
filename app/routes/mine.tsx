import { Button, Textarea } from "@nextui-org/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { prisma } from "~/prisma.server";
export const action = async (c: ActionFunctionArgs) => {
  const formData = await c.request.formData();
  const content = formData.get("content") as string;
  if (!content) {
    throw new Response("Content is required", { status: 400 });
  }
  await prisma.note.create({
    data: {
      content,
    },
  });
  return json({ message: "Note created" });
};
export const loader = async () => {
  const notes = await prisma.note.findMany({
    orderBy: {
      createAt: "desc",
    },
  });
  return json({ notes });
};
export default function Page() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <div className="p-10">
      <div className="flex gap-3">
        <div className="w-1/5">navbar</div>
        <div className="flex-1">
          <Form method="post">
            <div className="flex flex-col gap-3">
              <Textarea
                name="content"
                minRows={10}
                placeholder="What you want to write now..."
              />
              <Button type="submit" color="primary">
                Save
              </Button>
            </div>
          </Form>

          <div>
            {loaderData.notes.map((note) => (
              <div key={note.id} className="border p-3 my-3">
                {note.content}
                {note.createAt}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
