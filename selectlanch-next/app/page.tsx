'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Roulette from '@/components/Roulette';

export default function Home() {
  const router = useRouter();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-gray-800 mb-6"
            >
              🍽️ SelectLanch
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-4"
            >
              世界の料理で、今日のランチを決めよう！
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-md text-gray-500"
            >
              ルーレットを回して、AIがあなたにぴったりのレシピを提案します
            </motion.p>
          </div>
        </section>

        {/* Roulette Section */}
        <section className="px-4 pb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Roulette />
          </motion.div>
        </section>

        {/* Info Cards */}
        <section className="px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-md p-6 cursor-pointer"
                onClick={() => router.push('/dishes')}
              >
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">掲示板</h3>
                <p className="text-gray-600 text-sm">
                  みんなの料理を見たり、自分の料理を投稿しよう
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-md p-6 cursor-pointer"
                onClick={() => router.push('/search')}
              >
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">検索</h3>
                <p className="text-gray-600 text-sm">
                  料理名や国名で簡単に検索できます
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-md p-6 cursor-pointer"
                onClick={() => router.push('/profile')}
              >
                <div className="text-4xl mb-4">❤️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">いいね</h3>
                <p className="text-gray-600 text-sm">
                  お気に入りの料理にいいねして保存
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
