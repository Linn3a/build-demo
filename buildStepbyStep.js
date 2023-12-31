const mineflayer = require('mineflayer')

const registry = require('prismarine-registry')('1.8')
const Block = require('prismarine-block')(registry)
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear,GoalPlaceBlock } = require('mineflayer-pathfinder').goals
const { Vec3 } = require('vec3')

const bot = mineflayer.createBot({
    host: 'localhost', // minecraft 服务器的 ip地址
    port: 64348,        
    username: 'builder',  
    version:"1.19"
    // 默认使用25565，如果你的服务器端口不是这个请取消注释并填写。
    // version: false,             // 如果需要指定使用一个版本或快照时，请取消注释并手动填写（如："1.8.9 " 或 "1.16.5"），否则会自动设置。
    // auth: 'mojang'              // 如果需要使用微软账号登录时，请取消注释，然后将值设置为 'microsoft'，否则会自动设置为 'mojang'。
  })
  bot.loadPlugin(pathfinder);
  const size = 3
console.log('bot: ',bot.version);
const mcData = require("minecraft-data")(bot.version);


async function chatTo(bot, Otherplayer, msg){
    let message = `/say chat_to ${Otherplayer}: ${msg}` || ''
    bot.chat(message)
}

async function mineBlock(bot, name, count = 1) {
    // return if name is not string
    if (typeof name !== "string") {
        throw new Error(`name for mineBlock must be a string`);
    }
    if (typeof count !== "number") {
        throw new Error(`count for mineBlock must be a number`);
    }
    const blockByName = mcData.blocksByName[name];
    if (!blockByName) {
        throw new Error(`No block named ${name}`);
    }
    const blocks = bot.findBlocks({
        matching: [blockByName.id],
        maxDistance: 32,
        count: 1024,
    });
    if (blocks.length === 0) {
        bot.chat(`No ${name} nearby, please explore first`);
        _mineBlockFailCount++;
        if (_mineBlockFailCount > 10) {
            throw new Error(
                "mineBlock failed too many times, make sure you explore before calling mineBlock"
            );
        }
        return;
    }
    const targets = [];
    for (let i = 0; i < blocks.length; i++) {
        targets.push(bot.blockAt(blocks[i]));
    }
    await bot.collectBlock.collect(targets, {
        ignoreNoPath: true,
        count: count,
    });
    bot.save(`${name}_mined`);
}


