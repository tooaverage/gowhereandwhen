const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'analytics.js'),'utf8');
function run({host='gowhereandwhen.com',id='G-TESTONLY',saved=null,gpc=false}={}){
 const nodes=[],scripts=[],events={},stored=new Map(),cookies=[];
 function node(tag){return {tag,dataset:{},hidden:false,listeners:{},setAttribute(){},append(){},focus(){},querySelector(){return {focus(){}};},addEventListener(n,f){this.listeners[n]=f;}};}
 const body={append(n){nodes.push(n);}};
 const document={querySelector(s){return s.startsWith('meta')?{content:id}:body;},createElement:node,head:{append(n){scripts.push(n);}},body,title:'Austria',referrer:'https://example.com/travel?email=private',addEventListener(n,f){events[n]=f;}};
 Object.defineProperty(document,'cookie',{get(){return '_ga=one; _ga_TESTONLY=two; essential=keep';},set(v){cookies.push(v);}});
 if(saved)stored.set('gww-analytics-choice-v1',JSON.stringify({value:saved,expires:Date.now()+100000}));
 const context={document,window:{},location:{hostname:host,origin:'https://'+host,href:'https://'+host+'/country/austria/?city=Private#secret'},navigator:{globalPrivacyControl:gpc},localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)},URL,Date};
 vm.runInNewContext(source,context);
 return {context,nodes,scripts,events,cookies,choose(value){nodes[0].listeners.click({target:{closest(){return {dataset:{choice:value}};}}});},queue(){return (context.window.dataLayer||[]).map(x=>Array.from(x));}};
}
for(const scenario of [{},{saved:'no'},{saved:'yes',gpc:true}]){const t=run(scenario);assert.equal(t.scripts.length,0,'No Google requests before opt-in or after denial');}
assert.equal(run({host:'127.0.0.1',saved:'yes'}).nodes.length,0,'Local previews excluded');
assert.equal(run({id:'G-bad<script>'}).nodes.length,0,'Invalid ID disabled');
const t=run();t.events['gww:month']({detail:{month:3,country:'austria'}});assert.equal(t.queue().length,0,'No pre-consent event queue');
t.choose('yes');assert.equal(t.scripts.length,1);assert.equal(t.queue().filter(e=>e[0]==='event'&&e[1]==='page_view').length,1);
const config=t.queue().find(e=>e[0]==='config')[2];assert.equal(config.send_page_view,false);assert.equal(config.allow_google_signals,false);assert.equal(config.page_location,'https://gowhereandwhen.com/country/austria/');assert.equal(config.page_referrer,'https://example.com/travel');
t.events['gww:month']({detail:{month:3,country:'austria'}});assert.ok(t.queue().some(e=>e[1]==='select_month'&&e[2].month===4));
const count=t.queue().length;t.events['gww:month']({detail:{month:99,country:'austria'}});t.events['gww:search']({detail:{country:'private@example.com'}});assert.equal(t.queue().length,count,'Invalid inputs not sent');
t.choose('no');const deniedCount=t.queue().length;t.events['gww:month']({detail:{month:1,country:'austria'}});assert.equal(t.queue().length,deniedCount);assert.equal(t.context.window['ga-disable-G-TESTONLY'],true);assert.ok(t.cookies.length);assert.ok(t.cookies.every(c=>c.startsWith('_ga')));
console.log('Passed analytics consent, local exclusion, URL redaction, event validation and withdrawal checks.');
