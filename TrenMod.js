/// api_version=2

/*
TrenMod by n0nexist
Liquidbounce 1.8.9 addon
*/

var Minecraft = Java.type("net.minecraft.client.Minecraft");
var mc = Minecraft.getMinecraft();
var C01PacketChatMessage = Java.type("net.minecraft.network.play.client.C01PacketChatMessage");
var Display = Java.type("org.lwjgl.opengl.Display");
var S29PacketSoundEffect = Java.type("net.minecraft.network.play.server.S29PacketSoundEffect");
var Gui = Java.type("net.minecraft.client.gui.Gui");
var Enchantment = Java.type("net.minecraft.enchantment.Enchantment");
var BufferedReader = Java.type("java.io.BufferedReader");
var InputStreamReader = Java.type("java.io.InputStreamReader");
var URL = Java.type("java.net.URL");
var ScaledResolution = Java.type("net.minecraft.client.gui.ScaledResolution");
var GuiInventory = Java.type("net.minecraft.client.gui.inventory.GuiInventory");
var S03PacketTimeUpdate = Java.type("net.minecraft.network.play.server.S03PacketTimeUpdate");
var S06PacketUpdateHealth = Java.type('net.minecraft.network.play.server.S06PacketUpdateHealth');
var BlockPos = Java.type("net.minecraft.util.BlockPos");
var ArrayList = Java.type("java.util.ArrayList");
var C02PacketUseEntity = Java.type("net.minecraft.network.play.client.C02PacketUseEntity");

var KillAura = moduleManager.getModule('KillAura');


var trenColor = 1295205;
var secondColor = 3129723;

var blue = 0xB2000090;
var orange = 0xB2909000;
var red = 0xB2900000;

var backColor = 0x90000000;
var secondBackColor = 0xA6c5e8d5;
var version = "1.4.1";

var lastPkt = 0;
var rectLongestString = "";

var fontRenderer = Minecraft.getMinecraft().fontRenderer;

var script = registerScript({
    name: "TrenMod",
    version: version,
    authors: ["n0nexist"]
});

function fancyprint(text){
    Chat.print("§c[§f§o§ka§f§4§nTrenMod§f§o§ka§f§c]§e§o "+text);
}

function say(text){
    mc.thePlayer.sendQueue.addToSendQueue(new C01PacketChatMessage(text));
}

function longestString(text){
  if (text.length > rectLongestString.length){
    rectLongestString = text;
  }
}

function getPlayerList(){
  var index = 1;
  var players = [];
  while (index < mc.theWorld.playerEntities.size()){
    players.push(mc.theWorld.playerEntities.get(index).getName());
    index++
  }
  return players;
}

function getClosestPlayerName(range) {
  var playerList = getPlayerList();
  var closestPlayerName = "";
  var closestPlayerDistance = Infinity;

  playerList.forEach(function(playerName) {
    var playerEntity = mc.theWorld.getPlayerEntityByName(playerName);
    if (playerEntity) {
      var dx = mc.thePlayer.posX - playerEntity.posX;
      var dy = mc.thePlayer.posY - playerEntity.posY;
      var dz = mc.thePlayer.posZ - playerEntity.posZ;
      var distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (distance < closestPlayerDistance && Math.abs(dy) <= 2.5) {
        closestPlayerDistance = distance;
        closestPlayerName = playerName;
      }
    }
  });

  if (closestPlayerDistance > range) {
    return null;
  }

  return closestPlayerName;
}

