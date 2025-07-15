import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getAllOshis } from "@/lib/firebase/admin";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { UserIcon } from "@/components/svg/UserIcon";
import Image from "next/image";

export default async function OshisDashboard() {
  const oshis = await getAllOshis();

  return (
    <div className="mt-3 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">推し一覧</h1>
      </div>

      {/* デスクトップ用テーブル */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">画像</th>
                  <th className="text-left p-4 font-medium">ID</th>
                  <th className="text-left p-4 font-medium">名前</th>
                  <th className="text-left p-4 font-medium">色</th>
                  <th className="text-left p-4 font-medium">推し開始日</th>
                  <th className="text-left p-4 font-medium">ユーザー</th>
                  <th className="text-left p-4 font-medium">投稿数</th>
                  <th className="text-left p-4 font-medium">登録日</th>
                  <th className="text-left p-4 font-medium">更新日</th>
                </tr>
              </thead>
              <tbody>
                {oshis.length > 0 ? (
                  oshis.map((oshi) => (
                    <tr key={oshi.id} className="border-b">
                      <td className="p-4">
                        <div className="w-12 h-12 relative">
                          {oshi.imageUrl ? (
                            <Image
                              src={oshi.imageUrl}
                              alt={`${oshi.name}の画像`}
                              fill
                              className="object-cover rounded-full border border-gray-300"
                            />
                          ) : (
                            <UserIcon className="w-12 h-12 border border-gray-300 rounded-full" />
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-mono">{oshi.id}</td>
                      <td className="p-4 text-sm">
                        <div className="font-medium">{oshi.name}</div>
                      </td>
                      <td className="p-4 text-sm">
                        {oshi.oshiColor ? (
                          <div
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: oshi.oshiColor }}
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">未設定</span>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        {oshi.oshiStartedAt ? (
                          (() => {
                            try {
                              if (typeof oshi.oshiStartedAt === "string") {
                                return format(
                                  new Date(oshi.oshiStartedAt),
                                  "yyyy年MM月dd日",
                                  {
                                    locale: ja,
                                  }
                                );
                              } else if (
                                oshi.oshiStartedAt &&
                                typeof oshi.oshiStartedAt === "object" &&
                                "_seconds" in oshi.oshiStartedAt
                              ) {
                                return format(
                                  new Date(oshi.oshiStartedAt._seconds * 1000),
                                  "yyyy年MM月dd日",
                                  {
                                    locale: ja,
                                  }
                                );
                              }
                              return "不明";
                            } catch (error) {
                              console.error(
                                "Error formatting oshiStartedAt:",
                                error,
                                oshi.oshiStartedAt
                              );
                              return "不明";
                            }
                          })()
                        ) : (
                          <span className="text-gray-400 text-xs">未設定</span>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        <Link href={`/${oshi.userId}`} className="rose_link">
                          {oshi.userName}
                        </Link>
                      </td>
                      <td className="p-4 text-sm">
                        <Badge
                          variant={oshi.postCount > 0 ? "default" : "secondary"}
                        >
                          {oshi.postCount}件
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">
                        {format(new Date(oshi.createdAt), "yyyy年MM月dd日", {
                          locale: ja,
                        })}
                      </td>
                      <td className="p-4 text-sm">
                        {format(new Date(oshi.updatedAt), "yyyy年MM月dd日", {
                          locale: ja,
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="p-4 text-sm text-center text-gray-500"
                    >
                      推しが登録されていません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* モバイル用カード表示 */}
      <div className="md:hidden space-y-4">
        {oshis.length > 0 ? (
          oshis.map((oshi) => (
            <Card key={oshi.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* ヘッダー（画像と名前） */}
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 relative flex-shrink-0">
                      {oshi.imageUrl ? (
                        <Image
                          src={oshi.imageUrl}
                          alt={`${oshi.name}の画像`}
                          fill
                          className="object-cover rounded-full border border-gray-300"
                        />
                      ) : (
                        <UserIcon className="w-16 h-16 border border-gray-300 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-lg truncate">
                        {oshi.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {oshi.oshiColor && (
                          <div
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: oshi.oshiColor }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">投稿数: </span>
                    <span className="text-sm font-mono">
                      <Badge
                        variant={oshi.postCount > 0 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {oshi.postCount}件
                      </Badge>
                    </span>
                  </div>
                  {/* ユーザーID */}
                  <div>
                    <span className="text-sm text-gray-500">ID: </span>
                    <span className="text-sm font-mono">{oshi.id}</span>
                  </div>

                  {/* ユーザー */}
                  <div>
                    <span className="text-sm text-gray-500">ユーザー: </span>
                    <Link
                      href={`/${oshi.userId}`}
                      className="rose_link text-sm font-medium"
                    >
                      {oshi.userName}
                    </Link>
                  </div>

                  {/* 推し開始日 */}
                  <div>
                    <span className="text-sm text-gray-500">推し開始日: </span>
                    <span className="text-sm">
                      {oshi.oshiStartedAt ? (
                        (() => {
                          try {
                            if (typeof oshi.oshiStartedAt === "string") {
                              return format(
                                new Date(oshi.oshiStartedAt),
                                "yyyy年MM月dd日",
                                {
                                  locale: ja,
                                }
                              );
                            } else if (
                              oshi.oshiStartedAt &&
                              typeof oshi.oshiStartedAt === "object" &&
                              "_seconds" in oshi.oshiStartedAt
                            ) {
                              return format(
                                new Date(oshi.oshiStartedAt._seconds * 1000),
                                "yyyy年MM月dd日",
                                {
                                  locale: ja,
                                }
                              );
                            }
                            return "不明";
                          } catch (error) {
                            console.error(
                              "Error formatting oshiStartedAt:",
                              error,
                              oshi.oshiStartedAt
                            );
                            return "不明";
                          }
                        })()
                      ) : (
                        <span className="text-gray-400 text-xs">未設定</span>
                      )}
                    </span>
                  </div>

                  {/* 登録日 */}
                  <div>
                    <span className="text-sm text-gray-500">登録日: </span>
                    <span className="text-sm">
                      {format(new Date(oshi.createdAt), "yyyy年MM月dd日", {
                        locale: ja,
                      })}
                    </span>
                  </div>

                  {/* 更新日 */}
                  <div>
                    <span className="text-sm text-gray-500">更新日: </span>
                    <span className="text-sm">
                      {format(new Date(oshi.updatedAt), "yyyy年MM月dd日", {
                        locale: ja,
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-4 text-center text-gray-500">
              推しが登録されていません
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
