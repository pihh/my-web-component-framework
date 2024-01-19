import { Component } from "../../../lib/component";

@Component({
    "selector": "fw-teste",
    "template": "../src/components/teste/index.html",
    "style": "../src/components/teste/style.css",
})
export class TesteComponent extends HTMLElement{
   
    constructor(){
        super(...arguments)
        // console.log(this,this.observedAttributes)
    }

    
    testeParentKey = "testePk";
    ownKey = "baseOwnKey";
    testeS = 1000
    
    onClickButton(evt){
        console.log("onClickButton");
    }
    onUpdateParentKeyGrande(){
        this.parentKey = "updatedParentKey"
    }
}