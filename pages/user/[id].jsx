// pages/user/[id].jsx

import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "../../styles/users.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faLock, faLink } from "@fortawesome/free-solid-svg-icons";

// Edge Runtime設定
export const runtime = 'edge';

const fetchUserData = async (username) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch("https://pvsf-cash.vercel.app/api/users", {
      signal: controller.signal,
      headers: {
        "Cache-Control": "no-cache",
        "User-Agent": "Mozilla/5.0 (compatible; PVSF-Archive/1.0)",
      },
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`Failed to fetch user data: ${res.status} ${res.statusText}`);
      return null;
    }

    const text = await res.text();
    if (!text || text.trim() === '') {
      console.error('Empty response from user API');
      return null;
    }

    let usersData;
    try {
      usersData = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON Parse Error for user data:', parseError.message);
      console.error('Response text:', text.substring(0, 200));
      return null;
    }

    const user = Array.isArray(usersData) ? usersData.find((user) => user.username === username) : null;

    if (user) {
      // 全ての作品データを取得
      const allWorksData = await fetchWorksData();

      // .tlinkが一致する作品をフィルタリング
      const matchedWorksByTlink = Array.isArray(allWorksData)
        ? allWorksData.filter((work) => work.tlink?.toLowerCase() === username.toLowerCase())
        : [];

      // .icon の取得
      if (matchedWorksByTlink.length > 0) {
        const personalWorks = matchedWorksByTlink.filter(
          (work) => work.type === "個人"
        );
        const firstWork =
          personalWorks.length > 0 ? personalWorks[0] : matchedWorksByTlink[0];
        user.icon = firstWork.icon || "";
      } else {
        user.icon = "";
      }

      // .creator の取得
      if (matchedWorksByTlink.length > 0) {
        const personalWorks = matchedWorksByTlink.filter(
          (work) => work.type === "個人"
        );
        const firstWork =
          personalWorks.length > 0 ? personalWorks[0] : matchedWorksByTlink[0];
        if (firstWork.type === "個人") {
          user.creator = firstWork.creator;
        }
      }

      if (!user.creator) {
        // .creator が未設定の場合、.memberid と .member を使って最新の一致を探す
        let latestWork = null;
        for (const work of allWorksData) {
          if (work.memberid) {
            const memberIds = work.memberid.split(",");
            const memberNames = work.member.split(",");

            const matchedMemberIndex = memberIds.findIndex(
              (memberId) =>
                memberId.trim().toLowerCase() === username.toLowerCase()
            );

            if (matchedMemberIndex !== -1) {
              latestWork = work; // 最新作を更新
              user.creator = memberNames[matchedMemberIndex].trim();
              break; // 最初に見つかった一致を優先
            }
          }
        }

        // 最新作が見つかっていない場合、ユーザー名を使用
        if (!user.creator && latestWork) {
          user.creator = username;
        }
      }

      // .largeThumbnail の取得
      if (matchedWorksByTlink.length > 0) {
        const personalWorks = matchedWorksByTlink.filter(
          (work) => work.type === "個人"
        );
        const firstWork =
          personalWorks.length > 0 ? personalWorks[0] : matchedWorksByTlink[0];
        user.largeThumbnail = firstWork.largeThumbnail || "";
      } else {
        user.largeThumbnail = "";
      }

      // .tlink の代入
      user.tlink = username;

      // .ychlink の取得
      if (matchedWorksByTlink.length > 0) {
        const personalWorks = matchedWorksByTlink.filter(
          (work) => work.type === "個人"
        );
        const firstWork =
          personalWorks.length > 0 ? personalWorks[0] : matchedWorksByTlink[0];
        user.ychlink = firstWork.ychlink || "";
      } else {
        user.ychlink = "";
      }
    }

    return user;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('User data fetch timeout');
      return null;
    }
    console.error('Error fetching user data:', error);
    return null;
  }
};

const fetchWorksData = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch("https://pvsf-cash.vercel.app/api/videos", {
      signal: controller.signal,
      headers: {
        "Cache-Control": "no-cache",
        "User-Agent": "Mozilla/5.0 (compatible; PVSF-Archive/1.0)",
      },
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`Failed to fetch works data: ${res.status} ${res.statusText}`);
      return [];
    }

    const text = await res.text();
    if (!text || text.trim() === '') {
      console.error('Empty response from works API');
      return [];
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('JSON Parse Error for works data:', parseError.message);
      console.error('Response text:', text.substring(0, 200));
      return [];
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Works data fetch timeout');
      return [];
    }
    console.error('Error fetching works data:', error);
    return [];
  }
};

