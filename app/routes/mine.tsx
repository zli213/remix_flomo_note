import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Textarea,
} from "@nextui-org/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { prisma } from "~/prisma.server";
import { useState, useEffect, useRef } from "react";
import { User } from "@nextui-org/react";
import { BsFillSendFill } from "react-icons/bs";
import { CiMenuFries } from "react-icons/ci";
import { FaNoteSticky } from "react-icons/fa6";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { HiHashtag } from "react-icons/hi";
import { auth } from "~/session";
import { NoteCard } from "~/components/noteCard";

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

export const loader = async (c: LoaderFunctionArgs) => {
  const userInfo = await auth(c.request);
  const userId = userInfo.userId;
  if (!userId) {
    return redirect("/login");
  }

  const searchParams = new URL(c.request.url).searchParams;
  const tag = searchParams.get("tag") as string;
  const tagConditions = tag
    ? {
        tags: {
          some: {
            tag: {
              title: tag,
            },
          },
        },
      }
    : {};

  const notes = await prisma.$transaction([
    prisma.note.findMany({
      where: {
        userId,
        ...tagConditions,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    }),
  ]);

  const tagsArray = await prisma.noteTag.findMany({
    where: {
      note: {
        userId: userId,
      },
    },
    select: {
      tag: true,
    },
    distinct: ["tagTitle"],
  });

  return json({ notes, tagsArray, userInfo, tag });
};

export default function Page() {
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const notes = loaderData.notes;
  const userId = loaderData.userInfo.userId;
  const avatar = loaderData.userInfo.avatar;
  const username = loaderData.userInfo.username;
  const email = loaderData.userInfo.email;
  const updateFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const deleteTagFetcher = useFetcher();
  const logoutFetcher = useFetcher();
  const isActionSubmission = navigation.state === "submitting";
  const [searchParams, setSearchParams] = useSearchParams();
  const [isTagListVisiable, setIsTagListVisiable] = useState(true);

  let formRef = useRef<HTMLFormElement | null>(null);
  useEffect(() => {
    if (!isActionSubmission) {
      formRef.current?.reset();
    }
  }, [isActionSubmission]);
  // delete tag
  const hanleDeleteTag = (tagTitle: string) => {
    deleteTagFetcher.submit(
      { title: tagTitle },
      { method: "post", action: `/mine/tag/${tagTitle}/delete` }
    );
  };
  // log out
  const handleLogout = () => {
    logoutFetcher.submit(
      {},
      {
        method: "post",
        action: "/logout",
      }
    );
  };
  return (
    <div className="p-10">
      <div className="flex gap-3">
        {/* Side bar */}
        <div className="w-1/5 mr-3">
          <div className="flex flex-row justify-between items-center py-4">
            <User
              name={username}
              description={email}
              avatarProps={{
                src: `${avatar}`,
              }}
            />
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="light"
                  className="p-0"
                  radius="none"
                  isIconOnly
                >
                  <CiMenuFries className="w-5 h-5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Static Actions">
                <DropdownItem key="edit">Account Profile</DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  onClick={() => handleLogout()}
                >
                  Log out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div>
            <Button
              variant="flat"
              className="flex justify-start w-full bg-cyan-200"
              onClick={(_) => setSearchParams({})}
            >
              <FaNoteSticky />
              All
            </Button>
            <div className="text-yellow-500 flex flex-row ml-3 py-3">
              <h1>Tags</h1>
              <button onClick={(_) => setIsTagListVisiable(!isTagListVisiable)}>
                {isTagListVisiable ? <IoIosArrowDown /> : <IoIosArrowUp />}
              </button>
            </div>
            {isTagListVisiable && (
              <div className="flex flex-col gap-1">
                {loaderData.tagsArray.map((tag) => (
                  <div
                    key={tag.tag.title}
                    className={`flex justify-between gap-3 ${
                      tag.tag.title === searchParams.get("tag")
                        ? "bg-blue-500"
                        : ""
                    } items-center`}
                  >
                    <Button
                      className="w-full flex justify-start"
                      variant="light"
                      onClick={(_) => setSearchParams({ tag: tag.tag.title })}
                      radius="none"
                    >
                      <div className="flex flex-row items-center">
                        <HiHashtag />
                        {tag.tag.title}
                      </div>
                    </Button>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          size="sm"
                          variant="light"
                          className="p-0"
                          radius="none"
                          isIconOnly
                        >
                          <CiMenuFries className="w-5 h-5" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Static Actions">
                        <DropdownItem key="edit">Edit</DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          onClick={() => hanleDeleteTag(tag.tag.title)}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* note area */}
        <div className="flex-1 flex-col">
          <Form method="post" ref={formRef}>
            <div className="flex flex-col gap-3 my-3">
              <input type="hidden" name="userId" value={userId} />
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
                {notes[0].map((note) => (
                  <NoteCard
                    note={{
                      ...note,
                      createdAt: new Date(note.createdAt),
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
