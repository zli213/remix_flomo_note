import { LoaderFunctionArgs, json, type MetaFunction } from "@remix-run/node";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Image,
} from "@nextui-org/react";
import { Logo } from "~/components/logo";
import { auth } from "~/session";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};
export const loader = async (c: LoaderFunctionArgs) => {
  const userInfo = await auth(c.request);
  const userId = userInfo.userId;
  return json({ userId });
};
export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const { userId } = loaderData;
  const route = userId ? "/mine" : "/signup";
  const buttonText = userId ? "My Notes" : "Sign Up";
  return (
    <div className="flex flex-col items-center">
      <Navbar>
        <NavbarBrand>
          <Logo />
          <p className="font-bold text-inherit pl-2">TechDemo</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link color="foreground" href="#">
              Features
            </Link>
          </NavbarItem>
          <NavbarItem isActive>
            <Link href="#" aria-current="page">
              Customers
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              Integrations
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem className="hidden lg:flex">
            <Link href="/login">Login</Link>
          </NavbarItem>
          <NavbarItem>
            <Button as={Link} color="primary" href={route} variant="flat">
              {buttonText}
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <div className="flex flex-col items-center w-2/3">
        <h1 className="text-4xl font-bold mt-10 text-center">
          This <span className="text-pink-600	">technical demo</span> showcases
          how to use the Remix
        </h1>
        <h1 className="text-3xl font-bold my-4 text-center">
          by simulating <span className="text-emerald-500	">Flomo</span>, a
          lightweight note-taking application.
        </h1>
        <p className="text-lg text-center bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% m-3">
          The image below is a snapshot of the Flomo homepage, a note-taking
          application that inspired this demo.
        </p>
        <Image
          width={1000}
          alt="NextUI hero Image"
          src="/homePage.png"
          className="m-2"
        />
      </div>
    </div>
  );
}
