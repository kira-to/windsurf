/***** main.js *****/

// ---------- 質問データ ----------
const questions = [
  {
    text: "Q1. あなたの性格に一番近いものは？",
    options: [
      { label: "穏やかでみんなを和ませるタイプ", value: "リーリー" },
      { label: "好奇心旺盛で行動力があるタイプ", value: "ナルカミ" },
      { label: "優しくて面倒見が良いタイプ",     value: "ミタマ"   },
      { label: "クールで論理的なタイプ",           value: "オロチ"   }
    ]
  },
  {
    text: "Q2. 休日の過ごし方に近いのは？",
    options: [
      { label: "静かな場所で読書や内省",           value: "リーリー" },
      { label: "新しい場所へ冒険＆アクティブ",     value: "ナルカミ" },
      { label: "音楽や芸術にどっぷり浸る",         value: "ミタマ"   },
      { label: "戦略を練りつつゲームや頭脳戦",     value: "オロチ"   }
    ]
  },  // ←★★ カンマが必要
  {
    text: "Q3. 忍術を1つ習得できるなら、どの系統？",
    options: [
      { label: "影に溶け込み味方を守る『護りの術』", value: "リーリー" },
      { label: "電光石火で間合いを詰める『瞬歩の術』", value: "ナルカミ" },
      { label: "心を通わせ癒やす『霊符の術』",         value: "ミタマ"   },
      { label: "策略を張り巡らす『幻惑の術』",         value: "オロチ"   }
    ]
  },
  {
    text: "Q4. 周囲からよく褒められるあなたの長所は？",
    options: [
      { label: "聞き上手で安心感があるところ",         value: "リーリー" },
      { label: "勢いと決断力で場を動かすところ",       value: "ナルカミ" },
      { label: "センスが独特でクリエイティブなところ", value: "ミタマ"   },
      { label: "分析が鋭く計画性が高いところ",         value: "オロチ"   }
    ]
  },
  {
    text: "Q5. 仲間とチームを組むなら、あなたの役割は？",
    options: [
      { label: "サポート役として全体を調和させる",      value: "リーリー" },
      { label: "先陣を切って突き進むリーダー",          value: "ナルカミ" },
      { label: "ムードメーカーとして雰囲気を創る",      value: "ミタマ"   },
      { label: "作戦立案で勝利を引き寄せる参謀",        value: "オロチ"   }
    ]
  }
];

// ---------- 状態管理 ----------
let current = 0;
const answers = [];

// ---------- 要素参照 ----------
const container = document.querySelector(".container");

// ---------- 質問描画 ----------
renderQuestion(current);

function renderQuestion(i) {
  const q = questions[i];

  container.innerHTML = `
    <h1>CNPキャラ診断</h1>
    <form id="quiz-form">
      <div class="question">
        <p>${q.text}</p>
        ${q.options.map(op => `
          <label>
            <input type="radio" name="answer" value="${op.value}">
            ${op.label}
          </label>
        `).join("")}
      </div>
      <button type="button" id="next-btn" disabled>
        ${i === questions.length - 1 ? "結果を見る" : "次へ"}
      </button>
    </form>
  `;

  const nextBtn = document.getElementById("next-btn");
  document.querySelectorAll('input[name="answer"]').forEach(radio => {
    radio.addEventListener("change", () => nextBtn.disabled = false);
  });

  nextBtn.addEventListener("click", () => {
    const selected = document.querySelector('input[name="answer"]:checked');
    if (!selected) return;
    answers.push(selected.value);

    if (++current < questions.length) {
      renderQuestion(current);      // 次の質問へ
    } else {
      showResult();                 // 集計へ
    }
  });
}

// ---------- 結果表示 ----------
function showResult() {
  const score = { リーリー:0, ナルカミ:0, ミタマ:0, オロチ:0 };
  answers.forEach(v => score[v]++);
  const result = Object.entries(score).reduce((a,b)=> a[1]>=b[1]?a:b)[0];

  const meta = {
    "リーリー":{img:"assets/Leelee.avif",   class:"leelee"},
    "ナルカミ":{img:"assets/Narukami.avif", class:"narukami"},
    "ミタマ"  :{img:"assets/Mitama.avif",   class:"mitama"},
    "オロチ"  :{img:"assets/Orochi.avif",   class:"orochi"}
  }[result];

  container.innerHTML = `
    <div class="result-card ${meta.class}">
      <h2>診断結果：あなたの推しは…</h2>
      <img src="${meta.img}" alt="${result}">
      <h1>${result}</h1>
      <p>${message(result)}</p>

      <a id="share-x" class="share-btn" target="_blank">Xでシェア</a><br>
      <button onclick="location.reload()" style="margin-top:1.2rem;">
        もう一度診断する
      </button>
    </div>
  `;

  /* ---------- シェアリンク生成 ---------- */
  const share = document.getElementById('share-x');
  const txt   = encodeURIComponent(`私は「${result}」タイプでした！ #CNPキャラ診断`);
  const url   = encodeURIComponent(location.href);
  share.href  = `https://twitter.com/intent/tweet?text=${txt}&url=${url}`;
}
function message(char){
  return {
    リーリー:"静かに支えるあなたはリーリータイプ！",
    ナルカミ:"情熱全開のナルカミタイプ！",
    ミタマ  :"感性派のミタマタイプ！",
    オロチ  :"知略に長けたオロチタイプ！"
  }[char];
}
