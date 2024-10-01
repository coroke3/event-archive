import Link from "next/link";  
import Image from "next/image";  
import Header from "../components/Header";  
import Footer from "../components/Footer";  
import styles from "../styles/works.module.css";  
import Head from "next/head";  

// YouTube Data APIを使って公開状態を取得する関数
const getVideoPrivacyStatus = async (videoId) => {
  const apiKey = process.env.YOUTUBE_API_KEY; // 環境変数からAPIキーを取得
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=status`;
  const videoRes = await fetch(apiUrl);
  const videoData = await videoRes.json();
  return videoData.items.length > 0 ? videoData.items[0].status.privacyStatus : 'unknown';
};

export default function Home({ work }) {  
  // -9時間を引く関数  
  const subtractNineHours = (dateString) => {  
    const originalDate = new Date(dateString);  
    const modifiedDate = new Date(originalDate.getTime() - 9 * 60 * 60 * 1000);  
    return modifiedDate.toLocaleString();  
  };  

  return (  
    <div>  
      <Head>  
        <title>過去の投稿作品 - オンライン映像イベント / PVSF archive</title>  
        <meta  
          name="description"  
          content={`過去の投稿作品です。ぜひご覧ください。`}  
        />  
        <meta name="twitter:card" content="summary" />  
        <meta name="twitter:site" content="@pvscreeningfes" />  
        <meta name="twitter:creator" content="@coroke3" />  
        <meta property="og:url" content="pvsf.jp/work" />  
        <meta property="og:title" content="過去の投稿作品 - オンライン映像イベント / PVSF archive" />  
        <meta property="og:description" content="過去の投稿作品です。ぜひご覧ください。" />  
        <meta  
          property="og:image"  
          content="https://i.gyazo.com/35170e03ec321fb94276ca1c918efabc.jpg"  
        />  
      </Head>  
      <Header />  
      <div className="content">  
        <div className={styles.work}>  
          {work.map((work) => {  
            // 各作品のアイコンの表示判定 
            const showIcon = work.icon !== undefined && work.icon !== "";  
            
            return (  
              <div className={styles.works} key={work.ylink}>  
                <Link href={`../${work.ylink.slice(17, 28)}`}>  
                  <Image 
                    src={`https://i.ytimg.com/vi/${work.ylink.slice(17, 28)}/maxresdefault.jpg`}  
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
                  <p>  
                    {work.creator}  
                  </p>  
                  <p>  
                    {work.status === 'public' ? '公開中' : '非公開'}  
                  </p> {/* 公開状態を表示 */}
                </div> 
              </div>  
            );  
          })}  
        </div>  
      </div>  
      <Footer />  
    </div>  
  );  
}  

export const getStaticProps = async () => {  
  const res = await fetch(  
    "https://script.google.com/macros/s/AKfycbyEph6zXb1IWFRLpTRLNLtxU4Kj7oe10bt2ifiyK09a6nM13PASsaBYFe9YpDj9OEkKTw/exec"  
  );  
  const work = await res.json();  

  // 各動画の公開状態を取得し、workに追加
  const workWithStatus = await Promise.all(work.map(async (item) => {
    const videoId = item.ylink.slice(17, 28); // ylinkから動画IDを抽出
    const status = await getVideoPrivacyStatus(videoId);
    return { ...item, status }; // 元のデータに公開状態を追加
  }));

  return {  
    props: { work: workWithStatus },  
  };  
}; 