async function placeItem(bot, name, position) {
    // return if name is not string
    if (typeof name !== "string") {
        throw new Error(`name for placeItem must be a string`);
    }
    // return if position is not Vec3
    if (!(position instanceof Vec3)) {
        throw new Error(`position for placeItem must be a Vec3`);
    }
    if(bot.blockAt(position).name == name){
        bot.chat(`Don't need place ${name} at ${position}`);
        return;
    }

    const itemByName = mcData.itemsByName[name];
    if (!itemByName) {
        throw new Error(`No item named ${name}`);
    }
    const item = bot.inventory.findInventoryItem(itemByName.id);
    if (!item) {
        bot.chat(`No ${name} in inventory`);
        return;
    }
    const item_count = item.count;
    // find a reference block
    const faceVectors = [
        new Vec3(0, 1, 0),
        new Vec3(0, -1, 0),
        new Vec3(1, 0, 0),
        new Vec3(-1, 0, 0),
        new Vec3(0, 0, 1),
        new Vec3(0, 0, -1),
    ];
    let referenceBlock = null;
    let faceVector = null;
    let _placeItemFailCount = 0;
    for (const vector of faceVectors) {
        const block = bot.blockAt(position.minus(vector));
        if (block?.name !== "air") {
            referenceBlock = block;
            faceVector = vector;
            bot.chat(`Placing ${name} on ${block.name} at ${block.position}`);
            break;
        }
    }
    if (!referenceBlock) {
        bot.chat(
            `No block to place ${name} on. You cannot place a floating block.`
        );
        _placeItemFailCount++;
        if (_placeItemFailCount > 10) {
            throw new Error(
                `placeItem failed too many times. You cannot place a floating block.`
            );
        }
        return;
    }

    // You must use try catch to placeBlock
    try {
        // You must first go to the block position you want to place
        await bot.pathfinder.goto(new GoalPlaceBlock(position, bot.world, {}));
        // You must equip the item right before calling placeBlock
        await bot.equip(item, "hand");
        await bot.placeBlock(referenceBlock, faceVector);
        bot.chat(`Placed ${name}`);
        // bot.save(`${name}_placed`);
    } catch (err) {
        const item = bot.inventory.findInventoryItem(itemByName.id);
        if (item?.count === item_count && bot.blockAt(position).name != name) {
            bot.chat(
                `Error placing ${name}: ${err.message}, please find another position to place`
            );
            _placeItemFailCount++;
            if (_placeItemFailCount > 10) {
                throw new Error(
                    `placeItem failed too many times, please find another position to place.`
                );
            }
        } else {
            bot.chat(`Placed ${name}`);
            // bot.save(`${name}_placed`);
        }
    }
}

  async function layFoundation(bot, startPosition) {
    const foundationSize = 5;
    const foundationBlock = "cobblestone";
    
    const item = bot.inventory.findInventoryItem(mcData?.itemsByName[foundationBlock].id);
    
    if (!item || item.count < foundationSize * foundationSize) {
      bot.chat(`I don't have enough ${foundationBlock}, I will mine some.`);
      let need = foundationSize * foundationSize - (item ? item.count : 0);
      chatTo(bot, bot.username, `I don't have enough ${foundationBlock}, I need ${need} ${foundationBlock}`)
    //   await mineBlock(bot, foundationBlock, foundationSize * foundationSize - (item ? item.count : 0));
        
    return 
  }

    // Lay the foundation
    for (let x = 0; x < 5; x++) {
        for (let z = 0; z < 5; z++) {
          const position = startPosition.offset(x, 0, z);
          await placeItem(bot, foundationBlock, position);
        }
      }
  }
  
  async function buildWalls(bot, startPosition) {

    const size = 5;
    const wallBlock = "oak_planks";
    const item = bot.inventory.findInventoryItem(mcData?.itemsByName[wallBlock].id);
    let total = (size - 2)*(size*2 + (size-2)*2)
    if (!item || item.count < total) {
        bot.chat(`I don't have enough ${wallBlock}`);
        let need = total - (item ? item.count : 0);
        chatTo(bot,bot.username, `I don't have enough ${wallBlock}, I need ${need} ${wallBlock}`)
        return
      }

    // Build the walls
    for (let x = 0; x < size; x++) {
        for (let y = 1; y < size - 1; y++) {
          const position = startPosition.offset(x, y, 0);
          await placeItem(bot, "oak_planks", position);
          const position2 = startPosition.offset(x, y, 4);
          await placeItem(bot, "oak_planks", position2);
        }
      }
      for (let z = 0; z < size; z++) {
        for (let y = 1; y < size - 1; y++) {
          const position = startPosition.offset(0, y, z);
          await placeItem(bot, "oak_planks", position);
          const position2 = startPosition.offset(4, y, z);
          await placeItem(bot, "oak_planks", position2);
        }
      }
  }


  async function buildRoof(bot, startPosition) {
    const size = 5;
    const roofBlock = "cobblestone";
    
    const item = bot.inventory.findInventoryItem(mcData?.itemsByName[roofBlock].id);
    
    if (!item || item.count < size * size + 4) {
      bot.chat(`I don't have enough ${roofBlock}`);
      let need = size * size + 4 - (item ? item.count : 0);
      chatTo(bot, bot.username, `I don't have enough ${roofBlock}, I need ${need} ${roofBlock}`)
    //   await mineBlock(bot, foundationBlock, foundationSize * foundationSize - (item ? item.count : 0));
    return 
  }

    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const position = startPosition.offset(x, size - 1, z);
        await placeItem(bot, roofBlock, position);
      }
    }
    await placeItem(bot, roofBlock, startPosition.offset(0, size, 0));
    await placeItem(bot, roofBlock, startPosition.offset(size-1, size, 0));
    await placeItem(bot, roofBlock, startPosition.offset(0, size, size-1));
    await placeItem(bot, roofBlock, startPosition.offset(size-1, size, size-1));  
  }

  async function placeDoor(bot, startPosition) {
    door = bot.inventory.items().find(item => item.name.endsWith('door'));
    console.log('door:',door);
    if (!door) {
      chatTo(bot, bot.username, "I don't have any doors to place.");
      return;
    }
     
    // mine the block in front of the door
    const position = startPosition.offset(2, 1, 0);
   
    await placeItem(bot,door.name, position)
  }

  async function buildStructure(bot) {
    const oakPlanks = mcData.itemsByName["oak_planks"];
    const oakPlankItem = bot.inventory.findInventoryItem(oakPlanks.id);
    // if (!oakPlankItem || oakPlankItem.count < 100) {
    //   bot.chat("I don't have enough oak planks to build the structure. I will gather more.");
    //   await mineBlock(bot, "oak_log", 100);
    // }
    const startPosition = bot.entity.position.floored();
    console.log('startPosition:',startPosition);
    
    // Lay the foundation
    for (let x = 0; x < 5; x++) {
      for (let z = 0; z < 5; z++) {
        const position = startPosition.offset(x, 0, z);
        await placeItem(bot, "oak_planks", position);
      }
    }
    // Build the walls
    for (let x = 0; x < 5; x++) {
      for (let y = 1; y < 4; y++) {
        const position = startPosition.offset(x, y, 0);
        await placeItem(bot, "oak_planks", position);
        const position2 = startPosition.offset(x, y, 4);
        await placeItem(bot, "oak_planks", position2);
      }
    }
    for (let z = 0; z < 5; z++) {
      for (let y = 1; y < 4; y++) {
        const position = startPosition.offset(0, y, z);
        await placeItem(bot, "oak_planks", position);
        const position2 = startPosition.offset(4, y, z);
        await placeItem(bot, "oak_planks", position2);
      }
    }
    // Build the roof
    for (let x = 0; x < 5; x++) {
      for (let z = 0; z < 5; z++) {
        const position = startPosition.offset(x, 4, z);
        await placeItem(bot, "oak_planks", position);
      }
    }
    // Build the floors
    for (let x = 1; x < 4; x++) {
      for (let z = 1; z < 4; z++) {
        const position = startPosition.offset(x, 0, z);
        await placeItem(bot, "oak_planks", position);
      }
    }
    bot.chat("Finished building the structure.");
  }
   
async function BuildAHouse(bot, startPosition) {
   
  await layFoundation(bot, startPosition);
  await buildWalls(bot, startPosition);
  await placeDoor(bot, startPosition);
  await buildRoof(bot, startPosition);

  
}
  bot.once('spawn', () => {
   
    startPosition = bot.entity.position.floored();
    console.log('startPosition:',startPosition);
    
    BuildAHouse(bot, startPosition);


})



//  记录错误和被踢出服务器的原因:
bot.on('kicked', console.log)
bot.on('error', console.log)