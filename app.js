/* =========================================================
   BANCO DE VERBETES — demo, Ponto 15
   Formato real: {id, resposta_grade, resposta_display, dica, dif, fonte:{obra,pagina}}
   ========================================================= */
let B=[];
let EDICAO=null;

/* ================= GERADOR ================= */
function mulberry32(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function cabe(G,W,H,w,r,c,dir){
  const dr=dir==='V'?1:0,dc=dir==='H'?1:0,len=w.length;
  const fr=r+dr*(len-1),fc=c+dc*(len-1);
  if(r<0||c<0||fr>=H||fc>=W)return -1;
  const d=(a,b)=>a>=0&&b>=0&&a<H&&b<W;
  if(d(r-dr,c-dc)&&G[r-dr][c-dc])return -1;
  if(d(fr+dr,fc+dc)&&G[fr+dr][fc+dc])return -1;
  const pr=dir==='H'?1:0,pc=dir==='H'?0:1;
  let x=0;
  for(let i=0;i<len;i++){
    const rr=r+dr*i,cc=c+dc*i,a=G[rr][cc];
    if(a){if(a!==w[i])return -1;x++}
    else{
      if(d(rr-pr,cc-pc)&&G[rr-pr][cc-pc])return -1;
      if(d(rr+pr,cc+pc)&&G[rr+pr][cc+pc])return -1;
    }
  }
  return x;
}
function posicoes(G,W,H,w){
  const o=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const dir of['H','V']){
    const x=cabe(G,W,H,w,r,c,dir); if(x<1)continue;
    o.push({r,c,dir,score:x*14+w.length*0.8-(Math.abs(r-H/2)+Math.abs(c-W/2))*0.5});
  }
  return o;
}
function construir(pool,tam,rng){
  const W=tam,H=tam,G=Array.from({length:H},()=>Array(W).fill(null));
  const cd=pool.filter(v=>v.g.length>=3&&v.g.length<=Math.min(W,15))
    .map(v=>({v,k:v.g.length+rng()*3})).sort((a,b)=>b.k-a.k).map(x=>x.v);
  if(!cd.length)return null;
  const foco=cd.filter(v=>(v.prio||0)>=15);
  const postas=[],us=new Set(),a=(foco.length?foco:cd)[0];
  const r0=Math.floor(H/2),c0=Math.max(0,Math.floor((W-a.g.length)/2));
  for(let i=0;i<a.g.length;i++)G[r0][c0+i]=a.g[i];
  postas.push(a);us.add(a.id);
  // fase 1: esgota o que está em foco; fase 2: completa com o resto do banco
  for(const fase of [1,0]){
    const pool2=fase?foco:cd;
    if(!pool2.length)continue;
    for(;;){
      let ops=[];
      for(const v of pool2){
        if(us.has(v.id))continue;
        for(const o of posicoes(G,W,H,v.g))
          ops.push({v,r:o.r,c:o.c,dir:o.dir,score:o.score+(v.prio||0)});
      }
      if(!ops.length)break;
      ops.sort((x,y)=>y.score-x.score);
      const topo=ops.filter(o=>o.score>=ops[0].score-3).slice(0,6);
      const e=topo[Math.floor(rng()*topo.length)];
      const dr=e.dir==='V'?1:0,dc=e.dir==='H'?1:0;
      for(let i=0;i<e.v.g.length;i++)G[e.r+dr*i][e.c+dc*i]=e.v.g[i];
      postas.push(e.v);us.add(e.v.id);
    }
  }
  if(postas.length<6)return null;
  return finalizar(G,postas,W,H);
}
function finalizar(G,postas,W,H){
  let r1=H,r2=-1,c1=W,c2=-1;
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)if(G[r][c]){
    if(r<r1)r1=r;if(r>r2)r2=r;if(c<c1)c1=c;if(c>c2)c2=c}
  const nH=r2-r1+1,nW=c2-c1+1;
  const g=Array.from({length:nH},(_,r)=>Array.from({length:nW},(_,c)=>G[r+r1][c+c1]));
  const numeros=Array.from({length:nH},()=>Array(nW).fill(0));
  const entradas=[];let n=0;
  for(let r=0;r<nH;r++)for(let c=0;c<nW;c++){
    if(!g[r][c])continue;
    const iH=(c===0||!g[r][c-1])&&c+1<nW&&g[r][c+1];
    const iV=(r===0||!g[r-1][c])&&r+1<nH&&g[r+1][c];
    if(!iH&&!iV)continue;
    n++;numeros[r][c]=n;
    if(iH){let w='',cc=c;while(cc<nW&&g[r][cc])w+=g[r][cc++];entradas.push({n,dir:'H',r,c,palavra:w})}
    if(iV){let w='',rr=r;while(rr<nH&&g[rr][c]){w+=g[rr][c];rr++}entradas.push({n,dir:'V',r,c,palavra:w})}
  }
  const mapa=new Map(postas.map(v=>[v.g,v]));
  for(const e of entradas)e.verbete=mapa.get(e.palavra)||null;
  if(entradas.some(e=>!e.verbete))return null;   // portão de qualidade
  return {g,numeros,entradas,W:nW,H:nH};
}
function gerar(pool,tam,seed){
  let melhor=null;
  for(let t=0;t<60;t++){
    const r=construir(pool,tam,mulberry32((seed+t*7919)>>>0));
    if(r&&(!melhor||r.entradas.length>melhor.entradas.length))melhor=r;
    if(melhor&&melhor.entradas.length>=Math.round(tam*tam*0.078))break;
  }
  return melhor;
}

