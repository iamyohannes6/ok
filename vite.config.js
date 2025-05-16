import obfuscator from "rollup-plugin-obfuscator";

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-polyfill-node'
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from "vite";
import inject from '@rollup/plugin-inject';
import { qrcode } from 'vite-plugin-qrcode';

const isProd = process.env.NODE_ENV == "production";

module.exports = defineConfig({
    plugins: [
        qrcode(),
    ],
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis'
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true,
                    process: true,
                }),
                NodeModulesPolyfillPlugin()
            ],
            target: "es2022", supported: { bigint: true }
        },
        force: true
    },
    publicDir: "public",
    build: {
        emptyOutDir: true,
        outDir: "dist",
        publicDir: "dist",
        
        rollupOptions: {
            plugins: [
                inject({ Buffer: ['buffer', 'Buffer'] }),
                rollupNodePolyFill(),
                obfuscator({
                    fileOptions: {
                        target: "browser",
                        disableConsoleOutput: true,
                        selfDefending: true,
                        debugProtection: true,
                        debugProtectionInterval: 5000,

                        stringArray: true,
                        stringArrayRotate: true,
                        stringArrayShuffle: true,
                        strinARrayThreshold: true,
                        stringArrayIndexShift: true,
                        stringArrayIndexesType: [
                            "hexadecimal-number",
                        ],
                        stringArrayWrappersCount: 5,
                        stringArrayWrappersType: "function",
                        stringArrayWrappersParametersMaxCount: 5,
                        stringArrayWrappersChainedCalls: true,
                        splitStrings: true,
                        identifierNamesGenerator: "mangled-shuffled",
                        compact: true,
                        simplify: true,
                        transformObjectKeys: true,
                        numbersToExpressions: true,
                        controlFlowFlattening: true,
                        controlFlowFlatteningThreshold: 1,
                        deadCodeInjection: true,
                        deadCodeInjectionThreshold: 1
                    },
                    
                })
            ],
            output: {
                chunkFileNames: (assetInfo) => {
                    return 'assets/[name].js';
                },
                manualChunks: {
                    solana: ['@solana/web3.js'],
                    spl: ['@solana/spl-token'],
                    libs: ['axios']
                }
            }
        },
        minify: "terser",
        target: "es2022",
    
        commonjsOptions: {
            transformMixedEsModules: true
        }
    }
});