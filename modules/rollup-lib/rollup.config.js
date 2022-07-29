import typescript from '@rollup/plugin-typescript';
import esbuild from 'rollup-plugin-esbuild';

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: './dist/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: './dist/index.mjs',
        format: 'es',
        sourcemap: true,
      },
    ],
    external: (id) => !/^[./]/.test(id),
    plugins: [
      esbuild(),
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: true,
        declarationDir: 'dist',
      }),
    ],
  },
];
