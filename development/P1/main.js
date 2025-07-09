// main.js

// 診断結果を記録するための構造
const answers = [];

// ラジオボタン選択時に「次へ」ボタンを有効化
document.querySelectorAll('input[name="answer"]').forEach((el) => {
  el.addEventListener('change', () => {
    document.getElementById('next-btn').disabled = false;
  });
});

// 「次へ」ボタン押下時の処理
document.getElementById('next-btn').addEventListener('click', () => {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (selected) {
    answers.push(selected.value);
    // ここで次の質問画面に進む処理を後で追加
    alert(`選択: ${selected.value}\n（この後、次の質問へ進みます）`);
    // 次の質問表示ロジックは今後追加
  }
});