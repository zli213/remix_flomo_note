import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Textarea,
} from "@nextui-org/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { prisma } from "~/prisma.server";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
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
        <div className="flex-1 flex-col">
          <Form method="post">
            <div className="flex flex-col gap-3 my-3">
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

          <div className="flex flex-col gap-3  ">
            {loaderData.notes.map((note) => (
              <NoteCard key={note.id} {...note} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  function NoteCard(
    note: { id: string; content: string; createAt: string } & {}
  ) {
    const [isEdit, setIsEdit] = useState(false);
    const fetcher = useFetcher<{ message?: string }>(); // Update the type of fetcher.data
    const isUpdating = fetcher.state === "submitting";
    return (
      <Card className="p-3">
        <CardHeader className="flex justify-between">
          <div className="text-gray-500 text-sm">
            {dayjs(note.createAt).format("YYYY-MM-DD HH:mm:ss")}
          </div>
          <div>
            <Button
              size="sm"
              variant="flat"
              onClick={(_) => setIsEdit(!isEdit)}
            >
              edit
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {isEdit ? (
            <fetcher.Form action="/mine/edit" method="post">
              <input type="hidden" name="noteId" value={note.id} />
              <Textarea
                name="content"
                minRows={10}
                placeholder="What you want to write now..."
                defaultValue={note.content}
              />
              <Button isLoading={isUpdating} type="submit" color="primary">
                Save
              </Button>
            </fetcher.Form>
          ) : (
            <>{note.content}</>
          )}
        </CardBody>
      </Card>
    );
  }
}
