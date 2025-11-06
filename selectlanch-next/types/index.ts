import { Timestamp } from 'firebase/firestore';

export type DishCategory = 'main_food' | 'main_dish' | 'side_dish' | 'dessert';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  bio?: string;
  profileImageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Dish {
  id: string;
  name: string;
  nameEn?: string;
  country: string;
  region: string;
  category: DishCategory;
  description?: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  likesCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Like {
  id: string;
  userId: string;
  dishId: string;
  createdAt: Timestamp;
}

export const DISH_CATEGORIES: Record<DishCategory, string> = {
  main_food: '主食',
  main_dish: '主菜',
  side_dish: '副菜',
  dessert: 'デザート',
};

export const REGIONS = [
  'Asia',
  'Europe',
  'North America',
  'South America',
  'Africa',
  'Middle East',
  'Oceania',
  'Others',
] as const;

export type Region = typeof REGIONS[number];
