const $=s=>document.querySelector(s),R=(a,b)=>a+Math.random()*(b-a),L=(a,b,t)=>a+(b-a)*t;
const WORDS=[...new Set(`bloom petal seed root leaf stem moss fern rain dew sun cloud breeze meadow pebble brook acorn clover daisy tulip lily rose iris lotus maple willow birch cedar pine oak bud sprout grow soil puddle bee moth ladybug beetle snail frog pond lake river stream hill valley field garden orchard berry apple peach pear plum mint basil thyme sage herb nectar pollen honey wing feather nest robin sparrow dove owl fox rabbit deer fawn lantern whisper gentle quiet calm hush glow sunrise sunset moonlight starlight twilight morning evening harvest autumn spring summer ripple drift float`.split(' '))];
const c=$('#c'),x=c.getContext('2d'),wordEl=$('#word'),typer=$('#typer');
let W,H,D,soil;
function rs(){D=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;c.width=W*D;c.height=H*D;x.setTransform(D,0,0,D,0,0);soil=H*.84}
addEventListener('resize',rs);rs();

/* ---------- state ---------- */
let plants=[],bugs=[],word='',idx=0,words=0,total=0,good=0,streak=0,t0=0,wilt=0,pulse=0,t=0;
const stars=Array.from({length:70},()=>[Math.random(),Math.random()*.6,R(.6,1.6)]);

/* ---------- typing ---------- */
function next(){let w;do{w=WORDS[Math.floor(Math.random()*WORDS.length)]}while(w==word);word=w;idx=0;show()}
function show(bad){wordEl.innerHTML=[...word].map((ch,i)=>`<span class="${i<idx?'ok':i==idx?'cur'+(bad?' bad':''):''}">${ch}</span>`).join('')}
function key(ch){
 ch=ch.toLowerCase();if(!/^[a-z]$/.test(ch))return;
 if(!t0){t0=performance.now();$('#hint').classList.add('gone')}
 total++;
 if(ch==word[idx]){good++;streak++;idx++;pulse=1;wilt=Math.max(0,wilt-.04);
  if(idx==word.length){reward();next()}else show()}
 else{streak=0;if($('#wilt').checked)wilt=Math.min(1,wilt+.22);
  wordEl.classList.remove('shake');void wordEl.offsetWidth;wordEl.classList.add('shake');show(true)}
 stats()}
typer.addEventListener('input',()=>{[...typer.value].forEach(key);typer.value=''});
addEventListener('pointerdown',()=>typer.focus());
addEventListener('keydown',e=>{if(document.activeElement!==typer&&!e.target.closest('button,label'))typer.focus()});

/* ---------- garden ---------- */
function addPlant(g=.14){
 let fx,n=0;do{fx=R(.05,.95)}while(n++<25&&plants.some(p=>!p.die&&Math.abs(p.fx-fx)<.045));
 const type=Math.floor(R(0,5)),hh=[[.26,.36],[.24,.32],[.30,.40],[.22,.30],[.08,.12]][type];
 plants.push({fx,type,g:0,gt:g,hf:R(...hh),hue:type==2?48:type==3?268:type==4?5:[330,0,200,280,20][Math.floor(R(0,5))],dir:Math.random()<.5?-1:1,ph:R(0,6)});
 const live=plants.filter(p=>!p.die);if(live.length>16){live[0].die=1;live[0].gt=0}}
function reward(){
 words++;const grow=plants.filter(p=>!p.die&&p.gt<1);
 if(plants.length<3||!grow.length||words%4==0)addPlant();
 else grow.sort((a,b)=>a.gt-b.gt)[0].gt=Math.min(1,grow[0].gt+.34);
 bugs.push({x:R(.1,.9)*W,y:soil-R(40,120),vx:R(-.5,.5),vy:R(.5,1),t:0,ph:R(0,6),hue:R(0,360),life:R(6,9)});
 save();stats()}
