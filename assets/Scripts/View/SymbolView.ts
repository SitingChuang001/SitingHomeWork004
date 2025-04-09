import { _decorator, Component, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SymbolView')
export class SymbolView extends Component {
    @property(Sprite)
    sprite: Sprite = null;


    setSymbol(symbol: SpriteFrame) {
        this.sprite.spriteFrame = symbol;
    }

}

