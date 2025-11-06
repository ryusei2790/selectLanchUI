'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface RecipeData {
  country: string;
  mainFood: string;
  dish: string;
  recipe: string;
}

export default function ResultPage() {
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);

  useEffect(() => {
    const data = localStorage.getItem('aiRecipe');
    if (data) {
      setRecipeData(JSON.parse(data));
    }
  }, []);

  if (!recipeData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              レシピが見つかりません
            </h1>
            <Link
              href="/"
              className="text-orange-500 hover:text-orange-600 font-semibold"
            >
              ← ホームに戻る
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Selection Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              選択された組み合わせ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">国・ジャンル</div>
                <div className="text-xl font-bold text-orange-500">
                  {recipeData.country}
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">主食</div>
                <div className="text-xl font-bold text-yellow-600">
                  {recipeData.mainFood}
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">主菜</div>
                <div className="text-xl font-bold text-red-500">
                  {recipeData.dish}
                </div>
              </div>
            </div>
          </div>

          {/* AI Recipe */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">🤖</span>
              <h1 className="text-3xl font-bold text-gray-800">
                AIのレシピ提案
              </h1>
            </div>

            <div className="prose prose-lg max-w-none">
              <div
                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                style={{ fontFamily: 'inherit' }}
              >
                {recipeData.recipe}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition text-center"
            >
              もう一度ルーレットを回す
            </Link>
            <button
              onClick={() => window.print()}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              レシピを印刷
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
