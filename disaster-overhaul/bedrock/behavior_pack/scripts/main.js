import { world, system } from "@minecraft/server";

const CONFIG={checkEveryTicks:200,warningSeconds:20,cooldownTicks:9600};
let cooldown=2400,active=false;
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const players=()=>world.getAllPlayers();
const say=m=>world.sendMessage(`§6[Disaster Overhaul]§r ${m}`);
function cmd(p,c){try{p.dimension.runCommand(c)}catch{}}
function near(p,r=18){return [Math.floor(p.location.x+rand(-r,r)),Math.floor(p.location.y),Math.floor(p.location.z+rand(-r,r))]}
function finish(m){say(`§a${m}`);active=false;cooldown=CONFIG.cooldownTicks}
function timed(name,duration,step,done){say(`§c${name} başladı!`);let n=0;const id=system.runInterval(()=>{if(++n>duration){system.clearRun(id);finish(done);return}step(n)},10)}

function earthquake(){timed("DEPREM",24,n=>{for(const p of players()){try{p.runCommand("camerashake add @s 0.65 0.6 positional")}catch{} if(n%5===0)try{p.applyDamage(1)}catch{}}},"Deprem sona erdi.")}
function meteor(){timed("METEOR YAĞMURU",28,()=>{for(const p of players().slice(0,2)){const [x,y,z]=near(p,22);cmd(p,`summon tnt ${x} ${y+rand(18,30)} ${z}`)}},"Meteor yağmuru sona erdi.")}
function wildfire(){timed("YANGIN FIRTINASI",30,n=>{if(n%2)return;for(const p of players()){const [x,y,z]=near(p,15);cmd(p,`setblock ${x} ${y} ${z} fire keep`)}},"Yangın fırtınası zayıfladı.")}
function tornado(){timed("HORTUM",34,n=>{for(const p of players()){const [x,y,z]=near(p,12);cmd(p,`particle minecraft:basic_smoke_particle ${x} ${y+rand(1,8)} ${z}`);if(n%3===0){try{p.applyKnockback(rand(-10,10)/10,rand(-10,10)/10,1.2,0.45)}catch{}}}},"Hortum dağıldı.")}
function volcano(){timed("VOLKANİK PATLAMA",32,n=>{if(n%2)return;for(const p of players()){const [x,y,z]=near(p,24);cmd(p,`summon tnt ${x} ${y+rand(8,18)} ${z}`);cmd(p,`setblock ${x+rand(-2,2)} ${y} ${z+rand(-2,2)} fire keep`)}},"Volkanik aktivite azaldı.")}
function tsunami(){timed("TSUNAMİ",28,n=>{if(n%3)return;for(const p of players()){const dir=n%2?1:-1;const bx=Math.floor(p.location.x)+dir*rand(8,14),by=Math.floor(p.location.y),bz=Math.floor(p.location.z);for(let i=-4;i<=4;i++)cmd(p,`setblock ${bx} ${by+1} ${bz+i} water keep`)}},"Tsunami dalgası geçti.")}
function blizzard(){timed("TİPİ",32,n=>{for(const p of players()){cmd(p,`effect @a[r=24,x=${Math.floor(p.location.x)},y=${Math.floor(p.location.y)},z=${Math.floor(p.location.z)}] slowness 2 1 true`);if(n%3===0){const [x,y,z]=near(p,16);cmd(p,`particle minecraft:snowflake_particle ${x} ${y+rand(2,8)} ${z}`)}}},"Tipi sona erdi.")}
function sinkhole(){timed("OBRUK",12,n=>{if(n!==2)return;for(const p of players()){const [cx,y,cz]=near(p,12);for(let x=-3;x<=3;x++)for(let z=-3;z<=3;z++)if(x*x+z*z<=10)for(let d=0;d<5;d++)cmd(p,`setblock ${cx+x} ${y-d} ${cz+z} air destroy`)}},"Obruk oluşumu durdu.")}
function superstorm(){timed("SÜPER FIRTINA",38,n=>{for(const p of players()){if(n%4===0){const [x,y,z]=near(p,18);cmd(p,`summon lightning_bolt ${x} ${y} ${z}`)}cmd(p,"weather thunder 20");try{p.applyKnockback(rand(-10,10)/10,rand(-10,10)/10,0.65,0.15)}catch{}}},"Süper fırtına dağıldı.")}
function fireRain(){timed("ATEŞ YAĞMURU",30,n=>{if(n%2)return;for(const p of players()){const [x,y,z]=near(p,20);cmd(p,`summon tnt ${x} ${y+rand(12,24)} ${z}`);cmd(p,`setblock ${x} ${y} ${z} fire keep`)}},"Ateş yağmuru sona erdi.")}

const disasters=[
["DEPREM",earthquake],["METEOR YAĞMURU",meteor],["YANGIN FIRTINASI",wildfire],["HORTUM",tornado],["VOLKANİK PATLAMA",volcano],["TSUNAMİ",tsunami],["TİPİ",blizzard],["OBRUK",sinkhole],["SÜPER FIRTINA",superstorm],["ATEŞ YAĞMURU",fireRain]
];
function start([name,fn]){if(active)return;active=true;say("§eHava, basınç ve çevrede anormal değişimler algılandı...");system.runTimeout(()=>say(`§cUYARI: ${name} yaklaşıyor! Hazırlan.`),200);system.runTimeout(fn,CONFIG.warningSeconds*20)}
system.runInterval(()=>{if(!players().length||active)return;cooldown-=CONFIG.checkEveryTicks;if(cooldown<=0)start(disasters[rand(0,disasters.length-1)])},CONFIG.checkEveryTicks);
say("§aDisaster Overhaul aktif: 10 otomatik afet sistemi yüklendi.");
