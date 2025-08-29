import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

// Path to the .env.local file
const envFilePath = path.join(process.cwd(), '.env.local');

/**
 * GET handler to retrieve current PDF generator setting
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return current setting
    return NextResponse.json({ 
      useJsPdf: process.env.USE_JSPDF === 'true' 
    });
  } catch (error) {
    console.error('Error getting PDF generator setting:', error);
    return NextResponse.json({ error: 'Failed to get PDF generator setting' }, { status: 500 });
  }
}

/**
 * POST handler to update PDF generator setting
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { useJsPdf } = await req.json();
    
    // Update environment variable in memory
    process.env.USE_JSPDF = useJsPdf ? 'true' : 'false';
    
    // In development, also update the .env.local file
    // Note: In production, this would be handled differently (e.g., through environment variables in the hosting platform)
    if (process.env.NODE_ENV === 'development') {
      try {
        // Read current .env.local file
        let envContent = '';
        try {
          envContent = await fs.readFile(envFilePath, 'utf-8');
        } catch (err) {
          // File might not exist, create it
          envContent = '';
        }
        
        // Check if USE_JSPDF already exists in the file
        const useJsPdfRegex = /^USE_JSPDF=.*$/m;
        const newValue = `USE_JSPDF="${useJsPdf ? 'true' : 'false'}"`;
        
        if (useJsPdfRegex.test(envContent)) {
          // Replace existing value
          envContent = envContent.replace(useJsPdfRegex, newValue);
        } else {
          // Add new value
          envContent += `\n${newValue}`;
        }
        
        // Write back to file
        await fs.writeFile(envFilePath, envContent);
      } catch (fileError) {
        console.warn('Could not update .env.local file:', fileError);
        // Continue anyway since we've updated the in-memory value
      }
    }
    
    return NextResponse.json({ 
      success: true,
      useJsPdf: process.env.USE_JSPDF === 'true'
    });
  } catch (error) {
    console.error('Error updating PDF generator setting:', error);
    return NextResponse.json({ error: 'Failed to update PDF generator setting' }, { status: 500 });
  }
}