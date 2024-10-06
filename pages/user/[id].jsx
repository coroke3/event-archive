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

const fetchUserData = async (username) => { 
  const res = await fetch( 
    "https://script.google.com/macros/s/AKfycbzXvxOyXNXF6dUjsw0vbJxb_mLvWKhvk8l14YEOyBHsGOn25X-T4LnYcvTpvwxrqq5Xvw/exec", 
    { 
      headers: { 
        "Cache-Control": "no-cache", 
      }, 
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
  const res = await fetch("https://pvsf-cash.vercel.app/api/videos");

  if (!res.ok) {
    console.error(`Failed to fetch works data: ${res.statusText}`);
    return [];
  }

  return await res.json();
};

const fetchCollaborationWorksData = async (worksData, id) => {
  const collaborationWorks = worksData.filter((work) => {
    if (work.memberid) {
      const memberIds = work.memberid.split(","); // カンマで分割
      return memberIds.some((memberId) => memberId.trim() === id); // id と一致するかチェック
    }
    return false; // memberid が存在しない場合は false
  });

  return collaborationWorks; // 修正: collaborationWorks を返す
};

export default function UserWorksPage({ user, works, collaborationWorks }) {
  const router = useRouter();

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
      <Header />
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

              return (
                <div
                  className={`works ${isPrivate ? styles.private : ""}`}
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
                  {isPrivate && <p className={styles.privateMsg}>非公開</p>}
                </div>
              );
            })
          ) : (
            <p>このユーザーは作品を持っていません。</p>
          )}
        </div>
        <div className="work">
          <h2>参加した合作</h2>
          {collaborationWorks.length > 0 ? ( // collaborationWorksが存在するかチェック
            collaborationWorks.map((work) => (
              <div key={work.ylink} className="works">
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
              </div>
            ))
          ) : (
            <p>作品が見つかりませんでした。</p> // 作品が見つからない場合のメッセージ
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export const getStaticPaths = async () => {
  const worksData = await fetchWorksData(); // 作品データを取得
  const usernames = new Set(); // 重複を排除するためのSetを作成
  const paths = worksData
    .filter((work) => work.tlink && work.username) // tlinkがあり、usernameが存在する作品のみ
    .map((work) => {
      const username = work.username.toLowerCase(); // usernameを小文字にする
      if (!usernames.has(username)) {
        // 重複チェック
        usernames.add(username); // Setに追加
        return { params: { id: username } }; // 重複しなければパスを生成
      }
      return null; // 重複する場合はnullを返す
    })
    .filter(Boolean); // nullを除外

  return {
    paths,
    fallback: "blocking", // ページが見つからない場合はビルドを待つ
  };
};

export const getStaticProps = async ({ params }) => {
  const { id } = params;

  const userData = await fetchUserData(id); // ビルド時にデータを取得
  const worksData = await fetchWorksData();

  // ここでビルド時にデータを取得し、ビルド後にキャッシュを使用する
  const userWorks = await Promise.all(
    worksData.filter(
      (work) => work.tlink && work.tlink.toLowerCase() === id.toLowerCase()
    )
  );

  const collaborationWorks = await fetchCollaborationWorksData(worksData, id);

  if (!userData && userWorks.length === 0 && collaborationWorks.length === 0) {
    return {
      notFound: true, // ユーザーや作品が見つからない場合の対処
    };
  }

  return {
    props: {
      user: userData,
      works: userWorks,
      collaborationWorks,
    },
    revalidate: 172800, // 2日ごとにISRを実行
  };
};
