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
  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbzXvxOyXNXF6dUjsw0vbJxb_mLvWKhvk8l14YEOyBHsGOn25X-T4LnYcvTpvwxrqq5Xvw/exec",
    {
      headers: {
        "Cache-Control": "no-cache",
      },
      cache: "no-store", // キャッシュを無効にする
    }
  );

  if (!res.ok) {
    console.error(`Failed to fetch user data: ${res.statusText}`);
    return null;
  }

  const usersData = await res.json();
  return usersData.find((user) => user.username === username);
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
      return memberIds.some((memberId) => memberId.trim() === id); // id と一致するかチェック
    }
    return false; // memberid が存在しない場合は false
  });
};

export default function UserWorksPage({ user, works, collaborationWorks }) {
  const firstWork = works.length > 0 ? works[0] : null;
  const firstCreator = firstWork ? firstWork.creator : "";
  const firstYchlink = firstWork ? firstWork.ychlink : "";
  const firstIcon = firstWork ? firstWork.icon : "";
  const firstTlink = firstWork ? firstWork.tlink : ""; // 追加：最初のtlink

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
      <div className="content">
        {firstWork && (
          <div className={styles.first}>
            {firstIcon && (
              <Image
                src={`https://lh3.googleusercontent.com/d/${firstIcon.slice(
                  33
                )}`} // アイコンの URL
                className={styles.uicon}
                alt={`${firstCreator}のアイコン`}
                width={150}
                height={150}
              />
            )}
            <Image
              src={firstWork.largeThumbnail} // サムネイルの URL
              alt={`${firstWork.title} - ${firstCreator} | PVSF archive`}
              className={styles.uback}
              width={1280}
              height={720}
            />
            <div className={styles.textblock}>
              <h2>{firstCreator}</h2>

              <a
                className={styles.username}
                href={`${firstYchlink}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faYoutube} />
              </a>

              {firstTlink && (
                <a
                  className={styles.username}
                  href={`https://twitter.com/${firstTlink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faXTwitter} />@{user.username}
                </a>
              )}
            </div>
          </div>
        )}

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
              className={`works ${work.status === "private" ? "private" : ""} ${
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
      <Footer />
    </div>
  );
}

export const getStaticPaths = async () => {
  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbzXvxOyXNXF6dUjsw0vbJxb_mLvWKhvk8l14YEOyBHsGOn25X-T4LnYcvTpvwxrqq5Xvw/exec"
  );

  const usersData = await res.json();
  const paths = usersData.map((user) => ({
    params: { id: user.username },
  }));

  return { paths, fallback: false }; // fallbackをfalseにして、全てのページをビルド時に生成
};

export const getStaticProps = async ({ params }) => {
  const { id } = params;
  const user = await fetchUserData(id);
  const worksData = await fetchWorksData();
  const works = worksData.filter((work) => work.tlink === id);
  const collaborationWorks = fetchCollaborationWorksData(worksData, id);

  if (!user) {
    return {
      notFound: true, // ユーザーが存在しない場合404ページにリダイレクト
    };
  }

  return {
    props: {
      user,
      works,
      collaborationWorks,
    },
  };
};