/* ================= APP ================= */
const $=id=>document.getElementById(id);
const CHAVE_DOM='cruzadas:dominados';
let CHAVE_G='', CHAVE_D='';
let SUBITENS={};
const Mem={};
const Store={
  async get(k){
    try{const r=await window.storage.get(k);return r?JSON.parse(r.value):null}catch(e){}
    try{const s=localStorage.getItem(k);return s?JSON.parse(s):null}catch(e){}
    return Mem[k]??null;
  },
  async set(k,v){
    try{await window.storage.set(k,JSON.stringify(v));return}catch(e){}
    try{localStorage.setItem(k,JSON.stringify(v));return}catch(e){}
    Mem[k]=v;
  }
};

let P=null,resp=[],marcas=[],trava=[],cur={r:0,c:0},dir='H';
let timer=null,cel=26,tempo=0;
let pontos=0,revelacoes=0,verificacoes=0,fim=false;
let dominados=new Set();
let tamAtual=19,seedAtual=0,salvarT=null,brinde=[],defeitos=[];


function prioridades(){
  const foco=$('sel-foco').value, sub=$('sel-sub').value, vic=$('ck-viciar').checked;
  B.forEach(v=>{
    let p=0;
    if(foco==='n34'&&v.dif>=3)p+=20;
    if(foco==='n12'&&v.dif<=2)p+=20;
    if(sub&&v.subitem===sub)p+=20;
    if(vic&&!dominados.has(v.id))p+=7;
    v.prio=p;
  });
}
function darBrindes(){
  const pct=parseFloat($('sel-brinde').value)||0;
  brinde=P.g.map(l=>l.map(()=>false));
  if(!pct)return;
  const n=Math.round(P.entradas.length*pct);
  const emb=[...P.entradas].sort(()=>Math.random()-0.5).slice(0,n);
  emb.forEach(e=>{
    const cs=celulasDe(e).filter(([r,c])=>!resp[r][c]);
    if(!cs.length)return;
    const [r,c]=cs[Math.floor(Math.random()*cs.length)];
    resp[r][c]=P.g[r][c];trava[r][c]=true;brinde[r][c]=true;
  });
  // palavra completada só por brindes não vale ponto nem domínio
  P.entradas.forEach(e=>{
    if(celulasDe(e).every(([r,c])=>resp[r][c]===P.g[r][c])){e.suja=true}
  });
}
function montar(tam,seed){
  prioridades();
  P=gerar(B,tam,seed);
  if(!P){aviso('Banco insuficiente para essa grade');return}
  P.entradas.forEach(e=>{e.resolvida=false;e.suja=false});
  resp=P.g.map(l=>l.map(x=>x?'':null));
  marcas=P.g.map(l=>l.map(()=>''));
  trava=P.g.map(l=>l.map(()=>false));
  pontos=0;revelacoes=0;verificacoes=0;fim=false;tempo=0;tamAtual=tam;seedAtual=seed;
  $('f-grade').textContent=P.W+'×'+P.H;
  const md=Math.round(P.entradas.reduce((s,e)=>s+e.verbete.dif,0)/P.entradas.length);
  $('f-nivel').textContent='■'.repeat(md)+'□'.repeat(4-md);
  cel=Math.max(20,Math.min(32,Math.floor((Math.min(window.innerWidth,560)-30)/P.W)));
  darBrindes();aplicarCel();render();listar();checarPalavras();
  const p=P.entradas[0];cur={r:p.r,c:p.c};dir=p.dir;atualizar();
  clearInterval(timer);timer=setInterval(tique,1000);
}
function aplicarCel(){document.documentElement.style.setProperty('--cel',cel+'px')}

