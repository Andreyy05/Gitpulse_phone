import { NextRequest, NextResponse } from 'next/server';
import { fetchFullGitHubData } from '@/lib/github';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryUser = searchParams.get('username');
    const queryToken = searchParams.get('token');
    const headerToken =
      request.headers.get('x-github-token') ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    const username =
      queryUser?.trim() ||
      process.env.GITHUB_USERNAME?.trim() ||
      'Andreyy05';

    const token =
      queryToken?.trim() ||
      headerToken?.trim() ||
      process.env.GITHUB_TOKEN?.trim() ||
      '';

    if (!username) {
      return NextResponse.json(
        { error: 'GitHub username is required.' },
        { status: 400 }
      );
    }

    const data = await fetchFullGitHubData(username, token);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch GitHub activity';
    console.error('[API /api/github GET Error]:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const username =
      body.username?.trim() ||
      process.env.GITHUB_USERNAME?.trim() ||
      'Andreyy05';

    const token =
      body.token?.trim() ||
      request.headers.get('x-github-token')?.trim() ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')?.trim() ||
      process.env.GITHUB_TOKEN?.trim() ||
      '';

    if (!username) {
      return NextResponse.json(
        { error: 'GitHub username is required.' },
        { status: 400 }
      );
    }

    const data = await fetchFullGitHubData(username, token);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch GitHub activity';
    console.error('[API /api/github POST Error]:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
