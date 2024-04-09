import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Textarea,
} from "@nextui-org/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { prisma } from "~/prisma.server";
import dayjs from "dayjs";
import { useState, useEffect, useRef } from "react";
import { Note } from "@prisma/client";
import { Listbox, ListboxItem } from "@nextui-org/react";
import { ListboxWrapper } from "../ListboxWrapper";
import { BsFillSendFill } from "react-icons/bs";
import { TbLocationCancel } from "react-icons/tb";

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
  const navigation = useNavigation();

  const notes = loaderData.notes;
  const updateFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const isActionSubmission = navigation.state === "submitting";
  let formRef = useRef<HTMLFormElement | null>(null);
  useEffect(() => {
    if (!isActionSubmission) {
      formRef.current?.reset();
    }
  }, [isActionSubmission]);
  return (
    <div className="p-10">
      <div className="flex gap-3">
        <div className="w-1/5">navbar</div>
        <div className="flex-1 flex-col">
          <Form method="post" ref={formRef}>
            <div className="flex flex-col gap-3 my-3">
              <Textarea
                name="content"
                minRows={10}
                placeholder="What you want to write now..."
              />
              <Button type="submit" color="primary">
                <BsFillSendFill className="w-5 h-5" />
              </Button>
            </div>
          </Form>
          <div>
            <Card>
              <CardHeader>Notes</CardHeader>
              <CardBody>
                {notes.map((note) => (
                  <NoteCard
                    note={{
                      ...note,
                      createAt: new Date(note.createAt),
                    }}
                    updateFetcher={updateFetcher}
                    deleteFetcher={deleteFetcher}
                    key={note.id}
                  />
                ))}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
const NoteCard = (props: {
  note: Note;
  updateFetcher: any;
  deleteFetcher: any;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isVisiable, setIsVisiable] = useState(false);
  const listboxRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      listboxRef.current &&
      !listboxRef.current.contains(event.target as Node)
    ) {
      setIsVisiable(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const isDone =
      props.updateFetcher.state === "idle" && props.updateFetcher.data != null;
    if (isDone) {
      setIsEditing(false);
    }
  }, [props.updateFetcher]);
  const items = [
    {
      key: "edit",
      label: "Edit file",
    },
    {
      key: "delete",
      label: "Delete file",
    },
  ];
  function handleDelete(noteId: number) {
    props.deleteFetcher.submit(
      { id: noteId },
      { method: "post", action: `/mine/${props.note.id}/delete` }
    );
  }
  return (
    <div key={props.note.id} className="m-3 flex flex-col relative">
      <Card className="p-3">
        <CardHeader className="flex justify-between">
          <div className="text-gray-500 text-sm">
            {dayjs(props.note.createAt).format("YYYY-MM-DD HH:mm:ss")}
          </div>
          <div>
            <div className="flex flex-col gap-3">
              <Button
                size="sm"
                variant="light"
                onClick={() => setIsVisiable(!isVisiable)}
              >
                ...
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {isEditing ? (
            <props.updateFetcher.Form
              action={`/mine/${props.note.id}/edit`}
              method="post"
            >
              <Textarea
                minRows={10}
                defaultValue={props.note.content}
                placeholder="What you want to write now..."
                name="content"
              />
              <div className="flex gap-3 my-3 justify-center">
                <Button size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <TbLocationCancel className="w-6 h-6" />
                </Button>

                <Button type="submit" color="primary" size="sm">
                  <BsFillSendFill className="w-5 h-5" />
                </Button>
              </div>
            </props.updateFetcher.Form>
          ) : (
            <div style={{ whiteSpace: "pre-line" }}>{props.note.content}</div>
          )}
        </CardBody>
      </Card>
      <div
        className={`z-30 absolute right-0 top-12 m-2 bg-white ${
          isVisiable ? "" : "hidden"
        }`}
        ref={listboxRef}
      >
        {isVisiable && (
          <ListboxWrapper>
            <Listbox items={items} aria-label="Dynamic Actions">
              {(item) => (
                <ListboxItem
                  key={item.key}
                  color={item.key === "delete" ? "danger" : "default"}
                  className={item.key === "delete" ? "text-danger" : ""}
                  onClick={() => {
                    if (item.key === "delete") {
                      handleDelete(Number(props.note.id));
                    }
                    if (item.key === "edit") {
                      setIsEditing(!isEditing);
                      setIsVisiable(false);
                    }
                  }}
                >
                  {item.label}
                </ListboxItem>
              )}
            </Listbox>
          </ListboxWrapper>
        )}
      </div>
    </div>
  );
};