function render(){
  const el=$('grade');
  el.style.gridTemplateColumns=`repeat(${P.W}, var(--cel))`;
  el.innerHTML='';
  for(let r=0;r<P.H;r++)for(let c=0;c<P.W;c++){
    const d=document.createElement('div');
    if(!P.g[r][c])d.className='cel bloco';
    else{
      d.className='cel';d.dataset.r=r;d.dataset.c=c;
      if(P.numeros[r][c])d.innerHTML='<span class="num">'+P.numeros[r][c]+'</span>';
      const s=document.createElement('span');s.className='letra';d.appendChild(s);
      d.addEventListener('click',()=>tocar(r,c));
    }
    el.appendChild(d);
  }
  pintar();
}
const celula=(r,c)=>document.querySelector(`.cel[data-r="${r}"][data-c="${c}"]`);
const dentroDe=(e,r,c)=>{const dr=e.dir==='V'?1:0,dc=e.dir==='H'?1:0;
  for(let i=0;i<e.palavra.length;i++)if(e.r+dr*i===r&&e.c+dc*i===c)return true;return false};
const celulasDe=e=>{const dr=e.dir==='V'?1:0,dc=e.dir==='H'?1:0,o=[];
  for(let i=0;i<e.palavra.length;i++)o.push([e.r+dr*i,e.c+dc*i]);return o};
const entradaAtual=()=>P.entradas.find(e=>e.dir===dir&&dentroDe(e,cur.r,cur.c))
  ||P.entradas.find(e=>dentroDe(e,cur.r,cur.c));

