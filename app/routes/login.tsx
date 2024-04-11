import { Button, Input, Image } from "@nextui-org/react";
import { Form, redirect } from "@remix-run/react";

import React, { useState } from "react";
import { TbEyeFilled } from "react-icons/tb";
import { FaEyeSlash } from "react-icons/fa";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/prisma.server";
import { userSessionStorage } from "~/session";
export const action = async (c: ActionFunctionArgs) => {
  const formData = await c.request.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const session = await userSessionStorage.getSession(
    c.request.headers.get("Cookie")
  );
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (!user) {
    throw new Response("Invalid username or password", {
      status: 400,
    });
  }
  if (user.password !== password) {
    return json({
      success: false,
      errors: {
        username: "",
        password: "Invalid password",
      },
    });
  }
  session.set("userId", user.id);
  return redirect("/mine", {
    headers: {
      "Set-Cookie": await userSessionStorage.commitSession(session),
    },
  });
};

export default function App() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="flex flex-row justify-center items-center px-4 py-5 w-full min-h-screen">
      {/* Image Container */}
      <div className="flex justify-center items-center w-2/12">
        <Image
          isZoomed
          width={480}
          alt="Notes Image with Zoom"
          src="/login.svg"
        />
      </div>
      {/* Form Container */}
      <div className="flex justify-start items-center w-4/12">
        <Form method="post" className="w-full max-w-md">
          <div className="flex flex-col gap-4 items-center">
            <Input isRequired label="email" name="username" type="email" />
            <Input
              label="Password"
              variant="bordered"
              placeholder="Enter your password"
              name="password"
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <FaEyeSlash className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <TbEyeFilled className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              type={isVisible ? "text" : "password"}
            />
            <Button color="primary" type="submit" className="max-w-xs">
              Login
            </Button>
            <p>
              If you have no account, please{" "}
              <a href="/signup" className="text-blue-500">
                sign up
              </a>
              .
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
}
