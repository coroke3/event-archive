import { useRouter } from "next/router";       
import Image from "next/image";       
import Head from "next/head";       
import Link from "next/link"; 
import Header from "../../components/Header";       
import Footer from "../../components/Footer";       
import styles from "../../styles/works.module.css"; 


// YouTube Data APIを使って公開状態とサムネイルURLを取得する関数   
const getVideoData = async (videoId) => {
  const apiKey = process.env.YOUTUBE_API_KEY; // 環境変数からAPIキーを取得
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,status`; // snippetとstatusを取得

  try {
    const videoRes = await fetch(apiUrl);

    // API 呼び出しが成功したかチェック
    if (!videoRes.ok) {
      console.warn(`YouTube API の取得に失敗しました: ${videoRes.statusText}`);
      return {
        status: "public", // API が失敗した場合でも公開扱いにする
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`, // URL準拠でサムネイルを取得
      };
    }

    const videoData = await videoRes.json();

    // API のレスポンスに動画データが含まれているかを確認
    if (videoData.items.length > 0) {
      const videoItem = videoData.items[0];
      const status = videoItem.status.privacyStatus || "public"; // ステータスが不明なら公開扱いにする
      const thumbnails = videoItem.snippet.thumbnails;

      // サムネイルが存在しない場合はデフォルトのエラー画像を設定
      const defaultThumbnailUrl = "/default-thumbnail.jpg";
      const thumbnailUrl = thumbnails?.maxres?.url || thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url || defaultThumbnailUrl;

      return { status, thumbnailUrl };
    }

    return {
      status: "public", // API データが空でも公開扱いにする
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`, // デフォルトで YouTube URL 準拠のサムネイルを使用
    };

  } catch (error) {
    // API 呼び出しにエラーが発生した場合
    console.error(`API 呼び出しエラー: ${error.message}`);
    return {
      status: "public", // エラー時も公開扱い
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`, // URL 準拠でサムネイルを取得
    };
  }
};


// ユーザー情報を取得する関数       
const fetchUserData = async (username) => {       
  const res = await fetch(       
    "https://script.google.com/macros/s/AKfycbzXvxOyXNXF6dUjsw0vbJxb_mLvWKhvk8l14YEOyBHsGOn25X-T4LnYcvTpvwxrqq5Xvw/exec"       
  );       
 
  if (!res.ok) {       
    console.error(`Failed to fetch user data: ${res.statusText}`);       
    return null; // エラー時は null を返す       
  }       
 
  const usersData = await res.json();       
  return usersData.find(user => user.username === username);       
};       

// 作品情報を取得する関数       
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

export default function UserWorksPage({ user, works }) {       
  const router = useRouter();       

  return (
    <div>
      <Head>
        <title>{user ? `${user.username}の作品 - PVSF Archive` : "作品一覧"}</title>
        <meta name="description" content={user ? `${user.username}の作品一覧です。` : "作品一覧です。"} />
      </Head>
      <Header />
      <div className="content">
        <h1>{user ? `${user.username}の作品` : "ユーザー情報を取得中..."}</h1>
        <div className={styles.work}>
          {Array.isArray(works) && works.length > 0 ? ( // Ensure works is an array
            works.map((work) => {
              const showIcon = work.icon !== undefined && work.icon !== "";
              const isPrivate = work.status === "private" || work.status === "unknown"; // 非公開かどうかを判定
  
              return (
                <div className={`${styles.works} ${isPrivate ? styles.private : ""}`} key={work.ylink}>
                  <Link href={`../${work.ylink.slice(17, 28)}`}>
                    <Image
                      src={work.thumbnailUrl} // 動的に取得したサムネイルURLを使用
                      alt={`${work.title} - ${work.creator} | PVSF archive`}
                      className={styles.samune}
                      width={640}
                      height={360}
                    />
                  </Link>
                  <h3>{work.title}</h3>
                  <div className={styles.subtitle}>
                    {showIcon && (
                      <Image
                        src={`https://lh3.googleusercontent.com/d/${work.icon.slice(33)}`}
                        className={styles.icon}
                        alt={`${work.creator} アイコン`}
                        width={50}
                        height={50}
                      />
                    )}
                    <p>{work.creator}</p>
                    <p>
                      {work.status === "public"
                        ? "公開中"
                        : work.status === "unlisted"
                        ? "限定公開"
                        : "非公開"}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p>作品が見つかりませんでした。</p> // 作品が無い場合のメッセージ
          )}
        </div>
      </div>
      <Footer />
      <style jsx>{`
        .works-list {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .work-item {
          display: flex;
          align-items: center;
          margin: 10px 0;
        }
      `}</style>
    </div>
  );
      
}       

// 事前に生成するパスを取得       
export const getStaticPaths = async () => {       
  const res = await fetch(       
    "https://script.google.com/macros/s/AKfycbzXvxOyXNXF6dUjsw0vbJxb_mLvWKhvk8l14YEOyBHsGOn25X-T4LnYcvTpvwxrqq5Xvw/exec"       
  );       
 
  const usersData = await res.json();       
  const paths = usersData.map(user => ({ params: { id: user.username } })); // username を利用してパスを生成       
 
  return { paths, fallback: false }; // fallback: false で指定されたパス以外は404にする       
};       

// 静的にプロパティを取得       
export const getStaticProps = async ({ params }) => {       
  const { id } = params; // URL パラメータからユーザー名を取得       

  const userData = await fetchUserData(id);       
  const worksData = await fetchWorksData();       
  
  // ユーザーの作品データをフィルタリングし、サムネイルとステータスを取得       
  const userWorks = await Promise.all(worksData.filter(work => work.tlink && work.tlink.toLowerCase() === id.toLowerCase()).map(async (work) => {       
    const videoId = work.ylink.slice(17, 28);  
    const { status, thumbnailUrl } = await getVideoData(videoId); // ステータスとサムネイルURLを取得  
    return { ...work, status, thumbnailUrl }; // サムネイルURLも含める  
  }));

  return {       
    props: {       
      user: userData, // ユーザーデータ       
      works: userWorks, // ユーザーの作品データ       
    },       
  };       
};  
