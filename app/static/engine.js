/* Talda analytics engine (generator, statistics, findings, views). */

/* ============================================================
   1. Curriculum: 7th-grade algebra, 102 hours, misconceptions
   ============================================================ */
const TOPIC_DEF = [
 // id, name, hours, prerequisites, difficulty, hours-effect(true), inheritance, misconceptions[[text, example]]
 ['T1','Рациональные числа',10,[],-1.1,.10,.0,[['Сравнивает отрицательные числа по модулю','−5 > −2'],['Теряет знак при вычитании отрицательного','7 − (−3) = 4'],['Путает противоположное и обратное число','обратное к 4 — это −4']]],
 ['T2','Дроби и действия с ними',10,['T1'],-.2,.5,.45,[['Складывает числители и знаменатели','1/2 + 1/3 = 2/5'],['При делении переворачивает делимое','(2/3):(4/5) = (3/2)·(4/5)'],['Сокращает слагаемые, а не множители','(3 + x)/3 = x']]],
 ['T3','Проценты и пропорции',8,['T2'],.1,.4,.55,[['Берёт процент от неверной базы','рост с 80 до 100 — «на 20%»'],['Считает, что +20% и −20% компенсируют друг друга','100 → 120 → 100'],['Путает прямую и обратную пропорциональность','3 рабочих — 6 дней, 6 рабочих — 12 дней']]],
 ['T4','Степень с натуральным показателем',8,['T1'],-.6,.15,.35,[['Перемножает показатели при умножении степеней','a³·a² = a⁶'],['Теряет знак при возведении в степень','(−3)² = −9'],['Считает, что a⁰ = 0','5⁰ = 0']]],
 ['T5','Многочлены',10,['T4'],.2,.5,.6,[['Складывает неподобные члены','3x + 2x² = 5x³'],['Не меняет знаки при раскрытии скобок с минусом','−(x − 4) = −x − 4'],['Умножает только первый член многочлена','2(x + 3) = 2x + 3']]],
 ['T6','Формулы сокращённого умножения',10,['T5'],.6,.9,.75,[['Возводит сумму в квадрат почленно','(a + b)² = a² + b²'],['Теряет удвоенное произведение','(x + 3)² = x² + 3x + 9'],['Путает разность квадратов и квадрат разности','a² − b² = (a − b)²']]],
 ['T7','Линейные уравнения',8,['T2'],-.1,.4,.8,[['Переносит слагаемое без смены знака','x + 5 = 12 → x = 17'],['Вычитает коэффициент вместо деления','3x = 12 → x = 9'],['Ошибается при раскрытии скобок','2(x − 1) = 6 → 2x − 1 = 6']]],
 ['T8','Системы линейных уравнений',10,['T7'],.5,.7,.6,[['Находит только одну переменную','ответ: x = 2'],['Ошибка знака при вычитании уравнений','(2x + y) − (x − y) = x'],['Подставляет значение не в то уравнение','y = 3 → в выражение для y']]],
 ['T9','Линейная функция и её график',8,['T7'],.7,.8,.7,[['Путает угловой коэффициент k и свободный член b','y = 2x + 5: «наклон равен 5»'],['Считает, что при k > 0 функция убывает','y = 3x − 1 — «убывает»'],['Меняет местами координаты точки','(2; 5): x = 5, y = 2']]],
 ['T10','Линейные неравенства',6,['T7'],.3,.5,.55,[['Не меняет знак при делении на отрицательное','−2x > 6 → x > −3'],['Включает границу в строгое неравенство','x > 3 → [3; +∞)'],['Отвечает одним числом, как в уравнении','x > 3 → «ответ: 3»']]],
 ['T11','Статистика и вероятность',6,['T3'],-.2,.1,.35,[['Путает среднее и медиану','«медиана — это среднее»'],['Не упорядочивает ряд при поиске медианы','медиана 5, 1, 9 = 1'],['Получает вероятность больше 1','P = 6/4']]],
 ['T12','Текстовые задачи',8,['T3','T7'],1.0,1.0,.7,[['Неверно переводит условие в уравнение','«на 5 больше» → 5x'],['Не переводит единицы измерения','км и м в одном уравнении'],['Отвечает не на вопрос задачи','нашёл скорость вместо времени']]],
];
const DISTRICTS = [['г. Тараз',true,20],['Байзакский',false,8],['Жамбылский',false,7],['Жуалынский',false,6],['Кордайский',false,8],['Меркенский',false,6],['Мойынкумский',false,5],['Сарысуский',false,5],['Таласский',false,5],['Шуский',false,6],['им. Т. Рыскулова',false,6]];
// Hidden truths planted in the demo data (the system must find them on its own)
const TB_EFF = {A:{T8:.35}, B:{T12:.4,T5:-.1}, C:{T6:-.85,T1:.1}};
const KZ_B_T9 = -1.15;

/* ============================================================
   2. Utilities
   ============================================================ */
