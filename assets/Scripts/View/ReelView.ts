import { _decorator, Component, Node } from 'cc';
import { ReelState, SingleReelView } from './SingleReelView';
const { ccclass, property } = _decorator;

@ccclass('ReelView')
export class ReelView extends Component {
    @property([SingleReelView])
    reels: SingleReelView[] = [];

    startSpin(allResults: number[][]) {
        for (let i = 0; i < this.reels.length; i++) {
            const reel = this.reels[i];
            const delay = i * 0.3;

            this.scheduleOnce(() => {
                reel.startSpin(allResults[i]);
            }, delay);
        }
    }
    test() {
        this.startSpin([[0, 1, 2], [0, 1, 2], [0, 1, 2]]);
        setTimeout(() => {
            this.reels.forEach(reel => reel.setState(ReelState.REBOUND));
        }, 2000);
    }
    reelStartSpin(result: number[]) {
        this.reels.forEach(reel => reel.startSpin(result));
    }
    update(deltaTime: number) {
        
    }
}

