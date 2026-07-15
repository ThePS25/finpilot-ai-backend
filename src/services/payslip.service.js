const cloudinary = require('../config/cloudinary');
const payslipRepository = require('../repositories/payslip.repository');
const incomeRepository = require('../repositories/income.repository');
const { assertProfileOwnership } = require('../utils/profileHelper');
const { extractPayslipFromBuffer, inferMimeType } = require('../utils/geminiService');
const { normalizeExtractedPayslip } = require('../utils/payslipParser');
const { NotFoundError, BadRequestError, ConflictError } = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const logger = require('../utils/logger');

const uploadToCloudinary = (buffer, mimetype) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'finpilot/payslips', resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });

const getFileExtension = (mimetype) => {
  const map = {
    'application/pdf': 'pdf',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
  };
  return map[mimetype] || 'pdf';
};

const buildPayslipDate = (month, year) => {
  const m = month || new Date().getMonth() + 1;
  const y = year || new Date().getFullYear();
  return new Date(y, m - 1, 1);
};

const buildIncomeEntries = (userId, profileId, payslipId, data, month, year) => {
  const entries = [];
  const date = buildPayslipDate(month, year);
  const periodLabel = `${month || date.getMonth() + 1}/${year || date.getFullYear()}`;

  if (data.netSalary > 0) {
    entries.push({
      userId,
      profileId,
      title: `Net Salary - ${periodLabel}`,
      amount: data.netSalary,
      type: 'Salary',
      frequency: 'Monthly',
      date,
      notes: `Synced from payslip (${payslipId})`,
    });
  }

  if (data.bonus > 0) {
    entries.push({
      userId,
      profileId,
      title: `Bonus - ${periodLabel}`,
      amount: data.bonus,
      type: 'Salary',
      frequency: 'One-time',
      date,
      notes: `Synced from payslip (${payslipId})`,
    });
  }

  if (data.basicSalary > 0 && data.netSalary === 0) {
    entries.push({
      userId,
      profileId,
      title: `Basic Salary - ${periodLabel}`,
      amount: data.basicSalary,
      type: 'Salary',
      frequency: 'Monthly',
      date,
      notes: `Synced from payslip (${payslipId})`,
    });
  }

  return entries;
};

const payslipService = {
  upload: async (userId, profileId, file) => {
    await assertProfileOwnership(userId, profileId);
    if (!file) throw new BadRequestError('File is required');

    const uploadResult = await uploadToCloudinary(file.buffer, file.mimetype);
    const fileType = getFileExtension(file.mimetype);
    const mimeType = inferMimeType(fileType);

    let extractedData = normalizeExtractedPayslip({});
    let rawExtraction = null;
    let extractionStatus = 'failed';
    let extractionError = null;

    try {
      rawExtraction = await extractPayslipFromBuffer(file.buffer, mimeType);
      extractedData = normalizeExtractedPayslip(rawExtraction);
      extractionStatus = extractedData.netSalary > 0 || extractedData.grossSalary > 0 ? 'success' : 'failed';
      if (extractionStatus === 'failed') {
        extractionError = 'Could not detect salary amounts. Please enter manually.';
      }
    } catch (error) {
      extractionError = error.message || 'AI extraction failed';
      logger.error('Payslip extraction failed:', error);
    }

    const payslip = await payslipRepository.create({
      userId,
      profileId,
      fileUrl: uploadResult.secure_url,
      filePublicId: uploadResult.public_id,
      fileType,
      month: extractedData.month,
      year: extractedData.year,
      extractedData,
      rawExtraction,
      extractionStatus,
      extractionError,
      isVerified: false,
    });

    return payslip;
  },

  getAll: async (userId, query) => {
    const { page, limit, skip } = parsePagination(query);
    const [payslips, total] = await Promise.all([
      payslipRepository.findAll(userId, { profileId: query.profileId, skip, limit }),
      payslipRepository.count(userId, { profileId: query.profileId }),
    ]);
    return { payslips, pagination: buildPaginationMeta(total, page, limit) };
  },

  getById: async (userId, id) => {
    const payslip = await payslipRepository.findByIdAndUser(id, userId);
    if (!payslip) throw new NotFoundError('Payslip not found');
    return payslip;
  },

  confirm: async (userId, id, payload) => {
    const payslip = await payslipRepository.findByIdAndUser(id, userId);
    if (!payslip) throw new NotFoundError('Payslip not found');

    const extractedData = normalizeExtractedPayslip({
      ...payslip.extractedData?.toObject?.() || payslip.extractedData,
      ...payload.extractedData,
    });

    const month = payload.month || extractedData.month || payslip.month;
    const year = payload.year || extractedData.year || payslip.year;
    const syncToIncome = payload.syncToIncome !== false;

    if (syncToIncome && payslip.isSyncedToIncome) {
      throw new ConflictError('This payslip has already been synced to income records');
    }

    let linkedIncomeIds = payslip.linkedIncomeIds || [];

    if (syncToIncome) {
      const incomePayloads = buildIncomeEntries(
        userId,
        payslip.profileId,
        payslip._id,
        extractedData,
        month,
        year
      );

      if (incomePayloads.length === 0) {
        throw new BadRequestError('Net salary or bonus must be greater than 0 to sync income');
      }

      const createdIncomes = await Promise.all(
        incomePayloads.map((entry) => incomeRepository.create(entry))
      );
      linkedIncomeIds = createdIncomes.map((inc) => inc._id);
    }

    const updated = await payslipRepository.update(id, userId, {
      extractedData,
      month,
      year,
      isVerified: true,
      isCorrected: payload.isCorrected !== false,
      isSyncedToIncome: syncToIncome && linkedIncomeIds.length > 0,
      linkedIncomeIds,
      extractionStatus: 'success',
      extractionError: null,
    });

    return {
      payslip: updated,
      syncedIncomes: linkedIncomeIds.length,
    };
  },

  reExtract: async (userId, id) => {
    const payslip = await payslipRepository.findByIdAndUser(id, userId);
    if (!payslip) throw new NotFoundError('Payslip not found');
    if (payslip.isVerified) {
      throw new BadRequestError('Cannot re-extract a verified payslip');
    }

    const response = await fetch(payslip.fileUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    const mimeType = inferMimeType(payslip.fileType);

    try {
      const rawExtraction = await extractPayslipFromBuffer(buffer, mimeType);
      const extractedData = normalizeExtractedPayslip(rawExtraction);

      const updated = await payslipRepository.update(id, userId, {
        extractedData,
        rawExtraction,
        month: extractedData.month || payslip.month,
        year: extractedData.year || payslip.year,
        extractionStatus: 'success',
        extractionError: null,
      });

      return updated;
    } catch (error) {
      await payslipRepository.update(id, userId, {
        extractionStatus: 'failed',
        extractionError: error.message,
      });
      throw new BadRequestError(`Re-extraction failed: ${error.message}`);
    }
  },

  delete: async (userId, id) => {
    const payslip = await payslipRepository.findByIdAndUser(id, userId);
    if (!payslip) throw new NotFoundError('Payslip not found');

    try {
      await cloudinary.uploader.destroy(payslip.filePublicId);
    } catch (error) {
      logger.error('Cloudinary delete failed:', error);
    }

    await payslipRepository.delete(id, userId);
    return { message: 'Payslip deleted successfully' };
  },
};

module.exports = payslipService;
