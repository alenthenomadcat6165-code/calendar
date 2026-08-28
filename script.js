const state={view:new Date(2026,7,1),selectedCategory:null,editingId:null,categories:[['Class','#5e7290'],['Personal','#95665f'],['Church','#96783f'],['Task','#315f50']],events:[
  {id:1,title:'Design fundamentals',date:'2026-08-23',time:'09:30',category:'Class',location:'North Hall, Room 204',alarm:'30 minutes before'},
  {id:2,title:'Sunday service',date:'2026-08-23',time:'11:00',category:'Church',location:'Community Church',alarm:'30 minutes before'},
  {id:3,title:'Project check-in',date:'2026-08-25',time:'14:00',category:'Task',location:'Online',alarm:'10 minutes before'},
  {id:4,title:'Dinner with Sam',date:'2026-08-27',time:'18:30',category:'Personal',location:'Oak & Pine',alarm:'1 hour before'},
  {id:5,title:'Weekly planning',date:'2026-08-28',time:'10:00',category:'Task',location:'Home',alarm:'30 minutes before'}]};

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const pad=n=>String(n).padStart(2,'0');
const key=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const monthYear=d=>d.toLocaleDateString('en-US',{month:'long',year:'numeric'});
const timeLabel=t=>new Date(`2000-01-01T${t}`).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
const categoryClass=c=>c.toLowerCase();

function calendarDates(view){const first=new Date(view.getFullYear(),view.getMonth(),1),start=new Date(view);start.setDate(1-first.getDay());return Array.from({length:42},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d})}
function renderMini(){
  $('#miniMonthLabel').textContent=monthYear(state.view); const days=calendarDates(state.view);
  $('#miniDays').innerHTML=days.map(d=>{const k=key(d),events=state.events.some(e=>e.date===k);return `<span class="mini-day ${d.getMonth()!==state.view.getMonth()?'muted':''} ${k==='2026-08-22'?'today':''} ${events?'has-event':''}">${d.getDate()}</span>`}).join('');
}
function renderFull(){
  $('#fullMonthLabel').textContent=monthYear(state.view); const days=calendarDates(state.view);
  $('#monthGrid').innerHTML=days.map(d=>{const k=key(d),ev=state.events.filter(e=>e.date===k);return `<button class="day-cell ${d.getMonth()!==state.view.getMonth()?'other':''} ${k==='2026-08-22'?'today':''}" data-date="${k}"><span class="day-number">${d.getDate()}</span>${ev.map(e=>`<div class="cell-event ${categoryClass(e.category)}" data-event-id="${e.id}">${timeLabel(e.time)} ${e.title}</div>`).join('')}</button>`}).join('');
  $$('.day-cell').forEach(el=>el.addEventListener('click',()=>quickAdd(el.dataset.date)));
  $$('.cell-event').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();openEdit(Number(el.dataset.eventId))}));
}
function renderCategories(){
  $('#categories').innerHTML=state.categories.map(([name,color])=>`<div class="category-item ${name===state.selectedCategory?'active':''}" data-category="${name}"><span class="category-dot" style="background:${color}"></span>${name}<small>${state.events.filter(e=>e.category===name).length}</small></div>`).join('');
  $$('.category-item').forEach(el=>el.addEventListener('click',()=>{state.selectedCategory=state.selectedCategory===el.dataset.category?null:el.dataset.category;renderCategories()}));
}
function renderWeek(){
  const names=['SUN','MON','TUE','WED','THU','FRI','SAT']; const events=[...state.events].filter(e=>e.date>='2026-08-22'&&e.date<='2026-08-28').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  $('#weekList').innerHTML=events.map(e=>{const d=new Date(e.date+'T12:00');return `<button class="week-event" data-event-id="${e.id}"><div class="week-date"><b>${names[d.getDay()]}</b><span>${d.getDate()}</span></div><div class="event-line ${categoryClass(e.category)}"><strong>${e.title}</strong><span>${e.location||e.category}</span></div><span class="event-time">${timeLabel(e.time)}</span></button>`}).join('')||'<p>No events this week.</p>';
  $$('.week-event').forEach(el=>el.addEventListener('click',()=>openEdit(Number(el.dataset.eventId))));
}
function openEvent(date=key(new Date(2026,7,22)),category=state.selectedCategory||'Class'){state.editingId=null;$('#eventForm').reset();$('#eventDate').value=date;$('#eventTime').value='09:00';$('#eventCategory').value=category;$('#modalEyebrow').textContent='NEW EVENT';$('#modalTitle').textContent='Add to your calendar';$('#saveEvent').textContent='Add event';$('#editTools').classList.remove('visible');$('#eventDialog').showModal()}
function openEdit(id){const event=state.events.find(e=>e.id===id);if(!event)return;state.editingId=id;$('#eventForm').reset();$('#eventName').value=event.title;$('#eventDate').value=event.date;$('#eventTime').value=event.time;$('#eventCategory').value=event.category;$('#eventLocation').value=event.location||'';$('#eventAlarm').value=event.alarm||'30 minutes before';$('#modalEyebrow').textContent='EDIT EVENT';$('#modalTitle').textContent='Update this event';$('#saveEvent').textContent='Save changes';$('#editTools').classList.add('visible');$('#eventDirections').style.display=event.location?'inline-block':'none';$('#eventDialog').showModal()}
function quickAdd(date){
  if(!state.selectedCategory){openEvent(date);return}
  const title=state.selectedCategory==='Class'?'Class':state.selectedCategory==='Church'?'Sunday service':state.selectedCategory==='Personal'?'Personal time':'New task';
  state.pending={title,date,time:'09:00',category:state.selectedCategory,location:'',alarm:'30 minutes before'};
  $('#confirmCopy').textContent='Check that this looks right before it goes on your calendar.';
  $('#confirmationCard').innerHTML=`<strong>${title}</strong><br>${new Date(date+'T12:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})} at 9:00 AM<br>${state.selectedCategory} · Alarm 30 minutes before`;
  $('#confirmDialog').showModal();
}
function saveEventFromForm(){
  const event={id:Date.now(),title:$('#eventName').value.trim(),date:$('#eventDate').value,time:$('#eventTime').value,category:$('#eventCategory').value,location:$('#eventLocation').value.trim(),alarm:$('#eventAlarm').value};
  if(!event.title||!event.date||!event.time)return false;
  if(state.editingId){const index=state.events.findIndex(e=>e.id===state.editingId);event.id=state.editingId;state.events[index]=event;state.editingId=null}else state.events.push(event);
  refresh();showToast();return true;
}
function refresh(){renderMini();renderFull();renderCategories();renderWeek()}
function showToast(){const t=$('#toast');t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}
function shiftMonth(n){state.view=new Date(state.view.getFullYear(),state.view.getMonth()+n,1);renderMini();renderFull()}
function openMap(mode='search'){
  const location=$('#eventLocation').value.trim();
  const url=mode==='directions'?`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location||'Choose a location')}`;
  window.open(url,'_blank','noopener,noreferrer');
}

