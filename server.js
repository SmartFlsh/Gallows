import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import fs from 'fs'

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const letter = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.split('')
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

let readyS = 0
let motion = 0

const deepCopy = (arr) => {
  return JSON.parse(JSON.stringify(arr));
};

let jsonData; 
fs.readFile('public/categories.json', 'utf8', (err, data) => { 
  if (err) { 
    console.error('Ошибка при чтении файла:', err); 
    return; 
  } 
  jsonData = JSON.parse(data); 
});


const player = [
  {
    id: undefined,
    readyCheck: false,
    categ: undefined,
    schet: undefined,
    nickName: undefined
  },
  {
    id: undefined,
    readyCheck: false,
    categ: undefined,
    schet: undefined,
    nickName: undefined
  },
  {
    id: undefined,
    readyCheck: false,
    categ: undefined,
    schet: undefined,
    nickName: undefined
  }
]

const itemsSlotsDemo = [
  {id:1, item: null},
  {id:2, item: null},
  {id:3, item: null}
]

const dataDemo = {
  globalWord: [],
  nowWord: [],
  motion: false,
  wrongLetter: [],
  rightLetter: [],
  itemsSlots: deepCopy(itemsSlotsDemo),
  nickName: '',
  karma: 0,
  wrong: 0,
  wins: 1,
  time: 0
}

let matchValue = false

const data = []

const item = [
  {name: 'Взгляд в будущие', content: 'Добавляет ошибку выбранному игроку. Нельзя использовать на себя. Нельзя полностью привести оппонента к поражению.', used: true, img: null, func: 'one'},
  {name: 'Ретроспектива', content: 'Убирает ошибку. Не сработает, если у вас всего одна ошибка', used: false, img: null, func: 'two'},
  {name: 'Оракул', content: 'Предлагает выбор: добавить ошибку оппоненту или снять две ошибки с себя. Нельзя полностью привести оппонента к поражению.', used: true, img: null, func: 'three'},
  {name: 'Карандаш', content: 'Добавляет случайную букву оппоненту. Нельзя использовать на себя.', used: true, img: null, func: 'four'},
  {name: 'Фазовый сдвиг', content: 'Перемешивает буквы у всех игроков.', used: false, img: null, func: 'five'},
  {name: 'Устроим переворот', content: 'Переворачивает окно на 90° на два хода. Нельзя использовать на себя.', used: true, img: null, func: 'six'},
  {name: 'Миграция', content: 'Меняет местами две буквы. Если это буква была ошибочной, она раскроется.', used: true, img: null, func: 'seven'},
  {name: 'Откровение', content: 'Раскрывает случайную букву или буквы, если есть совпадающие.', used: false, img: null, func: 'eight'},
]

const itemValue = [ 7, 10, 4, 3, 2, 5, 2, 4 ]

