// main.js
document.addEventListener('DOMContentLoaded', () => {
  const nextBtn = document.getElementById('next-btn');
  document.querySelectorAll('input[type="radio"][name="answer"]').forEach(radio => {
    ['change', 'click', 'touchstart'].forEach(eventType => {
      radio.addEventListener(eventType, () => {
        nextBtn.disabled = false;
        nextBtn.removeAttribute('disabled');
      });
    });
  });
});
