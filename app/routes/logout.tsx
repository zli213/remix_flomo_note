import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { userSessionStorage } from "~/session";

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await userSessionStorage.getSession(
    request.headers.get("Cookie")
  );
  return redirect("/login", {
    headers: {
      "Set-Cookie": await userSessionStorage.destroySession(session),
    },
  });
};
