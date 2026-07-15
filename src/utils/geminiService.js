const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const logger = require('./logger');
const { AppError } = require('./AppError');

let genAI = null;

const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];

const getModelCandidates = () => {
  const primary = env.gemini.model;
  return [primary, ...FALLBACK_MODELS.filter((m) => m !== primary)];
};

const getClient = () => {
  if (!env.gemini.apiKey) {
    throw new AppError('GEMINI_API_KEY is not configured', 503);
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(env.gemini.apiKey);
  }
  return genAI;
};

const isModelNotFoundError = (error) =>
  error?.message?.includes('404') ||
  error?.message?.includes('not found') ||
  error?.message?.includes('not supported');

const runWithModelFallback = async (buildRequest) => {
  const client = getClient();
  const candidates = getModelCandidates();
  let lastError;

  for (const modelName of candidates) {
    try {
      return await buildRequest(client, modelName);
    } catch (error) {
      lastError = error;
      if (isModelNotFoundError(error)) {
        logger.warn(`Gemini model unavailable: ${modelName}, trying next fallback`);
        continue;
      }
      throw error;
    }
  }

  logger.error('All Gemini model fallbacks failed:', lastError);
  throw new AppError(
    'AI service unavailable. Set GEMINI_MODEL to a supported model (e.g. gemini-2.5-flash).',
    503
  );
};

const generateText = async (prompt, systemInstruction) => {
  try {
    return await runWithModelFallback(async (client, modelName) => {
      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Gemini API error:', error);
    throw new AppError('AI request failed. Please try again later.', 503);
  }
};

const extractPayslipData = async (fileInput, mimeType) => {
  const base64Data =
    Buffer.isBuffer(fileInput) || fileInput instanceof Uint8Array
      ? Buffer.from(fileInput).toString('base64')
      : await fetchFileAsBase64(fileInput);

  const text = await runWithModelFallback(async (client, modelName) => {
    const model = client.getGenerativeModel({ model: modelName });
    const { PAYSLIP_EXTRACTION_PROMPT, parseGeminiJson } = require('./payslipParser');

    const result = await model.generateContent([
      PAYSLIP_EXTRACTION_PROMPT,
      { inlineData: { mimeType, data: base64Data } },
    ]);

    return result.response.text();
  });

  const { normalizeExtractedPayslip, parseGeminiJson } = require('./payslipParser');
  return normalizeExtractedPayslip(parseGeminiJson(text));
};

const extractPayslipFromBuffer = (buffer, mimeType) => extractPayslipData(buffer, mimeType);

const fetchFileAsBase64 = async (url) => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
};

const inferMimeType = (fileType) => {
  const map = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
  };
  return map[fileType] || 'application/pdf';
};

module.exports = {
  generateText,
  extractPayslipData,
  extractPayslipFromBuffer,
  inferMimeType,
};
