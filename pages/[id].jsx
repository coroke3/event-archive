import Link from "next/link";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles/work.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons";

export default function WorkId({ work, previousWorks, nextWorks }) {
  const showComment = work.comment !== undefined && work.comment !== "";
  const showIcon = work.icon !== undefined && work.icon !== "";
  const showCreator = work.creator !== undefined && work.creator !== "";
  const showTwitter = work.tlink !== undefined && work.tlink !== "";
  const showYoutube = work.ylink !== undefined && work.ylink !== "";
  const showMenber = work.member !== undefined && work.member !== "";
  const showMusic = work.music !== undefined && work.music !== "" && work.credit !== undefined && work.credit !== "";
  const originalDate = new Date(work.time);
  const modifiedDate = new Date(originalDate.getTime() - 9 * 60 * 60 * 1000);
  const formattedDate = modifiedDate.toLocaleString();
  const showTime = work.time !== undefined && work.time !== "";

  // サムネイルが存在しない場合のエラーハンドリング
  const getThumbnailUrl = (ylink) => {
    if (!ylink) {
      return "/error-thumbnail.jpg"; // デフォルトのエラー画像
    }
    return `https://i.ytimg.com/vi/${ylink.slice(17, 28)}/maxresdefault.jpg`; // YouTube URLからサムネイル取得
  };

  return (
    <div>
      <Head>
        <title>{work.title} - {work.creator} - オンライン映像イベント / PVSF archive</title>
        <meta name="description" content={`PVSFへの出展作品です。  ${work.title} - ${work.creator}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@pvscreeningfes" />
        <meta name="twitter:creator" content="@coroke3" />
        <meta property="og:url" content="pvsf.jp" />
        <meta property="og:title" content={`${work.title} - ${work.creator} / PVSF archive`} />
        <meta property="og:description" content={`PVSF 出展作品  ${work.title} - ${work.creator}  music:${work.music} - ${work.credit}`} />
        <meta property="og:image" content={getThumbnailUrl(work.ylink)} />
      </Head>
      <Header />
      <div className={styles.contentr}>
        <div className={styles.bf}>
          <div className={styles.s1f}>
            <iframe
              src={`https://www.youtube.com/embed/${work.ylink.slice(17, 28)}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className={styles.yf}
            ></iframe>
            <h1 className={styles.title}>{work.title}</h1>
            <div className={styles.userinfo}>
              {showIcon && (
                <img
                  src={`https://lh3.googleusercontent.com/d/${work.icon.slice(33)}`}
                  className={styles.icon}
                  alt={`${work.creator} アイコン`}
                />
              )}
              {showCreator && (
                <h3 className={styles.creator}>
                  {work.creator}
                  {showYoutube && (
                    <a href={`${work.ylink}`} target="_blank" rel="noopener noreferrer">
                      <FontAwesomeIcon icon={faYoutube} />
                    </a>
                  )}
                  {showTwitter && (
                    <a href={`https://twitter.com/${work.tlink}`} target="_blank" rel="noopener noreferrer">
                      <FontAwesomeIcon icon={faXTwitter} />
                    </a>
                  )}
                </h3>
              )}
              {showTime && <p className={styles.time}>{formattedDate}</p>}
            </div>
            {showMusic && (
              <p>
                <div dangerouslySetInnerHTML={{ __html: `楽曲:${work.music} - ${work.credit}<br>` }} />
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
              {previousWorks.map((prevWork) => (
                <div className={styles.ss1} key={prevWork.ylink.slice(17, 28)}>
                  <div className={styles.ss12}>
                    <Link href={`/${prevWork.ylink.slice(17, 28)}`}>
                      <img
                        src={getThumbnailUrl(prevWork.ylink)}
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
                        src={getThumbnailUrl(nextWork.ylink)}
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

  const paths = data.map((content) => `/${content.ylink.slice(17, 28)}`);

  return { paths, fallback: false };
}

export async function getStaticProps(context) {
  const id = context.params.id;

  let allWork;
  try {
    const res = await fetch(
      "https://script.google.com/macros/s/AKfycbyEph6zXb1IWFRLpTRLNLtxU4Kj7oe10bt2ifiyK09a6nM13PASsaBYFe9YpDj9OEkKTw/exec"
    );
    allWork = await res.json();
  } catch (error) {
    console.error("Failed to fetch data from API:", error);
    allWork = []; // フォールバックとして空の配列を設定
  }

  const currentIndex = allWork.findIndex((content) => content.ylink.slice(17, 28).toString() === id);
  const previousWorks = allWork.slice(Math.max(currentIndex - 5, 0), currentIndex);
  const nextWorks = allWork.slice(currentIndex + 1, currentIndex + 6);

  return {
    props: {
      work: allWork.find((content) => content.ylink.slice(17, 28) === id) || {}, // フォールバックで空オブジェクト
      previousWorks,
      nextWorks,
    },
  };
}
