import { useEffect, useState } from "react";     
import Image from "next/image";     
import Head from "next/head";     
import Header from "../../components/Header";     
import Footer from "../../components/Footer";   
import Link from "next/link"; // Link コンポーネントをインポート
import styles from "../../styles/user.module.css"; 

// ユーザー情報を取得する関数     
const fetchUsersData = async () => {     
  const res = await fetch(     
    "https://script.google.com/macros/s/AKfycbzXvxOyXNXF6dUjsw0vbJxb_mLvWKhvk8l14YEOyBHsGOn25X-T4LnYcvTpvwxrqq5Xvw/exec"     
  );     

  if (!res.ok) {     
    console.error(`Failed to fetch user data: ${res.statusText}`);     
    return []; // エラー時は空の配列を返す     
  }     

  const usersData = await res.json();     
  const uniqueUsers = {};     

  // 重複のないユーザーIDを取得     
  usersData.forEach((user) => {     
    if (!uniqueUsers[user.username]) {     
      uniqueUsers[user.username] = user;     
    }     
  });     

  return Object.values(uniqueUsers); // 重複を除いたユーザーの配列を返す     
};     

// アイコンを取得する関数     
const fetchUserIcons = async () => {     
  const res = await fetch(     
    "https://script.google.com/macros/s/AKfycbyEph6zXb1IWFRLpTRLNLtxU4Kj7oe10bt2ifiyK09a6nM13PASsaBYFe9YpDj9OEkKTw/exec"     
  );     

  if (!res.ok) {     
    console.error(`Failed to fetch user icons: ${res.statusText}`);     
    return [];     
  }     

  return await res.json();     
};     

export default function UserPage({ users = [], icons = [] }) {     
  return (     
    <div>     
      <Head>     
        <title>ユーザー一覧 - PVSF Archive</title>     
        <meta name="description" content="ユーザーの名前とアイコンの一覧です。" />     
      </Head>     
      <Header />     
      <div className="content">     
        <h1>ユーザー一覧</h1>     
        <div className={styles.userlist}>     
          {users.length > 0 ? (     
            users.map((user) => {     
              // ユーザーアイコンを検索     
              const userIcon = icons.find(icon => icon.tlink && icon.tlink.toLowerCase() === user.username.toLowerCase());     
              const creatorName = userIcon ? userIcon.creator : "不明"; // creator名を取得     

              return (     
                <div className={styles.users} key={user.username} >     
                  {userIcon && userIcon.icon ? (     
                    <Image     
                      src={`https://lh3.googleusercontent.com/d/${userIcon.icon.slice(33)}`}    
                      className="icon"     
                      alt={`${user.username}のアイコン`}     
                      width={50}     
                      height={50}     
                    />     
                  ) : (     
                    <Image     
                      src='/default-icon.png' // デフォルトのアイコンを設定     
                      alt={`${user.username}のアイコン`}     
                      width={50}     
                      height={50}     
                    />     
                  )}     
                  <Link href={`/user/${user.username}`} passHref>
                    <p style={{ cursor: "pointer" }}>{user.username}</p>
                  </Link>
                  <p>{creatorName}</p> {/* creator名を表示 */}     
                </div>     
              );     
            })     
          ) : (     
            <p>ユーザーが見つかりませんでした。</p>     
          )}     
        </div>     
      </div>     
      <Footer />     
      <style jsx>{`     
        .user-list {     
          display: flex;     
          flex-direction: column;     
          align-items: flex-start;     
        }     
        .user-item {     
          display: flex;     
          align-items: center;     
          margin: 10px 0;     
        }     
        p {     
          margin-left: 10px;     
        }     
      `}</style>     
    </div>     
  );     
}     

// サーバーサイドでユーザー情報を取得     
export const getServerSideProps = async () => {     
  const users = await fetchUsersData();     
  const icons = await fetchUserIcons();     
  return {     
    props: {     
      users, // 取得したユーザーデータをpropsに渡す     
      icons, // アイコンデータをpropsに渡す     
    },     
  };     
};     
