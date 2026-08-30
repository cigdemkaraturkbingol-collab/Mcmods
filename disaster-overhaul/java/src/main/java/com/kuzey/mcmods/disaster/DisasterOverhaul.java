package com.kuzey.mcmods.disaster;

import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerTickEvents;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.text.Text;
import net.minecraft.util.math.BlockPos;
import net.minecraft.block.Blocks;
import net.minecraft.entity.EntityType;
import net.minecraft.entity.LightningEntity;
import java.util.*;

public class DisasterOverhaul implements ModInitializer {
 private static final Random R=new Random();
 private static long next=20L*60*2; private static Event active=null;
 enum Kind { EARTHQUAKE,METEOR,WILDFIRE,TORNADO,VOLCANO,TSUNAMI,BLIZZARD,SINKHOLE,SUPERSTORM,FIRE_RAIN }
 static class Event { Kind kind; int age=0; Event(Kind k){kind=k;} }
 @Override public void onInitialize(){ ServerTickEvents.END_SERVER_TICK.register(this::tick); }
 private void tick(MinecraftServer s){
  if(s.getPlayerManager().getPlayerList().isEmpty())return;
  if(active==null){if(--next<=0){active=new Event(Kind.values()[R.nextInt(Kind.values().length)]);broadcast(s,"§cUYARI: "+name(active.kind)+" yaklaşıyor!");}return;}
  active.age++; if(active.age==200)broadcast(s,"§4"+name(active.kind)+" BAŞLADI!");
  if(active.age>=200 && active.age%10==0)effect(s,active.kind,active.age);
  if(active.age>700){broadcast(s,"§aAfet sona erdi.");active=null;next=20L*60*8;}
 }
 private void effect(MinecraftServer s,Kind k,int age){for(ServerPlayerEntity p:s.getPlayerManager().getPlayerList()){
  BlockPos c=p.getBlockPos(); var w=p.getServerWorld(); int dx=R.nextInt(25)-12,dz=R.nextInt(25)-12; BlockPos q=c.add(dx,0,dz);
  switch(k){
   case EARTHQUAKE -> { if(age%40==0)p.damage(w.getDamageSources().generic(),1f); }
   case METEOR,FIRE_RAIN -> { if(age%30==0){var t=EntityType.TNT.create(w);if(t!=null){t.refreshPositionAndAngles(q.getX()+.5,q.getY()+18,q.getZ()+.5,0,0);w.spawnEntity(t);}} }
   case WILDFIRE -> {if(w.getBlockState(q).isAir())w.setBlockState(q,Blocks.FIRE.getDefaultState());}
   case TORNADO -> {p.addVelocity((R.nextDouble()-.5)*.7,.18,(R.nextDouble()-.5)*.7);p.velocityModified=true;}
   case VOLCANO -> {if(age%40==0){var t=EntityType.TNT.create(w);if(t!=null){t.refreshPositionAndAngles(q.getX(),q.getY()+10,q.getZ(),0,0);w.spawnEntity(t);}}}
   case TSUNAMI -> {if(age%30==0)for(int i=-3;i<=3;i++){BlockPos b=c.add(10,1,i);if(w.getBlockState(b).isAir())w.setBlockState(b,Blocks.WATER.getDefaultState());}}
   case BLIZZARD -> {p.setFrozenTicks(Math.min(140,p.getFrozenTicks()+8));}
   case SINKHOLE -> {if(age==220)for(int x=-3;x<=3;x++)for(int z=-3;z<=3;z++)if(x*x+z*z<10)for(int y=0;y<4;y++)w.setBlockState(c.add(x,-y,z),Blocks.AIR.getDefaultState());}
   case SUPERSTORM -> {if(age%50==0){LightningEntity l=EntityType.LIGHTNING_BOLT.create(w);if(l!=null){l.refreshPositionAfterTeleport(q.toCenterPos());w.spawnEntity(l);}}}
  }
 }}
 private static String name(Kind k){return switch(k){case EARTHQUAKE->"DEPREM";case METEOR->"METEOR YAĞMURU";case WILDFIRE->"YANGIN FIRTINASI";case TORNADO->"HORTUM";case VOLCANO->"VOLKANİK PATLAMA";case TSUNAMI->"TSUNAMİ";case BLIZZARD->"TİPİ";case SINKHOLE->"OBRUK";case SUPERSTORM->"SÜPER FIRTINA";case FIRE_RAIN->"ATEŞ YAĞMURU";};}
 private static void broadcast(MinecraftServer s,String m){s.getPlayerManager().broadcast(Text.literal("§6[Disaster Overhaul] §r"+m),false);}
}
