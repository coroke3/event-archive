import { useState } from "react"; 
import Link from "next/link"; 
import Image from "next/image"; 
import Header from "../components/Header"; 
import Footer from "../components/Footer"; 
import styles from "../styles/works.module.css"; 
import Head from "next/head"; 
import fs from "fs"; 
import path from "path"; 

// キャッシュファイルのパス
const cacheFilePath = path.join(process.cwd(), "cache", "youtubeCache.json");

// YouTube Data APIを使って公開状態とサムネイルURLを取得する関数   
const getVideoData = async (videoId) => {   
  const apiKey = process.env.YOUTUBE_API_KEY; // 環境変数からAPIキーを取得   
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,status`; // snippetとstatusを取得   
  
  try { 
    const videoRes = await fetch(apiUrl);   
  
    if (!videoRes.ok) {   
      console.error(`Failed to fetch video data: ${videoRes.statusText}`);   
      const fallbackThumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;   
      return { status: "public", thumbnailUrl: fallbackThumbnailUrl };   
    }   
  
    const videoData = await videoRes.json();   
    if (videoData.items.length > 0) {   
      const videoItem = videoData.items[0];   
      const status = videoItem.status.privacyStatus;   
      const thumbnails = videoItem.snippet.thumbnails;   
  
      const errorThumbnailUrl = "/error-thumbnail.jpg"; // エラー画像のパス   
      const thumbnailUrl =   
        thumbnails?.maxres?.url ||  // maxresを最優先に使用   
        thumbnails?.high?.url ||   
        thumbnails?.medium?.url ||   
        thumbnails?.default?.url ||   
        errorThumbnailUrl; // サムネイルが存在しない場合はエラー画像を使用 
  
      saveCache(videoId, { status, thumbnailUrl }); // キャッシュを保存
      return { status, thumbnailUrl };   
    }   
    
    const fallbackThumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;   
    return { status: "public", thumbnailUrl: fallbackThumbnailUrl };   
  } catch (error) { 
    console.error(`API 呼び出しエラー: ${error.message}`); 
    const fallbackThumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;   
    return { status: "public", thumbnailUrl: fallbackThumbnailUrl };   
  } 
};  

// キャッシュを取得する関数
const getCache = () => {
  if (fs.existsSync(cacheFilePath)) {
    const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, "utf-8"));
    const now = new Date();
    const cacheTime = new Date(cacheData.timestamp);

    // キャッシュが2日以内であればそのまま返す
    if (now - cacheTime < 2 * 24 * 60 * 60 * 1000) {
      return cacheData.data;
    }
  }
  return null; // キャッシュが存在しないか古い場合
};

// キャッシュを保存する関数
const saveCache = (videoId, data) => {
  const cache = getCache() || {};
  cache[videoId] = data;
  fs.writeFileSync(cacheFilePath, JSON.stringify({ timestamp: new Date(), data: cache }, null, 2));
};

// メインコンポーネント
export default function Home({ work }) {  
  const [filter, setFilter] = useState({ public: true, unlisted: true, private: false });  
  
  // チェックボックスの変更をハンドルする関数  
  const handleFilterChange = (event) => {  
    const { name, checked } = event.target;  
    setFilter((prev) => ({ ...prev, [name]: checked }));  
  };  
  
  // 表示する作品をフィルタリング  
  const displayedWorks = work.filter((item) =>  
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
        <div className={styles.work}>  
          {displayedWorks.length > 0 ? (  
            displayedWorks.map((work) => {  
              const showIcon = work.icon !== undefined && work.icon !== "";  
              const isPrivate = work.status === "private" || work.status === "unknown"; // 非公開かどうかを判定  
 
              return (  
                <div  
                  className={`${styles.works} ${isPrivate ? styles.private : ""}`}  
                  key={work.ylink}  
                >  
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
    </div>  
  );  
}  

// YouTube APIからステータスとサムネイルを取得し、作品データに付加する 
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
      const cachedData = getCache(); // キャッシュを取得

      // キャッシュからデータを取得、無ければAPIから取得
      const { status, thumbnailUrl } = cachedData?.[videoId] || await getVideoData(videoId); 

      return {  
        ...item,  
        status,  
        thumbnailUrl: thumbnailUrl || '/default-thumbnail.jpg'  
      }; 
    }) 
  ); 
 
  return { 
    props: { work: workWithStatus }, 
  }; 
}; 
