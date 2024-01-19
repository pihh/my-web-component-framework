const __config = {
  preffix: "fw-",
};

export class Framework {
  static __instance;
  __internals = {
    dataIndex: 0,
  };
  __loadedModules = {};

  constructor(options = {}) {
    if (Framework.__instance) return Framework.__instance;
    Framework.__instance = this;
    this.__config = {
      ...__config,
      ...options,
    };
    return this;
  }

  __extractVariables(str, map = {}, props, pointerKey) {
    const reg = /\${(.*?)}/g;
    const matches = [...str.matchAll(new RegExp(reg))];
    if (matches.length > 0) {
      for (let prop of props) {
        if (
          str.indexOf("this." + prop) > -1 ||
          str.toLowerCase().indexOf("this." + prop.toLowerCase()) > -1
        ) {
          for (let mp of map[prop]) {
            if (mp.pointerKey === pointerKey) continue;
          }
          map[prop].push({ pointerKey, expression: str, type: "text" });
        }
      }
    }
    return map;
  }

  __parseComponentElements($template, keys = [], map = {}, actions = {}) {
    const parseElements = ($node) => {
      const nodeName = $node.nodeName; // "#text"
      if (nodeName == "#text" && $node.data.indexOf("${") > -1) {
        this.__internals.dataIndex++;
        let $replacement;
        let $datasetKey = this.__internals.dataIndex;
        $replacement = document.createElement("span");
        $replacement.innerHTML = $node.data;
        $replacement.dataset.fw = $datasetKey;
        $node.replaceWith($replacement);
        map = this.__extractVariables($node.data, map, keys, $datasetKey);
      } else {
        try{

           const $value = $node.getAttribute("value");
           if ($value) {
            this.__internals.dataIndex++;
            let $datasetKey = this.__internals.dataIndex;
            $node.dataset.fwmodel = $datasetKey;
            $node.dataset.fwaction = $datasetKey;
            if (!actions[$datasetKey]) {
              actions[$datasetKey] = [];
            }
        
            for(let evt of ["keyup","keydown","keypress"]){
              actions[$datasetKey].push({
                event: evt,
                expression: 'console.log(${this})',
              });
            }
           }
        }catch(ex){
        }
        if ($node.children) {
          
          for (let evt of ["click", "mouseenter", "mouseleave", "dblclick", "keyup","keydown","keypress"]) {
            try {
              const $evt = $node.getAttribute(evt);
              if ($evt && !$node.dataset.fwmodel) {
                this.__internals.dataIndex++;

                let $datasetKey = this.__internals.dataIndex;
                $node.dataset.fwaction = $datasetKey;
                if (!actions[$datasetKey]) {
                  actions[$datasetKey] = [];
                }
                actions[$datasetKey].push({
                  event: evt,
                  expression: $evt,
                });
              }
            } catch (ex) {}
          }

          for (let $child of [...$node.childNodes]) {
            parseElements($child);
          }
        }
      }
    };
    parseElements($template);
    return { map, actions };
  }

  loadComponent(config = {}, props = {}) {
    if (!this.__loadedModules[config.selector]) {
      this.__loadedModules[config.selector] = new Promise(
        async (resolve, reject) => {
          try {
            // props = Object.keys(props);
            // console.log({props})
            let databindMap = {};
            let actionMap = {};

            let style = await import(config.style);
            /* @vite-ignore */
            let template = await import(config.template + "?raw");
            let $template = document.createElement("template");
            props.forEach((key) => {
              databindMap[key] = [];
            });
            $template.id = `component-template--${config.selector}`;
            $template.innerHTML = template.default;
            document.head.appendChild($template);
            $template.classList.add("fw");
            const { map, actions } = this.__parseComponentElements(
              $template.content,
              props,
              databindMap,
              actionMap
            );
            databindMap = map;
            actionMap = actions;
            resolve({
              template: template.default,
              style,
              $template,
              databindMap,
              actionMap,
            });
          } catch (ex) {
            console.log("Error loading component ", config.selector);
            console.error(ex);
            reject(ex);
          }
        }
      );
    }

    return this.__loadedModules[config.selector];
  }
}
