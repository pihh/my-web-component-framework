import { Component } from "../../../lib/component";

@Component({
  selector: "fw-example",
  template: "../src/components/example/index.html",
  style: "../src/components/example/style.css",
})
export class ExampleComponent extends HTMLElement {
  parentKey = "key";
  size = 1000;
  open = false;
  input= "text input";

  constructor() {
    super();
  }

  onClickButton(data = "no data") {
    console.log("onClickButton", data);
    this.size++;
    this.open = !this.open;
  }
  __i = 0;

  onClickButtonWithLogic() {
    this.onUpdateParentKeyGrande();
    this.parentKey = this.parentKey + " " + this.__i;
    this.__i++;
  }
  onClickButtonWithEvent($event) {
    console.log($event);
  }
  onClickButtonWithEventPlusData($event, data = "none") {
    console.log($event, data);
  }
  onUpdateParentKeyGrande() {
    this.parentKey = "updated the key";
  }

  onInputKeyUp($event){
    this.input = $event.target.value;
  }

  onClickAlert() {
    alert("onClickAlert");
  }
  onDbClickAlert() {
    alert("onDbClickAlert");
  }
  onMouseEnterAlert() {
    alert("onMouseEnterAlert");
  }
  onMouseLeaveAlert() {
    alert("onMouseLeaveAlert");
  }
}
