import { createCookieSessionStorage } from "@remix-run/node"; // or cloudflare/deno

type SessionData = {
  userId: string;
  username: string;
  email: string;
  avatar: string;
};

type SessionFlashData = {
  error: string;
};

export const userSessionStorage = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  // a Cookie from `createCookie` or the CookieOptions to create one
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 10,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.COOKIES_SECRET as string],
    secure: true,
  },
});

export const auth = async (requesst: Request) => {
  const session = await userSessionStorage.getSession(
    requesst.headers.get("Cookie")
  );

  return {
    userId: session.get("userId"),
    username: session.get("username"),
    email: session.get("email"),
    avatar: session.get("avatar"),
  };
};
