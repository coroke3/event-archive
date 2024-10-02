// pages/work/[id].jsx
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles/work.module.css";
import { css } from "@emotion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons";

const getVideoThumbnail = async (videoId) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;

  try {
    const videoRes = await fetch(apiUrl, {
      headers: {
        "Cache-Control": "public, max-age=86400", // 1日キャッシュ
      },
    });

    if (!videoRes.ok) {
      console.warn(`YouTube API の取得に失敗しました: ${videoRes.statusText}`);
      return `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`; // デフォルトをsddefaultに変更
    }

    const videoData = await videoRes.json();

    if (videoData.items.length > 0) {
      const thumbnails = videoData.items[0].snippet.thumbnails;
      return (
        thumbnails?.medium?.url ||
        `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`
      ); // mediumを使用
    }

    return `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`; // デフォルトをsddefaultに変更
  } catch (error) {
    console.error(`API 呼び出しエラー: ${error.message}`);
    return `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`; // デフォルトをsddefaultに変更
  }
};

export default function WorkId({
  work,
  previousWorks,
  nextWorks,
  thumbnail,
  previousThumbnails,
  nextThumbnails,
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
          {work.title} - {work.creator} - オンライン映像イベント / PVSF archive
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
        <meta property="og:image" content={thumbnail} />
      </Head>
      <Header />
      <div className={styles.contentr}>
        <div className={styles.bf}>
          <div className={styles.s1f}>
            <iframe
              src={`https://www.youtube.com/embed/${work.ylink.slice(
                17,
                28
              )}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className={styles.yf}
            ></iframe>
            <h1 className={styles.title}>{work.title}</h1>
            <div className={styles.userinfo}>
              {showIcon && work.icon ? (
                <Link href={`../user/${work.tlink}`}>
                  <Image
                    src={`https://lh3.googleusercontent.com/d/${work.icon.slice(
                      33
                    )}`}
                    className="icon"
                    alt={`${work.creator}のアイコン`}
                    width={50}
                    height={50}
                  />{" "}
                </Link>
              ) : (
                <Link href={`../user/${work.tlink}`}>
                  <Image
                    src="https://i.gyazo.com/07a85b996890313b80971d8d2dbf4a4c.jpg"
                    alt={`アイコン`}
                    className="icon"
                    width={50}
                    height={50}
                  />{" "}
                </Link>
              )}
              {showCreator && (
                <h3 className={styles.creator}>
                  <Link href={`../user/${work.tlink}`}>{work.creator} </Link>
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
                <div dangerouslySetInnerHTML={{ __html: `${work.comment}` }} />
              </p>
            )}
            {showMenber && (
              <p>
                <div dangerouslySetInnerHTML={{ __html: `${work.member}` }} />
              </p>
            )}
          </div>
          <div className={styles.s2f}>
            <div className={styles.navLinks}>
              {previousWorks.map((prevWork, index) => (
                <div className={styles.ss1} key={prevWork.ylink.slice(17, 28)}>
                  <div className={styles.ss12}>
                    <Link href={`/${prevWork.ylink.slice(17, 28)}`}>
                      <img
                        src={previousThumbnails[index]}
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
              {nextWorks.map((nextWork, index) => (
                <div className={styles.ss1} key={nextWork.ylink.slice(17, 28)}>
                  <div className={styles.ss12}>
                    <Link href={`/${nextWork.ylink.slice(17, 28)}`}>
                      <img
                        src={nextThumbnails[index]}
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
    </div>
  );
}

export async function getStaticPaths() {
  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbyEph6zXb1IWFRLpTRLNLtxU4Kj7oe10bt2ifiyK09a6nM13PASsaBYFe9YpDj9OEkKTw/exec"
  );
  const data = await res.json();

  const paths = data.map((work) => ({
    params: { id: work.ylink.slice(17, 28) },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbyEph6zXb1IWFRLpTRLNLtxU4Kj7oe10bt2ifiyK09a6nM13PASsaBYFe9YpDj9OEkKTw/exec"
  );
  const data = await res.json();
  const work = data.find((w) => w.ylink.slice(17, 28) === params.id);

  const currentIndex = data.findIndex(
    (w) => w.ylink.slice(17, 28) === params.id
  );

  // 前後5作品を取得
  const previousWorks = data.slice(Math.max(0, currentIndex - 5), currentIndex);
  const nextWorks = data.slice(currentIndex + 1, currentIndex + 6); // 現在の作品の次の5件

  // サムネイルを事前に取得
  const previousThumbnails = await Promise.all(
    previousWorks.map((prevWork) =>
      getVideoThumbnail(prevWork.ylink.slice(17, 28))
    )
  );

  const nextThumbnails = await Promise.all(
    nextWorks.map((nextWork) => getVideoThumbnail(nextWork.ylink.slice(17, 28)))
  );

  // サムネイルを事前に取得
  const thumbnail = await getVideoThumbnail(work.ylink.slice(17, 28));

  return {
    props: {
      work,
      previousWorks,
      nextWorks,
      thumbnail,
      previousThumbnails,
      nextThumbnails,
    },
  };
}
