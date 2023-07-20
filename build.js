const mineflayer = require('mineflayer')
const registry = require('prismarine-registry')('1.8')
const Block = require('prismarine-block')(registry)
const { Vec3 } = require('vec3')

const bot = mineflayer.createBot({
  host: 'localhost', // minecraft 服务器的 ip地址
  port: 50256,        
  name: 'build',    // 默认使用25565，如果你的服务器端口不是这个请取消注释并填写。
  // version: false,             // 如果需要指定使用一个版本或快照时，请取消注释并手动填写（如："1.8.9 " 或 "1.16.5"），否则会自动设置。
  // auth: 'mojang'              // 如果需要使用微软账号登录时，请取消注释，然后将值设置为 'microsoft'，否则会自动设置为 'mojang'。
})
const size = 3


function checkSpace(block){
    // console.log('block: ',block);
    // console.log('x+1 block: ',bot.blockAt(block.position.offset(1,0,0)));


    let flag = true;
    // 从改点向上一个4*5*5 的空间没有东西

    // 向上有4ge
for(let i = 0; i < size + 2; i++)
{
    for(let j = 0; j < size + 2; j++)
    {
        // let currentBlock = bot.blockAt(block.position.offset(newV));
        // console.log("currentBlock: ",currentBlock);     
        for(let k = 0; k <= size + 1; k++)
        {
            let checkBlock = bot.blockAt(block.position.offset(new Vec3(i,k,j)));
            // console.log('checkBlock',checkBlock)
            flag = flag && (!checkBlock || checkBlock.type === 0)
        }
}
}
return flag
}


function blockToBuild () {
    return bot.findBlock({
      point: bot.entity.position,
      matching: bot.registry.blocksByName.farmland.id,
      maxDistance: 6,
      useExtraInfo: checkSpace
  })}

async function place(referenceBlock, faceVector) {
    try{
        await bot.placeBlock(referenceBlock, faceVector)}
        catch(err){
            console.log('err: ',err);
            try{
                for(let i = 0; i < 20; i++)
                await bot.placeBlock(referenceBlock, faceVector)
            }
                catch{
                    console.log('err: ',err);
                    }
                
}
}


async function BuildAHouse (door_name, wood_name, startBlock) {
    const wood = bot.inventory.items().filter(item => item.name === wood_name)[0]
    let referenceBlock = startBlock
    let faceVector = new Vec3(0,1,0)
    // await bot.equip(wood, 'hand')
    // // await bot.placeBlock(startBlock,new Vec3(0,1,0))
    // // let referenceBlock = bot.blockAt(startBlock.position.offset(0,1,0))
    // await bot.placeBlock(referenceBlock,faceVector)
    // referenceBlock = bot.blockAt(referenceBlock.position.offset(faceVector))
    // for(let i = 0; i < size + 2; i++){
        // await bot.equip(wood, 'hand')
        // await bot.placeBlock(referenceBlock,faceVector)
        // referenceBlock = bot.blockAt(referenceBlock.position.offset(1,0,0))
//         for(let j = 0; j < size + 2; j++)
//         {
//             referenceBlock = bot.blockAt(startBlock.position.offset(0,0,j))
//         for(let k = 0;k < size + 1; k++)
//         {
//             await bot.equip(wood, 'hand')
//         // await bot.placeBlock(startBlock,new Vec3(0,1,0))
//         // let referenceBlock = bot.blockAt(startBlock.position.offset(0,1,0))
//             await bot.placeBlock(referenceBlock,faceVector)
//             referenceBlock = bot.blockAt(referenceBlock.position.offset(0,1,0))
//         }
// }  
// referenceBlock = bot.blockAt(startBlock.position.offset(1*(i+1),0,0))

//
let origin_reference 
await bot.equip(wood, 'hand')
await place(referenceBlock,faceVector)
referenceBlock = bot.blockAt(referenceBlock.position.offset(0,1,0))
for(let i = 0; i < size + 2; i++){
    
     origin_reference = referenceBlock
    console.log('origin_reference: ',origin_reference);
    
console.log('origin_reference: ',origin_reference);

for(let k = 0; k < size; k++)
{
    referenceBlock = bot.blockAt(referenceBlock.position.offset(0,k,0))
    faceVector = new Vec3(0,1,0)
    await bot.equip(wood, 'hand')
    await place(referenceBlock,faceVector)
    console.log('k: ',k);
}
referenceBlock = origin_reference
if (i!= size + 1){
await bot.equip(wood, 'hand')
// console.log('origin_reference: ',origin_reference);
await place(origin_reference, new Vec3(1,0,0))
referenceBlock = bot.blockAt(origin_reference.position.offset(1,0,0))
}
}

// origin_reference = referenceBlock

for(let i = 0; i < size + 1; i++){    
    await bot.equip(wood, 'hand')
    referenceBlock = origin_reference
    await place(referenceBlock, new Vec3(0,0,1))
    referenceBlock = bot.blockAt(origin_reference.position.offset(0,0,1))
    origin_reference = referenceBlock
    for(let k = 0; k < size; k++)
    {
    referenceBlock = bot.blockAt(referenceBlock.position.offset(0,k,0))
    faceVector = new Vec3(0,1,0)
    await bot.equip(wood, 'hand')
    await place(referenceBlock,faceVector)
    console.log('k: ',k);
    }
}

for(let i = 0; i < size + 1; i++){    
    await bot.equip(wood, 'hand')
    referenceBlock = origin_reference
    await place(referenceBlock, new Vec3(-1,0,0))
    referenceBlock = bot.blockAt(origin_reference.position.offset(-1,0,0))
    origin_reference = referenceBlock
    for(let k = 0; k < size; k++)
    {
    referenceBlock = bot.blockAt(referenceBlock.position.offset(0,k,0))
    faceVector = new Vec3(0,1,0)
    await bot.equip(wood, 'hand')
    await place(referenceBlock,faceVector)
    console.log('k: ',k);
    }
}
for(let i = 0; i < size ; i++){    
    await bot.equip(wood, 'hand')
    referenceBlock = origin_reference
    await place(referenceBlock, new Vec3(0,0,-1))
    referenceBlock = bot.blockAt(origin_reference.position.offset(0,0,-1))
    origin_reference = referenceBlock
    for(let k = 0; k < size; k++)
    {
    referenceBlock = bot.blockAt(referenceBlock.position.offset(0,k,0))
    faceVector = new Vec3(0,1,0)
    await bot.equip(wood, 'hand')
    await place(referenceBlock,faceVector)
    console.log('k: ',k);
    }
}

referenceBlock = bot.blockAt(referenceBlock.position.offset(0,1,0))
origin_reference = referenceBlock
console.log('start build roof:', origin_reference);

for(let i = 1; i <= size;i++)
{
    for(let j=0;j<size;j++)
    {
        await bot.equip(wood, 'hand')
        referenceBlock = bot.blockAt(origin_reference.position.offset(i,0,j))
        await place(referenceBlock, new Vec3(0,0,1))
    }
    
}

let door =  bot.inventory.items().filter(item => item.name === door_name)[0]
console.log('door: ',door);

if(size % 2 == 0){
await bot.dig(bot.blockAt(startBlock.position.offset(size/2+1,1,0)))
await bot.dig(bot.blockAt(startBlock.position.offset(size/2+1,2,0)))
await bot.equip(door, 'hand')
await place(bot.blockAt(startBlock.position.offset(size/2,1,0)),new Vec3(1,0,0))
}
else 
{
    await bot.dig(bot.blockAt(startBlock.position.offset((size+1)/2,1,0)))
    await bot.dig(bot.blockAt(startBlock.position.offset((size+1)/2,2,0)))
    await bot.equip(door, 'hand')
    await place(bot.blockAt(startBlock.position.offset((size-1)/2,1,0)),new Vec3(1,0,0))
}

}
    // referenceBlock = bot.blockAt(startBlock.position.offset(0,1,0))
