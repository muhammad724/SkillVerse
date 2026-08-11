import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mentorInstructions, resolveAiProvider } from "@/lib/ai-mentor";
import { getAuthenticatedUser } from "@/lib/supabase/auth-user";

const messageSchema=z.object({role:z.enum(["user","assistant"]),content:z.string().min(1).max(2000)});
const requestSchema=z.object({messages:z.array(messageSchema).min(1).max(12)});

export async function POST(request:Request){
  const auth=await getAuthenticatedUser(request);
  if(!auth)return NextResponse.json({message:"Please log in to talk with the AI Mentor."},{status:401});
  const provider=resolveAiProvider(process.env);
  if(!provider)return NextResponse.json({message:"The AI Mentor is not configured yet. Add GROQ_API_KEY or OPENAI_API_KEY to the server environment."},{status:503});
  const parsed=requestSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({message:"Send between 1 and 12 valid chat messages."},{status:400});
  const user=await prisma.user.findFirst({where:{OR:[{authId:auth.id},...(auth.email?[{email:auth.email}]:[])]},include:{careers:{where:{active:true},include:{career:true},take:1}}});
  if(!user)return NextResponse.json({message:"Complete onboarding before using the AI Mentor."},{status:409});
  try{
    const client=new OpenAI({apiKey:provider.apiKey,baseURL:provider.baseURL});
    const instructions=mentorInstructions({name:user.fullName,career:user.careers[0]?.career.name||"an undecided career path",level:user.level,xp:user.xp});
    let answer="";
    if(provider.provider==="groq"){
      const response=await client.chat.completions.create({model:provider.model,messages:[{role:"system",content:instructions},...parsed.data.messages],max_tokens:700,temperature:0.4});
      answer=response.choices[0]?.message?.content?.trim()||"";
    }else{
      const response=await client.responses.create({model:provider.model,instructions,input:parsed.data.messages.map(message=>({role:message.role,content:message.content})),max_output_tokens:700});
      answer=response.output_text.trim();
    }
    if(!answer)throw new Error("The model returned an empty response.");
    return NextResponse.json({answer,provider:provider.provider});
  }catch(error){
    console.error("SkillVerse AI Mentor error",error instanceof Error?error.message:"Unknown AI provider error");
    return NextResponse.json({message:"The AI Mentor is temporarily unavailable. Please try again shortly."},{status:502});
  }
}
