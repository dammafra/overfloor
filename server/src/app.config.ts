import { monitor } from '@colyseus/monitor'
import { playground } from '@colyseus/playground'
import config from '@colyseus/tools'
import { GameRoom } from '@rooms/game-room'
import { LobbyRoom } from 'colyseus'
import basicAuth from 'express-basic-auth'

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
  },

  initializeGameServer: gameServer => {
    gameServer.define('lobby', LobbyRoom)
    gameServer.define('game-room', GameRoom).enableRealtimeListing()
  },
})
