import { world, system } from "@minecraft/server"
import { ModalFormData } from "@minecraft/server-ui"

let playerList = [];
let playerNameList = [];
let blackList = [];

world.afterEvents.playerSpawn.subscribe(psEvent => { // ワールド作成者に権限を与える。
    let players = world.getAllPlayers();
    if (players.length != 1) {
        if (psEvent.player.hasTag(`owner`)) world.getDimension(`overworld`).runCommandAsync(`give ${psEvent.player.name} sugiuta:owner_book`);
    } else {
        world.getDimension(`overworld`).runCommandAsync(`say ${psEvent.player.name}をワールド作成者として登録しました。`);
        world.getDimension(`overworld`).runCommandAsync(`tag ${psEvent.player.name} add owner`);
        world.getDimension(`overworld`).runCommandAsync(`give ${psEvent.player.name} sugiuta:owner_book`);
    }
});

// 指定のアイテムを使用した際にメニューを開く
world.afterEvents.itemUse.subscribe(useEvent => {
    if (useEvent.source.typeId != `minecraft:player` || useEvent.itemStack.typeId != `sugiuta:owner_book` || !useEvent.source.hasTag(`owner`)) return;

    if (playerList.length != 0 || playerNameList.length != 0) {
        playerList.length = 0;
        playerNameList.length = 0;
    }

    let players = world.getAllPlayers();
    for (let player of players) {
        playerList.push(player);
        playerNameList.push(player.name);
    }

    const ownerForm = new ModalFormData()
    .title(`§2§lプレイヤー設定`)
    .dropdown(`[プレイヤーを選択]`, playerNameList)
    .dropdown(`[アクションを選択]`, [`アクションを選択`, `プレイヤーを拘束`, `プレイヤーの拘束を解除`, `プレイヤーをBAN`])
    ownerForm.show(useEvent.source).then(response => {
        let player = playerList[response.formValues[0]];
        switch(response.formValues[1]) {
            case 0:
                break;
            case 1:
                world.getDimension(`overworld`).runCommandAsync(`say ${player.name}を拘束しました。`);
                blackList.push(player);
                break;
            case 2:
                if (blackList.length == 0) return;
                world.getDimension(`overworld`).runCommandAsync(`say ${player.name}の拘束を解除しました。`);
                let location = useEvent.source.location;
                world.getDimension(`overworld`).runCommandAsync(`tp ${player.name} ${useEvent.source.name}`);
                blackList.length = 0;
                break;
            case 3:
                world.getDimension(`overworld`).runCommandAsync(`kick ${player.name} また遊びにきてね＾＾`);
                break;
            default:
                break;
        }
    })
});

world.afterEvents.entityHitEntity.subscribe(ehEvent => {
    let entityId = ehEvent.damagingEntity.typeId;
    let targetId = ehEvent.hitEntity.typeId;
    if (entityId != `minecraft:player` || targetId != `minecraft:player`) return;
    world.getDimension(`overworld`).runCommandAsync(`say ${ehEvent.damagingEntity.nameTag}が${ehEvent.hitEntity.nameTag}を攻撃しました。`);
});

world.afterEvents.entityDie.subscribe(edEvent => {
    let entity = edEvent.damageSource.damagingEntity;
    let target = edEvent.deadEntity;
    if (entity.typeId != `minecraft:player` || target.typeId != `minecraft:player`) return;
    world.getDimension(`overworld`).runCommandAsync(`say ${entity.nameTag}が${target.nameTag}をキルしました。荒らしの可能性があるため拘束します。拘束を解除するにはオーナーブックにて拘束解除を行なってください。`);
    blackList.push(entity);
});

system.runInterval(() => {
    if (blackList.length == 0) return;
    for (let bad_user of blackList) {
        let options = {
            dimension: bad_user.dimension,
            facingLocation: bad_user.getViewDirection()
        }
        bad_user.teleport(world.getDefaultSpawnLocation(), options);
    }
})


