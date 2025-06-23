import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const otp = searchParams.get("otp");

  if (!email || !otp) {
    return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
  }

  try {
    const res = await prisma.user.findUnique({
      where: { email },
  });
    if (!res) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (res.otpSecret === otp) {
      // Clear the OTP after successful verification
      await prisma.user.update({
        where: { email },
        data: { otpSecret: null }, // Clear the OTP
      });
      
      return NextResponse.json({ message: "OTP verified successfully" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
