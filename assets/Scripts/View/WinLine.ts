import { _decorator, Color, Component, Graphics, Node, Sprite, tween, UIOpacity } from 'cc';
import { eventTable } from './ReelManager';
const { ccclass, property } = _decorator;

@ccclass('WinLineView')
export class WinLineView extends Component {

    private awardingLoop: boolean = false;
    private awardingIndex: number = 0;
    public winLine: number[] = [];
    private lines: Sprite[] = [];
    private linesOpacity: UIOpacity[] = [];


    start() {
        this.initLines();
    }

    initLines() {
        for (let i = 0; i < this.node.children.length; i++) {
            var node = this.node.children[i];
            node.active = false;
            this.lines.push(node.getComponent(Sprite)!);
            this.linesOpacity.push(node.getComponent(UIOpacity)!);
        }
    }
    initWinLine() {
        this.winLine = [];
        this.awardingIndex = 0;
        this.awardingLoop = false;
        this.clearLines();
    }

    clearLines() {
        for (let i = 0; i < this.lines.length; i++) {
            this.linesOpacity[i].opacity = 0;
            this.lines[i].node.active = false;
        }
    }

    showLine(index: number) {
        if (index < 0 || index >= this.lines.length) return;
        this.lines[index].node.active = true;
        this.linesOpacity[index].opacity = 255;
    }

    showSingleWin() {
        this.awardingLoop = true;
        this.showLineOneByOne();
    }

    showLineOneByOne() {
        if (!this.awardingLoop) return;
        if (this.awardingIndex === this.winLine.length){
            this.awardingIndex = 0;
        }
        this.clearLines();
        this.showLine(this.winLine[this.awardingIndex]);
        const opacityComp = this.linesOpacity[this.winLine[this.awardingIndex]];
        tween(opacityComp)
            .repeat(2, tween(opacityComp)
                .to(1, { opacity: 0 }, { easing: 'quadOut' })
                .to(1, { opacity: 255 }, { easing: 'quadIn' }))
            .call(() => {
        this.awardingIndex++;
                this.showLineOneByOne();
            })
            .start();
    }

    showAllLines(resolve: () => void) {
        for (let i = 0; i < this.winLine.length; i++) {
            this.showLine(this.winLine[i]);
        }
        this.scheduleOnce(() => {
            this.showSingleWin();
            resolve();
        }, 3);
    }
}