function save(){try{localStorage.typingGarden=JSON.stringify({words,plants:plants.filter(p=>!p.die).map(({fx,type,gt,hf,hue,dir,ph})=>({fx,type,gt,hf,hue,dir,ph}))})}catch{}}
function load(){try{const s=JSON.parse(localStorage.typingGarden);words=s.words||0;plants=(s.plants||[]).map(p=>({...p,g:0}));if(words)$('#hint').textContent='Welcome back. Keep typing to keep your garden growing.'}catch{}}
$('#clear').onclick=()=>{plants.forEach(p=>{p.die=1;p.gt=0});words=0;save();stats()};
function stats(){
 const m=(performance.now()-t0)/60000;
 $('#sw').textContent=words;$('#sp').textContent=t0&&m>.02?Math.round(good/5/m):0;
 $('#sa').textContent=total?Math.round(good/total*100)+'%':'100%';$('#ss').textContent=streak}
setInterval(stats,1000);

/* ---------- drawing ---------- */
const PAL=[[[110,198,255],[217,243,255]],[[91,63,140],[255,138,92]],[[14,18,48],[42,47,102]],[[154,139,224],[255,197,158]]];
function sky(now){
 const ph=(now/1000/100)%1,p=ph*4,i=Math.floor(p),f=p-i,A=PAL[i%4],B=PAL[(i+1)%4];
 const col=k=>`rgb(${[0,1,2].map(n=>Math.round(L(A[k][n],B[k][n],f))).join()})`;
 const g=x.createLinearGradient(0,0,0,soil);g.addColorStop(0,col(0));g.addColorStop(1,col(1));x.fillStyle=g;x.fillRect(0,0,W,H);
 const na=Math.max(0,1-Math.abs(ph-.5)*5);x.fillStyle='#fff';
 stars.forEach(s=>{x.globalAlpha=na*(.5+.5*Math.sin(now/600+s[0]*20));x.beginPath();x.arc(s[0]*W,s[1]*H,s[2],0,7);x.fill()});x.globalAlpha=1;
 x.fillStyle=`hsl(125,${L(38,20,na)}%,${L(62,28,na)}%)`;x.beginPath();x.moveTo(0,H);
 for(let i=0;i<=W;i+=12)x.lineTo(i,soil-30-Math.sin(i/W*5+1)*26-Math.sin(i/W*11)*8);x.lineTo(W,H);x.fill()}
function soilDraw(){
 const g=x.createLinearGradient(0,soil,0,H);g.addColorStop(0,'#8a5a3c');g.addColorStop(1,'#4a2f1f');x.fillStyle=g;x.fillRect(0,soil,W,H-soil);
 x.fillStyle='#4caf50';x.fillRect(0,soil,W,8)}
