import { merge } from 'webpack-merge';
import Config from 'webpack-chain';
import webpack from 'webpack';
import { highlight } from 'cli-highlight';
import { configs } from './configuration';
import { determineProjectFlavor } from './helpers/flavor';
import { applyExternalConfigs } from './helpers/externalConfigs';
import { error, info } from './helpers/log';
import helpers from './helpers';

export type Platform = 'android' | 'ios' | string;

export interface IWebpackEnv {
	[name: string]: any;

	appPath?: string;
	appResourcesPath?: string;

	nativescriptLibPath?: string;

	android?: boolean;
	ios?: boolean;

	production?: boolean;
	report?: boolean;
	hmr?: boolean;

	// enable verbose output
	verbose?: boolean;
	// todo: add others
}

let webpackChains = {
	base: [],
	normal: [],
	last: [],
};
let webpackMerges: any[] = [];
let explicitUseConfig = false;
let hasInitialized = false;

/**
 * @internal
 */
export let env: IWebpackEnv = {};

////// PUBLIC API
export const defaultConfigs = configs;
export const Utils = helpers;

export function init(_env: IWebpackEnv) {
	hasInitialized = true;
	if (_env) {
		env = _env;
	}
}

export function useConfig(config: keyof typeof defaultConfigs | false) {
	explicitUseConfig = true;
	if (config) {
		webpackChains.base.push(configs[config]);
	}
}

export function chainWebpack(
	chainFn: (config: Config, env: IWebpackEnv) => any,
	options?: { last?: boolean }
) {
	const type = options?.last ? 'last' : 'normal';
	webpackChains[type].push(chainFn);
}

export function mergeWebpack(
	mergeFn: (
		config: Partial<webpack.Configuration>,
		env: IWebpackEnv
	) => any | Partial<webpack.Configuration>
) {
	webpackMerges.push(mergeFn);
}

export function resolveChainableConfig(): Config {
	const config = new Config();

	if (!explicitUseConfig) {
		useConfig(determineProjectFlavor());
	}

	// apply configs from dependencies
	// todo: allow opt-out
	applyExternalConfigs();

	const applyChains = (chains) => {
		// this applies the chain configs
		chains.forEach((chainFn) => {
			return chainFn(config, env);
		});
	};

	// first we apply base configs
	applyChains(webpackChains.base);
	// then regular configs
	applyChains(webpackChains.normal);
	// finally configs that opted to be called last
	applyChains(webpackChains.last);

	if (env.verbose) {
		info('Resolved chainable config (before merges):');
		info(highlight(config.toString(), { language: 'js' }));
	}

	return config;
}

export function resolveConfig(
	chainableConfig = resolveChainableConfig()
): webpack.Configuration {
	if (!hasInitialized) {
		throw error('resolveConfig() must be called after init()');
	}

	let config = chainableConfig.toConfig();

	// this applies webpack merges
	webpackMerges.forEach((mergeFn) => {
		if (typeof mergeFn === 'function') {
			// mergeFn is a function with optional return value
			const res = mergeFn(config, env);
			if (res) config = merge(config, res);
		} else if (mergeFn) {
			// mergeFn is a literal value (object)
			config = merge(config, mergeFn);
		}
	});

	// return a config usable by webpack
	return config;
}
