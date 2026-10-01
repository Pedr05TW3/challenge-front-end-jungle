import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import { basename, dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import process from 'node:process';

const config=process.argv[2]||'lighthouserc.json';
const executable=process.env.CHROME_PATH||chromium.executablePath();
const revision=basename(dirname(dirname(executable))).replace('chromium-','');
const browserRoot=dirname(dirname(dirname(executable)));
const headless=process.platform==='win32'?join(browserRoot,`chromium_headless_shell-${revision}`,'chrome-headless-shell-win64','chrome-headless-shell.exe'):process.platform==='darwin'?join(browserRoot,`chromium_headless_shell-${revision}`,'chrome-headless-shell-mac-arm64','chrome-headless-shell'):join(browserRoot,`chromium_headless_shell-${revision}`,'chrome-headless-shell-linux64','chrome-headless-shell');
const child=spawn('npx',['lhci','autorun',`--config=${config}`],{stdio:'inherit',shell:process.platform==='win32',env:{...process.env,CHROME_PATH:existsSync(headless)?headless:executable}});
child.on('error',error=>{console.error(error);process.exitCode=1});
child.on('exit',(code,signal)=>{if(signal){console.error(`LHCI stopped by ${signal}`);process.exitCode=1}else process.exitCode=code??1});
