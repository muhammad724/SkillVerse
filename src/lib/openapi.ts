const json={"application/json":{schema:{type:"object"}}};
const bearer=[{bearerAuth:[]}];
const responses={"200":{description:"Successful response",content:json},"400":{description:"Invalid request",content:json},"401":{description:"Authentication required",content:json},"500":{description:"Server error",content:json}};
export const openApiDocument={
 openapi:"3.1.0",info:{title:"SkillVerse REST API",version:"1.0.0",description:"Authenticated APIs for career onboarding, roadmaps, missions, submissions, assigned tasks, profiles, and administration."},
 servers:[{url:"/",description:"Current SkillVerse environment"}],
 tags:[{name:"Learner"},{name:"Missions"},{name:"Submissions"},{name:"Profile"},{name:"Admin"},{name:"Monitoring"}],
 components:{securitySchemes:{bearerAuth:{type:"http",scheme:"bearer",bearerFormat:"Supabase JWT",description:"Use the Supabase access token returned after login."}},schemas:{
  Error:{type:"object",properties:{message:{type:"string"}},required:["message"]},
  OnboardingInput:{type:"object",required:["career","experience","goal","weeklyHours"],properties:{career:{type:"string",example:"Figma Designer"},experience:{type:"string",enum:["BEGINNER","INTERMEDIATE","ADVANCED"]},goal:{type:"string",example:"Build a professional portfolio"},weeklyHours:{type:"integer",minimum:1,maximum:60}}},
  SubmissionInput:{type:"object",required:["missionSlug","explanation","githubUrl","criteriaCompleted","draft"],properties:{missionSlug:{type:"string"},explanation:{type:"string",minLength:50},githubUrl:{type:"string",format:"uri",description:"Project evidence URL, including GitHub or Figma links."},liveUrl:{type:"string",format:"uri"},criteriaCompleted:{type:"integer"},draft:{type:"boolean"}}},
  AssignmentInput:{type:"object",required:["userId","missionId"],properties:{userId:{type:"string"},missionId:{type:"string"},note:{type:"string"},dueAt:{type:"string",format:"date"}}},
  MissionInput:{type:"object",required:["careerId","title","description","scenario","difficulty","xpReward","estimatedMinutes"],properties:{careerId:{type:"string"},title:{type:"string"},description:{type:"string"},scenario:{type:"string"},difficulty:{type:"string",enum:["BEGINNER","INTERMEDIATE","ADVANCED","BOSS"]},xpReward:{type:"integer"},estimatedMinutes:{type:"integer"}}}
 }},
 paths:{
  "/api/onboarding":{post:{tags:["Learner"],summary:"Create or update the authenticated learner's career campaign",security:bearer,requestBody:{required:true,content:{"application/json":{schema:{$ref:"#/components/schemas/OnboardingInput"}}}},responses}},
  "/api/dashboard":{get:{tags:["Learner"],summary:"Get dashboard, career roadmap, progress, and activity",security:bearer,responses}},
  "/api/missions":{get:{tags:["Missions"],summary:"List missions for the active career or get one mission by slug",security:bearer,parameters:[{name:"slug",in:"query",required:false,schema:{type:"string"}}],responses}},
  "/api/missions/start":{post:{tags:["Missions"],summary:"Start the authenticated learner's mission timer",security:bearer,requestBody:{required:true,content:{"application/json":{schema:{type:"object",required:["missionSlug"],properties:{missionSlug:{type:"string"}}}}}},responses}},
  "/api/missions/stop":{post:{tags:["Missions"],summary:"Stop and persist the authenticated learner's mission timer",security:bearer,requestBody:{required:true,content:{"application/json":{schema:{type:"object",required:["missionSlug"],properties:{missionSlug:{type:"string"}}}}}},responses}},
  "/api/tasks":{get:{tags:["Learner"],summary:"List missions assigned to the authenticated learner",security:bearer,responses}},
  "/api/submissions":{post:{tags:["Submissions"],summary:"Save a draft or submit mission evidence",security:bearer,requestBody:{required:true,content:{"application/json":{schema:{$ref:"#/components/schemas/SubmissionInput"}}}},responses}},
  "/api/profile":{get:{tags:["Profile"],summary:"Get the authenticated learner profile",security:bearer,responses},patch:{tags:["Profile"],summary:"Update profile settings",security:bearer,responses}},
  "/api/admin/overview":{get:{tags:["Admin"],summary:"List users, missions, assignments, and submissions",security:bearer,responses}},
  "/api/admin/missions":{get:{tags:["Admin"],summary:"List career metadata for mission creation",security:bearer,responses},post:{tags:["Admin"],summary:"Create a career mission",security:bearer,requestBody:{required:true,content:{"application/json":{schema:{$ref:"#/components/schemas/MissionInput"}}}},responses}},
  "/api/admin/assignments":{post:{tags:["Admin"],summary:"Assign a mission to a learner",security:bearer,requestBody:{required:true,content:{"application/json":{schema:{$ref:"#/components/schemas/AssignmentInput"}}}},responses}},
  "/api/admin/submissions/{id}":{patch:{tags:["Admin"],summary:"Review a learner submission",security:bearer,parameters:[{name:"id",in:"path",required:true,schema:{type:"string"}}],responses}},
  "/api/sentry-example":{post:{tags:["Monitoring"],summary:"Admin-only endpoint that captures a sample Sentry error",security:bearer,responses}}
 }
} as const;
