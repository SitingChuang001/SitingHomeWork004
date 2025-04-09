import { _decorator, Component, Node } from 'cc';
import { WinLineView } from '../View/WinLineView';
import { ReelView } from '../View/ReelView';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property(ReelView)
    reelView: ReelView = null!;
    @property(WinLineView)
    winLineView: WinLineView = null!;
    private state: GameState = GameState.IDLE;
    start() {

    }

    startSpin() {
        this.setState(GameState.SPIN);
    }

    setState(state: GameState) {
        this.state = state;
    }

    update(deltaTime: number) {
        switch (this.state) {
            case GameState.SPIN:
                // this.reelView.startSpin();
                break;
            case GameState.ROLLING_COMPLETE:
                this.setState(GameState.SHOW_ALL_WIN);
                break;
            case GameState.SHOW_ALL_WIN:
                // this.winLineView.showAllWin();
                break;
            case GameState.SHOW_SINGLE_WIN:
                // this.winLineView.showSingleWin();
                break;
        }
    }
}
export enum GameState {
    IDLE,
    SPIN,
    ROLLING_COMPLETE,
    SHOW_ALL_WIN,
    SHOW_SINGLE_WIN,
}

