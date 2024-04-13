import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Textarea,
} from "@nextui-org/react";
import { Link } from "@remix-run/react";
import dayjs from "dayjs";
import { useState, useEffect, useRef } from "react";
import { Note } from "@prisma/client";
import { Listbox, ListboxItem } from "@nextui-org/react";
import { ListboxWrapper } from "../ListboxWrapper";
import { BsFillSendFill } from "react-icons/bs";
import { TbLocationCancel } from "react-icons/tb";
import { CiMenuFries } from "react-icons/ci";

export const NoteCard = (props: {
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
      label: "Edit",
    },
    {
      key: "delete",
      label: "Delete",
    },
  ];
  function handleDelete(noteId: string) {
    console.log("noteId", noteId);
    props.deleteFetcher.submit(
      { id: noteId },
      { method: "post", action: `/mine/note/${noteId}/delete` }
    );
  }
  function highlightTags(content: string) {
    // This regular expression is used to find tag words starting with #
    const tagReg = new RegExp(/(#[\p{L}\p{N}_-]+(?:\/[\p{L}\p{N}_-]+)*)/gu);
    // Split the content to highlight tags
    const parts = content.split(tagReg);
    // Map over the parts and return the correct element
    return parts.map((part, index) => {
      // If the part is a tag, add a highlight style
      if (part.match(tagReg)) {
        return (
          <Link key={index} to={`/mine?tag=${part.slice(1)}`}>
            <span key={index} className="bg-sky-50  text-sky-500 rounded-lg">
              {part}
            </span>
          </Link>
        );
      } else {
        // Otherwise, return normal text
        return part;
      }
    });
  }
  return (
    <div key={props.note.id} className="m-3 flex flex-col relative">
      <Card className="p-3">
        <CardHeader className="flex justify-between">
          <div className="text-gray-500 text-sm">
            {dayjs(props.note.createdAt).format("YYYY-MM-DD HH:mm:ss")}
          </div>
          <div>
            <div className="flex flex-col gap-3">
              <Button
                size="sm"
                variant="light"
                onClick={() => setIsVisiable(!isVisiable)}
              >
                <CiMenuFries className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {isEditing ? (
            <props.updateFetcher.Form
              action={`/mine/note/${props.note.id}/edit`}
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
            <div style={{ whiteSpace: "pre-line" }}>
              {highlightTags(props.note.content)}
            </div>
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
                      handleDelete(props.note.id);
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
