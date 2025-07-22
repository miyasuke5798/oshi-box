import { getUserBySlug } from "@/lib/firebase/admin";
import { getUserPosts } from "@/lib/firebase/admin";
import { SlugPageClient } from "./client";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth-server";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SlugPage({ params }: PageProps) {
  const session = await getSession();
  const { slug } = await params;
  const userData = await getUserBySlug(slug);

  if (!userData) {
    notFound();
  }

  const posts = await getUserPosts(userData.uid, session?.uid);
  const isCurrentUser = session?.uid === userData.uid;

  return (
    <SlugPageClient
      params={{ slug }}
      userData={userData}
      isCurrentUser={isCurrentUser}
      posts={posts}
    />
  );
}
