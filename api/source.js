const allowed=new Set(["index.html","solver.js","test.js","README.md","package.json","tutor-templates.js","api/chat.js","api/scan.js","api/projects.js","api/source.js"]);
module.exports=async function(req,res){
 if(req.method!=="GET")return res.status(405).json({error:"GET only"});
 const file=String(req.query?.file||"");
 if(!allowed.has(file))return res.status(400).json({error:"Unknown source file"});
 try{
  const url="https://raw.githubusercontent.com/Thee-Web3-Qing/Ceg-410/main/"+file;
  const r=await fetch(url,{headers:{"Accept":"text/plain"}});
  if(!r.ok)throw Error("Source not available");
  const code=await r.text();
  res.setHeader("Cache-Control","public, max-age=30");
  return res.status(200).json({file,code,lines:code.split("\n").length});
 }catch(e){return res.status(502).json({error:"Could not load GitHub source"})}
};