/* CEG 410: linear elastic 2D pin-jointed truss, global matrix displacement method.
   SI units: metres, newtons, pascals, square metres. No Python.
   k_e = EA/L [ c² cs -c² -cs; cs s² -cs -s²; -c² -cs c² cs; -cs -s² cs s² ]
   K_ff u_f = F_f; R = K u - F; N = (EA/L)[-c,-s,c,s]u_e.
*/
(function(root){
"use strict";
function solveLinear(A,b){const n=b.length;const M=A.map((r,i)=>[...r,b[i]]);for(let k=0;k<n;k++){let p=k;for(let i=k+1;i<n;i++)if(Math.abs(M[i][k])>Math.abs(M[p][k]))p=i;if(Math.abs(M[p][k])<1e-12)throw Error("Singular stiffness matrix. Check supports, connectivity and stability.");[M[k],M[p]]=[M[p],M[k]];for(let i=k+1;i<n;i++){let q=M[i][k]/M[k][k];for(let j=k;j<=n;j++)M[i][j]-=q*M[k][j]}}const x=Array(n).fill(0);for(let i=n-1;i>=0;i--){let s=M[i][n];for(let j=i+1;j<n;j++)s-=M[i][j]*x[j];x[i]=s/M[i][i]}return x}
function solveTruss(model,log=()=>{}){const {nodes,members,E,A,loads=[],constraints=[]}=model;if(!Array.isArray(nodes)||nodes.length<2||!members.length)throw Error("Provide nodes and members.");if(!(E>0&&A>0))throw Error("E and A must be positive.");const index=new Map(nodes.map((n,i)=>[n.id,i]));if(index.size!==nodes.length)throw Error("Duplicate node IDs.");const dofs=2*nodes.length,K=Array.from({length:dofs},()=>Array(dofs).fill(0)),F=Array(dofs).fill(0);const elements=[];log("[2/5] Assembling global stiffness matrix...");
for(const pair of members){const [a,b]=pair.map(id=>index.get(id));if(a===undefined||b===undefined)throw Error("Unknown member node.");const dx=nodes[b].x-nodes[a].x,dy=nodes[b].y-nodes[a].y,L=Math.hypot(dx,dy);if(!(L>0))throw Error("Zero length member.");const c=dx/L,s=dy/L,q=[-c,-s,c,s],ids=[2*a,2*a+1,2*b,2*b+1],factor=E*A/L;for(let i=0;i<4;i++)for(let j=0;j<4;j++)K[ids[i]][ids[j]]+=factor*q[i]*q[j];elements.push({ids,q,factor})}
for(const l of loads){const i=index.get(l.node);if(i===undefined)throw Error("Load references unknown node.");F[2*i]+=l.fx||0;F[2*i+1]+=l.fy||0}
const fixed=new Set();for(const c of constraints){const i=index.get(c.node);if(i===undefined)throw Error("Constraint references unknown node.");if(c.x)fixed.add(2*i);if(c.y)fixed.add(2*i+1)}
const free=Array.from({length:dofs},(_,i)=>i).filter(i=>!fixed.has(i));if(!fixed.size)throw Error("No restraints provided.");log("[3/5] Applying support boundary conditions; solving "+free.length+" free DOFs...");
const uf=solveLinear(free.map(i=>free.map(j=>K[i][j])),free.map(i=>F[i]));const u=Array(dofs).fill(0);free.forEach((i,j)=>u[i]=uf[j]);const Ku=K.map(row=>row.reduce((sum,v,j)=>sum+v*u[j],0));const residual=Math.max(0,...free.map(i=>Math.abs(Ku[i]-F[i])));const reactions=[...fixed].sort((a,b)=>a-b).map(i=>({label:nodes[Math.floor(i/2)].id+" "+(i%2?"Ry":"Rx"),force:Ku[i]-F[i]}));log("[4/5] Recovering axial member forces and support reactions...");const memberForces=elements.map(e=>e.factor*e.ids.reduce((sum,id,j)=>sum+e.q[j]*u[id],0)/1000);return{displacements:u,memberForces,reactions,residual,globalStiffness:K}}
root.solveTruss=solveTruss;if(typeof module!=="undefined")module.exports={solveTruss};
})(typeof window!=="undefined"?window:globalThis);
