﻿import { Color } from "../color";
import { Span as SpanDefinition } from "./span";
import { ViewBase } from "../ui/core/view";
import { FontStyle, FontWeight, } from "../ui/styling/font";
import { TextDecoration, EventData } from "../ui/text-base";

export class Span extends ViewBase implements SpanDefinition {
    static linkTapEvent = "linkTap";
    private _text: string;
    private _tappable: boolean = false;

    get fontFamily(): string {
        return this.style.fontFamily;
    }
    set fontFamily(value: string) {
        this.style.fontFamily = value;
    }

    get fontSize(): number {
        return this.style.fontSize;
    }
    set fontSize(value: number) {
        this.style.fontSize = value;
    }

    // Italic
    get fontStyle(): FontStyle {
        return this.style.fontStyle;
    }
    set fontStyle(value: FontStyle) {
        this.style.fontStyle = value;
    }

    // Bold
    get fontWeight(): FontWeight {
        return this.style.fontWeight;
    }
    set fontWeight(value: FontWeight) {
        this.style.fontWeight = value;
    }

    get textDecoration(): TextDecoration {
        return this.style.textDecoration;
    }
    set textDecoration(value: TextDecoration) {
        this.style.textDecoration = value;
    }

    get color(): Color {
        return this.style.color;
    }
    set color(value: Color) {
        this.style.color = value;
    }

    get backgroundColor(): Color {
        return this.style.backgroundColor;
    }
    set backgroundColor(value: Color) {
        this.style.backgroundColor = value;
    }

    get text(): string {
        return this._text;
    }
    set text(value: string) {
        if (this._text !== value) {
            this._text = value;
            this.notifyPropertyChange("text", value);
        }
    }

    get tappable(): boolean {
        return this._tappable;
    }

    addEventListener(arg: string, callback: (data: EventData) => void, thisArg?: any) {
        super.addEventListener(arg, callback, thisArg);
        this._setTappable(this.hasListeners(Span.linkTapEvent));
    }

    removeEventListener(arg: string, callback?: any, thisArg?: any) {
        super.removeEventListener(arg, callback, thisArg);
        this._setTappable(this.hasListeners(Span.linkTapEvent));
    }

    _setTextInternal(value: string): void {
        this._text = value;
    }

    private _setTappable(value: boolean): void {
        if (this._tappable !== value) {
            this._tappable = value;
            this.notifyPropertyChange("tappable", value);
        }
    }
}
