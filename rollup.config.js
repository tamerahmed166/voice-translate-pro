import { defineConfig } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

export default defineConfig({
  input: 'script.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'VoiceTranslator',
    sourcemap: true
  },
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              browsers: ['> 1%', 'last 2 versions', 'not dead']
            }
          }
        ]
      ]
    }),
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    })
  ]
});
