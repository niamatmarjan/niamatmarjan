// Self-contained Full Stop artwork generator, based on the portfolio design system.
// Requires Node.js only; no remote font fetches or API tokens.
const fs = require("node:fs");
const path = require("node:path");
const P = {"paper":"#EEEAE2","ink":"#1A1917","night":"#141311","verm":"#E8552C","dim":"#655F56","nightDim":"#A39E94"};
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));}
function tx(s,x,y,size,color,weight=700,extra=""){return `<text x="${x}" y="${y}" font-family="Arial,Helvetica,sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" ${extra}>${esc(s)}</text>`;}
function bit(x,y,k){return `<g transform="translate(${x} ${y}) scale(${k/100})"><ellipse cx="50" cy="116" rx="37" ry="3.5" opacity=".14" fill="${P.ink}"/><rect x="20" y="94" width="17" height="18" rx="7" fill="${P.ink}"/><rect x="63" y="94" width="17" height="18" rx="7" fill="${P.ink}"/><rect x="90" y="51" width="26" height="12" rx="6" fill="${P.verm}"/><rect width="100" height="100" rx="15" fill="${P.verm}"/><rect x="25" y="27" width="13" height="25" rx="6.5" fill="${P.ink}"/><rect x="62" y="27" width="13" height="25" rx="6.5" fill="${P.ink}"/><circle cx="33.5" cy="33" r="2.4" fill="${P.paper}"/><circle cx="70.5" cy="33" r="2.4" fill="${P.paper}"/><path d="M39 65 Q50 77 61 65" fill="none" stroke="${P.ink}" stroke-width="3.5" stroke-linecap="round"/></g>`;}
function wrap(w,h,title,body){return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">${body}</svg>\n`;}
function banner(m){
 const w=m?520:1080,h=m?520:432,p=m?28:46;let x=`<rect width="${w}" height="${h}" fill="${P.paper}"/>`;
 x+=tx("niamat",p,m?54:66,m?36:41,P.ink,800,'letter-spacing="-1.8"');
 x+=`<rect x="${m?145:178}" y="${m?38:46}" width="${m?11:13}" height="${m?11:13}" rx="2" fill="${P.verm}"/>`;
 if(m){
 x+=tx("SOFTWARE ENGINEER / SRI LANKA",28,91,13,P.dim,600,'letter-spacing=".8"');
 x+=`<path d="M28 117H492" stroke="${P.ink}" stroke-opacity=".18"/>`;
 x+=tx("NIAMAT",28,219,89,P.ink,800,'letter-spacing="-5"')+tx("MARJAN",28,320,89,P.ink,800,'letter-spacing="-5"')+bit(408,258,65);
 x+=`<path d="M28 364H492" stroke="${P.ink}" stroke-opacity=".18"/>`;
 x+=tx("I BUILD THINGS",28,410,37,P.ink,800,'letter-spacing="-1.5"')+tx("THAT SHIP.",28,451,37,P.ink,800,'letter-spacing="-1.5"');
 x+=tx("WEB / MOBILE / SAAS / AI / SYSTEMS",28,484,12,P.dim,600)+tx("niamat.dev",28,507,12,P.ink,700);
 }else{
 x+=tx("SOFTWARE ENGINEER / FULL-STACK & MOBILE",1032,47,16,P.ink,600,'text-anchor="end"');
 x+=tx("SRI LANKA / WORKING WORLDWIDE",1032,71,13,P.dim,500,'text-anchor="end"');
 x+=`<path d="M46 92H1034" stroke="${P.ink}" stroke-opacity=".18"/>`;
 x+=tx("NIAMAT",46,229,139,P.ink,800,'letter-spacing="-7"')+tx("MARJAN",46,352,139,P.ink,800,'letter-spacing="-7"');
 x+=tx("THE FULL STOP",795,164,17,P.dim,600,'letter-spacing="1"')+tx("THAT SHIPS.",795,191,17,P.dim,600,'letter-spacing="1"')+bit(796,208,102);
 x+=`<path d="M46 380H1034" stroke="${P.ink}" stroke-opacity=".18"/>`;
 x+=tx("WEB / MOBILE / SAAS / AI / SYSTEMS",46,411,16,P.ink,600)+tx("niamat.dev",1034,411,16,P.ink,700,'text-anchor="end"');
 }
 return wrap(w,h,"Niamat Marjan — Full Stop profile banner",x);
}
function footer(){
 let x=`<rect width="1080" height="120" fill="${P.night}"/><path d="M40 23H1040" stroke="${P.paper}" stroke-opacity=".2"/>`;
 x+=tx("niamat",40,86,58,P.paper,800,'letter-spacing="-3"')+`<rect x="223" y="74" width="15" height="15" rx="3" fill="${P.verm}"/>`;
 x+=tx("BUILD IT CAREFULLY. SHIP IT.",384,64,23,P.paper,700)+tx("SRI LANKA / WORKING WORLDWIDE",384,88,14,P.nightDim,500);
 x+=tx("niamat.dev",1038,91,15,P.paper,600,'text-anchor="end"');
 return wrap(1080,120,"niamat. — Build it carefully. Ship it.",x);
}
const out = path.join(__dirname,"..","assets");
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,"header.svg"),banner(false));
fs.writeFileSync(path.join(out,"header-mobile.svg"),banner(true));
fs.writeFileSync(path.join(out,"footer.svg"),footer());
console.log("Regenerated Full Stop profile artwork.");
