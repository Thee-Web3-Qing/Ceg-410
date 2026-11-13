// Server-side Gemini Vision endpoint. Configure GEMINI_API_KEY in Vercel environment settings.
// Never expose API keys to browser code.
module.exports=async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"POST required"});
 const key=process.env.GEMINI_API_KEY;
 if(!key)return res.status(503).json({error:"Gemini is not configured yet. Add GEMINI_API_KEY in Vercel project settings."});
 const image=req.body?.image;
 if(typeof image!=="string"||image.length>6_000_000)return res.status(400).json({error:"Invalid or oversized image"});
 const match=/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(image);
 if(!match)return res.status(400).json({error:"Only PNG, JPG and WebP are supported"});
 const prompt=`You are reading a civil engineering structural analysis question. Transcribe all visible text, and extract the diagram carefully. Never invent missing values. Return JSON only with keys: transcription (string), nodes (array of objects with id,x,y or null), members (array of pairs of node IDs), supports (array), loads (array), units (object), missingInformation (array of strings), modelMatchesExample (boolean), exampleInputs (object with E_GPa,A_mm2,P_kN numeric only if explicitly provided). Set modelMatchesExample true ONLY if the image unambiguously describes exactly nodes A(0,0), B(2,2), C(4,0), D(2,0), members AB BC AD DC BD, pin at A, vertical roller at C and vertical load at B. Never guess geometry or default E/A.`;
 try{
 const url="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
 const response=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},body:JSON.stringify({contents:[{parts:[{text:prompt},{inline_data:{mime_type:match[1],data:match[2]}}]}],generationConfig:{responseMimeType:"application/json",temperature:0}})});
 const result=await response.json();if(!response.ok)return res.status(502).json({error:"Gemini request failed: "+(result.error?.message||response.status)});
 const raw=result.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("")||"";
 let parsed;try{parsed=JSON.parse(raw)}catch{return res.status(502).json({error:"Gemini did not return valid structured data"})}
 return res.status(200).json(parsed);
 }catch(e){return res.status(502).json({error:"Image scanning service is unavailable"})}
};