function getClosestPlayerNameIgnoringY(range) {
  var playerList = getPlayerList();
  var closestPlayerName = "";
  var closestPlayerDistance = Infinity;

  playerList.forEach(function(playerName) {
    var playerEntity = mc.theWorld.getPlayerEntityByName(playerName);
    if (playerEntity) {
      var dx = mc.thePlayer.posX - playerEntity.posX;
      var dy = mc.thePlayer.posY - playerEntity.posY;
      var dz = mc.thePlayer.posZ - playerEntity.posZ;
      var distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (distance < closestPlayerDistance) {
        closestPlayerDistance = distance;
        closestPlayerName = playerName;
      }
    }
  });

  if (closestPlayerDistance > range) {
    return null;
  }

  return closestPlayerName;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function getDirection() {
  var rotationYaw = mc.thePlayer.rotationYaw;

  if(mc.thePlayer.moveForward < 0)
      rotationYaw += 180;

  var forward = 1;
  if(mc.thePlayer.moveForward < 0)
      forward = -0.5;
  else if(mc.thePlayer.moveForward > 0)
      forward = 0.5;

  if(mc.thePlayer.moveStrafing > 0)
      rotationYaw -= 90 * forward;

  if(mc.thePlayer.moveStrafing < 0)
      rotationYaw += 90 * forward;

  return toRadians(rotationYaw);

}

function strafeStill(speed) {
  var yaw = getDirection();
  mc.thePlayer.motionX = -Math.sin(yaw) * speed;
  mc.thePlayer.motionZ = Math.cos(yaw) * speed;
}

function strafeRightStill(speed) {
  var yaw = mc.thePlayer.rotationYaw * 0.017453292;

  mc.thePlayer.motionX = Math.cos(yaw) * speed;
  mc.thePlayer.motionZ = Math.sin(yaw) * speed;
}


function strafeStillEntity(speed,entity) {
  var yaw = getDirection();
  entity.addVelocity(-Math.sin(yaw) * speed, 0, Math.cos(yaw) * speed);
}

function wrapAngleTo180_float(value)
{
    value = value % 360.0;

    if (value >= 180.0)
    {
        value -= 360.0;
    }

    if (value < -180.0)
    {
        value += 360.0;
    }

    return value;
}

function lookAtBlock(x,y,z) {

  var diffX = x + 0.5 - mc.thePlayer.posX;
  var diffY = y + 1.5 -
                    (mc.thePlayer.getEntityBoundingBox().minY +
                    mc.thePlayer.getEyeHeight());
  var diffZ = z + 0.5 - mc.thePlayer.posZ;


  var sqrt = Math.sqrt(diffX * diffX + diffZ * diffZ);
  var yaw = (Math.atan2(diffZ, diffX) * 180.0 / Math.PI) - 90;
  var pitch = -(Math.atan2(diffY, sqrt) * 180.0 / Math.PI);

  
  mc.thePlayer.rotationYaw = mc.thePlayer.rotationYaw +wrapAngleTo180_float(yaw - mc.thePlayer.rotationYaw);
  mc.thePlayer.rotationPitch = mc.thePlayer.rotationPitch +wrapAngleTo180_float(pitch - mc.thePlayer.rotationPitch);

}

function getPublicIp(){
  try {
    whatIsMyIP = new URL("https://api.ipify.org");
    reader = new BufferedReader(new InputStreamReader(whatIsMyIP.openStream()));
    ip = reader.readLine();
    reader.close();
    return ip;
  } catch (eee) {
      return "*error*";
  }
}

function isAirBlockForward(length) {
  var yaw = mc.thePlayer.rotationYaw * 0.017453292
  return mc.theWorld.isAirBlock(new BlockPos(mc.thePlayer.posX + -Math.sin(yaw) * length, mc.thePlayer.posY, mc.thePlayer.posZ + Math.cos(yaw) * length));
}

function isAirBlockUpwards(length) {
  return mc.theWorld.isAirBlock(new BlockPos(mc.thePlayer.posX, mc.thePlayer.posY+length, mc.thePlayer.posZ));
}

function isAirBlockDownwards(length) {
  return mc.theWorld.isAirBlock(new BlockPos(mc.thePlayer.posX, mc.thePlayer.posY-length, mc.thePlayer.posZ)) && (mc.thePlayer.posY-length)>0;
}

function hclip(length) {
  var yaw = mc.thePlayer.rotationYaw * 0.017453292
  mc.thePlayer.setPosition(mc.thePlayer.posX + -Math.sin(yaw) * length, mc.thePlayer.posY, mc.thePlayer.posZ + Math.cos(yaw) * length);
}

function autohclip(length) {
  var index = length;
  while (index<10){
    if (isAirBlockForward(index)){
      hclip(index);
      return;
    }
    index++;
  }
}

function vclip(length) {
  mc.thePlayer.setPosition(mc.thePlayer.posX, mc.thePlayer.posY+length, mc.thePlayer.posZ);
}

function autovclip(length) {
  var index = length;
  while (index<10){
    if (isAirBlockUpwards(index)){
      vclip(index);
      return;
    }
    index++;
  }
}

function autovclipDownwards(length) {
  var index = length;
  while (index<10){
    if (isAirBlockDownwards(index)){
      mc.thePlayer.setSneaking(false);
      vclip((index+1)*-1);
      return;
    }
    index++;
  }
}

function getPositionsInBetween(me,target){
  var positions = new ArrayList();

  var step = 3.5;
  var xDiff = target.getX() - me.getX();
  var yDiff = target.getY() - me.getY();
  var zDiff = target.getZ() - me.getZ();
  var distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff);
  var steps = parseInt(distance / step);

  var xStep = xDiff / steps;
  var yStep = yDiff / steps;
  var zStep = zDiff / steps;

  var i = 0;
  while (i<steps){
    var x = parseInt(me.getX() + xStep * i);
    var y = parseInt(me.getY() + yStep * i);
    var z = parseInt(me.getZ() + zStep * i);
    positions.add(new BlockPos(x, y, z));
    i++;
  }

  positions.add(target);

  return positions;
}

