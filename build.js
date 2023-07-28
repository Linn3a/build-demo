const mineflayer = require('mineflayer')

const registry = require('prismarine-registry')('1.8')
const Block = require('prismarine-block')(registry)
const { pathfinder } = require("mineflayer-pathfinder");
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear,GoalBlock } = require('mineflayer-pathfinder').goals
const { Vec3 } = require('vec3')


const bot = mineflayer.createBot({
  host: 'localhost', // minecraft 服务器的 ip地址
  port: 63712,        
  name: 'build',    // 默认使用25565，如果你的服务器端口不是这个请取消注释并填写。
  // version: false,             // 如果需要指定使用一个版本或快照时，请取消注释并手动填写（如："1.8.9 " 或 "1.16.5"），否则会自动设置。
  // auth: 'mojang'              // 如果需要使用微软账号登录时，请取消注释，然后将值设置为 'microsoft'，否则会自动设置为 'mojang'。
})
bot.loadPlugin(pathfinder);
const size = 3

const mcData = require("minecraft-data")(bot.version);

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
        for(let k = 0; k <= size + 3; k++)
        {
            let checkBlock = bot.blockAt(block.position.plus(new Vec3(i,k,j)));
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


async function place(referenceBlock, faceVector, destBlock) {
    try{await bot.placeBlock(referenceBlock, faceVector)}
        catch(err){
            console.log('err: ',err);
            console.log("checkBlock: bot.blockAt(referenceBlock.position.plus(faceVector)).type != destBlock.type",bot.blockAt(referenceBlock.position.plus(faceVector)));
            
            while(!bot.blockAt(referenceBlock.position.plus(faceVector)) || bot.blockAt(referenceBlock.position.plus(faceVector)).name != destBlock)
            {
            try{
                // console.log('destBlock: ',destBlock);
                await equip(destBlock, 'hand')
                // console.log('newBlock: ',bot.blockAt(referenceBlock.position.plus(faceVector)));
                await bot.placeBlock(referenceBlock, faceVector)}
                catch{}
            }                
}
}

async function equip (item_name, destination)
{
    item = bot.inventory.items().filter(item => item.name === item_name)[0]
    await bot.equip(item, destination)
}

async function BuildAHouse (door, wood, roof, startBlock) {
    // const wood = bot.inventory.items().filter(item => item.name === wood_name)[0]
    let referenceBlock = startBlock
    let faceVector = new Vec3(0,1,0)
    console.log('wood: ',wood);

//
let origin_reference 
await equip(wood, 'hand')
await place(referenceBlock,faceVector,wood)
referenceBlock = bot.blockAt(referenceBlock.position.offset(0,1,0))
let base = bot.blockAt(startBlock.position.offset(0,1,0))
let up = new Vec3(0,1,0)
let direction = [
    new Vec3(1,0,0),
    new Vec3(0,0,1),
    new Vec3(-1,0,0),
    new Vec3(0,0,-1),
]

let len = [
    size + 2,
    size + 1,
    size + 1,
    size,
]

// wall
bot.chat(`build walls`)
for(let l = 0;l < 4; l++)
for(let i = 0; i < len[l]; i++)
{
    if(l != 0 || i != 0)
    {
        await equip(wood, 'hand')
        await place(base,direction[l],wood)
        base = bot.blockAt(base.position.plus(direction[l]))
    }
    for(let j = 0; j < size; j++)
    {
        await equip(wood, 'hand')
        await place(bot.blockAt(base.position.offset(0,j,0)),up,wood)
    }
    await equip(roof, 'hand')
    await place(bot.blockAt(base.position.offset(0,size,0)),up,roof)
    
}
bot.chat(`build roof`)
// roof
await equip(roof, 'hand')
await place(bot.blockAt(startBlock.position.offset(0,size+2,0)),up,roof)
await equip(roof, 'hand')
await place(bot.blockAt(startBlock.position.offset(0,size+2,size+1)),up,roof)
await equip(roof, 'hand')
await place(bot.blockAt(startBlock.position.offset(size+1,size+2,0)),up,roof)
await equip(roof, 'hand')
await place(bot.blockAt(startBlock.position.offset(size+1,size+2,size+1)),up,roof)
for(let i = 1; i <= size; i++)
{
    for(let j = 0; j < size; j++)
    {
        await equip(roof, 'hand')
        await place(bot.blockAt(startBlock.position.offset(i,size+2,j)),direction[1],roof)
    }
}
// // let door =  bot.inventory.items().filter(item => item.name === door_name)[0]
bot.chat(`build door`)

if(size % 2 == 0){
await bot.dig(bot.blockAt(startBlock.position.offset(size/2+1,1,0)))
await bot.dig(bot.blockAt(startBlock.position.offset(size/2+1,2,0)))
await equip(door, 'hand')
await place(bot.blockAt(startBlock.position.offset(size/2,1,0)),new Vec3(1,0,0),door)
}
else 
{
    await bot.dig(bot.blockAt(startBlock.position.offset((size+1)/2,1,0)))
    await bot.dig(bot.blockAt(startBlock.position.offset((size+1)/2,2,0)))
    await equip(door, 'hand')
    await place(bot.blockAt(startBlock.position.offset((size-1)/2,1,0)),new Vec3(1,0,0),door)
}

}


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
        const roof = 'stone'
        BuildAHouse(door,wood,roof,checkBlock).then(()=>{console.log('build house done')})        
            // BuildARoof('stone',checkBlock)}
    // })
    }
})



//  记录错误和被踢出服务器的原因:
bot.on('kicked', console.log)
bot.on('error', console.log)