const bz=(u,a,b,d)=>(1-u)*(1-u)*a+2*(1-u)*u*b+u*u*d;
function drawPlant(p,now){
 const gr=p.g,e=1-Math.pow(1-Math.min(1,gr),2),h=p.hf*H*e,bx=p.fx*W,by=soil+6,w=wilt,k=Math.max(0,(gr-.45)/.55);
 if(h<2)return;
 const sw=Math.sin(now/800+p.ph)*(5+pulse*8)*(1-w*.6),tx=bx+sw+p.dir*w*h*.5,ty=by-h+w*h*.3,cx=bx+sw*.3,cy=by-h*.6;
 if(p.type==4){ // mushroom
  x.fillStyle=`hsl(35,30%,${L(90,70,w)}%)`;x.fillRect(bx-h*.12,by-h*.6,h*.24,h*.6);
  x.fillStyle=`hsl(${p.hue},${L(75,30,w)}%,${L(52,40,w)}%)`;x.beginPath();x.ellipse(bx,by-h*.6,h*.5,h*.42*(1-w*.25),0,Math.PI,0);x.fill();
  x.fillStyle='#fff';[[-.22,-.78],[.1,-.9],[.26,-.72]].forEach(q=>{x.beginPath();x.arc(bx+q[0]*h,by+q[1]*h,h*.06,0,7);x.fill()});return}
 x.strokeStyle=`hsl(${L(120,60,w)},${L(45,25,w)}%,${L(34,32,w)}%)`;x.lineWidth=3+h*.012;x.lineCap='round';
 x.beginPath();x.moveTo(bx,by);x.quadraticCurveTo(cx,cy,tx,ty);x.stroke();
 [.35,.62].forEach((u,i)=>{const d=i?1:-1,s=Math.min(1,gr*2.2)*(7+h*.07);x.save();x.translate(bz(u,bx,cx,tx),bz(u,by,cy,ty));x.rotate(d*(-.5+w));
  x.fillStyle=`hsl(${L(125,55,w)},${L(50,25,w)}%,${L(45,36,w)}%)`;x.beginPath();x.ellipse(d*s,0,s,s*.38,0,0,7);x.fill();x.restore()});
 if(k<=0)return;
 if(p.type==3){ // lavender: dots along the top of the stem
  x.fillStyle=`hsl(${p.hue},${L(70,20,w)}%,${L(62,45,w)}%)`;
  for(let i=0;i<8;i++){const u=.55+i*.058;[-1,1].forEach(d=>{x.beginPath();x.arc(bz(u,bx,cx,tx)+d*4*k,bz(u,by,cy,ty),3.4*k,0,7);x.fill()})}return}
 x.save();x.translate(tx,ty);x.rotate(p.dir*w*1.1+sw*.01);
 const pet=`hsl(${p.hue},${L(80,25,w)}%,${L(78,58,w)}%)`;
 if(p.type==1){x.fillStyle=pet;x.beginPath();x.moveTo(-11*k,0);x.bezierCurveTo(-14*k,-22*k,-5*k,-28*k,0,-34*k);x.bezierCurveTo(5*k,-28*k,14*k,-22*k,11*k,0);x.bezierCurveTo(6*k,6*k,-6*k,6*k,-11*k,0);x.fill()}
 else{const n=p.type==2?12:8,len=p.type==2?13:12;x.fillStyle=pet;
  for(let i=0;i<n;i++){x.rotate(Math.PI*2/n);x.beginPath();x.ellipse(0,-len*1.5*k,len*.45*k,len*k,0,0,7);x.fill()}
  x.fillStyle=p.type==2?`hsl(28,60%,${L(26,22,w)}%)`:`hsl(${L(46,32,w)},90%,55%)`;x.beginPath();x.arc(0,0,(p.type==2?11:7)*k,0,7);x.fill()}
 x.restore()}
function drawBugs(dt){
 bugs=bugs.filter(b=>b.t<b.life&&b.y>-30);
 bugs.forEach(b=>{b.t+=dt;b.x+=Math.sin(b.t*3+b.ph)*.9+b.vx;b.y-=b.vy;
  x.globalAlpha=Math.min(1,(b.life-b.t)/1.5);x.save();x.translate(b.x,b.y);x.scale(.25+Math.abs(Math.sin(b.t*14)),1);
  x.fillStyle=`hsl(${b.hue},85%,65%)`;[-1,1].forEach(d=>{x.beginPath();x.ellipse(d*6,0,7,9,0,0,7);x.fill()});x.restore()});x.globalAlpha=1}

/* ---------- main loop ---------- */
let last=performance.now();
function frame(now){
 const dt=Math.min(.05,(now-last)/1000);last=now;t+=dt;
 wilt=Math.max(0,wilt-dt*.04);pulse=Math.max(0,pulse-dt*2.5);
 plants.forEach(p=>p.g+=(p.gt-p.g)*Math.min(1,dt*2.5));plants=plants.filter(p=>!(p.die&&p.g<.03));
 sky(now);plants.forEach(p=>drawPlant(p,now));soilDraw();drawBugs(dt);
 requestAnimationFrame(frame)}
load();next();typer.focus();requestAnimationFrame(frame);
