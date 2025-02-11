'use client'

import { useEffect, useState, useRef } from "react";
import { getSocket } from "../socket";
import anime from "animejs";

const NowWord = ({ev, index, ind, toggleItem, swap})=>{
    const [check, setCheck] = useState(false)

    useEffect(() => {
        setCheck(false)
    }, [toggleItem]);

    const swapToggle = ()=>{
        setCheck(!check)
        swap({player: index, letter: ind})
    }

    return(
        <div onClick={()=>{toggleItem[0] && swapToggle()}} className={`text-[50px] p-[2px] leading-none inline-block ${check && 'bg-green-500'} ${toggleItem[0] && 'hover:bg-green-400 transition-colors duration-300 cursor-pointer'}`}>{ev}</div>
    )
}

export default function Gallows ({test, data, rofl, index, toggleItem, swap}){
    const letter = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.split('')
    const [wrongLetter, setWrongLetter] = useState(new Set())
    const [rightLetter, setRightLetter] = useState(new Set())

    const socket = getSocket()

    useEffect(() => {
        setWrongLetter(new Set(data.wrongLetter))
        setRightLetter(new Set(data.rightLetter))
    }, [data]);

    const keyPress = (ev)=>{
        if(!test || data.wins !== 1) return
        if(data.motion /* true */){
            if(wrongLetter.has(ev) || rightLetter.has(ev)) return;
            if(!letter.includes(ev)){
                rofl()
            }
            socket.emit('move', [index, ev])
        }
    }

    useEffect(() => {
        const key = (ev)=>{keyPress(ev.key.toLowerCase())}

        document.addEventListener('keypress', key)
        
        return ()=>{
            document.removeEventListener('keypress', key)
        }
    }, [data, test]);

    
    return(
        <>
            <div className='wordContainer my-[10px]'>
            {
                data && data.nowWord && data.nowWord.lenght !== 0 ? data.nowWord.map((ev, ind)=>(
                    <NowWord key={ind} ev={ev} index={index} ind={ind} toggleItem={toggleItem} swap={swap}/>
                )) : <div></div>
            }
            </div>
            <div className='latterContainer'>
            {
                letter.map((ev)=>(
                    <div key={ev} className='text-zinc-700 text-2xl gridItem cursor-pointer' style={{color: wrongLetter.has(ev) && 'red', opacity: wrongLetter.has(ev) && '.2', backgroundColor: rightLetter.has(ev) && '#9af39a'}} onClick={()=>{keyPress(ev)}}>{ev}</div>
                ))
            }
            </div>
        </>
    )
}
