import { NextResponse } from 'next/server';
import { checkBanglaTextSpelling } from '@/lib/bangla-spellchecker';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Valid Bengali text required' }, { status: 400 });
    }

    // Candidate Government / Sothik Spell Checker API Endpoints
    const endpoints = [
      'https://spell.bangla.gov.bd/api/v1/check',
      'https://spell.bangla.gov.bd/api/check',
      'https://spell.bangla.gov.bd/sothik/api/check',
    ];

    let govData: any = null;

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          body: JSON.stringify({ text }),
          cache: 'no-store',
          signal: AbortSignal.timeout(1500),
        });

        if (res.ok) {
          govData = await res.json();
          break;
        }
      } catch (err) {
        // Continue fallback
      }
    }

    // If Gov API responded with data, return it
    if (govData) {
      return NextResponse.json({ source: 'spell.bangla.gov.bd', data: govData });
    }

    // High Precision Local Hybrid Engine Fallback (Guarantees zero downtime)
    const localResults = checkBanglaTextSpelling(text);
    return NextResponse.json({
      source: 'local_high_precision_engine',
      results: localResults,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Spell check server error' }, { status: 500 });
  }
}
