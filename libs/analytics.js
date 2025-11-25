// サーバーサイドでのみインポート
let BetaAnalyticsDataClient;
if (typeof window === 'undefined') {
  BetaAnalyticsDataClient = require('@google-analytics/data').BetaAnalyticsDataClient;
}

// GA4プロパティID
const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID;

// サービスアカウント認証（環境変数から）
const credentials = {
  type: "service_account",
  project_id: process.env.GA_PROJECT_ID,
  private_key_id: process.env.GA_PRIVATE_KEY_ID,
  private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.GA_CLIENT_EMAIL,
  client_id: process.env.GA_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GA_CLIENT_EMAIL}`
};

let analyticsDataClient;

// サーバーサイドでのみ初期化
if (typeof window === 'undefined' && credentials.private_key && BetaAnalyticsDataClient) {
  analyticsDataClient = new BetaAnalyticsDataClient({
    credentials,
    projectId: credentials.project_id,
  });
}

/**
 * 最近7日間のページビューデータを取得
 */
export async function getTrendingVideosData() {
  // クライアントサイドでは空の配列を返す
  if (typeof window !== 'undefined') {
    return [];
  }
  
  if (!analyticsDataClient || !GA_PROPERTY_ID) {
    console.warn('Google Analytics not configured');
    return [];
  }

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: '7daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        {
          name: 'pagePath',
        },
      ],
      metrics: [
        {
          name: 'screenPageViews',
        },
        {
          name: 'sessions',
        },
        {
          name: 'averageSessionDuration',
        },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'PARTIAL_REGEXP',
            value: '^/[A-Za-z0-9_-]{11}$', // YouTube動画IDの形式
          },
        },
      },
      orderBys: [
        {
          metric: {
            metricName: 'screenPageViews',
          },
          desc: true,
        },
      ],
      limit: 30,
    });

    if (!response.rows) {
      return [];
    }

    return response.rows.map(row => ({
      videoId: row.dimensionValues[0].value.substring(1), // /を除いて動画IDを取得
      pageViews: parseInt(row.metricValues[0].value),
      sessions: parseInt(row.metricValues[1].value),
      avgDuration: parseFloat(row.metricValues[2].value),
    }));

  } catch (error) {
    console.error('Error fetching trending videos data:', error);
    return [];
  }
}

/**
 * 前週比でトレンド判定するデータを取得
 */
export async function getGrowthTrendData() {
  // クライアントサイドでは空の配列を返す
  if (typeof window !== 'undefined') {
    return [];
  }
  
  if (!analyticsDataClient || !GA_PROPERTY_ID) {
    console.warn('Google Analytics not configured');
    return [];
  }

  try {
    // 今週のデータ
    const [thisWeekResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: '7daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        {
          name: 'pagePath',
        },
      ],
      metrics: [
        {
          name: 'screenPageViews',
        },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'PARTIAL_REGEXP',
            value: '^/[A-Za-z0-9_-]{11}$',
          },
        },
      },
      limit: 100,
    });

    // 前週のデータ
    const [lastWeekResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: '14daysAgo',
          endDate: '8daysAgo',
        },
      ],
      dimensions: [
        {
          name: 'pagePath',
        },
      ],
      metrics: [
        {
          name: 'screenPageViews',
        },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'PARTIAL_REGEXP',
            value: '^/[A-Za-z0-9_-]{11}$',
          },
        },
      },
      limit: 100,
    });

    // データを結合して成長率を計算
    const thisWeekData = new Map();
    const lastWeekData = new Map();

    thisWeekResponse.rows?.forEach(row => {
      const videoId = row.dimensionValues[0].value.substring(1);
      thisWeekData.set(videoId, parseInt(row.metricValues[0].value));
    });

    lastWeekResponse.rows?.forEach(row => {
      const videoId = row.dimensionValues[0].value.substring(1);
      lastWeekData.set(videoId, parseInt(row.metricValues[0].value));
    });

    const growthData = [];
    
    thisWeekData.forEach((thisWeekViews, videoId) => {
      const lastWeekViews = lastWeekData.get(videoId) || 0;
      
      // 成長率を計算（前週のビューが0の場合は無限大扱い）
      let growthRate = 0;
      if (lastWeekViews === 0 && thisWeekViews > 0) {
        growthRate = Infinity;
      } else if (lastWeekViews > 0) {
        growthRate = ((thisWeekViews - lastWeekViews) / lastWeekViews) * 100;
      }

      // 最低限のビュー数がある作品のみ含める
      if (thisWeekViews >= 10) {
        growthData.push({
          videoId,
          thisWeekViews,
          lastWeekViews,
          growthRate,
        });
      }
    });

    // 成長率でソート
    return growthData
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, 30);

  } catch (error) {
    console.error('Error fetching growth trend data:', error);
    return [];
  }
}

// matchVideosWithAnalytics関数は pages/index.jsx に移動しました
