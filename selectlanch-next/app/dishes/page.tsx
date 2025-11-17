'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DishCard from '@/components/DishCard';
import { getDishes } from '@/lib/firestore';
import { Dish, DishCategory, DISH_CATEGORIES } from '@/types';

type SortOption = 'popular' | 'recent';

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DishCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [limit, setLimit] = useState(20); // Start with 20 items
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setLimit(20); // Reset limit when filters change
    setHasMore(true);
    loadDishes(20);
  }, [selectedCategory, sortBy]);

  const loadDishes = async (currentLimit: number = limit) => {
    setLoading(true);
    setError('');

    try {
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const fetchedDishes = await getDishes(category, sortBy, currentLimit);
      setDishes(fetchedDishes);

      // Check if there might be more items
      setHasMore(fetchedDishes.length >= currentLimit);
    } catch (err) {
      console.error('Error loading dishes:', err);
      setError('料理の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    const newLimit = limit + 20;
    setLimit(newLimit);

    try {
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const fetchedDishes = await getDishes(category, sortBy, newLimit);
      setDishes(fetchedDishes);

      // Check if there might be more items
      setHasMore(fetchedDishes.length >= newLimit);
    } catch (err) {
      console.error('Error loading more dishes:', err);
      setError('追加の料理の読み込みに失敗しました');
    } finally {
      setLoadingMore(false);
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
      <main className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">料理掲示板</h1>
            <p className="text-gray-600">みんなの料理を見つけよう</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            {/* Category Tabs */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">カテゴリー</h3>
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

            {/* Sort Options */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-gray-700">並び替え:</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      sortBy === 'popular'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    人気順
                  </button>
                  <button
                    onClick={() => setSortBy('recent')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      sortBy === 'recent'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    新着順
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                {dishes.length}件の料理
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">読み込み中...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadDishes}
                className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
              >
                再読み込み
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && dishes.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                料理がまだありません
              </h3>
              <p className="text-gray-600 mb-6">
                最初の料理を投稿してみましょう！
              </p>
              <a
                href="/dishes/new"
                className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
              >
                料理を投稿する
              </a>
            </div>
          )}

          {/* Dishes Grid */}
          {!loading && !error && dishes.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dishes.map((dish) => (
                  <DishCard key={dish.id} dish={dish} showLikeButton={true} />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        読み込み中...
                      </span>
                    ) : (
                      'もっと見る'
                    )}
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    さらに20件ずつ表示します
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
