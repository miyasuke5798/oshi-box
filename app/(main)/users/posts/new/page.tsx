import { requireAuth } from "@/lib/auth-server";
import { NewPostClient } from "./client";

export default async function NewPostPage() {
  const session = await requireAuth();

  return (
    <NewPostClient
      session={{ uid: session.uid, email: session.email || null }}
    />
  );
}
