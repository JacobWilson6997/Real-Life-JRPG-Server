const WebSocket = require('ws')
const fight = require("./DragonFight.js")
 
const wss = new WebSocket.Server({ port: 8080 })



let playersSocket = new Map()
let playerData = new Map()
let receivedData
let playerList =[]

// after a sword is sent a reply to it's initial connection
// it will have an option to say its ready
// when all players are ready, the battle will begin.
// this is to prevent the game starting when not everyone is connected.
async function ready(receivedData) {
  playerList.push(receivedData.name)// put it in the array
  receivedData.state = 'fight'
  playerData.set(receivedData.name, receivedData)
  if (playerList.length == playersSocket.size) { // if all players are ready
    console.log("all players are ready, waiting for actions")
    receivedData.playerList = playerList
    for(let i = 0; i < playerList.length; i++) { // send data to every player
      receivedData.name = playerList[i]
      playersSocket.get(playerList[i]).send(JSON.stringify(receivedData)) // access the socket in the map and send data too it
    }
  }
}

wss.on('connection', ws => {
  console.log("connected")
  ws.on('message', key => { //received from client
    receivedData = JSON.parse(key)
    console.log("current state:",receivedData.state)
    if(receivedData.state == 'connecting') { // initial connection
      playersSocket.set(receivedData.name,ws) // put new player in map
      receivedData.state = 'connected' // just in case a player connects after another is ready
      ws.send(JSON.stringify(receivedData)) // send comformation
    } else if (receivedData.state == 'ready') { // a player is ready
      console.log("received ready state")
      ready(receivedData)
    } else if (receivedData.state == 'fight') {
      console.log("received fight state")
      playerData.set(receivedData.name, receivedData)
      fight.fight(receivedData, playerData, playersSocket)
    }
  })
})

wss.on('error', function(error) {
  console.log('error:',error)
})

console.log("Server Running")