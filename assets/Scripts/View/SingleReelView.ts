import { _decorator, Component, director, Node, SpriteFrame } from 'cc';
import { SymbolView } from './SymbolView';
import { eventTable } from './ReelView';
const { ccclass, property } = _decorator;

export enum ReelState {
    STOP,
    BOUNCE,
    ROLLING,
    ROLLING_STOP,
    REBOUND
}

@ccclass('SingleReelView')
export class SingleReelView extends Component {
    private state: ReelState = ReelState.STOP;

    @property([Node])
    symbolNodes: Node[] = [];

    @property([SpriteFrame])
    symbolSpriteFrames: SpriteFrame[] = [];

    @property
    speed: number = 1500;

    @property
    symbolHeight: number = 128;

    public index: number = 0;
    private symbols: SymbolView[] = [];

    public rollingTime = 0;
    public targetRollingTime = 4;

    private result: number[] = [];
    private count = 0;

    onLoad() {
        this.symbols = this.symbolNodes.map(n => n.getComponent(SymbolView)!);
    }

    startSpin(result: number[]) {
        this.result = result;
        this.rollingTime = 0;
        this.state = ReelState.ROLLING;
    }

    update(deltaTime: number) {
        if (this.state === ReelState.STOP) return;

        if (this.state === ReelState.ROLLING) {
            this.rollingTime += deltaTime;

            for (let i = 0; i < this.symbolNodes.length; i++) {
                const node = this.symbolNodes[i];
                const pos = node.position;
                node.setPosition(pos.x, pos.y - this.speed * deltaTime, pos.z);
            }

            for (let i = 0; i < this.symbolNodes.length; i++) {
                const node = this.symbolNodes[i];
                const pos = node.position;
                if (pos.y < -this.symbolHeight * 2) {
                    // 移出底部，重設到最上
                    const maxY = Math.max(...this.symbolNodes.map(n => n.position.y));
                    node.setPosition(pos.x, maxY + this.symbolHeight, pos.z);

                    // 替換成新的隨機圖
                    const randomIndex = Math.floor(Math.random() * this.symbolSpriteFrames.length);
                    this.symbols[i].setSymbol(this.symbolSpriteFrames[randomIndex]);
                }
            }
            
            if (this.rollingTime >= this.targetRollingTime) {
                this.setState(ReelState.REBOUND);
            }


        }

        if (this.state === ReelState.REBOUND) {

            for (let i = 0; i < this.symbolNodes.length; i++) {
                const node = this.symbolNodes[i];
                const pos = node.position;
                node.setPosition(pos.x, pos.y - this.speed * deltaTime, pos.z);
            }
            for (let i = 0; i < this.symbolNodes.length; i++) {
                const node = this.symbolNodes[i];
                const pos = node.position;
                if (pos.y < -this.symbolHeight * 2) {
                    // 移出底部，重設到最上
                    const maxY = Math.max(...this.symbolNodes.map(n => n.position.y));
                    node.setPosition(pos.x, maxY + this.symbolHeight, pos.z);

                    if (this.result.length > 0) {
                        const symbolIndex = this.result[this.result.length - 1];
                        this.result.pop();
                        this.symbols[i].setSymbol(this.symbolSpriteFrames[symbolIndex]);
                    } else {
                        this.count++;
                        const randomIndex = Math.floor(Math.random() * this.symbolSpriteFrames.length);
                        this.symbols[i].setSymbol(this.symbolSpriteFrames[randomIndex]);
                        if (this.count === 2) {
                            this.stopNotification();
                            this.count = 0;
                        }
                    }
                }
            }
        }
    }

    stopNotification() {
        director.emit(eventTable.SINGLE_REEL_REBOUND, this.index);
        this.setState(ReelState.STOP);
    }

    public setState(state: ReelState) {
        this.state = state;
    }
}
