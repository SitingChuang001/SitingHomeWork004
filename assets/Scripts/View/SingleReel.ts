import { _decorator, Component, director, Node, SpriteFrame, tween, Vec3 } from 'cc';
import { SymbolView } from './Symbol';
import { eventTable } from './ReelManager';
const { ccclass, property } = _decorator;

export enum ReelState {
    STOP,
    BOUNCE,
    ROLLING,
    ROLLING_STOP,
    REBOUND
}

@ccclass('SingleReel')
export class SingleReel extends Component {
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
    public targetRollingTime = 3;

    private result: number[] = [];
    private count = 0;

    onLoad() {
        this.symbols = this.symbolNodes.map(n => n.getComponent(SymbolView)!);
    }

    initSymbols() {
        for (let i = 0; i < this.symbolNodes.length; i++) {
            const node = this.symbolNodes[i];
            this.symbols.push(node.getComponent(SymbolView)!);
        }
    }

    startSpin(result: number[]) {
        const originalPos = this.node.position.clone();
        const bounceHeight = 20;

        tween(this.node)
            .to(0.15, { position: new Vec3(originalPos.x, originalPos.y + bounceHeight, originalPos.z) }, { easing: 'quadOut' })
            .to(0.15, { position: originalPos }, { easing: 'quadIn' })
            .call(() => {
                this.result = result.slice();
                this.rollingTime = 0;
                this.state = ReelState.ROLLING;
            })
            .start();

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
                if (pos.y < -this.symbolHeight * 2 && this.count < 2) {
                    // 移出底部，重設到最上
                    if (this.result.length > 0) {
                        const symbolIndex = this.result[this.result.length - 1];
                        this.result.pop();
                        this.symbols[i].setSymbol(this.symbolSpriteFrames[symbolIndex]);
                        const maxY = Math.max(...this.symbolNodes.map(n => n.position.y));
                        node.setPosition(pos.x, maxY + this.symbolHeight, pos.z);
                    } else {
                        this.count++;//最後一顆隨機補值
                        if (this.count === 2) {
                            this.stopNotification();
                            this.count = 0;
                            this.sortSymbols();
                            return;
                        }
                        const randomIndex = Math.floor(Math.random() * this.symbolSpriteFrames.length);
                        this.symbols[i].setSymbol(this.symbolSpriteFrames[randomIndex]);
                        const maxY = Math.max(...this.symbolNodes.map(n => n.position.y));
                        node.setPosition(pos.x, maxY + this.symbolHeight, pos.z);
                    }
                }
            }
        }
    }

    sortSymbols() {
        //照 Y 軸從高到低排序
        const sortedNodes = [...this.symbolNodes].sort((a, b) => b.position.y - a.position.y);
        //設定第一個 Y 
        const startY = (this.symbolNodes.length - 1) * this.symbolHeight / 2;
        for (let i = 0; i < sortedNodes.length; i++) {
            const node = sortedNodes[i];
            node.setPosition(0, startY - i * this.symbolHeight, 0);
        }
    }

    stopNotification() {
        const originalPos = this.node.position.clone();
        const bounceHeight = 60;
        tween(this.node)
            .to(0.15, { position: new Vec3(originalPos.x, originalPos.y - bounceHeight, originalPos.z) }, { easing: 'quadOut' })
            .to(0.15, { position: originalPos }, { easing: 'quadIn' })
            .call(() => {
                director.emit(eventTable.SINGLE_REEL_REBOUND_COMPLETE, this.index);
            })  
            .start();
        
        this.setState(ReelState.STOP);
    }

    public setState(state: ReelState) {
        this.state = state;
    }
}
