'use client'

import anime, { remove } from "animejs";
import { useState, useEffect, useRef } from "react";
import { getSocket } from "../socket";
import AnimeEnableItem from './AnimeEnableItem'

const Item = ({item, dragStart, block, rofl, player, wait, index, data, toggleItem, seven, ugarSto})=>{
    const refIn = useRef(null);
    const elem = useRef(null);
    const usedItemsNow = useRef(false);
    const gameRef = useRef(null);
    const socket = getSocket()
    const animeRef = useRef(null);
    const [animeChange, setAnimeChange] = useState(false);

    useEffect(() => {
        if(!ugarSto[0])return;
        if(ugarSto[0][0] === player && ugarSto[0][2] === index){
            wrongItem()
            if(animeChange){
                handleToggleAnimation()
            }
            ugarSto[1](undefined)
        }

    }, [ugarSto[0]]);

    useEffect(() => {
        if(!ugarSto[2])return;
        if(ugarSto[2][0] === player && ugarSto[2][2] === index){
            removeItemAnime()
            ugarSto[3](undefined)
        }
    }, [ugarSto[2]]);

    const wrongItem = ()=>{
        anime.timeline({targets: refIn.current, easing: 'easeInOutSine'})
        .add({
            translateY: -50,
            duration: 200
        })
        .add({
            translateX: [
                { value: -10, duration: 100 },
                { value: 10, duration: 100 },
                { value: -8, duration: 100 },
                { value: 8, duration: 100 },
                { value: -6, duration: 100 },
                { value: 6, duration: 100 },
                { value: 0, duration: 100 },
            ],
        })
        .add({
            translateY: 0,
            duration: 200
        })
    }
    

    const description = ()=>{
        rofl(false)
        anime({
            begin: ()=>{elem.current.style.display = 'flex'},
            targets: elem.current,
            opacity: [0, 1],
            duration: 200,
            easing: 'linear'
        })
    }

    const descriptionOff = ()=>{
        rofl(true)
        anime({
            targets: elem.current,
            opacity: [1, 0],
            duration: 200,
            easing: 'linear',
            complete: ()=>{elem.current.style.display = 'none'}
        })
    }
    
    /* socket.emit(item.item.func, player) */
    const test = ()=>{
        descriptionOff()
        if(item.item.used){
            if(item.item.func === 'seven'){
                toggleItem(true)
                seven([player, index, item.item.func])
                handleToggleAnimation()
                return
            }
            wait[1](true)
            usedItemsNow.current = true
            handleToggleAnimation()
        }else{
            socket.emit(item.item.func, [player, wait[2], index])
            rofl(true)
        }
    }

    useEffect(() => {
        const rightClick = (ev)=>{
            if(ev.button === 2) {
                usedItemsNow.current = false
                if(animeChange){
                    handleToggleAnimation()
                }
            }
        }

        document.addEventListener('mousedown', rightClick);
        return()=>{document.removeEventListener('mousedown', rightClick)}
    }, [animeChange]);

    const removeItemAnime = () => {
        const explosionEl = refIn.current;
        const rect = explosionEl.getBoundingClientRect();
        
        anime({
          targets: explosionEl,
          scale: [1, 0],
          duration: 500,
          easing: "easeInOutQuad",
          complete: function () {
            const particleCount = 40;
    
            for (let i = 0; i < particleCount; i++) {
              const particle = document.createElement("div");
              particle.classList.add("particle");
    
              // Устанавливаем начальные координаты частиц
              particle.style.position = "absolute";
              particle.style.left = `${rect.left + rect.width / 2}px`;
              particle.style.top = `${(rect.top + rect.height / 2)}px`;
              document.body.appendChild(particle);
    
              const angle = Math.random() * Math.PI * 2;
              const distance = Math.random() * 100;
    
              anime({
                targets: particle,
                translateX: Math.cos(angle) * distance,
                translateY: Math.sin(angle) * distance,
                opacity: [1, 0],
                duration: 2000,
                easing: "easeOutQuad",
                complete: function (anim) {
                  particle.remove();
                },
              });
            }
          },
        });
    };

    useEffect(() => {
        if(wait[2] !== null && usedItemsNow.current){
            usedItemsNow.current = false
            wait[0](null)
            rofl(true)
            socket.emit(item.item.func, [player, wait[2], index])
        }
    }, [wait[2]]);

    const handleToggleAnimation = () => {
        if (gameRef.current){
            gameRef.current.toggleAnimation(); 
        } 
    };

    const deleteItem = ()=>{
        descriptionOff()
        socket.emit('delete', [player, 0, index])
    }

    return(
        <div className="relative z-[1]" ref={animeRef} >
            <AnimeEnableItem rodRef={animeRef.current} def={gameRef} animeChange={[animeChange, setAnimeChange]}/>
            <div ref={elem} className="elem pointer-events-auto z-[20]" onMouseLeave={descriptionOff}>
                <div className="mb-[10px]">
                    {item.item.func && item.item.func === 'five' ?
                    (<>
                        <div>
                            {'ぁあぃいぅうぇえぉおか'.split('').map((char, index) => (
                                <span
                                key={index}
                                style={{
                                    display: 'inline-block',
                                    color: `hsl(${(index * 25) % 360}, 100%, 50%)`, // Разные цвета для каждой буквы
                                    animation: `colorShift 5s ease infinite`,
                                }}
                                >
                                {char}
                                </span>
                        ))}</div>
                        <div className="border-y-2 border-white">
                            {'象龍鳳花笑幸力心愛空天川海山木金土日月鳥馬魚龍王鳳鶴鬼神魔力美幸悲喜希強輪愛壌幻忍結明富夢深豊慣賞薄忠忘夢'.split('').map((char, index) => (
                                <span
                                key={index}
                                style={{
                                    display: 'inline-block',
                                    color: `hsl(${(index * 25) % 360}, 100%, 50%)`, // Разные цвета для каждой буквы
                                    animation: `colorShift 5s ease infinite`,
                                }}
                                >
                                {char}
                                </span>
                            ))}</div>
                        <div>Применение: {item.item.used ? 'Направленное': 'На себя'}</div>
                    </>):
                    (<>
                        <div>{item.item.name}</div>
                        <div className="border-y-2 border-white">{item.item.content}</div>
                        <div>Применение: {item.item.used ? 'Направленное': 'На себя'}</div>
                    </>)
                    }
                </div>

                {block && data.wins === 1 && 
                <div className="flex justify-between">
                    <button className="bg-green-400 rounded-full py-[5px] px-[10px] hover:ring-4 hover:ring-blue-200 duration-300" onClick={test}>Использовать</button>
                    <button className="bg-red-600 rounded-full py-[5px] px-[10px] hover:ring-4 hover:ring-blue-200 duration-300" onClick={deleteItem}>Удалить</button>
                </div>}
            </div>
            
            <div
                ref={refIn}
                draggable={block}
                onDragStart={(e)=>{dragStart(e, item.id)}}
                className="draggable-item text-black cursor-pointer flex justify-center items-center"
                onClick={description}
            >
            </div>
        </div>
    )
}

