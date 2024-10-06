// pages/user/[id].jsx

import { useRouter } from "next/router"; 
import Image from "next/image"; 
import Head from "next/head"; 
import Link from "next/link"; 
import Header from "../../components/Header"; 
import Footer from "../../components/Footer"; 
import styles from "../../styles/users.module.css"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; 
import { faXTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons"; 

const fetchUserData = async (username) => {  
  try {
    const res = await fetch(  
      "https://script.google.com/macros/s/AKfycbzXvxOyXNXF6dUjsw0vbJxb_mLvWKhvk8l14YEOyBHsGOn25X-T4LnYcvTpvwxrqq5Xvw/exec",  
      {  
        headers: {  
          "Cache-Control": "no-cache",  
        },  
      }  
    );  

    if (!res.ok) {  
      throw new Error(`Failed to fetch user data: ${res.statusText}`);  
    }  

    const usersData = await res.json();  
    return usersData.find((user) => user.username === username);  
  } catch (error) {
    console.error(error);
    return null; // エラー時にはnullを返す
  }
};  

const fetchWorksData = async () => { 
  try {
    const res = await fetch("https://pvsf-cash.vercel.app/api/videos"); 

    if (!res.ok) { 
      throw new Error(`Failed to fetch works data: ${res.statusText}`); 
    } 

    return await res.json(); 
  } catch (error) {
    console.error(error);
    return []; // エラー時には空の配列を返す
  }
}; 

const fetchCollaborationWorksData = async (worksData, id) => { 
  const collaborationWorks = worksData.filter((work) => { 
    if (work.memberid) { 
      const memberIds = work.memberid.split(","); // カンマで分割 
      return memberIds.some((memberId) => memberId.trim() === id); // id と一致するかチェック 
    } 
    return false; // memberid が存在しない場合は false 
  }); 

  return collaborationWorks; 
}; 

export default function UserWorksPage({ user, works, collaborationWorks }) { 
  const router = useRouter(); 

  const firstWork = works.length > 0 ? works[0] : null; 
  const firstCreator = firstWork ? firstWork.creator : ""; 
  const firstYchlink = firstWork ? firstWork.ychlink : ""; 
  const firstIcon = firstWork ? firstWork.icon : ""; 
  const firstTlink = firstWork ? firstWork.tlink : ""; 

  return ( 
    <div> 
      <Head> 
        <title> 
          {user ? `${user.username}の作品 - PVSF Archive` : "作品一覧"} 
        </title> 
        <meta 
          name="description" 
          content={user ? `${user.username}の作品一覧です。` : "作品一覧です。"} 
        /> 
      </Head> 
      <Header /> 
      <div className="content"> 
        {firstWork && ( 
          <div className={styles.first}> 
            {firstIcon && ( 
              <Image 
                src={`https://lh3.googleusercontent.com/d/${firstIcon.slice( 
                  33 
                )}`} 
                className={styles.uicon} 
                alt={`${firstCreator}のアイコン`} 
                width={150} 
                height={150} 
              /> 
            )} 
            <Image 
              src={firstWork.largeThumbnail} 
              alt={`${firstWork.title} - ${firstCreator} | PVSF archive`} 
              className={styles.uback} 
              width={1280} 
              height={720} 
            /> 
            <div className={styles.textblock}> 
              <h2>{firstCreator}</h2> 
              <a 
                className={styles.username} 
                href={`${firstYchlink}`} 
                target="_blank" 
                rel="noopener noreferrer" 
              > 
                <FontAwesomeIcon icon={faYoutube} /> 
              </a> 
              {firstTlink && ( 
                <a 
                  className={styles.username} 
                  href={`https://twitter.com/${firstTlink}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                > 
                  <FontAwesomeIcon icon={faXTwitter} />@{user.username} 
                </a> 
              )} 
            </div> 
          </div> 
        )} 

        <div className="work"> 
          {Array.isArray(works) && works.length > 0 ? ( 
            works.map((work) => { 
              const showIcon = work.icon !== undefined && work.icon !== ""; 
              const isPrivate = 
                work.status === "private" || work.status === "unknown"; 

              return ( 
                <div 
                  className={`works ${isPrivate ? styles.private : ""}`} 
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
                    {showIcon && work.icon ? ( 
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
                  {isPrivate && <p className={styles.privateMsg}>非公開</p>} 
                </div> 
              ); 
            }) 
          ) : ( 
            <p>このユーザーは作品を持っていません。</p> 
          )} 
        </div> 
        <div className="work"> 
          <h2>参加した合作</h2> 
          {collaborationWorks.length > 0 ? ( 
            collaborationWorks.map((work) => ( 
              <div key={work.ylink} className="works"> 
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
              </div> 
            )) 
          ) : ( 
            <p>作品が見つかりませんでした。</p> 
          )} 
        </div> 
      </div> 
      <Footer /> 
    </div> 
  ); 
} 

export const getStaticPaths = async () => { 
  const worksData = await fetchWorksData(); 
  const usernames = new Set(); 
  const paths = worksData 
    .filter((work) => work.tlink && work.username) 
    .map((work) => { 
      const username = work.username.toLowerCase(); 
      if (!usernames.has(username)) { 
        usernames.add(username); 
        return { params: { id: username } }; 
      } 
      return null; 
    }) 
    .filter(Boolean); 

  return { paths, fallback: "blocking" }; 
}; 

export const getStaticProps = async ({ params }) => { 
  const { id } = params; 
  const username = id.toLowerCase(); 
  const user = await fetchUserData(username); 
  const works = await fetchWorksData(); 
  const collaborationWorks = await fetchCollaborationWorksData(works, id); 

  if (!user) { 
    return { 
      notFound: true, 
    }; 
  } 

  return { 
    props: { user, works, collaborationWorks }, 
    revalidate: 1, // ISRを使う場合
  }; 
}; 
