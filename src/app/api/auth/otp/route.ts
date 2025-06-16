import { NextRequest, NextResponse } from "next/server";
import { sendForgotPasswordEmail } from "@/components/mailler-send/Otp";
import cuid2 from '@paralleldrive/cuid2';
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { email, url } = await request.json();

  if (!email || !url) {
    return NextResponse.json({ error: "Email and URL are required" }, { status: 400 });
  }

  try {
    const token = cuid2.createId(); // Generate a unique token for the reset link
    await sendForgotPasswordEmail(email, url);

    return NextResponse.json({ message: "Forgot password email sent", token });
  } catch (error) {
    console.error("Error sending forgot password email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

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
      return NextResponse.json({ message: "OTP verified successfully" });
    } else {
      throw new Error("Invalid OTP");
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
