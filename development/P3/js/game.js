// --- グローバル変数 ---
let answer, tries;
const input    = document.getElementById('guess');
const logDom   = document.getElementById('log');
const btnAgain = document.getElementById('again');
const charUp   = document.getElementById('setsuna');
const charDn   = document.getElementById('towa');
const btnGuess = document.getElementById('btn-guess');
const gameUI   = document.getElementById('game-ui');
const scene    = document.querySelector('.scene');
const book     = document.getElementById('book');
const cover    = document.getElementById('cover');
const page     = document.getElementById('page');

function hide(...els) {
  els.forEach(el => { if(el) el.classList.add('hide'); });
}
function show(...els) {
  els.forEach(el => { if(el) el.classList.remove('hide'); });
}
function restartJumpAnimation(char) {
  char.classList.remove('jump');
  // 強制再描画でアニメ再適用
  void char.offsetWidth;
  char.classList.add('jump');
}
function showChar(dir) {
  if(dir==='up')  { show(charUp);  hide(charDn); restartJumpAnimation(charUp); }
  if(dir==='down'){ show(charDn); hide(charUp); restartJumpAnimation(charDn); }
}
function hideChar() {
  hide(charUp, charDn);
}
function initGame() {
  answer = Math.floor(Math.random()*100)+1;
  tries = 0;
  hide(charUp, charDn, btnAgain);
  logDom.textContent = '1〜100 の整数を当てて！';
  input.value = '';
  input.focus();
  show(gameUI);
}
function onGuess() {
  const n = parseInt(input.value,10);
  if(isNaN(n) || n<1 || n>100) {
    logDom.textContent = '1〜100 の整数を入力してね！';
    return;
  }
  tries += 1;
  if(n < answer) {
    logDom.textContent = `${tries} 回目：もっと大きい`;
    showChar('up');
  } else if(n > answer) {
    logDom.textContent = `${tries} 回目：もっと小さい`;
    showChar('down');
  } else {
    logDom.textContent = `🎉 正解！ ${tries} 回で当たり`;
    hideChar();
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
