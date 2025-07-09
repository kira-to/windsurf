// main.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('loaded');                       // (1) 読込確認

  const nextBtn = document.getElementById('next-btn');
  const radios  = document.querySelectorAll('input[name="answer"]');

  console.log('radio length =', radios.length); // (2) 4 になるはず

  radios.forEach(r => r.addEventListener('change', () => {
    console.log('changed!');                   // (3) 動作確認
    nextBtn.disabled = false;                  // 有効化
  }));

  nextBtn.addEventListener('click', () => {
    const val = document.querySelector('input[name="answer"]:checked').value;
    alert(`選択: ${val}`);
  });
});
