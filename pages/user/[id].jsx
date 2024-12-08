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

const fetchUserData = async (username) => {
  const res = await fetch("https://pvsf-cash.vercel.app/api/users", {
    headers: {
      "Cache-Control": "no-cache",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error(`Failed to fetch user data: ${res.statusText}`);
    return null;
  }

  const usersData = await res.json();
  const user = usersData.find((user) => user.username === username);

  if (user) {
    // 全ての作品データを取得
    const allWorksData = await fetchWorksData();

    // .tlinkが一致する作品をフィルタリング
    const matchedWorksByTlink = allWorksData.filter(
      (work) => work.tlink?.toLowerCase() === username.toLowerCase()
    );

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
};

const fetchWorksData = async () => {
  const res = await fetch("https://pvsf-cash.vercel.app/api/videos", {
    cache: "no-store", // キャッシュを無効にする
  });

  if (!res.ok) {
    console.error(`Failed to fetch works data: ${res.statusText}`);
    return [];
  }

  return await res.json();
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
          {user ? `${user.username}の作品 - PVSF Archive` : "作品一覧"}
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
            {Array.isArray(works) && works.length > 0 ? (
              works.map((work) => {
                const showIcon = work.icon !== undefined && work.icon !== "";
                const isPrivate =
                  work.status === "private" || work.status === "unknown";
                const isUnlisted = work.status === "unlisted"; // 限定公開かどうかを判定

                return (
                  <div
                    className={`works ${isPrivate ? "private" : ""} ${
                      work.status === "unlisted" ? "unlisted" : ""
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

          <div className="work">
            <h2>参加した合作</h2>
            {collaborationWorks.length > 0 ? (
              collaborationWorks.map((work) => (
                <div
                  className={`works ${
                    work.status === "private" ? "private" : ""
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
        </div>
      </div>
      <Footer />
    </div>
  );
}

export const getStaticPaths = async () => {
  const res = await fetch("https://pvsf-cash.vercel.app/api/users");

  if (!res.ok) {
    console.error(`Failed to fetch users data: ${res.statusText}`);
    return {
      paths: [],
      fallback: false, // 動的生成に切り替え
    };
  }

  const usersData = await res.json();
  const paths = usersData.map((user) => ({
    params: { id: user.username },
  }));

  return { paths, fallback: false }; // 動的生成を有効に
};

export const getStaticProps = async ({ params }) => {
  const { id } = params;

  const user = await fetchUserData(id);
  const worksData = await fetchWorksData();

  if (!user || !worksData) {
    return {
      notFound: true,
    };
  }

  const works = worksData.filter(
    (work) => work.tlink?.toLowerCase() === id.toLowerCase()
  );
  const collaborationWorks = fetchCollaborationWorksData(worksData, id);

  return {
    props: {
      user,
      works,
      collaborationWorks,
    },
  };
};