// }





bot.once('spawn', () => {
    console.log('bot position',bot.entity.position);
    // const door = new Block(registry.blocksByName[acacia_door])
    blockName = 'acacia_door'
    // const blockType = bot.mcData.blocksByName[blockName].id;
    const doorBlock = registry.blocksByName[blockName].id
    console.log('blockId: ',registry.blocksByName[blockName]);
    
    console.log(`方块 "${blockName}" 的数字ID为: ${doorBlock}`);

    const checkBlock = bot.blockAt(bot.entity.position.offset(-1,0,-1)); 
    const door = 'acacia_door'
    const wood = 'acacia_planks'
    // 将木头方块放置到创造模式的槽位中
   
    if(checkSpace(checkBlock))
    {
        const woodenBlock = 27; // 获取木头方块的ID/
        BuildAHouse(door,wood,checkBlock)
    }
//   // 装备木头方块到机器人的手中
//   bot.creative.setInventorySlot(slotIndex, 1, 64, (err) => {
//     if (err) {
//       console.log('加载物品到背包槽位时出错:', err);
//       return;
//     }

//     console.log('物品已加载到背包槽位！');
//   }).then(() =>
// const wood = bot.inventory.items().filter(item => 
//     {
//         // console.log('item: ',item);
//         return item.type === woodenBlock
//     })[0]
//   bot.equip(wood, 'hand', (err) => {
//     if (err) {
//       console.log('装备木头方块时出错:', err);
//       return;
//     }

//     console.log('机器人现在手上拿着一个木头方块！');
//   }).then(() => 
// // 好无语 ,,,,,, 站立的地方不能放置方块
//        { console.log('hand:',bot.inventory.slots[45])
//         // console.log('checkBlock: ',checkBlock);
        
//         bot.placeBlock(checkBlock, new Vec3(0,1,0))
// }
    //    ) 
// }
// }})
})
// )}});
    
    
    // // 获取目标位置的方块信息
    // bot.getBlock(targetPosition, (err, block) => {
    //   if (err) {
    //     console.log('获取方块信息时出错:', err);
    //     return;
    //   }
  
    //   console.log('目标位置的方块编号:', block.type);
    // });
//  记录错误和被踢出服务器的原因:
bot.on('kicked', console.log)
bot.on('error', console.log)