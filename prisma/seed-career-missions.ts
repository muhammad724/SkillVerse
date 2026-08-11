import "dotenv/config";
import { PrismaClient, Difficulty } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { careerMissionCatalog } from "../src/lib/mission-catalog";
import { careerRoadmaps } from "../src/lib/roadmap-catalog";

const raw=process.env.DATABASE_URL;if(!raw)throw new Error("DATABASE_URL missing");
const url=`${raw}${raw.includes("?")?"&":"?"}uselibpqcompat=true&sslmode=require`;
const prisma=new PrismaClient({adapter:new PrismaPg({connectionString:url})});
const slug=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
async function main(){
 for(const[name,missions]of Object.entries(careerMissionCatalog)){
  const career=await prisma.career.upsert({where:{slug:slug(name)},update:{name,description:`A dedicated ${name} career campaign with role-specific portfolio missions.`},create:{name,slug:slug(name),description:`A dedicated ${name} career campaign with role-specific portfolio missions.`}});
  for(const[position,title]of careerRoadmaps[name].entries()){
   await prisma.roadmapNode.upsert({where:{careerId_slug:{careerId:career.id,slug:slug(title)}},update:{title,description:`Master ${title} through focused practice and portfolio evidence.`,position,xpReward:position===careerRoadmaps[name].length-1?1000:250},create:{careerId:career.id,title,slug:slug(title),description:`Master ${title} through focused practice and portfolio evidence.`,position,xpReward:position===careerRoadmaps[name].length-1?1000:250}});
  }
  for(const mission of missions){const missionSlug=`${slug(name)}-${slug(mission.title)}`;await prisma.mission.upsert({where:{slug:missionSlug},update:{careerId:career.id,title:mission.title,description:mission.description,scenario:mission.scenario,difficulty:mission.difficulty as Difficulty,xpReward:mission.xpReward,estimatedMinutes:mission.estimatedMinutes,boss:mission.difficulty==="BOSS"},create:{careerId:career.id,slug:missionSlug,title:mission.title,description:mission.description,scenario:mission.scenario,difficulty:mission.difficulty as Difficulty,xpReward:mission.xpReward,estimatedMinutes:mission.estimatedMinutes,boss:mission.difficulty==="BOSS"}})}
 }
 console.log("CAREER_MISSIONS_READY");
}
void main().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>prisma.$disconnect());
