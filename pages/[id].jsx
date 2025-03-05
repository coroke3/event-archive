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
const MemberTableRow = React.memo(function MemberTableRow({ username, memberId, memberIconInfo, matchedUser, index }) {
  return (
    <tr>
      <td>{index + 1}</td>
      <td>{username.trim()}</td>
      <td className={styles.userlink}>
        {matchedUser ? (
          <>
            {memberIconInfo?.icon ? (
              <Link href={`/user/${matchedUser.username}`} className={styles.userLink}>
                <Image
                  src={`https://lh3.googleusercontent.com/d/${memberIconInfo.icon.slice(33)}`}
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

// authプロパティのデフォルト値を設定
const defaultAuth = {
  auth: false,
  user: null
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
}) {
  // workDetailsをuseMemoで最適化
  const workDetails = useMemo(() => {
    // 安全な文字列チェック関数
    const safeString = (value) => {
      if (typeof value === 'string') return value.trim();
      if (Array.isArray(value)) return value.join(', ').trim();
      return '';
    };

    if (!work) {
      return {
        showComment: false,
        showIcon: false,
        showCreator: false,
        showTwitter: false,
        showYoutube: false,
        showMember: false,
        showMusic: false,
        showMusicLink: false,
        showTime: false,
      };
    }

    return {
      showComment: safeString(work.comment) !== "",
      showIcon: safeString(work.icon) !== "",
      showCreator: safeString(work.creator) !== "",
      showTwitter: safeString(work.tlink) !== "",
      showYoutube: safeString(work.ylink) !== "",
      showMember: safeString(work.member) !== "" && safeString(work.memberid) !== "",
      showMusic: safeString(work.music) !== "",
      showMusicLink: safeString(work.ymulink) !== "",
      showTime: safeString(work.time) !== "",
    };
  }, [work]);

  // メタデータをuseMemoで最適化
  const metaData = useMemo(() => ({
    title: `${work.title} - ${work.creator} - オンライン映像イベント / PVSF archive`,
    description: `PVSFへの出展作品です。  ${work.title} - ${work.creator}`,
    ogDescription: `PVSF 出展作品  ${work.title} - ${work.creator}  music:${work.music} - ${work.credit}`,
  }), [work]);

  // 日付フォーマット
  const formattedDate = useMemo(() => {
    if (!work.time) return "";
    const originalDate = new Date(work.time);
    const modifiedDate = new Date(originalDate.getTime() - 9 * 60 * 60 * 1000);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(modifiedDate);
  }, [work.time]);

  // YouTube URL
  const youtubeEmbedUrl = useMemo(() => 
    work.ylink ? `https://www.youtube.com/embed/${work.ylink.slice(17, 28)}?vq=hd1080&autoplay=1` : null,
    [work.ylink]
  );

  // メンバー情報の処理を最適化
  const memberInfo = useMemo(() => {
    if (!work?.member || !workDetails.showMember) return [];
    return work.member.split(/[,、，]/).map((username, index) => {
      const memberId = work.memberid.split(/[,、，]/)[index]?.trim();
      const memberIconInfo = matchingIcon.find(
        item => item.memberId.toLowerCase() === memberId?.toLowerCase()
      );
      const matchedUser = externalData.find(
        user => user.username.toLowerCase() === memberId?.toLowerCase()
      );
      return { username, memberId, memberIconInfo, matchedUser };
    });
  }, [work?.member, work?.memberid, matchingIcon, externalData, workDetails.showMember]);

  // 楽曲情報の処理を最適化
  const musicInfo = useMemo(() => {
    if (typeof work?.music !== 'string') return [];
    return work.music.trim().split(",");
  }, [work?.music]);

  return (
    <div>
      <Head>
        <title>{`${work.title} - ${work.creator} - オンライン映像イベント / PVSF archive`}</title>
        <meta
          name="description"
          content={`PVSFへの出展作品です。  ${work.title} - ${work.creator}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@pvscreeningfes" />
        <meta name="twitter:creator" content="@coroke3" />
        <meta property="og:url" content="pvsf.jp" />
        <meta
          property="og:title"
          content={`${work.title} - ${work.creator} / PVSF archive`}
        />
        <meta
          property="og:description"
          content={`PVSF 出展作品  ${work.title} - ${work.creator}  music:${work.music} - ${work.credit}`}
        />
        <meta property="og:image" content={work.largeThumbnail} />
      </Head>

      <div className={styles.contentr}>
        <div className={styles.bf}>
          <div className={styles.s1f}>
            {work.ylink && youtubeEmbedUrl && (
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
              <h1 className={styles.title}>{work.title}</h1>
              <div className={styles.userinfo}>
                {workDetails.showIcon ? (
                  <Link href={`../user/${work.tlink?.toLowerCase() || ""}`}>
                    <Image
                      src={work?.icon 
                        ? `https://lh3.googleusercontent.com/d/${work.icon.slice(33)}`
                        : "https://i.gyazo.com/07a85b996890313b80971d8d2dbf4a4c.jpg"
                      }
                      className={styles.icon}
                      alt={`${work.creator}のアイコン`}
                      width={50}
                      height={50}
                    />
                  </Link>
                ) : (
                  <Link href={`../user/${work.tlink?.toLowerCase() || ""}`}>
                    <Image
                      src="https://i.gyazo.com/07a85b996890313b80971d8d2dbf4a4c.jpg"
                      alt="アイコン"
                      className={styles.icon}
                      width={50}
                      height={50}
                    />
                  </Link>
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
                  <p className={styles.time}>{formattedDate}</p>
                )}
              </div>

              <div className={styles.eventInfo}>
                {work.eventid &&
                  work.eventid.split(",").map((eventId, index) => (
                    <Link key={index} href={`../../event/${eventId.trim()}`}>
                      {/* アイコンの取得 */}
                      {icon && icon.split(",")[index] && (
                        <Image
                          src={`https://lh3.googleusercontent.com/d/${icon
                            .split(",")
                            [index].slice(33)}`}
                          alt={`${eventId.trim()}のアイコン`}
                          className={styles.eventIcon}
                          width={50}
                          height={50}
                        />
                      )}
                      {/* イベント名の表示 */}
                      <h4 className={styles.eventTitle}>{eventId.trim()}</h4>
                    </Link>
                  ))}
              </div>

              {workDetails.showMusic && (
                <p
                  dangerouslySetInnerHTML={{
                    __html: `楽曲:${work.music} - ${work.credit}<br> `,
                  }}
                />
              )}
              {workDetails.showMusicLink && (
                <p>
                  <Link href={work.ymulink}>楽曲リンク＞</Link>
                </p>
              )}
              {workDetails.showComment && (
                <p>
                  <div
                    dangerouslySetInnerHTML={{ __html: `${work.comment}` }}
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
                    {work.member.split(/[,、，]/).map((username, index) => {
                      const memberId = work.memberid
                        ?.split(/[,、，]/)
                        ?.[index]
                        ?.trim() || '';

                      // プロパティから渡されたmatchingIconを使用
                      const memberIconInfo = matchingIcon?.find(
                        (item) =>
                          item?.memberId?.toLowerCase() ===
                          memberId?.toLowerCase()
                      );

                      // 外部データからユーザー情報を検索
                      const matchedUser = externalData?.find(
                        (user) =>
                          user?.username?.toLowerCase() ===
                          memberId?.toLowerCase()
                      );

                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{username?.trim() || ''}</td>
                          <td className={styles.userlink}>
                            {matchedUser ? (
                              <>
                                {memberIconInfo?.icon ? (
                                  <Link
                                    href={`/user/${matchedUser.username}`}
                                    className={styles.userLink}
                                  >
                                    <Image
                                      src={`https://lh3.googleusercontent.com/d/${memberIconInfo.icon.slice(33)}`}
                                      alt={`${matchedUser.username}のアイコン`}
                                      width={50}
                                      height={50}
                                      className={styles.icon}
                                    />
                                  </Link>
                                ) : (
                                  <Link
                                    href={`/user/${matchedUser.username}`}
                                    className={styles.userLink}
                                  >
                                    <FontAwesomeIcon icon={faUser} />
                                  </Link>
                                )}
                                <div className={styles.userlis}>
                                  <Link
                                    href={`/user/${matchedUser.username}`}
                                    className={styles.userLink}
                                  >
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
                              <a
                                href={`https://twitter.com/${memberId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FontAwesomeIcon
                                  icon={faXTwitter}
                                  className={styles.twitterIcon}
                                />
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div className={styles.s2f}>
            {previousWorks.map((prevWork) => (
              <div className={styles.ss1} key={prevWork.ylink.slice(17, 28)}>
                <div className={styles.ss12}>
                  <Link href={`/${prevWork.ylink.slice(17, 28)}`}>
                    <img
                      src={prevWork.smallThumbnail}
                      width={`100%`}
                      alt={`${prevWork.title} - ${prevWork.creator} | PVSF archive`}
                    />
                  </Link>
                </div>
                <div className={styles.ss13}>
                  <p className={styles.scc}>{prevWork.title}</p>
                  <p className={styles.sc}>{prevWork.creator}</p>
                </div>
              </div>
            ))}
            {nextWorks.map((nextWork) => (
              <div className={styles.ss1} key={nextWork.ylink.slice(17, 28)}>
                <div className={styles.ss12}>
                  <Link href={`/${nextWork.ylink.slice(17, 28)}`}>
                    <img
                      src={nextWork.smallThumbnail}
                      width={`100%`}
                      alt={`${nextWork.title} - ${nextWork.creator} | PVSF archive`}
                    />
                  </Link>
                </div>
                <div className={styles.ss13}>
                  <p className={styles.scc}>{nextWork.title}</p>
                  <p className={styles.sc}>{nextWork.creator}</p>
                </div>
              </div>
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
    const memberWorks = publicData2.filter(
      (w) => w.tlink.toLowerCase() === memberId.toLowerCase()
    );

    if (memberWorks.length > 0) {
      const prioritizedWorks = memberWorks.filter((w) => w.type === "個人");
      const latestWork =
        prioritizedWorks.length > 0 ? prioritizedWorks[0] : memberWorks[0];

      matchingIcon.push({
        memberId,
        icon: latestWork.icon,
      });
    }
  }
  return matchingIcon;
}

// getRelatedWorks関数を修正
function getRelatedWorks(work, publicData, currentIndex) {
  // 安全な文字列比較関数
  const safeCompare = (a, b) => {
    if (!a || !b) return false;
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    return a.toLowerCase() === b.toLowerCase();
  };

  // ヘルパー関数
  const uniqueWorks = (works) => (
    Array.from(new Set(works.map(w => w.ylink)))
      .map(ylink => works.find(w => w.ylink === ylink))
  );

  const getRandomWorks = (works, count) => (
    works.length <= count ? works : 
    works.sort(() => 0.5 - Math.random()).slice(0, count)
  );

  // 共通のフィルター条件
  const baseFilter = w => w.ylink !== work.ylink;
  const memberIds = work.memberid?.split(',').map(id => id.trim()).filter(Boolean) || [];
  const workTime = new Date(work.time);
  const worksPerUser = publicData.length <= 25 ? 2 : 1;

  // privateな動画の場合は、同じクリエイターの公開動画を優先的に表示
  if (work.status === "private") {
    const categorizedWorks = publicData.reduce((acc, w) => {
      if (!baseFilter(w)) return acc;

      // ①.tlink一致（同じクリエイター）
      if (w.tlink === work.tlink) {
        acc.tlinkWorks.push(w);
      }

      // ②.memberidにtlink一致
      if (w.memberid?.split(',').map(id => id.trim()).includes(work.tlink)) {
        acc.memberidWorks.push({
          ...w,
          timeDiff: Math.abs(new Date(w.time) - workTime)
        });
      }

      // ④⑤.memberid関連
      if (memberIds.some(id => w.tlink === id)) {
        acc.memberTlinkWorks.push(w);
      } else if (memberIds.some(id => w.memberid?.includes(id)) && w.tlink !== work.tlink) {
        acc.memberRelatedWorks.push(w);
      }

      // ⑥⑦.music/credit一致
      if (safeCompare(w.music, work.music)) {
        acc.musicWorks.push(w);
      }
      if (safeCompare(w.credit, work.credit)) {
        acc.creditWorks.push(w);
      }

      // ⑨.deterministicScore
      if (w.deterministicScore) {
        acc.scoreWorks.push(w);
      }

      return acc;
    }, {
      tlinkWorks: [],
      memberidWorks: [],
      memberTlinkWorks: [],
      memberRelatedWorks: [],
      musicWorks: [],
      creditWorks: [],
      scoreWorks: []
    });

    // 各カテゴリの作品を処理（privateの場合は同じクリエイターの作品を優先）
    const processedWorks = {
      // ①前後の作品（同じクリエイターを優先）
      tlinkWorks: categorizedWorks.tlinkWorks
        .sort((a, b) => Math.abs(new Date(a.time) - workTime) - 
                        Math.abs(new Date(b.time) - workTime))
        .slice(0, 4),

      // ②時系列の近い作品
      memberidWorks: categorizedWorks.memberidWorks
        .sort((a, b) => a.timeDiff - b.timeDiff)
        .slice(0, 2),

      // ④⑤memberid関連
      memberTlinkWorks: getRandomWorks(categorizedWorks.memberTlinkWorks, worksPerUser * memberIds.length),
      memberRelatedWorks: getRandomWorks(categorizedWorks.memberRelatedWorks, worksPerUser * memberIds.length),

      // ⑥⑦music/credit一致
      musicWorks: getRandomWorks(categorizedWorks.musicWorks, 2),
      creditWorks: getRandomWorks(categorizedWorks.creditWorks, 2),

      // ⑧ランダム
      randomWorks: getRandomWorks(publicData.filter(baseFilter), 2),

      // ⑨スコア上位
      scoreWorks: getRandomWorks(
        categorizedWorks.scoreWorks
          .sort((a, b) => b.deterministicScore - a.deterministicScore)
          .slice(0, 50),
        2
      )
    };

    // 結果の結合と重複除去（privateの場合は同じクリエイターの作品を優先）
    const uniqueAllWorks = uniqueWorks([
      ...processedWorks.tlinkWorks,
      ...processedWorks.memberidWorks,
      ...processedWorks.memberTlinkWorks,
      ...processedWorks.memberRelatedWorks,
      ...processedWorks.musicWorks,
      ...processedWorks.creditWorks,
      ...processedWorks.randomWorks,
      ...processedWorks.scoreWorks
    ]);

    const midPoint = Math.floor(uniqueAllWorks.length / 2);
    return {
      previousWorks: uniqueAllWorks.slice(0, midPoint),
      nextWorks: uniqueAllWorks.slice(midPoint)
    };
  }

  // 通常の公開動画の場合は既存のロジックを使用
  const categorizedWorks = publicData.reduce((acc, w) => {
    if (!baseFilter(w)) return acc;

    // ①.tlink一致
    if (w.tlink === work.tlink) {
      acc.tlinkWorks.push(w);
    }

    // ②.memberidにtlink一致
    if (w.memberid?.split(',').map(id => id.trim()).includes(work.tlink)) {
      acc.memberidWorks.push({
        ...w,
        timeDiff: Math.abs(new Date(w.time) - workTime)
      });
    }

    // ④⑤.memberid関連
    if (memberIds.some(id => w.tlink === id)) {
      acc.memberTlinkWorks.push(w);
    } else if (memberIds.some(id => w.memberid?.includes(id)) && w.tlink !== work.tlink) {
      acc.memberRelatedWorks.push(w);
    }

    // ⑥⑦.music/credit一致
    if (safeCompare(w.music, work.music)) {
      acc.musicWorks.push(w);
    }
    if (safeCompare(w.credit, work.credit)) {
      acc.creditWorks.push(w);
    }

    // ⑨.deterministicScore
    if (w.deterministicScore) {
      acc.scoreWorks.push(w);
    }

    return acc;
  }, {
    tlinkWorks: [],
    memberidWorks: [],
    memberTlinkWorks: [],
    memberRelatedWorks: [],
    musicWorks: [],
    creditWorks: [],
    scoreWorks: []
  });

  // 各カテゴリの作品を処理
  const processedWorks = {
    // ①前後の作品
    tlinkWorks: categorizedWorks.tlinkWorks
      .sort((a, b) => Math.abs(currentIndex - publicData.indexOf(a)) - 
                      Math.abs(currentIndex - publicData.indexOf(b)))
      .slice(0, 2),

    // ②時系列の近い作品
    memberidWorks: categorizedWorks.memberidWorks
      .sort((a, b) => a.timeDiff - b.timeDiff)
      .slice(0, 2),

    // ③前後6作品
    surroundingWorks: [
      ...publicData.slice(Math.max(0, currentIndex - 6), currentIndex),
      ...publicData.slice(currentIndex + 1, currentIndex + 7)
    ],

    // ④⑤memberid関連
    memberTlinkWorks: getRandomWorks(categorizedWorks.memberTlinkWorks, worksPerUser * memberIds.length),
    memberRelatedWorks: getRandomWorks(categorizedWorks.memberRelatedWorks, worksPerUser * memberIds.length),

    // ⑥⑦music/credit一致
    musicWorks: getRandomWorks(categorizedWorks.musicWorks, 4),
    creditWorks: getRandomWorks(categorizedWorks.creditWorks, 4),

    // ⑧ランダム
    randomWorks: getRandomWorks(publicData.filter(baseFilter), 2),

    // ⑨スコア上位
    scoreWorks: getRandomWorks(
      categorizedWorks.scoreWorks
        .sort((a, b) => b.deterministicScore - a.deterministicScore)
        .slice(0, 50),
      2
    )
  };

  // 結果の結合と重複除去
  const uniqueAllWorks = uniqueWorks([
    ...processedWorks.tlinkWorks,
    ...processedWorks.memberidWorks,
    ...processedWorks.surroundingWorks,
    ...processedWorks.memberTlinkWorks,
    ...processedWorks.memberRelatedWorks,
    ...processedWorks.musicWorks,
    ...processedWorks.creditWorks,
    ...processedWorks.randomWorks,
    ...processedWorks.scoreWorks
  ]);

  const midPoint = Math.floor(uniqueAllWorks.length / 2);
  return {
    previousWorks: uniqueAllWorks.slice(0, midPoint),
    nextWorks: uniqueAllWorks.slice(midPoint)
  };
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
  try {
    // 再試行ロジックを追加
    const fetchWithRetry = async (url, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url, {
            timeout: 30000,
            headers: {
              'Cache-Control': 'public, max-age=3600'
            }
          });
          if (res.ok) {
            const data = await res.json();
            return data || null; // データが無い場合はnullを返す
          }
        } catch (err) {
          if (i === retries - 1) throw err;
          await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
      }
      return null; // 全ての再試行が失敗した場合
    };

    // 並列でデータを取得し、デフォルト値を設定
    const [videos, users, events] = await Promise.all([
      fetchWithRetry("https://pvsf-cash.vercel.app/api/videos"),
      fetchWithRetry("https://pvsf-cash.vercel.app/api/users"),
      fetchWithRetry("https://pvsf-cash.vercel.app/api/events")
    ]);

    if (!videos) {
      throw new Error('Failed to fetch videos data');
    }

    // publicDataの定義を変更（関連動画用）
    const publicData = videos.filter(w => w.status !== "private");
    
    // workの検索時はprivateフィルターを削除
    const work = videos.find(w => w.ylink.slice(17, 28) === params.id);

    if (!work) {
      console.error(`Work not found for ID: ${params.id}`);
      return { notFound: true };
    }

    // 関連動画の取得時にはpublicDataを使用（privateを除外）
    const currentIndex = publicData.findIndex(w => w.ylink.slice(17, 28) === params.id);
    const { previousWorks, nextWorks } = getRelatedWorks(work, publicData, currentIndex);
    const memberIds = work.memberid?.split(',').map(id => id.trim()).filter(Boolean) || [];
    const matchingIcon = getMemberIcons(memberIds, publicData);
    
    // eventsのnullチェックを追加
    const eventInfo = events && Array.isArray(events) 
      ? events.find(e => e.eventid === work.eventid) || { eventname: "", icon: "" }
      : { eventname: "", icon: "" };

    return {
      props: {
        work,
        externalData: users || [],
        matchingIcon,
        previousWorks: previousWorks || [],
        nextWorks: nextWorks || [],
        eventname: eventInfo.eventname || "",
        icon: eventInfo.icon || "",
        auth: { auth: false, user: null }
      }
    };

  } catch (error) {
    console.error(`Error in getStaticProps for ID ${params.id}:`, error);
    throw error;
  }
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