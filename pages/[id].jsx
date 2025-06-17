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

// 安全なリンクコンポーネント
const SafeLink = ({ href, children, ...props }) => {
  const validateAndCleanUrl = (url) => {
    if (!url || typeof url !== 'string') return null;

    // 複数のURLが含まれている場合は最初のものを使用
    const urls = url.split(/\s+/).filter(u => u.trim().length > 0);
    if (urls.length > 1) {
      console.warn(`Multiple URLs found, using first one: ${urls[0]}`);
      url = urls[0].trim();
    }

    // 不正な文字を除去（日本語文字も考慮）
    const cleanUrl = url.replace(/[^\w\-._~:/?#[\]@!$&'()*+,;=%\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '');

    // プロトコルが含まれていない場合は追加
    if (cleanUrl && !cleanUrl.startsWith('http')) {
      return `https://${cleanUrl}`;
    }

    // URLの妥当性を簡単にチェック
    try {
      new URL(cleanUrl);
      return cleanUrl;
    } catch (error) {
      console.warn(`Invalid URL detected: ${cleanUrl}`);
      return null;
    }
  };

  const cleanHref = validateAndCleanUrl(href);

  if (!cleanHref) {
    return <span>{children}</span>;
  }

  return (
    <a href={cleanHref} {...props}>
      {children}
    </a>
  );
};

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
  error,
}) {
  // エラー状態の処理
  if (error) {
    return (
      <div>
        <Head>
          <title>エラー - PVSF Archive</title>
        </Head>
        <div className="content">
          <h1>エラーが発生しました</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

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
        <meta property="og:title" content={metaData.title} />
        <meta property="og:description" content={metaData.ogDescription} />
        <meta property="og:image" content={work?.largeThumbnail || ""} />
        <meta property="og:url" content={`https://pvsf-archive.vercel.app/${work?.ylink?.slice(17, 28) || ""}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaData.title} />
        <meta name="twitter:description" content={metaData.ogDescription} />
        <meta name="twitter:image" content={work?.largeThumbnail || ""} />
      </Head>

      <div className="content">
        {/* 作品情報 */}
        <div className={styles.workInfo}>
          <div className={styles.workThumbnail}>
            {work?.largeThumbnail && (
              <Image
                src={work.largeThumbnail}
                alt={`${work?.title || ''} - ${work?.creator || ''}`}
                width={640}
                height={360}
                priority
              />
            )}
          </div>

          <div className={styles.workDetails}>
            <h1>{work?.title || 'タイトル不明'}</h1>
            <div className={styles.creatorInfo}>
              <UserIcon work={work} />
              <div className={styles.creatorText}>
                <p className={styles.creatorName}>{work?.creator || '作者不明'}</p>
                <div className={styles.socialLinks}>
                  {work?.tlink && (
                    <SafeLink
                      href={`https://twitter.com/${work.tlink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                    >
                      <FontAwesomeIcon icon={faXTwitter} />
                    </SafeLink>
                  )}
                  {work?.ychlink && (
                    <SafeLink
                      href={work.ychlink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                    >
                      <FontAwesomeIcon icon={faYoutube} />
                    </SafeLink>
                  )}
                </div>
              </div>
            </div>

            {/* 作品詳細情報 */}
            <div className={styles.workMeta}>
              {formattedDate && (
                <p><strong>投稿日時:</strong> {formattedDate}</p>
              )}
              {details.music && (
                <p><strong>使用楽曲:</strong> {details.music}</p>
              )}
              {work?.ymulink && (
                <p>
                  <strong>楽曲リンク:</strong>{' '}
                  <SafeLink
                    href={work.ymulink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {work.ymulink}
                  </SafeLink>
                </p>
              )}
              {details.comment && (
                <div className={styles.comment}>
                  <strong>コメント:</strong>
                  <p>{details.comment}</p>
                </div>
              )}
            </div>

            {/* メンバー情報 */}
            {memberInfo.length > 0 && (
              <div className={styles.memberSection}>
                <h3>メンバー</h3>
                <table className={styles.memberTable}>
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>名前</th>
                      <th>プロフィール</th>
                      <th>Twitter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberInfo.map((member, index) => (
                      <MemberTableRow
                        key={index}
                        username={member.username}
                        memberId={member.memberId}
                        memberIconInfo={member.memberIconInfo}
                        matchedUser={member.matchedUser}
                        index={index}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* イベント情報 */}
            {eventInfo.length > 0 && (
              <div className={styles.eventSection}>
                <h3>関連イベント</h3>
                {eventInfo.map((event, index) => (
                  <div key={index} className={styles.eventItem}>
                    <Link href={`/event/${event.eventid}`}>
                      <div className={styles.eventLink}>
                        {event.icon && (
                          <Image
                            src={`https://lh3.googleusercontent.com/d/${event.icon.slice(33)}`}
                            alt={event.eventname}
                            width={50}
                            height={50}
                            className={styles.eventIcon}
                          />
                        )}
                        <div>
                          <h4>{event.eventname}</h4>
                          {event.explanation && <p>{event.explanation}</p>}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 関連作品 */}
        {(previousWorks.length > 0 || nextWorks.length > 0) && (
          <div className={styles.relatedWorks}>
            <h2>関連作品</h2>
            <div className={styles.worksGrid}>
              {previousWorks.concat(nextWorks).map((relatedWork) => (
                <WorkCard key={relatedWork.ylink} work={relatedWork} />
              ))}
            </div>
          </div>
        )}
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
  const fetchData = async (url, timeout = 30000) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (compatible; PVSF-Archive/1.0)',
        },
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`HTTP Error: ${response.status} ${response.statusText} for ${url}`);
        return { error: true, status: response.status, statusText: response.statusText };
      }

      const text = await response.text();
      if (!text || text.trim() === '') {
        console.error(`Empty response from ${url}`);
        return { error: true, message: 'Empty response' };
      }

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error(`JSON Parse Error for ${url}:`, parseError.message);
        console.error('Response text:', text.substring(0, 200));
        return { error: true, message: 'Invalid JSON response' };
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`Request timeout for ${url}`);
        return { error: true, message: 'Request timeout' };
      }
      console.error(`Fetch error for ${url}:`, error.message);
      return { error: true, message: error.message };
    }
  };

  try {
    const id = params.id;

    // 並列でデータを取得（エラーハンドリング付き）
    const [videosResult, usersResult, eventsResult] = await Promise.allSettled([
      fetchData("https://pvsf-cash.vercel.app/api/videos"),
      fetchData("https://pvsf-cash.vercel.app/api/users"),
      fetchData("https://script.google.com/macros/s/AKfycbybjT6iEZWbfCIzTvU1ALVxp1sa_zS_pGJh5_p_SBsJgLtmzcmqsIDRtFkJ9B8Yko6tyA/exec")
    ]);

    // 結果を安全に処理
    const videos = videosResult.status === 'fulfilled' && !videosResult.value?.error
      ? videosResult.value
      : [];

    const externalData = usersResult.status === 'fulfilled' && !usersResult.value?.error
      ? usersResult.value
      : [];

    const events = eventsResult.status === 'fulfilled' && !eventsResult.value?.error
      ? eventsResult.value
      : [];

    // 作品を検索
    const work = videos.find((video) => video.ylink?.slice(17, 28) === id);

    if (!work) {
      console.warn(`Work not found for ID: ${id}`);
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

    // URLの検証と修正
    const validateUrl = (url) => {
      if (!url || typeof url !== 'string') return '';

      // 複数のURLが含まれている場合は最初のものを使用
      const urls = url.split(/\s+/).filter(u => u.trim().length > 0);
      if (urls.length > 1) {
        console.warn(`Multiple URLs found, using first one: ${urls[0]}`);
        return urls[0].trim();
      }

      // 不正な文字を除去
      const cleanUrl = url.replace(/[^\w\-._~:/?#[\]@!$&'()*+,;=%]/g, '');

      // プロトコルが含まれていない場合は追加
      if (cleanUrl && !cleanUrl.startsWith('http')) {
        return `https://${cleanUrl}`;
      }

      return cleanUrl;
    };

    // 作品データの安全な処理
    const processedWork = {
      ...work,
      title: safeString(work.title),
      creator: safeString(work.creator),
      comment: safeString(work.comment),
      member: safeString(work.member),
      memberid: safeString(work.memberid),
      music: safeString(work.music),
      ymulink: validateUrl(work.ymulink),
      tlink: safeString(work.tlink),
      ychlink: validateUrl(work.ychlink),
      credit: safeString(work.credit),
    };

    const { previousWorks, nextWorks } = getRelatedWorks(processedWork, videos, videos.indexOf(work));
    const matchingIcon = getMemberIcons(processedWork.memberid, externalData);

    return {
      props: {
        work: processedWork,
        previousWorks: previousWorks || [],
        nextWorks: nextWorks || [],
        externalData: externalData || [],
        matchingIcon: matchingIcon || [],
        events: events || [],
        videos: videos || [],
      },
      revalidate: 3600, // 1時間ごとに再生成
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        work: null,
        previousWorks: [],
        nextWorks: [],
        externalData: [],
        matchingIcon: [],
        events: [],
        videos: [],
        error: 'データの取得に失敗しました',
      },
      revalidate: 300, // エラー時は5分後に再試行
    };
  }
}

// getStaticPathsの修正
export async function getStaticPaths() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒のタイムアウト

    const response = await fetch("https://pvsf-cash.vercel.app/api/videos", {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (compatible; PVSF-Archive/1.0)',
      },
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed to fetch videos for getStaticPaths: ${response.status} ${response.statusText}`);
      return {
        paths: [],
        fallback: 'blocking', // フォールバックを有効にしてランタイムで生成
      };
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      console.error('Empty response from videos API in getStaticPaths');
      return {
        paths: [],
        fallback: 'blocking',
      };
    }

    let videos;
    try {
      videos = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON Parse Error in getStaticPaths:', parseError.message);
      console.error('Response text:', text.substring(0, 200));
      return {
        paths: [],
        fallback: 'blocking',
      };
    }

    if (!Array.isArray(videos)) {
      console.error('Videos data is not an array in getStaticPaths');
      return {
        paths: [],
        fallback: 'blocking',
      };
    }

    // パスを安全に生成
    const paths = videos
      .filter(video => video?.ylink && typeof video.ylink === 'string')
      .map(video => {
        try {
          const id = video.ylink.slice(17, 28);
          if (id && id.length === 11) { // YouTube IDの長さをチェック
            return { params: { id } };
          }
          return null;
        } catch (error) {
          console.warn(`Invalid video ylink: ${video.ylink}`);
          return null;
        }
      })
      .filter(Boolean); // nullを除去

    console.log(`Generated ${paths.length} static paths out of ${videos.length} videos`);

    return {
      paths: paths.slice(0, 100), // 最初の100個のパスのみ事前生成
      fallback: 'blocking', // 残りはオンデマンドで生成
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('getStaticPaths request timeout');
    } else {
      console.error('Error in getStaticPaths:', error);
    }

    return {
      paths: [],
      fallback: 'blocking', // エラー時もフォールバックを有効に
    };
  }
}