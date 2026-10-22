/* ======= STATE ======= */
const state = {
  playerName:'', score:0, lives:3, timeLeft:300, timerInterval:null, currentScreen:'landing',
  puzzleStartTime:null,
  sourceCards:[],
  slottedCards:Array(6).fill(null),
  lockedMask:Array(6).fill(false),
  draggingCard:null, draggingFromSlot:null,
  shuffledQuestions:[], currentQIdx:0, correctStreak:0, answering:false,
  leaderboard: JSON.parse(localStorage.getItem('aiGame_lb')||'[]'),
};

const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
const $=id=>document.getElementById(id);

/* ======= TIMER ======= */
function startTimer(){
  clearInterval(state.timerInterval);
  state.timerInterval=setInterval(()=>{
    state.timeLeft=Math.max(0,state.timeLeft-1); updateHUD();
    if(state.timeLeft<=0){stopTimer();handleTimeUp();}
  },1000);
}
function stopTimer(){clearInterval(state.timerInterval);state.timerInterval=null;}
function handleTimeUp(){if(['puzzle','trueorfalse'].includes(state.currentScreen))showGameOver('time');}

/* ======= HUD ======= */
function updateHUD(){
  const tv=$('timer-value'),sv=$('score-value'),ld=$('lives-display');
  if(tv){tv.textContent=fmt(state.timeLeft);$('timer-wrap').classList.toggle('urgent',state.timeLeft<30);}
  if(sv)sv.textContent=state.score;
  if(ld)ld.innerHTML=[0,1,2].map(i=>`<span class="heart ${i<state.lives?'alive':'dead'}">${i<state.lives?'❤️':'🖤'}</span>`).join('');
}
function showHUD(v){const h=$('game-hud');if(h)h.style.display=v?'flex':'none';}
function showWidget(v){const w=$('lb-widget');if(w)w.classList.toggle('show',v);}

/* ======= SCREENS ======= */
function showScreen(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  showHUD(['puzzle','trueorfalse'].includes(name));
  showWidget(name!=='landing');
  const el=$('screen-'+name);
  if(el)el.classList.add('active');
  updateHUD(); state.currentScreen=name;
}

