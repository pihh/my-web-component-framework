import { Framework } from "..";

export const Component = function (config = {}) {
  const defaultConfig = {
    selector: "fw-",
    styles: "",
    template: "",
  };

  config = {
    ...defaultConfig,
    ...config,
    instance: "component",
  };

  return function (component, context) {
    class Component extends component {
      __config = config;
      __files = {
        template: {
          string: "",
          parsed: "",
          loaded: false,
        },
        initialized: false,
      };
      __internals = {
        framework: undefined,
      };

      static observedAttributes = [];
      get observedAttributes() {
        return [...(this.props || [])];
      }
      constructor() {
        super();

        // Default classlist so we can listen to events
        this.classList.add("fw");
        // this.addEventListener("viewDidLoad", (e) => {
        //   console.log("viewDidLoad", 'xxx');
        // });
        // OVERRIDES
        const props = Object.getOwnPropertyNames(this).filter(
          (el) => el.indexOf("__") != 0
        );

        this.props = props; //component.observedAttributes;
        this.__setAttribute = this.setAttribute;
        this.setAttribute = function (name, value) {
          if (this.observedAttributes.includes(name)) {
            this.attributeChangedCallback(
              name,
              // this.getAttribute(name),
              this[name],
              value
            );
          } else {
            console.log("not includes");
            // do what you want
          }
          this.__setAttribute(name, value);
        };
        for (let prop of props) {
          this["_" + prop] = this[prop];
          this.__defineGetter__(prop, () => {
            return this["_" + prop];
          });
          this.__defineSetter__(prop, (value) => {
            this["_" + prop] = value;
            this.setAttribute(prop, value);
            return true;
          });
        }
        this.__internals.framework = new Framework();
        this.__lifeCycle.onViewDidLoadResolve;
        this.__lifeCycle.onViewDidLoad = new Promise((resolve) => {
          this.__lifeCycle.onViewDidLoadResolve = resolve;
        });
      }

      connectedCallback(callback) {
        this.__internals.framework
          .loadComponent(this.__config, this.props)
          .then((files) => {
            this.__files.template.string = files.template;
            this.__files.initialized = true;
            this.propCallbacks = files.databindMap;
            this.appendChild(files.$template.content.cloneNode(true));
            this.__appendSlots();
            this.__render();
            this.__bindActions(files);
            this.dispatchEvent(new CustomEvent("viewDidLoad"));
            this.__addChildEventListeners();
            this.__lifeCycle.onViewDidLoadResolve();
          });
      }

      // Life cycle hooks
      __lifeCycle = {
        onViewDidLoad: Promise,
      };
      __addChildEventListeners() {
        const children = [...this.querySelectorAll(".fw")];

        for (let $child of children) {
          $child.addEventListener("viewDidLoad", (e) => {
            // console.log("listened ", this.__config.selector, e.target);
            for (let attr of e.target.observedAttributes) {
              try {
                for (let parentAttr of this.observedAttributes) {
                  //console.log('attr',attr,parentAttr,e.target.getAttribute(attr).indexOf("this."+parentAttr)>-1)
                  if (
                    e.target.getAttribute(attr).indexOf("this." + parentAttr) >
                    -1
                  ) {
               
                      this.propCallbacks[parentAttr].push({
                        type: "reference",
                        target: e.target,
                        attribute: attr,
                        source: this,
                        sourceAttr: parentAttr,
                      });
                    this.__executePropCallback(parentAttr);
            
                  }
                }
              } catch (ex) {
                console.log(ex);
              }
            }
          });
        }
      }
      __render() {
        for (let key of Object.keys(this.propCallbacks)) {
          this[key] = this.getAttribute(key)
            ? this.getAttribute(key)
            : this[key];
          this.__executePropCallback(key);
        }
      }
      __appendSlots() {
        const template = new Map(
          Array.from(this.querySelectorAll("slot").values()).map((i) => [
            i.name,
            i,
          ])
        );
        const context = Array.from(
          this.querySelectorAll(":scope > *[slot]").values()
        ).map((i) => [i.slot, i]);
        for (const [slotName, element] of context) {
          const slot = template.get(slotName);
          if (slot) slot.parentElement.replaceChild(element, slot); // Syntax: replacedNode = parentNode.replaceChild(newChild, oldChild);
        }
      }
      __bindActions(files) {
        for (let key of Object.keys(files.actionMap)) {
          [...this.querySelectorAll(`[data-fwaction="${key}"]`)].forEach(
            ($el) => {
              for (let action of files.actionMap[key]) {
                $el.addEventListener(action.event, ($event) => {
                  eval("`" + action.expression + "`");
                });
              }
            }
          );
        }
      }

      __executePropCallback(name) {
        const callbacks = this.propCallbacks[name] || [];
        for (let callback of callbacks) {
          // console.log({ callback: callback });
          const $els = [
            ...this.querySelectorAll('[data-fw="' + callback.pointerKey + '"]'),
          ];

          for (let $el of $els) {
            if (callback.type == "text") {
              $el.innerText = eval("`" + callback.expression + "`");
              // console.log(callback, this);
            }
     
          }
          let timeout = false;
          let lastRef = false
          for(let cb of callbacks){
            if (callback.type == "reference") {
              if(lastRef != callback.target){
                lastRef = callback.target   
                  callback.target[callback.attribute] = callback.source[callback.sourceAttr]
              }else{
                timeout = setTimeout(()=>{
                  callback.target[callback.attribute] = callback.source[callback.sourceAttr]
                  lastRef = false
                },10)
              }
              clearTimeout(timeout)
  
            }
          }
        }
      }
      attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue || true) {
          this["_" + name] = newValue;
          const action = (name) => {
            this.__executePropCallback(name);
            // const callbacks = this.propCallbacks[name] || [];
            // for (let callback of callbacks) {
            //   // console.log({ callback: callback });
            //   const $els = [
            //     ...this.querySelectorAll(
            //       '[data-fw="' + callback.pointerKey + '"]'
            //     ),
            //   ];

            //   for (let $el of $els) {
            //     if (callback.type == "text") {
            //       $el.innerText = eval("`" + callback.expression + "`");
            //     }
            //   }
            // }
          };
          if (this.__files.initialized && this.propCallbacks) {
            action(name);
          } else {
            this.__lifeCycle.onViewDidLoad.then(() => {
              action(name);
            });
          }
        }
      }
      /*
      disconnectedCallback() {
        console.log("Custom element removed from page.");
      }
    
      adoptedCallback() {
        console.log("Custom element moved to new page.");
      }
    
      */
    }

    if (customElements.get(config.selector) === undefined) {
      customElements.define(config.selector, Component);
    }
    return Component;
  };
};