const $ = s => document.querySelector(s);
const sig = x => 1/(1+Math.exp(-x));
const logit = p => Math.log(p/(1-p));
const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
const pct = p => (p==null||isNaN(p)) ? '—' : Math.round(p*100)+'%';
const fx = (x,d=1) => (x>0?'+':x<0?'−':'')+Math.abs(x).toFixed(d);
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rng(seed){ let a=seed>>>0; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function gauss(r){ let u=0; while(!u) u=r(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*r()); }
const tbName = x => 'Учебник '+x;
const ru3 = (n,one,few,many) => { const a=n%10, b=n%100; return a===1&&b!==11?one : a>=2&&a<=4&&(b<12||b>14)?few : many; };
const LANG_FULL = {kz:'казахский', ru:'русский'};
const LANG_SHORT = {kz:'каз.', ru:'рус.'};
const TB_COLOR = x => ({A:'var(--c-a)',B:'var(--c-b)',C:'var(--c-c)'}[x] || 'var(--muted)');
function heat(p){
  const t = clamp((p-0.35)/0.5,0,1);
  const c = t<.5 ? `color-mix(in oklab, var(--warn) ${Math.round(t*200)}%, var(--bad))` : `color-mix(in oklab, var(--good) ${Math.round((t-.5)*200)}%, var(--warn))`;
  return `color-mix(in oklab, ${c} 50%, var(--surface))`;
}
function divColor(pp){ // negative = Kazakh-medium classes lower
  const a = Math.round(clamp(Math.abs(pp)*4.5,0,75));
  return `color-mix(in oklab, ${pp<0?'var(--bad)':'var(--accent)'} ${a}%, var(--surface))`;
}

/* ============================================================
   3. Demo data generator (synthetic, Zhambyl region shaped)
   ============================================================ */
function buildTopics(){
  return TOPIC_DEF.map(([id,name,h,pre,d,beta,inh,mis])=>({id,name,h,pre,d,beta,inh,mis:mis.map(m=>m[0]),ex:mis.map(m=>m[1])}));
}
function generate(seed){
  const r = rng(seed), topics = buildTopics();
  const schools=[], students=[], stu=[], item=[], opt=[];
  const items=[]; topics.forEach((t,ti)=>{ for(let k=0;k<3;k++) items.push({id:`${t.id}.${k+1}`, t:ti, off:(k-1)*.45}); });
  const used=new Set();
  DISTRICTS.forEach(([d,urban,n])=>{
    for(let i=0;i<n;i++){
      let num; do{ num=1+Math.floor(r()*(urban?60:40)); }while(used.has(d+num)); used.add(d+num);
      const area=urban?'urban':'rural', small=!urban && i>0 && r()<.45;
      const lang = r() < (urban?.5:.8) ? 'kz':'ru';
      const u=r(), tb = urban ? (u<.6?'A':u<.85?'B':'C') : (u<.2?'A':u<.65?'B':'C');
      const eff = (urban?.35:0) - (small?.25:0) - (lang==='kz'?.12:0) + .3*gauss(r);
      const prev = clamp(Math.round(55 + 14*eff + 4*gauss(r)),20,95);
      const hours={}; topics.forEach(t=> hours[t.id]=Math.max(3, t.h + Math.round(r()*6-3)));
      schools.push({id:'S'+(schools.length+1), name:`${small?'МКШ':'СШ'} №${num}`, district:d, area, small, lang, tb, prev, hours, _eff:eff});
    }
  });
  schools.forEach((sc,si)=>{
    const nStu = sc.small ? 8+Math.floor(r()*12) : sc.area==='rural' ? 22+Math.floor(r()*22) : 40+Math.floor(r()*30);
    for(let k=0;k<nStu;k++){
      const st = students.length; students.push({id:`${sc.id}-${k+1}`, s:si});
      const theta = sc._eff + .9*gauss(r), skill={};
      topics.forEach(t=>{ const pre = t.pre.length ? t.pre.reduce((a,p)=>a+skill[p],0)/t.pre.length : 0; skill[t.id] = t.inh*pre + .8*gauss(r); });
      topics.forEach((t,ti)=>{
        let base = .9*theta + .6*skill[t.id] - t.d + ((TB_EFF[sc.tb]||{})[t.id]||0) + t.beta*Math.log(sc.hours[t.id]/t.h) + .25;
        if(sc.lang==='kz' && sc.area==='rural') base -= .08;
        const planted = sc.lang==='kz' && sc.tb==='B' && t.id==='T9';
        if(planted) base += KZ_B_T9;
        const w = planted ? [.82,.1,.08] : (sc.tb==='C' && t.id==='T6') ? [.78,.14,.08] : [.5,.3,.2];
        for(let k=0;k<3;k++){
          const p = sig(base - (k-1)*.45);
          let o = 0;
          if(r() >= p){ const u=r(); o = u<w[0]?1:u<w[0]+w[1]?2:3; }
          stu.push(st); item.push(ti*3+k); opt.push(o);
        }
      });
    }
  });
  return { source:'demo', seed, topics, items, schools:schools.map(({_eff,...s})=>s), students,
           resp:{stu:Int32Array.from(stu), item:Int32Array.from(item), opt:Uint8Array.from(opt), n:stu.length} };
}

/* ============================================================
   4. Statistics: OLS with covariance, contrasts
   ============================================================ */
function invert(M){
  const n=M.length, A=M.map((r,i)=>[...r,...Array.from({length:n},(_,j)=>i===j?1:0)]);
  for(let c=0;c<n;c++){
    let piv=c; for(let r=c+1;r<n;r++) if(Math.abs(A[r][c])>Math.abs(A[piv][c])) piv=r;
    if(Math.abs(A[piv][c])<1e-10) return null;
    [A[c],A[piv]]=[A[piv],A[c]];
    const d=A[c][c]; for(let j=0;j<2*n;j++) A[c][j]/=d;
    for(let r=0;r<n;r++) if(r!==c){ const f=A[r][c]; if(f) for(let j=0;j<2*n;j++) A[r][j]-=f*A[c][j]; }
  }
  return A.map(r=>r.slice(n));
}
function regress(rows, cols){
  const use = cols.filter(c=>{ let mn=Infinity,mx=-Infinity; for(const r of rows){ const v=r[c]; if(v<mn)mn=v; if(v>mx)mx=v; } return mx>mn; });
  const p=use.length+1, n=rows.length; if(n<p+3) return null;
  const xs=rows.map(r=>[1,...use.map(c=>r[c])]);
  const XtX=Array.from({length:p},()=>new Array(p).fill(0)), Xty=new Array(p).fill(0);
  xs.forEach((x,i)=>{ const y=rows[i].y; for(let a=0;a<p;a++){ Xty[a]+=x[a]*y; for(let b=0;b<p;b++) XtX[a][b]+=x[a]*x[b]; } });
  const inv=invert(XtX); if(!inv) return null;
  const beta=inv.map(row=>row.reduce((s,v,j)=>s+v*Xty[j],0));
  let rss=0; xs.forEach((x,i)=>{ const e=rows[i].y-x.reduce((s,v,j)=>s+v*beta[j],0); rss+=e*e; });
  const s2=rss/(n-p);
  return {names:['_c',...use], beta, cov:inv.map(r=>r.map(v=>v*s2)), n};
}
function lin(m, w){
  if(!m) return null;
  const idx={}; m.names.forEach((nm,i)=>idx[nm]=i);
  const ks=Object.keys(w).filter(k=>w[k]!==0);
  if(ks.some(k=>!(k in idx))) return null;
  let b=0,v=0;
  for(const a of ks){ b+=w[a]*m.beta[idx[a]]; for(const c of ks) v+=w[a]*w[c]*m.cov[idx[a]][idx[c]]; }
  return {b, se:Math.sqrt(Math.max(v,1e-12))};
}
function toPP(p, e){ // logit effect at base rate p -> percentage points with 95% CI
  if(!e) return null; const L=logit(clamp(p,.02,.98));
  return {...e, z:e.b/e.se, pp:(sig(L+e.b)-p)*100, lo:(sig(L+e.b-1.96*e.se)-p)*100, hi:(sig(L+e.b+1.96*e.se)-p)*100};
}
const median = a => { const s=[...a].sort((x,y)=>x-y); const m=s.length>>1; return s.length? (s.length%2?s[m]:(s[m-1]+s[m])/2) : 0; };

/* ============================================================
   5. Analysis engine
   ============================================================ */
function analyze(DS){
  const T=DS.topics, S=DS.schools, nT=T.length, R=DS.resp;
  const tbs=[...new Set(S.map(s=>s.tb))].sort(), ref=tbs[0];
  const langs=[...new Set(S.map(s=>s.lang))].sort();
  const sc=S.map(()=>({c:new Array(nT).fill(0), n:new Array(nT).fill(0)}));
  const nStu=DS.students.length, stuC=new Uint8Array(nStu*nT), stuN=new Uint8Array(nStu*nT);
  const mis=T.map(()=>({}));
  for(let i=0;i<R.n;i++){
    const st=R.stu[i], ti=DS.items[R.item[i]].t, si=DS.students[st].s, o=R.opt[i];
    sc[si].n[ti]++; stuN[st*nT+ti]++;
    if(o===0){ sc[si].c[ti]++; stuC[st*nT+ti]++; }
    const key=S[si].tb+'|'+S[si].lang; (mis[ti][key] ||= [0,0,0,0])[o]++;
  }
  const sumBy = (filter) => { const c=new Array(nT).fill(0), n=new Array(nT).fill(0); S.forEach((s,si)=>{ if(filter(s)) for(let t=0;t<nT;t++){ c[t]+=sc[si].c[t]; n[t]+=sc[si].n[t]; } }); return c.map((v,t)=>n[t]?v/n[t]:null); };
  const topicP = sumBy(()=>true);
  const districts=[...new Set(S.map(s=>s.district))];
  const distP = Object.fromEntries(districts.map(d=>[d,sumBy(s=>s.district===d)]));
  const tbP = Object.fromEntries(tbs.map(x=>[x,sumBy(s=>s.tb===x)]));
  const allP = (()=>{ let c=0,n=0; sc.forEach(x=>{ x.c.forEach(v=>c+=v); x.n.forEach(v=>n+=v); }); return c/n; })();

  // school covariates
  const prevMean = S.reduce((a,s)=>a+s.prev,0)/S.length, prevSd = Math.sqrt(S.reduce((a,s)=>a+(s.prev-prevMean)**2,0)/S.length)||1;
  const medH = T.map(t=>median(S.map(s=>s.hours[t.id]||t.h)));
  const cov = (s,si) => { const o={kz:s.lang==='kz'?1:0, rural:s.area==='rural'?1:0, small:s.small?1:0, prevZ:(s.prev-prevMean)/prevSd};
    tbs.slice(1).forEach(x=>{ o['tb:'+x]=s.tb===x?1:0; o['kz×tb:'+x]=(s.tb===x&&s.lang==='kz')?1:0; }); return o; };
  const tbCols = tbs.slice(1).map(x=>'tb:'+x), intCols = tbs.slice(1).map(x=>'kz×tb:'+x);
  const contrastW = (X, prefix='') => { const k=tbs.length, w={}; tbs.slice(1).forEach(Y=>{ w[prefix+'tb:'+Y]=(Y===X?1:0)-(Y!==X?1/(k-1):0); }); return w; };

  // per-topic models
  const models = T.map((t,ti)=>{
    const rows=[]; S.forEach((s,si)=>{ const n=sc[si].n[ti]; if(!n) return; const c=sc[si].c[ti];
      rows.push({y:logit((c+.5)/(n+1)), lnh:Math.log((s.hours[t.id]||t.h)/medH[ti]), ...cov(s,si)}); });
    return { main: regress(rows,[...tbCols,'kz','rural','small','prevZ','lnh']), inter: regress(rows,[...tbCols,'kz',...intCols,'rural','small','prevZ','lnh']) };
  });
  const tbContrast = T.map((t,ti)=>Object.fromEntries(tbs.map(x=>[x, tbs.length>1 ? toPP(topicP[ti], lin(models[ti].main, contrastW(x))) : null])));
  const hoursBeta = T.map((t,ti)=>lin(models[ti].main,{lnh:1}));
  const langGap = T.map((t,ti)=>Object.fromEntries(tbs.map(x=>{ const w={kz:1}; if(x!==ref) w['kz×tb:'+x]=1; return [x, toPP(topicP[ti], lin(models[ti].inter,w))]; })));
  const allGaps=[]; langGap.forEach(r=>tbs.forEach(x=>{ if(r[x]) allGaps.push(r[x].b); }));
  const medGap = median(allGaps), medGapPP = median(langGap.flatMap((r)=>tbs.map(x=>r[x]?r[x].pp:null)).filter(v=>v!=null));
  const langFlags=[];
  langGap.forEach((r,ti)=>tbs.forEach(x=>{ const g=r[x]; if(!g) return; g.excess=g.b-medGap; g.ez=g.excess/g.se; g.flag = g.excess<-.4 && g.ez<-2.5; if(g.flag) langFlags.push({ti,tb:x,g}); }));

  // whole-textbook comparison: naive vs adjusted
  const naive = Object.fromEntries(tbs.map(x=>{ let c=0,n=0; S.forEach((s,si)=>{ if(s.tb===x){ sc[si].c.forEach(v=>c+=v); sc[si].n.forEach(v=>n+=v);} }); return [x,c/n]; }));
  const srows = S.map((s,si)=>{ const c=sc[si].c.reduce((a,b)=>a+b,0), n=sc[si].n.reduce((a,b)=>a+b,0); return {y:logit((c+.5)/(n+1)), ...cov(s,si)}; });
  const overallModel = regress(srows,[...tbCols,'kz','rural','small','prevZ']);
  const naiveContrast = Object.fromEntries(tbs.map(x=>{ const others=tbs.filter(y=>y!==x); return [x,(naive[x]-others.reduce((a,y)=>a+naive[y],0)/others.length)*100]; }));
  const adjContrast = Object.fromEntries(tbs.map(x=>[x, tbs.length>1 ? toPP(allP, lin(overallModel, contrastW(x))) : null]));
  const tbShareUrban = Object.fromEntries(tbs.map(x=>{ const g=S.filter(s=>s.tb===x); return [x, g.filter(s=>s.area==='urban').length/g.length]; }));

  // prerequisite chains (student level)
  const edges=[];
  T.forEach((t,ti)=>t.pre.forEach(pid=>{
    const pi=T.findIndex(z=>z.id===pid); if(pi<0) return;
    let fF=0,fT=0,oF=0,oT=0;
    for(let st=0;st<nStu;st++){ const nP=stuN[st*nT+pi], nQ=stuN[st*nT+ti]; if(!nP||!nQ) continue;
      const preOK=stuC[st*nT+pi]/nP>=.6, tOK=stuC[st*nT+ti]/nQ>=.6;
      if(preOK){ oT++; if(!tOK) oF++; } else { fT++; if(!tOK) fF++; } }
    const a=fT?fF/fT:0, b=oT?oF/oT:0;
    edges.push({from:pi,to:ti,a,b,rr:b?a/b:0,share:(fF+oF)?fF/(fF+oF):0,nFailPre:fT});
  }));

  const studentsWhere = f => DS.students.filter(st=>f(S[st.s])).length;
  const A = {T,S,tbs,ref,langs,sc,mis,topicP,districts,distP,tbP,allP,models,tbContrast,hoursBeta,langGap,medGap,medGapPP,langFlags,
    naive,naiveContrast,adjContrast,tbShareUrban,edges,studentsWhere,nStu,nResp:R.n,medH};
  A.plan0 = T.map(t=>t.h);
  A.opt = optimizeHours(A);
  A.issues = buildIssues(A);
  return A;
}
function misShare(A,ti,tb,lang){
  const keys = Object.keys(A.mis[ti]).filter(k=>{ const [x,l]=k.split('|'); return (tb==null||x===tb)&&(lang==null||l===lang); });
  const s=[0,0,0,0]; keys.forEach(k=>A.mis[ti][k].forEach((v,i)=>s[i]+=v));
  const wrong=s[1]+s[2]+s[3]; return {wrong, total:wrong+s[0], share:[1,2,3].map(i=>wrong?s[i]/wrong:0)};
}

/* ============================================================
   6. Hours model & optimizer
   ============================================================ */
function hoursCurve(A,ti){ const e=A.hoursBeta[ti]; return Math.max(.03, e? e.b : .3); }
function predict(A,ti,h){ const p=clamp(A.topicP[ti],.02,.98); return sig(logit(p)+hoursCurve(A,ti)*Math.log(h/A.plan0[ti])); }
function hLimits(A,ti){ const b=A.plan0[ti]; return [Math.max(3,Math.round(b*.6)), Math.round(b*1.6)]; }
function optimizeHours(A){
  const h=[...A.plan0], n=h.length;
  for(let it=0;it<300;it++){
    let bi=-1,bg=0,bj=-1,bl=Infinity;
    for(let i=0;i<n;i++){ const [,mx]=hLimits(A,i); if(h[i]<mx){ const g=predict(A,i,h[i]+1)-predict(A,i,h[i]); if(g>bg){bg=g;bi=i;} } }
    for(let j=0;j<n;j++){ if(j===bi) continue; const [mn]=hLimits(A,j); if(h[j]>mn){ const l=predict(A,j,h[j])-predict(A,j,h[j]-1); if(l<bl){bl=l;bj=j;} } }
    if(bi<0||bj<0||bg-bl<1e-4) break; h[bi]++; h[bj]--;
  }
  return h;
}
const avgPred = (A,h) => h.reduce((a,v,i)=>a+predict(A,i,v),0)/h.length;

/* ============================================================
   7. Findings → issues (the "bug tracker" for textbooks)
   ============================================================ */
function buildIssues(A){
  const L=[], T=A.T, flagged=new Set();
  A.langFlags.forEach(({ti,tb,g})=>{
    flagged.add(ti+'|'+tb);
    const k=misShare(A,ti,tb,'kz'), r=misShare(A,ti,tb,'ru');
    let mi=0, best=-1; [0,1,2].forEach(i=>{ const d=k.share[i]-r.share[i]; if(d>best){best=d;mi=i;} });
    const ruGap = A.langGap[ti][tb];
    const kzStu = A.studentsWhere(s=>s.tb===tb&&s.lang==='kz');
    L.push({sev:'high', kind:'Язык обучения', ti, tb,
      title:`${tbName(tb)}, казахская редакция: глава «${T[ti].name}»`,
      body:[`В классах с казахским языком обучения по этому учебнику усвоение темы ниже, чем в русских классах, на ${Math.abs(g.pp).toFixed(0)} п.п. Обычный языковой разрыв по области — ${Math.abs(A.medGapPP).toFixed(0)} п.п.`,
            `Поправка на город/село, малокомплектность и прошлые результаты школы сделана; отклонение значимо (z = ${g.ez.toFixed(1)}).`,
            `Ошибка «${T[ti].mis[mi]}» даёт ${pct(k.share[mi])} неверных ответов в казахских классах и ${pct(r.share[mi])} в русских по тому же учебнику.`,
            `По другим учебникам такой аномалии в этой теме нет — проблема в конкретной редакции главы, а не в теме.`],
      action:`Сверить терминологию и примеры главы в казахской и русской редакциях (пример ошибки: ${T[ti].ex[mi]}). Направить издателю замечание с этими данными вместо переиздания всего учебника.`,
      who:'Издательство, экспертиза учебников', reach:`${kzStu} учеников`});
  });
  T.forEach((t,ti)=>A.tbs.forEach(tb=>{
    const c=A.tbContrast[ti][tb]; if(!c||flagged.has(ti+'|'+tb)) return;
    if(c.b<-.35 && c.z<-2.5){
      flagged.add(ti+'|'+tb);
      const me=misShare(A,ti,tb,null); const oth=A.tbs.filter(x=>x!==tb).map(x=>misShare(A,ti,x,null));
      let mi=0,best=-1; [0,1,2].forEach(i=>{ const o=oth.reduce((a,m)=>a+m.share[i],0)/oth.length; if(me.share[i]-o>best){best=me.share[i]-o;mi=i;} });
      const o=oth.reduce((a,m)=>a+m.share[mi],0)/oth.length;
      L.push({sev:'mid', kind:'Учебник', ti, tb, title:`${tbName(tb)} слабее других по теме «${t.name}»`,
        body:[`С поправкой на контекст школы усвоение ниже на ${Math.abs(c.pp).toFixed(0)} п.п., чем в среднем по другим учебникам (95% ДИ: ${fx(c.lo,0)}…${fx(c.hi,0)} п.п.).`,
              `Характерная ошибка: «${t.mis[mi]}» — ${pct(me.share[mi])} неверных ответов против ${pct(o)} по другим учебникам.`],
        action:'Дать учителям, работающим по этому учебнику, дополнительные материалы по теме; включить вывод в экспертизу учебника.',
        who:'Методисты, издательство', reach:`${A.studentsWhere(s=>s.tb===tb)} учеников`});
    }
  }));
  T.forEach((t,ti)=>{
    if(A.tbs.some(tb=>flagged.has(ti+'|'+tb))) return;
    A.tbs.forEach(tb=>{ const c=A.tbContrast[ti][tb]; if(c && c.b>.25 && c.z>2.5)
      L.push({sev:'low', kind:'Лучшая практика', ti, tb, title:`${tbName(tb)} лучше других объясняет «${t.name}»`,
        body:[`+${c.pp.toFixed(0)} п.п. к усвоению с поправкой на контекст школы (95% ДИ: ${fx(c.lo,0)}…${fx(c.hi,0)} п.п.).`],
        action:`Использовать главу этого учебника как дополнительный материал в школах, работающих по другим учебникам.`, who:'Методисты', reach:''}); });
  });
  A.edges.filter(e=>e.rr>=1.8 && A.topicP[e.from]<.62).sort((a,b)=>b.rr*b.nFailPre-a.rr*a.nFailPre).slice(0,3).forEach(e=>{
    L.push({sev:'mid', kind:'Корневая причина', ti:e.to, title:`Слабая база «${T[e.from].name}» тянет вниз «${T[e.to].name}»`,
      body:[`Ученики, не освоившие «${T[e.from].name}», не осваивают «${T[e.to].name}» в ${pct(e.a)} случаев; освоившие — в ${pct(e.b)} (в ${e.rr.toFixed(1)} раза реже).`,
            `${pct(e.share)} не освоивших «${T[e.to].name}» не освоили и базовую тему. Это сильная связь, а не доказанная причина: проверьте пилотом.`],
      action:`Перед темой «${T[e.to].name}» провести короткую диагностику и повторение «${T[e.from].name}».`, who:'Учителя, методисты', reach:''});
  });
  const moves=A.opt.map((h,i)=>({i,d:h-A.plan0[i]})).filter(m=>m.d!==0).sort((a,b)=>b.d-a.d);
  const gain=(avgPred(A,A.opt)-avgPred(A,A.plan0))*100;
  if(moves.length && gain>.3){
    const plus=moves.filter(m=>m.d>0), minus=moves.filter(m=>m.d<0);
    L.push({sev:'mid', kind:'Учебные часы', title:`Перераспределить ${plus.reduce((a,m)=>a+m.d,0)} ч внутри тех же 102 часов`,
      body:[`Добавить: ${plus.map(m=>`«${T[m.i].name}» +${m.d} ч`).join(', ')}.`,
            `Сократить: ${minus.map(m=>`«${T[m.i].name}» −${-m.d} ч`).join(', ')}.`,
            `Ожидаемый рост среднего усвоения: +${gain.toFixed(1)} п.п. Оценка построена на различиях в часах между школами (вариативный компонент), поэтому её стоит проверить пилотом в нескольких школах.`],
      action:'Утвердить план как пилот в 5–10 школах и сравнить результаты СОЧ через четверть.', who:'Методический отдел', reach:''});
  }
  const hard=A.T.map((t,i)=>({t,i,p:A.topicP[i]})).filter(x=>x.p<.5).sort((a,b)=>a.p-b.p);
  if(hard.length) L.push({sev:'low', kind:'Сложные темы', title:`${hard.length} ${ru3(hard.length,'тема освоена','темы освоены','тем освоено')} меньше чем наполовину`,
    body:[hard.map(x=>`«${x.t.name}» — ${pct(x.p)}`).join('; ')+'.'], action:'Разобрать типичные ошибки по этим темам на методобъединении.', who:'Методисты', reach:''});
  const rank={high:0,mid:1,low:2}; return L.sort((a,b)=>rank[a.sev]-rank[b.sev]);
}
const SEV = {high:'Критично', mid:'Важно', low:'К сведению'};

/* ============================================================
   8. Views
   ============================================================ */
var VIEWS=[['overview','Обзор'],['topics','Сложные темы'],['textbooks','Учебники'],['language','Языковой разрыв'],['roots','Корневые причины'],['hours','Учебные часы'],['issues','Замечания'],['data','Данные']];
var DS=null, A=null, plan=null, selTopic=null;

function nav(){
  const cur=view();
  const nHigh=A.issues.filter(i=>i.sev!=='low').length;
  $('#nav').innerHTML = VIEWS.map(([id,l])=>`<a href="#${id}" class="${id===cur?'on':''}">${l}${id==='issues'&&nHigh?`<span class="cnt">${nHigh}</span>`:''}</a>`).join('');
  $('#srcBadge').innerHTML = DS.source==='demo'
    ? `<strong>Демо-данные.</strong> Синтетическая выборка: ${A.S.length} школ Жамбылской области, алгебра 7 класс. Загрузите свои результаты во вкладке «Данные».`
    : `<strong>Ваши данные.</strong> ${A.S.length} школ, ${A.nStu} учеников.`;
}
function view(){ const h=location.hash.slice(1); return VIEWS.some(v=>v[0]===h)?h:'overview'; }
function render(){ nav(); const v=view(); $('#view').innerHTML = R[v](); if(AFTER[v]) AFTER[v](); }

function issueCard(it){
  return `<article class="issue ${it.sev}">
    <div class="row between"><span class="pill sev-${it.sev}">${SEV[it.sev]}</span><span class="small muted">${esc(it.kind)}</span></div>
    <h2>${esc(it.title)}</h2>
    <ul>${it.body.map(b=>`<li>${esc(b)}</li>`).join('')}</ul>
    <div class="act"><b>Что сделать:</b> ${esc(it.action)}</div>
    <div class="meta"><span>Кому: ${esc(it.who)}</span>${it.reach?`<span>Затрагивает: ${esc(it.reach)}</span>`:''}</div>
  </article>`;
}

var R = {
overview(){
  const T=A.T, worst=T.map((t,i)=>({t,p:A.topicP[i]})).sort((a,b)=>a.p-b.p);
  const hi=A.issues.filter(i=>i.sev==='high'), mid=A.issues.filter(i=>i.sev==='mid');
  const lang=A.langFlags[0], tbw=A.issues.find(i=>i.kind==='Учебник'), hrs=A.issues.find(i=>i.kind==='Учебные часы');
  const ref=A.tbs.reduce((b,x)=>A.naiveContrast[x]>A.naiveContrast[b]?x:b, A.tbs[0]);
  const sentences=[
    `Средний уровень усвоения по выборке — <b>${pct(A.allP)}</b>. Самые сложные темы: <b>«${worst[0].t.name}»</b> (${pct(worst[0].p)}) и <b>«${worst[1].t.name}»</b> (${pct(worst[1].p)}).`,
    lang ? `Главная находка: в <b>казахской редакции учебника ${lang.tb}</b> глава «${T[lang.ti].name}» работает заметно хуже русской (разрыв ${Math.abs(lang.g.pp).toFixed(0)} п.п. при обычных ${Math.abs(A.medGapPP).toFixed(0)}). Это указывает на конкретную главу, а не на весь учебник.` : `Аномальных языковых разрывов по отдельным главам не найдено.`,
    tbw ? `${esc(tbw.title)}. ` : '',
    A.tbs.length>1 ? `Если сравнивать учебники «в лоб», лидирует учебник ${ref} (${fx(A.naiveContrast[ref])} п.п.), но ${pct(A.tbShareUrban[ref])} его школ — городские. С поправкой на контекст разница ${A.adjContrast[ref]?fx(A.adjContrast[ref].pp):'—'} п.п.` : '',
    hrs ? `Перераспределение часов внутри тех же 102 ч даёт ожидаемо ${hrs.body[2].match(/\+[\d.]+/)[0]} п.п. к среднему усвоению.` : ''
  ].filter(Boolean);
  return `
  <div class="head"><span class="eyebrow">Алгебра · 7 класс · ${A.S.length} школ</span>
    <h1>Где учебная программа теряет учеников</h1>
    <p class="lede">Talda разбирает каждый неверный ответ: какая ошибка, в какой главе, по какому учебнику и на каком языке обучения. Итог — замечания, которые можно отправить издателю или методобъединению.</p></div>
  <div class="kpis">
    <div class="kpi"><span class="v">${A.S.length}</span><span class="l">школ</span></div>
    <div class="kpi"><span class="v">${A.nStu.toLocaleString('ru')}</span><span class="l">учеников</span></div>
    <div class="kpi"><span class="v">${A.nResp.toLocaleString('ru')}</span><span class="l">ответов разобрано</span></div>
    <div class="kpi"><span class="v">${hi.length+mid.length}</span><span class="l">замечаний с доказательствами</span></div>
  </div>
  <section class="card"><h2>Сводка</h2><div class="summary">${sentences.map(s=>`<p>${s}</p>`).join('')}</div>
    <div class="row"><a class="btn primary" href="#issues">Открыть замечания</a><a class="btn" href="#language">Языковой разрыв</a></div></section>
  <section class="card"><div class="row between"><h2>Усвоение тем по районам</h2><span class="small muted">доля верных ответов</span></div>
    <div class="scroll"><table class="heat"><thead><tr><th>Тема</th><th>Область</th>${A.districts.map(d=>`<th>${esc(d)}</th>`).join('')}</tr></thead><tbody>
    ${A.T.map((t,i)=>`<tr><td class="t">${esc(t.name)}</td><td class="h" style="background:${heat(A.topicP[i])}"><b>${pct(A.topicP[i])}</b></td>${A.districts.map(d=>{const p=A.distP[d][i];return `<td class="h" style="background:${p==null?'transparent':heat(p)}">${pct(p)}</td>`;}).join('')}</tr>`).join('')}
    </tbody></table></div></section>
  ${hi.length?`<section style="display:flex;flex-direction:column;gap:12px"><h2>Критичные замечания</h2>${hi.map(issueCard).join('')}</section>`:''}`;
},

topics(){
  const T=A.T; if(selTopic==null) selTopic=A.topicP.indexOf(Math.min(...A.topicP));
  const order=T.map((t,i)=>i).sort((a,b)=>A.topicP[a]-A.topicP[b]);
  const ti=selTopic, t=T[ti], all=misShare(A,ti,null,null);
  const combos=[]; A.tbs.forEach(x=>A.langs.forEach(l=>{ const m=misShare(A,ti,x,l); if(m.total) combos.push({x,l,m}); }));
  return `
  <div class="head"><span class="eyebrow">Диагностика по неверным ответам</span><h1>Сложные темы и типичные ошибки</h1>
  <p class="lede">Каждый неверный вариант ответа привязан к конкретной ошибке мышления. Поэтому видно не только «тема не усвоена», но и <i>почему</i>.</p></div>
  <div class="split">
    <section class="card"><h3>Темы по уровню усвоения</h3><div class="topiclist">
      ${order.map(i=>`<button data-topic="${i}" class="${i===ti?'on':''}"><span>${esc(T[i].name)}</span><span class="bar"><i style="width:${A.topicP[i]*100}%;background:${heat(A.topicP[i]).replace(' 50%,',' 100%,')}"></i></span><span class="num small">${pct(A.topicP[i])}</span></button>`).join('')}
    </div></section>
    <div style="display:flex;flex-direction:column;gap:18px;min-width:0">
      <section class="card">
        <div class="row between"><h2>${esc(t.name)}</h2><span class="num">${pct(A.topicP[ti])} верных · ${t.h} ч по программе</span></div>
        <div class="mis">${t.mis.map((m,i)=>`<div class="m"><div class="top"><span>${esc(m)}</span><span class="num">${pct(all.share[i])}</span></div>
          <div class="bar"><i style="width:${all.share[i]*100}%;background:var(--bad)"></i></div><span class="ex">Пример: ${esc(t.ex[i]||'')}</span></div>`).join('')}</div>
        <p class="note">Доля среди ${all.wrong.toLocaleString('ru')} неверных ответов по теме.</p>
      </section>
      <section class="card"><h3>Та же ошибка по учебникам и языку обучения</h3>
        <div class="scroll"><table><thead><tr><th>Ошибка</th>${combos.map(c=>`<th class="n"><span class="tb" style="background:${TB_COLOR(c.x)}"></span>${c.x} · ${LANG_SHORT[c.l]}</th>`).join('')}</tr></thead><tbody>
        ${t.mis.map((m,i)=>`<tr><td>${esc(m)}</td>${combos.map(c=>{ const v=c.m.share[i], d=v-all.share[i]; const hot=d>.18; return `<td class="n" style="${hot?`background:color-mix(in oklab,var(--bad) 22%,var(--surface));font-weight:600`:''}">${pct(v)}</td>`; }).join('')}</tr>`).join('')}
        <tr><td class="muted">Неверных ответов</td>${combos.map(c=>`<td class="n muted">${c.m.wrong}</td>`).join('')}</tr>
        </tbody></table></div>
        <p class="note">Выделены ячейки, где ошибка встречается на 18+ п.п. чаще, чем в среднем по теме. Такое смещение обычно указывает на то, как тема изложена в конкретном учебнике.</p>
      </section>
    </div>
  </div>`;
},

textbooks(){
  const T=A.T, tbs=A.tbs;
  if(tbs.length<2) return `<div class="head"><h1>Учебники</h1><p class="lede">В данных только один учебник — сравнивать не с чем.</p></div>`;
  const maxN=Math.max(...tbs.map(x=>A.naive[x]));
  const vals=T.flatMap((t,i)=>tbs.map(x=>A.tbContrast[i][x]).filter(Boolean).flatMap(c=>[c.lo,c.hi]));
  const lim=Math.ceil(Math.max(10,...vals.map(Math.abs))/5)*5;
  const W=780, L=230, Rr=20, rowH=34, H=T.length*rowH+44, X=v=>L+(v+lim)/(2*lim)*(W-L-Rr);
  const ticks=[]; for(let v=-lim; v<=lim; v+=lim/ (lim>=20?4:2)) ticks.push(v);
  const svg=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="min-width:640px" role="img" aria-label="Эффект учебников по темам">
    ${ticks.map(v=>`<line x1="${X(v)}" x2="${X(v)}" y1="18" y2="${H-22}" stroke="var(--line)" ${v===0?'stroke-width="1.5" stroke="var(--muted)"':''}/><text x="${X(v)}" y="${H-6}" font-size="11" text-anchor="middle" class="mut">${v>0?'+':''}${v}</text>`).join('')}
    <text x="${X(0)}" y="11" font-size="11" text-anchor="middle" class="mut">п.п. относительно других учебников</text>
    ${T.map((t,i)=>{ const y=26+i*rowH+rowH/2; return `<text x="${L-10}" y="${y+4}" font-size="12.5" text-anchor="end">${esc(t.name.length>30?t.name.slice(0,29)+'…':t.name)}</text>`+
      tbs.map((x,k)=>{ const c=A.tbContrast[i][x]; if(!c) return ''; const yy=y+(k-(tbs.length-1)/2)*8; const sigc=Math.abs(c.z)>2.5;
        return `<line x1="${X(c.lo)}" x2="${X(c.hi)}" y1="${yy}" y2="${yy}" stroke="${TB_COLOR(x)}" stroke-width="2" opacity="${sigc?1:.45}"/><circle cx="${X(c.pp)}" cy="${yy}" r="${sigc?4.5:3.2}" fill="${TB_COLOR(x)}" opacity="${sigc?1:.55}"><title>${tbName(x)}: ${fx(c.pp)} п.п. (95% ДИ ${fx(c.lo)}…${fx(c.hi)})</title></circle>`; }).join(''); }).join('')}
  </svg>`;
  return `
  <div class="head"><span class="eyebrow">Честное сравнение</span><h1>Какой учебник лучше объясняет каждую тему</h1>
  <p class="lede">Простое сравнение средних баллов вводит в заблуждение: сильные городские школы чаще выбирают одни учебники, сельские — другие. Talda сравнивает учебники при прочих равных.</p></div>
  <section class="cmp">
    <div class="card"><h3>«В лоб»: средний балл школ</h3><div class="vbars">
      ${tbs.map(x=>`<div class="r"><span><span class="tb" style="background:${TB_COLOR(x)}"></span>${tbName(x)}</span><span class="bar"><i style="width:${A.naive[x]/maxN*100}%;background:${TB_COLOR(x)}"></i></span><span class="num">${pct(A.naive[x])}</span></div>`).join('')}
      </div><p class="note">${tbs.map(x=>`${x}: ${pct(A.tbShareUrban[x])} городских школ`).join(' · ')}</p></div>
    <div class="card"><h3>При прочих равных: разница с другими учебниками</h3><div class="vbars">
      ${tbs.map(x=>{ const c=A.adjContrast[x], n=A.naiveContrast[x]; return `<div class="r"><span><span class="tb" style="background:${TB_COLOR(x)}"></span>${tbName(x)}</span><span class="small muted">«в лоб» ${fx(n)} → с поправкой</span><span class="num">${c?fx(c.pp):'—'}</span></div>`; }).join('')}
      </div><p class="note">Поправка на город/село, малокомплектность, язык обучения и прошлые результаты школы (регрессия на уровне школ).</p></div>
  </section>
  <section class="card"><div class="row between"><h2>Эффект учебника по темам</h2>
    <div class="legend">${tbs.map(x=>`<span><span class="tb" style="background:${TB_COLOR(x)}"></span>${tbName(x)}</span>`).join('')}<span>линия — 95% доверительный интервал</span></div></div>
    <div class="scroll">${svg}</div>
    <p class="note">Точка правее нуля — учебник объясняет тему лучше остальных. Яркие точки — различие статистически надёжно; бледные — может быть случайностью. Ни один учебник не лучший во всём, поэтому решение принимается по главам.</p></section>`;
},

language(){
  const T=A.T, tbs=A.tbs;
  if(A.langs.length<2) return `<div class="head"><h1>Языковой разрыв</h1><p class="lede">В данных один язык обучения — разрыв посчитать нельзя.</p></div>`;
  const fl=A.langFlags;
  return `
  <div class="head"><span class="eyebrow">Специфика Казахстана</span><h1>Где казахская редакция учебника работает хуже русской</h1>
  <p class="lede">Исследования PISA много лет показывают общий разрыв между казахскими и русскими классами. Talda ищет другое: главы, где разрыв <i>резко больше обычного</i> только у одного учебника. Это след ошибки перевода, терминологии или примеров в конкретной редакции.</p></div>
  <section class="card"><div class="row between"><h2>Разрыв «казахские − русские классы», п.п.</h2><span class="small muted">обычный разрыв: ${fx(A.medGapPP,0)} п.п.</span></div>
    <div class="scroll"><table class="heat"><thead><tr><th>Тема</th>${tbs.map(x=>`<th><span class="tb" style="background:${TB_COLOR(x)}"></span>${tbName(x)}</th>`).join('')}</tr></thead><tbody>
    ${T.map((t,i)=>`<tr><td class="t">${esc(t.name)}</td>${tbs.map(x=>{ const g=A.langGap[i][x]; if(!g) return '<td class="h">—</td>';
      return `<td class="h" style="background:${divColor(g.pp)};${g.flag?'outline:2px solid var(--bad);outline-offset:-2px;font-weight:700':''}" title="95% ДИ ${fx(g.lo,0)}…${fx(g.hi,0)}">${fx(g.pp,0)}${g.flag?' ⚑':''}</td>`; }).join('')}</tr>`).join('')}
    </tbody></table></div>
    <p class="note">⚑ — разрыв больше обычного на 0,4+ логита и значим (z < −2,5) с поправкой на город/село, малокомплектность, прошлые результаты школы и часы.</p></section>
  ${fl.length? fl.map(({ti,tb})=>{ const k=misShare(A,ti,tb,'kz'), r=misShare(A,ti,tb,'ru'), t=T[ti];
    return `<section class="card"><div class="row between"><h2>${tbName(tb)} · «${esc(t.name)}»: какие ошибки делают</h2><span class="pill sev-high">аномалия</span></div>
    <div class="mis">${t.mis.map((m,i)=>`<div class="m"><div class="top"><span>${esc(m)}</span><span class="num small">каз. ${pct(k.share[i])} · рус. ${pct(r.share[i])}</span></div>
      <div class="bar"><i style="width:${k.share[i]*100}%;background:var(--bad)"></i></div><div class="bar"><i style="width:${r.share[i]*100}%;background:var(--accent)"></i></div></div>`).join('')}</div>
    <div class="legend"><span><span class="tb" style="background:var(--bad)"></span>казахские классы</span><span><span class="tb" style="background:var(--accent)"></span>русские классы</span></div></section>`; }).join('')
  : `<section class="card"><p>Аномальных глав не найдено: разрыв везде близок к обычному.</p></section>`}`;
},

roots(){
  const T=A.T, depth={}; const d=i=>{ if(depth[i]!=null) return depth[i]; const t=T[i]; depth[i]=0; const ps=t.pre.map(p=>T.findIndex(z=>z.id===p)).filter(x=>x>=0); depth[i]=ps.length?1+Math.max(...ps.map(d)):0; return depth[i]; };
  T.forEach((t,i)=>d(i));
  const cols=[]; T.forEach((t,i)=>{ (cols[depth[i]] ||= []).push(i); });
  const nodeW=178,nodeH=48,gapY=16, maxRows=Math.max(...cols.map(c=>c.length)), W=860, H=Math.max(200,maxRows*(nodeH+gapY)+30);
  const pos={}; cols.forEach((c,ci)=>c.forEach((ti,ri)=>{ const x=10+ci*((W-20-nodeW)/Math.max(1,cols.length-1)); const y=H/2+(ri-(c.length-1)/2)*(nodeH+gapY)-nodeH/2; pos[ti]={x,y}; }));
  const edges=A.edges;
  const svg=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="min-width:720px" role="img" aria-label="Граф зависимостей тем">
   ${edges.map(e=>{ const a=pos[e.from], b=pos[e.to]; if(!a||!b) return ''; const x1=a.x+nodeW, y1=a.y+nodeH/2, x2=b.x, y2=b.y+nodeH/2, mx=(x1+x2)/2;
     const w=clamp(1+(e.rr-1)*1.6,1,7), col=e.rr>=1.8?'var(--bad)':'var(--muted)';
     return `<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" fill="none" stroke="${col}" stroke-width="${w}" opacity=".55"/><text x="${mx}" y="${(y1+y2)/2-4}" font-size="11" text-anchor="middle" class="mut">×${e.rr.toFixed(1)}</text>`; }).join('')}
   ${T.map((t,i)=>{ const p=pos[i]; return `<g><rect x="${p.x}" y="${p.y}" width="${nodeW}" height="${nodeH}" rx="8" fill="${heat(A.topicP[i])}" stroke="var(--line)"/>
     <text x="${p.x+10}" y="${p.y+20}" font-size="12" font-weight="600">${esc(t.name.length>24?t.name.slice(0,23)+'…':t.name)}</text>
     <text x="${p.x+10}" y="${p.y+37}" font-size="11.5" class="mut">усвоение ${pct(A.topicP[i])}</text></g>`; }).join('')}
  </svg>`;
  const rows=[...edges].sort((a,b)=>b.rr-a.rr);
  return `
  <div class="head"><span class="eyebrow">Цепочки пробелов</span><h1>Откуда на самом деле растёт проблема</h1>
  <p class="lede">Тема может проваливаться не из-за своей главы, а из-за непрочной базы. Talda сравнивает учеников, освоивших и не освоивших предыдущую тему, и показывает, какие связи сильнее всего.</p></div>
  <section class="card"><div class="row between"><h2>Граф зависимостей тем</h2><span class="small muted">×N — во сколько раз чаще проваливают тему без базы</span></div><div class="scroll">${svg}</div></section>
  <section class="card"><h2>Связи по силе</h2><div class="scroll"><table><thead><tr><th>База</th><th>Тема</th><th class="n">Без базы не освоили</th><th class="n">С базой не освоили</th><th class="n">Во сколько раз</th></tr></thead><tbody>
   ${rows.map(e=>`<tr><td>${esc(T[e.from].name)} <span class="muted small">${pct(A.topicP[e.from])}</span></td><td>${esc(T[e.to].name)}</td><td class="n">${pct(e.a)}</td><td class="n">${pct(e.b)}</td><td class="n"><b class="${e.rr>=1.8?'no':''}">×${e.rr.toFixed(1)}</b></td></tr>`).join('')}
  </tbody></table></div><p class="note">Освоил тему — 2 из 3 заданий верно. Это корреляция на уровне учеников; причинность подтверждается пилотом (повторение базы → рост результата).</p></section>`;
},

hours(){
  const T=A.T; if(!plan) plan=[...A.plan0];
  return `
  <div class="head"><span class="eyebrow">Тот же бюджет — 102 часа</span><h1>Куда переложить учебные часы</h1>
  <p class="lede">Школы немного по-разному распределяют часы (вариативный компонент). Talda по этим различиям оценивает, сколько даёт каждый дополнительный час по теме, и ищет распределение с лучшим ожидаемым результатом.</p></div>
  <section class="card">
    <div class="row between"><div class="row" id="hsum"></div>
      <div class="row"><button class="btn primary" data-act="opt">Рассчитать оптимальный план</button><button class="btn" data-act="reset">Вернуть программу</button></div></div>
    <div class="scroll"><table><thead><tr><th>Тема</th><th class="n">По программе</th><th style="min-width:160px">План</th><th class="n">Часов</th><th class="n">Сейчас</th><th class="n">Прогноз</th><th class="n">Эффект часа</th></tr></thead><tbody>
    ${T.map((t,i)=>{ const [mn,mx]=hLimits(A,i), e=A.hoursBeta[i], conf=!e?'—':e.b/e.se>2.5?'<span class="pill sev-low">надёжно</span>':e.b/e.se>1.5?'<span class="pill sev-low">умеренно</span>':'<span class="pill sev-low">слабо</span>';
      return `<tr><td>${esc(t.name)}</td><td class="n">${A.plan0[i]}</td><td><input type="range" id="h-${i}" min="${mn}" max="${mx}" step="1" value="${plan[i]}" aria-label="Часы: ${esc(t.name)}"></td>
      <td class="n" id="hv-${i}"></td><td class="n">${pct(A.topicP[i])}</td><td class="n" id="hp-${i}"></td><td class="n">${e?`${fx(e.b,2)} ${conf}`:'—'}</td></tr>`; }).join('')}
    </tbody></table></div>
    <p class="note">Эффект часа — изменение логита усвоения при росте часов в e раз (с поправкой на учебник, язык, город/село и прошлые результаты). Диапазон каждого ползунка ограничен 60–160% от программы, чтобы не экстраполировать за пределы данных.</p>
  </section>`;
},

issues(){
  return `
  <div class="head"><span class="eyebrow">Трекер замечаний к программе</span><h1>${A.issues.length} замечаний с доказательствами</h1>
  <p class="lede">Каждое замечание указывает адресата, масштаб и данные, на которых оно основано. Их можно отправить в издательство, методический отдел или на методобъединение.</p>
  <div class="row"><button class="btn primary" data-act="copyIssues">Скопировать отчёт</button></div></div>
  ${A.issues.map(issueCard).join('')}`;
},

data(){
  const byD=A.districts.map(d=>{ const g=A.S.filter(s=>s.district===d); return {d,n:g.length,stu:A.studentsWhere(s=>s.district===d),kz:g.filter(s=>s.lang==='kz').length/g.length,small:g.filter(s=>s.small).length,tb:A.tbs.map(x=>g.filter(s=>s.tb===x).length)}; });
  const val = DS.source==='demo' ? validation() : null;
  return `
  <div class="head"><span class="eyebrow">Источник</span><h1>Данные</h1>
  <p class="lede">${DS.source==='demo'?`Сейчас загружена синтетическая выборка (зерно ${DS.seed}). Реальных результатов учеников здесь нет.`:'Загружен ваш CSV-файл.'}</p></div>
  ${val?`<section class="card"><h2>Проверка: заложено в демо-данные → найдено системой</h2>
    <p class="note">В генератор специально вшиты закономерности. Система о них не знает и должна найти их сама по ответам учеников.</p>
    <ul class="checks">${val.map(v=>`<li><b class="${v.ok?'ok':'no'}">${v.ok?'✓':'✗'}</b><span>${esc(v.label)}${v.detail?` <span class="muted small">— ${esc(v.detail)}</span>`:''}</span></li>`).join('')}</ul></section>`:''}
  <section class="grid2">
    <div class="card"><h2>Другая выборка</h2><p class="note">Сгенерировать новые демо-данные с другим зерном.</p>
      <div class="row"><input type="number" id="seed" value="${DS.seed||2026}" aria-label="Зерно генератора"><button class="btn" data-act="regen">Сгенерировать</button></div></div>
    <div class="card"><h2>Загрузить свои результаты</h2>
      <p class="note">CSV, одна строка — один ответ: <span class="ex">student_id, school_id, district, area (urban|rural), small (0|1), lang (kz|ru), textbook, prev_score, topic_id, topic_hours, item_id, option</span>. option: 0 — верно, 1–3 — номер типичной ошибки.</p>
      <div class="row"><input type="file" id="csv" accept=".csv,text/csv" aria-label="CSV-файл"><button class="btn" data-act="copySample">Скопировать пример CSV</button></div>
      <p class="small" id="csvMsg"></p></div>
  </section>
  <section class="card"><h2>Состав выборки</h2><div class="scroll"><table><thead><tr><th>Район</th><th class="n">Школ</th><th class="n">МКШ</th><th class="n">Учеников</th><th class="n">Каз. язык</th>${A.tbs.map(x=>`<th class="n">${tbName(x)}</th>`).join('')}</tr></thead><tbody>
    ${byD.map(r=>`<tr><td>${esc(r.d)}</td><td class="n">${r.n}</td><td class="n">${r.small}</td><td class="n">${r.stu}</td><td class="n">${pct(r.kz)}</td>${r.tb.map(v=>`<td class="n">${v}</td>`).join('')}</tr>`).join('')}
  </tbody></table></div></section>`;
}
};

function validation(){
  const T=A.T, id=x=>T.findIndex(t=>t.id===x);
  const c=(t,x)=>A.tbContrast[id(t)]?.[x];
  const bets=A.T.map((t,i)=>({id:t.id,b:A.hoursBeta[i]?A.hoursBeta[i].b:0})).sort((a,b)=>b.b-a.b).slice(0,4).map(x=>x.id);
  const top3=['T12','T6','T9','T8'].filter(x=>bets.includes(x)).length;
  const refA=A.naiveContrast.A, adjA=A.adjContrast.A?.pp;
  return [
    {label:'Казахская редакция учебника B: глава «Линейная функция»', ok:A.langFlags.some(f=>f.tb==='B'&&T[f.ti].id==='T9')},
    {label:'Ложных языковых аномалий нет', ok:A.langFlags.every(f=>f.tb==='B'&&T[f.ti].id==='T9'), detail:`найдено флагов: ${A.langFlags.length}`},
    {label:'Учебник C слабее по «Формулам сокращённого умножения»', ok:(c('T6','C')?.z??0)<-2.5},
    {label:'Учебник A сильнее по «Системам уравнений»', ok:(c('T8','A')?.lo??-1)>0},
    {label:'Учебник B сильнее по «Текстовым задачам»', ok:(c('T12','B')?.lo??-1)>0},
    {label:'Наивное сравнение завышает учебник A (городские школы)', ok:adjA!=null && refA-adjA>1.5, detail:`«в лоб» ${fx(refA)} п.п., с поправкой ${adjA!=null?fx(adjA):'—'} п.п.`},
    {label:'Часы важнее всего для тем с наибольшим заложенным эффектом', ok:top3>=3, detail:`топ-4 по оценке: ${bets.join(', ')}`},
  ];
}

/* ============================================================
   9. Hours interactivity
   ============================================================ */
var AFTER = {
  hours(){ A.T.forEach((t,i)=>{ const el=$('#h-'+i); el.addEventListener('input',()=>{ plan[i]=+el.value; updHours(); }); }); updHours(); }
};
function updHours(){
  const tot=plan.reduce((a,b)=>a+b,0), base=A.plan0.reduce((a,b)=>a+b,0);
  const cur=avgPred(A,A.plan0), nw=avgPred(A,plan), d=(nw-cur)*100;
  A.T.forEach((t,i)=>{ const dv=plan[i]-A.plan0[i]; $('#hv-'+i).innerHTML=`${plan[i]}${dv?` <span class="small ${dv>0?'ok':'no'}">${dv>0?'+':'−'}${Math.abs(dv)}</span>`:''}`;
    const p=predict(A,i,plan[i]), dp=(p-A.topicP[i])*100; $('#hp-'+i).innerHTML=`${pct(p)}${Math.abs(dp)>=.5?` <span class="small ${dp>0?'ok':'no'}">${fx(dp,0)}</span>`:''}`; });
  $('#hsum').innerHTML=`<span class="pill ${tot===base?'sev-low':'sev-high'}">Всего ${tot} из ${base} ч</span><span>Среднее усвоение: <b class="num">${pct(cur)}</b> → <b class="num">${pct(nw)}</b> <span class="${d>=0?'ok':'no'} num">${fx(d)} п.п.</span></span>`;
}

/* ============================================================
   10. CSV import / export
   ============================================================ */
function sampleCSV(n=300){
  const h='student_id,school_id,district,area,small,lang,textbook,prev_score,topic_id,topic_hours,item_id,option';
  const lines=[h]; const R=DS.resp;
  for(let i=0;i<Math.min(n,R.n);i++){ const st=DS.students[R.stu[i]], s=DS.schools[st.s], it=DS.items[R.item[i]], t=DS.topics[it.t];
    lines.push([st.id,s.id,s.district,s.area,s.small?1:0,s.lang,s.tb,s.prev,t.id,s.hours[t.id]||t.h,it.id,R.opt[i]].join(',')); }
  return lines.join('\n');
}
function parseCSV(text){
  const rows=text.split(/\r?\n/).filter(l=>l.trim()); if(rows.length<2) throw new Error('Файл пуст.');
  const head=rows[0].split(',').map(s=>s.trim().toLowerCase());
  const need=['student_id','school_id','district','area','small','lang','textbook','prev_score','topic_id','topic_hours','item_id','option'];
  const miss=need.filter(c=>!head.includes(c)); if(miss.length) throw new Error('Нет столбцов: '+miss.join(', '));
  const ix=Object.fromEntries(need.map(c=>[c,head.indexOf(c)]));
  const known=Object.fromEntries(buildTopics().map(t=>[t.id,t]));
  const topics=[], tIdx={}, schools=[], sIdx={}, students=[], stIdx={}, items=[], iIdx={}, stu=[], item=[], opt=[];
  for(let r=1;r<rows.length;r++){
    const c=rows[r].split(',').map(s=>s.trim()); if(c.length<need.length) continue;
    const tid=c[ix.topic_id];
    if(!(tid in tIdx)){ tIdx[tid]=topics.length; const k=known[tid]; topics.push(k?{...k}:{id:tid,name:tid,h:+c[ix.topic_hours]||8,pre:[],mis:['Ошибка 1','Ошибка 2','Ошибка 3'],ex:['','','']}); }
    const sid=c[ix.school_id];
    if(!(sid in sIdx)){ sIdx[sid]=schools.length; schools.push({id:sid,name:sid,district:c[ix.district]||'—',area:c[ix.area]==='urban'?'urban':'rural',small:c[ix.small]==='1',lang:c[ix.lang]==='ru'?'ru':'kz',tb:c[ix.textbook]||'A',prev:+c[ix.prev_score]||50,hours:{}}); }
    const s=schools[sIdx[sid]]; s.hours[tid]=+c[ix.topic_hours]||topics[tIdx[tid]].h;
    const stid=c[ix.student_id]; if(!(stid in stIdx)){ stIdx[stid]=students.length; students.push({id:stid,s:sIdx[sid]}); }
    const iid=c[ix.item_id]; if(!(iid in iIdx)){ iIdx[iid]=items.length; items.push({id:iid,t:tIdx[tid]}); }
    stu.push(stIdx[stid]); item.push(iIdx[iid]); opt.push(clamp(parseInt(c[ix.option])||0,0,3));
  }
  if(!stu.length) throw new Error('Не удалось прочитать ни одной строки.');
  const ids=new Set(topics.map(t=>t.id)); topics.forEach(t=>t.pre=t.pre.filter(p=>ids.has(p)));
  return {source:'csv', topics, items, schools, students, resp:{stu:Int32Array.from(stu),item:Int32Array.from(item),opt:Uint8Array.from(opt),n:stu.length}};
}

