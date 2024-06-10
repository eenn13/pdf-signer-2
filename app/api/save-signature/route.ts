import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { inputValue } = await req.json();

  // Save the data to your database or perform any other actions
  console.log(`signed with input: ${inputValue}`);

  return NextResponse.json({ message: 'Data saved successfully' });
}
