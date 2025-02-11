// components/BouncingBall.js
"use client";

import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import anime from 'animejs';

const BouncingBall = ({ data, index, fun }) => {
  const sceneRef = useRef(null);
  const engineRef = useRef(Matter.Engine.create());
  const width = 500;
  const height = 500;
  const borderGround = 15;

  const [ropeSegments, setRopeSegments] = useState(null) 
  const [constraints, setConstraints] = useState(null) 
  const [topConstraint, setTopConstraint] = useState(null) 
  const [humanParts, setHumanParts] = useState(null) 
  const [humanConstraints, setHumanConstraints] = useState(null)
  const [currentSwitch, setCurrentSwitch] = useState(1)
  const [test, setTest] = useState(null)
  
  
  const deleteObject = useRef(null)


  const ground = [
    { x: width / 2, y: height, wi: width, he: borderGround },
    { x: width / 2, y: 0, wi: width, he: borderGround },
    { x: 0, y: height / 2, wi: borderGround, he: height },
    { x: width, y: height / 2, wi: borderGround, he: height },
  ];

  const runner = Matter.Runner.create();
  const groungBodies = ground.map((el) => Matter.Bodies.rectangle(el.x, el.y, el.wi, el.he, { isStatic: true, render: { fillStyle: 'green' } }));
  const stolb = Matter.Bodies.rectangle(100, 200, 10, 300, { isStatic: true, render: { fillStyle: 'red' }, id: 'stolb' });
  const balk = Matter.Bodies.rectangle(165, 55, 130, 10, { isStatic: true, render: { fillStyle: 'red' }, id: 'balk' });
    
  // Добавление статичных стенок


  useEffect(() => {
    const engine = engineRef.current
    Matter.Composite.add(engine.world, groungBodies);
  
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
      },
    });

    // Запуск рендера и движка
    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);


    const createRope = () => {
      const startX = 210;
      const startY = 55;
      const segmentCount = 7;
      const segmentWidth = 10;
      const segmentHeight = 5;
      const gap = 5;
      let test = []
      let constraintArray = []

      for (let i = 0; i < segmentCount; i++) {
        const segment = Matter.Bodies.rectangle(startX, startY + i * (segmentHeight + gap), segmentWidth, segmentHeight, {
          collisionFilter: { mask: 0 },
          isStatic: i === 0,
          render: { visible: false },
        });
        test.push(segment);
      }

      for (let i = 0; i < segmentCount - 1; i++) {
        const constraint = Matter.Constraint.create({
          bodyA: test[i],
          bodyB: test[i + 1],
          length: segmentHeight + gap,
          stiffness: 0.7,
          render: { visible: true, anchors: false, type: 'line' },
        });
        constraintArray.push(constraint)
      }


      const op = Matter.Constraint.create({
        pointA: { x: startX, y: startY },
        bodyB: test[0],
        length: 0,
        stiffness: 1.0,
      });
      setConstraints(constraintArray);
      setTopConstraint(op)
      setRopeSegments(test)

    };

    // Функция генерации частей тела человека
    const createHuman = () => {
      
      const headRadius = 20;
      const neckHeight = 10;
      const bodyWidth = 50;
      const bodyHeight = 80;
      const limbWidth = 10;
      const limbHeight = 40;

      // Создание частей тела
      const head = Matter.Bodies.circle(400, 100, headRadius, { label: "head", render: { fillStyle: "red" } });
      const neck = Matter.Bodies.rectangle(400, 140, limbWidth, neckHeight, { label: "neck", render: { fillStyle: "blue" }, collisionFilter: { mask: 0 } });
      const body = Matter.Bodies.rectangle(400, 200, bodyWidth, bodyHeight, { label: "body", render: { fillStyle: "green" } });

      const leftUpperArm = Matter.Bodies.rectangle(350, 180, limbWidth, limbHeight, { label: "leftUpperArm", render: { fillStyle: "orange" } });
      const leftLowerArm = Matter.Bodies.rectangle(340, 220, limbWidth, limbHeight, { label: "leftLowerArm", render: { fillStyle: "yellow" } });
      const rightUpperArm = Matter.Bodies.rectangle(450, 180, limbWidth, limbHeight, { label: "rightUpperArm", render: { fillStyle: "orange" } });
      const rightLowerArm = Matter.Bodies.rectangle(460, 220, limbWidth, limbHeight, { label: "rightLowerArm", render: { fillStyle: "yellow" } });

      const leftUpperLeg = Matter.Bodies.rectangle(380, 260, limbWidth, limbHeight, { label: "leftUpperLeg", render: { fillStyle: "purple" } });
      const leftLowerLeg = Matter.Bodies.rectangle(380, 300, limbWidth, limbHeight, { label: "leftLowerLeg", render: { fillStyle: "pink" } });
      const rightUpperLeg = Matter.Bodies.rectangle(420, 260, limbWidth, limbHeight, { label: "rightUpperLeg", render: { fillStyle: "purple" } });
      const rightLowerLeg = Matter.Bodies.rectangle(420, 300, limbWidth, limbHeight, { label: "rightLowerLeg", render: { fillStyle: "pink" } });

      setHumanParts([head, neck, body, leftUpperArm, leftLowerArm, rightUpperArm, rightLowerArm, leftUpperLeg, leftLowerLeg, rightUpperLeg, rightLowerLeg]);

      // Создание constraint-ов для частей тела
      setHumanConstraints([
        Matter.Constraint.create({ bodyA: head, bodyB: neck, pointA: { x: 0, y: headRadius }, pointB: { x: 0, y: 0 }, length: 5, render: {visible: false}, stiffness: 1 }),
        // Шея и тело
        Matter.Constraint.create({ bodyA: neck, bodyB: body, pointA: { x: 0, y: 5 }, pointB: { x: 0, y: (-bodyHeight / 2) + 10 }, length: 5, render: {visible: false}, stiffness: 1 }),
        // Левая рука
        Matter.Constraint.create({ bodyA: body, bodyB: leftUpperArm, pointA: { x: -bodyWidth / 2, y: -bodyHeight / 4 }, pointB: { x: 0, y: -limbHeight / 2 }, length: 5, stiffness: 0.8 }),
        Matter.Constraint.create({ bodyA: leftUpperArm, bodyB: leftLowerArm, pointA: { x: 0, y: limbHeight / 2 }, pointB: { x: 0, y: -limbHeight / 2 }, length: 5, stiffness: 0.8 }),
        // Правая рука
        Matter.Constraint.create({ bodyA: body, bodyB: rightUpperArm, pointA: { x: bodyWidth / 2, y: -bodyHeight / 4 }, pointB: { x: 0, y: -limbHeight / 2 }, length: 5, stiffness: 0.8 }),
        Matter.Constraint.create({ bodyA: rightUpperArm, bodyB: rightLowerArm, pointA: { x: 0, y: limbHeight / 2 }, pointB: { x: 0, y: -limbHeight / 2 }, length: 5, stiffness: 0.8 }),
        // Левая нога
        Matter.Constraint.create({ bodyA: body, bodyB: leftUpperLeg, pointA: { x: -bodyWidth / 4, y: bodyHeight / 2 }, pointB: { x: 0, y: -limbHeight / 2 }, length: 5, stiffness: 0.8 }),
        Matter.Constraint.create({ bodyA: leftUpperLeg, bodyB: leftLowerLeg, pointA: { x: 0, y: limbHeight / 2 }, pointB: { x: 0, y: -limbHeight / 2 }, length: 5, stiffness: 0.8 }),
        // Правая нога
        Matter.Constraint.create({ bodyA: body, bodyB: rightUpperLeg, pointA: { x: bodyWidth / 4, y: bodyHeight / 2 }, pointB: { x: 0, y: -limbHeight / 2 }, length: 5, stiffness: 0.8 }),
        Matter.Constraint.create({ bodyA: rightUpperLeg, bodyB: rightLowerLeg, pointA: { x: 0, y: limbHeight / 2 }, pointB: { x: 0, y: -limbHeight / 2 }, length: 5, stiffness: 0.8 })
      ])
    };

    createRope()
    createHuman()

    setInterval(() => {
      engine.gravity.x = .2;
      setTimeout(() => {
        engine.gravity.x = .1;
      }, 2500);
      setTimeout(() => {
        engine.gravity.x = 0;
      }, 4000);
    }, 10000);

    // Очистка мира при размонтировании компонента
    return () => {
      Matter.Composite.clear(engine.world);
      Matter.Engine.clear(engine);
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
    };
  }, []);

  useEffect(() => {
    if(!humanParts) return;
    const testOne = Matter.Constraint.create({
      bodyA: humanParts[1],
      bodyB: ropeSegments[ropeSegments.length - 1],
      length: 10, // Длина constraint-а (расстояние между телами)
      stiffness: 1, // Жёсткость constraint-а (0.9 - почти жесткая связь)б
      render: {
        visible: true,
        anchors: false,
        type: 'line'
      },
    });

    setTest(testOne)
  }, [humanParts]);

  const deleteObj = ()=>{
    const engine = engineRef.current
    Matter.Composite.remove(engine.world, deleteObject.current)
  }

  useEffect(() => {
    const engine = engineRef.current
    switch (data.wrong) {
      case 0:
        if(!ropeSegments || !engine.world)break;
        Matter.Composite.clear(engine.world, false);
        Matter.Composite.add(engine.world, groungBodies);
        setCurrentSwitch(1)
        break
      case 1:
        fun(index)
        if(currentSwitch === data.wrong){
          setCurrentSwitch(currentSwitch + 1)
          Matter.Composite.add(engine.world, [stolb, balk]);
        }else{
          setCurrentSwitch(data.wrong + 1)
          deleteObj()
        }
        deleteObject.current = []
        break;
      case 2:
        fun(index)
        if(currentSwitch === data.wrong){
          setCurrentSwitch(currentSwitch + 1)
          Matter.Composite.add(engine.world, [...ropeSegments, ...constraints, topConstraint]);
        }else{
          setCurrentSwitch(data.wrong + 1)
          deleteObj()
        }
        deleteObject.current = [...ropeSegments, ...constraints, topConstraint]
        break;
      case 3:
        fun(index)
        if(currentSwitch === data.wrong){
          setCurrentSwitch(currentSwitch + 1)
          Matter.Composite.add(engine.world, [humanParts[0], humanParts[1], humanConstraints[0], test]);
        }else{
          setCurrentSwitch(data.wrong + 1)
          deleteObj()
        }
        deleteObject.current = [humanParts[0], humanParts[1], humanConstraints[0], test]
        break;
      case 4:
        fun(index)

        if(currentSwitch === data.wrong){
          setCurrentSwitch(currentSwitch + 1)
          Matter.Composite.add(engine.world, [humanParts[2], humanConstraints[1]]);
        }else{
          setCurrentSwitch(data.wrong + 1)
          deleteObj()
        }
        deleteObject.current = [humanParts[2], humanConstraints[1]]
        break;
      case 5:
        fun(index)

        if(currentSwitch === data.wrong){
          setCurrentSwitch(currentSwitch + 1)
          Matter.Composite.add(engine.world, [humanParts[3], humanParts[4], humanParts[5], humanParts[6], humanConstraints[2], humanConstraints[3], humanConstraints[4], humanConstraints[5]]);
        }else{
          setCurrentSwitch(data.wrong + 1)
          deleteObj()
        }
        deleteObject.current = [humanParts[3], humanParts[4], humanParts[5], humanParts[6], humanConstraints[2], humanConstraints[3], humanConstraints[4], humanConstraints[5]]
        break;
      case 6:
        fun(index)

        if(currentSwitch === data.wrong){
          setCurrentSwitch(currentSwitch + 1)
          Matter.Composite.add(engine.world, [humanParts[7], humanParts[8], humanParts[9], humanParts[10], humanConstraints[6], humanConstraints[7], humanConstraints[8], humanConstraints[9]]);
        }else{
          setCurrentSwitch(data.wrong + 1)
          deleteObj()
        }
        deleteObject.current = [humanParts[7], humanParts[8], humanParts[9], humanParts[10], humanConstraints[6], humanConstraints[7], humanConstraints[8], humanConstraints[9]]
        break;
      case 7:
        break;
      default:
        break;
    }
  }, [data.wrong, humanConstraints, test]);

  return <div ref={sceneRef}></div>;
};

export default BouncingBall;
