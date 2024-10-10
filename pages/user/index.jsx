import Image from "next/image";
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import styles from "../../styles/user.module.css";
import { useState } from "react";

// ユーザー情報を取得する関数
const fetchUsersData = async () => {
  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbzXvxOyXNXF6dUjsw0vbJxb_mLvWKhvk8l14YEOyBHsGOn25X-T4LnYcvTpvwxrqq5Xvw/exec",
    {
      headers: {
        "Cache-Control": "no-cache",
      },
    }
  );

  if (!res.ok) {
    console.error(`Failed to fetch user data: ${res.statusText}`);
    return [];
  }

  const usersData = await res.json();
  const uniqueUsers = {};

  usersData.forEach((user) => {
    if (!uniqueUsers[user.username]) {
      uniqueUsers[user.username] = user;
    }
  });

  return Object.values(uniqueUsers);
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
// 作品データを取得する関数
const fetchWorksData = async () => {
  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbyEph6zXb1IWFRLpTRLNLtxU4Kj7oe10bt2ifiyK09a6nM13PASsaBYFe9YpDj9OEkKTw/exec",
    {
      headers: {
        "Cache-Control": "no-cache",
      },
    }
  );

  if (!res.ok) {
    console.error(`Failed to fetch works data: ${res.statusText}`);
    return [];
  }

  return await res.json();
};


// 最新の作品を取得する関数を修正
const getLatestWorkByTlink = (icons, tlink) => {
  // まず、tlinkと一致し、.typeが"個人"のものを取得
  const filteredIconsPersonal = icons.filter(
    (icon) => icon.tlink?.toLowerCase() === tlink.toLowerCase() && icon.type === "個人"
  );

  // "個人"のものがあればそれを返し、なければ通常の最新作品を返す
  if (filteredIconsPersonal.length > 0) {
    return filteredIconsPersonal[0]; // "個人"の最新の作品
  }

  // "個人"がない場合は従来通り最新の作品を取得
  const filteredIcons = icons.filter(
    (icon) => icon.tlink?.toLowerCase() === tlink.toLowerCase()
  );

  return filteredIcons.length > 0 ? filteredIcons[0] : null;
};


export default function UserPage({ users = [], icons = [] }) {
  const [sortOption, setSortOption] = useState("totalWorks");


// ソート処理で使用している合計作品数を計算
const sortedUsers = [...users].sort((a, b) => { 
  if (sortOption === "name") { 
    const aLatestWork = getLatestWorkByTlink(icons, a.username); 
    const bLatestWork = getLatestWorkByTlink(icons, b.username); 
    const aCreatorName = aLatestWork ? aLatestWork.creator : "不明"; 
    const bCreatorName = bLatestWork ? bLatestWork.creator : "不明"; 
    return aCreatorName.localeCompare(bCreatorName); // creatorNameに基づくソート 
  } 
  if (sortOption === "totalWorks") { 
    a.totalWorks = icons.filter( 
      (icon) => 
        (icon.tlink && 
          icon.tlink.toLowerCase() === a.username.toLowerCase()) || 
        (icon.memberid && 
          icon.memberid.toLowerCase().includes(a.username.toLowerCase())) 
    ).length; 
    b.totalWorks = icons.filter( 
      (icon) => 
        (icon.tlink && 
          icon.tlink.toLowerCase() === b.username.toLowerCase()) || 
        (icon.memberid && 
          icon.memberid.toLowerCase().includes(b.username.toLowerCase())) 
    ).length; 
    return b.totalWorks - a.totalWorks; // 合計作品数の降順 
  } 
  if (sortOption === "latestWork") { 
    const aLatestWork = new Date(a.latestWork); 
    const bLatestWork = new Date(b.latestWork); 
    return bLatestWork - aLatestWork; 
  } 
  return 0; 
}); 

  return (
    <div>
      <Head>
        <title>ユーザー一覧 - PVSF Archive</title>
        <meta
          name="description"
          content="ユーザーの名前とアイコンの一覧です。"
        />
      </Head>
      <div className="content">
        <h1>ユーザー一覧</h1>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="name">名前順</option>
          <option value="totalWorks">合計作品数順</option>
          <option value="latestWork">最新の作品順</option>
        </select>
        <div className={styles.userlist}>
          {sortedUsers.length > 0 ? (
            sortedUsers.map((user) => {
              // tlinkに基づいて最新の作品を取得
              const latestWork = getLatestWorkByTlink(icons, user.username);
              const creatorName = latestWork ? latestWork.creator : "不明";

              const matchingWorksCount1 = icons.filter(
                (icon) =>
                  icon.tlink &&
                  icon.tlink.toLowerCase() === user.username.toLowerCase()
              );

              const matchingWorksCount2 = icons.filter(
                (icon) =>
                  icon.memberid &&
                  icon.memberid
                    .toLowerCase()
                    .includes(user.username.toLowerCase())
              );

              // 重複を削除して合計作品数を算出
              const uniqueWorks = [
                ...matchingWorksCount1,
                ...matchingWorksCount2,
              ].filter(
                (work, index, self) =>
                  index === self.findIndex((w) => w.icon === work.icon)
              );

              const matchingWorksCount3 = uniqueWorks.length;

              return (
                <div className={styles.users} key={user.username}>
                  {latestWork && latestWork.icon ? (
                    <Image
                      src={`https://lh3.googleusercontent.com/d/${latestWork.icon.slice(
                        33
                      )}`}
                      className="icon"
                      alt={`${user.username}のアイコン`}
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
                  <Link href={`/user/${user.username}`} passHref>
                    <h4>{creatorName}</h4>
                    <p className="id">@{user.username}</p>
                    <p>個人作品数: {matchingWorksCount1.length}</p>
                    <p>合作作品数: {matchingWorksCount2.length}</p>
                    <p>合計作品数: {user.totalWorks}</p>
                  </Link>
                </div>
              );
            })
          ) : (
            <p>ユーザーが見つかりませんでした。</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export const getStaticProps = async () => {
  const users = await fetchUsersData();
  const icons = await fetchUserIcons();
  return {
    props: {
      users,
      icons,
    },
    revalidate: 60,
  };
};
