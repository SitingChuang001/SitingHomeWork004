import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { SymbolView } from './SymbolView';
const { ccclass, property } = _decorator;

export enum ReelState {
    STOP,
    BOUNCE,
    ROLLING,
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
    speed: number = 300; 

    @property
    symbolHeight: number = 150;

    private symbols: SymbolView[] = [];

    private rollingTime = 0;
    private targetRollingTime = 4; 

    private result: number[] = [];

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

        switch (this.state) {
            case ReelState.BOUNCE:

                break;
            case ReelState.ROLLING:
                this.rollingTime += deltaTime;
                if (this.rollingTime >= this.targetRollingTime) {
                    this.state = ReelState.REBOUND;
                }
                break;
            case ReelState.REBOUND:
                break;
        }

        if (this.state === ReelState.ROLLING) {
            this.rollingTime += deltaTime;

            for (let i = 0; i < this.symbolNodes.length; i++) {
                const node = this.symbolNodes[i];
                const pos = node.position;
                node.setPosition(pos.x, pos.y - this.speed * deltaTime, pos.z);

                if (pos.y < -this.symbolHeight * 2) {
                    // 移出底部，重設到最上
                    const maxY = Math.max(...this.symbolNodes.map(n => n.position.y));
                    node.setPosition(pos.x, maxY + this.symbolHeight, pos.z);

                    // 替換成新的隨機圖（或輪播圖）
                    const randomIndex = Math.floor(Math.random() * this.symbolSpriteFrames.length);
                    this.symbols[i].setSymbol(this.symbolSpriteFrames[randomIndex]);
                }
            }

        }

        if (this.state === ReelState.REBOUND) {
            // Step 1: 把所有 Symbol 排序，找出位置從高到低
            const sorted = this.symbolNodes.slice().sort((a, b) => b.position.y - a.position.y);
        
            // Step 2: 取得中間的三個 Symbol
            const centerSymbols = sorted.slice(1, 4); // 預設第 2~4 高的作為可視區域
        
            // Step 3: 將 result 指定給這 3 個
            for (let i = 0; i < centerSymbols.length; i++) {
                const node = centerSymbols[i];
                const symbol = node.getComponent(SymbolView)!;
                const symbolIndex = this.result[i];
        
                symbol.setSymbol(this.symbolSpriteFrames[symbolIndex]);
        
                // 彈跳定位（簡單 snap）
                const targetY = this.symbolHeight * (1 - i); // 150, 0, -150
                node.setPosition(node.position.x, targetY, node.position.z);
            }
        
            // 其餘符號放在上面/下面作為 buffer
            let bufferIndex = 0;
            for (let i = 0; i < sorted.length; i++) {
                const node = sorted[i];
                if (!centerSymbols.includes(node)) {
                    const posY = this.symbolHeight * (2 - bufferIndex); // 往上下擺
                    node.setPosition(node.position.x, posY, node.position.z); // 放外面一點
                    bufferIndex++;
                }
            }
        
            this.state = ReelState.STOP;
        }
        
    }

    public setState(state: ReelState) {
        this.state = state;
    }

    private snapToResult() {
        // 可以選擇用 Tween 來做彈跳動畫，這裡先直接 snap
    }
}
