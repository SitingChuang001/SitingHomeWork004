import { _decorator, Component, director, Node, tween, Vec3 } from 'cc';
import { ReelState, SingleReelView } from './SingleReelView';
const { ccclass, property } = _decorator;

@ccclass('ReelView')
export class ReelView extends Component {
    @property([SingleReelView])
    public reels: SingleReelView[] = [];

    public result: number[][] = [];

    protected onLoad(): void {
        this.reels.forEach(reel => {
            reel.index = this.reels.indexOf(reel);
        });
        director.on(eventTable.SINGLE_REEL_REBOUND, this.onSingleReelRebound, this);
    }

    protected onDestroy(): void {
        director.off(eventTable.SINGLE_REEL_REBOUND, this.onSingleReelRebound, this);
    }

    public setResult(result: number[][]) {
        this.result = result;
    }
    startSpin() {
        for (let i = 0; i < this.reels.length; i++) {
            const reel = this.reels[i];
            const delay = i * 0.3;
            reel.setState(ReelState.BOUNCE);
            this.scheduleOnce(() => {
                const originalPos = reel.node.position.clone();
                const bounceHeight = 20;

                tween(reel.node)
                    .to(0.15, { position: new Vec3(originalPos.x, originalPos.y + bounceHeight, originalPos.z) }, { easing: 'quadOut' })
                    .to(0.15, { position: originalPos }, { easing: 'quadIn' })
                    .call(() => {
                        reel.startSpin(this.result[i]);
                        if (i === this.reels.length - 1) {
                            this.result = [];
                        }
                    })
                    .start();
            }, delay);
        }
    }
    test() {
        if (this.result.length === 0) {
            var randomResult: number[][] = [];
            for (let i = 0; i < this.reels.length; i++) {
                const reel = this.reels[i];
                const reelResult: number[] = [];
                for (let j = 0; j < 3; j++) {
                    const randomIndex = Math.floor(Math.random() * reel.symbolSpriteFrames.length);
                    reelResult.push(randomIndex);
                }
                randomResult.push(reelResult);
            }
            this.setResult(randomResult);
        }
        this.startSpin();
    }

    protected onSingleReelRebound(index: number) {
        const originalPos = this.reels[index].node.position.clone();
        const bounceHeight = 40;
        tween(this.reels[index].node)
            .to(0.15, { position: new Vec3(originalPos.x, originalPos.y - bounceHeight, originalPos.z) }, { easing: 'quadOut' })
            .to(0.15, { position: originalPos }, { easing: 'quadIn' })
            .call(() => {
                if (index === this.reels.length - 1) {
                    this.onAllReelStop();
                }
            })
            .start();
    }

    protected onAllReelStop() {
        director.emit(eventTable.ALL_REEL_STOP);
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
    SINGLE_REEL_REBOUND,
    ALL_REEL_STOP
}

