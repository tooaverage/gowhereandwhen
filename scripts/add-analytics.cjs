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
  if(url==='/methodology/')html=html.replace('</main>',`<section id="privacy"><h2>Privacy and optional analytics</h2><p>PostHog analytics loads only if you choose Allow analytics. It saves a random visitor ID in browser local storage to measure visits and interactions such as month selections, destination searches and booking-link clicks. Session recording, automatic click capture, advertising features and person profiles are disabled.</p><p>Events include canonical page paths, referring pages, browser/device details and recognized destination or control choices. We strip URL queries and fragments and do not send typed search text or booking details. PostHog receives your network connection; IP-based location enrichment is disabled in our events.</p><p>Your yes/no preference is saved for six months. Use Analytics preferences in the footer to change it; declining stops future tracking and removes analytics storage. Global Privacy Control is respected. Local previews are excluded. Opting out does not delete events already received by PostHog.</p><p>PostHog processes analytics under its <a href="https://posthog.com/privacy">privacy policy</a>. External booking sites have their own policies when you visit them.</p></section></main>`);
  fs.writeFileSync(file,html);
 }
 console.log('Optional PostHog analytics configured on '+urls.length+' canonical pages; tag blocked until consent.');
};
