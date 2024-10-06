import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles/works.module.css";
import Head from "next/head";

// メインコンポーネント
export default function Home({ work }) {
  const [filter, setFilter] = useState({
    public: true,
    unlisted: true,
    private: false,
  });

  // チェックボックスの変更をハンドルする関数
  const handleFilterChange = (event) => {
    const { name, checked } = event.target;
    setFilter((prev) => ({ ...prev, [name]: checked }));
  };

  // 表示する作品をフィルタリング
  const displayedWorks = work.filter(
    (item) =>
      (filter.public && item.status === "public") ||
      (filter.unlisted && item.status === "unlisted") ||
      (filter.private && (item.status === "private" || item.status === "unknown"))
  );

  return (
    <div>
      <Head>
        <title>過去の投稿作品 - オンライン映像イベント / PVSF archive</title>
        <meta name="description" content={`過去の投稿作品です。ぜひご覧ください。`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@pvscreeningfes" />
        <meta name="twitter:creator" content="@coroke3" />
        <meta property="og:url" content="pvsf.jp/work" />
        <meta property="og:title" content="過去の投稿作品 - オンライン映像イベント / PVSF archive" />
        <meta property="og:description" content="過去の投稿作品です。ぜひご覧ください。" />
        <meta property="og:image" content="https://i.gyazo.com/35170e03ec321fb94276ca1c918efabc.jpg" />
      </Head>
      <Header />

      {/* チェックボックスによるフィルタリング */}
      <div className="filter-options">
        <label>
          <input
            type="checkbox"
            name="public"
            checked={filter.public}
            onChange={handleFilterChange}
          />
          公開作品
        </label>
        <label>
          <input
            type="checkbox"
            name="unlisted"
            checked={filter.unlisted}
            onChange={handleFilterChange}
          />
          限定公開作品
        </label>
        <label>
          <input
            type="checkbox"
            name="private"
            checked={filter.private}
            onChange={handleFilterChange}
          />
          非公開作品
        </label>
      </div>

      <div className="content">
        <div className="work">
          {displayedWorks.length > 0 ? (
            displayedWorks.map((work) => {
              const showIcon = work.icon && work.icon !== "";
              const isPrivate = work.status === "private" || work.status === "unknown"; // 非公開かどうかを判定

              return (
                <div className={`works ${isPrivate ? 'private' : ''}`} key={work.ylink}>
                  <Link href={`../${work.ylink.slice(17, 28)}`}>
                    <Image
                      src={work.smallThumbnail || `https://img.youtube.com/vi/${extractVideoId(work.ylink)}/mqdefault.jpg`} // smallThumbnailが無い場合はデフォルトサムネイル
                      alt={`${work.title} - ${work.creator} | PVSF archive`}
                      className="samune"
                      width={640}
                      height={360}
                    />
                  </Link>
                  <h3>{work.title}</h3>
                  <div className="subtitle">
                    {showIcon ? (
                      <Image
                        src={`https://lh3.googleusercontent.com/d/${work.icon.slice(33)}`}
                        className="icon"
                        alt={`${work.creator}のアイコン`}
                        width={50}
                        height={50}
                      />
                    ) : (
                      <Image
                        src='https://i.gyazo.com/07a85b996890313b80971d8d2dbf4a4c.jpg'
                        alt={`アイコン`}
                        className="icon"
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

// 新しいエンドポイントからデータを取得
export const getStaticProps = async () => { 
  const res = await fetch(`https://pvsf-cash.vercel.app/api/videos`, { // フルURLを使用
    headers: { 
      "Cache-Control": "no-cache", // キャッシュを使用しない 
    }, 
  }); 
 
  if (!res.ok) { 
    console.error(`Failed to fetch work data: ${res.statusText}`); 
    return { props: { work: [] } }; // エラー時は空の配列を返す 
  } 
 
  const work = await res.json(); 
 
  return { 
    props: { work }, 
    revalidate: 172800, // 2日ごとに再生成 
  }; 
};


// ylinkから動画IDを抽出する関数
function extractVideoId(url) {
  const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}
