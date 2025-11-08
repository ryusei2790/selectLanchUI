/**
 * Script to import dishes from dishes.json into Firestore
 * Run with: npx tsx scripts/import-dishes.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
if (!getApps().length) {
  // For local development, you need to set GOOGLE_APPLICATION_CREDENTIALS
  // or provide service account key
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

interface DishesData {
  [region: string]: {
    [country: string]: string[];
  };
}

// Categorization logic based on dish characteristics
// This is a simple heuristic - you may need to adjust based on your needs
const categorizeDish = (dishName: string): string => {
  const name = dishName.toLowerCase();

  // Desserts
  if (
    name.includes('ケーキ') ||
    name.includes('ティラミス') ||
    name.includes('チュロス') ||
    name.includes('バクラヴァ') ||
    name.includes('ラミントン') ||
    name.includes('クレープ') &&
    name.includes('デザート')
  ) {
    return 'dessert';
  }

  // Main foods (rice, noodles, bread-based)
  if (
    name.includes('ご飯') ||
    name.includes('ライス') ||
    name.includes('うどん') ||
    name.includes('そば') ||
    name.includes('パスタ') ||
    name.includes('フォー') ||
    name.includes('ナシレマ') ||
    name.includes('ナシゴレン') ||
    name.includes('チャーハン') ||
    name.includes('パエリア') ||
    name.includes('ピザ') ||
    name.includes('ナン') ||
    name.includes('インジェラ') ||
    name.includes('ジョロフライス') ||
    name.includes('プーティン')
  ) {
    return 'main_food';
  }

  // Side dishes
  if (
    name.includes('サラダ') ||
    name.includes('キムチ') ||
    name.includes('ソムタム') ||
    name.includes('サモサ') ||
    name.includes('餃子') ||
    name.includes('春巻') ||
    name.includes('チヂミ') ||
    name.includes('プレッツェル') ||
    name.includes('ザワークラウト') ||
    name.includes('ナチョス') ||
    name.includes('グァカモレ') ||
    name.includes('フムス') ||
    name.includes('ババガヌーシュ') ||
    name.includes('タブーリ') ||
    name.includes('ピロシキ')
  ) {
    return 'side_dish';
  }

  // Default to main dish
  return 'main_dish';
};

async function importDishes() {
  try {
    // Read dishes.json from parent directory
    const dishesPath = path.join(__dirname, '../../dishes.json');
    const dishesData: DishesData = JSON.parse(fs.readFileSync(dishesPath, 'utf-8'));

    let totalCount = 0;
    let successCount = 0;

    console.log('Starting dish import...\n');

    // System user for initial data
    const systemAuthorId = 'system';
    const systemAuthorName = 'SelectLanch';

    // Process each region
    for (const [region, countries] of Object.entries(dishesData)) {
      console.log(`Processing region: ${region}`);

      // Process each country
      for (const [country, dishes] of Object.entries(countries)) {
        console.log(`  Processing country: ${country} (${dishes.length} dishes)`);

        // Process each dish
        for (const dishName of dishes) {
          totalCount++;

          try {
            const category = categorizeDish(dishName);

            const dishData = {
              name: dishName,
              country,
              region,
              category,
              description: '',
              imageUrl: '',
              authorId: systemAuthorId,
              authorName: systemAuthorName,
              likesCount: 0,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            };

            await db.collection('dishes').add(dishData);
            successCount++;

            if (successCount % 50 === 0) {
              console.log(`    Imported ${successCount}/${totalCount} dishes...`);
            }
          } catch (error) {
            console.error(`    Error importing dish "${dishName}":`, error);
          }
        }
      }
    }

    console.log('\n=== Import Complete ===');
    console.log(`Total dishes processed: ${totalCount}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Failed: ${totalCount - successCount}`);

  } catch (error) {
    console.error('Error during import:', error);
    throw error;
  }
}

// Run the import
importDishes()
  .then(() => {
    console.log('\nImport script finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nImport script failed:', error);
    process.exit(1);
  });
