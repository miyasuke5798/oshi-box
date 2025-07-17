import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { Category } from "@/types/category";
import { Post } from "@/types/post";
import { UserData } from "@/types/user";
import { Oshi } from "@/types/oshi";

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
    const postsSnapshot = await db.collection("posts").get();

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

    // visibilityが"private"の投稿を除外し、作成日時でソート
    const filteredPosts = posts
      .filter((post) => post.visibility !== "private")
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.seconds - a.createdAt.seconds;
      });

    // ユーザー情報と画像URLを取得
    const postsWithUser = await Promise.all(
      filteredPosts.map(async (post) => {
        const userDoc = await db.collection("users").doc(post.userId).get();
        const userData = userDoc.data();

        // 推しの情報を取得
        let oshi = null;
        if (post.oshiId) {
          oshi = await getOshiById(post.userId, post.oshiId);
        }

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
                  expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7日間
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
          oshi,
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

export async function getUserPosts(
  userId: string,
  currentUserId?: string
): Promise<Post[]> {
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

    // 現在のユーザーではない場合はプライベート投稿を除外
    const filteredPosts =
      currentUserId && currentUserId !== userId
        ? posts.filter((post) => post.visibility !== "private")
        : posts;

    // ユーザー情報と画像URLを取得
    const postsWithUser = await Promise.all(
      filteredPosts.map(async (post) => {
        const userDoc = await db.collection("users").doc(post.userId).get();
        const userData = userDoc.data();

        // 推しの情報を取得
        let oshi = null;
        if (post.oshiId) {
          oshi = await getOshiById(post.userId, post.oshiId);
        }

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
                  expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7日間
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
          oshi,
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

export async function getPostById(
  postId: string,
  forEdit: boolean = false
): Promise<Post | null> {
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
      if (forEdit) {
        // 編集用の場合は元のファイルパスを保持
        // 署名付きURLの場合はファイルパスを抽出
        post.images = post.images
          .map((imagePath) => {
            if (imagePath.startsWith("http")) {
              // 署名付きURLからファイルパスを抽出
              try {
                // URLの妥当性チェック
                if (!imagePath || typeof imagePath !== "string") {
                  console.warn("Invalid imagePath:", imagePath);
                  return "";
                }

                const url = new URL(imagePath);
                const pathParts = url.pathname.split("/");
                if (pathParts.length >= 3) {
                  return pathParts.slice(1).join("/");
                }
              } catch (error) {
                console.error(
                  "Error extracting file path from signed URL:",
                  error,
                  "imagePath:",
                  imagePath
                );
                // エラーの場合は空文字を返す
                return "";
              }
            }
            return imagePath;
          })
          .filter((path) => path !== ""); // 空のパスを除外
      } else {
        // 表示用の場合は署名付きURLを生成
        const imageUrls = await Promise.all(
          post.images.map(async (imagePath) => {
            try {
              const bucket = storage.bucket(
                process.env.FIREBASE_STORAGE_BUCKET
              );
              const file = bucket.file(imagePath);
              const [url] = await file.getSignedUrl({
                action: "read",
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7日間
              });
              return url;
            } catch (error) {
              console.error("Error getting signed URL for image:", error);
              return "";
            }
          })
        );
        post.images = imageUrls.filter((url) => url !== ""); // 空のURLを除外
      }
    }

    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
}

export async function getOshiById(
  userId: string,
  oshiId: string
): Promise<Oshi | null> {
  try {
    if (!db) {
      throw new Error("Firebase Admin not initialized");
    }

    const oshiDoc = await db
      .collection("users")
      .doc(userId)
      .collection("oshi")
      .doc(oshiId)
      .get();

    if (!oshiDoc.exists) {
      return null;
    }

    const data = oshiDoc.data();
    return {
      id: oshiDoc.id,
      name: data?.name || "",
      createdAt:
        data?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt:
        data?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error getting oshi by ID:", error);
    return null;
  }
}

export async function getAllOshis(): Promise<
  Array<Oshi & { userId: string; userName: string; postCount: number }>
> {
  try {
    if (!db) {
      throw new Error("Firebase Admin not initialized");
    }

    // 全てのユーザーを取得
    const usersSnapshot = await db.collection("users").get();
    const allOshis: Array<
      Oshi & { userId: string; userName: string; postCount: number }
    > = [];

    // 各ユーザーの推しを取得
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      const userName = userData?.displayName || "不明";

      // ユーザーの推し一覧を取得
      const oshiSnapshot = await db
        .collection("users")
        .doc(userId)
        .collection("oshi")
        .get();

      // 各推しについて投稿数を取得
      for (const oshiDoc of oshiSnapshot.docs) {
        const oshiData = oshiDoc.data();

        // この推しに関連する投稿数を取得
        const postsSnapshot = await db
          .collection("posts")
          .where("oshiId", "==", oshiDoc.id)
          .get();

        const oshi: Oshi & {
          userId: string;
          userName: string;
          postCount: number;
        } = {
          id: oshiDoc.id,
          name: oshiData?.name || "",
          imageUrl: oshiData?.imageUrl || null,
          oshiColor: oshiData?.oshiColor || null,
          oshiStartedAt: oshiData?.oshiStartedAt || null,
          createdAt:
            oshiData?.createdAt?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
          updatedAt:
            oshiData?.updatedAt?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
          userId,
          userName,
          postCount: postsSnapshot.size,
        };

        allOshis.push(oshi);
      }
    }

    // 作成日時でソート（新しい順）
    allOshis.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return allOshis;
  } catch (error) {
    console.error("Error fetching all oshis:", error);
    throw error;
  }
}

export async function getPostsForAdmin(): Promise<Post[]> {
  try {
    const postsSnapshot = await db.collection("posts").get();

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

    // 作成日時でソート（privateも含む）
    const sortedPosts = posts.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.seconds - a.createdAt.seconds;
    });

    // ユーザー情報と画像URLを取得
    const postsWithUser = await Promise.all(
      sortedPosts.map(async (post) => {
        const userDoc = await db.collection("users").doc(post.userId).get();
        const userData = userDoc.data();

        // 推しの情報を取得
        let oshi = null;
        if (post.oshiId) {
          oshi = await getOshiById(post.userId, post.oshiId);
        }

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
                  expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7日間
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
          oshi,
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
    console.error("Error fetching posts for admin:", error);
    throw error;
  }
}

export async function getPostsByHashtag(hashtag: string): Promise<Post[]> {
  try {
    const postsSnapshot = await db.collection("posts").get();

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

    // ハッシュタグでフィルタリング（半角#と全角#の両方に対応）
    // ハッシュタグの特殊文字をエスケープ
    const escapedHashtag = hashtag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // 日本語の単語境界を考慮した正規表現（\bの代わりに適切な境界チェック）
    const hashtagRegex = new RegExp(
      `[#＃]${escapedHashtag}(?=\\s|$|[^\\w\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF])`,
      "i"
    );
    console.log(
      `Searching for hashtag: ${hashtag}, escaped: ${escapedHashtag}, regex: ${hashtagRegex}`
    );

    const filteredPosts = posts.filter((post) => {
      // プライベート投稿を除外
      if (post.visibility === "private") return false;

      // タイトルまたはコンテンツにハッシュタグが含まれているかチェック
      // 半角#と全角#の両方に対応するため、正規表現で検索
      const titleMatch = hashtagRegex.test(post.title);
      const contentMatch = hashtagRegex.test(post.content);

      if (titleMatch || contentMatch) {
        console.log(`Found match in post ${post.id}:`, {
          title: post.title,
          content: post.content.substring(0, 100) + "...",
          hashtag,
        });
      }

      return titleMatch || contentMatch;
    });

    // 作成日時でソート（新しい順）
    const sortedPosts = filteredPosts.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.seconds - a.createdAt.seconds;
    });

    // ユーザー情報と画像URLを取得
    const postsWithUser = await Promise.all(
      sortedPosts.map(async (post) => {
        const userDoc = await db.collection("users").doc(post.userId).get();
        const userData = userDoc.data();

        // 推しの情報を取得
        let oshi = null;
        if (post.oshiId) {
          oshi = await getOshiById(post.userId, post.oshiId);
        }

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
                  expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7日間
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
          oshi,
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
    console.error("Error fetching posts by hashtag:", error);
    throw error;
  }
}

export async function getPostsByCategory(categoryId: string): Promise<Post[]> {
  try {
    const postsSnapshot = await db.collection("posts").get();

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

    // カテゴリーでフィルタリング
    const filteredPosts = posts.filter((post) => {
      // プライベート投稿を除外
      if (post.visibility === "private") return false;

      // 投稿のカテゴリー配列に指定されたカテゴリーIDが含まれているかチェック
      return post.categories && post.categories.includes(categoryId);
    });

    // 作成日時でソート（新しい順）
    const sortedPosts = filteredPosts.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.seconds - a.createdAt.seconds;
    });

    // ユーザー情報と画像URLを取得
    const postsWithUser = await Promise.all(
      sortedPosts.map(async (post) => {
        const userDoc = await db.collection("users").doc(post.userId).get();
        const userData = userDoc.data();

        // 推しの情報を取得
        let oshi = null;
        if (post.oshiId) {
          oshi = await getOshiById(post.userId, post.oshiId);
        }

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
                  expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7日間
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
          oshi,
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
    console.error("Error fetching posts by category:", error);
    throw error;
  }
}
