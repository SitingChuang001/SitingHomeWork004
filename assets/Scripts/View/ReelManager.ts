import { _decorator, Component, director, instantiate, Node, Prefab, tween, UITransform, Vec3 } from 'cc';
import { ReelState, SingleReel } from './SingleReel';
const { ccclass, property } = _decorator;

@ccclass('ReelView')
export class ReelView extends Component {
    @property([SingleReel])
    public reels: SingleReel[] = [];

    public result: number[][] = [];

    @property(Number)
    public reelLayoutX: number = 0;
    @property(Number)
    public reelLayoutY: number = 0;
    @property(Prefab)
    public reelPrefab: Prefab = null!;
    @property(Prefab)
    public symbolPrefab: Prefab = null!;


    protected onLoad(): void {
        this.initReelLayout();
        director.on(eventTable.SINGLE_REEL_REBOUND_COMPLETE, this.onSingleReelRebound, this);
    }

    private initReelLayout() {
        const symbolWidth = this.symbolPrefab.data.width;
        const symbolHeight = this.symbolPrefab.data.height;

        const layoutWidth = this.reelLayoutX * symbolWidth;
        const layoutHeight = this.reelLayoutY * symbolHeight;

        this.node.getComponent(UITransform).setContentSize(layoutWidth, layoutHeight);

        const startX = -layoutWidth / 2 + symbolWidth / 2;
        const startY = -layoutHeight / 2 - symbolHeight / 2;

        for (let i = 0; i < this.reelLayoutX; i++) {
            const reel = instantiate(this.reelPrefab);
            reel.name = `Reel${i}`;
            const singleReel = reel.getComponent(SingleReel)!;
            singleReel.index = i;

            const x = startX + i * symbolWidth;
            reel.setPosition(x, 0, 0);

            this.reels.push(singleReel);
            this.node.addChild(reel);


            for (let j = 0; j < this.reelLayoutY + 2; j++) {
                const symbol = instantiate(this.symbolPrefab);
                symbol.parent = reel;
                const y = startY + j * symbolHeight;
                symbol.setPosition(0, y, 0);
                singleReel.symbolNodes.push(symbol);
            }
            singleReel.initSymbols();
        }
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
                reel.startSpin(this.result[i]);
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

