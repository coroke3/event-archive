import Image from "next/image";          
import Head from "next/head";          
import Header from "../../components/Header";          
import Footer from "../../components/Footer";        
import Link from "next/link"; // Link コンポーネントをインポート     
import styles from "../../styles/user.module.css";      

// イベント情報を取得する関数          
const fetchEventsData = async () => {          
  const res = await fetch(          
    "https://script.google.com/macros/s/AKfycbybjT6iEZWbfCIzTvU1ALVxp1sa_zS_pGJh5_p_SBsJgLtmzcmqsIDRtFkJ9B8Yko6tyA/exec"          
  );          
  
  if (!res.ok) {          
    console.error(`Failed to fetch event data: ${res.statusText}`);          
    return [];          
  }          
  
  return await res.json();          
};          

export default function EventPage({ events = [] }) {          
  return (          
    <div>          
      <Head>          
        <title>イベント一覧 - PVSF Archive</title>          
        <meta name="description" content="イベントの一覧です。" />          
      </Head>          
      <Header />          
      <div className="content">          
        <h1>イベント一覧</h1>          
        <div className={styles.eventList}> 
          {events.length > 0 ? ( 
            events.map((event) => ( 
              <div key={event.eventid} className={styles.eventItem}> 
                {event.icon ? ( 
                  <Image 
                    src={`https://lh3.googleusercontent.com/d/${event.icon.slice(
                      33
                    )}`} 
                    alt={`${event.eventname}のアイコン`} 
                    width={50} 
                    height={50} 
                  /> 
                ) : ( 
                  <Image 
                    src='https://i.gyazo.com/07a85b996890313b80971d8d2dbf4a4c.jpg' 
                    alt={`アイコン`} 
                    width={50} 
                    height={50} 
                  /> 
                )} 
                <h4>{event.eventname}</h4> 
                <p>主催: {event.member}</p> 
                <p>開催日: {new Date(event.start).toLocaleString()}</p> 
                <Link href={`/event/${event.eventid}`} passHref> 
                  <p className="details">詳細を見る</p> 
                </Link> 
              </div> 
            )) 
          ) : ( 
            <p>イベントが見つかりませんでした。</p> 
          )} 
        </div> 
      </div>          
      <Footer />          
    </div>          
  );          
}          

// 静的にプロパティを取得             
export const getStaticProps = async () => {          
  const events = await fetchEventsData(); // イベントデータを取得          

  return {          
    props: {          
      events, // 取得したイベントデータをpropsに渡す          
    },          
    revalidate: 60, // 60秒ごとに再生成を許可するオプション（必要に応じて調整）          
  };          
};   
