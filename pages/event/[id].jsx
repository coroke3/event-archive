import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "../../styles/events.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faLink, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faXTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons";

// データ取得関数（イベント一覧）
const fetchEventsList = async () => {
  try {
    const res = await fetch("https://api.example.com/events", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PVSF-Archive/1.0)",
      },
    });

    if (!res.ok) {
      throw new Error(`イベント一覧の取得に失敗しました (${res.status} ${res.statusText})`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("イベント一覧取得エラー:", error);
    throw error;
  }
};

// データ取得関数（イベント詳細）
const fetchEventData = async (id) => {
  try {
    const res = await fetch(`https://api.example.com/data/${id}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PVSF-Archive/1.0)",
      },
    });

    if (!res.ok) {
      throw new Error(`イベント詳細の取得に失敗しました (${res.status} ${res.statusText})`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("イベント詳細取得エラー:", error);
    throw error;
  }
};

export default function EventPage({ event, works = [], errorMessage = "" }) {
  if (errorMessage) {
    return (
      <div>
        <Head>
          <title>エラー - PVSF Archive</title>
        </Head>
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
  const eventNames =
    event?.eventname?.split(",").map((name) => name.trim()) || [];

  return (
    <div>
      <Head>
        <title>
          {event?.eventname
            ? `${event.eventname} - EventArchives`
            : "イベント一覧"}
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
        {/* イベント詳細 */}
        {event ? (
          <>
            <div className={styles.eventDetails}>
              <div className={styles.ineventDetails}>
                <p>{event.explanation}</p>
                <div className={styles.ine}>
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
                  )}  <h1> {event.eventname}</h1>
                </div>

                {/* Displaying the members only if they exist */}
                {members.length > 0 && (
                  <div className={styles.members}>
                    <p>関係スタッフ</p>
                    <ul>
                      {members.map((member, index) => (
                        <li key={index}>
                          <p>
                            <span>  {member}</span>
                            <span>
                              {memberPosts[index] && (
                                <>
                                  {memberPosts[index]}
                                </>
                              )}
                            </span>
                            <span>
                              {memberIds[index] && (
                                <>
                                  <Link
                                    href={`https://twitter.com/${memberIds[index]}`}
                                    className={styles.snsicon}
                                  >
                                    <FontAwesomeIcon icon={faXTwitter} />
                                  </Link>
                                </>
                              )}
                            </span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {event.img && (
                <div className={styles.eventThumbnail}>
                  <Image
                    src={event.img}
                    alt={`${event.eventname}のサムネイル`}
                    width={1280}
                    height={720}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <p>イベント情報が見つかりませんでした。</p>
        )}

        {/* 作品一覧 */}
        <div className="work">
          <h2>このイベントの作品一覧</h2>
          {Array.isArray(works) && works.length > 0 ? (
            works.map((work) => (
              <div
                className={`works ${work.status === "private" ? "private" : ""
                  } ${work.status === "unlisted" ? "unlisted" : ""}`}
                key={work.ylink}
              >
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
                  <div className="insubtitle">
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
                  <p className="status">
                    {work.status === "public" ? null : work.status ===
                      "unlisted" ? (
                      <span className="inunlisted">
                        <FontAwesomeIcon icon={faLink} />
                        限定公開
                      </span>
                    ) : (
                      <span className="inprivate">
                        <FontAwesomeIcon icon={faLock} />
                        非公開
                      </span>
                    )}
                  </p>
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
  try {
    // APIからすべてのイベントIDを取得
    const events = await fetchEventsList();
    
    if (!Array.isArray(events)) {
      console.error('Events data is not an array in getStaticPaths');
      return {
        paths: [],
        fallback: false,
      };
    }

    // 各イベントIDに対してパスを生成
    const paths = events
      .filter(event => event?.id && typeof event.id === 'string')
      .map(event => ({
        params: { id: event.id.trim() }
      }));

    console.log(`Generated ${paths.length} event static paths out of ${events.length} events`);

    return {
      paths,
      fallback: false,
    };
  } catch (error) {
    console.error('Error in getStaticPaths for events:', error);
    return {
      paths: [],
      fallback: false,
    };
  }
};

export const getStaticProps = async ({ params }) => {
  try {
    const eventId = params.id;

    // APIからイベント詳細データを取得
    const eventData = await fetchEventData(eventId);

    if (!eventData) {
      console.warn(`Event not found for ID: ${eventId}`);
      return {
        notFound: true,
      };
    }

    // 安全な文字列処理
    const safeString = (value) => {
      if (typeof value === 'string') return value.trim();
      if (Array.isArray(value)) return value.join(', ').trim();
      return '';
    };

    // イベントデータの安全な処理
    const processedEvent = {
      ...eventData,
      eventname: safeString(eventData.eventname),
      explanation: safeString(eventData.explanation),
      member: safeString(eventData.member),
      memberid: safeString(eventData.memberid),
      menberpost: safeString(eventData.menberpost),
    };

    // 作品データはeventDataに含まれていると仮定
    const works = eventData.works || [];

    return {
      props: {
        event: processedEvent,
        works: works,
        errorMessage: "",
      },
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        event: null,
        works: [],
        errorMessage: `予期しないエラーが発生しました: ${error.message}`,
      },
    };
  }
};
