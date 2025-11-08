import { auth } from './firebase';

interface GenerateRecipeParams {
  country: string;
  mainFood: string;
  mainDish: string;
}

interface GenerateRecipeResponse {
  recipe: string;
  userId: string;
  country: string;
  mainFood: string;
  mainDish: string;
}

export async function generateRecipe(
  params: GenerateRecipeParams
): Promise<GenerateRecipeResponse> {
  // Get current user's ID token
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in to generate recipes');
  }

  const token = await user.getIdToken();

  const response = await fetch('/api/generate-recipe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate recipe');
  }

  return response.json();
}
