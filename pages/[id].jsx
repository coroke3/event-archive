// pages/[id].jsx
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles/work.module.css";
import { css } from "@emotion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons";

export default function WorkId({
  work,
  previousWorks,
  nextWorks,
  icon,
  eventname,
}) {
  const showComment = work.comment !== undefined && work.comment !== "";
  const showIcon = work.icon !== undefined && work.icon !== "";
  const showCreator = work.creator !== undefined && work.creator !== "";
  const showTwitter = work.tlink !== undefined && work.tlink !== "";
  const showYoutube = work.ylink !== undefined && work.ylink !== "";
  const showMenber = work.member !== undefined && work.member !== "";
  const showMusic =
    work.music !== undefined &&
    work.music !== "" &&
    work.credit !== undefined &&
    work.credit !== "";
  const originalDate = new Date(work.time);
  const modifiedDate = new Date(originalDate.getTime() - 9 * 60 * 60 * 1000);
  const formattedDate = modifiedDate.toLocaleString();
  const showTime = work.time !== undefined && work.time !== "";

  return (
    <div>
      <Head>
        <title>
          {`${work.title} - ${work.creator} - オンライン映像イベント / PVSF archive`}
        </title>
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
            {work.ylink && (
              <iframe
                src={`https://www.youtube.com/embed/${work.ylink.slice(
                  17,
                  28
                )}?vq=hd1080&autoplay=1`}
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
                {showIcon && work.icon ? (
                  <Link
                    href={`../user/${
                      work.tlink ? work.tlink.toLowerCase() : ""
                    }`}
                  >
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
                  <Link
                    href={`../user/${
                      work.tlink ? work.tlink.toLowerCase() : ""
                    }`}
                  >
                    <Image
                      src="https://i.gyazo.com/07a85b996890313b80971d8d2dbf4a4c.jpg"
                      alt={`アイコン`}
                      className={styles.icon}
                      width={50}
                      height={50}
                    />
                  </Link>
                )}

                {showCreator && (
                  <h3 className={styles.creator}>
                    <Link
                      href={`../user/${
                        work.tlink ? work.tlink.toLowerCase() : ""
                      }`}
                    >
                      {work.creator}{" "}
                    </Link>
                    {showYoutube && (
                      <a
                        href={`${work.ylink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faYoutube} />
                      </a>
                    )}
                    {showTwitter && (
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
                {showTime && <p className={styles.time}>{formattedDate}</p>}
              </div>
              <div className={styles.eventInfo}>
                {work.eventname && (
                  <Link href={`../../event/${work.eventname}`}>
                    {icon && (
                      <Image
                        src={`https://lh3.googleusercontent.com/d/${icon.slice(
                          33
                        )}`}
                        alt={`${eventname}のアイコン`}
                        className={styles.eventIcon}
                        width={50}
                        height={50}
                      />
                    )}
                    {eventname && (
                      <h4 className={styles.eventTitle}>{eventname}</h4>
                    )}
                  </Link>
                )}
              </div>
              {showMusic && (
                <p>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: `楽曲:${work.music} - ${work.credit}<br> `,
                    }}
                  />
                </p>
              )}
              {showComment && (
                <p>
                  <div
                    dangerouslySetInnerHTML={{ __html: `${work.comment}` }}
                  />
                </p>
              )}
              {showMenber && (
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
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{username.trim()}</td>
                          <td>{memberId ? `@${memberId}` : "-"}</td>
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

export async function getStaticPaths() {
  try {
    const res = await fetch("https://pvsf-cash.vercel.app/api/videos");
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await res.json();

    const uniquePaths = new Set(); // 重複を防ぐためのセットを使用
    const paths = data
      .map((work) => {
        const path = work.ylink.slice(17, 28);
        if (!uniquePaths.has(path)) {
          uniquePaths.add(path);
          return { params: { id: path } };
        }
        return null; // 重複する場合はnullを返す
      })
      .filter(Boolean); // nullを除去

    // 重複パスがあった場合の処理
    if (paths.length !== uniquePaths.size) {
      console.warn("Duplicate paths detected. Some paths were skipped.");
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

export async function getStaticProps({ params }) {
  try {
    const res = await fetch("https://pvsf-cash.vercel.app/api/videos");
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await res.json();

    // ステータスが "private" でない作品だけをフィルタリング
    const publicData = data.filter((w) => w.status !== "private");

    const work = publicData.find((w) => w.ylink.slice(17, 28) === params.id);

    if (!work) {
      return { notFound: true }; // 該当作品がない場合は404を返す
    }

    const currentIndex = publicData.findIndex(
      (w) => w.ylink.slice(17, 28) === params.id
    );

    // 前後の表示作品数を調整する
    const additionalCount = 2; // 追加で表示する作品数
    const previousWorks = publicData.slice(
      Math.max(0, currentIndex - 5 - additionalCount),
      currentIndex
    );
    const nextWorks = publicData.slice(
      currentIndex + 1,
      currentIndex + 6 + additionalCount
    ); // 現在の作品の次の作品

    // tlinkが一致する作品を取得
    const matchingTlinkWorks = publicData.filter(
      (w) => w.tlink === work.tlink && w.ylink !== work.ylink
    );

    // memberid内にtlinkと一致する文字列がある作品を取得
    const matchingMemberidWorks = publicData.filter(
      (w) => w.memberid && w.memberid.includes(work.tlink)
    );

    let selectedWorks = [];

    // tlink一致作品を選定
    if (currentIndex > 0) {
      // 前の作品がある場合
      const previousTlinkWorks = matchingTlinkWorks.filter(
        (w) => publicData.indexOf(w) < currentIndex
      );
      if (previousTlinkWorks.length > 0) {
        selectedWorks.push(previousTlinkWorks.slice(-1)[0]); // 最も古い作品
      }

      const nextTlinkWorks = matchingTlinkWorks.filter(
        (w) => publicData.indexOf(w) > currentIndex
      );
      if (nextTlinkWorks.length > 0) {
        selectedWorks.push(nextTlinkWorks[0]); // 最新の作品
      }
    } else {
      // 最新の作品がない場合は古い作品を取得
      selectedWorks = matchingTlinkWorks.slice(0, 2); // 最大2件まで取得
    }

    // memberid一致の作品を前後に追加
    const previousMemberidWorks = matchingMemberidWorks
      .filter((w) => publicData.indexOf(w) < currentIndex)
      .slice(-2); // 前の作品最大2件
    const nextMemberidWorks = matchingMemberidWorks
      .filter((w) => publicData.indexOf(w) > currentIndex)
      .slice(0, 2); // 後の作品最大2件

    // 表示するメンバーIDのリストを取得
    const memberIds = work.memberid.split(",").map((id) => id.trim());

    let additionalUserWorks = [];

    // 各ユーザーごとに前後の作品を取得
    for (const memberId of memberIds) {
      const userWorks = publicData.filter(
        (w) =>
          w.memberid && w.memberid.includes(memberId) && w.ylink !== work.ylink
      );

      // tlink一致の作品を優先して取得
      const userMatchingTlinkWorks = userWorks.filter(
        (w) => w.tlink === work.tlink
      );
      const userOtherWorks = userWorks.filter((w) => w.tlink !== work.tlink);

      const userSelectedWorks = [
        ...userMatchingTlinkWorks.slice(0, 2), // 最大2件
        ...userOtherWorks.slice(0, 2), // 最大2件
      ];

      // 追加作品に重複を削除して追加
      additionalUserWorks = [
        ...additionalUserWorks,
        ...userSelectedWorks.filter(
          (u) =>
            !additionalUserWorks.some((existing) => existing.ylink === u.ylink)
        ),
      ];
    }

    // 重複を削除
    const uniquePreviousWorks = Array.from(
      new Set(
        [...selectedWorks, ...previousWorks, ...previousMemberidWorks].map(
          (w) => w.ylink
        )
      )
    ).map((ylink) =>
      [...selectedWorks, ...previousWorks, ...previousMemberidWorks].find(
        (w) => w.ylink === ylink
      )
    );

    const uniqueNextWorks = Array.from(
      new Set(
        [...nextWorks, ...nextMemberidWorks, ...additionalUserWorks].map(
          (w) => w.ylink
        )
      )
    ).map((ylink) =>
      [...nextWorks, ...nextMemberidWorks, ...additionalUserWorks].find(
        (w) => w.ylink === ylink
      )
    );

    // .credit 一致の作品を最大4件取得
    const matchingCreditWorks = publicData
      .filter(
        (w) =>
          w.credit &&
          w.credit.toLowerCase() === work.credit?.toLowerCase() &&
          w.ylink !== work.ylink
      )
      .slice(0, 4); // 最大4件

    // .music 一致の作品を最大4件取得
    const matchingMusicWorks = publicData
      .filter(
        (w) =>
          w.music &&
          typeof w.music === "string" &&
          w.music.toLowerCase() === work.music?.toLowerCase() &&
          w.ylink !== work.ylink
      )
      .slice(0, 4); // 最大4件

    // 最終的なユニークな次の作品に追加
    const finalNextWorks = [
      ...uniqueNextWorks,
      ...matchingCreditWorks,
      ...matchingMusicWorks,
    ];

    // finalNextWorksからも重複を削除
    const uniqueFinalNextWorks = Array.from(
      new Set(finalNextWorks.map((w) => w.ylink))
    ).map((ylink) => finalNextWorks.find((w) => w.ylink === ylink));

    const eventId = work.eventname; // eventnameからイベントIDを取得
    const eventRes = await fetch(
      `https://script.google.com/macros/s/AKfycbybjT6iEZWbfCIzTvU1ALVxp1sa_zS_pGJh5_p_SBsJgLtmzcmqsIDRtFkJ9B8Yko6tyA/exec?eventid=${eventId}`
    );

    if (!eventRes.ok) {
      throw new Error("イベント情報の取得に失敗しました");
    }

    const eventData = await eventRes.json();

    // eventDataから.eventnameと.iconを取得
    const eventInfo = eventData.find((event) => event.eventid === eventId);
    const eventname = eventInfo?.eventname || "Unknown Event";
    const icon = eventInfo?.icon || "";

    return {
      props: {
        work,
        previousWorks: uniquePreviousWorks,
        nextWorks: uniqueFinalNextWorks, // 修正
        eventname, // 追加
        icon, // 追加
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        work: {},
        previousWorks: [],
        nextWorks: [],
        eventname: "", // 追加
        icon: "", // 追加
      },
    };
  }
}