function openShare(){
  $('#shareEventList').innerHTML=[...state.events].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).map(e=>`<label class="share-choice"><input type="checkbox" value="${e.id}" checked><span><strong>${e.title}</strong>${new Date(e.date+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})} · ${e.category}</span><time>${timeLabel(e.time)}</time></label>`).join('');
  $('#shareDialog').showModal();
}
function encodeShare(data){return btoa(unescape(encodeURIComponent(JSON.stringify(data))))}
function decodeShare(value){try{return JSON.parse(decodeURIComponent(escape(atob(value))))}catch{return null}}
function makeShareLink(){
  const ids=$$('#shareEventList input:checked').map(input=>Number(input.value));
  if(!ids.length){showToastMessage('Select at least one event');return null}
  const data={description:$('#shareDescription').value.trim(),events:state.events.filter(e=>ids.includes(e.id)).map(({title,date,time,category,location})=>({title,date,time,category,location}))};
  return `${location.href.split('#')[0]}#shared=${encodeShare(data)}`;
}
async function sendShareLink(link){
  if(navigator.share){try{await navigator.share({title:"Grubby's calendar",text:$('#shareDescription').value.trim()||"Here is the calendar I shared with you.",url:link});showToastMessage('Calendar shared');return}catch(error){if(error.name==='AbortError')return}}
  try{await navigator.clipboard.writeText(link);showToastMessage('Link copied — send it to anyone')}catch{prompt('Copy this calendar link:',link)}
}
function renderSharedCalendar(){
  const raw=new URLSearchParams(location.hash.slice(1)).get('shared');if(!raw)return false;const shared=decodeShare(raw);if(!shared?.events?.length)return false;
  state.shared=shared;const first=new Date(shared.events[0].date+'T12:00');state.sharedView=new Date(first.getFullYear(),first.getMonth(),1);$('.app-shell').style.display='none';$('#calendarOverlay').classList.remove('open');$('#sharedView').classList.add('open');$('#sharedView').setAttribute('aria-hidden','false');$('#sharedDescription').textContent=shared.description||'A calendar shared with you.';drawSharedMonth();return true;
}
function drawSharedMonth(){
  $('#sharedMonthLabel').textContent=monthYear(state.sharedView);const days=calendarDates(state.sharedView);
  $('#sharedMonthGrid').innerHTML=days.map(d=>{const k=key(d),events=state.shared.events.filter(e=>e.date===k);return `<div class="day-cell ${d.getMonth()!==state.sharedView.getMonth()?'other':''}"><span class="day-number">${d.getDate()}</span>${events.map(e=>`<div class="cell-event ${categoryClass(e.category)}">${timeLabel(e.time)} ${e.title}${e.location?` · ${e.location}`:''}</div>`).join('')}</div>`}).join('');
}

