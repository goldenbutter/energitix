import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Remove only long, identical-frame capture stalls, preserving the scroll path.
// Deliberate short opening/closing holds remain intact.
export async function finalizeTeaser(input,outputDirectory,{speed=1.4}={}){
 if(!Number.isFinite(speed)||speed<=0)throw new Error('Playback speed must be positive');
 const duration=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',input],{encoding:'utf8'}).trim());
 const scan=spawnSync('ffmpeg',['-hide_banner','-i',input,'-vf','freezedetect=n=-40dB:d=2','-an','-f','null','-'],{encoding:'utf8',maxBuffer:8*1024*1024});
 if(scan.status!==0)throw new Error(scan.stderr);
 let start=null;const cuts=[];
 for(const line of scan.stderr.split(/[\r\n]/)){
  const begin=line.match(/freeze_start: ([\d.]+)/),end=line.match(/freeze_end: ([\d.]+)/);
  if(begin)start=Number(begin[1]);
  if(end&&start!==null){const stop=Number(end[1]);if(stop-start>4)cuts.push([start+1,stop]);start=null;}
 }
 const ranges=[];let cursor=0;
 for(const [from,to] of cuts){ranges.push([cursor,from]);cursor=to;}ranges.push([cursor,duration]);
 const mp4=path.join(outputDirectory,'energitix-desktop-teaser.mp4');
 const filter=ranges.map(([from,to],i)=>`[0:v]trim=start=${from}:end=${to},setpts=PTS-STARTPTS[v${i}]`).join(';')+';'+ranges.map((_,i)=>`[v${i}]`).join('')+`concat=n=${ranges.length}:v=1:a=0[joined];[joined]setpts=PTS/${speed}[out]`;
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',input,'-filter_complex',filter,'-map','[out]','-an','-c:v','libx264','-preset','medium','-crf','21','-pix_fmt','yuv420p','-r','30','-movflags','+faststart',mp4],{stdio:'inherit'});
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',mp4,'-filter_complex','fps=6,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4','-loop','0',path.join(outputDirectory,'energitix-desktop-teaser.gif')],{stdio:'inherit'});
 return {duration:(duration-cuts.reduce((sum,[a,b])=>sum+b-a,0))/speed,playbackSpeed:speed,removedCaptureStalls:cuts,mp4};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await finalizeTeaser(path.resolve(process.argv[2]),path.resolve(process.argv[3]));
 console.log(JSON.stringify(result,null,2));
 await fs.writeFile(path.resolve('analysis/teaser-recording/finalization.json'),JSON.stringify(result,null,2));
}
