// rollup.config.js
import babel from 'rollup-plugin-babel';
import localResolve from 'rollup-plugin-local-resolve';
// import * as path from 'path';

export default {

  entry       :   'es6/index.js',
  dest        :   'build/compgeo.js',
  format      :   'cjs',
  sourceMap   :   true,

  //  external dependencies that modules will reference
  external: [
    'three',
    'cdt2d',
    'clean-pslg',
    'babel-polyfill',
    'babel-core',
    'babel-core/lib/helpers/parse.js'
  ],

  plugins: [

    //  transpile, but exclude node modules
    babel({
      exclude:      [ 'node_modules/**' ],
      presets:      [ 'es2015-rollup' ],
    }),

    //  help rollup resolve local paths
    localResolve()
  ]
};