$('#expandCalendar').addEventListener('click',e=>{e.stopPropagation();$('#calendarOverlay').classList.add('open');$('#calendarOverlay').setAttribute('aria-hidden','false');renderFull()});
$('#miniCard').addEventListener('click',()=>$('#expandCalendar').click());
$('#closeCalendar').addEventListener('click',()=>{$('#calendarOverlay').classList.remove('open');$('#calendarOverlay').setAttribute('aria-hidden','true')});
$('#collapseCategories').addEventListener('click',()=>{$('#calendarOverlay').classList.toggle('collapsed');$('#collapseCategories').textContent=$('#calendarOverlay').classList.contains('collapsed')?'›':'‹'});
['#headerAddEvent','#navAddEvent','#overlayAddEvent'].forEach(s=>$(s).addEventListener('click',()=>openEvent()));
$('#miniPrev').addEventListener('click',e=>{e.stopPropagation();shiftMonth(-1)});$('#miniNext').addEventListener('click',e=>{e.stopPropagation();shiftMonth(1)});$('#fullPrev').addEventListener('click',()=>shiftMonth(-1));$('#fullNext').addEventListener('click',()=>shiftMonth(1));
$('#fullToday').addEventListener('click',()=>{state.view=new Date(2026,7,1);refresh()});$('#todayBtn').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
$('#eventForm').addEventListener('submit',e=>{e.preventDefault();if(saveEventFromForm())$('#eventDialog').close()});
$('#cancelEvent').addEventListener('click',()=>{state.editingId=null;$('#eventDialog').close()});
$('#chooseLocation').addEventListener('click',()=>openMap('search'));
$('#eventDirections').addEventListener('click',()=>{if($('#eventLocation').value.trim())openMap('directions')});
$('#eventLocation').addEventListener('input',()=>{$('#eventDirections').style.display=$('#eventLocation').value.trim()?'inline-block':'none'});
$('#deleteEvent').addEventListener('click',()=>{const event=state.events.find(e=>e.id===state.editingId);if(!event)return;if(confirm(`Delete “${event.title}”?`)){state.events=state.events.filter(e=>e.id!==state.editingId);state.editingId=null;$('#eventDialog').close();refresh();showToastMessage('Event deleted')}});
$('#confirmYes').addEventListener('click',()=>{if(state.pending){state.events.push({...state.pending,id:Date.now()});state.pending=null;refresh();showToast()}});
$('#confirmCancel').addEventListener('click',()=>{state.pending=null});
$('#confirmEdit').addEventListener('click',()=>{const p=state.pending;setTimeout(()=>{openEvent(p.date,p.category);$('#eventName').value=p.title},0)});
$('#addCategory').addEventListener('click',()=>{const name=prompt('Name this category');if(name&&!state.categories.some(([n])=>n.toLowerCase()===name.toLowerCase())){state.categories.push([name,'#6d8178']);state.selectedCategory=name;renderCategories()}});
$('#shareCalendar').addEventListener('click',openShare);$('#cancelShare').addEventListener('click',()=>$('#shareDialog').close());
$('#toggleAllEvents').addEventListener('click',()=>{const boxes=$$('#shareEventList input');const select=boxes.some(b=>!b.checked);boxes.forEach(b=>b.checked=select);$('#toggleAllEvents').textContent=select?'Unselect all':'Select all'});
$('#shareForm').addEventListener('submit',e=>{e.preventDefault();const link=makeShareLink();if(link){$('#shareDialog').close();sendShareLink(link)}});
$('#sharedPrev').addEventListener('click',()=>{state.sharedView=new Date(state.sharedView.getFullYear(),state.sharedView.getMonth()-1,1);drawSharedMonth()});$('#sharedNext').addEventListener('click',()=>{state.sharedView=new Date(state.sharedView.getFullYear(),state.sharedView.getMonth()+1,1);drawSharedMonth()});
$('#editDates').addEventListener('click',()=>{$('#calendarOverlay').classList.add('open');renderFull()});$('#viewUpcoming').addEventListener('click',()=>$('.week-section').scrollIntoView({behavior:'smooth'}));
$$('.nav-item[data-section]').forEach(b=>b.addEventListener('click',()=>{$$('.nav-item').forEach(x=>x.classList.remove('active'));b.classList.add('active');showToastMessage(`${b.dataset.section} selected`)}));
function showToastMessage(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>{t.classList.remove('show');t.textContent='Event added to your calendar'},1800)}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#calendarOverlay').classList.contains('open')&&!$('#eventDialog').open&&!$('#confirmDialog').open)$('#closeCalendar').click()});
refresh();renderSharedCalendar();
