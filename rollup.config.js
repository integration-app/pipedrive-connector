import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import rollupJson from '@rollup/plugin-json'
import copy from 'rollup-plugin-copy'
import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript'

export default {
  input: './src/client/index.tsx',
  output: [
    {
      file: 'dist/client/bundle.js',
      format: 'iife',
      sourcemap: true,
    },
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.build.json',
    }),
    nodeResolve({
      browser: true,
    }),
    rollupJson(),
    commonjs(),
    copy({
      targets: [{ src: 'src/client/index.html', dest: 'dist/client' }],
    }),
    replace({
      // https://github.com/rollup/rollup/issues/487
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
}
