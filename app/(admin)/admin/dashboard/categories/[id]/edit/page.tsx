import { CategoryForm } from "../../_components/category-form";
import { db } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = params;
  const categoryDoc = await db.collection("categories").doc(id).get();

  if (!categoryDoc.exists) {
    notFound();
  }

  const data = categoryDoc.data();
  const category = {
    id: categoryDoc.id,
    name: data?.name || "",
    createdAt: data?.createdAt
      ? {
          seconds: data.createdAt.seconds,
          nanoseconds: data.createdAt.nanoseconds,
        }
      : null,
  };

  return <CategoryForm category={category} mode="edit" />;
}
