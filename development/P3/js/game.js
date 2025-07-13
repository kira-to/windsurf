// --- グローバル変数 ---
let answer, tries;
const input    = document.getElementById('guess');
const logDom   = document.getElementById('log');
const btnAgain = document.getElementById('again');
const setsunaArea = document.getElementById('setsuna-area');
const towaArea   = document.getElementById('towa-area');
const setsunaBalloon = document.getElementById('setsuna-balloon');
const towaBalloon   = document.getElementById('towa-balloon');
const btnGuess = document.getElementById('btn-guess');

function hide(...els) {
  els.forEach(el => { if(el) el.classList.add('hide'); });
}
function show(...els) {
  els.forEach(el => { if(el) el.classList.remove('hide'); });
}
function restartJumpAnimation(area) {
  area.classList.remove('jump');
  void area.offsetWidth;
  area.classList.add('jump');
}
function showChar(dir, msg) {
  if(dir==='up')  {
    setsunaBalloon.textContent = msg;
    show(setsunaArea); hide(towaArea);
    restartJumpAnimation(setsunaArea);
  }
  if(dir==='down'){
    towaBalloon.textContent = msg;
    show(towaArea); hide(setsunaArea);
    restartJumpAnimation(towaArea);
  }
}
function hideChar() {
  hide(setsunaArea, towaArea);
  setsunaBalloon.textContent = '';
  towaBalloon.textContent = '';
}
const gameUI   = document.getElementById('game-ui');
const scene    = document.querySelector('.scene');
const book     = document.getElementById('book');
const cover    = document.getElementById('cover');
const page     = document.getElementById('page');

function initGame() {
  answer = Math.floor(Math.random()*100)+1;
  tries = 0;
  hide(setsunaArea, towaArea, btnAgain);
  setsunaBalloon.textContent = '';
  towaBalloon.textContent = '';
  logDom.textContent = '1〜100 の整数を当てて！';
  input.value = '';
  input.focus();
  show(gameUI);
}
function onGuess() {
  const n = parseInt(input.value,10);
  if(isNaN(n) || n<1 || n>100) {
    logDom.textContent = '1〜100 の整数を入力してね！';
    hideChar();
    return;
  }
  tries += 1;
  if(n < answer) {
    logDom.textContent = `${tries} 回目：`;
    showChar('up', 'もっと大きいよ！');
  } else if(n > answer) {
    logDom.textContent = `${tries} 回目：`;
    showChar('down', 'もっと小さいよ！');
  } else {
    logDom.textContent = `🎉 正解！ ${tries} 回で当たり`;
    // トワとセツナ両方表示して「おめでとう！」
    setsunaBalloon.textContent = 'おめでとう！';
    towaBalloon.textContent = 'おめでとう！';
    show(setsunaArea, towaArea);
    restartJumpAnimation(setsunaArea);
    restartJumpAnimation(towaArea);
    btnAgain.style.display = '';
  }
}
btnGuess.addEventListener('click', onGuess);
input.addEventListener('keydown', e => { if(e.key==='Enter') onGuess(); });
btnAgain.addEventListener('click', () => {
  btnAgain.style.display = 'none';
  initGame();
});

// 魔導書オープニング演出
function openBookAnimation() {
  // クリックまたは自動で開く
  cover.addEventListener('click', doOpen, {once:true});
  setTimeout(doOpen, 900);
  function doOpen() {
    book.style.transform = 'rotateY(-100deg)';
    setTimeout(()=>{
      scene.style.display = 'none';
      show(gameUI);
      initGame();
    }, 1200);
  }
}
window.onload = openBookAnimation;

// 初期化時はキャラ非表示
hideChar();

// ページ遷移時もキャラ非表示
window.onpageshow = hideChar;

// 魔導書3Dオープニング（3枚ページめくり＆UIフェード）
window.addEventListener('load', ()=>{
  const book = document.getElementById('book');
  const ui   = document.getElementById('game-ui');

  // 表紙を自動で開く（クリック式にしたい場合は click イベントに変更）
  book.classList.add('open');

  // 最後のページ（p3）アニメ終了でゲーム UI 表示
  document.querySelector('.page.p3')
    .addEventListener('animationend', ()=> ui.classList.remove('hide'), { once:true });
});

// 魔導書オープニング演出
function openBookAnimation() {
  // クリックまたは自動で開く
  cover.addEventListener('click', doOpen, {once:true});
  setTimeout(doOpen, 900);
  function doOpen() {
    book.style.transform = 'rotateY(-100deg)';
    setTimeout(()=>{
      scene.style.display = 'none';
      show(gameUI);
      initGame();
    }, 1200);
  }
}
window.onload = openBookAnimation;
