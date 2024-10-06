import fs from 'fs';
import path from 'path';

// デフォルトエクスポートのハンドラ関数
export default async function handler(req, res) {
  try {
    const sheetData = await fetchSpreadsheetData(); 
    const updatedData = []; 

    const batchSize = 10; // 一度に処理する動画数
    for (let i = 0; i < sheetData.length; i += batchSize) { 
      const batch = sheetData.slice(i, i + batchSize); 
      const batchResults = await Promise.all(batch.map(async video => { 
        const videoId = extractVideoId(video.ylink); 
        if (!videoId) return { ...video, status: "Invalid video ID", smallThumbnail: "", largeThumbnail: "" }; 

        try { 
          const videoInfo = await fetchYouTubeData(videoId); 
          return { ...video, ...videoInfo }; 
        } catch (error) { 
          console.error(`Error fetching YouTube data for video ID ${videoId}:`, error); 
          return { 
            ...video, 
            status: "private", 
            smallThumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, 
            largeThumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, 
          }; 
        } 
      })); 

      updatedData.push(...batchResults); 
    } 

    res.status(200).json(updatedData); 
  } catch (error) { 
    console.error("エラー:", error); 
    res.status(500).json({ error: "エラー" }); 
  } 
}

// スプレッドシートからデータを取得する関数
async function fetchSpreadsheetData() { 
  const response = await fetch("https://script.google.com/macros/s/AKfycbyEph6zXb1IWFRLpTRLNLtxU4Kj7oe10bt2ifiyK09a6nM13PASsaBYFe9YpDj9OEkKTw/exec"); 
  if (!response.ok) { 
    throw new Error("スプレッドシートデータの取得に失敗しました"); 
  } 
  return await response.json(); 
}

// YouTube APIを使用して公開状況とサムネイルを取得する関数  
async function fetchYouTubeData(videoId) { 
  const cacheFilePath = path.join(process.cwd(), 'cache', `${videoId}.json`); 
  const now = Date.now(); 
  const oneDay = 24 * 60 * 60 * 1000; // 1日のミリ秒 
 
  // キャッシュが存在し、有効期限内の場合はキャッシュを使用 
  if (fs.existsSync(cacheFilePath)) { 
    const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8')); 
    if (now - cacheData.timestamp < oneDay) { 
      return cacheData.data; 
    } 
  } 

  const apiKey = process.env.YOUTUBE_API_KEY; // YouTube APIキーを環境変数から取得  
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,status`;  
 
  const response = await fetch(apiUrl);  
  if (!response.ok) {  
    throw new Error("YouTubeデータ取得に失敗しました");  
  }  
 
  const data = await response.json();  
  if (data.items.length === 0) {  
    const fallbackData = {  
      status: "private",  
      smallThumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,  
      largeThumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,  
    }; 
 
    // キャッシュに保存 
    fs.writeFileSync(cacheFilePath, JSON.stringify({ timestamp: now, data: fallbackData })); 
 
    return fallbackData; 
  }  
 
  const videoData = data.items[0];  
  const isPublic = videoData.status.privacyStatus === "public" ? "public" :  
                   videoData.status.privacyStatus === "private" ? "private" : "unlisted";  
  const smallThumbnail = videoData.snippet.thumbnails?.mqdefault?.url || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;  
  const largeThumbnail = videoData.snippet.thumbnails?.maxres?.url || smallThumbnail;  
 
  const result = {  
    status: isPublic,  
    smallThumbnail: smallThumbnail,  
    largeThumbnail: largeThumbnail  
  }; 
 
  // キャッシュに保存 
  fs.writeFileSync(cacheFilePath, JSON.stringify({ timestamp: now, data: result })); 
 
  return result;  
}

// ylinkから動画IDを抽出する関数 
function extractVideoId(url) { 
  const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/); 
  return match ? match[1] : null; 
}
