import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const VALID_PRIORITIES = new Set(['none', 'low', 'medium', 'high']);

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getCorsHeaders(request: NextRequest) {
  const allowedOrigin = process.env.EXTERNAL_TODO_ALLOWED_ORIGIN?.trim();
  const requestOrigin = request.headers.get('origin');

  return {
    'Access-Control-Allow-Origin': allowedOrigin || requestOrigin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function jsonWithCors(
  request: NextRequest,
  body: unknown,
  init?: ResponseInit
) {
  const response = NextResponse.json(body, init);
  const headers = getCorsHeaders(request);

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

function getApiKeyFromRequest(request: NextRequest) {
  const authorization = request.headers.get('authorization');

  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice(7).trim();
  }

  return request.headers.get('x-api-key')?.trim() || null;
}

function normalizeDate(date: unknown) {
  if (date === undefined || date === null || date === '') {
    return null;
  }

  if (typeof date !== 'string') {
    return { error: 'date は YYYY-MM-DD 文字列または null を指定してください' };
  }

  const normalized = date.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return { error: 'date は YYYY-MM-DD 形式で指定してください' };
  }

  return normalized;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function POST(request: NextRequest) {
  const configuredApiKey = process.env.EXTERNAL_TODO_API_KEY?.trim();
  const supabase = getSupabase();

  if (!configuredApiKey) {
    return jsonWithCors(
      request,
      { error: 'EXTERNAL_TODO_API_KEY が未設定です' },
      { status: 503 }
    );
  }

  const providedApiKey = getApiKeyFromRequest(request);
  if (!providedApiKey || providedApiKey !== configuredApiKey) {
    return jsonWithCors(
      request,
      { error: '認証に失敗しました' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const priority = body.priority ?? 'none';
    const normalizedDate = normalizeDate(body.date);

    if (!text) {
      return jsonWithCors(
        request,
        { error: 'text は必須です' },
        { status: 400 }
      );
    }

    if (typeof normalizedDate === 'object' && normalizedDate && 'error' in normalizedDate) {
      return jsonWithCors(
        request,
        { error: normalizedDate.error },
        { status: 400 }
      );
    }

    if (typeof priority !== 'string' || !VALID_PRIORITIES.has(priority)) {
      return jsonWithCors(
        request,
        { error: 'priority は none, low, medium, high のいずれかです' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('todos')
      .insert({
        text,
        date: normalizedDate,
        priority,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return jsonWithCors(request, data, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return jsonWithCors(
      request,
      { error: message },
      { status: 500 }
    );
  }
}
