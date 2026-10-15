// Same format as Playroom's generated room codes (not exported by playroomkit)
const ROOM_CODE_ALPHABET = '123456789ABCDEFGHIJKLMNPQRSTUVWXYZ'
const ROOM_CODE_LENGTH = 4

export function generateRoomCode() {
  return Array.from(
    { length: ROOM_CODE_LENGTH },
    () => ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)],
  ).join('')
}
