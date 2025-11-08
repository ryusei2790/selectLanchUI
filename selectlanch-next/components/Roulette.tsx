'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  getCountriesByRegion,
  getDishesByCountryAndCategory,
} from '@/lib/firestore';
import { generateRecipe } from '@/lib/api';
import { Dish, RouletteSelection, RouletteHistory } from '@/types';

export default function Roulette() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'country' | 'main_food' | 'main_dish' | 'complete'>('country');
  const [selection, setSelection] = useState<RouletteSelection>({
    country: null,
    mainFood: null,
    mainDish: null,
  });

  const [countries, setCountries] = useState<string[]>([]);
  const [mainFoods, setMainFoods] = useState<Dish[]>([]);
  const [mainDishes, setMainDishes] = useState<Dish[]>([]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState<string>('？');
  const [history, setHistory] = useState<RouletteHistory>({
    countries: [],
    mainFoods: [],
    mainDishes: [],
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Load countries on mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Load dishes when country is selected
  useEffect(() => {
    if (selection.country) {
      loadMainFoods(selection.country);
    }
  }, [selection.country]);

  // Load main dishes when main food is selected
  useEffect(() => {
    if (selection.country && selection.mainFood) {
      loadMainDishes(selection.country);
    }
  }, [selection.country, selection.mainFood]);

  const loadCountries = async () => {
    try {
      const countryList = await getCountriesByRegion();
      setCountries(countryList);
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadMainFoods = async (country: string) => {
    try {
      const dishes = await getDishesByCountryAndCategory(country, 'main_food');
      setMainFoods(dishes);
    } catch (error) {
      console.error('Error loading main foods:', error);
    }
  };

  const loadMainDishes = async (country: string) => {
    try {
      const dishes = await getDishesByCountryAndCategory(country, 'main_dish');
      setMainDishes(dishes);
    } catch (error) {
      console.error('Error loading main dishes:', error);
    }
  };

  const getRandomItem = <T,>(items: T[], usedItems: T[]): T | null => {
    if (items.length === 0) return null;

    const availableItems = items.filter((item) => !usedItems.includes(item));
    const pool = availableItems.length === 0 ? items : availableItems;

    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setCurrentDisplay('？');

    let count = 0;
    const spinDuration = 2000; // 2 seconds
    const interval = setInterval(() => {
      if (step === 'country') {
        setCurrentDisplay(countries[Math.floor(Math.random() * countries.length)] || '？');
      } else if (step === 'main_food') {
        setCurrentDisplay(mainFoods[Math.floor(Math.random() * mainFoods.length)]?.name || '？');
      } else if (step === 'main_dish') {
        setCurrentDisplay(mainDishes[Math.floor(Math.random() * mainDishes.length)]?.name || '？');
      }
      count++;

      if (count >= 20) {
        clearInterval(interval);

        // Select final value
        let finalValue: string | null = null;

        if (step === 'country') {
          finalValue = getRandomItem(countries, history.countries);
          if (finalValue) {
            setSelection((prev) => ({ ...prev, country: finalValue }));
            setHistory((prev) => {
              const newCountries =
                prev.countries.length === countries.length
                  ? [finalValue!]
                  : [...prev.countries, finalValue!];
              return { ...prev, countries: newCountries };
            });
            setCurrentDisplay(finalValue);
            setTimeout(() => setStep('main_food'), 500);
          }
        } else if (step === 'main_food') {
          const finalDish = getRandomItem(
            mainFoods,
            mainFoods.filter((d) => history.mainFoods.includes(d.name))
          );
          if (finalDish) {
            finalValue = finalDish.name;
            setSelection((prev) => ({ ...prev, mainFood: finalValue }));
            setHistory((prev) => {
              const newMainFoods =
                prev.mainFoods.length === mainFoods.length
                  ? [finalValue!]
                  : [...prev.mainFoods, finalValue!];
              return { ...prev, mainFoods: newMainFoods };
            });
            setCurrentDisplay(finalValue);
            setTimeout(() => setStep('main_dish'), 500);
          }
        } else if (step === 'main_dish') {
          const finalDish = getRandomItem(
            mainDishes,
            mainDishes.filter((d) => history.mainDishes.includes(d.name))
          );
          if (finalDish) {
            finalValue = finalDish.name;
            setSelection((prev) => ({ ...prev, mainDish: finalValue }));
            setHistory((prev) => {
              const newMainDishes =
                prev.mainDishes.length === mainDishes.length
                  ? [finalValue!]
                  : [...prev.mainDishes, finalValue!];
              return { ...prev, mainDishes: newMainDishes };
            });
            setCurrentDisplay(finalValue);
            setTimeout(() => setStep('complete'), 500);
          }
        }

        setIsSpinning(false);
      }
    }, 100);
  };

  const handleAskAI = async () => {
    if (!user) {
      alert('AIレシピ機能を使用するにはログインが必要です');
      router.push('/login');
      return;
    }

    if (!selection.country || !selection.mainFood || !selection.mainDish) {
      alert('まずルーレットを完了してください');
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateRecipe({
        country: selection.country,
        mainFood: selection.mainFood,
        mainDish: selection.mainDish,
      });

      // Store result and navigate to result page
      sessionStorage.setItem('aiRecipe', JSON.stringify(result));
      router.push('/result');
    } catch (error: any) {
      console.error('AI recipe generation error:', error);
      alert(error.message || 'AIレシピの生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setStep('country');
    setSelection({ country: null, mainFood: null, mainDish: null });
    setCurrentDisplay('？');
    setMainFoods([]);
    setMainDishes([]);
  };

  const getStepLabel = () => {
    switch (step) {
      case 'country':
        return '国・地域を選択';
      case 'main_food':
        return '主食を選択';
      case 'main_dish':
        return '主菜を選択';
      case 'complete':
        return '選択完了！';
      default:
        return '';
    }
  };

  const getStepColor = () => {
    switch (step) {
      case 'country':
        return 'text-orange-500';
      case 'main_food':
        return 'text-yellow-500';
      case 'main_dish':
        return 'text-red-500';
      case 'complete':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div
            className={`flex-1 text-center ${
              step === 'country' || selection.country ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <div className="text-xs font-semibold text-gray-500 mb-2">STEP 1</div>
            <div
              className={`h-2 rounded-full ${
                selection.country ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            ></div>
          </div>

          <div className="w-4"></div>

          <div
            className={`flex-1 text-center ${
              step === 'main_food' || selection.mainFood ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <div className="text-xs font-semibold text-gray-500 mb-2">STEP 2</div>
            <div
              className={`h-2 rounded-full ${
                selection.mainFood ? 'bg-yellow-500' : 'bg-gray-200'
              }`}
            ></div>
          </div>

          <div className="w-4"></div>

          <div
            className={`flex-1 text-center ${
              step === 'main_dish' || selection.mainDish ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <div className="text-xs font-semibold text-gray-500 mb-2">STEP 3</div>
            <div
              className={`h-2 rounded-full ${
                selection.mainDish ? 'bg-red-500' : 'bg-gray-200'
              }`}
            ></div>
          </div>
        </div>
      </div>

      {/* Display Area */}
      <div className="text-center mb-8">
        <div className="text-sm font-semibold text-gray-500 mb-4">{getStepLabel()}</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDisplay}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`text-5xl md:text-6xl font-bold ${getStepColor()} h-24 flex items-center justify-center`}
          >
            {currentDisplay}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Selection Summary */}
      {(selection.country || selection.mainFood || selection.mainDish) && (
        <div className="grid grid-cols-3 gap-4 mb-8 text-center text-sm">
          <div>
            <div className="text-gray-500 mb-1">国・地域</div>
            <div className="font-semibold text-orange-500">
              {selection.country || '-'}
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">主食</div>
            <div className="font-semibold text-yellow-500">
              {selection.mainFood || '-'}
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">主菜</div>
            <div className="font-semibold text-red-500">
              {selection.mainDish || '-'}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {step !== 'complete' ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSpin}
            disabled={isSpinning || countries.length === 0}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isSpinning ? 'ルーレット回転中...' : 'ルーレットを回す'}
          </motion.button>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAskAI}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isGenerating ? 'レシピ生成中...' : '🤖 AIにレシピを聞く'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition duration-200 shadow-lg hover:shadow-xl"
            >
              もう一度回す
            </motion.button>
          </>
        )}
      </div>

      {/* Info Message */}
      {step === 'complete' && !user && (
        <p className="text-center text-sm text-gray-500 mt-4">
          ※ AIレシピ機能を使用するにはログインが必要です
        </p>
      )}
    </div>
  );
}
