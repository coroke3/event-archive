// pages/[id].jsx
import React, { useMemo } from "react"; // Added React import
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXTwitter,
  faYoutube,
  faUser,
} from "@fortawesome/free-brands-svg-icons";
import styles from "../styles/work.module.css";

export default function WorkId({
  work,
  previousWorks,
  nextWorks,
  icon,
  eventname,
  externalData,
  matchingIcon,
}) {
  // Memoize conditional checks to improve readability and potential performance
  const workDetails = {
    showComment: work.comment && work.comment.trim() !== "",
    showIcon: work.icon && work.icon.trim() !== "",
    showCreator: work.creator && work.creator.trim() !== "",
    showTwitter: work.tlink && work.tlink.trim() !== "",
    showYoutube: work.ylink && work.ylink.trim() !== "",
    showMember:
      work.member &&
      work.memberid &&
      work.member.trim() !== "" &&
      work.memberid.trim() !== "",
    showMusic:
      work.music &&
      work.credit &&
      work.music.trim() !== "" &&
      work.credit.trim() !== "",
    showMusicLink: work.ymulink && work.ymulink.trim() !== "",
    showTime: work.time && work.time.trim() !== "",
  };

  // Optimize date formatting with memoization
  const formattedDate = React.useMemo(() => {
    if (!work.time) return "";
    const originalDate = new Date(work.time);
    const modifiedDate = new Date(originalDate.getTime() - 9 * 60 * 60 * 1000);
    return modifiedDate.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  }, [work.time]);

  // Memoize YouTube embed URL extraction
  const youtubeEmbedUrl = React.useMemo(
    () =>
      work.ylink
        ? `https://www.youtube.com/embed/${work.ylink.slice(
            17,
            28
          )}?vq=hd1080&autoplay=1`
        : null,
    [work.ylink]
  );

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
                      src={`https://lh3.googleusercontent.com/d/${work.icon.slice(
                        33
                      )}`}
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
              {workDetails.showMember && (
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
                        .split(/[,、，]/)
                        [index]?.trim();

                      // プロパティから渡されたmatchingIconを使用
                      const memberIconInfo = matchingIcon.find(
                        (item) =>
                          item.memberId.toLowerCase() ===
                          memberId?.toLowerCase()
                      );

                      // 外部データからユーザー情報を検索
                      const matchedUser = externalData.find(
                        (user) =>
                          user.username.toLowerCase() ===
                          memberId?.toLowerCase()
                      );

                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{username.trim()}</td>
                          <td className={styles.userlink}>
                            {matchedUser ? (
                              <>
                                {/* user/[id] リンク */}
                                {memberIconInfo && memberIconInfo.icon ? (
                                  <Link
                                    href={`/user/${matchedUser.username}`}
                                    className={styles.userLink}
                                  >
                                    <Image
                                      src={`https://lh3.googleusercontent.com/d/${memberIconInfo.icon.slice(
                                        33
                                      )}`}
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

// 関連動画を取得する関数
function getRelatedWorks(work, publicData, currentIndex) {
  // 前後の表示作品数を調整
  const additionalCount = 2;
  const previousWorks = publicData.slice(
    Math.max(0, currentIndex - 5 - additionalCount),
    currentIndex
  );
  const nextWorks = publicData.slice(
    currentIndex + 1,
    currentIndex + 6 + additionalCount
  );

  // tlink一致作品を取得
  const matchingTlinkWorks = publicData.filter(
    (w) => w.tlink === work.tlink && w.ylink !== work.ylink
  );

  // memberid一致作品を取得
  const matchingMemberidWorks = publicData.filter(
    (w) => w.memberid && w.memberid.includes(work.tlink)
  );

  let selectedWorks = [];
  if (currentIndex > 0) {
    const previousTlinkWorks = matchingTlinkWorks.filter(
      (w) => publicData.indexOf(w) < currentIndex
    );
    if (previousTlinkWorks.length > 0) {
      selectedWorks.push(previousTlinkWorks.slice(-1)[0]);
    }

    const nextTlinkWorks = matchingTlinkWorks.filter(
      (w) => publicData.indexOf(w) > currentIndex
    );
    if (nextTlinkWorks.length > 0) {
      selectedWorks.push(nextTlinkWorks[0]);
    }
  } else {
    selectedWorks = matchingTlinkWorks.slice(0, 2);
  }

  const previousMemberidWorks = matchingMemberidWorks
    .filter((w) => publicData.indexOf(w) < currentIndex)
    .slice(-2);
  const nextMemberidWorks = matchingMemberidWorks
    .filter((w) => publicData.indexOf(w) > currentIndex)
    .slice(0, 2);

  const memberIds = work.memberid.split(",").map((id) => id.trim());
  let additionalUserWorks = [];

  for (const memberId of memberIds) {
    const userWorks = publicData.filter(
      (w) =>
        w.memberid && w.memberid.includes(memberId) && w.ylink !== work.ylink
    );

    const userMatchingTlinkWorks = userWorks.filter(
      (w) => w.tlink === work.tlink
    );
    const userOtherWorks = userWorks.filter((w) => w.tlink !== work.tlink);

    const userSelectedWorks = [
      ...userMatchingTlinkWorks.slice(0, 2),
      ...userOtherWorks.slice(0, 2),
    ];

    additionalUserWorks = [
      ...additionalUserWorks,
      ...userSelectedWorks.filter(
        (u) =>
          !additionalUserWorks.some((existing) => existing.ylink === u.ylink)
      ),
    ];
  }

  const allPreviousWorks = [
    ...selectedWorks,
    ...previousWorks,
    ...previousMemberidWorks,
  ];
  const allNextWorks = [
    ...nextWorks,
    ...nextMemberidWorks,
    ...additionalUserWorks,
  ];

  const uniquePreviousWorks = Array.from(
    new Set(allPreviousWorks.map((w) => w.ylink))
  ).map((ylink) => allPreviousWorks.find((w) => w.ylink === ylink));

  const uniqueNextWorks = Array.from(
    new Set(allNextWorks.map((w) => w.ylink))
  ).map((ylink) => allNextWorks.find((w) => w.ylink === ylink));

  const matchingCreditWorks = publicData
    .filter(
      (w) =>
        w.credit &&
        w.credit.toLowerCase() === work.credit?.toLowerCase() &&
        w.ylink !== work.ylink
    )
    .slice(0, 4);

  const matchingMusicWorks = publicData
    .filter(
      (w) =>
        w.music &&
        typeof w.music === "string" &&
        w.music.toLowerCase() === work.music?.toLowerCase() &&
        w.ylink !== work.ylink
    )
    .slice(0, 4);

  const finalNextWorks = [
    ...uniqueNextWorks,
    ...matchingCreditWorks,
    ...matchingMusicWorks,
  ];

  const uniqueFinalNextWorks = Array.from(
    new Set(finalNextWorks.map((w) => w.ylink))
  ).map((ylink) => finalNextWorks.find((w) => w.ylink === ylink));

  return {
    previousWorks: uniquePreviousWorks,
    nextWorks: uniqueFinalNextWorks,
  };
}

// getStaticPropsを更新
export async function getStaticProps({ params }) {
  try {
    const externalRes = await fetch("https://pvsf-cash.vercel.app/api/users");
    if (!externalRes.ok) {
      throw new Error("外部データの取得に失敗しました");
    }
    const externalData = await externalRes.json();

    const res = await fetch("https://pvsf-cash.vercel.app/api/videos");
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await res.json();

    const publicData = data.filter((w) => w.status !== "private");
    const publicData2 = data;

    const work = publicData.find((w) => w.ylink.slice(17, 28) === params.id);
    if (!work) {
      return { notFound: true };
    }

    const currentIndex = publicData.findIndex(
      (w) => w.ylink.slice(17, 28) === params.id
    );

    // 各機能を別関数から取得
    const { eventname, icon } = await fetchEventData(work.eventid);
    const memberIds = work.memberid.split(",").map((id) => id.trim());
    const matchingIcon = getMemberIcons(memberIds, publicData2);
    const { previousWorks, nextWorks } = getRelatedWorks(
      work,
      publicData,
      currentIndex
    );

    return {
      props: {
        work,
        externalData,
        matchingIcon,
        previousWorks,
        nextWorks,
        eventname,
        icon,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        work: {},
        externalData: [],
        previousWorks: [],
        nextWorks: [],
        eventname: "",
        icon: "",
      },
    };
  }
}
export async function getStaticPaths() {
  try {
    const res = await fetch("https://pvsf-cash.vercel.app/api/videos");
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await res.json();

    const uniquePaths = new Set(); // 重複を防ぐためのセット
    const paths = data
      .map((work) => {
        const path = work.ylink.slice(17, 28);
        if (!uniquePaths.has(path)) {
          uniquePaths.add(path);
          return { params: { id: path } };
        }
        return null;
      })
      .filter(Boolean); // nullを除去

    // 重複パスがあった場合の警告
    if (paths.length !== uniquePaths.size) {
      console.warn("重複するパスが検出され、スキップされました。");
    }

    return {
      paths,
      fallback: false,
    };
  } catch (error) {
    console.error(error);
    return {
      paths: [],
      fallback: false,
    };
  }
}