/* ======= TOAST ======= */
function showToast(msg){
  const t=$('toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2800);
}

/* ======= LANDING ======= */
function initLanding(){
  const btn=$('btn-start'),inp=$('player-name');
  const go=()=>{
    const name=inp.value.trim();
    if(!name){inp.classList.add('shake');setTimeout(()=>inp.classList.remove('shake'),500);return;}
    state.playerName=name;state.score=0;state.lives=3;state.timeLeft=300;state.correctStreak=0;
    initPuzzle();showScreen('puzzle');startTimer();
  };
  btn.addEventListener('click',go);
  inp.addEventListener('keydown',e=>e.key==='Enter'&&go());
}

/* ======= PUZZLE ======= */
function initPuzzle(){
  state.puzzleStartTime=Date.now();
  state.slottedCards=Array(6).fill(null);
  state.lockedMask=Array(6).fill(false);
  state.draggingCard=null;state.draggingFromSlot=null;
  state.sourceCards=shuffle([
    ...CORRECT_ORDER.map(c=>({...c,isDecoy:false})),
    ...DECOY_CARDS,
  ]);
  $('puzzle-explains').innerHTML='';
  updateExplainEmpty();
  renderPuzzle();
}

function renderPuzzle(){renderSlots();renderSource();}

function renderSlots(){
  const el=$('puzzle-slots');el.innerHTML='';
  for(let i=0;i<6;i++){
    const slot=document.createElement('div');
    const locked=state.lockedMask[i];
    const card=state.slottedCards[i];
    slot.className='puz-slot'+(locked?' locked':'')+(card&&!locked?' occupied':'');
    slot.dataset.idx=i;
    const num=document.createElement('span');num.className='slot-num';num.textContent=i+1;
    slot.appendChild(num);
    if(card){
      const cd=document.createElement('div');
      cd.className='p-card'+(locked?' locked-card':'');
      cd.style.cssText=`border-color:${card.color};${locked?`box-shadow:0 0 14px ${card.glow||'transparent'};`:''}width:100%;margin-top:4px;`;
      cd.innerHTML=`<span class="p-icon">${card.icon}</span><span class="p-text">${card.text}</span>`;
      if(!locked){
        cd.draggable=true;
        cd.addEventListener('dragstart',e=>{
          state.draggingCard=card;state.draggingFromSlot=i;
          e.dataTransfer.setData('text/plain',String(card.id));
          setTimeout(()=>cd.classList.add('dragging'),0);
        });
        cd.addEventListener('dragend',()=>{cd.classList.remove('dragging');state.draggingCard=null;state.draggingFromSlot=null;});
        // Click to return
        cd.addEventListener('click',()=>{returnCardFromSlot(i);});
      }
      slot.appendChild(cd);
    } else if(!locked){
      const hint=document.createElement('div');hint.className='slot-empty-hint';hint.textContent='Drop di sini';
      slot.appendChild(hint);
    }
    if(!locked){
      slot.addEventListener('dragover',e=>{e.preventDefault();slot.classList.add('drag-over');});
      slot.addEventListener('dragleave',()=>slot.classList.remove('drag-over'));
      slot.addEventListener('drop',e=>{e.preventDefault();slot.classList.remove('drag-over');handleDropToSlot(i);});
    }
    el.appendChild(slot);
  }
}

function renderSource(){
  const el=$('puzzle-source');el.innerHTML='';
  state.sourceCards.forEach(c=>{
    const card=document.createElement('div');
    card.className='p-card';
    card.style.cssText=`border-color:${c.isDecoy?'rgba(84,110,122,0.4)':c.color};${c.isDecoy?'':'box-shadow:0 2px 10px '+(c.glow||'transparent')+';'}`;
    card.draggable=true;
    card.innerHTML=`<span class="p-icon">${c.icon}</span><span class="p-text">${c.text}</span>`;
    card.addEventListener('dragstart',e=>{
      state.draggingCard=c;state.draggingFromSlot=null;
      e.dataTransfer.setData('text/plain',String(c.id));
      setTimeout(()=>card.classList.add('dragging'),0);
    });
    card.addEventListener('dragend',()=>{card.classList.remove('dragging');state.draggingCard=null;state.draggingFromSlot=null;});
    el.appendChild(card);
  });
}

function handleDropToSlot(idx){
  const c=state.draggingCard;
  if(!c||state.lockedMask[idx])return;
  const fromSlot=state.draggingFromSlot;
  const existing=state.slottedCards[idx];
  // Place card in target slot
  state.slottedCards[idx]=c;
  if(fromSlot!==null){
    // Dragged from another slot
    state.slottedCards[fromSlot]=existing||null;
    if(existing){}// existing goes to fromSlot
  } else {
    // Dragged from source
    state.sourceCards=state.sourceCards.filter(x=>x.id!==c.id);
    if(existing){
      // Return existing card to source
      state.sourceCards.push(existing);
    }
  }
  state.draggingCard=null;state.draggingFromSlot=null;
  renderPuzzle();
}

function returnCardFromSlot(idx){
  const c=state.slottedCards[idx];
  if(!c||state.lockedMask[idx])return;
  state.slottedCards[idx]=null;
  state.sourceCards.push(c);
  renderPuzzle();
}

/* ======= CHECK PUZZLE ======= */
function checkPuzzle(){
  // Check if unlocked slots all have cards
  const unfilledExists=state.slottedCards.some((c,i)=>!state.lockedMask[i]&&c===null);
  if(unfilledExists){showToast('⚠️ Isi semua slot yang belum terkunci dulu!');return;}

  let wrong=0,newLocked=0;
  for(let i=0;i<6;i++){
    if(state.lockedMask[i])continue;
    const card=state.slottedCards[i];
    if(!card)continue;
    if(CORRECT_ORDER[i].id===card.id){
      // CORRECT — lock it
      state.lockedMask[i]=true;
      showInlineExplanation(i);
      newLocked++;
    } else {
      // WRONG — return to pool
      state.sourceCards.push(card);
      state.slottedCards[i]=null;
      wrong++;
    }
  }
  if(wrong>0){
    const penalty=wrong*10;
    state.timeLeft=Math.max(0,state.timeLeft-penalty);
    updateHUD();
    showToast(`❌ ${wrong} kartu salah posisi! −${penalty} detik`);
    const slotsEl=$('puzzle-slots');
    slotsEl.classList.add('shake');setTimeout(()=>slotsEl.classList.remove('shake'),500);
  }
  if(newLocked>0&&wrong===0)showToast(`✅ Semua benar! +${newLocked} terkunci!`);
  else if(newLocked>0)showToast(`✅ ${newLocked} kartu benar terkunci!`);

  renderPuzzle();updateExplainEmpty();
  if(state.lockedMask.every(v=>v))setTimeout(handlePuzzleWin,600);
}

function updateExplainEmpty(){
  const empty=$('puz-explain-empty');
  const hasAny=$('puzzle-explains').children.length>0;
  if(empty)empty.style.display=hasAny?'none':'flex';
}

function showInlineExplanation(stepIdx){
  const data=STEP_EXPLANATIONS[stepIdx];
  if(document.getElementById('ie-'+stepIdx))return;
  const el=document.createElement('div');
  el.className='ie-card';el.id='ie-'+stepIdx;
  el.style.borderLeftColor=data.color;
  el.innerHTML=`<span class="ie-num" style="color:${data.color}">${data.step}</span><span class="ie-icon">${data.icon}</span><div class="ie-body"><strong style="color:${data.color}">${data.title}</strong><p>${data.text}</p></div>`;
  $('puzzle-explains').appendChild(el);
  if(typeof gsap!=='undefined')gsap.from(el,{opacity:0,x:20,duration:.45,ease:'back.out(1.5)'});
}

function handlePuzzleWin(){
  let pts=50;const elapsed=(Date.now()-state.puzzleStartTime)/1000;
  if(elapsed<60)pts+=20;
  state.score+=pts;stopTimer();
  const cel=$('celebration');cel.style.display='flex';
  cel.innerHTML=`<div class="celeb-box"><span class="celeb-emoji">🎉</span><h2>Puzzle Selesai!</h2><p>Kamu berhasil menyusun semua langkah berpikir kritis!<br><strong>+${pts} poin</strong>${elapsed<60?' (speed bonus +20 termasuk!)':''}</p><button id="btn-celeb-next" class="btn-p" style="margin-top:12px">Lanjut ke Game 2 →</button></div>`;
  if(typeof gsap!=='undefined')gsap.from('.celeb-box',{scale:.5,opacity:0,duration:.5,ease:'back.out(1.7)'});
  $('btn-celeb-next').addEventListener('click',()=>{cel.style.display='none';initTrueOrFalse();showScreen('trueorfalse');startTimer();});
}

/* ======= TRUE OR FALSE ======= */
function initTrueOrFalse(){
  state.shuffledQuestions=shuffle(QUESTIONS);
  state.currentQIdx=0;state.correctStreak=0;state.answering=false;
  renderQuestion();
}

function renderQuestion(){
  const q=state.shuffledQuestions[state.currentQIdx];
  const total=state.shuffledQuestions.length;
  $('tf-question-area').innerHTML=`
    <div class="q-num">Soal ${state.currentQIdx+1} dari ${total}</div>
    <div class="q-streak-bar ${state.correctStreak>=2?'hot':''}">${state.correctStreak>0?`🔥 Streak ${state.correctStreak}x${state.correctStreak>=2?' — Satu lagi +15!':''}`:' '}</div>
    <div class="q-card" id="q-card">
      <div class="q-label">Apakah pernyataan ini BENAR atau SALAH?</div>
      <p class="q-text">"${q.text}"</p>
    </div>
    <div class="q-btns">
      <button class="btn-benar" id="btn-benar">✅ BENAR</button>
      <button class="btn-salah" id="btn-salah">❌ SALAH</button>
    </div>`;
  $('btn-benar').addEventListener('click',()=>submitAnswer(true));
  $('btn-salah').addEventListener('click',()=>submitAnswer(false));
  if(typeof gsap!=='undefined')gsap.from('#q-card',{y:30,opacity:0,duration:.4,ease:'back.out(1.5)'});
}

function submitAnswer(ans){
  if(state.answering)return;state.answering=true;
  const q=state.shuffledQuestions[state.currentQIdx];
  const ok=ans===q.answer;
  const card=$('q-card');
  if(ok){
    state.score+=10;state.correctStreak++;
    if(state.correctStreak%3===0){state.score+=15;showToast('🔥 Streak '+state.correctStreak+'x! +15 bonus!');}
    card.classList.add('flash-ok');
    showFeedback(true,q.explanation,nextQuestion);
  } else {
    state.score=Math.max(0,state.score-5);state.lives--;state.correctStreak=0;
    card.classList.add('flash-no');updateHUD();
    if(state.lives<=0)showFeedback(false,q.explanation,()=>{stopTimer();showGameOver('lives');});
    else showFeedback(false,q.explanation,nextQuestion);
  }
}

function showFeedback(ok,expl,cb){
  const el=$('tf-feedback');
  el.innerHTML=`<div class="fb-box ${ok?'fb-ok':'fb-no'}">
    <div class="fb-icon">${ok?'🎯':'💔'}</div>
    <div class="fb-title">${ok?'Benar!':'Salah!'}</div>
    <p class="fb-explain">${expl}</p>
    <button class="btn-p" id="btn-fb-next">${state.currentQIdx+1<state.shuffledQuestions.length?'Lanjut →':'Lihat Hasil →'}</button>
  </div>`;
  el.style.display='flex';
  if(typeof gsap!=='undefined')gsap.from('.fb-box',{scale:.6,opacity:0,duration:.4,ease:'back.out(1.7)'});
  $('btn-fb-next').addEventListener('click',()=>{el.style.display='none';state.answering=false;cb();});
}

function nextQuestion(){
  state.currentQIdx++;
  if(state.currentQIdx>=state.shuffledQuestions.length){stopTimer();showRecap();}
  else renderQuestion();
}

/* ======= GAME OVER ======= */
function showGameOver(reason){
  stopTimer();
  $('gameover-content').innerHTML=`<div class="go-wrap">
    <div class="go-icon">${reason==='time'?'⏰':'💔'}</div>
    <h2 style="font-family:var(--font2);font-size:1.8rem">${reason==='time'?'Waktu Habis!':'Nyawa Habis!'}</h2>
    <p style="color:var(--muted)">${reason==='time'?'Sesi berakhir. Skor terkunci!':'Semua nyawa habis. Tetap semangat!'}</p>
    <div class="go-score-big">${state.score} <span style="font-size:1rem;color:var(--muted)">poin</span></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
      <button class="btn-p" id="btn-go-lb">🏆 Leaderboard</button>
      <button class="btn-s" id="btn-go-again">🔄 Main Lagi</button>
    </div></div>`;
  showHUD(false);showScreen('gameover');
  $('btn-go-lb').addEventListener('click',()=>{saveLeaderboard();showLeaderboard();});
  $('btn-go-again').addEventListener('click',()=>showScreen('landing'));
}

/* ======= RECAP ======= */
function showRecap(){
  saveLeaderboard();
  $('recap-content').innerHTML=`
    <div class="recap-top">
      <div class="recap-avatar">🎓</div>
      <h2>${state.playerName}</h2>
      <div class="recap-pts">${state.score}</div>
      <div class="recap-ptslabel">Total Poin</div>
    </div>
    <div class="recap-stats">
      <div class="stat"><span class="stat-ic">⏱️</span><span>Sisa Waktu</span><strong>${fmt(state.timeLeft)}</strong></div>
      <div class="stat"><span class="stat-ic">❤️</span><span>Sisa Nyawa</span><strong>${state.lives}</strong></div>
      <div class="stat"><span class="stat-ic">🔥</span><span>Streak Maks</span><strong>${state.correctStreak}x</strong></div>
    </div>
    <div class="recap-acts">
      <button class="btn-p" id="btn-rc-lb">🏆 Leaderboard</button>
      <button class="btn-s" id="btn-rc-again">🔄 Main Lagi</button>
    </div>`;
  showHUD(false);showScreen('recap');
  $('btn-rc-lb').addEventListener('click',showLeaderboard);
  $('btn-rc-again').addEventListener('click',()=>showScreen('landing'));
  if(typeof gsap!=='undefined')gsap.from('.recap-top',{y:40,opacity:0,duration:.5,ease:'back.out(1.5)'});
}

/* ======= LEADERBOARD ======= */
function saveLeaderboard(){
  const e={name:state.playerName,score:state.score,date:new Date().toLocaleDateString('id-ID')};
  state.leaderboard.push(e);
  state.leaderboard.sort((a,b)=>b.score-a.score);
  state.leaderboard=state.leaderboard.slice(0,10);
  localStorage.setItem('aiGame_lb',JSON.stringify(state.leaderboard));
  updateLeaderboardWidget();
}

function showLeaderboard(){
  const el=$('lb-list');el.innerHTML='';
  const medals=['🥇','🥈','🥉'];
  state.leaderboard.forEach((e,i)=>{
    const row=document.createElement('div');
    row.className='lb-row'+(e.name===state.playerName&&e.score===state.score?' me':'');
    row.innerHTML=`<span class="lb-rank">${medals[i]||'#'+(i+1)}</span><span class="lb-name">${e.name}</span><span class="lb-sc">${e.score}</span><span class="lb-dt">${e.date}</span>`;
    el.appendChild(row);
    if(typeof gsap!=='undefined')gsap.from(row,{y:30,opacity:0,delay:i*.1,duration:.4,ease:'back.out(1.5)'});
  });
  if(!state.leaderboard.length)el.innerHTML='<p class="lb-empty">Jadilah yang pertama! 🚀</p>';
  showScreen('leaderboard');setTimeout(launchConfetti,350);
}

function updateLeaderboardWidget(){
  const el=$('lb-widget-list');if(!el)return;
  el.innerHTML='';
  const medals=['🥇','🥈','🥉'];
  state.leaderboard.slice(0,5).forEach((e,i)=>{
    const row=document.createElement('div');row.className='lbw-row';
    row.innerHTML=`<span class="lbw-rank">${medals[i]||'#'+(i+1)}</span><span class="lbw-name">${e.name}</span><span class="lbw-sc">${e.score}</span>`;
    el.appendChild(row);
  });
  if(!state.leaderboard.length)el.innerHTML='<p style="font-size:.7rem;color:var(--muted);padding:4px 0">Belum ada pemain</p>';
}

function launchConfetti(){
  if(typeof confetti==='undefined')return;
  confetti({particleCount:130,spread:80,origin:{y:.5}});
  setTimeout(()=>confetti({particleCount:80,angle:60,spread:60,origin:{x:0}}),400);
  setTimeout(()=>confetti({particleCount:80,angle:120,spread:60,origin:{x:1}}),650);
}

document.addEventListener('DOMContentLoaded',()=>{
  initLanding();
  updateLeaderboardWidget();
  $('btn-check-puzzle').addEventListener('click',checkPuzzle);
  $('btn-reset-puzzle').addEventListener('click',()=>{
    state.slottedCards=Array(6).fill(null);
    state.lockedMask=Array(6).fill(false);
    state.sourceCards=shuffle([
      ...CORRECT_ORDER.map(c=>({...c,isDecoy:false})),
      ...DECOY_CARDS,
    ]);
    $('puzzle-explains').innerHTML='';
    updateExplainEmpty();
    renderPuzzle();
  });
  $('btn-lb-again').addEventListener('click',()=>showScreen('landing'));
  if(typeof gsap!=='undefined')gsap.from('.land-wrap',{y:50,opacity:0,duration:.8,ease:'back.out(1.4)'});
});
