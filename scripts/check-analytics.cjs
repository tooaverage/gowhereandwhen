const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {transformSync}=require('esbuild');
const controller=fs.readFileSync(path.join(__dirname,'analytics.js'),'utf8').replace("import('./posthog-client.js')", 'loadClient()');
const adapter=transformSync(fs.readFileSync(path.join(__dirname,'posthog-client.js'),'utf8').replace("import posthog from 'posthog-js/dist/module.no-external';",'const posthog = mock;'),{format:'cjs'}).code;
function run({host='gowhereandwhen.com',id='phc_TESTONLY',saved=null,gpc=false,delay=false}={}) {
 const nodes=[],events={},windowEvents={},stored=new Map(),captures=[],configs=[];
 let loads=0,enabled=false,resolve;
 const mock={init(id,config){configs.push(config);},opt_in_capturing(){enabled=true;},opt_out_capturing(){enabled=false;},capture(event,properties){if(enabled){const value=configs[0].before_send({event,properties});if(value)captures.push(value);}}};
 const module={exports:{}};vm.runInNewContext(adapter,{module,exports:module.exports,mock,URL,Set,Object});
 function node(tag){return {tag,dataset:{},hidden:false,listeners:{},setAttribute(){},append(){},focus(){},querySelector(){return {focus(){}};},addEventListener(n,f){this.listeners[n]=f;}};}
 const body={append(n){nodes.push(n);}};
 const document={querySelector(s){return s.includes('analytics-host')?{content:'https://us.i.posthog.com'}:s.startsWith('meta')?{content:id}:body;},createElement:node,body,title:'Austria',referrer:'https://example.com/travel?email=private#hidden',addEventListener(n,f){events[n]=f;}};
 const key='gww-analytics-choice-v2-posthog';
 if(saved)stored.set(key,JSON.stringify({value:saved,expires:Date.now()+100000}));
 const navigator={globalPrivacyControl:gpc};
 const context={document,window:{addEventListener(n,f){windowEvents[n]=f;}},location:{hostname:host,pathname:'/country/austria/',origin:'https://'+host,href:'https://'+host+'/country/austria/?city=Private#secret'},navigator,localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)},URL,Date,loadClient(){loads++;return delay?new Promise(r=>resolve=r):Promise.resolve(module.exports);}};
 vm.runInNewContext(controller,context);
 return {nodes,events,captures,configs,module,navigator,loads:()=>loads,resolve:()=>resolve(module.exports),choose(value){nodes[0].listeners.click({target:{closest(){return {dataset:{choice:value}};}}});},storage(value){windowEvents.storage({key,newValue:JSON.stringify({value,expires:Date.now()+100000})});}};
}
const flush=()=>new Promise(r=>setImmediate(r));
(async()=>{
 for(const scenario of [{},{saved:'no'},{saved:'yes',gpc:true}]){const t=run(scenario);await flush();assert.equal(t.loads(),0,'SDK never loads without consent or with GPC');assert.equal(t.captures.length,0);}
 assert.equal(run({host:'127.0.0.1',saved:'yes'}).nodes.length,0,'Local previews excluded');
 assert.equal(run({id:'phc_bad<script>'}).nodes.length,0,'Invalid token disabled');
 const t=run();t.events['gww:month']({detail:{month:3,country:'austria'}});assert.equal(t.captures.length,0);
 t.choose('yes');await flush();assert.equal(t.loads(),1);assert.equal(t.captures.filter(e=>e.event==='$pageview').length,1);
 const config=t.configs[0];for(const key of ['autocapture','capture_pageview','capture_pageleave','capture_performance','capture_exceptions','save_campaign_params','save_referrer'])assert.equal(config[key],false,key);
 assert.equal(config.disable_session_recording,true);assert.equal(config.advanced_disable_flags,true);assert.equal(config.person_profiles,'never');
 const page=t.captures[0].properties;assert.equal(page.$current_url,'https://gowhereandwhen.com/country/austria/');assert.equal(page.$referrer,'https://example.com/travel');
 t.events['gww:month']({detail:{month:3,country:'austria'}});assert.equal(t.captures.at(-1).properties.month,4);
 const booking={href:'https://www.stay22.com/allez/roam?aid=TEST&address=Panglao',dataset:{bookingProvider:'stay22',bookingType:'accommodation',bookingPlacement:'island',bookingIsland:'panglao'}};
 t.events.click({target:{closest(selector){return selector==='a[href]'?booking:null;}}});
 const click=t.captures.find(e=>e.event==='booking_click');assert.equal(click.properties.provider,'stay22');assert.equal(click.properties.placement,'island');assert.equal(click.properties.island,'panglao');assert.ok(!JSON.stringify(click).includes('aid='),'Booking query strings excluded');
 const count=t.captures.length;t.events['gww:month']({detail:{month:99,country:'austria'}});t.events['gww:search']({detail:{country:'private@example.com'}});assert.equal(t.captures.length,count);
 t.choose('no');t.events['gww:month']({detail:{month:1,country:'austria'}});assert.equal(t.captures.length,count,'Withdrawal stops events');
 assert.equal(config.before_send({event:'$pageview',properties:{}}),null,'Withdrawal blocks pending events');
 t.choose('yes');await flush();assert.equal(t.loads(),1,'Reuse SDK after renewed consent');assert.equal(t.captures.length,count+1);
 t.storage('no');const after=t.captures.length;t.events['gww:search']({detail:{country:'austria'}});assert.equal(t.captures.length,after,'Cross-tab withdrawal honored');
 const late=run({delay:true});late.choose('yes');late.choose('no');late.resolve();await flush();assert.equal(late.configs.length,0,'Withdrawal while SDK loads prevents initialization');
 const race=run({delay:true});race.choose('yes');race.choose('no');race.choose('yes');race.resolve();await flush();assert.equal(race.captures.length,1,'Consent races do not duplicate pageviews');
 const active=run({saved:'yes'});await flush();active.navigator.globalPrivacyControl=true;assert.equal(active.configs[0].before_send({event:'$pageview'}),null);
 const clean=t.module.exports.sanitizeEvent({event:'$pageview',properties:{$current_url:'https://gowhereandwhen.com/?private=yes#secret',$referrer:'https://example.com/?email=secret',email:'secret',utm_campaign:'secret',$set:{email:'secret'},$initial_current_url:'private',distinct_id:'random'}},()=>true);
 assert.equal(clean.properties.email,undefined);assert.equal(clean.properties.$set,undefined);assert.equal(clean.properties.$initial_current_url,undefined);assert.equal(clean.properties.utm_campaign,undefined);assert.equal(clean.properties.$current_url,'https://gowhereandwhen.com/');assert.equal(clean.properties.$geoip_disable,true);
 assert.equal(t.module.exports.sanitizeEvent({event:'$autocapture'},()=>true),null);
 console.log('Passed PostHog consent, SDK isolation, event sanitization, local exclusion, withdrawal and race-condition checks.');
})().catch(error=>{console.error(error);process.exitCode=1;});
