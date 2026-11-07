(() => {
  'use strict';
  const databaseName = 'kotobagame-wordbook';
  let opening;
  const listeners = new Set();
  const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel(databaseName) : null;

  function notify() {
    for (const listener of listeners) listener();
  }
  if (channel) channel.onmessage = notify;

  function database() {
    if (!opening) {
      opening = new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, 1);
        request.onupgradeneeded = () => {
          const store = request.result.createObjectStore('words', {keyPath: 'id'});
          store.createIndex('category', 'category');
        };
        request.onsuccess = () => {
          const db = request.result;
          db.onversionchange = () => {db.close(); opening = null;};
          resolve(db);
        };
        request.onerror = () => {opening = null; reject(request.error);};
      });
    }
    return opening;
  }

  async function transaction(mode, action) {
    const db = await database();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('words', mode);
      let result;
      tx.oncomplete = () => {
        if (mode === 'readwrite') {
          notify();
          channel?.postMessage('changed');
        }
        resolve(result);
      };
      tx.onabort = tx.onerror = () => reject(tx.error || new Error('ずかんを ほぞんできませんでした。'));
      try {
        action(tx.objectStore('words'), value => {result = value;});
      } catch (error) {
        tx.abort();
        reject(error);
      }
    });
  }

  function storageError() {
    let notice = document.getElementById('wordbookSaveError');
    if (!notice) {
      notice = document.createElement('p');
      notice.id = 'wordbookSaveError';
      notice.setAttribute('role', 'status');
      notice.style.cssText = 'position:fixed;bottom:8px;left:8px;right:8px;z-index:30;background:#fff0d8;color:#663e20;padding:10px;border-radius:10px;font:14px/1.5 sans-serif';
      document.body.append(notice);
    }
    notice.textContent = 'ずかんを ほぞんできませんでした。ぶらうざの ほぞんせっていを かくにんしてね。';
  }

  function normalize(entry) {
    if (!entry || typeof entry.word !== 'string') return null;
    const word = entry.word.trim();
    if (!word || word.length > 40) return null;
    const known = window.WORDBOOK_DATA?.[word];
    const emoji = typeof entry.emoji === 'string' && entry.emoji.length < 60 && !/[<>]/.test(entry.emoji) ? entry.emoji : '';
    const categories = new Set(Object.values(window.WORDBOOK_DATA || {}).map(item => item.category));
    const category = categories.has(entry.category) ? entry.category : known?.category || 'そのほか';
    return {id: word + '|' + category, word, category, emoji: emoji || known?.emoji || ''};
  }

  async function record(entries, game) {
    const batch = [...new Map(entries.map(normalize).filter(Boolean).map(entry => [entry.id, entry])).values()];
    if (!batch.length) return true;
    try {
      await transaction('readwrite', store => {
        for (const entry of batch) {
          const request = store.get(entry.id);
          request.onsuccess = () => {
            const previous = request.result;
            const now = Date.now();
            store.put({
              ...entry,
              emoji: entry.emoji || previous?.emoji || '',
              first: previous?.first || now,
              last: now,
              games: [...new Set([...(previous?.games || []), game])]
            });
          };
        }
      });
      return true;
    } catch {
      storageError();
      return false;
    }
  }

  function list() {
    return transaction('readonly', (store, done) => {
      store.getAll().onsuccess = event => done(event.target.result);
    });
  }

  function remove(id) {
    return transaction('readwrite', store => store.delete(id));
  }

  function removeCategory(category) {
    return transaction('readwrite', store => {
      const request = store.index('category').openCursor(IDBKeyRange.only(category));
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {cursor.delete(); cursor.continue();}
      };
    });
  }

  window.Wordbook = {
    record, list, remove, removeCategory,
    subscribe(listener) {listeners.add(listener); return () => listeners.delete(listener);}
  };
})();