function tocar(r,c){
  if(cur.r===r&&cur.c===c){
    const o=dir==='H'?'V':'H';
    if(P.entradas.some(e=>e.dir===o&&dentroDe(e,r,c)))dir=o;
  }else{
    cur={r,c};
    if(!P.entradas.some(e=>e.dir===dir&&dentroDe(e,r,c)))dir=dir==='H'?'V':'H';
  }
  atualizar();
}
function pintar(){
  document.querySelectorAll('.cel[data-r]').forEach(d=>{
    const r=+d.dataset.r,c=+d.dataset.c;
    d.className='cel';
    d.querySelector('.letra').textContent=resp[r][c]||'';
    if(trava[r][c])d.classList.add('travado');
    if(brinde[r]&&brinde[r][c])d.classList.add('brinde');
    if(marcas[r][c])d.classList.add(marcas[r][c]);
  });
  const e=entradaAtual();if(!e)return;
  celulasDe(e).forEach(([r,c])=>celula(r,c).classList.add('palavra-ativa'));
  const a=celula(cur.r,cur.c);a.classList.add('cel-ativa');
  a.scrollIntoView({block:'nearest',inline:'nearest'});
}
function atualizar(){
  pintar();
  const e=entradaAtual();if(!e)return;
  $('dica-tag').classList.remove('ok');
  $('dica-txt').classList.remove('expl');
  document.querySelector('.dica').classList.remove('resolvida');
  $('bt-flag').classList.toggle('on',defeitos.some(d=>d.id===e.verbete.id));
  $('dica-tag').textContent=e.n+' '+(e.dir==='H'?'HORIZONTAL':'VERTICAL')
    +' · '+e.palavra.length+' letras · nível '+e.verbete.dif+' · vale '+(e.verbete.dif*10)+' pts';
  $('dica-txt').textContent=e.verbete.dica;
  document.querySelectorAll('.pista').forEach(p=>p.classList.remove('ativa'));
  const p=document.querySelector(`.pista[data-k="${e.n}${e.dir}"]`);
  if(p)p.classList.add('ativa');
}
function listar(){
  ['H','V'].forEach(d=>{
    const alvo=$(d==='H'?'lista-h':'lista-v');alvo.innerHTML='';
    P.entradas.filter(e=>e.dir===d).sort((a,b)=>a.n-b.n).forEach(e=>{
      const div=document.createElement('div');
      div.className='pista';div.dataset.k=e.n+e.dir;
      div.innerHTML='<b>'+e.n+'</b><span>'+e.verbete.dica+' <i>('+e.palavra.length+')</i></span>';
      div.addEventListener('click',()=>{cur={r:e.r,c:e.c};dir=e.dir;atualizar()});
      alvo.appendChild(div);
    });
  });
  placar();
}
function guardar(){
  if(fim)return;
  clearTimeout(salvarT);
  salvarT=setTimeout(()=>Store.set(CHAVE_G,{
    tam:tamAtual,seed:seedAtual,resp,pontos,rev:revelacoes,ver:verificacoes,tempo,
    sujas:P.entradas.filter(e=>e.suja).map(e=>e.n+e.dir)
  }),400);
}
function restaurar(d){
  montar(d.tam,d.seed);
  if(!P)return false;
  if(!d.resp||d.resp.length!==P.H)return false;
  resp=d.resp;brinde=P.g.map(l=>l.map(()=>false));pontos=d.pontos||0;revelacoes=d.rev||0;verificacoes=d.ver||0;tempo=d.tempo||0;
  const sj=new Set(d.sujas||[]);
  P.entradas.forEach(e=>{
    e.suja=sj.has(e.n+e.dir);
    if(celulasDe(e).every(([r,c])=>resp[r][c]===P.g[r][c])){
      e.resolvida=true;
      celulasDe(e).forEach(([r,c])=>trava[r][c]=true);
      const p=document.querySelector(`.pista[data-k="${e.n}${e.dir}"]`);
      if(p){p.classList.add('feita');
        if(!p.querySelector('.pag')){const i=document.createElement('i');
          i.className='pag';i.textContent='p.'+e.verbete.fonte.pagina;p.appendChild(i)}}
    }
  });
  proximaAberta();pintar();placar();
  const falta=P.entradas.filter(e=>!e.resolvida).length;
  if(falta)aviso('Retomando · faltam '+falta+' palavras');
  return true;
}
function placar(){
  const total=P.g.flat().filter(x=>x!==null).length;
  const cheias=resp.flat().filter(x=>x).length;
  $('barra').style.width=(100*cheias/total).toFixed(0)+'%';
  $('f-pontos').textContent=pontos+' pts';
  const noPonto=B.filter(v=>dominados.has(v.id)).length;
  $('f-dom').textContent=noPonto+'/'+B.length+' dominados';
}

