import type { Metadata } from "next";
import type { ReactElement } from "react";

import { SupportPageClient } from "~/app/support/support-page-client";
import { auth } from "~/server/auth";

export const metadata: Metadata = {
  title: "Support · SkinFight",
};

export default async function SupportPage(): Promise<ReactElement> {
  const session = await auth();
  const initialName = session?.user.name?.trim() ?? "";
  const initialEmail = session?.user.email?.trim() ?? "";

  return (
    <SupportPageClient
      initialName={initialName}
      initialEmail={initialEmail}
    />
  );
}