function farAwayTp(start,destination){
  getPositionsInBetween(start,destination).forEach(function(p){
    mc.thePlayer.setPosition(p.getX(), p.getY(), p.getZ());
  });
}

function lateralClip(length) {
  var yaw = mc.thePlayer.rotationYaw * 0.017453292;
  var rightYaw = yaw + (Math.PI / 2);
  
  mc.thePlayer.setPosition(
    mc.thePlayer.posX + -Math.sin(rightYaw) * length,
    mc.thePlayer.posY,
    mc.thePlayer.posZ + Math.cos(rightYaw) * length
  );
}

function jump(){
  if (mc.thePlayer.onGround){
    mc.thePlayer.jump();
  }
}

function getDistance(lastTickPosX, lastTickPosZ) {
  xSpeed = parseFloat(mc.thePlayer.posX - lastTickPosX);
  zSpeed = parseFloat(mc.thePlayer.posZ - lastTickPosZ);
  return Math.sqrt(xSpeed * xSpeed + zSpeed * zSpeed);
}

function getbps(){
  if(mc.thePlayer==null || mc.thePlayer.ticksExisted < 1) {
    return 0;
  }
  return parseFloat(getDistance(mc.thePlayer.lastTickPosX,mc.thePlayer.lastTickPosZ) * (20 * mc.timer.timerSpeed));
}


// TESTING COMMAND
script.registerCommand({
    name: "test",
    aliases: ["test"]
}, function (command) {
  command.on("execute", function(args) {


  });
});


/* ------ MODULES ------ */


// TEST MODULE
script.registerModule({
  name: "TestModule",
  category: "Misc", 
  description: "Testing module",
}, function (module) {
  
  module.on('render2D', function (event) {

  });
});


