import { _decorator, Component, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SymbolView')
export class SymbolView extends Component {
    @property(Sprite)
    sprite: Sprite = null;

    @property({ type: [SpriteFrame] })
    spriteFrames: SpriteFrame[] = [];


    setSymbol(symbol: number) {
        this.sprite.spriteFrame = this.spriteFrames[symbol];
    }

}

