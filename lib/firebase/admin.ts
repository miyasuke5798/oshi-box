import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { Category } from "@/types/category";

// Firebase Admin SDKの初期化
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const db = getFirestore();
const auth = getAuth();

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: FirebaseFirestore.Timestamp | null;
}

export async function getUsers(): Promise<AdminUser[]> {
  try {
    // Firestoreからユーザーデータを取得
    const usersSnapshot = await db.collection("users").get();
    const users: AdminUser[] = [];

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const authUser = await auth.getUser(doc.id);

      users.push({
        uid: doc.id,
        email: authUser.email ?? null,
        displayName: userData.displayName || null,
        createdAt: userData.createdAt || null,
      });
    }

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    // Firestoreからカテゴリーデータを取得
    const categoriesSnapshot = await db.collection("categories").get();
    const categories: Category[] = [];

    for (const doc of categoriesSnapshot.docs) {
      const categoryData = doc.data();
      categories.push({
        id: doc.id,
        name: categoryData.name,
        createdAt: categoryData.createdAt
          ? {
              seconds: categoryData.createdAt.seconds,
              nanoseconds: categoryData.createdAt.nanoseconds,
            }
          : null,
      });
    }

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

export async function getPosts() {
  const postsSnapshot = await db
    .collection("posts")
    .orderBy("createdAt", "desc")
    .get();

  const posts = await Promise.all(
    postsSnapshot.docs.map(async (doc) => {
      const postData = doc.data();
      const userDoc = await db.collection("users").doc(postData.userId).get();
      const userData = userDoc.data();

      return {
        id: doc.id,
        ...postData,
        user: {
          id: postData.userId,
          name: userData?.displayName || "不明",
        },
      };
    })
  );

  return posts;
}
