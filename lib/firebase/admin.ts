import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
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
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const db = getFirestore();
const auth = getAuth();
const storage = getStorage();

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

export async function getPosts(): Promise<Post[]> {
  try {
    const postsSnapshot = await db
      .collection("posts")
      .orderBy("createdAt", "desc")
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

    // ユーザー情報と画像URLを取得
    const postsWithUser = await Promise.all(
      posts.map(async (post) => {
        const userDoc = await db.collection("users").doc(post.userId).get();
        const userData = userDoc.data();

        // 画像URLを取得
        let imageUrls: string[] = [];
        if (post.images && post.images.length > 0) {
          imageUrls = await Promise.all(
            post.images.map(async (imagePath) => {
              try {
                const bucket = storage.bucket(
                  process.env.FIREBASE_STORAGE_BUCKET
                );
                const file = bucket.file(imagePath);
                const [url] = await file.getSignedUrl({
                  action: "read",
                  expires: Date.now() + 24 * 60 * 60 * 1000, // 24時間
                });
                return url;
              } catch (error) {
                console.error("Error getting signed URL for image:", error);
                return "";
              }
            })
          );
        }

        return {
          ...post,
          images: imageUrls,
          user: {
            uid: post.userId,
            displayName: userData?.displayName || null,
            photoURL: userData?.photoURL || null,
            email: userData?.email || null,
            bio: userData?.bio || null,
            oshiName: userData?.oshiName || null,
            snsLink: userData?.snsLink || null,
            createdAt: userData?.createdAt?.toDate() || new Date(),
            updatedAt: userData?.updatedAt?.toDate() || new Date(),
          },
        };
      })
    );

    return postsWithUser;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
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

    // ユーザー情報と画像URLを取得
    const postsWithUser = await Promise.all(
      posts.map(async (post) => {
        const userDoc = await db.collection("users").doc(post.userId).get();
        const userData = userDoc.data();

        // 画像URLを取得
        let imageUrls: string[] = [];
        if (post.images && post.images.length > 0) {
          imageUrls = await Promise.all(
            post.images.map(async (imagePath) => {
              try {
                const bucket = storage.bucket(
                  process.env.FIREBASE_STORAGE_BUCKET
                );
                const file = bucket.file(imagePath);
                const [url] = await file.getSignedUrl({
                  action: "read",
                  expires: Date.now() + 24 * 60 * 60 * 1000, // 24時間
                });
                return url;
              } catch (error) {
                console.error("Error getting signed URL for image:", error);
                return "";
              }
            })
          );
        }

        return {
          ...post,
          images: imageUrls,
          user: {
            uid: post.userId,
            displayName: userData?.displayName || null,
            photoURL: userData?.photoURL || null,
            email: userData?.email || null,
            bio: userData?.bio || null,
            oshiName: userData?.oshiName || null,
            snsLink: userData?.snsLink || null,
            createdAt: userData?.createdAt?.toDate() || new Date(),
            updatedAt: userData?.updatedAt?.toDate() || new Date(),
          },
        };
      })
    );

    return postsWithUser;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
}

export async function getPostById(postId: string): Promise<Post | null> {
  try {
    const postDoc = await db.collection("posts").doc(postId).get();
    if (!postDoc.exists) {
      return null;
    }

    const data = postDoc.data();
    const post = {
      id: postDoc.id,
      userId: data?.userId,
      title: data?.title,
      content: data?.content,
      visibility: data?.visibility,
      categories: data?.categories,
      oshiId: data?.oshiId,
      images: data?.images,
      createdAt: data?.createdAt
        ? {
            seconds: data.createdAt.seconds,
            nanoseconds: data.createdAt.nanoseconds,
          }
        : null,
      updatedAt: data?.updatedAt
        ? {
            seconds: data.updatedAt.seconds,
            nanoseconds: data.updatedAt.nanoseconds,
          }
        : null,
    } as Post;

    // ユーザー情報を取得
    const userDoc = await db.collection("users").doc(post.userId).get();
    const userData = userDoc.data();
    post.user = {
      uid: post.userId,
      displayName: userData?.displayName || null,
      photoURL: userData?.photoURL || null,
      email: userData?.email || null,
      bio: userData?.bio || null,
      oshiName: userData?.oshiName || null,
      snsLink: userData?.snsLink || null,
      createdAt: userData?.createdAt?.toDate() || new Date(),
      updatedAt: userData?.updatedAt?.toDate() || new Date(),
    };

    // 画像URLを取得
    if (post.images && post.images.length > 0) {
      const imageUrls = await Promise.all(
        post.images.map(async (imagePath) => {
          try {
            const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
            const file = bucket.file(imagePath);
            const [url] = await file.getSignedUrl({
              action: "read",
              expires: Date.now() + 24 * 60 * 60 * 1000, // 24時間
            });
            return url;
          } catch (error) {
            console.error("Error getting signed URL for image:", error);
            return "";
          }
        })
      );
      post.images = imageUrls;
    }

    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
}
