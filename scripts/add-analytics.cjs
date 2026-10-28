const fs=require('node:fs'),path=require('node:path'),{buildSync,transformSync}=require('esbuild');
module.exports=function addAnalytics(root,out,urls){
 const config=JSON.parse(fs.readFileSync(path.join(root,'analytics.config.json')));
 const id=(process.env.POSTHOG_PROJECT_TOKEN||config.projectToken||'').trim();
 if(!id){console.log('Analytics not enabled: waiting for a PostHog project token.');return;}
 if(!/^phc_[a-zA-Z0-9]+$/.test(id))throw Error('Invalid POSTHOG_PROJECT_TOKEN');
 const host=(process.env.POSTHOG_API_HOST||config.apiHost||'').trim();
 if(!['https://us.i.posthog.com','https://eu.i.posthog.com'].includes(host))throw Error('Invalid POSTHOG_API_HOST');
 const result=buildSync({entryPoints:[path.join(root,'scripts/analytics.js')],outdir:path.join(out,'storybook'),bundle:true,format:'esm',splitting:true,minify:true,target:'es2022',entryNames:'analytics-[hash]',metafile:true});
 const entry=Object.entries(result.metafile.outputs).find(([,info])=>info.entryPoint?.endsWith('scripts/analytics.js'))?.[0];
 if(!entry)throw Error('Analytics entry bundle missing');
 const script='/'+path.relative(out,path.resolve(entry)).split(path.sep).join('/');
 const css=transformSync(fs.readFileSync(path.join(root,'scripts/analytics.css'),'utf8'),{loader:'css',minify:true}).code;
 const head=`<meta name="gww-analytics" content="${id}"><meta name="gww-analytics-host" content="${host}"><style>${css}</style><script type="module" src="${script}"></script>`;
 for(const url of urls){const file=path.join(out,url,'index.html');let html=fs.readFileSync(file,'utf8').replace('</head>',head+'</head>');
  if(url==='/methodology/')html=html.replace('</main>',`<section id="privacy"><h2>Privacy and optional analytics</h2><p>PostHog analytics runs by default to measure visits and interactions such as month selections, destination searches and booking-link clicks. Your browser keeps one random visitor ID in local storage so we can count return visits. It holds nothing about you, is never linked to a name or email, and expires 12 months after it is set; later visits do not extend it. PostHog keeps the current visit in session storage, which clears when you close the tab. No analytics cookies are set. Session recording, automatic click capture, advertising features and person profiles are disabled.</p><p>Events include canonical page paths, referring pages, browser/device details and recognized destination or control choices. We strip URL queries and fragments and do not send typed search text or booking details. PostHog receives your network connection; IP-based location enrichment is disabled in our events.</p><p>Your preference is saved in local storage. A refusal remains in effect until you change it. Use Analytics preferences in the footer to change it; disabling stops future tracking and deletes the visitor ID. Previously saved refusals are honoured. Global Privacy Control is respected and also deletes the visitor ID. Local previews are excluded. Opting out does not delete events already received by PostHog.</p><p>PostHog processes analytics under its <a href="https://posthog.com/privacy">privacy policy</a>. External booking sites have their own policies when you visit them.</p></section></main>`);
  fs.writeFileSync(file,html);
 }
 console.log('Optional PostHog analytics configured on '+urls.length+' canonical pages; 12-month visitor ID and opt-out controls enabled.');
};
