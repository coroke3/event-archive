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

const getVideoData = async (videoId, fallbackUrl) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,status`;

  try {
    const videoRes = await fetch(apiUrl);

    if (!videoRes.ok) {
      console.warn(`YouTube API の取得に失敗しました: ${videoRes.statusText}`);
      return {
        status: "public",
        thumbnailUrl:
          fallbackUrl || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      };
    }

    const videoData = await videoRes.json();

    if (videoData.items.length > 0) {
      const videoItem = videoData.items[0];
      const status = videoItem.status.privacyStatus || "public";
      const thumbnails = videoItem.snippet.thumbnails;

      const defaultThumbnailUrl = "/default-thumbnail.jpg";
      const thumbnailUrl =
        thumbnails?.maxres?.url ||
        thumbnails?.high?.url ||
        thumbnails?.medium?.url ||
        thumbnails?.default?.url ||
        defaultThumbnailUrl;

      return { status, thumbnailUrl };
    }

    return {
      status: "private",
      thumbnailUrl:
        fallbackUrl || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    };
  } catch (error) {
    console.error(`API 呼び出しエラー: ${error.message}`);
    return {
      status: "public",
      thumbnailUrl:
        fallbackUrl || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    };
  }
};

const fetchUserData = async (username) => {
  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbzXvxOyXNXF6dUjsw0vbJxb_mLvWKhvk8l14YEOyBHsGOn25X-T4LnYcvTpvwxrqq5Xvw/exec",
    {
      headers: {
        "Cache-Control": "public, max-age=172800", // 2日間キャッシュ
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
  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbyEph6zXb1IWFRLpTRLNLtxU4Kj7oe10bt2ifiyK09a6nM13PASsaBYFe9YpDj9OEkKTw/exec"
  );

  if (!res.ok) {
    console.error(`Failed to fetch works data: ${res.statusText}`);
    return [];
  }

  return await res.json();
};

// fetchCollaborationWorksData関数内でアイコンを取得
const fetchCollaborationWorksData = async (worksData, id) => { 
  const collaborationWorks = worksData.filter((work) => { 
    if (work.memberid) { 
      const memberIds = work.memberid.split(','); // カンマで分割 
      return memberIds.some(memberId => memberId.trim() === id); // id と一致するかチェック 
    } 
    return false; // memberid が存在しない場合は false 
  }); 

  // 動画IDとサムネイルURLを取得 
  const updatedCollaborationWorks = await Promise.all( 
    collaborationWorks.map(async (work) => { 
      const videoId = work.ylink.slice(17, 28); // ylinkから動画IDを取得 
      const fallbackUrl = work.thumbnailUrl; // ここでサムネイルURLを設定 
      const { status, thumbnailUrl } = await getVideoData(videoId, fallbackUrl); 

      // アイコンの取得
      const creatorUserData = await fetchUserData(work.creator); // creatorからユーザー情報を取得
      const creatorIcon = creatorUserData ? creatorUserData.icon : ""; // アイコンを取得

      return { ...work, status, thumbnailUrl, creatorIcon }; // 作品データにステータスとサムネイル、アイコンを追加 
    }) 
  ); 

  return updatedCollaborationWorks; 
}; 

export default function UserWorksPage({ user, works, collaborationWorks }) {
  const router = useRouter();

  const firstWork = works.length > 0 ? works[0] : null;
  const firstCreator = firstWork ? firstWork.creator : "";
  const firstYchlink = firstWork ? firstWork.ychlink : "";
  const firstThumbnailUrl = firstWork ? firstWork.thumbnailUrl : "";
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
              src={firstThumbnailUrl} // サムネイルの URL
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
                      src={work.thumbnailUrl}
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

        {collaborationWorks.length > 0 && (
          <div className="work">
            <h2>参加合作作品</h2>
            {collaborationWorks.map((work) => (
              <div key={work.ylink} className="works">
                <Link href={`../${work.ylink.slice(17, 28)}`}>
                  <Image
                    src={work.thumbnailUrl}
                    alt={`${work.title} - ${work.creator} | PVSF archive`}
                    className="samune"
                    width={640}
                    height={360}
                  />
                </Link>
                <h3>{work.title}</h3>
                <div className="subtitle">
                  {work.creatorIcon ? (
                    <Image
                      src={`https://lh3.googleusercontent.com/d/${work.creatorIcon.slice(
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
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export const getStaticPaths = async () => {
  const worksData = await fetchWorksData(); // 作品データを取得
  const paths = worksData
    .filter((work) => work.tlink) // tlinkがある作品のみ
    .map((work) => ({ params: { id: work.tlink.toLowerCase() } })); // tlinkを小文字にしてパスを生成

  return {
    paths,
    fallback: "blocking", // ページが見つからない場合はビルドを待つ
  };
};

export const getStaticProps = async ({ params }) => {
  const { id } = params;

  const userData = await fetchUserData(id);
  const worksData = await fetchWorksData();

  const userWorks = await Promise.all(
    worksData
      .filter(
        (work) => work.tlink && work.tlink.toLowerCase() === id.toLowerCase()
      )
      .map(async (work) => {
        const videoId = work.ylink.slice(17, 28);
        const fallbackUrl = work.thumbnailUrl; // ここでサムネイルURLを設定
        const { status, thumbnailUrl } = await getVideoData(
          videoId,
          fallbackUrl
        );

        return { ...work, status, thumbnailUrl };
      })
  );

  // 参加合作を取得
  const collaborationWorks = await fetchCollaborationWorksData(worksData, id); // 修正

  return {
    props: {
      user: userData,
      works: userWorks,
      collaborationWorks, // 追加
    },
    revalidate: 172800, // 2日 (172800秒) ごとに再生成
  };
};
