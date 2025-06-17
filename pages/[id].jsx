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
const WorkCard = React.memo(({ work }) => (
  <div className={styles.ss1}>
    <div className={styles.ss12}>
      <Link href={`/${work.ylink.slice(17, 28)}`}>
        <Image
          src={work.smallThumbnail}
          width={200}
          height={113}
          alt={`${work.title} - ${work.creator} | PVSF archive`}
          style={{ width: '100%', height: 'auto' }}
        />
      </Link>
    </div>
    <div className={styles.ss13}>
      <p className={styles.scc}>{work.title}</p>
      <p className={styles.sc}>{work.creator}</p>
    </div>
  </div>
));
WorkCard.displayName = 'WorkCard';

// メモ化されたユーザーアイコンコンポーネント
const UserIcon = React.memo(({ work }) => {
  const iconSrc = useMemo(() => {
    return work.icon
      ? `https://lh3.googleusercontent.com/d/${work.icon.slice(33)}`
      : "https://i.gyazo.com/07a85b996890313b80971d8d2dbf4a4c.jpg";
  }, [work.icon]);

  return (
    <Link href={`../user/${work.tlink?.toLowerCase() || ""}`}>
      <Image
        src={iconSrc}
        className={styles.icon}
        alt={`${work.creator || ""}のアイコン`}
        width={50}
        height={50}
      />
    </Link>
  );
});
UserIcon.displayName = 'UserIcon';

// メモ化されたメンバーテーブル行コンポーネント
const MemberTableRow = React.memo(({ username, memberId, memberIconInfo, matchedUser, index }) => {
  const iconSrc = useMemo(() => memberIconInfo?.icon ? `https://lh3.googleusercontent.com/d/${memberIconInfo.icon.slice(33)}` : null, [memberIconInfo?.icon]);
  return (
    <tr>
      <td>{index + 1}</td>
      <td>{username.trim()}</td>
      <td className={styles.userlink}>
        {matchedUser ? (
          <>
            {iconSrc ? (
              <Link href={`/user/${matchedUser.username}`} className={styles.userLink}>
                <Image src={iconSrc} alt={`${matchedUser.username}のアイコン`} width={50} height={50} className={styles.icon} />
              </Link>
            ) : (
              <Link href={`/user/${matchedUser.username}`} className={styles.userLink}>
                <FontAwesomeIcon icon={faUser} />
              </Link>
            )}
            <div className={styles.userlis}>
              <Link href={`/user/${matchedUser.username}`} className={styles.userLink}>/{matchedUser.username}</Link>
            </div>
          </>
        ) : memberId ? (
          <div className={styles.userlis}>@{memberId}</div>
        ) : "-"}
      </td>
      <td>
        {memberId ? (
          <a href={`https://twitter.com/${memberId}`} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faXTwitter} className={styles.twitterIcon} />
          </a>
        ) : "-"}
      </td>
    </tr>
  );
});
MemberTableRow.displayName = 'MemberTableRow';

// authプロパティのデフォルト値を設定
const defaultAuth = {
  auth: false,
  user: null
};

