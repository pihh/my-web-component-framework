import { Component } from "../../../lib/component";

@Component({
  selector: "fw-data",
  template: "../src/components/data/index.html",
  style: "../src/components/data/style.css",
})
export class DataComponent extends HTMLElement {
  data = "parent data";
  constructor() {
    super();
  }

  onClickDataComponent(){
    alert('Bom click maninho')
  }
}
