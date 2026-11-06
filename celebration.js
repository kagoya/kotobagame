function showCelebration(emojis,count=22,host=document.body){
  document.getElementById('celebrationOverlay')?.remove();
  const overlay=document.createElement('div');
  overlay.id='celebrationOverlay';
  overlay.className='celebration-overlay';
  overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML='<svg class="hanamaru" viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><defs><path id="hanamaru-ink" d="M55 28C44 4 22 12 27 35C5 26 1 52 24 59C2 69 11 92 33 83C23 106 46 115 56 94C62 118 88 110 86 88C108 98 118 73 96 63C120 53 110 29 89 37C95 13 70 5 62 27 M63 59C55 54 48 62 52 69C57 79 75 76 78 63C82 49 70 40 56 42C43 44 34 54 36 69C39 84 53 90 67 86C81 82 90 72 92 59"/></defs><use href="#hanamaru-ink" stroke="#fff8eb" stroke-width="11"/><use href="#hanamaru-ink" stroke="#e02b41" stroke-width="6"/></g></svg>';
  for(let i=0;i<count;i++){
    const particle=document.createElement('span');
    particle.className='confetti';
    particle.textContent=emojis[i%emojis.length];
    const spread=(Math.random()-.5)*90;
    const turn=(Math.random()-.5)*500;
    particle.style.setProperty('--apex-x',spread*.7+'vw');
    particle.style.setProperty('--end-x',spread+'vw');
    particle.style.setProperty('--rise',-(55+Math.random()*38)+'vh');
    particle.style.setProperty('--turn',turn+'deg');
    particle.style.setProperty('--end-turn',turn*1.6+'deg');
    particle.style.setProperty('--flight',1.85+Math.random()*.55+'s');
    particle.style.setProperty('--delay',Math.random()*.2+'s');
    overlay.append(particle);
  }
  host.append(overlay);
  setTimeout(()=>overlay.remove(),2650);
}
