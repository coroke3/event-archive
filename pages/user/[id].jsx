// pages/user/[id].jsx

import { useRouter } from "next/router"; 
import Image from "next/image"; 
import Head from "next/head"; 
import Link from "next/link"; 
import Header from "../../components/Header"; 
import Footer from "../../components/Footer"; 
import styles from "../../styles/works.module.css"; 

const getVideoData = async (videoId) => { 
  const apiKey = process.env.YOUTUBE_API_KEY; 
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,status`; 

  try { 
    const videoRes = await fetch(apiUrl); 

    if (!videoRes.ok) { 
      console.warn(`YouTube API の取得に失敗しました: ${videoRes.statusText}`); 
      return { 
        status: "public", 
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`, 
      }; 
    } 

    const videoData = await videoRes.json(); 

    if (videoData.items.length > 0) { 
      const videoItem = videoData.items[0]; 
      const status = videoItem.status.privacyStatus || "public"; 
      const thumbnails = videoItem.snippet.thumbnails; 

      const defaultThumbnailUrl = "/default-thumbnail.jpg"; 
      const thumbnailUrl = thumbnails?.maxres?.url || thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url || defaultThumbnailUrl; 

      return { status, thumbnailUrl }; 
    } 

    return { 
      status: "private", 
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`, 
    }; 

  } catch (error) { 
    console.error(`API 呼び出しエラー: ${error.message}`); 
    return { 
      status: "public", 
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`, 
    }; 
  } 
}; 

const fetchUserData = async (username) => { 
  const res = await fetch("https://script.google.com/macros/s/AKfycbzXvxOyXNXF6dUjsw0vbJxb_mLvWKhvk8l14YEOyBHsGOn25X-T4LnYcvTpvwxrqq5Xvw/exec", { 
    headers: { 
      'Cache-Control': 'public, max-age=172800' // 2日間キャッシュ 
    } 
  }); 

  if (!res.ok) { 
    console.error(`Failed to fetch user data: ${res.statusText}`); 
    return null; 
  } 

  const usersData = await res.json(); 
  return usersData.find(user => user.username === username); 
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
        <div className="work"> 
          {Array.isArray(works) && works.length > 0 ? ( 
            works.map((work) => { 
              const showIcon = work.icon !== undefined && work.icon !== ""; 
              const isPrivate = work.status === "private" || work.status === "unknown"; 

              return ( 
                <div className={`works ${isPrivate ? styles.private : ""}`} key={work.ylink}> 
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
            <p>作品が見つかりませんでした。</p> 
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
  const paths = usersData.map(user => ({ params: { id: user.username } })); // 修正点

  return { paths, fallback: false }; 
}; 

export const getStaticProps = async ({ params }) => { 
  const { id } = params; // 修正点

  const userData = await fetchUserData(id); 
  const worksData = await fetchWorksData(); 

  const userWorks = await Promise.all(worksData.filter(work => work.tlink && work.tlink.toLowerCase() === id.toLowerCase()).map(async (work) => { 
    const videoId = work.ylink.slice(17, 28); 
    const { status, thumbnailUrl } = await getVideoData(videoId); 

    return { ...work, status, thumbnailUrl }; 
  })); 

  return { 
    props: { 
      user: userData, 
      works: userWorks, 
    }, 
    revalidate: 172800, // 2日 (172800秒) ごとに再生成 
  }; 
}; 
