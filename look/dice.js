(function(){'use strict';var STORE_KEY='purse_gold';var OPENING_SUM=1000;var PAYOUT_NUMERATOR=99;var TRAIL_LIMIT=12;var SCRAMBLE_MS=600;var SCRAMBLE_TICK_MS=45;var FLASH_MS=950;var MIN_WAGER=0.01;function grab(id){return document.getElementById(id);}
var purseView=grab('rl-purse');var restockBtn=grab('rl-restock');var dieView=grab('rl-die');var verdictView=grab('rl-verdict');var trailList=grab('rl-trail');var targetInput=grab('rl-target');var targetView=grab('rl-target-view');var chanceView=grab('rl-chance');var payoutView=grab('rl-payout');var wagerInput=grab('rl-wager');var halfBtn=grab('rl-half');var twiceBtn=grab('rl-twice');var allBtn=grab('rl-all');var rollBtn=grab('rl-roll');var frameEl=document.querySelector('.rl-frame-e14e5cb2');if(!purseView||!dieView||!verdictView||!trailList||!targetInput||!targetView||!chanceView||!payoutView||!wagerInput||!rollBtn){return;}
function round2(value){return Math.round(value*100)/100;}
function formatSum(value){return value.toFixed(2);}
function loadPurse(){var kept=null;try{kept=window.localStorage.getItem(STORE_KEY);}catch(err){kept=null;}
var sum=parseFloat(kept);if(!isFinite(sum)||sum<0){sum=OPENING_SUM;}
return round2(sum);}
function savePurse(){try{window.localStorage.setItem(STORE_KEY,String(purse));}catch(err){}}
var purse=loadPurse();var rolling=false;var flashTimer=null;var scrambleTimer=null;function renderPurse(){purseView.textContent=formatSum(purse);}
function currentTarget(){var t=parseInt(targetInput.value,10);if(!isFinite(t)){t=50;}
if(t<2){t=2;}
if(t>98){t=98;}
return t;}
function payoutFor(target){return PAYOUT_NUMERATOR/(target-1);}
function refreshOdds(){var target=currentTarget();targetView.textContent=String(target);chanceView.textContent=(target-1).toFixed(2)+'%';payoutView.textContent=payoutFor(target).toFixed(2)+'×';}
function readWager(){return parseFloat(wagerInput.value);}
function setWager(value){if(!isFinite(value)||value<MIN_WAGER){value=MIN_WAGER;}
value=round2(value);var ceiling=round2(purse);if(ceiling>=MIN_WAGER&&value>ceiling){value=ceiling;}
wagerInput.value=formatSum(value);}
function nudgeWager(factor){var current=readWager();if(!isFinite(current)||current<=0){current=MIN_WAGER;}
setWager(current*factor);}
function denyWager(message){verdictView.textContent=message;wagerInput.classList.remove('rl-deny-e14e5cb2');void wagerInput.offsetWidth;wagerInput.classList.add('rl-deny-e14e5cb2');}
function randomRoll(){var range=100;if(window.crypto&&window.crypto.getRandomValues){var box=new Uint32Array(1);var cap=Math.floor(4294967296/range)*range;var pick=0;do{window.crypto.getRandomValues(box);pick=box[0];}while(pick>=cap);return(pick%range)+1;}
return Math.floor(Math.random()*range)+1;}
function recordRoll(value,won){var dot=document.createElement('li');dot.className=won?'rl-dot rl-dot-win':'rl-dot';dot.textContent=String(value);dot.setAttribute('title','Rolled '+value+(won?' (win)':' (loss)'));trailList.appendChild(dot);while(trailList.children.length>TRAIL_LIMIT){trailList.removeChild(trailList.firstChild);}}
function clearFlash(){dieView.classList.remove('rl-win-e14e5cb2');dieView.classList.remove('rl-lose-e14e5cb2');if(frameEl){frameEl.classList.remove('rl-win-e14e5cb2');frameEl.classList.remove('rl-lose-e14e5cb2');}}
function flashOutcome(won){clearFlash();if(won){dieView.classList.add('rl-win-e14e5cb2');if(frameEl){frameEl.classList.add('rl-win-e14e5cb2');}}else{dieView.classList.add('rl-lose-e14e5cb2');if(frameEl){frameEl.classList.add('rl-lose-e14e5cb2');}}
if(flashTimer){window.clearTimeout(flashTimer);}
flashTimer=window.setTimeout(clearFlash,FLASH_MS);}
function settleRoll(wager,target,prizeRate){window.clearInterval(scrambleTimer);scrambleTimer=null;dieView.classList.remove('rl-spin-e14e5cb2');var rolled=randomRoll();dieView.textContent=String(rolled);var won=rolled<target;if(won){var prize=round2(wager*prizeRate);purse=round2(purse+prize);savePurse();renderPurse();verdictView.textContent='Rolled '+rolled+' — under '+target+'. The house pays '+formatSum(prize)+'.';}else{var note='Rolled '+rolled+' — needed under '+target+'. The wager is lost.';if(purse<MIN_WAGER){note+=' Tap Restore for fresh chips.';}
verdictView.textContent=note;}
flashOutcome(won);recordRoll(rolled,won);rolling=false;rollBtn.disabled=false;}
function beginRoll(){if(rolling){return;}
var wager=readWager();if(!isFinite(wager)||wager<MIN_WAGER){denyWager('Enter a wager above zero to play.');return;}
wager=round2(wager);if(wager>purse){denyWager('That wager exceeds your demo balance. Lower the stake '+'or tap Restore.');return;}
rolling=true;rollBtn.disabled=true;clearFlash();wagerInput.classList.remove('rl-deny-e14e5cb2');purse=round2(purse-wager);savePurse();renderPurse();var target=currentTarget();var prizeRate=payoutFor(target);verdictView.textContent='The die is rolling…';dieView.classList.add('rl-spin-e14e5cb2');scrambleTimer=window.setInterval(function(){dieView.textContent=String(Math.floor(Math.random()*100)+1);},SCRAMBLE_TICK_MS);window.setTimeout(function(){settleRoll(wager,target,prizeRate);},SCRAMBLE_MS);}
function restock(){if(rolling){return;}
purse=OPENING_SUM;savePurse();renderPurse();clearFlash();setWager(readWager());verdictView.textContent='Complimentary balance restored to '+
formatSum(OPENING_SUM)+'.';}
targetInput.addEventListener('input',refreshOdds);wagerInput.addEventListener('change',function(){setWager(readWager());});if(halfBtn){halfBtn.addEventListener('click',function(){nudgeWager(0.5);});}
if(twiceBtn){twiceBtn.addEventListener('click',function(){nudgeWager(2);});}
if(allBtn){allBtn.addEventListener('click',function(){setWager(purse);});}
rollBtn.addEventListener('click',beginRoll);if(restockBtn){restockBtn.addEventListener('click',restock);}
var brandEl=document.querySelector('.rl-brand-e14e5cb2');var echoEl=grab('rl-echo');if(brandEl&&echoEl){echoEl.textContent=brandEl.textContent.replace(/\s+/g,' ').trim();}
renderPurse();refreshOdds();})();