// KEYSTROKES
script.registerModule({
  name: "KeyStrokes",
  category: "Render", 
  description: "Renders keystrokes",
  settings:{
    x: Setting.integer({
      name: "X",
      default: 250,
      min: 0,
      max: 300
    }),
    y: Setting.integer({
      name: "Y",
      default: 250,
      min: 0,
      max: 300
    }),
  }
}, function (module) {
  var fr = mc.fontRendererObj;
  module.on('render2D', function (event) {
    var addY = module.settings.y.get();
    var addX = module.settings.x.get();

    // W
    Gui.drawRect(35+addX, 35+addY, 60+addX, 60+addY, backColor);
    if (!mc.gameSettings.keyBindForward.pressed) {
      fr.drawStringWithShadow("W", 45+addX, 44+addY, -1);
    } else {
      fr.drawStringWithShadow("W", 45+addX, 44+addY, trenColor);
    }
    // S
    Gui.drawRect(35+addX, 65+addY, 60+addX, 90+addY, backColor);
    if (!mc.gameSettings.keyBindBack.pressed) {
      fr.drawStringWithShadow("S", 45+addX, 74+addY, -1);
    } else {
      fr.drawStringWithShadow("S", 45+addX, 74+addY, trenColor);
    }
    // A
    Gui.drawRect(5+addX, 65+addY, 30+addX, 90+addY, backColor);
    if (!mc.gameSettings.keyBindLeft.pressed) {
      fr.drawStringWithShadow("A", 15+addX, 74+addY, -1);
    } else {
      fr.drawStringWithShadow("A", 15+addX, 74+addY, trenColor);
    }
    // D
    Gui.drawRect(65+addX, 65+addY, 90+addX, 90+addY, backColor);
    if (!mc.gameSettings.keyBindRight.pressed) {
      fr.drawStringWithShadow("D", 75+addX, 74+addY, -1);
    } else {
      fr.drawStringWithShadow("D", 75+addX, 74+addY, trenColor);
    }
    // SPACE
    Gui.drawRect(5+addX, 95+addY, 90+addX, 120+addY, backColor);
    if (!mc.gameSettings.keyBindJump.pressed) {
      fr.drawStringWithShadow("SPACE", 33+addX, 104+addY, -1);
    } else {
      fr.drawStringWithShadow("SPACE", 33+addX, 104+addY, trenColor);
    }
    // SHIFT
    Gui.drawRect(5+addX, 125+addY, 90+addX, 150+addY, backColor);
    if (!mc.thePlayer.isSneaking()) {
      fr.drawStringWithShadow("SHIFT", 33+addX, 134+addY, -1);
    } else {
      fr.drawStringWithShadow("SHIFT", 33+addX, 134+addY, trenColor);
    }

  });
});


// CPSBPS
script.registerModule({
  name: "CpsBps",
  category: "Render", 
  description: "Shows cps and bps",
}, function (module) {
  var ticks = 0;
  var wasClicked = false;
  var clickList = new ArrayList();
  var click = 0;
  var i = 0;
  module.on('render2D', function (event) {
    var sr = new ScaledResolution(mc);
    ticks++;
    if (ticks>20){
      ticks=0;
    }
    if (mc.gameSettings.keyBindAttack.isKeyDown()&&!wasClicked){
      clickList.add(Date.now());
      wasClicked = true;
    }
    if (!mc.gameSettings.keyBindAttack.isKeyDown()&&wasClicked){
      wasClicked = false;
    }
    i = 0;
    while (i<clickList.size()){
      click = clickList.get(i);
      if (Date.now()-click > 1000){
        clickList.remove(i);
      }
      i++;
    }
    mc.fontRendererObj.drawStringWithShadow("CPS: §f"+clickList.size()+" §7| §3BPS: §f"+getbps().toFixed(2), 3,sr.getScaledHeight()-3-mc.fontRendererObj.FONT_HEIGHT, secondColor);
  });
});


// TARGETSTRAFE
script.registerModule({
  name: "TargetStrafe",
  category: "Combat", 
  description: "Strafe around a target",
  settings:{
    speed: Setting.float({
      name: "speed",
      default: 0.6,
      min: 0.1,
      max: 0.8
    }),
    range: Setting.float({
      name: "range",
      default: 3.5,
      min: 1.5,
      max: 5.0
    }),
  }
}, function (module) {
  module.on('update', function () {
    var motionXZ = module.settings.speed.get();
    var range = module.settings.range.get();
    var player = getClosestPlayerName(range);
    if (player != null){
      player = mc.theWorld.getPlayerEntityByName(player);
      if (mc.thePlayer.getDistanceToEntity(player)>(range-1)){
        strafeStill(motionXZ);
      }else if (mc.thePlayer.getDistanceToEntity(player)<(range-1)){
        strafeStill(-motionXZ);
      }
      if(Math.sqrt(Math.pow(mc.thePlayer.posX - player.posX, 2) + Math.pow(mc.thePlayer.posZ - player.posZ, 2)) != 0) {
        var c1 = (mc.thePlayer.posX - player.posX)/(Math.sqrt(Math.pow(mc.thePlayer.posX - player.posX,2) + Math.pow(mc.thePlayer.posZ - player.posZ,2)));
        var s1 = (mc.thePlayer.posZ - player.posZ)/(Math.sqrt(Math.pow(mc.thePlayer.posX - player.posX,2) + Math.pow(mc.thePlayer.posZ - player.posZ,2)));
        lookAtBlock(player.getPosition().getX(),player.getPosition().getY(),player.getPosition().getZ());
        if(Math.sqrt(Math.pow(mc.thePlayer.posX - player.posX,2) + Math.pow(mc.thePlayer.posZ - player.posZ,2)) <= range) {
          mc.thePlayer.motionX = -motionXZ * s1 - 0.18 * motionXZ * c1;
          mc.thePlayer.motionZ = motionXZ * c1 - 0.18 * motionXZ * s1;
        }
      }
      jump();
    }
  });
});


