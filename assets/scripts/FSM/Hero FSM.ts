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

    jumpHeight = 200 // 跳跃高度 //init 187
    jumpSpeed = 0 // 跳跃速度
    gravity = -1700 // 重力
    jumpCount = 0 // 跳跃次数
    startPos: Vec3;
    endPos: Vec3;

    onLoad(){
        systemEvent.on(SystemEvent.EventType.KEY_DOWN,this.onKeyDown,this);
        systemEvent.on(SystemEvent.EventType.KEY_UP,this.onKeyUp,this);
    }

    onDestroy() {
        systemEvent.off(SystemEvent.EventType.KEY_DOWN,this.onKeyDown,this);
        systemEvent.off(SystemEvent.EventType.KEY_UP,this.onKeyUp,this);
    }

    onKeyDown(e){
        
        switch(e.keyCode){
            case macro.KEY.a:
                this.changeState(STATE.WalkLeft);
                break;
            case macro.KEY.d:
                this.changeState(STATE.WalkRight);
                break;
            case macro.KEY.w:
                this.jump();
                break;
        }

        if(e.keyCode==macro.KEY.space){
            this.jump();
        }
    }

    onKeyUp(e) {
        switch (e.keyCode) {
            case macro.KEY.a:
            case macro.KEY.d:
                this.changeState(STATE.Idle);
                break;
        }
    }

    jump(){
        // this.changeState(STATE.Jump);
        if(this.isJumping) return;
        console.log("jump start");
        this.isJumping = true;
        this.jumpSpeed = 600;
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
     
        if (this.isJumping) {
            this.jumpSpeed += this.gravity * this.dt; // 根据重力更新跳跃速度
            console.log("jumpSpeed",this.jumpSpeed);
            console.log("dt",this.dt);
            _v3.set(this.node.position);
            _v3.y += this.jumpSpeed * this.dt; // 根据跳跃速度更新节点位置
            
            if (_v3.y <= 187) {
                _v3.y = 187;
                this.isJumping = false;
                this.jumpSpeed = 0;
                console.log("jump end");
            }

            this.node.setPosition(_v3);
        }
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
        if (this.isJumping) {
            this.jumpSpeed += this.gravity * this.dt; // 根据重力更新跳跃速度
            console.log("jumpSpeed",this.jumpSpeed);
            console.log("dt",this.dt);
            _v3.set(this.node.position);
            _v3.y += this.jumpSpeed * this.dt; // 根据跳跃速度更新节点位置
            
            if (_v3.y <= 187) {
                _v3.y = 187;
                this.isJumping = false;
                this.jumpSpeed = 0;
                console.log("jump end");
            }

            this.node.setPosition(_v3);
        }

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
        this.node.setPosition(_v1);

        // this.startPos.x += this.speed;
        // this.endPos.x += this.speed;
        if (this.isJumping) {
            this.jumpSpeed += this.gravity * this.dt; // 根据重力更新跳跃速度
            _v3.set(this.node.position);
            _v3.y += this.jumpSpeed * this.dt; // 根据跳跃速度更新节点位置
            
            if (_v3.y <= 187) {
                _v3.y = 187;
                this.isJumping = false;
                this.jumpSpeed = 0;
                console.log("jump end");
            }

            this.node.setPosition(_v3);
        }

        _v2.set(this.cam.position);
        const dis =_v1.x-_v2.x;
        if(dis>_camDis) _v2.x = _v1.x-_camDis;
        this.cam.setPosition(_v2);
    }


}