function digitar(L){
  if(fim)return;
  if(!resp[cur.r]||resp[cur.r][cur.c]===null)return;
  if(trava[cur.r][cur.c]){avancar(1);return}
  resp[cur.r][cur.c]=L;marcas[cur.r][cur.c]='';
  avancar(1);checarPalavras();checarFim();
}
function apagar(){
  if(fim)return;
  if(trava[cur.r][cur.c]){avancar(-1);return}
  if(resp[cur.r][cur.c]){resp[cur.r][cur.c]='';marcas[cur.r][cur.c]=''}
  else{avancar(-1);if(!trava[cur.r][cur.c]){resp[cur.r][cur.c]='';marcas[cur.r][cur.c]=''}}
  atualizar();placar();guardar();
}
function avancar(n){
  const e=entradaAtual();if(!e)return;
  const cs=celulasDe(e);
  let i=cs.findIndex(([r,c])=>r===cur.r&&c===cur.c)+n;
  if(i<0)i=0;if(i>=cs.length)i=cs.length-1;
  cur={r:cs[i][0],c:cs[i][1]};atualizar();
}
function pularEntrada(n){
  let i=P.entradas.indexOf(entradaAtual())+n;
  i=(i+P.entradas.length)%P.entradas.length;
  const e=P.entradas[i];cur={r:e.r,c:e.c};dir=e.dir;atualizar();
}
function proximaAberta(){
  const ini=P.entradas.indexOf(entradaAtual());
  for(let k=1;k<=P.entradas.length;k++){
    const e=P.entradas[(ini+k)%P.entradas.length];
    if(!e.resolvida){cur={r:e.r,c:e.c};dir=e.dir;atualizar();return}
  }
}
function checarPalavras(){
  let fechou=null;
  P.entradas.forEach(e=>{
    if(e.resolvida)return;
    const cs=celulasDe(e);
    if(!cs.every(([r,c])=>resp[r][c]===P.g[r][c]))return;
    e.resolvida=true;
    cs.forEach(([r,c])=>{trava[r][c]=true;marcas[r][c]=''});
    const pts=e.suja?0:e.verbete.dif*10;
    pontos+=pts;
    if(!e.suja){dominados.add(e.verbete.id);Store.set(CHAVE_DOM,[...dominados])}
    const p=document.querySelector(`.pista[data-k="${e.n}${e.dir}"]`);
    if(p){p.classList.add('feita');
      if(!p.querySelector('.pag')){
        const i=document.createElement('i');i.className='pag';
        i.textContent='p.'+e.verbete.fonte.pagina;p.appendChild(i)}}
    fechou={e,pts};
  });
  if(fechou){
    const v=fechou.e.verbete;
    aviso('✓ '+v.display+' · p. '+v.fonte.pagina+(fechou.pts?'  +'+fechou.pts+' pts':''));
    if(v.expl){
      $('dica-tag').textContent='✓ '+v.display.toUpperCase()+' · SUBITEM '+v.subitem+' · P. '+v.fonte.pagina;
      $('dica-tag').classList.add('ok');
      $('dica-txt').textContent=v.expl;
      $('dica-txt').classList.add('expl');
      document.querySelector('.dica').classList.add('resolvida');
    } else if(entradaAtual().resolvida) proximaAberta();
  }
  pintar();placar();guardar();
}
function marcarDefeito(){
  const e=entradaAtual();if(!e)return;const v=e.verbete;
  const i=defeitos.findIndex(d=>d.id===v.id);
  if(i>=0){defeitos.splice(i,1);aviso('Marca removida')}
  else{defeitos.push({id:v.id,resp:v.display,dica:v.dica,sub:v.subitem,pag:v.fonte.pagina});
       aviso('Dica marcada para revisão: '+v.display)}
  Store.set(CHAVE_D,defeitos);
  $('bt-flag').classList.toggle('on',i<0);
}
function verDefeitos(){
  const l=$('lista-gab');
  l.innerHTML = defeitos.length
    ? '<p style="font-size:12.5px">Copie e envie para correção das dicas:</p><pre style="white-space:pre-wrap;font-size:12px;border:1px solid #ccc;padding:8px">'
      + defeitos.map(d=>`${d.resp} | subitem ${d.sub} | p.${d.pag}\n  dica: ${d.dica}`).join('\n\n')
      + '</pre><button class="bt" id="bt-limpar">Limpar lista</button>'
    : '<p>Nenhuma dica marcada.</p>';
  $('folha').classList.add('aberta');
  const b=$('bt-limpar');
  if(b)b.onclick=()=>{defeitos=[];Store.set(CHAVE_D,[]);verDefeitos()};
}
function verificar(){
  if(fim)return;
  verificacoes++;pontos=Math.max(0,pontos-15);
  let err=0,vaz=0;
  for(let r=0;r<P.H;r++)for(let c=0;c<P.W;c++){
    if(resp[r][c]===null||trava[r][c])continue;
    if(!resp[r][c]){vaz++;continue}
    if(resp[r][c]!==P.g[r][c]){marcas[r][c]='erro';err++}
  }
  pintar();placar();guardar();
  aviso((err?err+' letra(s) errada(s)':vaz?'Sem erros até aqui':'Tudo certo')+' · −15 pts');
}
function revelarLetra(){
  if(fim||trava[cur.r][cur.c])return;
  const e=entradaAtual();if(e)e.suja=true;
  revelacoes++;
  resp[cur.r][cur.c]=P.g[cur.r][cur.c];
  marcas[cur.r][cur.c]='revelado';
  avancar(1);checarPalavras();checarFim();
}
function revelarPalavra(){
  if(fim)return;
  const e=entradaAtual();if(!e||e.resolvida)return;
  e.suja=true;revelacoes++;
  celulasDe(e).forEach(([r,c])=>{if(!resp[r][c]||resp[r][c]!==P.g[r][c]){
    resp[r][c]=P.g[r][c];marcas[r][c]='revelado'}});
  checarPalavras();checarFim();
}
function checarFim(){
  if(fim||!P.entradas.every(e=>e.resolvida))return;
  fim=true;clearInterval(timer);
  const limpa=revelacoes===0&&verificacoes===0;
  let med='Bronze';
  if(limpa)med='Ouro';
  else if(revelacoes===0)med='Prata';
  $('s-medalha').textContent=med;
  $('s-limpa').style.display=limpa?'block':'none';
  $('s-pontos').textContent=pontos;
  $('s-tempo').textContent=mmss(tempo);
  $('s-rev').textContent=revelacoes;
  $('s-ver').textContent=verificacoes;
  $('s-dom').textContent=B.filter(v=>dominados.has(v.id)).length+'/'+B.length;
  $('selo-fim').classList.add('aberta');
  Store.set(CHAVE_G,null);
}
const mmss=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
function tique(){ if(!fim)tempo++; }
let msgT;
function aviso(t){const m=$('msg');m.textContent=t;m.classList.add('ver');
  clearTimeout(msgT);msgT=setTimeout(()=>m.classList.remove('ver'),2600)}

