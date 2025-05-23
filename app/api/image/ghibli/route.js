import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }
    
    // Forward the request to our backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/image/ghibli`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to generate Ghibli style image' }, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Ghibli image generation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 