const incomeRepository = require('../repositories/income.repository');
const expenseRepository = require('../repositories/expense.repository');
const { assertProfileOwnership } = require('../utils/profileHelper');
const { BadRequestError } = require('../utils/AppError');

const toCsv = (headers, rows) => {
  const escape = (val) => {
    const str = val == null ? '' : String(val);
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };
  return [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
};

const exportService = {
  exportIncomes: async (userId, query) => {
    const incomes = await incomeRepository.findAll(userId, {
      profileId: query.profileId,
      skip: 0,
      limit: 5000,
    });
    const csv = toCsv(
      ['title', 'amount', 'type', 'frequency', 'date', 'notes', 'profileId'],
      incomes.map((i) => [
        i.title,
        i.amount,
        i.type,
        i.frequency,
        i.date?.toISOString?.() || i.date,
        i.notes || '',
        i.profileId,
      ])
    );
    return { csv, filename: `incomes-${Date.now()}.csv` };
  },

  exportExpenses: async (userId, query) => {
    const expenses = await expenseRepository.findAll(userId, {
      profileId: query.profileId,
      skip: 0,
      limit: 5000,
    });
    const csv = toCsv(
      ['amount', 'category', 'description', 'date', 'profileId'],
      expenses.map((e) => [
        e.amount,
        e.category,
        e.description || '',
        e.date?.toISOString?.() || e.date,
        e.profileId,
      ])
    );
    return { csv, filename: `expenses-${Date.now()}.csv` };
  },

  importExpenses: async (userId, profileId, csvText) => {
    await assertProfileOwnership(userId, profileId);
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) throw new BadRequestError('CSV must include a header and at least one row');

    const header = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const amountIdx = header.findIndex((h) => h === 'amount');
    const categoryIdx = header.findIndex((h) => h === 'category');
    const dateIdx = header.findIndex((h) => h === 'date');
    const descIdx = header.findIndex((h) => h === 'description');

    if (amountIdx < 0 || categoryIdx < 0 || dateIdx < 0) {
      throw new BadRequestError('CSV must include amount, category, and date columns');
    }

    let imported = 0;
    for (const line of lines.slice(1)) {
      const cols = line.match(/("([^"]|"")*"|[^,]*)/g)?.map((c) => c.replace(/^"|"$/g, '').replace(/""/g, '"')) || [];
      const amount = parseFloat(cols[amountIdx]);
      const category = cols[categoryIdx];
      const date = new Date(cols[dateIdx]);
      if (!amount || !category || Number.isNaN(date.getTime())) continue;

      await expenseRepository.create({
        userId,
        profileId,
        amount,
        category,
        description: descIdx >= 0 ? cols[descIdx] : undefined,
        date,
        isCustomCategory: true,
      });
      imported += 1;
    }

    return { imported };
  },
};

module.exports = exportService;
