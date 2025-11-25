// Google Analytics Data API テストスクリプト
require('dotenv').config({ path: '.env.local' });

async function testAnalytics() {
    console.log('🔍 Google Analytics Data API テスト開始...\n');

    // 環境変数の確認
    console.log('📋 環境変数チェック:');
    console.log(`GA_PROPERTY_ID: ${process.env.GA_PROPERTY_ID ? '✅ 設定済み' : '❌ 未設定'}`);
    console.log(`GA_PROJECT_ID: ${process.env.GA_PROJECT_ID ? '✅ 設定済み' : '❌ 未設定'}`);
    console.log(`GA_CLIENT_EMAIL: ${process.env.GA_CLIENT_EMAIL ? '✅ 設定済み' : '❌ 未設定'}`);
    console.log(`GA_PRIVATE_KEY: ${process.env.GA_PRIVATE_KEY ? '✅ 設定済み' : '❌ 未設定'}\n`);

    if (!process.env.GA_PROPERTY_ID) {
        console.log('❌ 環境変数が設定されていません。.env.local ファイルを確認してください。');
        return;
    }

  try {
    console.log('📊 トレンドデータを取得中...');
    const { getTrendingVideosData } = await import('../libs/analytics.js');
    const trendingData = await getTrendingVideosData();

        if (trendingData && trendingData.length > 0) {
            console.log(`✅ 成功！ ${trendingData.length} 件のトレンドデータを取得しました。\n`);

            console.log('📈 取得したデータの例:');
            trendingData.slice(0, 5).forEach((item, index) => {
                console.log(`${index + 1}. 動画ID: ${item.videoId}`);
                console.log(`   ページビュー: ${item.pageViews}`);
                console.log(`   セッション: ${item.sessions}`);
                console.log(`   平均滞在時間: ${item.avgDuration.toFixed(2)}秒\n`);
            });
        } else {
            console.log('⚠️  データは取得できましたが、トレンド情報がありませんでした。');
            console.log('   - GA4にデータが蓄積されるまで24-48時間かかる場合があります');
            console.log('   - 動画ページへのアクセスがあるか確認してください');
        }

    } catch (error) {
        console.log('❌ エラーが発生しました:');
        console.log(`   ${error.message}\n`);

        if (error.message.includes('permission')) {
            console.log('🔧 解決方法:');
            console.log('   1. サービスアカウントのメールアドレスをGAプロパティに追加');
            console.log('   2. 権限を「表示者」以上に設定');
            console.log('   3. プロパティIDが正しいか確認');
        } else if (error.message.includes('credentials')) {
            console.log('🔧 解決方法:');
            console.log('   1. .env.local の認証情報を確認');
            console.log('   2. JSONファイルの内容が正しくコピーされているか確認');
            console.log('   3. private_keyの改行が\\nで置換されているか確認');
        }
    }
}

testAnalytics().catch(console.error);
