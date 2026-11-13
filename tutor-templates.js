/* Response guidance for the CEG 410 tutor. These are structures, not hard-coded answers. */
const categories={
 project:{keywords:["built","project","software","features","architecture","defend","presentation","code","javascript","terminal","github"],sections:["Answer directly","Identify the relevant implemented file or feature","Explain its purpose and limitations","Suggest how to demonstrate it"]},
 fundamentals:{keywords:["truss","beam","frame","joint","support","reaction","tension","compression","stability","determinate"],sections:["Define the concept","Explain its physical meaning","Relate it to the displayed structure","Mention assumptions"]},
 calculations:{keywords:["calculate","solve","force","displacement","matrix","stiffness","equilibrium","method","formula","derive"],sections:["Identify given values and units","State governing equation","Show the steps","Check units and equilibrium","Explain the result"]},
 debugging:{keywords:["error","failed","singular","bug","wrong","debug","fix","crash"],sections:["Describe the likely cause","Explain a verification step","Propose a fix","Do not claim a fix was executed"]},
 study:{keywords:["teach","explain","notes","quiz","study","exam","understand","why","how"],sections:["Explain one concept simply","Give a small worked illustration if supported","Provide concise notes","Ask one understanding question"]},
 image:{keywords:["image","upload","scan","picture","diagram","extract"],sections:["Explain what was extracted","List uncertain or missing values","Ask for confirmation","Only solve after verification"]},
 scope:{keywords:["slope","deflection","design","1000","large","influence","moment distribution"],sections:["Explain the requested method","State whether it is implemented","Identify the next engineering steps","Avoid pretending unsupported methods run"]}
};
function classify(text){const t=String(text||"").toLowerCase();let best="study",score=0;for(const [k,v] of Object.entries(categories)){const s=v.keywords.filter(w=>t.includes(w)).length;if(s>score){best=k;score=s}}return best}
function guidance(question){const category=classify(question);return{category,sections:categories[category].sections}}
module.exports={categories,classify,guidance};
