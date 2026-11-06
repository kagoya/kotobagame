function showCelebration(emojis,count=22,host=document.body){
  document.getElementById('celebrationOverlay')?.remove();
  const overlay=document.createElement('div');
  overlay.id='celebrationOverlay';
  overlay.className='celebration-overlay';
  overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML='<svg class="hanamaru" viewBox="0 0 120 120"><circle cx="60" cy="60" r="55" fill="#fffaf0"/><g fill="none" stroke="#e44755" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M48 21Q60 4 72 21Q90 13 94 33Q113 35 107 55Q120 68 103 80Q104 100 84 100Q73 117 59 105Q42 116 33 99Q13 99 15 79Q0 66 13 54Q7 35 26 32Q30 13 48 21Z"/><circle cx="60" cy="62" r="29"/><circle cx="60" cy="62" r="20"/></g></svg>';
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
