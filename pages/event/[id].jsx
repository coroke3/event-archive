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

// データ取得関数（イベント）
const fetchEventsData = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(
      "https://script.google.com/macros/s/AKfycbybjT6iEZWbfCIzTvU1ALVxp1sa_zS_pGJh5_p_SBsJgLtmzcmqsIDRtFkJ9B8Yko6tyA/exec",
      {
        signal: controller.signal,
        headers: {
          "Cache-Control": "no-cache",
          "User-Agent": "Mozilla/5.0 (compatible; PVSF-Archive/1.0)",
        },
        cache: "no-store",
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`イベントデータの取得に失敗しました (${res.status} ${res.statusText})`);
    }

    const text = await res.text();
    if (!text || text.trim() === '') {
      throw new Error('空のレスポンスが返されました');
    }

    try {
      const data = JSON.parse(text);
      return data;
    } catch (parseError) {
      console.error('JSON解析エラー:', parseError.message);
      console.error('レスポンステキスト:', text.substring(0, 200));
      throw new Error('無効なJSONレスポンス');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error("イベントデータ取得タイムアウト");
      throw new Error('リクエストがタイムアウトしました');
    }
    console.error("イベントデータ取得エラー:", error);
    throw error;
  }
};

// データ取得関数（作品）
const fetchWorksData = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch("https://pvsf-cash.vercel.app/api/videos", {
      signal: controller.signal,
      headers: {
        "Cache-Control": "no-cache",
        "User-Agent": "Mozilla/5.0 (compatible; PVSF-Archive/1.0)",
      },
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`作品データの取得に失敗しました (${res.status} ${res.statusText})`);
    }

    const text = await res.text();
    if (!text || text.trim() === '') {
      throw new Error('空のレスポンスが返されました');
    }

    try {
      const data = JSON.parse(text);
      console.log("Fetched Works Data:");
      return data;
    } catch (parseError) {
      console.error('JSON解析エラー:', parseError.message);
      console.error('レスポンステキスト:', text.substring(0, 200));
      throw new Error('無効なJSONレスポンス');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error("作品データ取得タイムアウト");
      throw new Error('リクエストがタイムアウトしました');
    }
    console.error("作品データ取得エラー:", error);
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbybjT6iEZWbfCIzTvU1ALVxp1sa_zS_pGJh5_p_SBsJgLtmzcmqsIDRtFkJ9B8Yko6tyA/exec",
      {
        signal: controller.signal,
        headers: {
          "Cache-Control": "no-cache",
          "User-Agent": "Mozilla/5.0 (compatible; PVSF-Archive/1.0)",
        },
        cache: "no-store",
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed to fetch events for getStaticPaths: ${response.status} ${response.statusText}`);
      return {
        paths: [],
        fallback: 'blocking',
      };
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      console.error('Empty response from events API in getStaticPaths');
      return {
        paths: [],
        fallback: 'blocking',
      };
    }

    let events;
    try {
      events = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON Parse Error in getStaticPaths:', parseError.message);
      console.error('Response text:', text.substring(0, 200));
      return {
        paths: [],
        fallback: 'blocking',
      };
    }

    if (!Array.isArray(events)) {
      console.error('Events data is not an array in getStaticPaths');
      return {
        paths: [],
        fallback: 'blocking',
      };
    }

    const paths = events
      .filter(event => event?.eventid && typeof event.eventid === 'string')
      .map(event => ({
        params: { id: event.eventid.trim() }
      }));

    console.log(`Generated ${paths.length} event static paths out of ${events.length} events`);

    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('getStaticPaths request timeout for events');
    } else {
      console.error('Error in getStaticPaths for events:', error);
    }

    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps = async ({ params }) => {
  try {
    const eventId = params.id;

    // 並列でデータを取得（エラーハンドリング付き）
    const [eventsResult, worksResult] = await Promise.allSettled([
      fetchEventsData(),
      fetchWorksData()
    ]);

    // 結果を安全に処理
    let events = [];
    let works = [];
    let errorMessage = "";

    if (eventsResult.status === 'fulfilled') {
      events = eventsResult.value;
    } else {
      console.error('イベントデータ取得失敗:', eventsResult.reason);
      errorMessage += `イベントデータの取得に失敗しました: ${eventsResult.reason.message}. `;
    }

    if (worksResult.status === 'fulfilled') {
      works = worksResult.value;
    } else {
      console.error('作品データ取得失敗:', worksResult.reason);
      errorMessage += `作品データの取得に失敗しました: ${worksResult.reason.message}. `;
    }

    // イベントを検索
    const event = Array.isArray(events) ? events.find((event) => event.eventid === eventId) : null;

    if (!event && !errorMessage) {
      console.warn(`Event not found for ID: ${eventId}`);
      return {
        notFound: true,
      };
    }

    // 該当するイベントの作品をフィルタリング
    const eventWorks = Array.isArray(works)
      ? works.filter((work) => {
        if (work.eventid) {
          const eventIds = work.eventid.split(",").map((id) => id.trim());
          return eventIds.includes(eventId);
        }
        return false;
      })
      : [];

    // 安全な文字列処理
    const safeString = (value) => {
      if (typeof value === 'string') return value.trim();
      if (Array.isArray(value)) return value.join(', ').trim();
      return '';
    };

    // イベントデータの安全な処理
    const processedEvent = event ? {
      ...event,
      eventname: safeString(event.eventname),
      explanation: safeString(event.explanation),
      member: safeString(event.member),
      memberid: safeString(event.memberid),
      menberpost: safeString(event.menberpost),
    } : null;

    return {
      props: {
        event: processedEvent,
        works: eventWorks,
        errorMessage: errorMessage.trim(),
      },
      revalidate: 3600, // 1時間ごとに再生成
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        event: null,
        works: [],
        errorMessage: `予期しないエラーが発生しました: ${error.message}`,
      },
      revalidate: 300, // エラー時は5分後に再試行
    };
  }
};
