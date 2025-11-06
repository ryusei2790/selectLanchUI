'use client';

import Link from 'next/link';
import { Dish, DISH_CATEGORIES } from '@/types';
import LikeButton from './LikeButton';

interface DishCardProps {
  dish: Dish;
  showLikeButton?: boolean;
}

export default function DishCard({ dish, showLikeButton = true }: DishCardProps) {
  const placeholderImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

  return (
    <Link href={`/dishes/${dish.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <img
            src={dish.imageUrl || placeholderImage}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = placeholderImage;
            }}
          />
          {/* Category Badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
            {DISH_CATEGORIES[dish.category]}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-orange-500 transition-colors">
            {dish.name}
          </h3>

          {/* Country & Region */}
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {dish.country}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {dish.region}
            </span>
          </div>

          {/* Description */}
          {dish.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {dish.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {/* Author */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white text-xs font-bold">
                {dish.authorName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs">{dish.authorName}</span>
            </div>

            {/* Like Button */}
            {showLikeButton && (
              <div onClick={(e) => e.preventDefault()}>
                <LikeButton dishId={dish.id} initialLikesCount={dish.likesCount} size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
