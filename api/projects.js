const {neon}=require("@neondatabase/serverless");
module.exports=async function(req,res){
 if(!process.env.DATABASE_URL)return res.status(503).json({error:"Database not configured"});
 const token=process.env.STUDIO_ACCESS_KEY;
 if(!token)return res.status(503).json({error:"Project saving is not enabled until access control is configured"});
 const provided=String(req.headers["x-studio-key"]||"");
 const crypto=require("node:crypto");
 const a=Buffer.from(provided),b=Buffer.from(token);
 if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return res.status(401).json({error:"Access denied"});
 const sql=neon(process.env.DATABASE_URL);
 try{
 if(req.method==="GET"){const rows=await sql`SELECT id,title,model,results,updated_at FROM analysis_projects ORDER BY updated_at DESC LIMIT 50`;return res.status(200).json({projects:rows})}
 if(req.method==="POST"){
 const {title,model,results}=req.body||{};
 if(typeof title!=="string"||title.length>120||!model||typeof model!=="object"||JSON.stringify(model).length>100000)return res.status(400).json({error:"Invalid project data"});
 const rows=await sql`INSERT INTO analysis_projects(title,model,results) VALUES(${title},${JSON.stringify(model)}::jsonb,${JSON.stringify(results||null)}::jsonb) RETURNING id,created_at`;
 return res.status(201).json({project:rows[0]})
 }
 return res.status(405).json({error:"Unsupported method"});
 }catch(e){return res.status(500).json({error:"Database operation failed"})}
};