export default function Inventory({block, data, player, wait, toggleItem, seven, ugarSto}) {
    const [grid, setGrid] = useState([]);
    const [item, setItem] = useState(data.itemsSlots)
    useEffect(() => {
        setItem(data.itemsSlots)
    }, [data]);

    const socket = getSocket()
    const [rolf, setRofl] = useState(true)
    const elem = useRef([])

    // Функция для начала перетаскивания элемента
    const handleDragStart = (e, itemId) => {
        e.dataTransfer.setData("text/plain", itemId.toString());
    };

    // Функция для обработки сброса элемента в ячейку
    const handleDrop = (e, dropIndex) => {
        e.preventDefault(); // Необходимо, чтобы предотвратить действие по умолчанию
        const draggedItemId = e.dataTransfer.getData("text/plain");

        // Найти индекс элемента, который перетаскиваем
        const draggedItemIndex = item.findIndex(item => item.id === parseInt(draggedItemId));


        if (draggedItemIndex === -1) {
            return;
        }

        const updatedGrid = [...item];
        const first = item[draggedItemIndex]
        const second = item[dropIndex]

        // Получаем перетаскиваемый элемент и удаляем его с предыдущего места
        updatedGrid.splice(draggedItemIndex, 1, second);

        // Перемещаем контент элемента в целевую ячейку
        updatedGrid.splice(dropIndex, 1, first);

        setGrid(updatedGrid);
    };

    // Разрешаем сброс
    const allowDrop = (e) => {
        e.preventDefault();
    };

    const addRef = (ev)=>{
        if(!elem.current.includes(ev) && ev){
            elem.current.push(ev)
        }
    }

    return (
        <div className="flex mt-[20px] gap-4 relative">
            {item.map((ev, index) => (
                <div
                    key={index}
                    ref={addRef}
                    onDragOver={block ? allowDrop : undefined} 
                    onDrop={(e) => handleDrop(e, index)} 
                    className={`calabanga flex items-center justify-center hover:scale-[1.2] ${!rolf && 'pointer-events-none'} transform duration-300`}
                >
                    {ev.item && (
                        <Item item={ev} dragStart={handleDragStart} block={block} rofl={setRofl} player={player}
                        wait={wait} index={index} data={data} toggleItem={toggleItem}
                        seven={seven} rodRef={elem.current[index]} ugarSto={ugarSto}/>
                    )}
                </div>
            ))}
        </div>
    );
}