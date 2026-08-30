import { world, system } from "@minecraft/server";

const CONFIG = {
  checkEveryTicks: 200,
  minimumPlayers: 1,
  warningSeconds: 20,
  cooldownTicks: 20 * 60 * 8
};

let cooldown = 20 * 60 * 2;
let active = false;

const disasters = [
  { id: "earthquake", title: "DEPREM", run: earthquake },
  { id: "meteor", title: "METEOR YAĞMURU", run: meteorStorm },
  { id: "wildfire", title: "YANGIN FIRTINASI", run: wildfire }
];

function tellAll(message) {
  world.sendMessage(`§6[Disaster Overhaul]§r ${message}`);
}

function randomPlayer() {
  const players = world.getAllPlayers();
  return players.length ? players[Math.floor(Math.random() * players.length)] : undefined;
}

function warnThen(disaster) {
  if (active) return;
  active = true;
  tellAll(`§eHava ve çevrede anormal değişimler algılandı...`);
  system.runTimeout(() => tellAll(`§c${disaster.title} yaklaşıyor! Sığınacak bir yer bul.`), 20 * 10);
  system.runTimeout(() => disaster.run(), 20 * CONFIG.warningSeconds);
}

function earthquake() {
  tellAll("§cDeprem başladı!");
  let elapsed = 0;
  const id = system.runInterval(() => {
    elapsed++;
    for (const player of world.getAllPlayers()) {
      try {
        player.runCommand("camerashake add @s 0.45 0.5 positional");
        if (elapsed % 3 === 0) player.runCommand("damage @s 1 entity_attack");
      } catch {}
    }
    if (elapsed >= 16) {
      system.clearRun(id);
      finish("Deprem sona erdi.");
    }
  }, 10);
}

function meteorStorm() {
  const target = randomPlayer();
  if (!target) return finish("Meteor fırtınası dağıldı.");
  tellAll("§cGökyüzünden meteorlar düşüyor!");
  let count = 0;
  const id = system.runInterval(() => {
    const players = world.getAllPlayers();
    if (!players.length || count++ >= 12) {
      system.clearRun(id);
      return finish("Meteor yağmuru sona erdi.");
    }
    const p = players[Math.floor(Math.random() * players.length)];
    const x = Math.floor(p.location.x + (Math.random() * 24 - 12));
    const y = Math.floor(p.location.y + 18 + Math.random() * 10);
    const z = Math.floor(p.location.z + (Math.random() * 24 - 12));
    try { p.dimension.runCommand(`summon tnt ${x} ${y} ${z}`); } catch {}
  }, 12);
}

function wildfire() {
  const target = randomPlayer();
  if (!target) return finish("Yangın tehdidi geçti.");
  tellAll("§cSıcaklık hızla yükseliyor. Çevrede yangınlar başladı!");
  let count = 0;
  const id = system.runInterval(() => {
    if (count++ >= 18) {
      system.clearRun(id);
      return finish("Yangın fırtınası zayıfladı.");
    }
    const players = world.getAllPlayers();
    if (!players.length) return;
    const p = players[Math.floor(Math.random() * players.length)];
    const x = Math.floor(p.location.x + (Math.random() * 20 - 10));
    const y = Math.floor(p.location.y);
    const z = Math.floor(p.location.z + (Math.random() * 20 - 10));
    try { p.dimension.runCommand(`setblock ${x} ${y} ${z} fire keep`); } catch {}
  }, 20);
}

function finish(message) {
  tellAll(`§a${message}`);
  active = false;
  cooldown = CONFIG.cooldownTicks;
}

system.runInterval(() => {
  if (world.getAllPlayers().length < CONFIG.minimumPlayers || active) return;
  cooldown -= CONFIG.checkEveryTicks;
  if (cooldown > 0) return;
  const disaster = disasters[Math.floor(Math.random() * disasters.length)];
  warnThen(disaster);
}, CONFIG.checkEveryTicks);

tellAll("§aDisaster Overhaul yüklendi. Afet sistemi otomatik çalışıyor.");
