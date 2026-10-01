import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import process from 'node:process';

const root=process.cwd();
async function walk(dir){let all=[];try{for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);all=all.concat(entry.isDirectory()?await walk(path):entry.name.endsWith('.json')?[path]:[])}}catch{}return all}
const median=values=>{const sorted=[...values].sort((a,b)=>a-b);return sorted.length?sorted[Math.floor(sorted.length/2)]:null};
const reports=[];
for(const profile of ['desktop','mobile'])for(const file of await walk(join(root,'reports','lighthouse',profile))){try{const json=JSON.parse(await readFile(file,'utf8'));const lhr=json.lhr||json;if(!lhr.categories||!lhr.audits)continue;reports.push({profile,file:relative(root,file),url:lhr.finalDisplayedUrl||lhr.requestedUrl||'unknown',lhr})}catch{}}
const keyFor=url=>{try{return new URL(url).pathname||'/'}catch{return url}};
const groups=new Map();for(const report of reports){const key=`${report.profile}|${keyFor(report.url)}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(report)}for(const[key,items]of groups)groups.set(key,items.sort((a,b)=>a.file.localeCompare(b.file)).slice(-3));
const scoreKeys=['performance','accessibility','best-practices','seo'];const metricKeys=['largest-contentful-paint','cumulative-layout-shift','total-blocking-time'];
const lines=['# Lighthouse results','',`Generated: ${new Date().toISOString()}`,`Environment: ${process.platform} ${process.arch} · Node ${process.version}`,`Tools: lighthouse ${JSON.parse(await readFile(join(root,'node_modules/lighthouse/package.json'),'utf8')).version} · LHCI ${JSON.parse(await readFile(join(root,'node_modules/@lhci/cli/package.json'),'utf8')).version}`,'','Each cell is the median of three collected runs. Scores are percentages; LCP/TBT are milliseconds; CLS is unitless.','', '| Profile | Page | Runs | Performance | Accessibility | Best Practices | SEO | LCP ms | CLS | TBT ms |','| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |'];
for(const [key,items]of [...groups].sort(([a],[b])=>a.localeCompare(b))){const[profile,path]=key.split('|');const score=key=>Math.round(median(items.map(x=>x.lhr.categories[key]?.score??0))*100);const metric=key=>{const value=median(items.map(x=>x.lhr.audits[key]?.numericValue).filter(Number.isFinite));return value===null?'—':key==='cumulative-layout-shift'?value.toFixed(3):Math.round(value)};lines.push(`| ${profile} | ${path} | ${items.length} | ${score('performance')} | ${score('accessibility')} | ${score('best-practices')} | ${score('seo')} | ${metric('largest-contentful-paint')} | ${metric('cumulative-layout-shift')} | ${metric('total-blocking-time')} |`)}
if(!reports.length)lines.push('| — | No JSON reports found | 0 | — | — | — | — | — | — | — |');
lines.push('','Reports:',...reports.map(r=>`- [${r.file.replaceAll('\\','/')}](${r.file.replaceAll('\\','/')})`),'');
await mkdir(join(root,'reports','lighthouse'),{recursive:true});await writeFile(join(root,'reports','lighthouse','summary.md'),lines.join('\n'));console.log(`Wrote reports/lighthouse/summary.md (${reports.length} LHR files).`);