// 決定論的なシャッフル関数（シード値を使用）
function deterministicShuffle(array, seed = 1) {
  const shuffled = [...array];
  let currentSeed = seed;

  for (let i = shuffled.length - 1; i > 0; i--) {
    // 線形合同法を使用して疑似乱数を生成
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const randomValue = currentSeed / 233280;
    const j = Math.floor(randomValue * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export default function WorkId({
  work,
  previousWorks,
  nextWorks,
  icon,
  eventname,
  externalData,
  matchingIcon,
  auth,
  events,
  videos,
}) {
  const safeString = (value) => typeof value === 'string' ? value.trim() : Array.isArray(value) ? value.join(', ').trim() : '';

  const details = useMemo(() => work ? {
    comment: safeString(work.comment),
    creator: safeString(work.creator),
    tlink: safeString(work.tlink),
    ylink: safeString(work.ylink),
    member: safeString(work.member),
    memberid: safeString(work.memberid),
    music: safeString(work.music),
    ymulink: safeString(work.ymulink),
    time: safeString(work.time),
  } : {}, [work]);

  const formattedDate = useMemo(() => {
    if (!work?.time) return "";
    const d = new Date(new Date(work.time).getTime() - 9 * 60 * 60 * 1000);
    return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(d);
  }, [work?.time]);

  const userIconSrc = work?.icon ? `https://lh3.googleusercontent.com/d/${work.icon.slice(33)}` : "https://i.gyazo.com/07a85b996890313b80971d8d2dbf4a4c.jpg";

  const memberInfo = useMemo(() => {
    if (!details.member || !details.memberid) return [];
    const names = work.member.split(/[,、，]/);
    const ids = work.memberid.split(/[,、，]/);
    return names.map((username, i) => {
      const memberId = ids[i]?.trim() || '';
      const memberIconInfo = matchingIcon?.find(item => item?.memberId?.toLowerCase() === memberId.toLowerCase());
      const matchedUser = externalData?.find(user => user?.username?.toLowerCase() === memberId.toLowerCase());
      return { username, memberId, memberIconInfo, matchedUser };
    });
  }, [details.member, details.memberid, work?.member, work?.memberid, matchingIcon, externalData]);

  const eventInfo = useMemo(() => {
    if (!work?.eventid || !events) return [];
    return work.eventid.split(',').map(eventId => {
      const id = eventId.trim();
      const event = events.find(e => e.eventid === id);
      return event ? { eventid: id, eventname: event.eventname, explanation: event.explanation, icon: event.icon } : { eventid: id, eventname: id, explanation: "", icon: "" };
    });
  }, [work?.eventid, events]);

  const eventWorks = useMemo(() => {
    if (!work?.eventid || !videos) return [];
    return work.eventid.split(',').map(eventId => {
      const id = eventId.trim();
      const eventVideos = videos.filter(v => v.eventid?.split(',').some(e => e.trim() === id)).sort((a, b) => new Date(a.time) - new Date(b.time));
      const idx = eventVideos.findIndex(v => v.ylink === work.ylink);
      let prev = null, next = null;
      if (idx !== -1) {
        for (let i = idx - 1; i >= 0; i--) if (eventVideos[i]) { prev = eventVideos[i]; break; }
        for (let i = idx + 1; i < eventVideos.length; i++) if (eventVideos[i]) { next = eventVideos[i]; break; }
      }
      return { prevWork: prev, nextWork: next };
    });
  }, [work?.eventid, work?.ylink, videos]);

  // メタデータ（最適化）
  const metaData = useMemo(() => ({
    title: `${work?.title || ''} - ${work?.creator || ''} - EventArchives`,
    description: `  ${work?.title || ''} - ${work?.creator || ''}`,
    ogDescription: `EventArchives  ${work?.title || ''} - ${work?.creator || ''}  music:${work?.music || ''} - ${work?.credit || ''}`,
  }), [work?.title, work?.creator, work?.music, work?.credit]);

  if (!work) {
    return <div>作品が見つかりません</div>;
  }

  return (
    <div>
      <Head>
        <title>{metaData.title}</title>
        <meta name="description" content={metaData.description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@pvscreeningfes" />
        <meta name="twitter:creator" content="@coroke3" />
        <meta property="og:url" content="event" />
        <meta property="og:title" content={metaData.title} />
        <meta property="og:description" content={metaData.ogDescription} />
        <meta property="og:image" content={work.largeThumbnail} />
      </Head>

      <div className={styles.contentr}>
        <div className={styles.bf}>
          <div className={styles.s1f}>
            {work.ylink && (
              <iframe
                src={`https://www.youtube.com/embed/${work.ylink.slice(17, 28)}?vq=hd1080&autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className={styles.yf}
              ></iframe>
            )}
            <div className={styles.s1ftext}>
              <h1 className={styles.title}>{work.title}</h1>
              <div className={styles.userinfo}>
                <Link href={`../user/${work.tlink?.toLowerCase() || ""}`}>
                  <Image
                    src={userIconSrc}
                    className={styles.icon}
                    alt={`${work.creator}のアイコン`}
                    width={50}
                    height={50}
                  />
                </Link>

                {details.creator && (
                  <h3 className={styles.creator}>
                    <Link href={`../user/${work.tlink?.toLowerCase() || ""}`}>
                      {work.creator}{" "}
                    </Link>
                    {details.ylink && (
                      <a
                        href={`${work.ylink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faYoutube} />
                      </a>
                    )}
                    {details.tlink && (
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
                {details.time && (
                  <p className={styles.time}>{formattedDate}</p>
                )}
              </div>

              <div className={styles.eventInfo}>
                {eventInfo.map((event, index) => (
                  <div key={index} className={styles.eventSection}>
                    <div className={styles.eventCard}>
                      {event.icon && (
                        <Link href={`../../event/${event.eventid}`}>
                          <Image
                            src={`https://lh3.googleusercontent.com/d/${event.icon.slice(33)}`}
                            alt={`${event.eventname}のアイコン`}
                            className={styles.eventIcon}
                            width={40}
                            height={40}
                          />
                        </Link>
                      )}
                      <div className={styles.eventDetails}>
                        <Link href={`../../event/${event.eventid}`}>
                          <h4 className={styles.eventTitle}>{event.eventname}</h4>
                          {event.explanation && (
                            <p className={styles.eventExplanation}>{event.explanation}</p>
                          )}
                        </Link>
                      </div>
                    </div>

                    {/* イベント内の前後作品 */}
                    <div className={styles.eventNavigation}>
                      {eventWorks[index]?.prevWork && (
                        <Link href={`/${eventWorks[index].prevWork.ylink.slice(17, 28)}`} className={styles.eventNavItem}>
                          <div className={styles.eventNavThumb}>
                            <Image
                              src={eventWorks[index].prevWork.smallThumbnail}
                              alt={`前の作品: ${eventWorks[index].prevWork.title}`}
                              width={160}
                              height={90}
                            />
                          </div>
                          <div className={styles.eventNavInfo}>
                            <span className={styles.eventNavLabel}>前の作品</span>
                            <span className={styles.eventNavTitle}>{eventWorks[index].prevWork.title}</span>
                          </div>
                        </Link>
                      )}
                      {eventWorks[index]?.nextWork && (
                        <Link href={`/${eventWorks[index].nextWork.ylink.slice(17, 28)}`} className={styles.eventNavItem}>
                          <div className={styles.eventNavThumb}>
                            <Image
                              src={eventWorks[index].nextWork.smallThumbnail}
                              alt={`次の作品: ${eventWorks[index].nextWork.title}`}
                              width={160}
                              height={90}
                            />
                          </div>
                          <div className={styles.eventNavInfo}>
                            <span className={styles.eventNavLabel}>次の作品</span>
                            <span className={styles.eventNavTitle}>{eventWorks[index].nextWork.title}</span>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {details.music && (
                <p
                  dangerouslySetInnerHTML={{
                    __html: `楽曲:${work.music} - ${work.credit}<br> `,
                  }}
                />
              )}
              {details.ymulink && (
                <p>
                  <Link href={work.ymulink}>楽曲リンク＞</Link>
                </p>
              )}
              {details.comment && (
                <p>
                  <div
                    dangerouslySetInnerHTML={{ __html: `${work.comment}` }}
                  />
                </p>
              )}
              {details.member && details.memberid && memberInfo.length > 0 && (
                <table className={styles.table}>
                  <thead>
                    <tr><th>No</th><th>Name</th><th>ID</th><th>LINK</th></tr>
                  </thead>
                  <tbody>
                    {memberInfo.map((member, i) => (
                      <MemberTableRow
                        key={i}
                        username={member.username}
                        memberId={member.memberId}
                        memberIconInfo={member.memberIconInfo}
                        matchedUser={member.matchedUser}
                        index={i}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div className={styles.s2f}>
            {previousWorks?.map((prevWork) => (
              <WorkCard key={`prev-${prevWork.ylink.slice(17, 28)}`} work={prevWork} />
            ))}
            {nextWorks?.map((nextWork) => (
              <WorkCard key={`next-${nextWork.ylink.slice(17, 28)}`} work={nextWork} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// イベントデータを取得する関数
async function fetchEventData(eventId) {
  const eventRes = await fetch(
    `https://script.google.com/macros/s/AKfycbybjT6iEZWbfCIzTvU1ALVxp1sa_zS_pGJh5_p_SBsJgLtmzcmqsIDRtFkJ9B8Yko6tyA/exec?eventid=${eventId}`
  );

  if (!eventRes.ok) {
    throw new Error("イベント情報の取得に失敗しました");
  }

  const eventData = await eventRes.json();
  const eventInfo = eventData.find((event) => event.eventid === eventId);

  return {
    eventname: eventInfo?.eventname || "Unknown Event",
    icon: eventInfo?.icon || "",
  };
}

// メンバーのアイコンを取得する関数
function getMemberIcons(memberIds, publicData2) {
  const matchingIcon = [];
  for (const memberId of memberIds) {
    const memberWorks = publicData2.filter(w => w.tlink.toLowerCase() === memberId.toLowerCase());
    if (memberWorks.length > 0) {
      const prioritizedWorks = memberWorks.filter(w => w.type === "個人");
      const latestWork = prioritizedWorks.length > 0 ? prioritizedWorks[0] : memberWorks[0];
      matchingIcon.push({ memberId, icon: latestWork.icon });
    }
  }
  return matchingIcon;
}

// getRelatedWorks関数を修正
function getRelatedWorks(work, publicData, currentIndex) {
  const safeCompare = (a, b) => a && b && typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();
  const uniqueWorks = (works) => Array.from(new Set(works.map(w => w.ylink))).map(ylink => works.find(w => w.ylink === ylink));
  const getRandomWorks = (works, count, seed = 1) => works.length <= count ? works : deterministicShuffle(works, seed).slice(0, count);
  const baseFilter = w => w.ylink !== work.ylink;
  const memberIds = work.memberid?.split(',').map(id => id.trim()).filter(Boolean) || [];
  const workTime = new Date(work.time);

  const categorizedWorks = publicData.reduce((acc, w) => {
    if (!baseFilter(w)) return acc;
    if (w.tlink === work.tlink) acc.tlink.push(w);
    if (w.memberid?.split(',').map(id => id.trim()).includes(work.tlink)) acc.memberid.push({ ...w, timeDiff: Math.abs(new Date(w.time) - workTime) });
    if (memberIds.some(id => w.tlink === id)) acc.memberTlink.push(w);
    else if (memberIds.some(id => w.memberid?.includes(id)) && w.tlink !== work.tlink) acc.memberRelated.push(w);
    if (safeCompare(w.music, work.music)) acc.music.push(w);
    if (safeCompare(w.credit, work.credit)) acc.credit.push(w);
    if (w.deterministicScore) acc.score.push(w);
    return acc;
  }, { tlink: [], memberid: [], memberTlink: [], memberRelated: [], music: [], credit: [], score: [] });

  const processedWorks = work.status === "private" ? {
    tlink: categorizedWorks.tlink.sort((a, b) => Math.abs(new Date(a.time) - workTime) - Math.abs(new Date(b.time) - workTime)).slice(0, 4),
    memberid: categorizedWorks.memberid.sort((a, b) => a.timeDiff - b.timeDiff).slice(0, 2),
    memberTlink: getRandomWorks(categorizedWorks.memberTlink, memberIds.length, 111),
    memberRelated: getRandomWorks(categorizedWorks.memberRelated, memberIds.length, 222),
    music: getRandomWorks(categorizedWorks.music, 2, 333),
    credit: getRandomWorks(categorizedWorks.credit, 2, 444),
    random: getRandomWorks(publicData.filter(baseFilter), 2, 555),
    score: getRandomWorks(categorizedWorks.score.sort((a, b) => b.deterministicScore - a.deterministicScore).slice(0, 50), 2, 666)
  } : {
    tlink: categorizedWorks.tlink.sort((a, b) => Math.abs(currentIndex - publicData.indexOf(a)) - Math.abs(currentIndex - publicData.indexOf(b))).slice(0, 2),
    memberid: categorizedWorks.memberid.sort((a, b) => a.timeDiff - b.timeDiff).slice(0, 2),
    surrounding: [...publicData.slice(Math.max(0, currentIndex - 6), currentIndex), ...publicData.slice(currentIndex + 1, currentIndex + 7)],
    memberTlink: getRandomWorks(categorizedWorks.memberTlink, memberIds.length, 777),
    memberRelated: getRandomWorks(categorizedWorks.memberRelated, memberIds.length, 888),
    music: getRandomWorks(categorizedWorks.music, 4, 999),
    credit: getRandomWorks(categorizedWorks.credit, 4, 1111),
    random: getRandomWorks(publicData.filter(baseFilter), 2, 1222),
    score: getRandomWorks(categorizedWorks.score.sort((a, b) => b.deterministicScore - a.deterministicScore).slice(0, 50), 2, 1333)
  };

  const allWorks = uniqueWorks(Object.values(processedWorks).flat());
  const mid = Math.floor(allWorks.length / 2);
  return { previousWorks: allWorks.slice(0, mid), nextWorks: allWorks.slice(mid) };
}

// musicプロパティの型チェックを追加
const processMusic = (work) => {
  if (!work) return '';
  if (typeof work.music === 'string') return work.music.trim();
  if (Array.isArray(work.music)) return work.music.join(', ').trim();
  return '';
};

// getStaticPropsの修正
export async function getStaticProps({ params }) {
  const fetchData = async (url) => {
    const res = await fetch(url, { timeout: 30000, headers: { 'Cache-Control': 'public, max-age=3600' } });
    return res.ok ? await res.json() : null;
  };

  const [videos, users, events] = await Promise.all([
    fetchData("https://pvsf-cash.vercel.app/api/videos"),
    fetchData("https://pvsf-cash.vercel.app/api/users"),
    fetchData("https://script.google.com/macros/s/AKfycbybjT6iEZWbfCIzTvU1ALVxp1sa_zS_pGJh5_p_SBsJgLtmzcmqsIDRtFkJ9B8Yko6tyA/exec")
  ]);

  if (!videos) return { notFound: true };

  const work = videos.find(w => w.ylink.slice(17, 28) === params.id);
  if (!work) return { notFound: true };

  const publicData = videos.filter(w => w.status !== "private");
  const currentIndex = publicData.findIndex(w => w.ylink.slice(17, 28) === params.id);
  const { previousWorks, nextWorks } = getRelatedWorks(work, publicData, currentIndex);

  const memberIds = work.memberid?.split(',').map(id => id.trim()).filter(Boolean) || [];
  const matchingIcon = getMemberIcons(memberIds, publicData);

  return {
    props: {
      work,
      previousWorks: previousWorks || [],
      nextWorks: nextWorks || [],
      events: events || [],
      videos,
      matchingIcon,
      externalData: users || []
    }
  };
}

// getStaticPathsの修正
export async function getStaticPaths() {
  try {
    const res = await fetch("https://pvsf-cash.vercel.app/api/videos", {
      timeout: 30000,
      headers: {
        'Cache-Control': 'public, max-age=3600'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch videos: ${res.status}`);
    }

    const works = await res.json();

    // privateフィルターを削除
    const uniquePaths = new Set();
    const paths = works
      .filter(work => {
        try {
          if (!work || !work.ylink) return false;

          const id = work.ylink.slice(17, 28);
          if (uniquePaths.has(id)) return false;

          uniquePaths.add(id);
          return true;
        } catch (e) {
          console.error(`Invalid work data:`, work);
          return false;
        }
      })
      .map(work => ({
        params: { id: work.ylink.slice(17, 28) }
      }));

    console.log(`Generated ${paths.length} unique static paths`);
    return { paths, fallback: false };

  } catch (error) {
    console.error('Error in getStaticPaths:', error);
    return {
      paths: [],
      fallback: false
    };
  }
}