// TPAURA
script.registerModule({
  name: "TpAura",
  category: "Combat", 
  description: "Teleports to the nearest player and attacks them",
}, function (module) {
  var ticks = 0;
  module.on('update', function () {
    ticks ++;
		if (ticks > 20){
			ticks = 0;
		}
    var cPlayer = getClosestPlayerNameIgnoringY(20);
    var oldPos = mc.thePlayer.getPosition();
    var ePlayer;
    if (cPlayer != null){
      if (ticks==1){
        ePlayer = mc.theWorld.getPlayerEntityByName(cPlayer);
        oldPos = mc.thePlayer.getPosition();
        farAwayTp(oldPos, ePlayer.getPosition());
        mc.playerController.attackEntity(mc.thePlayer, ePlayer);
      }
     }
  });
});


// WALLTP
script.registerModule({
  name: "WallTP",
  category: "Exploit", 
  description: "Teleports trough walls and roofs",
}, function (module) {
  module.on('update', function () {
    if (mc.thePlayer.isCollidedHorizontally && mc.gameSettings.keyBindForward.pressed){
      autohclip(2);
    }
    if ((!mc.theWorld.isAirBlock(new BlockPos(mc.thePlayer.posX, mc.thePlayer.posY+2, mc.thePlayer.posZ)))&&mc.gameSettings.keyBindJump.pressed){
      autovclip(2);
    }
    if (mc.thePlayer.onGround && mc.thePlayer.isSneaking()){
      autovclipDownwards(2);
    }

  });
});


// AUTOFLEE
script.registerModule({
  name: "AutoFlee",
  category: "Combat", 
  description: "Automatically flee from the nearest enemy",
  settings:{
    multiply: Setting.float({
      name: "multiplyfactor",
      default: 2,
      min: 0,
      max: 4
    }),
    range: Setting.float({
      name: "range",
      default: 4.5,
      min: 0.5,
      max: 9.0
    }),
  }
}, function (module) {
  module.on('update', function () {
    var nearestPlayer = getClosestPlayerName(module.settings.range.get());
    if (nearestPlayer!=null){
      var pl = mc.theWorld.getPlayerEntityByName(nearestPlayer);
      lookAtBlock(pl.posX, pl.posY, pl.posZ);      
      hclip((mc.thePlayer.getDistanceToEntity(pl) * module.settings.multiply.get())*-1);
    }
  });
});


// BEHINDTP
script.registerModule({
  name: "BehindTP",
  category: "Combat", 
  description: "Automatically teleports behind the player you're looking at",
  settings:{
    multiply: Setting.float({
      name: "multiplyfactor",
      default: 2.0,
      min: 0.1,
      max: 4.0
    }),
  }
}, function (module) {
  module.on('update', function () {
    var entityHit = mc.objectMouseOver.entityHit;
    if (entityHit != null) {
      hclip(mc.thePlayer.getDistanceToEntity(entityHit) * module.settings.multiply.get());
    }
  });
});


