'use client'

import { useEffect, useRef, useState } from 'react';
import './page.css'
import Test from './TestPhysics/page'
import Gallow from './gallows/Gallow' 
import { connectSocket, getSocket } from "./socket";
import anime, { easings } from 'animejs';
import Inventory from './inventory/Inventory'

const ButtonCategorii = ({ ev, index, indexButton, func, rofl, cate, red })=>{
  const [isActive, setIsActive] = useState(false)
  const socket = getSocket()

  useEffect(() => {
    if(index === indexButton){
      setIsActive(true)
    }else{
      setIsActive(false)
    }
  }, [indexButton]);
  
  const changeIndex = ()=>{
    if(!rofl){
      func(index)
      cate(ev)
      socket.emit('changeCateg', ev)
      return
    }
    cate(ev)
    func(index)
  }

  return(
    <button onClick={changeIndex} className={`px-6 py-3 text-white font-bold bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-lg transition-shadow duration-300 ${
      isActive ? "ring-4 ring-green-300" : "hover:ring-4 hover:ring-green-300"}
    `}>
    {ev}</button>
  )
}


export default function Home() {
  const [attempt, setAttempt] = useState(0);
  const [player, setPlayer] = useState('s');
  const [ready, setReady] = useState(false);
  const [readyPlayer, setReadyPlayer] = useState(0);
  const [data, setData] = useState(undefined);
  const [categ, setCateg] = useState([])
  const [selectedCateg, setSelectedCateg] = useState([])
  const [indexButton, setIndexButton] = useState(null)
  const [rofl, setRofl] = useState(true)
  const [text, setText] = useState(0)
  const [pingWrong, setPingWrong] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [waitPlayer, setWaitPlayer] = useState(false)
  const [toggleItem, setToggleItem] = useState(false)
  const [seven, setSeven] = useState(undefined)
  const [wrongUse, setWrongUse] = useState(undefined)
  const [deleteItem, setDeleteItem] = useState(undefined)
  const [textSave, setTextSave] = useState('')
  const [maxPlayer, setMaxPlayer] = useState(0)

  const red = useRef(false)
  const readyPlayerRef = useRef(null)
  const categInfo = useRef(null)
  const refArray = useRef([])
  const alert = useRef(null)
  const alertAttack = useRef(null)
  const nickName = useRef('')
  const swapArray = useRef([])

  const socket = getSocket()

  useEffect(() => {
    connectSocket()

    socket.on('maxPlayers', ()=>{
      setTimeout(() => {
        connectSocket()
      }, 2000);
    })

    socket.on('JSON', (ev)=>{
      setCateg(Object.keys(ev));
    })


    socket.on('user', (ev)=>{
      setPlayer(ev)
    })

    socket.on('data', (ev)=>{
      setData(ev)
    })

    socket.on('readyCheck', (ev)=>{
      setReady(ev)
    })

    socket.on('readyCount', (ev)=>{
      setReadyPlayer(ev)
    })

    socket.on('lose', (ev)=>{
      loseAnime(ev)
    })

    socket.on('wrongUseItem', (ev)=>{
      setWrongUse(ev)
    })

    socket.on('deleteItem', (ev)=>{
      setDeleteItem(ev)
    })

    socket.on('reset', ()=>{
      red.current = false
    })

    socket.on('maxPlayer', (ev)=>[
      setMaxPlayer(ev)
    ])

    socket.on('attack', ()=>[
      animeAttack()
    ])
  }, []);

  const inputWid = (ev)=>{
    setText(ev.target.value.length * 2)
    setTextSave(ev.target.value)
  }

  const proverka = ()=>{
    return /* true */ (nickName.current.value.length > 0 && !nickName.current.value.includes(' '))
  }

  const readyCheck = ()=>{
    if(!proverka()) return;
    socket.emit('readyCount', [selectedCateg, nickName.current.value.length > 20 ? 'Долбаеб ?' : nickName.current.value])
    red.current = true
    setRofl(false)
  }

  const createRef = (ev, index)=>{
    if(ev && !refArray.current.includes(ev)){
      refArray.current[index] = ev
    }
  }

  const alertDisplay = ()=>{
    anime.timeline({easing: 'linear'})
    .add({
      begin: ()=>{alert.current.style.visibility = 'visible'},
      targets: alert.current,
      delay: 1000,
      duration: 500,
      opacity: [0, 1],
    })
    .add({
      targets: alert.current,
      delay: 3000,
      duration: 500,
      opacity: [1, 0],
      complete: ()=>{alert.current.style.visibility = 'hidden'}
    })
  }

  useEffect(() => {
    if(pingWrong === null) return;
    anime.timeline({ easing: 'linear' })
    .add({
      targets: refArray.current[pingWrong],
      duration: 300,
      backgroundColor: '#ff2121',
    })
    .add({
      targets: refArray.current[pingWrong],
      duration: 300,
      backgroundColor: data[pingWrong].motion ? '#e6ffe6' : '#ffffff',
    });
    setPingWrong(null)
  }, [data, pingWrong]);

  const handleContextMenu = (event) => {
    event.preventDefault();
    setWaitPlayer(false)
    setToggleItem(false)
    if(toggleItem){
      swapArray.current = []
    }
  };

  const usedItem = (index)=>{
    if(waitPlayer){
      setWaitPlayer(false)
      setSelectedPlayer(index)
    }
  }


  useEffect(() => {
    /* console.log(data) */
  }, [data]);

  useEffect(() => {
    if(!data)return;
    data.forEach((ev, index) => {
      if(ev.time !== 0){
        anime({
          targets: refArray.current[index],
          easing: 'linear',
          duration: 1500,
          rotate: 180
        })
      }else{
        anime({
          targets: refArray.current[index],
          easing: 'linear',
          duration: 1500,
          rotate: 0
        })
      }
    });
  }, [data]);

  const loseAnime = (ev)=>{
    const originalWidth = refArray.current[ev].offsetWidth;
    const originalHeight = refArray.current[ev].offsetHeight;

    anime.timeline({
      easing: 'easeInElastic', 
      targets: refArray.current[ev],
      update: (anim) => {
        const currentScale = anime.get(refArray.current[ev], 'scale');
        
        refArray.current[ev].style.width = `${originalWidth * currentScale}px`;
        refArray.current[ev].style.height = `${originalHeight * currentScale}px`;
      }
    })
    .add({
      duration: 3000,
      scale: 0.8,
      easing: 'easeInOutBounce'
    })
    .add({
      duration: 2000,
      scale: 1.2,

    })
    .add({
      duration: 1000,
      scale: 0,
      rotate: '360deg'
    })
  }

  const swap = (ev)=>{
    if(swapArray.current.length === 0){swapArray.current.push(ev); return}
    if(ev.player === swapArray.current[0].player && ev.letter === swapArray.current[0].letter){
      swapArray.current.splice(0, 1)
    }else{
      swapArray.current.push(ev)
    }
    if(swapArray.current.length === 2){
      socket.emit(seven[2], [seven, swapArray.current])
      swapArray.current = []
      setToggleItem(false)
    }
  }

  useEffect(() => {
    anime({
      targets: readyPlayerRef.current,
      opacity: [0, 1],
      duration: 400,
      easing: 'linear'
    })
  }, [readyPlayer]);

  const openInfo = ()=>{
    anime.timeline({
      targets: categInfo.current,
      easing: 'linear',
      duration: 300
    })
    .add({
      scale: [0, 1]
    })
    .add({
      delay: 2000,
      scale: 0
    })
  }

  const animeAttack = ()=>{
    anime.timeline({
      targets: alertAttack.current,
      easing: 'linear',
      duration: 300
    })
    .add({
      begin: ()=>{alertAttack.current.style.visibility = 'visible'},
      scale: [0, 1]
    })
    .add({
      delay: 1000,
      rotate: [
        {value: 10, duration: 100},
        {value: -10, duration: 100},
        {value: 10, duration: 100},
        {value: -10, duration: 100},
        {value: 0, duration: 100},
      ]
    })
    .add({
      delay: 1000,
      complete: ()=>{alertAttack.current.style.visibility = 'hidden'},
      scale: [1, 0]
    })
  }


  return (
    <div className='flex flex-col mainContainer justify-start items-center pb-10 w-screen h-screen'>
      <div className='flex select-none max-w-[90vw] h-screen mt-[25px] justify-center items-start' onContextMenu={handleContextMenu}>
        <div ref={alert} className='asdf'>Похоже, что-то пошло не полану, но разрабу похуй, ведь он сделал это уведомление ^_^</div>
        <div ref={alertAttack} className='asdf'>Милорд, нас АТАКУЮТ!!!</div>
        {
          ready && data /* true && data */ ? 
            data.map((ev, index)=>(
              <div key={index} ref={el => createRef(el, index)} className={`underContainer ${waitPlayer && 'py-[40px] hover:animate-shake transform transition-transform duration-500'}`} style={{backgroundColor: data[index].motion && '#e6ffe6', width: '600px'}} onClick={()=>{usedItem(index)}}>
                <div className='flex flex-col items-center'>
                  <div className='text-black text-[30px]'>{data[index].nickName}</div>
                  <div className='text-black text-[30px] mt-[-18px]'>Карма {data[index].karma}/3</div>
                </div>
                {
                  player === index && (
                    <>
                      <div className='absolute top-5 left-5 text-black text-[30px] cursor-pointer' onClick={openInfo}>!</div>
                      <div ref={categInfo} className='roflx absolute px-[10px] top-0 left-0 text-black text-[20px] min-w-20 min-h-20 bg-sky-400 flex flex-col justify-center items-center scale-[0]'>
                        <div className='uppercase'>Категория</div>
                        <div>{selectedCateg}</div>
                      </div>
                    </>
                  )
                }
                <Test wrong={attempt} data={data[index]} index={index} fun={setPingWrong}/>
                <Gallow test={player === index} data={data[index]} rofl={alertDisplay} index={index} toggleItem={[toggleItem, setToggleItem]} swap={swap}/>
                <Inventory block={player === index} data={data[index]} player={index} wait={[setSelectedPlayer, setWaitPlayer, selectedPlayer, waitPlayer]} toggleItem={setToggleItem} seven={setSeven} ugarSto={[wrongUse, setWrongUse, deleteItem, setDeleteItem]}/>
              </div>
          ))
            
          :
          (
            <>
              <div className='bg-black py-10 w-[400px] flex justify-center items-center flex-col gap-[10px] rounded-[10px] mt-[50%]'>
                <div className='flex flex-wrap justify-center gap-[10px]'>
                  {
                    categ.map((ev, index)=>(
                      <ButtonCategorii key={ev} ev={ev} index={index} indexButton={indexButton} func={setIndexButton} rofl={rofl} cate={setSelectedCateg} red={red.current}/>
                    ))
                  }
                </div>
                <input placeholder='Ник' value={textSave} type="text" ref={nickName} onChange={inputWid} className='mt-[10px] text-black text-center w-auto min-w-[60px] max-w-[276px]' style={{ width: `${text * 8 + 20}px` }}/>
                <div ref={readyPlayerRef}  className='mb-[-10px]'>{`${readyPlayer}/${maxPlayer}`}</div>
                <button className='w-auto h-auto py-[10px] px-[20px] rounded-[20px] uppercase bg-white border-2 hover:ring-4 hover:ring-white duration-300' onClick={()=>{indexButton && readyCheck()}} style={{color: red.current ? 'green' : 'red', borderColor: red.current ? 'green' : 'red'}}>ready</button>
              </div>
            </>
          )
        }
      </div>
    </div>
  );
}