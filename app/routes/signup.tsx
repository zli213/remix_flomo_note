import { Button, Input, Image } from "@nextui-org/react";
import { Form } from "@remix-run/react";

export default function Signup() {
  return (
    <div className="flex flex-row justify-between px-10 py-5 w-full h-full content-center">
      <div className="w-full h-full content-center">
        <Image
          isZoomed
          width={480}
          alt="Notes Image with Zoom"
          src="../public/signup.svg"
        />
      </div>
      <div className="w-full h-full">
        <Form method="post">
          <div className="flex flex-col content-between gap-3">
            <Input label="username" name="username" />
            <Input label="password" name="password" type="password" />
            <Button color="primary" type="submit">
              Sign up
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
