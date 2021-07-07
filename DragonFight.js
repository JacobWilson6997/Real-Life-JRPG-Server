let hp = 500
let deadPlayers = 0

function playerDamageCalc(receivedData, playerData) {
  if(receivedData.move == 'attack') {
    if(receivedData.target == 'dragon') {
      console.log("damaging Dragon")
      hp -= 50
    } else {
      console.log("damaging",receivedData.target)
      playerData.get(receivedData.target).hp -= 50
      playerData.get(receivedData.target).move = receivedData.move
      playerData.get(receivedData.target).message += receivedData.name + ' attacked you.%'
    }
  } else {
    if(playerData.get(receivedData.name).heal > 0) {
      console.log("healing",receivedData.target)
      if(receivedData.target == "dragon") {
        hp += 50
      } else {
        playerData.get(receivedData.target).hp += 50
        playerData.get(receivedData.target).message += receivedData.name + ' healed you.%'
        
      }
      playerData.get(receivedData.name).heal -= 1
    }
  }
  return playerData
}
let waitingPlayers = []

function dragonDamageCalc(playerData) {
  // 0 = claw, 1 = breath, 3 = tail whip
  let playernum = waitingPlayers.length
  if(Math.floor(Math.random() * 3) == 0)
  {
    console.log('dc')
    let rand1 = waitingPlayers[Math.floor(Math.random() * playernum)]
    let rand2 = waitingPlayers[Math.floor(Math.random() * playernum)]
    console.log("players", rand1, "and", rand2, "were dc")
    playerData.get(rand1).hp -= 10
    playerData.get(rand1).move = 'dc'
    playerData.get(rand2).hp -= 10
    playerData.get(rand2).move = 'dc'
    if(rand1 == rand2) {
      console.log('dc 2')
      playerData.get(rand2).move = 'dc 2'
      playerData.get(rand2).message += "The dragon attacked%you twice with%it's claw"
    } else {
      playerData.get(rand1).message += "The dragon attacked%you with it's claw"
      playerData.get(rand2).message += "The dragon attacked%you with it's claw"

    }
  } else if (Math.floor(Math.random() * playernum) == 1) {
    console.log('db')
    let rand1 = waitingPlayers[Math.floor(Math.random() * playernum)]
    console.log("player", rand1,"was db")
    playerData.get(rand1).hp -= 30
    playerData.get(rand1).move = 'db'
    playerData.get(rand1).message += "The dragon attacked%you with it's breath"

  } else {
    console.log('dt')
    console.log("everyone was dt")
    for(let i = 0; i < playernum; i++) {
      playerData.get(waitingPlayers[i]).message += "The dragon attacked%you with it's tail"
        playerData.get(waitingPlayers[i]).hp -= 10
        playerData.get(waitingPlayers[i]).move = 'dt'
        console.log("loop")
      }
  }

  return playerData
}



async function fight(receivedData, playerData, playersSocket) {
  console.log("current HP:",hp)

  waitingPlayers.push(receivedData.name)// put it in the array
  console.log("waiting players", waitingPlayers)

  playerDamageCalc(receivedData,playerData)
  if (waitingPlayers.length == playersSocket.size) { // if all players are ready
    console.log("all players have attacked")
    dragonDamageCalc(playerData)
    for(let i = 0; i < waitingPlayers.length; i++) { // send data to every player
      if(hp <= 0) {
        playerData.get(waitingPlayers[i]).state = "finished"
      }
      currentPlayer = waitingPlayers[i]
      currentData = playerData.get(currentPlayer)
      if(currentData.hp <=0) {
        deadPlayers++
        console.log("deadplayers:",deadPlayers)
        console.log("total players:",waitingPlayers.length)
      }
      console.log(currentData.name,"HP:",currentData.hp)
      playersSocket.get(currentPlayer).send(JSON.stringify(currentData)) // access the socket in the map and send data too it
      console.log("current HP:",hp)
      if(deadPlayers == waitingPlayers.length) {
        process.exit(1)
      }
    } 
    if(hp == 0) {
      process.exit(1)
    }
    waitingPlayers = []
  }
}

module.exports = { fight };