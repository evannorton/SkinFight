import type { ReactElement } from "react";
import { redirect } from "next/navigation";

import { SignInPageClient } from "~/app/signin/signin-page-client";
import { auth } from "~/server/auth";

export default async function SignInPage(): Promise<ReactElement> {
  const session = await auth();
  if (session !== null) {
    redirect("/");
  }

  return <SignInPageClient />;
}
