import { _decorator, Component, director, Node, tween, Vec3 } from 'cc';
import { ReelState, SingleReel } from './SingleReel';
const { ccclass, property } = _decorator;

@ccclass('ReelView')
export class ReelView extends Component {
    @property([SingleReel])
    public reels: SingleReel[] = [];

    public result: number[][] = [];

    protected onLoad(): void {
        this.reels.forEach(reel => {
            reel.index = this.reels.indexOf(reel);
        });
        director.on(eventTable.SINGLE_REEL_REBOUND_COMPLETE, this.onSingleReelRebound, this);
    }

    protected onDestroy(): void {
        director.off(eventTable.SINGLE_REEL_REBOUND_COMPLETE, this.onSingleReelRebound, this);
    }

    public setResult(result: number[][]) {
        this.result = result;
    }

    startSpin() {
        for (let i = 0; i < this.reels.length; i++) {
            const reel = this.reels[i];
            const delay = i * 0.3;
            this.scheduleOnce(() => {
                reel.startSpin(this.result[i].slice());
            }, delay);
        }
    }

    protected onSingleReelRebound(index: number) {
        if (index === this.reels.length - 1) {
            this.scheduleOnce(() => {
                this.onAllReelStop();
            }, 0.5);//滾停後等一下下再顯示贏分
        }
    }

    protected onAllReelStop() {
        director.emit(eventTable.ALL_REEL_STOP);
    }

    public forceStop() {
        for (let i = 0; i < this.reels.length; i++) {
            const reel = this.reels[i];
            reel.rollingTime = reel.targetRollingTime;
        }
    }
    public canStop() {
        for (let i = 0; i < this.reels.length; i++) {
            const reel = this.reels[i];
            const delay = i * 0.1;

            this.scheduleOnce(() => {
                reel.rollingTime = reel.targetRollingTime;
            }, delay);
        }
        return true;
    }
}

export enum eventTable {
    SINGLE_REEL_REBOUND_COMPLETE,
    ALL_REEL_STOP,
    ALL_WIN_DISPLAYED
}

