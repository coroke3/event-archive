import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "../components/Footer";
import styles from "../styles/works.module.css";
import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ScrollSection from "../components/ScrollSection";

// メインコンポーネント
export default function Home({ videos, users, events }) {
  // データが存在しない場合の早期リターン
  if (!videos || !Array.isArray(videos) || videos.length === 0) {
    return (
      <div className={styles.homeContainer}>
        <Head>
          <title>EventArchives - 映像イベントアーカイブ</title>
          <meta name="description" content="PVSFへの出展作品アーカイブ" />
        </Head>
        <div className={styles.errorContainer}>
          <h1>データを読み込み中...</h1>
          <p>作品データの取得に時間がかかっています。しばらくお待ちください。</p>
        </div>
        <Footer />
      </div>
    );
  }

  // ②おすすめ動画（videoScoreの上位30作品をランダムに並び替え）
  const recommendedVideos = useMemo(() => {
    return [...videos]
      .filter(video => video.status !== "private")
      .sort((a, b) => (b.videoScore || 0) - (a.videoScore || 0))
      .slice(0, 40)
      .sort(() => 0.5 - Math.random()); // ランダムに並び替え
  }, [videos]);

  // ③4作品以上のクリエイターをランダムで20人
  const popularCreators = useMemo(() => {
    // 1. すべてのユーザーの作品数をカウント（合作を含む）
    const creatorCounts = {};
    const creatorCounts2 = {}; // 個人作品のみのカウント

    videos.forEach(video => {
      // tlink からの集計（個人作品）
      if (video.tlink) {
        const tlink = video.tlink.toLowerCase();
        creatorCounts[tlink] = (creatorCounts[tlink] || 0) + 1;
        if (video.type === "個人") {
          creatorCounts2[tlink] = (creatorCounts2[tlink] || 0) + 1;
        }
      }

      // memberid からの集計（合作参加）
      if (video.memberid) {
        video.memberid.split(',').forEach(memberId => {
          const id = memberId.trim().toLowerCase();
          if (id) {
            creatorCounts[id] = (creatorCounts[id] || 0) + 1;
          }
        });
      }
    });

    // 2. 4作品以上のクリエイター（個人作品で判定）
    const frequentCreators = Object.keys(creatorCounts2)
      .filter(tlink => creatorCounts2[tlink] >= 4)
      .map(tlink => getCreatorInfo(tlink, videos, users));

    // 3. videoScore上位作品のクリエイター（2作品以上）
    const topScoredVideos = [...videos]
      .filter(video => video.status !== "private")
      .sort((a, b) => (b.videoScore || 0) - (a.videoScore || 0))
      .slice(0, 30);

    const topCreators = [...new Set(topScoredVideos
      .map(video => video.tlink?.toLowerCase())
      .filter(Boolean))]
      .filter(tlink => creatorCounts[tlink] >= 2)
      .map(tlink => getCreatorInfo(tlink, videos, users));

    // 4. 両方のリストからランダムに選出
    return [
      ...shuffleArray(frequentCreators).slice(0, 20),
      ...shuffleArray(topCreators).slice(0, 20)
    ];
  }, [videos, users]);

  // ④直近3イベントの作品
  const recentEvents = useMemo(() => {
    if (!events || !Array.isArray(events)) return [];

    // イベントを配列の上から3つ取得
    const topEvents = events.slice(0, 3);

    return topEvents.map(event => {
      // イベントに関連する作品を取得
      const eventVideos = videos
        .filter(video =>
          video.eventid &&
          video.eventid.split(',').some(id => id.trim() === event.eventid) &&
          video.status !== "private"
        )
        .slice(0, 8); // 各イベント最大8作品

      return {
        ...event,
        videos: eventVideos
      };
    });
  }, [events, videos]);

  // ⑤最新の30作品
  const latestVideos = useMemo(() => {
    return [...videos]
      .filter(video => video.status !== "private")
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 30);
  }, [videos]);

  return (
    <div className={styles.homeContainer}>
      <Head>
        <title>EventArchives - 映像イベントアーカイブ</title>
        <meta
          name="description"
          content="様々な映像イベントに投稿された動画や合作を掲載。"
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@pvscreeningfes" />
        <meta property="og:url" content="pvsf.jp" />
        <meta
          property="og:title"
          content="EventArchives - 映像イベントアーカイブ"
        />
        <meta
          property="og:description"
          content="様々な映像イベントに投稿された動画や合作を掲載。"
        />
        <meta
          property="og:image"
          content="https://i.gyazo.com/6d5407792094cb1437714af28f272f98.png"
        />
      </Head>

      {/* ①タイトルセクション */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>EventArchives</h1>
          <p>様々な映像イベントに投稿された動画や合作を掲載。</p>
        </div>
      </section>

      {/* ②おすすめ動画 */}
      <ScrollSection
        title="おすすめ"
        viewMoreLink={
          <Link href="/recommend" className={styles.viewMoreLink}>

          </Link>
        }
      >
        {recommendedVideos.map((video) => (
          <div className={styles.videoCard} key={video.ylink}>
            <Link href={`/${video.ylink.slice(17, 28)}`}>
              <div className={styles.thumbnailContainer}>
                <img
                  src={video.smallThumbnail}
                  alt={`${video.title} - ${video.creator}`}
                  className={styles.thumbnail}
                  loading="lazy"
                />
              </div>
              <div className={styles.videoInfo}>
                <h3 className={styles.videoTitle}>{video.title}</h3>
                <div className={styles.creatorInfo}>
                  {video.icon ? (
                    <Image
                      src={`https://lh3.googleusercontent.com/d/${video.icon.slice(33)}`}
                      alt={`${video.creator}のアイコン`}
                      width={24}
                      height={24}
                      className={styles.creatorIcon}
                    />
                  ) : null}
                  <span className={styles.creatorName}>{video.creator}</span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </ScrollSection>

      {/* ③人気クリエイター */}
      <ScrollSection
        title="クリエイター"
        viewMoreLink={
          <Link href="/user" className={styles.viewMoreLink}>
            もっと見る <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        }
        reverseScroll={true} // 逆方向スクロール
      >
        {popularCreators.map((creator) => (
          <div className={styles.creatorCard} key={creator.tlink}>
            <Link href={`/user/${creator.tlink}`}>
              <div className={styles.creatorIconLarge}>
                {creator.icon ? (
                  <Image
                    src={`https://lh3.googleusercontent.com/d/${creator.icon.slice(33)}`}
                    alt={`${creator.creator}のアイコン`}
                    width={80}
                    height={80}
                    className={styles.creatorAvatar}
                  />
                ) : (
                  <div className={styles.placeholderIcon}></div>
                )}
              </div>
              <div className={styles.creatorDetails}>
                <h3 className={styles.creatorTitle}>{creator.creator}</h3>
              </div>
            </Link>
          </div>
        ))}
      </ScrollSection>
      <ScrollSection
        title="最新の作品"
        viewMoreLink={
          <Link href="/list" className={styles.viewMoreLink}>
            もっと見る <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        }
      >
        {latestVideos.map((video) => (
          <div className={styles.videoCard} key={video.ylink}>
            <Link href={`/${video.ylink.slice(17, 28)}`}>
              <div className={styles.thumbnailContainer}>
                <img
                  src={video.smallThumbnail}
                  alt={`${video.title} - ${video.creator}`}
                  className={styles.thumbnail}
                  loading="lazy"
                />
              </div>
              <div className={styles.videoInfo}>
                <h3 className={styles.videoTitle}>{video.title}</h3>
                <div className={styles.creatorInfo}>
                  {video.icon ? (
                    <Image
                      src={`https://lh3.googleusercontent.com/d/${video.icon.slice(33)}`}
                      alt={`${video.creator}のアイコン`}
                      width={24}
                      height={24}
                      className={styles.creatorIcon}
                    />
                  ) : null}
                  <span className={styles.creatorName}>{video.creator}</span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </ScrollSection>
      {/* ④イベント */}
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2>イベント</h2>
          <Link href="/event" className={styles.viewMoreLink}>
            もっと見る <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
        <div className={styles.eventsGrid}>
          {recentEvents.length > 0 ? (
            recentEvents.map((event) => (
              <div className={styles.eventSection} key={event.eventid}>
                <div className={styles.eventHeader}>
                  <Link href={`/event/${event.eventid}`} className={styles.eventTitleLink}>
                    {event.icon && (
                      <Image
                        src={`https://lh3.googleusercontent.com/d/${event.icon.slice(33)}`}
                        alt={`${event.eventname}のアイコン`}
                        width={40}
                        height={40}
                        className={styles.eventIcon}
                      />
                    )}
                    <h3 className={styles.eventTitle}>{event.eventname || event.eventid}</h3>
                  </Link>
                </div>
                <div className={styles.eventVideosGrid}>
                  {event.videos && event.videos.length > 0 ? (
                    event.videos.map((video) => (
                      <div className={styles.eventVideoCard} key={video.ylink}>
                        <Link href={`/${video.ylink.slice(17, 28)}`}>
                          <div className={styles.eventThumbnailContainer}>
                            <img
                              src={video.smallThumbnail}
                              alt={`${video.title} - ${video.creator}`}
                              className={styles.eventThumbnail}
                              loading="lazy"
                            />
                          </div>
                          <div className={styles.eventVideoInfo}>
                            <h4 className={styles.eventVideoTitle}>{video.title}</h4>
                            <p className={styles.eventVideoCreator}>{video.creator}</p>
                          </div>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p>このイベントには作品がありません</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>イベント情報を読み込み中...</p>
          )}
        </div>
      </section>

      {/* ⑤最新の作品 */}


      <Footer />
    </div>
  );
}

// データ取得
export const getStaticProps = async () => {
  try {
    // 並列でデータを取得
    const [videosRes, usersRes, eventsRes] = await Promise.all([
      fetch('https://pvsf-cash.vercel.app/api/videos', {
        headers: { 
          'Cache-Control': 'public, max-age=3600',
          'User-Agent': 'Mozilla/5.0 (compatible; PVSF-Archive/1.0)'
        }
      }),
      fetch('https://pvsf-cash.vercel.app/api/users', {
        headers: { 
          'Cache-Control': 'public, max-age=3600',
          'User-Agent': 'Mozilla/5.0 (compatible; PVSF-Archive/1.0)'
        }
      }),
      fetch('https://script.google.com/macros/s/AKfycbybjT6iEZWbfCIzTvU1ALVxp1sa_zS_pGJh5_p_SBsJgLtmzcmqsIDRtFkJ9B8Yko6tyA/exec', {
        headers: { 
          'Cache-Control': 'public, max-age=3600',
          'User-Agent': 'Mozilla/5.0 (compatible; PVSF-Archive/1.0)'
        }
      })
    ]);

    // データの取得と変換（エラーハンドリング付き）
    let videos = [];
    let users = [];
    let events = [];

    if (videosRes.ok) {
      try {
        videos = await videosRes.json();
      } catch (error) {
        console.error('Error parsing videos JSON:', error);
      }
    } else {
      console.error('Failed to fetch videos:', videosRes.status, videosRes.statusText);
    }

    if (usersRes.ok) {
      try {
        users = await usersRes.json();
      } catch (error) {
        console.error('Error parsing users JSON:', error);
      }
    } else {
      console.error('Failed to fetch users:', usersRes.status, usersRes.statusText);
    }

    if (eventsRes.ok) {
      try {
        events = await eventsRes.json();
      } catch (error) {
        console.error('Error parsing events JSON:', error);
      }
    } else {
      console.error('Failed to fetch events:', eventsRes.status, eventsRes.statusText);
    }

    console.log(`Fetched ${videos.length} videos, ${users.length} users, and ${events.length} events`);

    return {
      props: {
        videos: videos || [],
        users: users || [],
        events: events || []
      },
      // 1時間ごとに再生成
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        videos: [],
        users: [],
        events: []
      },
      // エラー時は5分後に再試行
      revalidate: 300,
    };
  }
};

// ヘルパー関数を改善
function getCreatorInfo(tlink, videos, users) {
  // tlinkが一致する作品をフィルタリング
  const matchedWorksByTlink = videos.filter(
    work => work.tlink?.toLowerCase() === tlink.toLowerCase()
  );

  // アイコンの取得
  let icon = "";
  if (matchedWorksByTlink.length > 0) {
    const personalWorks = matchedWorksByTlink.filter(work => work.type === "個人");
    const firstWork = personalWorks.length > 0 ? personalWorks[0] : matchedWorksByTlink[0];
    icon = firstWork.icon || "";
  }

  // クリエイター名の取得
  let creator = null;
  if (matchedWorksByTlink.length > 0) {
    const personalWorks = matchedWorksByTlink.filter(work => work.type === "個人");
    const firstWork = personalWorks.length > 0 ? personalWorks[0] : matchedWorksByTlink[0];
    if (firstWork.type === "個人") {
      creator = firstWork.creator;
    }
  }

  // creatorが未設定の場合、memberidとmemberから探す
  if (!creator) {
    for (const work of videos) {
      if (work.memberid) {
        const memberIds = work.memberid.split(",");
        const memberNames = work.member.split(",");

        const matchedMemberIndex = memberIds.findIndex(
          memberId => memberId.trim().toLowerCase() === tlink.toLowerCase()
        );

        if (matchedMemberIndex !== -1) {
          creator = memberNames[matchedMemberIndex].trim();
          break;
        }
      }
    }
  }

  // それでもcreatorが見つからない場合はtlinkを使用
  if (!creator) {
    creator = tlink;
  }

  // 作品数のカウント（個人作品と合作参加を含む）
  const totalWorks = videos.filter(work =>
    (work.tlink?.toLowerCase() === tlink.toLowerCase()) ||
    (work.memberid && work.memberid.toLowerCase().includes(tlink.toLowerCase()))
  ).length;

  return {
    tlink,
    icon,
    creator,
    totalWorks
  };
}

function shuffleArray(array) {
  return [...array].sort(() => 0.5 - Math.random());
}