// AUTODISABLE
script.registerModule({
  name: "AutoDisable",
  category: "Combat", 
  description: "Disables killaura when dying or when changing world",
}, function (module) {
  module.on('packet', function (e) {
		var packet = e.getPacket();
    if (packet instanceof S06PacketUpdateHealth && packet.getHealth() <= 0 && KillAura.getState()) {
        KillAura.setState(false);
        fancyprint("disabled killaura due to death");
    }
  });
  module.on('world', function () {
    if (KillAura.getState()) {
      KillAura.setState(false);
      fancyprint("disabled killaura due to world change");
    }
  });
});


// CUSTOMAMBIENCE
script.registerModule({
  name: "CustomAmbience",
  category: "Render", 
  description: "Changes the world's time (client-side)",
  settings: {
    mode: Setting.list({
        name: "Mode",
        default: "Custom",
        values: ["Custom","Day","Night","Sunset"]
    }),
    time: Setting.integer({
        name: "CustomTime",
        min: 1000,
        max: 24000,
        default: 1000
    })
  }
}, function (module) {
  module.on("update", function(event) {
    var mode = module.settings.mode.get();
    if (mode=="Day"){
      mc.theWorld.setWorldTime(1000);
    }else if (mode=="Night"){
      mc.theWorld.setWorldTime(19000);
    }else if (mode=="Sunset"){
      mc.theWorld.setWorldTime(12800);
    }else{
      mc.theWorld.setWorldTime(module.settings.time.get());
    }  
});
  module.on("packet", function(event) { 
    if(event.getPacket() instanceof S03PacketTimeUpdate) {
      event.cancelEvent();
    }
  });
});

// PLAYERMODEL
script.registerModule({
  name: "PlayerModel",
  category: "Render", 
  description: "Draws the player's model on the screen",
  settings: {
    Scale: Setting.integer({
        name: "Scale",
        default: 30,
        min: 20,
        max: 40
    }),
  }
}, function (module) {
  module.on("render2D", function(event) {
      
    var sr = new ScaledResolution(mc);
      
    GuiInventory.drawEntityOnScreen(
        sr.getScaledWidth()-20,
        sr.getScaledHeight()-10,
        module.getValue("Scale").get(),
        mc.thePlayer.cameraYaw,
        mc.thePlayer.rotationPitch*-1,
        mc.thePlayer
    );

    
  });
});


// INSULTER
script.registerModule({
  name: "Insulter",
  category: "Fun", 
  description: "Automatically insult the players that you kill",
}, function (module) {

  var entityName = "*****noplayer*****";
  var hasInsulted = false;
  var insulti = [
    "%playername%, il tuo stile di gioco è così noioso...",
    "Non ho mai visto un giocatore peggiore di te, %playername%.",
    "%playername%, mi chiedo se hai mai vinto una partita.",
    "Forse dovresti cambiare hobby, %playername%.",
    "È imbarazzante guardare le tue performance, %playername%.",
    "%playername%, potresti almeno giocare seriamente?",
    "Hai la capacità di fallire costantemente, %playername%.",
    "Hai un talento innato per l'insuccesso, %playername%.",
    "Hai già considerato di smettere di giocare, %playername%?",
  ];

  module.on("attack", function(event) {
    entityName = event.getTargetEntity().getName();
  });

  module.on("update", function(event){
    if (entityName!="*****noplayer*****"){
      var plHealth = mc.theWorld.getPlayerEntityByName(entityName).getHealth();
      if (plHealth==0&&!hasInsulted){
        say(insulti[Math.floor(Math.random() * insulti.length)].replace("%playername%",entityName));
        hasInsulted = true;
      }else if (plHealth>0&&hasInsulted){
        hasInsulted = false;
      }
    }
  });

});


