import { useRouter } from "next/router"; 
import Image from "next/image"; 
import Head from "next/head"; 
import Link from "next/link"; 
import Header from "../../components/Header"; 
import Footer from "../../components/Footer"; 
import styles from "../../styles/events.module.css"; 
 
const fetchEventsData = async () => { 
  try { 
    const res = await fetch( 
      "https://script.google.com/macros/s/AKfycbybjT6iEZWbfCIzTvU1ALVxp1sa_zS_pGJh5_p_SBsJgLtmzcmqsIDRtFkJ9B8Yko6tyA/exec", 
      { 
        headers: { "Cache-Control": "no-cache" }, 
        cache: "no-store", 
      } 
    ); 
    if (!res.ok) { 
      throw new Error(`イベントデータの取得に失敗しました (${res.statusText})`); 
    } 
    return await res.json(); 
  } catch (error) { 
    console.error("イベントデータ取得エラー:", error); 
    return { error: true, message: "イベントデータの取得中にエラーが発生しました。" }; 
  } 
}; 
 
const fetchWorksData = async () => { 
  try { 
    const res = await fetch("https://pvsf-cash.vercel.app/api/videos", { 
      cache: "no-store", 
    }); 
    if (!res.ok) { 
      throw new Error(`作品データの取得に失敗しました (${res.statusText})`); 
    } 
    return await res.json(); 
  } catch (error) { 
    console.error("作品データ取得エラー:", error); 
    return { error: true, message: "作品データの取得中にエラーが発生しました。" }; 
  } 
}; 
 
export default function EventPage({ event, works = [], errorMessage = "" }) { 
  if (errorMessage) { 
    return ( 
      <div> 
        <Head> 
          <title>エラー - PVSF Archive</title> 
        </Head> 
        <Header /> 
        <div className="content"> 
          <h1>エラーが発生しました</h1> 
          <p>{errorMessage}</p> 
        </div> 
        <Footer /> 
      </div> 
    ); 
  } 
 
  // Split member-related data 
  const members = event.member ? event.member.split(",") : []; 
  const memberIds = event.memberid ? event.memberid.split(",") : []; 
  const memberPosts = event.menberpost ? event.menberpost.split(",") : []; 
 
  return ( 
    <div> 
      <Head> 
        <title> 
          {event?.eventname ? `${event.eventname} - PVSF Archive` : "イベント一覧"} 
        </title> 
        <meta 
          name="description" 
          content={ 
            event?.eventname 
              ? `${event.eventname}の作品一覧です。` 
              : "イベント一覧です。" 
          } 
        /> 
      </Head> 
      <div className="content"> 
        {event ? ( 
          <> 
            <h1>{event.eventname}</h1> 
            <div className={styles.eventDetails}> 
              {event.icon && ( 
                <Image 
                  src={`https://lh3.googleusercontent.com/d/${event.icon.slice( 
                    33 
                  )}`} 
                  className={styles.eicon} 
                  alt={`${event.eventname}のアイコン`} 
                  width={150} 
                  height={150} 
                /> 
              )} 
              <p>{event.explanation}</p> 
            </div> 
 
            {/* Displaying the members */} 
            {members.length > 0 && ( 
              <div className={styles.members}> 
                <ul> 
                  {members.map((member, index) => ( 
                    <li key={index}> 
                      <p> 
                        <strong>{member}</strong>{" "} 
                        {memberPosts[index] && ` - ${memberPosts[index]}`} 
                      </p> 
                      {memberIds[index] && ( 
                        <Link href={`https://twitter.com/${memberIds[index]}`}> 
                          {`Twitter: @${memberIds[index]}`} 
                        </Link> 
                      )} 
                    </li> 
                  ))} 
                </ul> 
              </div> 
            )} 
 
            {/* Displaying the event image (サムネ) */}
            {event.img && (
              <div className={styles.eventThumbnail}>
                <Image 
                  src={event.img} 
                  alt={`${event.eventname}のサムネイル`} 
                  width={640} 
                  height={360} 
                />
              </div>
            )}
 
          </> 
        ) : ( 
          <p>イベント情報が見つかりませんでした。</p> 
        )} 
 
        {/* Displaying the works */} 
        <div className="work"> 
          <h2>このイベントの作品一覧</h2> 
          {Array.isArray(works) && works.length > 0 ? ( 
            works.map((work) => ( 
              <div className="works" key={work.ylink}> 
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
            <p>このイベントには作品がありません。</p> 
          )} 
        </div> 
      </div> 
      <Footer /> 
    </div> 
  ); 
} 
 
export const getStaticPaths = async () => {
  const eventsData = await fetchEventsData();
  if (eventsData.error) {
    return { paths: [], fallback: false }; // fallback を false に設定
  }

  const paths = eventsData.map((event) => ({
    params: { id: event.eventid },
  }));

  return { paths, fallback: false }; // fallback を false に設定
};

 
export const getStaticProps = async ({ params }) => {
  try {
    const { id } = params;
    const eventsData = await fetchEventsData();
    const event = eventsData.find((event) => event.eventid === id) || null;
    const worksData = await fetchWorksData();
    const works = worksData.filter((work) => work.eventname === event.eventid);

    return { props: { event, works } };
  } catch (error) {
    return { props: { event: null, works: [], errorMessage: "データの取得に失敗しました。" } };
  }
};
