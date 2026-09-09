const fs=require('node:fs'),path=require('node:path'),{buildSync,transformSync}=require('esbuild');
module.exports=function addAnalytics(root,out,urls){
 const config=JSON.parse(fs.readFileSync(path.join(root,'analytics.config.json')));
 const id=(process.env.GA_MEASUREMENT_ID||config.measurementId||'').trim();
 if(!id){console.log('Analytics not enabled: waiting for a Google Analytics measurement ID.');return;}
 if(!/^G-[A-Z0-9]+$/.test(id))throw Error('Invalid GA_MEASUREMENT_ID');
 const result=buildSync({entryPoints:[path.join(root,'scripts/analytics.js')],outdir:path.join(out,'storybook'),bundle:true,minify:true,target:'es2022',entryNames:'analytics-[hash]',metafile:true});
 const script='/'+path.relative(out,path.resolve(Object.keys(result.metafile.outputs)[0])).split(path.sep).join('/');
 const css=transformSync(fs.readFileSync(path.join(root,'scripts/analytics.css'),'utf8'),{loader:'css',minify:true}).code;
 const head=`<meta name="gww-analytics" content="${id}"><style>${css}</style><script defer src="${script}"></script>`;
 for(const url of urls){const file=path.join(out,url,'index.html');let html=fs.readFileSync(file,'utf8').replace('</head>',head+'</head>');
  if(url==='/methodology/')html=html.replace('</main>','<section id="privacy"><h2>Privacy and optional analytics</h2><p>Google Analytics loads only if you choose Allow analytics. It uses cookies to measure visits, pages and interactions such as month selections, destination searches and booking-link clicks. Google receives browser and device information and may derive approximate location from the connection. We disable Google advertising signals and personalization.</p><p>Our custom events send recognized destination names and control choices, not your typed search text, booking details or URL query strings. Your yes/no preference is saved in this browser for six months. Use Analytics preferences in the footer to change it; declining stops future tracking and clears this site\'s Google Analytics cookies. Global Privacy Control is respected. Local previews are excluded.</p><p>Google processes analytics data under its <a href="https://policies.google.com/privacy">privacy policy</a>. This preference concerns our analytics; external booking sites have their own policies when you visit them.</p></section></main>');
  fs.writeFileSync(file,html);
 }
 console.log('Optional Google Analytics configured on '+urls.length+' canonical pages; tag blocked until consent.');
};
