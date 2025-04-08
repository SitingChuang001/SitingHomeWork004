import { _decorator, Component, Graphics, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WinLineView')
export class WinLineView extends Component {
    @property(Graphics)
    graphics: Graphics = null!;
    start() {
        const g = this.graphics;

        // 設定線的樣式
        g.lineWidth = 5;
        g.strokeColor.fromHEX('#ff0000'); // 紅色線

        // 開始畫線
        g.moveTo(100, 100);  // 起點
        g.lineTo(300, 300);  // 終點

        // 畫出來
        g.stroke();
    }

    update(deltaTime: number) {
        
    }
}

