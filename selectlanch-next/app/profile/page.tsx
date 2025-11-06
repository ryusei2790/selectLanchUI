'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import DishCard from '@/components/DishCard';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile, getDishesByAuthor, getUserLikedDishes } from '@/lib/firestore';
import { Dish } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');
  const [myDishes, setMyDishes] = useState<Dish[]>([]);
  const [likedDishes, setLikedDishes] = useState<Dish[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }

    if (user) {
      setDisplayName(user.displayName);
      setBio(user.bio || '');
      setProfileImageUrl(user.profileImageUrl || '');
      loadDishes();
    }
  }, [user, authLoading, router]);

  const loadDishes = async () => {
    if (!user) return;

    setLoadingDishes(true);
    try {
      const [posts, likes] = await Promise.all([
        getDishesByAuthor(user.uid),
        getUserLikedDishes(user.uid),
      ]);
      setMyDishes(posts);
      setLikedDishes(likes);
    } catch (error) {
      console.error('Error loading dishes:', error);
    } finally {
      setLoadingDishes(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError('');

    try {
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        profileImageUrl: profileImageUrl.trim() || undefined,
      });
      setIsEditing(false);
      // Reload page to update auth context
      window.location.reload();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('プロフィールの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  const displayedDishes = activeTab === 'posts' ? myDishes : likedDishes;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white text-5xl font-bold mb-4 overflow-hidden">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-orange-500 hover:text-orange-600 font-semibold"
                  >
                    プロフィールを編集
                  </button>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        表示名
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        自己紹介
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                        placeholder="自己紹介を入力してください"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        プロフィール画像URL
                      </label>
                      <input
                        type="url"
                        value={profileImageUrl}
                        onChange={(e) => setProfileImageUrl(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
                      >
                        {saving ? '保存中...' : '保存'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setDisplayName(user.displayName);
                          setBio(user.bio || '');
                          setProfileImageUrl(user.profileImageUrl || '');
                        }}
                        className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {displayName}
                    </h1>
                    <p className="text-gray-600 mb-4">{user.email}</p>
                    {bio && (
                      <p className="text-gray-700 mb-6 whitespace-pre-wrap">{bio}</p>
                    )}

                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="font-bold text-2xl text-orange-500">
                          {myDishes.length}
                        </span>
                        <span className="text-gray-600 ml-2">投稿</span>
                      </div>
                      <div>
                        <span className="font-bold text-2xl text-red-500">
                          {likedDishes.length}
                        </span>
                        <span className="text-gray-600 ml-2">いいね</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 py-4 font-semibold transition ${
                  activeTab === 'posts'
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                投稿した料理 ({myDishes.length})
              </button>
              <button
                onClick={() => setActiveTab('likes')}
                className={`flex-1 py-4 font-semibold transition ${
                  activeTab === 'likes'
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                いいねした料理 ({likedDishes.length})
              </button>
            </div>
          </div>

          {/* Dishes Grid */}
          {loadingDishes ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">読み込み中...</p>
              </div>
            </div>
          ) : displayedDishes.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">
                {activeTab === 'posts' ? '🍽️' : '❤️'}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {activeTab === 'posts'
                  ? 'まだ投稿がありません'
                  : 'まだいいねした料理がありません'}
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'posts'
                  ? '最初の料理を投稿してみましょう！'
                  : 'お気に入りの料理にいいねしてみましょう！'}
              </p>
              {activeTab === 'posts' && (
                <a
                  href="/dishes/new"
                  className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
                >
                  料理を投稿する
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedDishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} showLikeButton={true} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
