import { monitor } from '@colyseus/monitor'
import { playground } from '@colyseus/playground'
import config from '@colyseus/tools'
import { GameLobby, GameRoom } from '@rooms'
import { LobbyRoom, matchMaker } from 'colyseus'
import basicAuth from 'express-basic-auth'

export const ROOM_IDS_CHANNEL = '$IDS'

export default config({
  initializeExpress: app => {
    if (process.env.NODE_ENV !== 'production') {
      app.use('/', playground())
    }

    app.use(
      '/monitor',
      basicAuth({
        users: { admin: process.env.MONITOR_PASSWORD },
        challenge: true,
      }),
      monitor(),
    )

    app.get('/room-exists/:id', async (req, res) => {
      const currentIds = await matchMaker.presence.smembers(ROOM_IDS_CHANNEL)
      res.json(currentIds.includes(req.params.id))
    })

    app.get('/username-exists/:roomId/:username', async (req, res) => {
      const currentUsernames = await matchMaker.presence.smembers(req.params.roomId)
      res.json(currentUsernames.includes(req.params.username))
    })
  },

  initializeGameServer: gameServer => {
    gameServer.define('lobby', LobbyRoom)
    gameServer.define('game-lobby', GameLobby).enableRealtimeListing()
    gameServer.define('game-room', GameRoom)
  },
})
