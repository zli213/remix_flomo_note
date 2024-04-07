import { Button } from "@nextui-org/react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="bg-red-400 font-black">
      <h1>Hello world!</h1>
      <Button>Click me!</Button>
    </div>
  );
}
