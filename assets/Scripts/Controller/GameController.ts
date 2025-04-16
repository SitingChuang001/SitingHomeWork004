import { _decorator, Button, Component, director, EditBox, Label, Node } from 'cc';
import { WinLineView } from '../View/WinLine';
import { eventTable, ReelView } from '../View/ReelManager';
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
    @property(EditBox)
    inputBox: EditBox = null!;

    private totalWin: number = 0;
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
    private symbolID: Record<string, number> = {
        'A': 0,
        'B': 1,
        'C': 2,
    };

    protected start(): void {
        this.idleSetting();
    }

    protected calculateWin():Promise<void> {
        return new Promise((resolve) => {
            this.totalWin = this.calculateScore(this.reelResult);
            this.updateScore();
            if (this.totalWin > 0) {
                this.winLineView.showAllLines(resolve);
            } else {
                resolve();
            }
        });
    }

    private getResult(): Array<Array<number>> {
        if (this.reelResult.length > 0) {
            return this.reelResult;
        }
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
        this.winLineView.winLine.push(index);
    }
    private updateScore() {
        this.scoreLabel.string = this.totalWin.toString();
    }
    private async onSpinButton() {
        this.winLineView.initWinLine();
        this.totalWin = 0;
        this.updateScore();
        await this.spin();
        await this.calculateWin();
        this.idleSetting();
    }
    private onStopButton() {
        this.reelView.forceStop();
    }
    private onConfirmButton() {
        try {
            const input = this.calculateInput();
            if (input) {
                this.inputBox.string = '';
                this.reelResult = input;
            }
        } catch (e) {
            console.warn("Invalid input");
        }
    }
    private calculateInput(): number[][] | undefined {
        const input = this.inputBox.string.split(',').map(s => this.symbolID[s].valueOf());
        if (input.length !== 9) {
            return;
        }
        return [input.slice(0, 3), input.slice(3, 6), input.slice(6, 9)];
    }
    private spin(): Promise<void> {
        return new Promise((resolve) => {
            this.spinSetting();
            this.reelView.startSpin(resolve);
        });
    }
    private spinSetting() {
        this.spinButton.active = false;
        this.stopButton.active = true;
        this.reelResult = this.getResult();
        this.reelView.setResult(this.reelResult);
    }
    private idleSetting() {
        this.spinButton.active = true;
        this.stopButton.active = false;
        this.reelResult = [];
    }
}

