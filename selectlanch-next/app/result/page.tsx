'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { saveAIRecipe } from '@/lib/firestore';

interface RecipeData {
  recipe: string;
  userId: string;
  country: string;
  mainFood: string;
  mainDish: string;
}

export default function ResultPage() {
  const { user } = useAuth();
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('aiRecipe');
    if (data) {
      setRecipeData(JSON.parse(data));
    }
  }, []);

  const handleSaveRecipe = async () => {
    if (!recipeData || !user || isSaved) return;

    setIsSaving(true);
    try {
      await saveAIRecipe({
        userId: user.uid,
        country: recipeData.country,
        mainFood: recipeData.mainFood,
        mainDish: recipeData.mainDish,
        recipe: recipeData.recipe,
      });
      setIsSaved(true);
      alert('レシピを保存しました！');
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('レシピの保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  if (!recipeData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              レシピが見つかりません
            </h1>
            <p className="text-gray-600 mb-6">
              ルーレットを回してAIレシピを生成してください
            </p>
            <Link
              href="/"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              ← ホームに戻る
            </Link>
          </motion.div>
        </div>
      </>
    );
  }

  // Simple markdown-to-JSX renderer (basic implementation)
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-bold text-gray-800 mt-6 mb-3">
            {line.substring(4)}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold text-gray-800 mt-8 mb-4">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="text-3xl font-bold text-gray-800 mt-8 mb-4">
            {line.substring(2)}
          </h1>
        );
      }

      // Lists
      if (line.match(/^[\d]+\.\s/)) {
        return (
          <li key={index} className="ml-6 text-gray-700 leading-relaxed">
            {line.replace(/^[\d]+\.\s/, '')}
          </li>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={index} className="ml-6 text-gray-700 leading-relaxed list-disc">
            {line.substring(2)}
          </li>
        );
      }

      // Bold text
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = line.split(boldRegex);
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-3">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} className="font-bold">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }

      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      }

      // Regular paragraphs
      return (
        <p key={index} className="text-gray-700 leading-relaxed mb-3">
          {line}
        </p>
      );
    });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Selection Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              選択された組み合わせ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">国・地域</div>
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
                  {recipeData.mainDish}
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Recipe */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">🤖</span>
              <h1 className="text-3xl font-bold text-gray-800">AIのレシピ提案</h1>
            </div>

            <div className="prose prose-lg max-w-none">
              {renderMarkdown(recipeData.recipe)}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition text-center"
            >
              もう一度ルーレットを回す
            </Link>

            {user && (
              <button
                onClick={handleSaveRecipe}
                disabled={isSaving || isSaved}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaved ? '✓ 保存済み' : isSaving ? '保存中...' : 'レシピを保存'}
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              レシピを印刷
            </button>
          </motion.div>
        </motion.div>
      </main>
    </>
  );
}
