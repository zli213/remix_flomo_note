import { Button, Input, Image } from "@nextui-org/react";
import { Form, useActionData } from "@remix-run/react";
import { useState } from "react";
import { TbEyeFilled } from "react-icons/tb";
import { FaEyeSlash } from "react-icons/fa";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/prisma.server";
import { redirect } from "react-router";
export const action = async (c: ActionFunctionArgs) => {
  const formData = await c.request.formData();
  const email = formData.get("email") as string;
  const username = email.split("@")[0];
  const password = formData.get("password") as string;
  const avatar = `https://api.dicebear.com/8.x/shapes/svg?seed=Felix=${username}`;
  if (!email) {
    return json({
      successs: false,
      errors: {
        username: "Email is required",
        password: "",
      },
    });
  }
  if (!password) {
    return json({
      successs: false,
      errors: {
        username: "",
        password: "Password is required",
      },
    });
  }
  if (password.length < 8) {
    return json({
      successs: false,
      errors: {
        username: "",
        password: "Password must be at least 8 characters",
      },
    });
  }
  await prisma.user.create({
    data: {
      username: username,
      email: email,
      password: password,
      avatarUrl: avatar,
    },
  });
  return redirect("/login");
};

export default function App() {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const actionData = useActionData<typeof action>();
  const errors = actionData?.errors;
  return (
    <div className="flex flex-row justify-center items-center px-4 py-5 w-full min-h-screen gap-3">
      {/* Image Container */}
      <div className="flex justify-center items-start w-2/12">
        <Image
          isZoomed
          width={480}
          alt="Notes Image with Zoom"
          src="/signup.svg"
        />
      </div>
      {/* Form Container */}
      <div className="flex justify-center items-center w-4/12">
        <Form method="post" className="w-full max-w-md">
          <div className="flex flex-col gap-4 items-center">
            <Input
              label="email"
              name="email"
              type="email"
              isInvalid={!!errors?.username}
              errorMessage={errors?.username}
            />
            <Input
              label="Password"
              variant="bordered"
              name="password"
              placeholder="Enter your password"
              isInvalid={!!errors?.password}
              errorMessage={errors?.password}
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
              Sign up
            </Button>
            <p>
              If you have an account, please{" "}
              <a href="/login" className="text-blue-500">
                login
              </a>
              .
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
}
