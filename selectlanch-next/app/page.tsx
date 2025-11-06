'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedMainFood, setSelectedMainFood] = useState('');
  const [selectedDish, setSelectedDish] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState<{
    countries: string[];
    mainFoods: string[];
    dishes: string[];
  }>({ countries: [], mainFoods: [], dishes: [] });

  const countries = ['中華', 'イタリアン', '和食', 'アメリカ'];
  const mainFoods = ['白米', '和めん', 'パスタ', 'ぱん'];
  const dishes = ['鶏肉', '牛肉', '豚肉', '魚', '魚介（魚以外）'];

  const getRandomItem = (items: string[], usedItems: string[]) => {
    const availableItems = items.filter((item) => !usedItems.includes(item));
    if (availableItems.length === 0) {
      return items[Math.floor(Math.random() * items.length)];
    }
    return availableItems[Math.floor(Math.random() * availableItems.length)];
  };

  const handleSpin = () => {
    setIsSpinning(true);
    setSelectedCountry('');
    setSelectedMainFood('');
    setSelectedDish('');

    // Simulate spinning animation
    let count = 0;
    const interval = setInterval(() => {
      setSelectedCountry(countries[Math.floor(Math.random() * countries.length)]);
      setSelectedMainFood(mainFoods[Math.floor(Math.random() * mainFoods.length)]);
      setSelectedDish(dishes[Math.floor(Math.random() * dishes.length)]);
      count++;

      if (count >= 20) {
        clearInterval(interval);

        // Select final values
        const finalCountry = getRandomItem(countries, history.countries);
        const finalMainFood = getRandomItem(mainFoods, history.mainFoods);
        const finalDish = getRandomItem(dishes, history.dishes);

        setSelectedCountry(finalCountry);
        setSelectedMainFood(finalMainFood);
        setSelectedDish(finalDish);

        // Update history
        setHistory((prev) => ({
          countries:
            prev.countries.length === countries.length
              ? [finalCountry]
              : [...prev.countries, finalCountry],
          mainFoods:
            prev.mainFoods.length === mainFoods.length
              ? [finalMainFood]
              : [...prev.mainFoods, finalMainFood],
          dishes:
            prev.dishes.length === dishes.length
              ? [finalDish]
              : [...prev.dishes, finalDish],
        }));

        setIsSpinning(false);
      }
    }, 100);
  };

  const handleAskAI = async () => {
    if (!selectedCountry || !selectedMainFood || !selectedDish) {
      alert('まずルーレットを回してください');
      return;
    }

    try {
      const response = await fetch('https://selectlanchserver.onrender.com/send-to-dify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            country: selectedCountry,
            main: selectedMainFood,
            dish: selectedDish,
          },
          user: user?.uid || 'guest',
        }),
      });

      const data = await response.json();

      // Open result in a new page
      localStorage.setItem('aiRecipe', JSON.stringify({
        country: selectedCountry,
        mainFood: selectedMainFood,
        dish: selectedDish,
        recipe: data.answer || data.result,
      }));
      window.open('/result', '_blank');
    } catch (error) {
      console.error('AI request error:', error);
      alert('AIレシピの取得に失敗しました');
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              今日のランチは？
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              ルーレットを回して、今日のランチを決めよう！
            </p>
          </div>
        </section>

        {/* Roulette Section */}
        <section className="px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            {/* Results Display */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-500 mb-2">
                    国・ジャンル
                  </div>
                  <div
                    className={`text-3xl font-bold text-orange-500 h-16 flex items-center justify-center ${
                      isSpinning ? 'animate-pulse' : ''
                    }`}
                  >
                    {selectedCountry || '？'}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-500 mb-2">
                    主食
                  </div>
                  <div
                    className={`text-3xl font-bold text-yellow-500 h-16 flex items-center justify-center ${
                      isSpinning ? 'animate-pulse' : ''
                    }`}
                  >
                    {selectedMainFood || '？'}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-500 mb-2">
                    主菜
                  </div>
                  <div
                    className={`text-3xl font-bold text-red-500 h-16 flex items-center justify-center ${
                      isSpinning ? 'animate-pulse' : ''
                    }`}
                  >
                    {selectedDish || '？'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSpinning ? 'ルーレット回転中...' : 'ルーレットを回す'}
                </button>

                {selectedCountry && (
                  <button
                    onClick={handleAskAI}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition duration-200 shadow-lg hover:shadow-xl"
                  >
                    AIにレシピを聞く
                  </button>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">掲示板</h3>
                <p className="text-gray-600 text-sm">
                  みんなの料理を見たり、自分の料理を投稿しよう
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">検索</h3>
                <p className="text-gray-600 text-sm">
                  料理名や国名で簡単に検索できます
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="text-4xl mb-4">❤️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">いいね</h3>
                <p className="text-gray-600 text-sm">
                  お気に入りの料理にいいねして保存
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
