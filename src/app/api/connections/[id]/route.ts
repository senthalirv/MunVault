import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.documentConnection.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, deletedId: params.id });
  } catch (error: any) {
    console.error(`DELETE /api/connections/${params.id} error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