let connectedPlayers = 0

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    connectedPlayers++

    if(connectedPlayers > 3 || matchValue) {
      console.log('disconnect')
      socket.emit('maxPlayers', 'The server is full, you have been disconnected.');
      socket.disconnect(true);
      connectedPlayers--
      return;
    }
    console.log(socket.id)

    socket.emit('readyCount', readyS)
    io.emit('readyCheck', false)
    io.emit('maxPlayer', connectedPlayers)
    socket.emit('JSON', jsonData)


    for(let i = 0; i < player.length; i++){
      if(!player[i].id){
        player[i].id = socket.id
        console.log(player)
        break;
      }
    }

    const check = (ev)=>{
      if(data[ev[0]].karma >= 3){
        data[ev[0]].wrong++
        data[ev[0]].karma = 0
      }
      io.emit('data', data)

      io.emit('deleteItem', ev)
      setTimeout(() => {
        data[ev[0]].itemsSlots[ev[2]] = {id:ev[2], item: null}
        io.emit('data', data)
      }, 2000);
    }

    const resetGame = ()=>{
      matchValue = false
      data.splice(0, data.length)
      readyS = 0
      io.emit('readyCheck', false)
      io.emit('reset')
      io.emit('readyCount', readyS)
      io.emit('maxPlayer', connectedPlayers)
      for(let j = 0; j < player.length; j++){
        player[j].readyCheck = false
        player[j].check = undefined
      }
      io.emit('data', data)
    }

    const checkLose = (ev)=>{
      if(data[ev].wrong >= 7){
        data[ev].wins = false
        io.emit('lose', ev)
      }
      if(!data[ev].nowWord.includes('_')){
        data[ev].wins = true
      }
    }

    const checkWins = (ev)=>{
      for(let i = 0; i < data[ev[0]].nowWord.length; i++){
        if(data[ev[0]].nowWord[i] === '_'){
          return
        }
      }
      data[ev[0]].wins = true
    }

    const generateRandomItem = (ev)=>{
      let sum = 0
      let newItem = []
      itemValue.forEach(el => {
        sum += el
        newItem.push(sum)
      });
      
      const randomInt = Math.floor(Math.random() * sum)
    
      for(let i = 0; i < newItem.length; i++){
        if(randomInt < newItem[i]) {
          for(let j = 0; j < data[ev].itemsSlots.length; j++){
            if(data[ev].itemsSlots[j].item === null){
              data[ev].itemsSlots[j].item = item[i]
              return
            }
          }
          return;
        }
      }
    }

    socket.on('delete', (ev)=>{
      io.emit('deleteItem', ev)
      setTimeout(() => {
        data[ev[0]].itemsSlots[ev[2]] = {id:ev[2], item: null}
        io.emit('data', data)
      }, 2000);
    })

    /* Предметы */

    socket.on(item[0].func, (ev)=>{
      if(ev[0] !== ev[1] && data[ev[1]].wrong < 6){
        data[ev[1]].wrong++
        data[ev[0]].karma++
        io.to(player[player.findIndex(el=> el.schet === ev[1])].id).emit('attack')
        check(ev)
      }else{
        socket.emit('wrongUseItem', ev)
      }
    })
    socket.on(item[1].func, (ev)=>{
      if(data[ev[0]].wrong > 1){
        data[ev[0]].wrong--;
        check(ev)
      }else{
        socket.emit('wrongUseItem', ev)
      }
    })
    socket.on(item[2].func, (ev)=>{
      if(ev[0] === ev[1]){
        for(var i = 0; i < 2; i++){
          if(data[ev[0]].wrong > 1){
            data[ev[0]].wrong--
            io.emit('data', data)
          }
        }
        
        io.emit('deleteItem', ev)
        setTimeout(() => {
          data[ev[0]].itemsSlots[ev[2]] = {id:ev[2], item: null}
          io.emit('data', data)
        }, 2000);
      }else{
        if(data[ev[1]].wrong > 6){
          socket.emit('wrongUseItem', ev)
          return
        }
        data[ev[1]].wrong++
        data[ev[0]].karma++
        io.to(player[player.findIndex(el=> el.schet === ev[1])].id).emit('attack')
        check(ev)
      }
    })
    socket.on(item[3].func, (ev)=>{
      let isCheck = true
      let randomIndex
      if(ev[0] === ev[1]){
        socket.emit('wrongUseItem', ev)
        return
      }
      do {
        randomIndex = Math.floor(Math.random() * letter.length)
        if(!data[ev[1]].wrongLetter.includes(letter[randomIndex]) && !data[ev[1]].rightLetter.includes(letter[randomIndex])){
          isCheck = false
          data[ev[1]].globalWord.push(letter[randomIndex])
          data[ev[1]].nowWord.push('_')
          data[ev[0]].karma++
        }
      } while (isCheck);
      io.to(player[player.findIndex(el=> el.schet === ev[1])].id).emit('attack')
      check(ev)
    })
    socket.on(item[4].func, (ev)=>{
      for(let i = 0; i < data.length; i++){
        for(let j = 0; j < data[i].globalWord.length; j++){
          const randomIndex = Math.floor(Math.random() * (j + 1));
          [data[i].globalWord[j], data[i].globalWord[randomIndex]] = [data[i].globalWord[randomIndex], data[i].globalWord[j]];
        }

        data[i].globalWord.forEach((ev, index)=>{
          if(data[i].rightLetter.includes(ev)){
            data[i].nowWord[index] = ev
          }else{
            data[i].nowWord[index] = '_'
          }
        })
      }
      check(ev)
    })
    socket.on(item[5].func, (ev)=>{
      if(ev[0] === ev[1]){
        socket.emit('wrongUseItem', ev)
        return
      }
      data[ev[1]].time = 2
      data[ev[0]].karma++
      io.to(player[player.findIndex(el=> el.schet === ev[1])].id).emit('attack')
      check(ev)
    })
    socket.on(item[6].func, (ev)=>{ /* [[player, itemIndex], [{player, letter},{player, letter}]]  */

      [data[ev[1][0].player].globalWord[ev[1][0].letter], data[ev[1][1].player].globalWord[ev[1][1].letter]] = [data[ev[1][1].player].globalWord[ev[1][1].letter], data[ev[1][0].player].globalWord[ev[1][0].letter]];
      [data[ev[1][0].player].nowWord[ev[1][0].letter], data[ev[1][1].player].nowWord[ev[1][1].letter]] = [data[ev[1][1].player].nowWord[ev[1][1].letter], data[ev[1][0].player].nowWord[ev[1][0].letter]];

      for(let i = 0; i < 2; i++){
        if(data[ev[1][i].player].nowWord[ev[1][i].letter] === '_'){
          if(data[ev[1][i].player].wrongLetter.includes(data[ev[1][i].player].globalWord[ev[1][i].letter])){
            data[ev[1][i].player].rightLetter.push(data[ev[1][i].player].globalWord[ev[1][i].letter])
            data[ev[1][i].player].wrongLetter.splice( data[ev[1][i].player].wrongLetter.indexOf(data[ev[1][i].player].nowWord[ev[1][i].letter]), 1);
          }
        }else{
          if(data[ev[1][i].player].wrongLetter.includes(data[ev[1][i].player].globalWord[ev[1][i].letter])){
            data[ev[1][i].player].rightLetter.push(data[ev[1][i].player].nowWord[ev[1][i].letter])
            data[ev[1][i].player].wrongLetter.splice( data[ev[1][i].player].wrongLetter.indexOf(data[ev[1][i].player].nowWord[ev[1][i].letter]), 1);
          }
          if(!data[ev[1][i].player].rightLetter.includes(data[ev[1][i].player].globalWord[ev[1][i].letter])){
            data[ev[1][i].player].rightLetter.push(data[ev[1][i].player].globalWord[ev[1][i].letter])
          }
        }
      }

      for(let i = 0; i < 2; i++){
        data[ev[1][i].player].globalWord.forEach((el, index)=>{
          if(data[ev[1][i].player].rightLetter.includes(el)){
            data[ev[1][i].player].nowWord[index] = el
          }else{
            data[ev[1][i].player].nowWord[index] = '_'
          }
        })
      }

      for(let i = 0; i < 2; i++){
        checkLose(ev[1][i].player)
      }
      
      check([ev[0][0], ev[0][0], ev[0][1]])
    })
    socket.on(item[7].func, (ev)=>{
      let che = true
      let random
      do {
        random = Math.floor(Math.random() * data[ev[0]].globalWord.length)
        if(data[ev[0]].nowWord[random] === '_'){
          data[ev[0]].rightLetter.push(data[ev[0]].globalWord[random])
          che = false
        }
      } while (che);

      data[ev[0]].globalWord.forEach((el, index)=>{
        if(data[ev[0]].rightLetter.includes(el)){
          data[ev[0]].nowWord[index] = el
        }else{
          data[ev[0]].nowWord[index] = '_'
        }
      })
      checkWins(ev)
      check(ev)
    })

    socket.emit('data', data)

    socket.on('move', (ev)=>{
      const [id, key] = ev
      let check = 0
      let checkArray = 0

      if(data[id].time !== 0){
        data[id].time--
      }
      
      data[id].globalWord.forEach((v, index)=>{
        if(v === key){
          data[id].nowWord[index] = key
          check = 1
        }
      })

      if(check !== 1){
        data[id].wrongLetter.push(key)
        data[id].wrong++
      }else{
        data[id].rightLetter.push(key)
      }

      data[id].motion = false

      if(data[id].wrong >= 7){
        data[id].wins = false
        io.emit('lose', id)
      }
      if(!data[id].nowWord.includes('_')){
        data[id].wins = true
      }

      data.forEach((ev, index) => {
        if(data[index].wins !== 1){
          checkArray++
        }
      });

      if(checkArray === data.length){
        setTimeout(() => {
          resetGame()
        }, 7000);
        return
      }

      let chekWins = true
      let i = id
      do {
        i++
        if(i === data.length){
          i = 0
        }
        if(data[i].wins === 1){
          chekWins = false
        }
      } while (chekWins);

      data[i].motion = true

      generateRandomItem(i)
      io.emit('data', data)
    })

    socket.on('changeCateg', (ev)=>{
      for(let i = 0; i < player.length; i++){
        if(player[i].id === socket.id){
          player[i].categ = ev
        }
      }
    })

    socket.on('readyCount', (ev)=>{
      const index = player.findIndex(ev => ev.id === socket.id)
      if(!player[index].readyCheck){
        player[index].readyCheck = true
        player[index].categ = ev[0]
        player[index].nickName = ev[1]
        readyS++
        io.emit('readyCount', readyS)
        console.log(player)
      }

      if(readyS === connectedPlayers){
        matchValue = true
        let schet = 0
        for(let i = 0; i < player.length; i++){
          if(player[i].id){
            data.push(deepCopy(dataDemo))
            data[schet].nickName = player[i].nickName
            io.to(player[i].id).emit('user', schet)
            player[i].schet = schet
            schet++
          }
        }

        for(let j = 0; j < data.length; j++){
          const gen = jsonData[player[j].categ]
          data[j].globalWord = gen[Math.floor(Math.random() * gen.length)].toLowerCase().split('')
          data[j].nowWord = data[j].globalWord.map(() => '_');
        }

        motion = Math.floor(Math.random() * data.length)
        data[motion].motion = true
        io.emit('data', data)
        io.emit('readyCheck', true)
      }
    })

    socket.on('disconnect', ()=>{
      connectedPlayers--
      const index = player.findIndex(ev=> ev.id === socket.id)
      console.log(`disconnect ${player[index].id}`)
      player[index].id = undefined
      player[index].readyCheck = false
      player[index].categ = undefined
      player[index].nickName = undefined

      if(data.length === 0){
        readyS = 0
        for(let j = 0; j < player.length; j++){
          if(player[j].readyCheck){
            readyS++
          }
        }
        io.emit('readyCount', readyS)
        io.emit('maxPlayer', connectedPlayers)
      }else{
        io.emit('lose', player[index].schet)
        data[player[index].schet].wins = false

        let restart = 0
        for(let i = 0; i < player.length; i++){
          if(!player[i].id){
            restart++
          }
        }
        if(restart === player.length){
          resetGame()
          player[index].schet = undefined
          return
        }

        if(data.length !== 0 && data[player[index].schet].motion){
          let checkArray = 0

          data.forEach((ev, index) => {
            if(data[index].wins !== 1){
              checkArray++
            }
          });
    
          if(checkArray === data.length){
            resetGame()
            return
          }
    
          let chekWins = true
          let i = player[index].schet
          do {
            i++
            if(i === data.length){
              i = 0
            }
            if(data[i].wins === 1){
              chekWins = false
            }
          } while (chekWins);
    
          data[i].motion = true
          io.emit('data', data)
        }
        player[index].schet = undefined
      }
    })
  });

  httpServer
  .once("error", (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});