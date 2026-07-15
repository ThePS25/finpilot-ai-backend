const { parsePagination, buildPaginationMeta } = require('../../src/utils/pagination');

describe('pagination utils', () => {
  test('parsePagination defaults', () => {
    const result = parsePagination({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.skip).toBe(0);
  });

  test('parsePagination custom page/limit', () => {
    const result = parsePagination({ page: '2', limit: '10' });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(result.skip).toBe(10);
  });

  test('buildPaginationMeta', () => {
    const meta = buildPaginationMeta(45, 2, 10);
    expect(meta.total).toBe(45);
    expect(meta.totalPages).toBe(5);
    expect(meta.hasNextPage).toBe(true);
    expect(meta.hasPrevPage).toBe(true);
  });
});

describe('debt ratio scoring helpers', () => {
  const calcDebtRatio = (monthlyEmi, monthlyIncome) => {
    if (monthlyIncome > 0) return Math.min(100, Math.round((monthlyEmi / monthlyIncome) * 100));
    return monthlyEmi > 0 ? 100 : 0;
  };

  test('zero income and zero EMI', () => {
    expect(calcDebtRatio(0, 0)).toBe(0);
  });

  test('healthy EMI ratio', () => {
    expect(calcDebtRatio(10000, 100000)).toBe(10);
  });

  test('high EMI ratio capped at 100', () => {
    expect(calcDebtRatio(150000, 100000)).toBe(100);
  });
});