const fetchCollaborationWorksData = (worksData, id) => {
  return worksData.filter((work) => {
    if (work.memberid) {
      const memberIds = work.memberid.split(","); // カンマで分割
      return memberIds.some(
        (memberId) => memberId.trim().toLowerCase() === id.toLowerCase()
      ); // 大文字小文字を無視して一致するかチェック
    }
    return false; // memberid が存在しない場合は false
  });
};
export default function UserWorksPage({ user, works, collaborationWorks }) {
  return (
    <div>
      <Head>
        <title>
          {user ? `${user.username}の作品 - EventArchives` : "作品一覧"}
        </title>
        <meta
          name="description"
          content={user ? `${user.username}の作品一覧です。` : "作品一覧です。"}
        />
      </Head>
      <div className={styles.content}>
        <div className={styles.first}>
          {user.icon && (
            <Image
              src={`https://lh3.googleusercontent.com/d/${user.icon.slice(33)}`} // アイコンの URL
              className={styles.uicon}
              alt={`${user.creator}のアイコン`}
              width={150}
              height={150}
            />
          )}
          <div className={styles.textblock}>
            {user.creator && <h2>{user.creator}</h2>}
            {user.ychlink && (
              <a
                className={styles.username}
                href={`${user.ychlink}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faYoutube} />
              </a>
            )}
            {user.tlink && (
              <a
                className={styles.username}
                href={`https://twitter.com/${user.tlink}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faXTwitter} />@{user.tlink}
              </a>
            )}
          </div>
          {user.largeThumbnail && (
            <Image
              src={user.largeThumbnail}
              alt={`${user.creator}の作品`}
              className={styles.uback}
              width={1280}
              height={720}
            />
          )}
        </div>

        <div className={styles.uwork}>
          <div className="work">
            {/* 通常の作品（PVSFSummary以外）を表示 */}
            {Array.isArray(works) && works.filter(work =>
              !work.eventid?.split(',').some(id => id.includes('PVSFSummary'))
            ).length > 0 ? (
              works.filter(work =>
                !work.eventid?.split(',').some(id => id.includes('PVSFSummary'))
              ).map((work) => {
                const showIcon = work.icon !== undefined && work.icon !== "";
                const isPrivate =
                  work.status === "private" || work.status === "unknown";
                const isUnlisted = work.status === "unlisted"; // 限定公開かどうかを判定

                return (
                  <div
                    className={`works ${isPrivate ? "private" : ""} ${work.status === "unlisted" ? "unlisted" : ""
                      }`}
                    key={work.ylink}
                  >
                    <Link href={`../${work.ylink.slice(17, 28)}`}>
                      <Image
                        src={work.largeThumbnail}
                        alt={`${work.title} - ${work.creator} | PVSF archive`}
                        className="samune"
                        width={640}
                        height={360}
                      />
                    </Link>
                    <h3>{work.title}</h3>
                    <div className="subtitle">
                      <div className="insubtitle">
                        {showIcon && work.icon ? (
                          <Image
                            src={`https://lh3.googleusercontent.com/d/${work.icon.slice(
                              33
                            )}`}
                            className="icon"
                            alt={`${work.creator}のアイコン`}
                            width={50}
                            height={50}
                          />
                        ) : (
                          <Image
                            src="https://i.gyazo.com/07a85b996890313b80971d8d2dbf4a4c.jpg"
                            alt={`アイコン`}
                            className="icon"
                            width={50}
                            height={50}
                          />
                        )}
                        <p>{work.creator}</p>
                      </div>

                      <p className="status">
                        {work.status === "public" ? null : work.status === // 公開状態のときは何も表示しない
                          "unlisted" ? (
                          <span className="inunlisted">
                            <span className="icon">
                              <FontAwesomeIcon icon={faLink} />
                            </span>
                            限定公開
                          </span>
                        ) : (
                          <span className="inprivate">
                            <span className="sicon">
                              <FontAwesomeIcon icon={faLock} />
                            </span>
                            非公開
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>このユーザーは作品を持っていません。</p>
            )}
          </div>

          {/* 参加作品セクション（PVSFSummary以外）*/}
          <div className="work">
            <h2>参加した作品等</h2>
            {collaborationWorks.filter(work =>
              !work.eventid?.split(',').some(id => id.includes('PVSFSummary'))
            ).length > 0 ? (
              collaborationWorks.filter(work =>
                !work.eventid?.split(',').some(id => id.includes('PVSFSummary'))
              ).map((work) => (
                <div
                  className={`works ${work.status === "private" ? "private" : ""
                    } ${work.status === "unlisted" ? "unlisted" : ""}`}
                  key={work.ylink}
                >
                  <Link href={`../${work.ylink.slice(17, 28)}`}>
                    <Image
                      src={work.largeThumbnail}
                      alt={`${work.title} - ${work.creator} | PVSF archive`}
                      className="samune"
                      width={640}
                      height={360}
                    />
                  </Link>
                  <h3>{work.title}</h3>
                  <div className="subtitle">
                    <div className="insubtitle">
                      {work.icon ? (
                        <Image
                          src={`https://lh3.googleusercontent.com/d/${work.icon.slice(
                            33
                          )}`}
                          className="icon"
                          alt={`${work.creator}のアイコン`}
                          width={50}
                          height={50}
                        />
                      ) : (
                        <Image
                          src="https://i.gyazo.com/07a85b996890313b80971d8d2dbf4a4c.jpg"
                          alt={`アイコン`}
                          className="icon"
                          width={50}
                          height={50}
                        />
                      )}
                      <p>{work.creator}</p>
                    </div>

                    <p className="status">
                      {work.status === "public" ? null : work.status === // 公開状態のときは何も表示しない
                        "unlisted" ? (
                        <span className="inunlisted">
                          <span className="icon">
                            <FontAwesomeIcon icon={faLink} />
                          </span>
                          限定公開
                        </span>
                      ) : (
                        <span className="inprivate">
                          <span className="sicon">
                            <FontAwesomeIcon icon={faLock} />
                          </span>
                          非公開
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>このユーザーは参加した合作作品を持っていません。</p>
            )}
          </div>

          {/* PVSFSummary作品セクション（個人作品）*/}
          {works.filter(work =>
            work.eventid?.split(',').some(id => id.includes('PVSFSummary'))
          ).length > 0 && (
              <div className={styles.summarySection}>
                <h2 className={styles.summaryTitle}>まとめ動画</h2>
                <div className={styles.summaryWorks}>
                  {works.filter(work =>
                    work.eventid?.split(',').some(id => id.includes('PVSFSummary'))
                  ).map((work) => (
                    <div
                      className={`works ${styles.summaryWork} ${work.status === "private" ? "private" : ""} ${work.status === "unlisted" ? "unlisted" : ""}`}
                      key={work.ylink}
                    >
                      <Link href={`../${work.ylink.slice(17, 28)}`}>
                        <Image
                          src={work.largeThumbnail}
                          alt={`${work.title} - ${work.creator} | PVSF archive`}
                          className="samune"
                          width={640}
                          height={360}
                        />
                      </Link>
                      <h3>{work.title}</h3>
                      <div className="subtitle">
                        <div className="insubtitle">
                          {work.icon ? (
                            <Image
                              src={`https://lh3.googleusercontent.com/d/${work.icon.slice(33)}`}
                              className={styles.sicon}
                              alt={`${work.creator}のアイコン`}
                              width={50}
                              height={50}
                            />
                          ) : (
                            <Image
                              src="https://i.gyazo.com/07a85b996890313b80971d8d2dbf4a4c.jpg"
                              alt={`アイコン`}
                              className="icon"
                              width={50}
                              height={50}
                            />
                          )}
                          <p>{work.creator}</p>
                        </div>
                        <p className="status">
                          {work.status === "public" ? null : work.status === "unlisted" ? (
                            <span className="inunlisted">
                              <FontAwesomeIcon icon={faLink} />
                              限定公開
                            </span>
                          ) : (
                            <span className="inprivate">
                              <FontAwesomeIcon icon={faLock} />
                              非公開
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* PVSFSummary作品セクション（参加作品）*/}
          {collaborationWorks.filter(work =>
            work.eventid?.split(',').some(id => id.includes('PVSFSummary'))
          ).length > 0 && (
              <div className={styles.summarySection}>
                <h2 className={styles.summaryTitle}>その他の動画</h2>
                <div className={styles.summaryWorks}>
                  {collaborationWorks.filter(work =>
                    work.eventid?.split(',').some(id => id.includes('PVSFSummary'))
                  ).map((work) => (
                    <div
                      className={`works ${styles.summaryWork} ${work.status === "private" ? "private" : ""} ${work.status === "unlisted" ? "unlisted" : ""}`}
                      key={work.ylink}
                    >
                      <Link href={`../${work.ylink.slice(17, 28)}`}>
                        <Image
                          src={work.largeThumbnail}
                          alt={`${work.title} - ${work.creator} | PVSF archive`}
                          className="samune"
                          width={640}
                          height={360}
                        />
                      </Link>
                      <h3>{work.title}</h3>
                      <div className="subtitle">
                        <div className="insubtitle">
                          {work.icon ? (
                            <Image
                              src={`https://lh3.googleusercontent.com/d/${work.icon.slice(33)}`}
                              className={styles.sicon}
                              alt={`${work.creator}のアイコン`}
                              width={50}
                              height={50}
                            />
                          ) : (
                            <Image
                              src="https://i.gyazo.com/07a85b996890313b80971d8d2dbf4a4c.jpg"
                              alt={`アイコン`}
                              className="icon"
                              width={50}
                              height={50}
                            />
                          )}
                          <p>{work.creator}</p>
                        </div>
                        <p className="status">
                          {work.status === "public" ? null : work.status === "unlisted" ? (
                            <span className="inunlisted">
                              <FontAwesomeIcon icon={faLink} />
                              限定公開
                            </span>
                          ) : (
                            <span className="inprivate">
                              <FontAwesomeIcon icon={faLock} />
                              非公開
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export const getStaticPaths = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch("https://pvsf-cash.vercel.app/api/users", {
      signal: controller.signal,
      headers: {
        "Cache-Control": "no-cache",
        "User-Agent": "Mozilla/5.0 (compatible; PVSF-Archive/1.0)",
      },
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed to fetch users for getStaticPaths: ${response.status} ${response.statusText}`);
      return {
        paths: [],
        fallback: 'blocking',
      };
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      console.error('Empty response from users API in getStaticPaths');
      return {
        paths: [],
        fallback: 'blocking',
      };
    }

    let users;
    try {
      users = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON Parse Error in getStaticPaths:', parseError.message);
      console.error('Response text:', text.substring(0, 200));
      return {
        paths: [],
        fallback: 'blocking',
      };
    }

    if (!Array.isArray(users)) {
      console.error('Users data is not an array in getStaticPaths');
      return {
        paths: [],
        fallback: 'blocking',
      };
    }

    const paths = users
      .filter(user => user?.username && typeof user.username === 'string')
      .map(user => ({
        params: { id: user.username.trim() }
      }));

    console.log(`Generated ${paths.length} user static paths out of ${users.length} users`);

    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('getStaticPaths request timeout for users');
    } else {
      console.error('Error in getStaticPaths for users:', error);
    }

    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps = async ({ params }) => {
  try {
    const { id } = params;

    // データを取得（エラーハンドリング付き）
    const [userResult, worksResult] = await Promise.allSettled([
      fetchUserData(id),
      fetchWorksData()
    ]);

    // 結果を安全に処理
    const user = userResult.status === 'fulfilled' ? userResult.value : null;
    const allWorks = worksResult.status === 'fulfilled' ? worksResult.value : [];

    if (!user) {
      console.warn(`User not found for ID: ${id}`);
      return {
        notFound: true,
      };
    }

    // 安全な文字列処理
    const safeString = (value) => {
      if (typeof value === 'string') return value.trim();
      if (Array.isArray(value)) return value.join(', ').trim();
      return '';
    };

    // ユーザーデータの安全な処理
    const processedUser = {
      ...user,
      username: safeString(user.username),
      creator: safeString(user.creator),
      tlink: safeString(user.tlink),
      ychlink: safeString(user.ychlink),
    };

    // 作品データの取得とフィルタリング
    const works = fetchCollaborationWorksData(allWorks, id);
    const collaborationWorks = fetchCollaborationWorksData(allWorks, id);

    return {
      props: {
        user: processedUser,
        works: works || [],
        collaborationWorks: collaborationWorks || [],
      },
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        user: null,
        works: [],
        collaborationWorks: [],
        error: 'データの取得に失敗しました',
      },
      revalidate: 300, // エラー時は5分後に再試行
    };
  }
};