function itensGabarito(){
  let h='';
  ['H','V'].forEach(d=>{
    h+='<h3 style="font-family:Barlow Condensed;font-weight:700;letter-spacing:.12em;text-transform:uppercase;border-bottom:2px solid #15130e;margin:14px 0 4px;padding-bottom:2px">'
      +(d==='H'?'Horizontais':'Verticais')+'</h3>';
    P.entradas.filter(e=>e.dir===d).sort((a,b)=>a.n-b.n).forEach(e=>{
      const v=e.verbete;
      h+='<div class="item"><div class="item-cab"><span class="item-n">'+e.n+e.dir+'</span>'
       +'<span class="item-r">'+v.display+'</span></div>'
       +'<div class="item-d">'+v.dica+'</div>'
       +'<div class="item-f">'+v.subitem+((SUBITENS[v.subitem]&&SUBITENS[v.subitem].t)?' '+SUBITENS[v.subitem].t:'')+' · '+v.fonte.obra+', p. '+v.fonte.pagina+'</div></div>';
    });
  });
  return h;
}
function abrirGabarito(){$('lista-gab').innerHTML=itensGabarito();$('folha').classList.add('aberta')}
function imprimir(){
  $('impressao-gabarito').innerHTML=
    '<h2 style="font-family:Archivo Black;font-size:15pt;text-transform:uppercase;margin:0 0 6pt">Gabarito</h2>'
    +'<div style="border:1.5pt solid #000;padding:5pt;margin-bottom:8pt;font-size:9pt">'
    +'Respostas extraídas do Tratado de Anestesiologia SAESP. Página do PDF enviado.</div>'
    +'<div style="column-count:2;column-gap:8mm">'+itensGabarito()+'</div>';
  window.print();
}

