import { AIConfig, AIModel, getModelById, getProviderById } from "@/lib/ai-models";
import { LanguageModel } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createGroq } from "@ai-sdk/groq";

// Re-export types for backward compatibility
export type { ApiKey, AIConfig } from '@/lib/ai-models';

// Hidden/internal-only models that should not appear in the public selector
type HiddenModel = Pick<AIModel, 'id' | 'provider' | 'features' | 'availability'>;
const HIDDEN_MODELS: Record<string, HiddenModel> = {
    'openai/gpt-5-nano': {
        id: 'openai/gpt-5-nano',
        provider: 'openrouter',
        features: {
            isFree: true,
            isUnstable: false,
            maxTokens: 400000,
            supportsVision: false,
            supportsTools: true,
        },
        availability: {
            requiresApiKey: false,
            requiresPro: false,
        },
    },
};

export function initializeAIClient(config?: AIConfig, isPro?: boolean, useThinking?: boolean) {
    void useThinking;

    // Handle pro subscription with environment variables
    if (isPro && config) {
        const { model } = config;
        const modelData = getModelById(model) ?? HIDDEN_MODELS[model];
        const resolvedModelId = modelData?.id ?? model;
        const provider = modelData ? getProviderById(modelData.provider) : undefined;

        if (!modelData || !provider) {
            throw new Error(`Unknown model: ${model}`);
        }

        // Check the environment key nd check if it exists
        const envKey = process.env[provider.envKey];
        if (!envKey) {
            throw new Error(`${provider.name} API key not found (${provider.envKey})`);
        }

        // Create the appropriate SDK client based on provider
        switch (provider.id) {
            case 'anthropic':
                return createAnthropic({ apiKey: envKey })(resolvedModelId) as unknown as LanguageModel;

            case 'groq':
                const groqKey = process.env.GROQ_API_KEY;
                if (!groqKey) {
                    throw new Error('Groq API Key not found (GROQ_API_KEY)');
                }

                return createGroq({ apiKey: groqKey })(resolvedModelId) as unknown as LanguageModel;

            case 'openai':
                // Check if this is actually an OpenRouter model (contains forward slash)
                if (resolvedModelId.includes('/')) {
                    // Use OpenRouter for models with provider prefix
                    const openRouterKey = process.env.OPENROUTER_API_KEY;
                    if (!openRouterKey) {
                        throw new Error('OpenRouter API key not found (OPENROUTER_API_KEY)');
                    }
                    return createOpenRouter({
                        apiKey: openRouterKey,
                        baseURL: 'https://openrouter.ai/api/v1',
                        headers: {
                            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                            'X-Title': 'ResumeForge'
                        },
                    })(resolvedModelId) as LanguageModel;
                }
                //  Regular OpenAI Models 
                return createOpenAI({
                    apiKey: envKey,
                    // compatibility: 'strict', // not supported in newer versions
                })(resolvedModelId) as unknown as LanguageModel;

            case 'openrouter':
                return createOpenRouter({
                    apiKey: envKey,
                    baseURL: 'https://openrouter.ai/api/v1',
                    headers: {
                        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                        'X-Title': 'ResumeForge'
                    }
                })(resolvedModelId) as LanguageModel;

            default:
                throw new Error(`Unsupported provider: ${provider.id}`);
        }
    }

    // Existing logic for free users
    if (!config) {
        return createOpenAI({ apiKey: '' })('no-model') as unknown as LanguageModel;
    }

    const { model, apiKeys } = config;
    const modelData = getModelById(model) ?? HIDDEN_MODELS[model];
    const resolvedModelId = modelData?.id ?? model;
    const provider = modelData ? getProviderById(modelData.provider) : undefined;

    if (!modelData || !provider) {
        throw new Error(`Unknown model: ${model}`);
    }

    // Special case: free-tier models (e.g., GPT-5 Mini) skip user key requirement
    // Also allow GPT OSS models to use server-side OpenRouter key
    if (modelData.features.isFree || resolvedModelId.includes('/')) {
        // GROQ INITIALIZATION
        if (provider.id === 'groq') {
            const groqKey = process.env.GROQ_API_KEY;
            if (!groqKey) throw new Error('Groq API key not found (GROQ_API_KEY)');

            return createGroq({ apiKey: groqKey })(resolvedModelId) as unknown as LanguageModel;
        }

        // For OpenRouter models (with slash), use OpenRouter key
        if (resolvedModelId.includes('/')) {
            const openRouterKey = process.env.OPENROUTER_API_KEY;
            if (!openRouterKey) throw new Error('OpenRouter API key not found');

            return createOpenRouter({
                apiKey: openRouterKey,
                baseURL: 'https://openrouter.ai/api/v1',
                headers: {
                    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                    'X-Title': 'ResumeForge'
                }
            })(resolvedModelId) as LanguageModel;
        }

        // For regular free models like GPT 4.1 Nano
        const envKey = process.env[provider.envKey];
        if (!envKey) throw new Error(`${provider.name} API key not found`);

        if (provider.id === 'openai') {
            return createOpenAI({
                apiKey: envKey,
                // compatibility: 'strict',
            })(resolvedModelId) as unknown as LanguageModel;
        }
    }

    // For non-free models, user must provide their own API key
    const userApiKey = apiKeys.find(k => k.service === provider.id)?.key;
    if (!userApiKey) {
        throw new Error(`${provider.name} API key not found in user configuration`);
    }

    // Create the appropriate SDK client based on provider
    switch (provider.id) {
        case 'anthropic':
            return createAnthropic({ apiKey: userApiKey })(resolvedModelId) as unknown as LanguageModel;

        case 'groq':
            const groqKey = process.env.GROQ_API_KEY;
            if (!groqKey) {
                    throw new Error('Groq API Key not found (GROQ_API_KEY)');
                }

        return createGroq({ apiKey: groqKey })(resolvedModelId) as unknown as LanguageModel;

        case 'openai':
            // Check if this is actually an OpenRouter model (contains forward slash)
            if (resolvedModelId.includes('/')) {
                // Use OpenRouter for models with provider prefix
                const openRouterKey = apiKeys.find(k => k.service === 'openrouter')?.key;
                if (!openRouterKey) {
                    throw new Error('OpenRouter API key not found in user configuration');
                }
                return createOpenRouter({
                    apiKey: openRouterKey,
                    baseURL: 'https://openrouter.ai/api/v1',
                    headers: {
                        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                        'X-Title': 'ResumeLM'
                    }
                })(resolvedModelId) as LanguageModel;
            }
            // Regular OpenAI models
            return createOpenAI({
                apiKey: userApiKey,
                // compatibility: 'strict'
            })(resolvedModelId) as unknown as LanguageModel;

        case 'openrouter':
            return createOpenRouter({
                apiKey: userApiKey,
                baseURL: 'https://openrouter.ai/api/v1',
                headers: {
                    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                    'X-Title': 'ResumeForge'
                }
            })(resolvedModelId) as LanguageModel;

        default:
            throw new Error(`Unsupported provider: ${provider.id}`);
    }
}

