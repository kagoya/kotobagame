'use strict';
const get = id => document.getElementById(id);
const GAME_NAMES = {
  row: 'ごじゅうおん', fill: 'あなうめ', shiritori: 'しりとり', trace: 'なぞり',
  tanken: 'ことばたんけん', sound: 'おととことば', find: 'ことばみっけ'
};
let renderVersion = 0;

function speakWord(word) {
  if (!window.speechSynthesis) {
    get('status').textContent = 'この ぶらうざでは よみあげが つかえません。';
    return;
  }
  speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(word);
  voice.lang = 'ja-JP';
  voice.rate = .8;
  voice.onerror = event => {
    if (!['interrupted', 'canceled'].includes(event.error)) get('status').textContent = 'よみを さいせいできませんでした。もういちど おしてね。';
  };
  speechSynthesis.speak(voice);
}

async function render() {
  const version = ++renderVersion;
  try {
    const entries = await Wordbook.list();
    if (version !== renderVersion) return;
    const selected = get('category').value;
    const categories = [...new Set(entries.map(entry => entry.category))].sort((a,b) => a.localeCompare(b,'ja'));
    get('category').replaceChildren(new Option('ぜんぶ', ''), ...categories.map(category => new Option(category, category)));
    get('category').value = categories.includes(selected) ? selected : '';
    const category = get('category').value;
    const visible = entries.filter(entry => !category || entry.category === category).sort((a,b) => a.word.localeCompare(b.word,'ja'));
    get('total').textContent = entries.length + ' ことば';
    get('deleteCategory').disabled = !category;
    get('empty').hidden = visible.length > 0;
    const cards = visible.map(entry => {
      const article = document.createElement('article');
      article.className = 'entry';
      const listen = document.createElement('button');
      listen.className = 'listen';
      listen.setAttribute('aria-label', entry.word + ' を きく');
      listen.onclick = () => speakWord(entry.word);
      const picture = document.createElement('span');
      picture.className = 'picture';
      picture.setAttribute('aria-hidden', 'true');
      const artwork = window.WORDBOOK_ART?.[entry.word];
      if (artwork) picture.innerHTML = artwork;
      else picture.textContent = entry.emoji || '📖';
      const word = document.createElement('span');
      word.className = 'word';
      word.textContent = entry.word;
      listen.append(picture, word);
      const caption = document.createElement('p');
      caption.className = 'kind';
      caption.textContent = entry.category + ' · ' + entry.games.map(game => GAME_NAMES[game]).filter(Boolean).join('・');
      const remove = document.createElement('button');
      remove.className = 'delete';
      remove.textContent = 'けす';
      remove.setAttribute('aria-label', entry.word + ' を ずかんから けす');
      remove.onclick = async () => {
        if (!confirm('「' + entry.word + '」を図鑑から削除しますか？')) return;
        try {
          await Wordbook.remove(entry.id);
          get('status').textContent = '「' + entry.word + '」を けしました。';
        } catch {get('status').textContent = 'けすことが できませんでした。'}
      };
      article.append(listen, caption, remove);
      return article;
    });
    get('entries').replaceChildren(...cards);
  } catch {
    get('status').textContent = 'ずかんを よみこめませんでした。ぶらうざの ほぞんせっていを かくにんしてね。';
  }
}
get('category').onchange = render;
get('deleteCategory').onclick = async () => {
  const category = get('category').value;
  if (!category || !confirm('「' + category + '」のことばをすべて図鑑から削除しますか？')) return;
  try {
    await Wordbook.removeCategory(category);
    get('status').textContent = '「' + category + '」の ことばを けしました。';
  } catch {get('status').textContent = 'けすことが できませんでした。'}
};
Wordbook.subscribe(render);
window.addEventListener('pageshow', render);
render();
