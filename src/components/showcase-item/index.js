import { Component } from "../../../lib/component";

@Component({
    "selector": "fw-showcase-item",
    "template": "../src/components/showcase-item/index.html",
    "style": "../src/components/showcase-item/style.css",
})
export class ShowcaseItemComponent extends HTMLElement{
    title = "";
    description = "";
    constructor(){
        super()
        
    }
    
   
}