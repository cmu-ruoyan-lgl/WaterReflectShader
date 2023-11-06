import { _decorator, Node, Vec3, RigidBody, Collider, Scene, SceneGlobals, find, v2, sys, systemEvent, SystemEvent, macro, Tween, log } from "cc";
import { SpriteAnimation } from "../Widget/SpriteAnimation";
import BhvFSM from "./BhvFSM";

const { ccclass, property,disallowMultiple } = _decorator;
const _v1 /* as temp Vec3 */ = new Vec3();
const _v2 /* as temp Vec3 */ = new Vec3();
const _v3 /* as temp Vec3 */ = new Vec3();
const _camDis = 250;

export const STATE = {
    Random: "Random",
    Forward: "Forward",
    Idle: "Idle",
    WalkLeft: "WalkLeft",
    WalkRight: "WalkRight",
    Atk: "Atk",
    Stop: "Stop",
    Jump: "Jump",
}

@ccclass("Hero FSM")
@disallowMultiple(true)

export default class HeroFSM extends BhvFSM {

    @property(SpriteAnimation)
    anm:SpriteAnimation =null;

    @property
    speed:number = 2;

    static ins:HeroFSM = null;

    private cam:Node =null
    private isJumping:boolean = false;

    jumpHeight = 200 // 跳跃高度
    jumpDuration = 0.6 // 跳跃持续时间
    jumpCount = 0 // 跳跃次数
    startPos: Vec3;
    endPos: Vec3;

    onLoad(){
        systemEvent.on(SystemEvent.EventType.KEY_DOWN,this.onKeyDown,this);
    }

    onDestroy() {
        systemEvent.off(SystemEvent.EventType.KEY_DOWN,this.onKeyDown,this);
    }

    onKeyDown(e){
        if(e.keyCode==macro.KEY.space){
            console.log("jump Space");
            this.jump();
        }
    }

    jump(){
        // this.changeState(STATE.Jump);
        if(this.isJumping) return;
        console.log("jump");
        this.isJumping = true;
        // 跳跃上升
        this.startPos = this.node.position; // 记录跳跃起始位置
        this.endPos = new Vec3(this.startPos.x, this.startPos.y + this.jumpHeight, this.startPos.z);
        const tweenUp = new Tween(this.node)
            .to(this.jumpDuration / 2, { position: this.startPos }, { easing: 'sineOut' });
            
        // 下落
        const tweenDown = new Tween(this.node)
            .to(this.jumpDuration / 2, { position: this.endPos }, { easing: 'sineIn' })
            .call(() => {
                this.isJumping = false;
            });
        // 创建缓动队列
        const tween = new Tween(this.node)
            .then(tweenUp)
            .then(tweenDown)
            // .sequence(tweenUp, tweenDown)
            .start();


    }

    start(){
        this.cam = find("Canvas/RtCamera");
    }

    onEnable(){
        this.RemoveAllState()
        this.addStates(STATE);
        HeroFSM.ins=this;
        this.changeState(STATE.Idle);


    }

    onDisable(){
        this.RemoveAllState()
        HeroFSM.ins=null;

    }

    onIdleEnter() {
        this.anm.Anmimation=0;
    }


    onIdleUpdate() {
     

    }


    onWalkLeftEnter() {
        if(this.anm.Anmimation!=1)this.anm.Anmimation=1;
        this.node.setScale(-1,1)
    }


    onWalkLeftUpdate() {
        _v1.set(this.node.position);
        _v1.x -=this.speed;
        if(_v1.x<-1700) return
        this.node.setPosition(_v1);

        // this.startPos.x -= this.speed;
        // this.endPos.x -= this.speed;

        _v2.set(this.cam.position);
        const dis =_v2.x-_v1.x;
        if(dis>_camDis) _v2.x = _v1.x+_camDis;
        this.cam.setPosition(_v2);
    }

    onWalkRightEnter() {
        if(this.anm.Anmimation!=1)this.anm.Anmimation=1;
        this.node.setScale(1,1)
    }


    onWalkRightUpdate() {
        _v1.set(this.node.position);
        _v1.x +=this.speed;
        if(_v1.x>1700) return

        // this.startPos.x += this.speed;
        // this.endPos.x += this.speed;

        this.node.setPosition(_v1);
        _v2.set(this.cam.position);
        const dis =_v1.x-_v2.x;
        if(dis>_camDis) _v2.x = _v1.x-_camDis;
        this.cam.setPosition(_v2);
    }


}