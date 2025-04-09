import { _decorator, Color, Component, Graphics, instantiate, Prefab, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WinLineView')
export class WinLineView extends Component {
    @property(Prefab)
    linePrefab: Prefab = null!;

    private lineGraphicsArray: Graphics[] = [];

    // 5 組起點與終點（Vec2）
    private linePoints: { start: Vec2, end: Vec2 }[] = [
        { start: new Vec2(-256, 128), end: new Vec2(256, 128) },
        { start: new Vec2(-256, 0), end: new Vec2(256, 0) },
        { start: new Vec2(-256, -128), end: new Vec2(256, -128) },
        { start: new Vec2(-256, 256), end: new Vec2(256, -256) },
        { start: new Vec2(-256, -256), end: new Vec2(256, 256) },
    ];

    start() {
        this.initLines();
    }

    initLines() {
        for (let i = 0; i < this.linePoints.length; i++) {
            const lineNode = instantiate(this.linePrefab);
            lineNode.parent = this.node;

            const graphics = lineNode.getComponent(Graphics)!;
            this.lineGraphicsArray.push(graphics);

            graphics.clear();
        }
    }

    // 之後你可以用這個方法畫出指定第幾條線
    showLine(index: number) {
        if (index < 0 || index >= this.lineGraphicsArray.length) return;

        const g = this.lineGraphicsArray[index];
        const { start, end } = this.linePoints[index];

        g.clear();
        g.lineWidth = 5;
        g.strokeColor = Color.YELLOW;
        g.moveTo(start.x, start.y);
        g.lineTo(end.x, end.y);
        g.stroke();
    }

    // 如果你要一次全部顯示
    showAllLines() {
        for (let i = 0; i < this.lineGraphicsArray.length; i++) {
            this.showLine(i);
        }
    }
}

