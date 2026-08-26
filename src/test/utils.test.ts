import { describe, it, expect } from 'vitest';
import { cn, generateId, formatFriendlyDate, formatNumber, formatTimeAgo } from '../lib/utils';
import { calculateReadabilityScore } from '../components/ReadabilityRing';
import { addDays, subDays } from 'date-fns';

describe('Utils', () => {
  it('cn should merge class names properly', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    expect(cn('text-sm', undefined, null, false && 'hidden')).toBe('text-sm');
  });

  it('generateId should produce unique string ids', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).toBeTypeOf('string');
    expect(id1.length).toBeGreaterThan(3);
    expect(id1).not.toBe(id2);
  });

  it('formatNumber should format numbers into K, M suffixes', () => {
    expect(formatNumber(undefined)).toBe('0');
    expect(formatNumber(500)).toBe('500');
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(2400000)).toBe('2.4M');
  });

  it('formatFriendlyDate should format relative dates correctly', () => {
    expect(formatFriendlyDate(undefined)).toBe('No date');
    const now = new Date();
    expect(formatFriendlyDate(now.toISOString())).toContain('Today');
    
    const tomorrow = addDays(now, 1);
    expect(formatFriendlyDate(tomorrow.toISOString())).toContain('Tomorrow');
    
    const yesterday = subDays(now, 1);
    expect(formatFriendlyDate(yesterday.toISOString())).toContain('Yesterday');
  });

  it('formatTimeAgo should return relative distance strings', () => {
    const now = new Date();
    const res = formatTimeAgo(now.toISOString());
    expect(res).toBeDefined();
    expect(typeof res).toBe('string');
  });

  it('calculateReadabilityScore should score texts correctly', () => {
    expect(calculateReadabilityScore('')).toBe(0);
    expect(calculateReadabilityScore('   ')).toBe(0);

    const easyText = "The cat sat on the mat. The dog ran to the tree. It was a fun day.";
    const easyScore = calculateReadabilityScore(easyText);
    expect(easyScore).toBeGreaterThan(60);

    const complexText = "Utilizing sophisticated algorithmic paradigms facilitates hyper-dimensional cognitive optimization within heterogeneous infrastructures.";
    const hardScore = calculateReadabilityScore(complexText);
    expect(hardScore).toBeLessThan(60);
  });
});
