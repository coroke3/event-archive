// pages/event/[id].jsx

import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "../../styles/events.module.css";

const fetchEventsData = async () => {
  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbybjT6iEZWbfCIzTvU1ALVxp1sa_zS_pGJh5_p_SBsJgLtmzcmqsIDRtFkJ9B8Yko6tyA/exec",
    {
      headers: {
        "Cache-Control": "no-cache",
      },
      cache: "no-store", // キャッシュを無効にする  
    }
  );

  if (!res.ok) {
    console.error(`Failed to fetch events data: ${res.statusText}`);
    return [];
  }

  return await res.json();
};

const fetchWorksData = async () => {
  const res = await fetch("https://pvsf-cash.vercel.app/api/videos", {
    cache: "no-store", // キャッシュを無効にする  
  });

  if (!res.ok) {
    console.error(`Failed to fetch works data: ${res.statusText}`);
    return [];
  }

  return await res.json();
};

export default function EventPage({ event, works = [] }) {
  return (
    <div>
      <Head>
        <title>{event ? `${event.eventname} - PVSF Archive` : "イベント一覧"}</title>
        <meta
          name="description"
          content={event ? `${event.eventname}の作品一覧です。` : "イベント一覧です。"}
        />
      </Head>
      <Header />
      <div className="content">
        <h1>{event.eventname}</h1>
        <div className={styles.eventDetails}>
          {event.icon && (
            <Image
              src={`https://lh3.googleusercontent.com/d/${event.icon.slice(33)}`} // イベントのアイコンの URL   
              className={styles.eicon}
              alt={`${event.eventname}のアイコン`}
              width={150}
              height={150}
            />
          )}
          <p>{event.description}</p>
        </div>

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
                      src={`https://lh3.googleusercontent.com/d/${work.icon.slice(33)}`}
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
  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbybjT6iEZWbfCIzTvU1ALVxp1sa_zS_pGJh5_p_SBsJgLtmzcmqsIDRtFkJ9B8Yko6tyA/exec"
  );

  const eventsData = await res.json();
  const paths = eventsData.map((event) => ({
    params: { id: event.eventname },
  }));

  return { paths, fallback: true };
};

export const getStaticProps = async ({ params }) => {
  const { id } = params;
  const eventsData = await fetchEventsData();
  const event = eventsData.find((event) => event.eventname === id) || {}; // イベントが見つからない場合は空のオブジェクトを返す
  const worksData = await fetchWorksData();

  // イベントに関連する作品を取得する 
  const works = worksData.filter((work) => work.eventname === event.eventname);

  return {
    props: { event, works },
  };
}