const LIN=['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
(function(){const t=$('teclado');
  LIN.forEach((ln,i)=>{
    const d=document.createElement('div');d.className='linha';
    ln.split('').forEach(k=>{const b=document.createElement('button');
      b.className='tecla';b.textContent=k;b.addEventListener('click',()=>digitar(k));d.appendChild(b)});
    if(i===2){const b=document.createElement('button');b.className='tecla larga';
      b.textContent='⌫';b.setAttribute('aria-label','Apagar');b.addEventListener('click',apagar);d.appendChild(b)}
    t.appendChild(d);
  });
})();
document.addEventListener('keydown',ev=>{
  if($('folha').classList.contains('aberta'))return;
  const k=ev.key.toUpperCase();
  if(/^[A-Z]$/.test(k)){digitar(k);ev.preventDefault()}
  else if(ev.key==='Backspace'){apagar();ev.preventDefault()}
  else if(ev.key==='Tab'){pularEntrada(ev.shiftKey?-1:1);ev.preventDefault()}
  else if(ev.key===' '){dir=dir==='H'?'V':'H';atualizar();ev.preventDefault()}
});
$('bt-flag').onclick=marcarDefeito;
$('bt-defeitos').onclick=verDefeitos;
['sel-foco','sel-sub','sel-brinde','ck-viciar'].forEach(id=>$(id).onchange=()=>{
  Store.set(CHAVE_G,null);montar(+$('sel-tam').value,Date.now()%100000)});
$('bt-verificar').onclick=verificar;
$('bt-letra').onclick=revelarLetra;
$('bt-palavra').onclick=revelarPalavra;
$('bt-gabarito').onclick=abrirGabarito;
$('bt-imprimir').onclick=imprimir;
$('bt-fechar').onclick=()=>$('folha').classList.remove('aberta');
$('s-fechar').onclick=()=>$('selo-fim').classList.remove('aberta');
$('bt-nova').onclick=()=>{Store.set(CHAVE_G,null);montar(+$('sel-tam').value,Date.now()%100000)};
$('sel-tam').onchange=()=>{Store.set(CHAVE_G,null);montar(+$('sel-tam').value,Date.now()%100000)};
$('bt-mais').onclick=()=>{cel=Math.min(46,cel+3);aplicarCel()};
$('bt-menos').onclick=()=>{cel=Math.max(18,cel-3);aplicarCel()};
$('nav-ant').onclick=()=>pularEntrada(-1);
$('nav-prox').onclick=()=>pularEntrada(1);

async function carregarEdicao(id){
  let metas, tema, chaveId;
  if(id==='__mix__'){
    metas=INDICE; chaveId='mix';
    tema='Grade aleatória · '+INDICE.length+(INDICE.length>1?' edições':' edição');
  }else{
    const m=INDICE.find(e=>e.id===id)||INDICE[0];
    metas=[m]; chaveId=m.id; tema=m.tema;
  }
  EDICAO={id:chaveId, tema};
  B=[];
  const vistos=new Set();
  for(const m of metas){
    const r=await fetch('dados/'+m.arquivo,{cache:'no-cache'});
    if(!r.ok) throw new Error('não consegui carregar '+m.arquivo);
    for(const v of await r.json()){
      if(vistos.has(v.grade)) continue;      // mesma resposta em duas edições entra uma vez só
      vistos.add(v.grade);
      B.push({id:m.id+':'+v.grade, g:v.grade, display:v.display, dica:v.dica,
              dif:v.dif, subitem:v.subitem, expl:v.expl||'',
              fonte:{obra:v.fonte.obra, pagina:v.fonte.pagina, termo:v.fonte.termo||v.display}});
    }
  }
  CHAVE_G='cruzadas:'+chaveId+':grade';
  CHAVE_D='cruzadas:'+chaveId+':defeitos';
  $('f-tema-txt').textContent=tema;
  document.title=tema+' · Cruzadas SBA';
  dominados=new Set(await Store.get(CHAVE_DOM) || []);
  defeitos =await Store.get(CHAVE_D) || [];

  // filtro de subitem com o nome do subitem, ordenado por número
  const sel=$('sel-sub'); sel.innerHTML='<option value="">Dificuldade e subitem: todos</option>';
  const num=c=>c.split('.').map(Number);
  [...new Set(B.map(v=>v.subitem))].sort((a,b)=>{
    const x=num(a),y=num(b);
    for(let i=0;i<Math.max(x.length,y.length);i++){
      if((x[i]||0)!==(y[i]||0)) return (x[i]||0)-(y[i]||0);
    }
    return 0;
  }).forEach(sb=>{
    const o=document.createElement('option'); o.value=sb;
    const nome=(SUBITENS[sb]&&SUBITENS[sb].t)||'';
    const curto=nome.length>40?nome.slice(0,40)+'…':nome;
    o.textContent=sb+(curto?' '+curto:'')+' ('+B.filter(v=>v.subitem===sb).length+')';
    sel.appendChild(o);
  });

  await Store.set('cruzadas:ultima', chaveId);
  const g=await Store.get(CHAVE_G);
  if(g && g.seed!==undefined && restaurar(g)){ $('sel-tam').value=g.tam; return; }
  montar(+$('sel-tam').value||19, Date.now()%100000);
}

let INDICE=[];
(async function(){
  const url = new URL('dados/indice.json', location.href).href;
  try{
    const r = await fetch(url, {cache:'no-cache'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    INDICE = await r.json();
    if(!Array.isArray(INDICE) || !INDICE.length) throw new Error('índice vazio');
  }catch(e){
    const arquivo = location.protocol === 'file:';
    document.body.insertAdjacentHTML('afterbegin',
      '<div style="padding:14px;font-family:system-ui;line-height:1.5;background:#fff;border-bottom:3px solid #cc1122">'
      + '<b style="color:#cc1122">Não consegui carregar as edições.</b><br>'
      + 'Tentei ler: <code>'+url+'</code><br>Resultado: <b>'+e.message+'</b><br><br>'
      + (arquivo
          ? 'Você abriu o arquivo por duplo clique. O navegador bloqueia leitura de dados assim. '
            + 'Rode <code>python3 -m http.server</code> na pasta do site e abra <code>http://localhost:8000</code>.'
          : 'O site está sendo servido, então o problema é o arquivo em si. Confira no repositório se existe a pasta '
            + '<code>dados</code> com <code>indice.json</code> e os bancos dentro dela. '
            + 'No GitHub, use <b>Add file → Create new file</b> e digite <code>dados/indice.json</code> no nome: '
            + 'a barra cria a pasta.')
      + '</div>');
    return;
  }
  try{
    const rs=await fetch(new URL('dados/subitens.json',location.href).href,{cache:'no-cache'});
    if(rs.ok) SUBITENS=await rs.json();
  }catch(e){ SUBITENS={}; }

  const sel=$('sel-edicao'); sel.innerHTML='';
  if(INDICE.length>1){
    const o=document.createElement('option');
    o.value='__mix__'; o.textContent='Grade aleatória — todos os Pontos';
    sel.appendChild(o);
  }
  INDICE.forEach(e=>{const o=document.createElement('option');
    o.value=e.id; o.textContent=e.tema+' ('+e.n+')'; sel.appendChild(o)});
  sel.onchange=()=>carregarEdicao(sel.value);
  const ultima = await Store.get('cruzadas:ultima');
  const alvo = (ultima==='mix'&&INDICE.length>1) ? '__mix__'
    : (INDICE.some(e=>e.id===ultima) ? ultima : INDICE[0].id);
  sel.value = alvo;
  await carregarEdicao(alvo);
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
