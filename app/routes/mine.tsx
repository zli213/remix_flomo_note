import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Textarea,
} from "@nextui-org/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { prisma } from "~/prisma.server";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { Note } from "@prisma/client";
import { JSX } from "react/jsx-runtime";

// Define the structure of the expected response data
interface FetcherData {
  notes: Note[];
}
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
  // const notesFetcher = useFetcher<FetcherData>();
  // console.log("0", notesFetcher);

  const loaderData = useLoaderData<typeof loader>();
  const notes = loaderData.notes;
  // const notes = notesFetcher.data?.notes ?? loaderData.notes;
  // useEffect(() => {
  //   if (!notesFetcher.data && notesFetcher.state !== "idle") {
  //     notesFetcher.load("/mine");
  //     console.log("load");
  //   }
  //   console.log("effect");
  // }, [notesFetcher]);
  // console.log("1", notesFetcher);
  const updateFetcher = useFetcher();
  const deleteFetcher = useFetcher();

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

  // function NoteCard(props: { note: Note }) {
  //   // const [isEditing, setIsEditing] = useState(false);
  //   const fetcher = useFetcher();
  //   // const deleteFetcher = useFetcher();
  //   // const isUpdating = fetcher.state === "submitting";
  //   const isEditing = false;
  //   console.log("note card");
  //   return (
  //     <Card className="p-3">
  //       <CardHeader className="flex justify-between">
  //         <div className="text-gray-500 text-sm">
  //           {dayjs(props.note.createAt).format("YYYY-MM-DD HH:mm:ss")}
  //         </div>
  //         <div className="flex flex-col gap-3">
  //           <Button
  //             size="sm"
  //             variant="flat"
  //             // onClick={(_) => setIsEditing(!isEditing)}
  //           >
  //             edit
  //           </Button>
  //           {/* <deleteFetcher.Form
  //             action={`/mine/${props.note.id}/delete`}
  //             method="post"
  //           > */}
  //           <Button type="submit" size="sm" color="danger">
  //             Delete
  //           </Button>
  //           {/* </deleteFetcher.Form> */}
  //         </div>
  //       </CardHeader>
  //       {isEditing ? (
  //         <>
  //           <CardBody>
  //             <fetcher.Form
  //               action={`/mine/${props.note.id}/edit`}
  //               method="post"
  //             >
  //               <Textarea
  //                 name="content"
  //                 minRows={10}
  //                 placeholder="What you want to write now..."
  //                 defaultValue={props.note.content}
  //               />
  //               <div className="flex gap-3">
  //                 <Button size="sm">Cancel</Button>
  //                 <Button type="submit" color="primary" size="sm">
  //                   Save
  //                 </Button>
  //               </div>
  //             </fetcher.Form>
  //           </CardBody>
  //         </>
  //       ) : (
  //         <CardBody>{props.note.content}</CardBody>
  //       )}
  //     </Card>
  //   );
  // }
}
const NoteCard = (props: {
  note: Note;
  updateFetcher: any;
  deleteFetcher: any;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    const isDone =
      props.updateFetcher.state === "idle" && props.updateFetcher.data != null;
    if (isDone) {
      setIsEditing(false);
    }
  }, [props.updateFetcher]);
  return (
    <div key={props.note.id}>
      <Card className="p-3">
        <CardHeader className="flex justify-between">
          <div className="text-gray-500 text-sm">
            {dayjs(props.note.createAt).format("YYYY-MM-DD HH:mm:ss")}
          </div>
          <div className="flex flex-col gap-3">
            <Button
              size="sm"
              variant="flat"
              onClick={(_) => setIsEditing(!isEditing)}
            >
              edit
            </Button>
            <props.deleteFetcher.Form
              action={`/mine/${props.note.id}/delete`}
              method="post"
            >
              <Button type="submit" size="sm" color="danger">
                Delete
              </Button>
            </props.deleteFetcher.Form>
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
              <div className="flex gap-3">
                <Button size="sm">Cancel</Button>

                <Button type="submit" color="primary" size="sm">
                  Save
                </Button>
              </div>
            </props.updateFetcher.Form>
          ) : (
            <div>{props.note.content}</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