// ENEMYINFO
script.registerModule({
  name: "EnemyInfo",
  category: "Render", 
  description: "Draws the enemy's info on the screen",
}, function (module) {
  module.on("render2D", function(event) {
      
    var sr = new ScaledResolution(mc);
    var cPlayer = getClosestPlayerNameIgnoringY(5);
    

    if (cPlayer != null){

      var cplayerEntity = mc.theWorld.getPlayerEntityByName(cPlayer);

      var w = (sr.getScaledWidth()/2)+20
      var h = (sr.getScaledHeight()/2)+40

      Gui.drawRect(w-10,h-40, w+120, h+2,secondBackColor);
        
      GuiInventory.drawEntityOnScreen(
        w+3,
        h,
        20,
        cplayerEntity.rotationYaw,
        cplayerEntity.rotationPitch*-1,
        cplayerEntity
      );
      
      mc.fontRendererObj.drawStringWithShadow(cplayerEntity.getName(), w+15, h-33, secondColor);

      var healthColor = blue;
      if (cplayerEntity.getHealth() < 15){
        healthColor = orange
      }

      if (cplayerEntity.getHealth() < 9){
        healthColor = red
      }

      Gui.drawRect(w+15,h-20,w+15+(cplayerEntity.getHealth()*5),h-5,healthColor);

      
    }
    
  });
});


// LOGO + INFO
script.registerModule({
  name: "TrenMod",
  category: "Misc", 
  description: "Shows logo + world info",
}, function (module) {
  module.on("packet", function(event) {
      lastPkt = 0;      
    
  });

  module.on("load", function(event) {    
    CommandManager.executeCommands(".toggle TrenMod");
  });

  module.on("render2D", function (event){

    lastPkt++;


    Display.setTitle("LiquidBounce + Trenmod running");
    mc.fontRendererObj.drawStringWithShadow("§l+ TrenMod version "+version, 3, 17, trenColor);



    

    var count = 1;
    var str = "";

    Gui.drawRect(0,28,100+(rectLongestString.length*2),120,backColor);
    
    str = "§lName -> §a"+mc.thePlayer.getName();
    mc.fontRendererObj.drawStringWithShadow(str, 3, 20+count*11, trenColor);
    longestString(str);
    count++;

    str = mc.theWorld.getWorldInfo().getGameType().toString().toLowerCase();
    str = "§lGamemode -> §f"+str.charAt(0).toUpperCase() + str.slice(1);
    mc.fontRendererObj.drawStringWithShadow(str, 3, 20+count*11, trenColor);
    longestString(str);
    count++;
    
    str = "§lIP -> §f"+mc.getCurrentServerData().serverIP;
    mc.fontRendererObj.drawStringWithShadow(str, 3, 20+count*11, trenColor);
    longestString(str);
    count++;
    
    str = "§lPing -> §f"+mc.getCurrentServerData().pingToServer;
    mc.fontRendererObj.drawStringWithShadow(str, 3, 20+count*11, trenColor);
    longestString(str);
    count++;
    
    str = "§lLast pkt -> §f"+lastPkt+" ticks";
    mc.fontRendererObj.drawStringWithShadow(str, 3, 20+count*11, trenColor);
    longestString(str);
    count++;
    
    str = "§lProtocol -> §f"+mc.getCurrentServerData().version;
    mc.fontRendererObj.drawStringWithShadow(str, 3, 20+count*11, trenColor);
    longestString(str);
    count++;
    
    str = "§lCoords -> §f"+parseInt(mc.thePlayer.posX)+"/"+parseInt(mc.thePlayer.posY)+"/"+parseInt(mc.thePlayer.posZ);
    mc.fontRendererObj.drawStringWithShadow(str, 3, 20+count*11, trenColor);
    longestString(str);
    count++;

    str = "§lBrand -> §f"+mc.thePlayer.getClientBrand();
    mc.fontRendererObj.drawStringWithShadow(str, 3, 20+count*11, trenColor);
    longestString(str);
  
    count+=3;
  });
});


// PACKETSPY
script.registerModule({
  name: "Packetspy",
  category: "Misc", 
  description: "Shows packets",
}, function (module) {
  module.on("packet", function(event) {
      
      
      fancyprint(event.getPacket());

      
  });
});



