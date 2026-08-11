import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth-user";

export async function GET(request: Request) {
  const auth=await getAuthenticatedUser(request);
  if(!auth)return NextResponse.json({message:"Please sign in."},{status:401});
  const user=await prisma.user.findFirst({where:{OR:[{authId:auth.id},...(auth.email?[{email:auth.email}]:[])]},include:{careers:{where:{active:true},take:1}}});
  if(!user||!user.careers[0])return NextResponse.json({message:"Choose a career path first."},{status:409});
  const url=new URL(request.url);const slug=url.searchParams.get("slug");const careerId=user.careers[0].careerId;
  if(slug){
    const mission=await prisma.mission.findFirst({where:{slug,OR:[{careerId},{assignments:{some:{userId:user.id}}}]},include:{career:{select:{name:true}},requirements:{orderBy:{position:"asc"}}}});
    if(!mission)return NextResponse.json({message:"Mission not found for your career."},{status:404});
    const attempt=await prisma.submission.findFirst({where:{userId:user.id,missionId:mission.id},orderBy:{updatedAt:"desc"},select:{startedAt:true,completedAt:true,status:true}});
    return NextResponse.json({mission,attempt});
  }
  const [missions,completed]=await Promise.all([
    prisma.mission.findMany({where:{careerId},orderBy:[{boss:"asc"},{xpReward:"asc"},{createdAt:"asc"}],include:{career:{select:{name:true}}}}),
    prisma.submission.findMany({where:{userId:user.id,status:"PASSED"},select:{missionId:true},distinct:["missionId"]}),
  ]);
  return NextResponse.json({career:user.careers[0],missions,completedMissionIds:completed.map(item=>item.missionId)});
}
