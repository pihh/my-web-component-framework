import { defineConfig } from 'vite';
import { fileURLToPath } from 'url'
import babel from 'vite-plugin-babel';

const htmlImport = {
    name: "htmlImport",
    /**
     * Checks to ensure that a html file is being imported.
     * If it is then it alters the code being passed as being a string being exported by default.
     * @param {string} code The file as a string.
     * @param {string} id The absolute path. 
     * @returns {{code: string}}
     */
    transform(code, id) {
      if (/^.*\.html$/g.test(id)) {
        code = `export default \`${code}\``
      }
      return { code }
    }
  }
  
  export default defineConfig({
    // plugins: [ htmlImport ]
    plugins: [
      htmlImport,
      babel({
        babelConfig: {
          babelrc: false,
          configFile: false,
          plugins: [
              // ["@babel/plugin-proposal-decorators", { "version": "2023-05" }],
              ["@babel/plugin-proposal-decorators", { "version": "legacy" }],
              
              "@babel/plugin-transform-class-properties"
          ],
        },
      }),
    ],
    // resolve: {
    //   alias: {
    //     '@': fileURLToPath(new URL('./src', import.meta.url)),
    //   },
    // },
  });

  