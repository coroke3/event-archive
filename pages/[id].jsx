import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { faUser } from '@fortawesome/free-solid-svg-icons';
import styles from "../styles/work.module.css";

// メモ化されたコンポーネント
const WorkCard = React.memo(function WorkCard({ work }) {
  return (
    <div className={styles.ss1} key={work.ylink.slice(17, 28)}>
      <div className={styles.ss12}>
        <Link href={`/${work.ylink.slice(17, 28)}`}>
          <img
            src={work.smallThumbnail}
            width="100%"
            alt={`${work.title} - ${work.creator} | PVSF archive`}
            loading="lazy"
          />
        </Link>
      </div>
      <div className={styles.ss13}>
        <p className={styles.scc}>{work.title}</p>
        <p className={styles.sc}>{work.creator}</p>
      </div>
    </div>
  );
});

// メモ化されたユーザーアイコンコンポーネント
const UserIcon = React.memo(function UserIcon({ work }) {
  return (
    <Link href={`../user/${work.tlink?.toLowerCase() || ""}`}>
      <Image
        src={work.icon ?
          `https://lh3.googleusercontent.com/d/${work.icon.slice(33)}` :
          "https://i.gyazo.com/07a85b996890313b80971d8d2dbf4a4c.jpg"
        }
        className={styles.icon}
        alt={`${work.creator || ""}のアイコン`}
        width={50}
        height={50}
      />
    </Link>
  );
});

// メモ化されたメンバーテーブル行コンポーネント
const MemberTableRow = React.memo(function MemberTableRow({ username, memberId, matchedUser, index }) {
  return (
    <tr>
      <td>{index + 1}</td>
      <td>{username.trim()}</td>
      <td className={styles.userlink}>
        {matchedUser ? (
          <>
            {matchedUser.icon ? (
              <Link href={`/user/${matchedUser.username}`} className={styles.userLink}>
                <Image
                  src={`https://lh3.googleusercontent.com/d/${matchedUser.icon.slice(33)}`}
                  alt={`${matchedUser.username}のアイコン`}
                  width={50}
                  height={50}
                  className={styles.icon}
                />
              </Link>
            ) : (
              <Link href={`/user/${matchedUser.username}`} className={styles.userLink}>
                <FontAwesomeIcon icon={faUser} />
              </Link>
            )}
            <div className={styles.userlis}>
              <Link href={`/user/${matchedUser.username}`} className={styles.userLink}>
                /{matchedUser.username}
              </Link>
            </div>
          </>
        ) : memberId ? (
          <div className={styles.userlis}>@{memberId}</div>
        ) : (
          "-"
        )}
      </td>
      <td>
        {memberId ? (
          <a href={`https://twitter.com/${memberId}`} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faXTwitter} className={styles.twitterIcon} />
          </a>
        ) : (
          "-"
        )}
      </td>
    </tr>
  );
});

