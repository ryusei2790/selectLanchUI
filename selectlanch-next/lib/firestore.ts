import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Dish, DishCategory, User, Like, AIRecipe } from '@/types';

// User operations
export const getUserProfile = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return { ...userDoc.data(), uid: userDoc.id } as User;
  }
  return null;
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<User>
): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

// Dish operations
export const createDish = async (
  dishData: Omit<Dish, 'id' | 'createdAt' | 'updatedAt' | 'likesCount'>
): Promise<string> => {
  const newDish = {
    ...dishData,
    likesCount: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, 'dishes'), newDish);
  return docRef.id;
};

export const getDish = async (dishId: string): Promise<Dish | null> => {
  const dishDoc = await getDoc(doc(db, 'dishes', dishId));
  if (dishDoc.exists()) {
    return { ...dishDoc.data(), id: dishDoc.id } as Dish;
  }
  return null;
};

export const getDishes = async (
  category?: DishCategory,
  sortBy: 'popular' | 'recent' = 'popular',
  limitCount: number = 50
): Promise<Dish[]> => {
  const constraints: QueryConstraint[] = [];

  if (category) {
    constraints.push(where('category', '==', category));
  }

  if (sortBy === 'popular') {
    constraints.push(orderBy('likesCount', 'desc'));
  } else {
    constraints.push(orderBy('createdAt', 'desc'));
  }

  constraints.push(limit(limitCount));

  const q = query(collection(db, 'dishes'), ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Dish[];
};

export const getDishesByAuthor = async (authorId: string): Promise<Dish[]> => {
  const q = query(
    collection(db, 'dishes'),
    where('authorId', '==', authorId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Dish[];
};

export const searchDishes = async (searchTerm: string, maxResults: number = 100): Promise<Dish[]> => {
  // Note: Firestore doesn't support full-text search natively
  // This optimized implementation limits results to avoid excessive reads
  // For better full-text search, consider using Algolia or similar service

  if (!searchTerm.trim()) {
    // If no search term, return recent dishes with limit
    return getDishes(undefined, 'recent', maxResults);
  }

  // Fetch limited set of dishes for client-side filtering
  // This significantly reduces read operations compared to fetching all dishes
  const q = query(
    collection(db, 'dishes'),
    orderBy('createdAt', 'desc'),
    limit(Math.min(maxResults * 2, 500)) // Fetch 2x limit or max 500 to filter from
  );

  const querySnapshot = await getDocs(q);
  const dishes = querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Dish[];

  const searchLower = searchTerm.toLowerCase();
  const filtered = dishes.filter(
    (dish) =>
      dish.name.toLowerCase().includes(searchLower) ||
      dish.country.toLowerCase().includes(searchLower) ||
      dish.region.toLowerCase().includes(searchLower) ||
      (dish.nameEn && dish.nameEn.toLowerCase().includes(searchLower))
  );

  // Return limited results to avoid overwhelming UI
  return filtered.slice(0, maxResults);
};

export const updateDish = async (
  dishId: string,
  data: Partial<Dish>
): Promise<void> => {
  await updateDoc(doc(db, 'dishes', dishId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteDish = async (dishId: string): Promise<void> => {
  await deleteDoc(doc(db, 'dishes', dishId));
};

// Like operations
export const toggleLike = async (
  userId: string,
  dishId: string
): Promise<boolean> => {
  const likeQuery = query(
    collection(db, 'likes'),
    where('userId', '==', userId),
    where('dishId', '==', dishId)
  );

  const querySnapshot = await getDocs(likeQuery);

  if (querySnapshot.empty) {
    // Add like
    await addDoc(collection(db, 'likes'), {
      userId,
      dishId,
      createdAt: Timestamp.now(),
    });
    // Increment likes count
    await updateDoc(doc(db, 'dishes', dishId), {
      likesCount: increment(1),
    });
    return true;
  } else {
    // Remove like
    await deleteDoc(querySnapshot.docs[0].ref);
    // Decrement likes count
    await updateDoc(doc(db, 'dishes', dishId), {
      likesCount: increment(-1),
    });
    return false;
  }
};

export const checkIfLiked = async (
  userId: string,
  dishId: string
): Promise<boolean> => {
  const likeQuery = query(
    collection(db, 'likes'),
    where('userId', '==', userId),
    where('dishId', '==', dishId)
  );

  const querySnapshot = await getDocs(likeQuery);
  return !querySnapshot.empty;
};

export const getUserLikedDishes = async (userId: string): Promise<Dish[]> => {
  const likeQuery = query(
    collection(db, 'likes'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(likeQuery);
  const dishIds = querySnapshot.docs.map((doc) => doc.data().dishId);

  if (dishIds.length === 0) return [];

  // Fetch dishes in parallel batches (optimized to reduce sequential reads)
  const dishes: Dish[] = [];
  const batchSize = 10; // Process 10 dishes at a time

  for (let i = 0; i < dishIds.length; i += batchSize) {
    const batch = dishIds.slice(i, i + batchSize);
    const batchPromises = batch.map(dishId => getDish(dishId));
    const batchResults = await Promise.all(batchPromises);

    // Filter out null results and add to dishes array
    dishes.push(...batchResults.filter((dish): dish is Dish => dish !== null));
  }

  return dishes;
};

// Roulette operations
export const getCountriesByRegion = async (
  region?: string
): Promise<string[]> => {
  const constraints: QueryConstraint[] = [];

  if (region) {
    constraints.push(where('region', '==', region));
  }

  const q = query(collection(db, 'dishes'), ...constraints);
  const querySnapshot = await getDocs(q);

  const countries = new Set<string>();
  querySnapshot.docs.forEach((doc) => {
    countries.add(doc.data().country);
  });

  return Array.from(countries).sort();
};

export const getDishesByCountryAndCategory = async (
  country: string,
  category: DishCategory
): Promise<Dish[]> => {
  const q = query(
    collection(db, 'dishes'),
    where('country', '==', country),
    where('category', '==', category)
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Dish[];
};

// AI Recipe operations
export const saveAIRecipe = async (
  recipeData: Omit<AIRecipe, 'id' | 'createdAt'>
): Promise<string> => {
  const newRecipe = {
    ...recipeData,
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, 'recipes'), newRecipe);
  return docRef.id;
};

export const getUserRecipes = async (userId: string): Promise<AIRecipe[]> => {
  const q = query(
    collection(db, 'recipes'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as AIRecipe[];
};

export const getRecipe = async (recipeId: string): Promise<AIRecipe | null> => {
  const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
  if (recipeDoc.exists()) {
    return { ...recipeDoc.data(), id: recipeDoc.id } as AIRecipe;
  }
  return null;
};
