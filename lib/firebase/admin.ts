import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { Category } from "@/types/category";
import { Post } from "@/types/post";
import { UserData } from "@/types/user";

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

export async function getUserBySlug(slug: string): Promise<UserData | null> {
  try {
    const userDoc = await db.collection("users").doc(slug).get();
    if (!userDoc.exists) {
      return null;
    }

    const data = userDoc.data();
    return {
      uid: userDoc.id,
      displayName: data?.displayName || null,
      photoURL: data?.photoURL || null,
      email: data?.email || null,
      bio: data?.bio || null,
      oshiName: data?.oshiName || null,
      snsLink: data?.snsLink || null,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error("Error fetching user by slug:", error);
    throw error;
  }
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  try {
    const postsSnapshot = await db
      .collection("posts")
      .where("userId", "==", userId)
      .get();

    const posts = postsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title,
        content: data.content,
        visibility: data.visibility,
        categories: data.categories,
        oshiId: data.oshiId,
        images: data.images,
        createdAt: data.createdAt
          ? {
              seconds: data.createdAt.seconds,
              nanoseconds: data.createdAt.nanoseconds,
            }
          : null,
        updatedAt: data.updatedAt
          ? {
              seconds: data.updatedAt.seconds,
              nanoseconds: data.updatedAt.nanoseconds,
            }
          : null,
      };
    }) as Post[];

    // メモリ上でソート
    return posts.sort((a, b) => {
      const aDate = a.createdAt
        ? new Date(
            a.createdAt.seconds * 1000 + a.createdAt.nanoseconds / 1000000
          )
        : new Date(0);
      const bDate = b.createdAt
        ? new Date(
            b.createdAt.seconds * 1000 + b.createdAt.nanoseconds / 1000000
          )
        : new Date(0);
      return bDate.getTime() - aDate.getTime();
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
}
