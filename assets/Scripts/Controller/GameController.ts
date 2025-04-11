import { _decorator, Component, director, Label, Node } from 'cc';
import { WinLineView } from '../View/WinLineView';
import { eventTable, ReelView } from '../View/ReelView';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property(ReelView)
    reelView: ReelView = null!;
    @property(WinLineView)
    winLineView: WinLineView = null!;
    @property(Label)
    scoreLabel: Label = null!;
    @property(Node)
    spinButton: Node = null!;
    @property(Node)
    stopButton: Node = null!;

    private totalWin: number = 0;
    private state: GameState = GameState.IDLE;
    private reelResult: number[][] = [];
    //贏分設定檔
    private paylines = [
        [0, 0, 0], // 第一條線
        [1, 1, 1], // 第二條線
        [2, 2, 2], // 第三條線
        [0, 1, 2], // 第四條線
        [2, 1, 0], // 第五條線
      ];
      
      private symbolScores: Record<string, number> = {
        '0': 3,
        '1': 2,
        '2': 1,
      };

    protected onEnable(): void {
        director.on(eventTable.ALL_REEL_STOP, this.onAllReelStop, this);
        director.on(eventTable.ALL_WIN_DISPLAYED, this.onAllWinDisplayed, this);
    }
    protected onDisable(): void {
        director.off(eventTable.ALL_REEL_STOP, this.onAllReelStop, this);
        director.off(eventTable.ALL_WIN_DISPLAYED, this.onAllWinDisplayed, this);
    }
    protected start(): void {
        this.setState(GameState.IDLE);
    }
    protected onAllReelStop() {
        this.setState(GameState.ROLLING_COMPLETE);
    }
    protected onAllWinDisplayed() {
        this.setState(GameState.IDLE);
    }

    private getResult() : Array<Array<number>> {
            var randomResult: Array<Array<number>> = new Array<Array<number>>();
            for (let i = 0; i < this.reelView.reels.length; i++) {
                const reel = this.reelView.reels[i];
                const reelResult: number[] = [];
                for (let j = 0; j < 3; j++) {
                    const randomIndex = Math.floor(Math.random() * reel.symbolSpriteFrames.length);
                    reelResult.push(randomIndex);
                }
                randomResult.push(reelResult);
            }
        return randomResult;
    }

    private calculateScore(result: number[][]): number {
        let scoreSum = 0;
        for (let i = 0; i < this.paylines.length; i++) {
            const line = this.paylines[i];
        
            const symbolsOnLine = [
              result[0][line[0]],
              result[1][line[1]],
              result[2][line[2]],
            ];
        
            const first = symbolsOnLine[0];
            const isWinning = symbolsOnLine.every(s => s === first);
            if (isWinning) {
                const score = this.symbolScores[first.toString()].valueOf();
                this.setWinLines(i);
                scoreSum += score;
            }
        }
        return scoreSum;
    }
    private setWinLines(index: number) {
        this.winLineView.winLine = [];
        this.winLineView.winLine.push(index);
    }
    private updateScore() {
        this.scoreLabel.string = this.totalWin.toString();
    }
    private onSpinButton() {
        this.setState(GameState.SPIN);
    }
    private onStopButton() {
        this.reelView.canStop();
    }

    private setState(state: GameState) {
        this.state = state;
        switch (this.state) {
            case GameState.IDLE:
                //打開spinButton,關閉stopButton
                this.spinButton.active = true;
                this.stopButton.active = false;
                this.totalWin = 0;
                this.updateScore();
                this.reelResult = [];
                this.winLineView.clearLines();
                break;
            case GameState.SPIN:
                //關閉spinButton,打開stopButton
                this.spinButton.active = false;
                this.stopButton.active = true;
                this.reelResult = this.getResult();
                this.reelView.setResult(this.reelResult);
                this.reelView.startSpin();
                break;
            case GameState.ROLLING_COMPLETE:
                this.totalWin = this.calculateScore(this.reelResult);
                this.setState(GameState.SHOW_ALL_WIN);
                break;
            case GameState.SHOW_ALL_WIN:
                this.updateScore();
                if (this.totalWin > 0) {
                    this.winLineView.showAllLines();
                } else {
                    this.setState(GameState.IDLE);
                }
                break;
            case GameState.SHOW_SINGLE_WIN:
                // this.winLineView.showSingleWin();
                //輪播完進到IDLE
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

