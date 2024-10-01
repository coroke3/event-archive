import { useState } from "react"; // useStateをインポート
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles/works.module.css";
import Head from "next/head";

// YouTube Data APIを使って公開状態を取得する関数
// YouTube Data APIを使って公開状態とサムネイルURLを取得する関数
const getVideoData = async (videoId) => {
  const apiKey = process.env.YOUTUBE_API_KEY; // 環境変数からAPIキーを取得
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,status`; // snippetとstatusを取得
  const videoRes = await fetch(apiUrl);

  if (!videoRes.ok) {
    console.error(`Failed to fetch video data: ${videoRes.statusText}`);
    return { status: "unknown", thumbnails: {} }; // エラー時は'unknown'を返す
  }

  const videoData = await videoRes.json();
  if (videoData.items.length > 0) {
    const videoItem = videoData.items[0];
    const status = videoItem.status.privacyStatus;
    const thumbnails = videoItem.snippet.thumbnails; // サムネイル情報を取得

    return { status, thumbnails }; // ステータスとサムネイル情報を返す
  }

  return { status: "unknown", thumbnails: {} }; // データが無い場合
};

export default function Home({ work }) {
  const [showPrivate, setShowPrivate] = useState(false);

  // 非公開作品の表示・非表示を切り替える関数
  const togglePrivateWorks = () => {
    setShowPrivate(!showPrivate);
  };

  // 表示する作品をフィルタリング
  const displayedWorks = showPrivate
    ? work
    : work.filter(
        (item) => item.status === "public" || item.status === "unlisted"
      );

  return (
    <div>
      {/* ヘッダーやメタタグの部分は省略 */}

      {/* 非公開作品の表示・非表示切替ボタン */}
      <div className="toggle-button">
        <button onClick={togglePrivateWorks}>
          {showPrivate ? "非公開作品を非表示" : "非公開作品を表示"}
        </button>
      </div>

      <div className="content">
        <div className={styles.work}>
          {displayedWorks.length > 0 ? (
            displayedWorks.map((work) => {
              const showIcon = work.icon !== undefined && work.icon !== "";
              const isPrivate =
                work.status === "private" || work.status === "unknown";

              // サムネイルの取得。まずthumbnailsが存在するかチェック
              const thumbnails = work.thumbnails || {};
              const thumbnailUrl =
                thumbnails.maxres?.url ||
                thumbnails.high?.url ||
                thumbnails.default?.url ||
                ""; // デフォルトのサムネイルを設定

              return (
                <div
                  className={`${styles.works} ${
                    isPrivate ? styles.private : ""
                  }`}
                  key={work.ylink}
                >
                  <Link href={`../${work.ylink.slice(17, 28)}`}>
                    <Image
                      src={thumbnailUrl} // サムネイルURLを使用
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
                        src={`https://lh3.googleusercontent.com/d/${work.icon.slice(
                          33
                        )}`}
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
    </div>
  );
}

// サムネイル情報を取得してステータスと一緒に返す
export const getStaticProps = async () => {
  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbyEph6zXb1IWFRLpTRLNLtxU4Kj7oe10bt2ifiyK09a6nM13PASsaBYFe9YpDj9OEkKTw/exec"
  );

  if (!res.ok) {
    console.error(`Failed to fetch work data: ${res.statusText}`);
    return { props: { work: [] } }; // エラー時は空の配列を返す
  }

  const work = await res.json();

  const workWithStatus = await Promise.all(
    work.map(async (item) => {
      const videoId = item.ylink.slice(17, 28);
      const { status, thumbnails } = await getVideoData(videoId); // ステータスとサムネイルを取得
      return { ...item, status, thumbnails }; // サムネイル情報も含める
    })
  );

  return {
    props: { work: workWithStatus },
  };
};
