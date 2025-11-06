'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function HowToUsePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">使い方ガイド</h1>
            <p className="text-xl text-gray-600">
              selectLanchの使い方をわかりやすく説明します
            </p>
          </div>

          {/* Features */}
          <div className="space-y-8">
            {/* Feature 1: Roulette */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">🎰</div>
                <h2 className="text-3xl font-bold text-gray-800">ランチルーレット</h2>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                今日のランチに迷ったら、ルーレットを回してみましょう！
                国・ジャンル、主食、主菜がランダムで選ばれます。
                同じ組み合わせが連続しないように履歴管理も行っています。
              </p>
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                <p className="font-semibold text-orange-800 mb-2">💡 ポイント</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>「ルーレットを回す」ボタンをクリック</li>
                  <li>結果が表示されたら「AIにレシピを聞く」で詳しいレシピを取得</li>
                  <li>気に入らなければ何度でも回せます</li>
                </ul>
              </div>
            </div>

            {/* Feature 2: Browse Dishes */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">📋</div>
                <h2 className="text-3xl font-bold text-gray-800">料理掲示板</h2>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                みんなが投稿した料理を見ることができます。
                カテゴリー別に絞り込んだり、人気順・新着順で並び替えができます。
              </p>
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="font-semibold text-blue-800 mb-2">📊 カテゴリー</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li><strong>主食</strong>: 白米、パスタ、パンなど</li>
                  <li><strong>主菜</strong>: メインディッシュ、肉料理、魚料理など</li>
                  <li><strong>副菜</strong>: サラダ、スープ、付け合わせなど</li>
                  <li><strong>デザート</strong>: スイーツ、果物など</li>
                </ul>
              </div>
            </div>

            {/* Feature 3: Post Dishes */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">✍️</div>
                <h2 className="text-3xl font-bold text-gray-800">料理の投稿</h2>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                自分のお気に入りの料理を投稿して、みんなとシェアしましょう！
                ログインすれば誰でも投稿できます。
              </p>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <p className="font-semibold text-green-800 mb-2">📝 投稿に必要な情報</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li><strong>料理名</strong>（必須）: 例: カレーライス</li>
                  <li><strong>国名</strong>（必須）: 例: 日本</li>
                  <li><strong>地域</strong>（必須）: Asia, Europe など</li>
                  <li><strong>カテゴリー</strong>（必須）: 主食、主菜、副菜、デザート</li>
                  <li><strong>説明</strong>（任意）: 料理の特徴や思い出など</li>
                  <li><strong>画像URL</strong>（任意）: 料理の写真のURL</li>
                </ul>
              </div>
            </div>

            {/* Feature 4: Like */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">❤️</div>
                <h2 className="text-3xl font-bold text-gray-800">いいね機能</h2>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                気に入った料理にいいねを付けることができます。
                いいねした料理は後からプロフィールページで確認できます。
              </p>
              <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                <p className="font-semibold text-red-800 mb-2">💕 いいねのメリット</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>お気に入りの料理を保存できる</li>
                  <li>人気の料理が一目でわかる</li>
                  <li>投稿者を励ますことができる</li>
                </ul>
              </div>
            </div>

            {/* Feature 5: Search */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">🔍</div>
                <h2 className="text-3xl font-bold text-gray-800">検索機能</h2>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                料理名、国名、地域で検索できます。
                リアルタイムで検索結果が表示され、カテゴリーでの絞り込みも可能です。
              </p>
              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                <p className="font-semibold text-purple-800 mb-2">🎯 検索のコツ</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>料理名の一部だけでも検索可能（例: 「カレ」で「カレーライス」がヒット）</li>
                  <li>国名で検索すると、その国の料理が全て表示される</li>
                  <li>検索後にカテゴリーで絞り込むとさらに便利</li>
                </ul>
              </div>
            </div>

            {/* Feature 6: Profile */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">👤</div>
                <h2 className="text-3xl font-bold text-gray-800">プロフィール</h2>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                自分のプロフィールを編集したり、投稿した料理やいいねした料理を確認できます。
              </p>
              <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                <p className="font-semibold text-yellow-800 mb-2">⚙️ 編集できる項目</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>表示名</li>
                  <li>自己紹介</li>
                  <li>プロフィール画像URL</li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">よくある質問</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Q. アカウント登録は必要ですか？</h3>
                <p className="text-gray-700">
                  A. 料理の閲覧や検索は誰でも利用できます。料理の投稿やいいね機能を使うにはアカウント登録（無料）が必要です。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Q. 画像はアップロードできますか？</h3>
                <p className="text-gray-700">
                  A. 現在は画像URLの入力のみ対応しています。無料の画像ホスティングサービス（Imgur、Cloudinaryなど）を利用してURLを取得してください。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Q. 投稿した料理を編集・削除できますか？</h3>
                <p className="text-gray-700">
                  A. はい、自分が投稿した料理は編集・削除が可能です（現在実装中）。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Q. AIレシピ機能とは何ですか？</h3>
                <p className="text-gray-700">
                  A. ランチルーレットで選ばれた組み合わせをもとに、AIが具体的なレシピを提案してくれる機能です。
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">さあ、始めましょう！</h2>
            <p className="text-lg mb-8">
              美味しい料理との出会いが、ここから始まります
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-block px-8 py-4 bg-white text-orange-500 font-bold rounded-xl hover:bg-gray-100 transition shadow-lg"
              >
                ルーレットを回す
              </Link>
              <Link
                href="/dishes"
                className="inline-block px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition"
              >
                料理を見る
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