// FIGHTBOT
script.registerModule({
  name: "FightBOT",
  category: "Combat", 
  description: "Gets behind the closest enemy",
  settings: {
    Speed: Setting.float({
      name: "Speed",
      default: 0.6,
      min: 0.1,
      max: 0.8
    })
  }
}, function (module) {


  module.on("update", function(event) {
      
    var range = 3;
    var player = getClosestPlayerName(range);
    var motionXZ = module.getValue("Speed").get();

    if (player != null){
      player = mc.theWorld.getPlayerEntityByName(player);
      if (mc.thePlayer.getDistanceToEntity(player)>(range-1)){
        strafeStill(motionXZ);
      }else if (mc.thePlayer.getDistanceToEntity(player)<(range-1)){
        strafeStill(-motionXZ);
      }
      if(Math.sqrt(Math.pow(mc.thePlayer.posX - player.posX, 2) + Math.pow(mc.thePlayer.posZ - player.posZ, 2)) != 0) {
        var c1 = (mc.thePlayer.posX - player.posX)/(Math.sqrt(Math.pow(mc.thePlayer.posX - player.posX,2) + Math.pow(mc.thePlayer.posZ - player.posZ,2)));
        var s1 = (mc.thePlayer.posZ - player.posZ)/(Math.sqrt(Math.pow(mc.thePlayer.posX - player.posX,2) + Math.pow(mc.thePlayer.posZ - player.posZ,2)));
        lookAtBlock(player.getPosition().getX(),player.getPosition().getY(),player.getPosition().getZ());
        if(Math.sqrt(Math.pow(mc.thePlayer.posX - player.posX,2) + Math.pow(mc.thePlayer.posZ - player.posZ,2)) <= range && (player.getHorizontalFacing() != mc.thePlayer.getHorizontalFacing())) {
          if(mc.gameSettings.keyBindLeft.pressed) {
            mc.thePlayer.motionX = -motionXZ * s1 - 0.18 * motionXZ * c1;
            mc.thePlayer.motionZ = motionXZ * c1 - 0.18 * motionXZ * s1;
          }else {
            mc.thePlayer.motionX = motionXZ * s1 - 0.18 * motionXZ * c1;
            mc.thePlayer.motionZ = -motionXZ * c1 - 0.18 * motionXZ * s1;
          }
        }
      }
    }     
  });
});


/* ------ COMMANDS ------ */


// MYNAME
script.registerCommand({
    name: "myname",
    aliases: ["myname"]
}, function (command) {
  command.on("execute", function(args) {
    fancyprint("name: "+mc.thePlayer.getName());
  });
});

// MYIP
script.registerCommand({
  name: "myip",
  aliases: ["myip"]
}, function (command) {
command.on("execute", function(args) {

  fancyprint("public ip: "+getPublicIp());
  
});
});

// FULLENCHANT
script.registerCommand({
  name: "fullenchant",
  aliases: ["fullenchant"]
}, function (command) {
command.on("execute", function(args) {
  if (!mc.thePlayer.capabilities.isCreativeMode){
    fancyprint("fullenchant command is for creative mode only");
  }else{

    if (mc.thePlayer.inventory.getCurrentItem() != null){

      fancyprint("fullenchanting "+mc.thePlayer.inventory.getCurrentItem().getDisplayName());

      var index = 1;
      while (index<256){
        try{
          mc.thePlayer.inventory.getCurrentItem().addEnchantment(Enchantment.getEnchantmentById(index),127);
        }catch(aaa){}
        index++;
      }

    }else{
      fancyprint("you have no item in your hand");
    }

  }
});
});

// FILL
script.registerCommand({
    name: "fill",
    aliases: ["fill", "f"]
}, function (command) {
  command.on("execute", function(args) {
    fancyprint("filling "+args[1]+"x"+args[1]+" blocks");
    say("/minecraft:fill ~-"+args[1]+" ~-"+args[1]+" ~-"+args[1]+" ~"+args[1]+" ~"+args[1]+" ~"+args[1]+" minecraft:air");
  });
});

// TPALL
script.registerCommand({
    name: "tpall",
    aliases: ["tpall"]
}, function (command) {
  command.on("execute", function(args) {
    fancyprint("teleporting all players");
    say("/minecraft:tp @a @p");
    say("/tp @a @p");
  });
});