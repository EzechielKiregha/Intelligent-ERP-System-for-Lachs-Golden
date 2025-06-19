export async function GET() {
  return new Response(
    JSON.stringify({
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    }),
    { status: 200 }
  );
}
