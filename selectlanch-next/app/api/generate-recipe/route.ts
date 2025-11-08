import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin (if not already initialized)
if (!getApps().length) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

interface GenerateRecipeRequest {
  country: string;
  mainFood: string;
  mainDish: string;
}

interface DifyResponse {
  data: {
    outputs: {
      result: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify the Firebase ID token
    let decodedToken;
    try {
      const auth = getAuth();
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: GenerateRecipeRequest = await request.json();
    const { country, mainFood, mainDish } = body;

    // Validate required fields
    if (!country || !mainFood || !mainDish) {
      return NextResponse.json(
        { error: 'Missing required fields: country, mainFood, mainDish' },
        { status: 400 }
      );
    }

    // Call Dify API
    const difyApiUrl = process.env.DIFY_API_URL || 'https://selectlanchserver.onrender.com/send-to-dify';

    const difyResponse = await fetch(difyApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          country,
          main: mainFood,
          dish: mainDish,
        },
        user: decodedToken.uid,
      }),
    });

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text();
      console.error('Dify API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate recipe from AI service' },
        { status: 500 }
      );
    }

    const difyData: DifyResponse = await difyResponse.json();
    const recipe = difyData.data?.outputs?.result;

    if (!recipe) {
      return NextResponse.json(
        { error: 'No recipe generated' },
        { status: 500 }
      );
    }

    // Return the generated recipe
    return NextResponse.json({
      recipe,
      userId: decodedToken.uid,
      country,
      mainFood,
      mainDish,
    });

  } catch (error) {
    console.error('Error generating recipe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
