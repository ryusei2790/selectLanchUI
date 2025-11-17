import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { generalRateLimiter } from '@/lib/rateLimiter';

// Initialize Firebase Admin (if not already initialized)
if (!getApps().length) {
  // Use service account credentials if available, otherwise use project ID only
  // For production: Set GOOGLE_APPLICATION_CREDENTIALS environment variable
  // For local: Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable with JSON
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    // Fallback: Use Application Default Credentials (works in Google Cloud environments)
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
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

    // Apply rate limiting (60 requests per minute per user)
    if (!generalRateLimiter.isAllowed(decodedToken.uid)) {
      const timeUntilReset = generalRateLimiter.getTimeUntilReset(decodedToken.uid);
      const seconds = Math.ceil(timeUntilReset / 1000);
      return NextResponse.json(
        {
          error: `レート制限に達しました。${seconds}秒後に再度お試しください。`,
          retryAfter: seconds
        },
        { status: 429 }
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
      let errorMessage = 'Failed to generate recipe from AI service';
      try {
        // Try to parse JSON error response first
        const errorData = await difyResponse.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // Fallback to text if not JSON
        try {
          const errorText = await difyResponse.text();
          if (errorText) {
            errorMessage = errorText.substring(0, 200); // Limit error message length
          }
        } catch {
          // Use default error message
        }
      }
      console.error('Dify API error:', errorMessage);
      return NextResponse.json(
        { error: errorMessage },
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
