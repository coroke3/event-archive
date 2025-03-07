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
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("イベントデータ取得エラー:", error);
    return { error: true, message: "イベントデータの取得に失敗しました。" };
  }
};

// データ取得関数（作品）
const fetchWorksData = async () => {
  try {
    const res = await fetch("https://pvsf-cash.vercel.app/api/videos", {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`作品データの取得に失敗しました (${res.statusText})`);
    }
    const data = await res.json();
    console.log("Fetched Works Data:");
    return data;
  } catch (error) {
    console.error("作品データ取得エラー:", error);
    return { error: true, message: "作品データの取得に失敗しました。" };
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
            ? `${event.eventname} - PVSF Archive`
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
  const eventsData = await fetchEventsData();
  if (eventsData.error) {
    return { paths: [], fallback: false };
  }

  const paths = eventsData.map((event) => ({
    params: { id: event.eventid },
  }));

  return { paths, fallback: false };
};

export const getStaticProps = async ({ params }) => {
  try {
    const { id } = params;
    const eventsData = await fetchEventsData();
    const event = eventsData.find((event) => event.eventid === id) || null;
    const worksData = await fetchWorksData();

    // データが配列であることを確認
    const works = Array.isArray(worksData)
      ? worksData.filter((work) => {
        const workEventNames = work?.eventid?.split(",").map(name => name.trim()) || [];
        return event && workEventNames.includes(event.eventid);
      })
      : [];

    return {
      props: {
        event,
        works
      },
      revalidate: 60 // ISRを有効化
    };
  } catch (error) {
    console.error("Error fetching static props:", error);
    return {
      props: {
        event: null,
        works: [],
        errorMessage: "データの取得に失敗しました。",
      },
      revalidate: 60
    };
  }
};
