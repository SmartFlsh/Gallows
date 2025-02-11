"use client";

import anime from "animejs";
import { useRef, useEffect, useState, useImperativeHandle } from "react";

export default function Game({ rodRef, def, animeChange }) {
  const [animationActive, setAnimationActive] = useState(false);
  const timelines = useRef({ timeline1: null, timeline2: null });
  const trailWrapperRef = useRef(null);

  useEffect(() => {
    animeChange[1](animationActive)
  }, [animationActive]);

  const createWrapper = () => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.width = '100%'; // ширина равна ширине родителя
    wrapper.style.height = '100%'; // высота равна высоте родителя
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    rodRef.appendChild(wrapper);
    trailWrapperRef.current = wrapper;
    return wrapper;
  };

  const createSquareElement = (top, left) => {
    const square = document.createElement('div');
    square.className = 'absolute bg-purple-400 z-20';
    square.style.width = '5px';
    square.style.height = '5px';
    square.style.top = top;
    square.style.left = left;
    trailWrapperRef.current.appendChild(square);
    return square;
  };

  const createTrail = (element) => {
    const trailElement = document.createElement('div');
    trailElement.style.position = 'absolute';
    trailElement.style.width = '5px';
    trailElement.style.height = '5px';
    trailElement.style.backgroundColor = '#b27fe5';
    trailElement.style.left = element.style.left;
    trailElement.style.top = element.style.top;
    trailElement.style.opacity = 1;
    trailWrapperRef.current.appendChild(trailElement);

    anime({
      targets: trailElement,
      opacity: [0],
      backgroundColor: '#e5c2ff',
      duration: 300,
      easing: 'linear',
      complete: () => {
        trailElement.remove();
      }
    });
  };

  const startAnimation = (square1, square2) => {
    timelines.current.timeline1 = anime.timeline({
      loop: true,
      targets: square1,
      duration: 400,
      easing: 'linear',
      update: (anim) => {
        if (anim.progress > 0 && anim.progress < 100) {
          createTrail(square1);
        }
      }
    });

    timelines.current.timeline1
      .add({
        left: '92%',
        top: '0%',
      })
      .add({
        left: '92%',
        top: '92%',
      })
      .add({
        left: '0%',
        top: '92%',
      })
      .add({
        left: '0%',
        top: '0%',
      });

    timelines.current.timeline2 = anime.timeline({
      loop: true,
      targets: square2,
      duration: 400,
      easing: 'linear',
      update: (anim) => {
        if (anim.progress > 0 && anim.progress < 100) {
          createTrail(square2);
        }
      }
    });

    timelines.current.timeline2
      .add({
        left: '0%',
        top: '92%',
      })
      .add({
        left: '0%',
        top: '0%',
      })
      .add({
        left: '92%',
        top: '0%',
      })
      .add({
        left: '92%',
        top: '92%',
      });

    timelines.current.timeline1.play();
    timelines.current.timeline2.play();
  };

  const stopAnimation = () => {
    timelines.current.timeline1.pause();
    timelines.current.timeline2.pause();
    // Удаляем все элементы внутри обертки
    if (trailWrapperRef.current) {
      trailWrapperRef.current.remove();
    }
  };

  const toggleAnimation = () => {
    if (animationActive) {
      stopAnimation();
    } else {
      createWrapper();
      const square1 = createSquareElement('0', '0');
      const square2 = createSquareElement('92%', '92%');
      startAnimation(square1, square2);
    }
    setAnimationActive(!animationActive);
  };

  useImperativeHandle(def, () => ({ toggleAnimation }));

  return null; // Компонент ничего не рендерит
}
