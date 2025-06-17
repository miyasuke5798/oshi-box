import { CategoryForm } from "../../_components/category-form";
import { db } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const categoryDoc = await db.collection("categories").doc(id).get();

  if (!categoryDoc.exists) {
    notFound();
  }

  const categoryData = categoryDoc.data();
  const category = {
    id: categoryDoc.id,
    name: categoryData?.name || "",
    createdAt: categoryData?.createdAt
      ? {
          seconds: categoryData.createdAt.seconds,
          nanoseconds: categoryData.createdAt.nanoseconds,
        }
      : null,
  };

  return <CategoryForm mode="edit" category={category} />;
}
