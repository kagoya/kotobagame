function makeHomeStarLayout(score,width,height){
  const count=Math.min(10000,Math.max(0,Math.floor(score)));
  if(!count||width<=0||height<=0)return [];
  let seed=(count*2654435761+Math.round(width)*17+Math.round(height))>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const cell=Math.min(34,Math.sqrt(width*height/(count*1.5)));
  const cols=Math.max(1,Math.floor(width/cell));
  const rows=Math.max(1,Math.floor(height/cell));
  const dx=width/cols,dy=height/rows;
  const candidates=[];
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    candidates.push({x:(col+.5)*dx,y:(row+.5)*dy});
  }
  const size=Math.min(28,cell*.66);
  for(let i=candidates.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [candidates[i],candidates[j]]=[candidates[j],candidates[i]];
  }
  const stars=candidates.slice(0,count).map(p=>({
    x:p.x+(random()-.5)*cell*.22,y:p.y+(random()-.5)*cell*.22,size
  }));
  // Very narrow viewports may have fewer grid cells than points.
  while(stars.length<count)stars.push({x:random()*width,y:random()*height,size});
  return stars.map((star,index)=>{
    const point=index+1;
    const tier=point%100===0?100:point%10===0?10:1;
    return {...star,tier,size:star.size*(tier===100?2.2:tier===10?1.5:1)};
  });
}
function createScoreStars(canvas,readScore){
  let frame=0,sprite,lastKey;
  function draw(){
    frame=0;
    const score=readScore();
    const width=document.documentElement.clientWidth;
    const height=document.documentElement.clientHeight;
    const ratio=Math.min(2,window.devicePixelRatio||1);
    const key=[score,width,height,ratio].join(':');
    if(key===lastKey)return;
    lastKey=key;
    canvas.hidden=!score;
    document.body.classList.toggle('show-score-stars',score>0);
    if(!score||!width||!height)return;
    canvas.width=Math.round(width*ratio);
    canvas.height=Math.round(height*ratio);
    const context=canvas.getContext('2d');
    if(!context)return;
    if(!sprite){
      const glyph=document.createElement('canvas');
      glyph.width=glyph.height=64;
      const brush=glyph.getContext('2d');
      if(!brush)return;
      brush.font='48px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
      brush.textAlign='center';
      brush.textBaseline='middle';
      brush.fillText('⭐',32,33);
      sprite=glyph;
    }
    context.setTransform(ratio,0,0,ratio,0,0);
    context.globalAlpha=.88;
    const stars=makeHomeStarLayout(score,width,height);
    const stripHeight=window.matchMedia("(max-width: 600px)").matches?26:0;
    const stripCount=Math.min(stars.length,Math.floor(width/15));
    const prominent=stripHeight?new Set(stars.filter(s=>s.tier===100).concat(
      stars.filter(s=>s.tier===10),stars.filter(s=>s.tier===1)
    ).slice(0,stripCount)):new Set();
    const drawStar=(x,y,size)=>context.drawImage(sprite,x-size/2,y-size/2,size,size);
    for(const star of stars){
      if(!prominent.has(star))drawStar(star.x,stripHeight+star.y*(height-stripHeight)/height,star.size);
    }
    let index=0;
    for(const star of prominent){
      const size=star.tier===100?18:star.tier===10?14:10;
      drawStar((++index-.5)*width/prominent.size,stripHeight/2,size);
    }
    canvas.dataset.starCount=String(stars.length);
  }
  function queue(){
    if(!frame)frame=requestAnimationFrame(draw);
  }
  window.addEventListener('resize',queue,{passive:true});
  window.addEventListener('pageshow',queue);
  queue();
  return queue;
}
