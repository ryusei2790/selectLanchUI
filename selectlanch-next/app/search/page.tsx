'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import DishCard from '@/components/DishCard';
import { searchDishes } from '@/lib/firestore';
import { Dish, DishCategory, DISH_CATEGORIES } from '@/types';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DishCategory | 'all'>('all');
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm);
      } else {
        setDishes([]);
        setFilteredDishes([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter by category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredDishes(dishes);
    } else {
      setFilteredDishes(dishes.filter((dish) => dish.category === selectedCategory));
    }
  }, [selectedCategory, dishes]);

  const performSearch = async (term: string) => {
    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      // Optimized search with 100 results limit
      const results = await searchDishes(term, 100);
      setDishes(results);
    } catch (err) {
      console.error('Error searching dishes:', err);
      const errorMessage = err instanceof Error ? err.message : '検索に失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const categories: Array<{ value: DishCategory | 'all'; label: string }> = [
    { value: 'all', label: 'すべて' },
    ...Object.entries(DISH_CATEGORIES).map(([key, label]) => ({
      value: key as DishCategory,
      label,
    })),
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">料理を検索</h1>
            <p className="text-gray-600">料理名、国名、地域で検索できます</p>
          </motion.div>

          {/* Search Box */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="例: カレー、日本、パスタ..."
                className="w-full px-6 py-4 pr-12 text-lg border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition shadow-md"
              />
              <svg
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          {hasSearched && dishes.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">カテゴリーで絞り込み</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      selectedCategory === category.value
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">検索中...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Empty State - No Search */}
          {!loading && !error && !hasSearched && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                料理を検索しよう
              </h3>
              <p className="text-gray-600">
                検索ボックスに料理名、国名、地域を入力してください
              </p>
            </div>
          )}

          {/* Empty State - No Results */}
          {!loading && !error && hasSearched && filteredDishes.length === 0 && dishes.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">😢</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                このカテゴリーには料理がありません
              </h3>
              <p className="text-gray-600">
                別のカテゴリーを選択してください
              </p>
            </div>
          )}

          {/* Empty State - No Results at all */}
          {!loading && !error && hasSearched && dishes.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">😢</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                検索結果が見つかりませんでした
              </h3>
              <p className="text-gray-600 mb-6">
                別のキーワードで検索してみてください
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && !error && filteredDishes.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 text-center"
              >
                <p className="text-gray-600">
                  {filteredDishes.length}件の料理が見つかりました
                </p>
                {dishes.length >= 100 && (
                  <p className="text-sm text-orange-600 mt-2">
                    ※ 検索結果は最大100件までです。より具体的なキーワードで検索すると、目的の料理が見つかりやすくなります。
                  </p>
                )}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredDishes.map((dish, index) => (
                  <motion.div
                    key={dish.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <DishCard dish={dish} showLikeButton={true} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
