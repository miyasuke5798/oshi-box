import { getUserBySlug } from "@/lib/firebase/admin";
import { getUserPosts } from "@/lib/firebase/admin";
import { SlugPageClient } from "./client";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SlugPage({ params }: PageProps) {
  const { slug } = await params;
  const userData = await getUserBySlug(slug);

  if (!userData) {
    notFound();
  }

  const posts = await getUserPosts(userData.uid);
  const isCurrentUser = false; // TODO: 認証情報から現在のユーザーと比較

  return (
    <SlugPageClient
      params={{ slug }}
      userData={userData}
      isCurrentUser={isCurrentUser}
      posts={posts}
    />
  );
}