// メモ化されたクリエーター情報コンポーネント
const CreatorInfo = React.memo(function CreatorInfo({ work, workDetails }) {
  return (
    <div className={styles.creatorInfo}>
      {workDetails.showIcon && work.icon && (
        <UserIcon work={work} />
      )}
      {workDetails.showCreator && (
        <h3 className={styles.creator}>
          <Link href={`../user/${work.tlink?.toLowerCase() || ""}`}>
            {work.creator}{" "}
          </Link>
          {workDetails.showYoutube && (
            <a
              href={`${work.ylink}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faYoutube} />
            </a>
          )}
          {workDetails.showTwitter && (
            <a
              href={`https://twitter.com/${work.tlink}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faXTwitter} />
            </a>
          )}
        </h3>
      )}
      {workDetails.showTime && (
        <p className={styles.time}>{new Intl.DateTimeFormat('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(new Date(new Date(work.time).getTime() - 9 * 60 * 60 * 1000))}</p>
      )}
    </div>
  );
});

// メモ化されたイベントカードコンポーネント
const EventCard = React.memo(function EventCard({ event, eventWorks, index }) {
  return (
    <div key={index} className={styles.eventCard}>
      <h3>{event.eventname}</h3>
      {event.explanation && <p>{event.explanation}</p>}
      {event.icon && (
        <Image
          src={`https://lh3.googleusercontent.com/d/${event.icon.slice(33)}`}
          alt={`${event.eventname}のアイコン`}
          width={50}
          height={50}
          className={styles.eventIcon}
        />
      )}
      {eventWorks.length > 0 && (
        <div className={styles.eventNavigation}>
          {eventWorks[index]?.prevWork && (
            <Link href={`/${eventWorks[index].prevWork.ylink.slice(17, 28)}`}>
              前の作品: {eventWorks[index].prevWork.title}
            </Link>
          )}
          {eventWorks[index]?.nextWork && (
            <Link href={`/${eventWorks[index].nextWork.ylink.slice(17, 28)}`}>
              次の作品: {eventWorks[index].nextWork.title}
            </Link>
          )}
        </div>
      )}
    </div>
  );
});

// メモ化された音楽表示コンポーネント
const MusicDisplay = React.memo(function MusicDisplay({ work }) {
  return (
    <div className={styles.musicInfo}>
      <h3>使用楽曲</h3>
      <p>{work.music}</p>
      {work.credit && <p>クレジット: {work.credit}</p>}
    </div>
  );
});

export default function WorkId({
  work,
  previousWorks,
  nextWorks,
  icon,
  eventname,
  externalData,
  auth = { auth: false, user: null },
  events,
  videos,
}) {
  // workDetailsをuseMemoで最適化
  const workDetails = useMemo(() => {
    if (!work) return {};
    const safe = (v) => (typeof v === 'string' ? v.trim() : Array.isArray(v) ? v.join(', ').trim() : '') !== "";

    return {
      showComment: safe(work.comment),
      showIcon: safe(work.icon),
      showCreator: safe(work.creator),
      showTwitter: safe(work.tlink),
      showYoutube: safe(work.ylink),
      showMember: safe(work.member) && safe(work.memberid),
      showMusic: safe(work.music),
      showMusicLink: safe(work.ymulink),
      showTime: safe(work.time),
    };
  }, [work]);

  // メタデータをuseMemoで最適化
  const metaData = useMemo(() => ({
    title: `${work?.title || '作品'} - ${work?.creator || 'クリエイター'} - EventArchives`,
    description: `PVSFへの出展作品です。  ${work?.title || '作品'} - ${work?.creator || 'クリエイター'}`,
    ogDescription: `EventArchives  ${work?.title || '作品'} - ${work?.creator || 'クリエイター'}  music:${work?.music || ''} - ${work?.credit || ''}`,
  }), [work]);

  // YouTube URL
  const youtubeEmbedUrl = useMemo(() =>
    work?.ylink ? `https://www.youtube.com/embed/${work.ylink.slice(17, 28)}?vq=hd1080&autoplay=1` : null,
    [work?.ylink]
  );

  // メンバー情報の処理を最適化
  const memberInfo = useMemo(() => {
    if (!work?.member || !workDetails.showMember) return [];
    return work.member.split(/[,、，]/).map((username, index) => {
      const memberId = work.memberid.split(/[,、，]/)[index]?.trim();
      const matchedUser = externalData.find(
        user => user.username.toLowerCase() === memberId?.toLowerCase()
      );
      return { username, memberId, matchedUser };
    });
  }, [work?.member, work?.memberid, externalData, workDetails.showMember]);

  // イベント情報の処理を最適化
  const eventInfo = useMemo(() => {
    if (!work?.eventid || !events) return [];

    return work.eventid.split(',').map(eventId => {
      const trimmedEventId = eventId.trim();
      const matchedEvent = events.find(e => e.eventid === trimmedEventId);

      return matchedEvent ? {
        eventid: trimmedEventId,
        eventname: matchedEvent.eventname,
        explanation: matchedEvent.explanation,
        icon: matchedEvent.icon
      } : {
        eventid: trimmedEventId,
        eventname: trimmedEventId,
        explanation: "",
        icon: ""
      };
    });
  }, [work?.eventid, events]);

  // イベント内の前後作品情報の処理を追加
  const eventWorks = useMemo(() => {
    if (!work?.eventid || !videos) return [];

    // 各イベントIDに対して前後の作品を取得
    return work.eventid.split(',').map(eventId => {
      const trimmedEventId = eventId.trim();

      // イベントに属する全作品を取得し、時系列順にソート
      const eventVideos = videos
        .filter(v => v.eventid?.split(',').some(e => e.trim() === trimmedEventId))
        .sort((a, b) => new Date(a.time) - new Date(b.time));

      // 現在の作品のインデックスを取得
      const currentIndex = eventVideos.findIndex(v => v.ylink === work.ylink);

      // 前後の作品を探す
      let prevWork = null;
      let nextWork = null;

      if (currentIndex !== -1) {
        // 前の作品を探す
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (eventVideos[i]) {
            prevWork = eventVideos[i];
            break;
          }
        }

        // 次の作品を探す
        for (let i = currentIndex + 1; i < eventVideos.length; i++) {
          if (eventVideos[i]) {
            nextWork = eventVideos[i];
            break;
          }
        }
      }

      return {
        eventId: trimmedEventId,
        prevWork,
        nextWork
      };
    });
  }, [work?.eventid, work?.ylink, videos]);

  // workが存在しない場合の早期リターン
  if (!work) {
    return (
      <div>
        <Head>
          <title>作品が見つかりません - EventArchives</title>
          <meta name="description" content="指定された作品が見つかりませんでした。" />
        </Head>
        <div className={styles.contentr}>
          <h1>作品が見つかりません</h1>
          <p>指定された作品が見つかりませんでした。</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>{metaData.title}</title>
        <meta
          name="description"
          content={metaData.description}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@pvscreeningfes" />
        <meta name="twitter:creator" content="@coroke3" />
        <meta property="og:url" content="event" />
        <meta
          property="og:title"
          content={metaData.title}
        />
        <meta
          property="og:description"
          content={metaData.ogDescription}
        />
        <meta property="og:image" content={work?.largeThumbnail || ""} />
      </Head>

      <div className={styles.contentr}>
        <div className={styles.bf}>
          <div className={styles.s1f}>
            {work?.ylink && youtubeEmbedUrl && (
              <iframe
                src={youtubeEmbedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className={styles.yf}
              ></iframe>
            )}
            <div className={styles.s1ftext}>
              <h1 className={styles.title}>{work?.title || '作品名不明'}</h1>
              <CreatorInfo work={work} workDetails={workDetails} />
              <div className={styles.eventInfo}>
                {eventInfo.map((event, index) => (
                  <EventCard key={index} event={event} eventWorks={eventWorks} index={index} />
                ))}
              </div>

              {workDetails.showMusic && (
                <MusicDisplay work={work} />
              )}
              {workDetails.showMusicLink && (
                <p>
                  <Link href={work?.ymulink || "#"}>楽曲リンク＞</Link>
                </p>
              )}
              {workDetails.showComment && (
                <p>
                  <div
                    dangerouslySetInnerHTML={{ __html: `${work?.comment || ""}` }}
                  />
                </p>
              )}
              {workDetails.showMember && work?.member && (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Name</th>
                      <th>ID</th>
                      <th>LINK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberInfo.map(({ username, memberId, matchedUser }, index) => (
                      <MemberTableRow
                        key={index}
                        username={username}
                        memberId={memberId}
                        matchedUser={matchedUser}
                        index={index}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div className={styles.s2f}>
            {previousWorks.map((prevWork) => (
              <WorkCard key={prevWork.ylink.slice(17, 28)} work={prevWork} />
            ))}
            {nextWorks.map((nextWork) => (
              <WorkCard key={nextWork.ylink.slice(17, 28)} work={nextWork} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// データ取得関数
const fetchVideosList = async () => {
  try {
    const res = await fetch("https://api.example.com/videos", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PVSF-Archive/1.0)",
      },
    });

    if (!res.ok) {
      throw new Error(`作品一覧の取得に失敗しました (${res.status} ${res.statusText})`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("作品一覧取得エラー:", error);
    throw error;
  }
};

const fetchVideoData = async (id) => {
  try {
    const res = await fetch(`https://api.example.com/videos/${id}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PVSF-Archive/1.0)",
      },
    });

    if (!res.ok) {
      throw new Error(`作品詳細の取得に失敗しました (${res.status} ${res.statusText})`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("作品詳細取得エラー:", error);
    throw error;
  }
};

// getStaticPathsの実装
export async function getStaticPaths() {
  try {
    // APIからすべての作品IDを取得
    const videos = await fetchVideosList();
    
    if (!Array.isArray(videos)) {
      console.error('Videos data is not an array in getStaticPaths');
      return {
        paths: [],
        fallback: false,
      };
    }

    // 各作品IDに対してパスを生成
    const paths = videos
      .filter(video => video?.id && typeof video.id === 'string')
      .map(video => ({
        params: { id: video.id.trim() }
      }));

    console.log(`Generated ${paths.length} video static paths out of ${videos.length} videos`);

    return {
      paths,
      fallback: false,
    };
  } catch (error) {
    console.error('Error in getStaticPaths for videos:', error);
    return {
      paths: [],
      fallback: false,
    };
  }
}

// getStaticPropsの実装
export async function getStaticProps({ params }) {
  try {
    const videoId = params.id;

    // APIから作品詳細データを取得
    const videoData = await fetchVideoData(videoId);

    if (!videoData) {
      console.warn(`Video not found for ID: ${videoId}`);
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

    // 作品データの安全な処理
    const processedWork = {
      ...videoData,
      title: safeString(videoData.title),
      creator: safeString(videoData.creator),
      comment: safeString(videoData.comment),
      music: safeString(videoData.music),
      credit: safeString(videoData.credit),
      member: safeString(videoData.member),
      memberid: safeString(videoData.memberid),
    };

    // 関連作品データはvideoDataに含まれていると仮定
    const previousWorks = videoData.previousWorks || [];
    const nextWorks = videoData.nextWorks || [];

    return {
      props: {
        work: processedWork,
        previousWorks: previousWorks,
        nextWorks: nextWorks,
        externalData: [],
        events: [],
        videos: [],
      },
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        work: null,
        previousWorks: [],
        nextWorks: [],
        externalData: [],
        events: [],
        videos: [],
        error: `予期しないエラーが発生しました: ${error.message}`,
      },
    };
  }
}